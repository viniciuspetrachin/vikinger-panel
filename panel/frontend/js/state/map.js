// Map page: renders portal/POI markers from GET /api/map/{world} over a 2D grid.

export const mapPage = {
  mapWorld: "",
  mapData: { world: "", seed: "", markers: [], bounds: {} },
  mapLoading: false,

  async loadMapPage() {
    const world = this.status?.config?.world_name || this.status?.running_world_name || "";
    this.mapWorld = world;
    if (!world) {
      this.mapData = { world: "", seed: "", markers: [], bounds: {} };
      return;
    }
    this.mapLoading = true;
    try {
      this.mapData = await this.api("GET", `/api/map/${encodeURIComponent(world)}`);
    } catch (e) {
      this.toast(e.message, "error");
      this.mapData = { world, seed: "", markers: [], bounds: {} };
    } finally {
      this.mapLoading = false;
    }
  },

  mapMarkers() {
    return this.mapData?.markers || [];
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
