// Map page: seed base map + optional ServerSideMap fog/pins, zoom/pan, reveal-all.

const EMPTY_MAP = {
  world: "",
  seed: "",
  markers: [],
  bounds: {},
  explored: { available: false, map_size: 0, cells: 0, total: 0, image_url: null },
  mod: { serversidemap: false },
};

const MAP_REVEAL_KEY = "vikinger.mapRevealAll";
const MAP_ZOOM_MIN = 0.6;
const MAP_ZOOM_MAX = 8;
const MAP_ZOOM_STEP = 1.2;

function readMapRevealPref() {
  try {
    const raw = localStorage.getItem(MAP_REVEAL_KEY);
    // Default ON so the map is useful without ServerSideMap.
    if (raw === null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export const mapPage = {
  mapWorld: "",
  mapWorldOptions: [],
  mapActiveWorld: "",
  mapData: { ...EMPTY_MAP },
  mapLoading: false,
  mapRevealAll: readMapRevealPref(),
  mapZoom: 1,
  mapPanX: 0,
  mapPanY: 0,
  mapDragging: false,
  _mapDragStartX: 0,
  _mapDragStartY: 0,
  _mapPanStartX: 0,
  _mapPanStartY: 0,

  defaultMapWorld() {
    return (
      this.status?.running_world_name ||
      this.status?.config?.world_name ||
      this.mapActiveWorld ||
      this.mapWorldOptions[0] ||
      ""
    );
  },

  async ensureMapWorlds() {
    try {
      const data = await this.api("GET", "/api/worlds");
      const list = data.worlds || [];
      this.mapWorldOptions = list.map((w) => w.name).filter(Boolean);
      this.mapActiveWorld = data.running || data.active || "";
      if (!this.mapWorldOptions.length && this.mapActiveWorld) {
        this.mapWorldOptions = [this.mapActiveWorld];
      }
    } catch {
      // Fall back to status fields only.
      const fallback = this.defaultMapWorld();
      if (fallback && !this.mapWorldOptions.includes(fallback)) {
        this.mapWorldOptions = [fallback];
      }
      this.mapActiveWorld = fallback;
    }
  },

  async loadMapPage() {
    this.mapLoading = true;
    try {
      if (!this.status?.config?.world_name && !this.status?.running_world_name) {
        try {
          await this.refreshStatus?.();
        } catch {
          /* ignore */
        }
      }
      await this.ensureMapWorlds();
      if (!this.mapWorld || !this.mapWorldOptions.includes(this.mapWorld)) {
        this.mapWorld = this.defaultMapWorld();
      }
      const world = this.mapWorld;
      if (!world) {
        this.mapData = { ...EMPTY_MAP };
        return;
      }
      this.mapData = await this.api("GET", `/api/map/${encodeURIComponent(world)}`);
      // Ensure image URL exists even on older payloads.
      if (!this.mapData?.explored?.image_url && world) {
        this.mapData.explored = {
          ...(this.mapData.explored || {}),
          image_url: `/api/map/${encodeURIComponent(world)}/fog.png`,
        };
      }
      this.mapResetView();
    } catch (e) {
      this.toast(e.message, "error");
      this.mapData = { ...EMPTY_MAP, world: this.mapWorld || "" };
    } finally {
      this.mapLoading = false;
    }
  },

  async selectMapWorld(name) {
    if (!name || name === this.mapWorld) return;
    this.mapWorld = name;
    await this.loadMapPage();
  },

  setMapRevealAll(on) {
    this.mapRevealAll = !!on;
    try {
      localStorage.setItem(MAP_REVEAL_KEY, this.mapRevealAll ? "1" : "0");
    } catch {
      /* ignore */
    }
  },

  mapMarkers() {
    return this.mapData?.markers || [];
  },

  mapFogUrl() {
    const world = this.mapWorld || this.mapData?.world;
    const base = this.mapData?.explored?.image_url
      || (world ? `/api/map/${encodeURIComponent(world)}/fog.png` : "");
    if (!base) return "";
    const cells = this.mapData?.explored?.cells ?? 0;
    const reveal = this.mapRevealAll ? "1" : "0";
    const ssm = this.mapData?.mod?.serversidemap ? "1" : "0";
    const seed = this.mapData?.seed || "";
    const sep = base.includes("?") ? "&" : "?";
    // Bust cache on every reveal/seed/fog change so Alpine + browser reload the PNG.
    return `${base}${sep}reveal=${reveal}&v=${cells}-${ssm}-${encodeURIComponent(seed)}-r${reveal}`;
  },

  mapHasImage() {
    return !!(this.mapDisplayWorld() && this.mapFogUrl());
  },

  mapHasFog() {
    return !!(this.mapData?.explored?.available && this.mapData?.mod?.serversidemap);
  },

  mapDisplayWorld() {
    return this.mapData?.world || this.mapWorld || "";
  },

  mapViewportStyle() {
    return `transform: translate(${this.mapPanX}px, ${this.mapPanY}px) scale(${this.mapZoom});`;
  },

  mapResetView() {
    this.mapZoom = 1;
    this.mapPanX = 0;
    this.mapPanY = 0;
    this.mapDragging = false;
  },

  mapZoomBy(factor, originX, originY) {
    const wrap = this.$refs?.mapCanvasWrap;
    const rect = wrap?.getBoundingClientRect?.();
    const cx = originX != null ? originX : (rect ? rect.width / 2 : 0);
    const cy = originY != null ? originY : (rect ? rect.height / 2 : 0);
    const prev = this.mapZoom;
    const next = clamp(prev * factor, MAP_ZOOM_MIN, MAP_ZOOM_MAX);
    if (next === prev) return;
    // Keep the point under the cursor/center stable while zooming.
    const worldX = (cx - this.mapPanX) / prev;
    const worldY = (cy - this.mapPanY) / prev;
    this.mapZoom = next;
    this.mapPanX = cx - worldX * next;
    this.mapPanY = cy - worldY * next;
  },

  mapZoomIn() {
    this.mapZoomBy(MAP_ZOOM_STEP);
  },

  mapZoomOut() {
    this.mapZoomBy(1 / MAP_ZOOM_STEP);
  },

  mapZoomWheel(ev) {
    if (!this.mapHasImage()) return;
    const wrap = this.$refs?.mapCanvasWrap;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const ox = ev.clientX - rect.left;
    const oy = ev.clientY - rect.top;
    const factor = ev.deltaY < 0 ? MAP_ZOOM_STEP : 1 / MAP_ZOOM_STEP;
    this.mapZoomBy(factor, ox, oy);
  },

  mapPointerDown(ev) {
    if (!this.mapHasImage()) return;
    if (ev.button != null && ev.button !== 0) return;
    this.mapDragging = true;
    this._mapDragStartX = ev.clientX;
    this._mapDragStartY = ev.clientY;
    this._mapPanStartX = this.mapPanX;
    this._mapPanStartY = this.mapPanY;
    try {
      ev.currentTarget?.setPointerCapture?.(ev.pointerId);
    } catch {
      /* ignore */
    }
  },

  mapPointerMove(ev) {
    if (!this.mapDragging) return;
    this.mapPanX = this._mapPanStartX + (ev.clientX - this._mapDragStartX);
    this.mapPanY = this._mapPanStartY + (ev.clientY - this._mapDragStartY);
  },

  mapPointerUp(ev) {
    if (!this.mapDragging) return;
    this.mapDragging = false;
    try {
      ev.currentTarget?.releasePointerCapture?.(ev.pointerId);
    } catch {
      /* ignore */
    }
  },

  markerLabel(mk) {
    return mk?.name || mk?.tag || mk?.type || "Pin";
  },

  markerStyle(mk) {
    const b = this.mapData?.bounds || {};
    const minX = b.min_x != null ? b.min_x : -10000;
    const maxX = b.max_x != null ? b.max_x : 10000;
    const minZ = b.min_z != null ? b.min_z : -10000;
    const maxZ = b.max_z != null ? b.max_z : 10000;
    const spanX = maxX - minX || 1;
    const spanZ = maxZ - minZ || 1;
    const px = ((mk.x - minX) / spanX) * 100;
    // North (higher z) at the top.
    const py = (1 - (mk.z - minZ) / spanZ) * 100;
    return `left:${Math.max(0, Math.min(100, px))}%;top:${Math.max(0, Math.min(100, py))}%`;
  },
};
