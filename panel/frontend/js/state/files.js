// Arquivos (avançado): árvore estilo Finder + editor CodeMirror.

const FOLDER_SVG =
  '<svg class="file-tree-svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
  '<path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.172a1.5 1.5 0 0 1 1.06.44L8.5 3.5H13A1.5 1.5 0 0 1 14.5 5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1.5 12V3.5z"/>' +
  "</svg>";

const FILE_SVG =
  '<svg class="file-tree-svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
  '<path d="M4 1.5A1.5 1.5 0 0 1 5.5 0h4.172a1.5 1.5 0 0 1 1.06.44l2.828 2.828A1.5 1.5 0 0 1 14 4.828V12.5A1.5 1.5 0 0 1 12.5 14h-8A1.5 1.5 0 0 1 3 12.5v-11zM5.5 1a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V5h-2.5A1.5 1.5 0 0 1 9.5 3.5V1H5.5z"/>' +
  "</svg>";

const CHEVRON_SVG =
  '<svg class="file-tree-chevron-svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
  '<path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z"/>' +
  "</svg>";

const CONFIG_EXTS = new Set([".cfg", ".ini", ".json", ".yaml", ".yml", ".xml", ".prefs", ".env"]);
const LIST_FILES = new Set(["adminlist.txt", "bannedlist.txt", "permittedlist.txt"]);

export const files = {
  fileScope: "config",
  fileScopes: [
    { id: "config", label: "Config" },
    { id: "data", label: "Data" },
  ],
  fileTree: [],
  fileExpandedPaths: {},
  fileSearchQuery: "",
  fileTypeFilter: "",
  fileTypeFilters: [
    { id: "", label: "All" },
    { id: "config", label: "Config" },
    { id: "dll", label: "DLLs" },
    { id: "plugin", label: "Plugins" },
    { id: "world", label: "Worlds" },
    { id: "list", label: "Lists" },
    { id: "backup", label: "Backups" },
    { id: "log", label: "Logs" },
  ],
  editPath: "",
  editContent: "",
  fileEditorDirty: false,
  fileEditorDraftPending: false,

  async _fetchFileTree() {
    try {
      const data = await this.api("GET", `/api/files/tree?scope=${this.fileScope}`);
      this.fileTree = data.tree || [];
      this.fileExpandedPaths = {};
      if (this.editPath && !this.editPath.startsWith(`${this.fileScope}/`)) {
        this.editPath = "";
        this.editContent = "";
        window.PanelEditor?.destroy("file");
      }
    } catch (e) {
      this.toast(e.message, "error");
    }
  },

  async loadFileTree() {
    return this.withBusy(`fileScope:${this.fileScope}`, async () => {
      await this._fetchFileTree();
    });
  },

  setFileTypeFilter(id) {
    this.fileTypeFilter = id;
    this.syncFileSearchExpansion();
  },

  fileSearchActive() {
    const q = (this.fileSearchQuery || "").trim();
    return !!q || !!this.fileTypeFilter;
  },

  classifyFileItem(item) {
    if (item.type !== "file") return null;
    const path = (item.path || "").toLowerCase();
    const name = (item.name || "").toLowerCase();
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
    if (ext === ".dll") return "dll";
    if (path.includes("/plugins/")) return "plugin";
    if (ext === ".fwl" || ext === ".db" || path.includes("worlds_local/")) return "world";
    if (LIST_FILES.has(name)) return "list";
    if (ext === ".zip" && path.includes("backups/")) return "backup";
    if (ext === ".log") return "log";
    if (CONFIG_EXTS.has(ext)) return "config";
    return null;
  },

  fileMatchesFilter(item) {
    if (item.type !== "file") return false;
    const q = (this.fileSearchQuery || "").trim().toLowerCase();
    const typeFilter = this.fileTypeFilter || "";
    if (typeFilter && this.classifyFileItem(item) !== typeFilter) return false;
    if (!q) return true;
    const name = (item.name || "").toLowerCase();
    const path = (item.path || "").toLowerCase();
    return name.includes(q) || path.includes(q);
  },

  filterFileTree(tree, query, typeFilter) {
    void query;
    void typeFilter;
    if (!this.fileSearchActive()) return tree;
    const out = [];
    for (const item of tree || []) {
      if (item.type === "dir") {
        const children = this.filterFileTree(item.children || [], query, typeFilter);
        if (children.length) {
          out.push({ ...item, children });
        }
      } else if (this.fileMatchesFilter(item)) {
        out.push(item);
      }
    }
    return out;
  },

  filteredFileTree() {
    return this.filterFileTree(this.fileTree, this.fileSearchQuery, this.fileTypeFilter);
  },

  _collectExpandPaths(items, acc = new Set()) {
    for (const item of items || []) {
      if (item.type === "dir") {
        acc.add(item.path);
        this._collectExpandPaths(item.children, acc);
      }
    }
    return acc;
  },

  syncFileSearchExpansion() {
    if (!this.fileSearchActive()) return;
    const paths = this._collectExpandPaths(this.filteredFileTree());
    const next = { ...this.fileExpandedPaths };
    for (const p of paths) next[p] = true;
    this.fileExpandedPaths = next;
  },

  fileSearchMatchCount() {
    let count = 0;
    const walk = (items) => {
      for (const item of items || []) {
        if (item.type === "file") count += 1;
        else if (item.type === "dir") walk(item.children);
      }
    };
    walk(this.filteredFileTree());
    return count;
  },

  flatFileMatches() {
    const matches = [];
    const walk = (items) => {
      for (const item of items || []) {
        if (item.type === "file") matches.push(item);
        else if (item.type === "dir") walk(item.children);
      }
    };
    walk(this.filteredFileTree());
    return matches;
  },

  isFileFolderExpanded(path) {
    return !!this.fileExpandedPaths[path];
  },

  toggleFileFolder(path) {
    const next = { ...this.fileExpandedPaths };
    if (next[path]) delete next[path];
    else next[path] = true;
    this.fileExpandedPaths = next;
  },

  renderTree(items, depth = 0, _expanded = null, _selected = null) {
    void _expanded;
    void _selected;
    if (!items?.length) {
      if (depth === 0 && this.fileSearchActive()) {
        return '<p class="file-tree-empty">No matches</p>';
      }
      return depth === 0 ? '<p class="file-tree-empty">Empty folder</p>' : "";
    }
    const cls = depth === 0 ? "file-tree" : "file-tree-children";
    let html = `<div class="${cls}">`;
    for (const item of items) {
      html += this.renderTreeItem(item, depth);
    }
    html += `</div>`;
    return html;
  },

  renderTreeItem(item, depth) {
    const pad = depth * 14;
    const name = this.escapeHtml(item.name);

    if (item.type === "dir") {
      const expanded = this.isFileFolderExpanded(item.path);
      const chevronCls = expanded ? "file-tree-chevron is-expanded" : "file-tree-chevron";
      let html =
        `<button type="button" class="file-tree-row file-tree-folder" data-path="${this.escapeHtml(item.path)}" style="--file-depth:${pad}px">` +
        `<span class="${chevronCls}">${CHEVRON_SVG}</span>` +
        `<span class="file-tree-icon file-tree-icon-folder">${FOLDER_SVG}</span>` +
        `<span class="file-tree-name">${name}</span>` +
        `</button>`;
      if (expanded && item.children?.length) {
        html += this.renderTree(item.children, depth + 1);
      }
      return html;
    }

    if (item.type === "broken") {
      return (
        `<div class="file-tree-row file-tree-broken" style="--file-depth:${pad}px">` +
        `<span class="file-tree-chevron file-tree-chevron-spacer"></span>` +
        `<span class="file-tree-name text-red-400">${name} (${this.escapeHtml(item.error || "inaccessible")})</span>` +
        `</div>`
      );
    }

    const selected = this.editPath === item.path ? " file-tree-row--selected" : "";
    return (
      `<button type="button" class="file-tree-row file-tree-file${selected}" data-path="${this.escapeHtml(item.path)}" style="--file-depth:${pad}px">` +
      `<span class="file-tree-chevron file-tree-chevron-spacer"></span>` +
      `<span class="file-tree-icon file-tree-icon-file">${FILE_SVG}</span>` +
      `<span class="file-tree-name">${name}</span>` +
      `<span class="file-tree-meta">${this.formatSize(item.size)}</span>` +
      `</button>`
    );
  },

  async editFile(path) {
    try {
      const data = await this.api("GET", `/api/files/read?path=${encodeURIComponent(path)}`);
      this.editPath = path;
      this.editContent = data.content;
      if (this.page !== "files") {
        this.page = "files";
      }
      await this.$nextTick();
      await this.mountFileEditor(data.content);
    } catch (e) {
      this.toast(e.message, "error");
    }
  },

  onFileTreeClick(event) {
    const folderRow = event.target.closest(".file-tree-folder");
    if (folderRow?.dataset.path) {
      this.toggleFileFolder(folderRow.dataset.path);
      return;
    }
    const fileRow = event.target.closest(".file-tree-file");
    if (fileRow?.dataset.path) {
      this.editFile(fileRow.dataset.path);
    }
  },

  async waitForPanelEditor(timeoutMs = 8000) {
    if (typeof window.PanelEditor !== "undefined") return true;
    return new Promise((resolve) => {
      const start = Date.now();
      const onReady = () => {
        cleanup();
        resolve(true);
      };
      const tick = () => {
        if (typeof window.PanelEditor !== "undefined") {
          cleanup();
          resolve(true);
          return;
        }
        if (Date.now() - start >= timeoutMs) {
          cleanup();
          resolve(false);
          return;
        }
        setTimeout(tick, 50);
      };
      const cleanup = () => window.removeEventListener("panel-editor-ready", onReady);
      window.addEventListener("panel-editor-ready", onReady);
      tick();
    });
  },

  async mountFileEditor(content) {
    const el = document.getElementById("file-editor-host");
    if (!el) return;
    const ready = await this.waitForPanelEditor();
    if (!ready) return;
    window.PanelEditor.destroy("file");
    el.innerHTML = "";
    this.fileEditorDraftPending = false;
    const draft = window.PanelEditor.loadDraft(this.editPath);
    if (draft && draft.content !== content) {
      this.fileEditorDraftPending = true;
    }
    window.PanelEditor.mount("file", el, {
      path: this.editPath,
      content,
      minHeight: "400px",
      onSave: async (text) => {
        this.editContent = text;
        await this.saveFile();
      },
      onDirtyChange: (dirty) => {
        this.fileEditorDirty = dirty;
      },
    });
  },

  fileEditorUndo() {
    window.PanelEditor?.get("file")?.undo();
  },
  fileEditorRedo() {
    window.PanelEditor?.get("file")?.redo();
  },

  restoreFileDraft() {
    window.PanelEditor?.get("file")?.restoreDraftFromStorage();
    this.fileEditorDraftPending = false;
  },

  discardFileDraft() {
    window.PanelEditor?.get("file")?.discardDraft();
    this.fileEditorDraftPending = false;
  },

  async saveFile() {
    return this.withBusy("saveFile", async () => {
      try {
        const editor = window.PanelEditor?.get("file");
        const content = editor ? editor.getContent() : this.editContent;
        await this.api("PUT", `/api/files/write?path=${encodeURIComponent(this.editPath)}`, { content });
        this.editContent = content;
        editor?.setContent(content, { markSaved: true });
        this.fileEditorDirty = false;
        this.fileEditorDraftPending = false;
        this.toast("File saved!");
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },
};
