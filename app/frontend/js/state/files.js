// Arquivos (avançado): árvore + editor CodeMirror.

export const files = {
  fileScope: "config",
  fileTree: [],
  editPath: "",
  editContent: "",
  fileEditorDirty: false,
  fileEditorDraftPending: false,

  async loadFileTree() {
    return this.withBusy(`fileScope:${this.fileScope}`, async () => {
      try {
        const data = await this.api("GET", `/api/files/tree?scope=${this.fileScope}`);
        this.fileTree = data.tree || [];
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  renderTree(items, depth = 0) {
    if (!items || !items.length) return '<p class="text-gray-500 text-xs">Vazio</p>';
    let html = "";
    for (const item of items) {
      const pad = depth * 16;
      if (item.type === "dir") {
        html += `<div style="padding-left:${pad}px" class="py-0.5"><span class="text-yellow-600 text-xs">📁 ${item.name}/</span></div>`;
        html += this.renderTree(item.children, depth + 1);
      } else if (item.type === "broken") {
        html += `<div style="padding-left:${pad}px" class="py-0.5"><span class="text-red-500 text-xs">⚠ ${item.name} (${item.error || "inacessível"})</span></div>`;
      } else {
        html += `<div style="padding-left:${pad}px" class="py-0.5">
          <button data-path="${item.path}" class="file-btn btn btn-sm btn-ghost">📄 ${item.name} <span class="text-gray-600">${this.formatSize(item.size)}</span></button>
        </div>`;
      }
    }
    return html;
  },

  async editFile(path) {
    try {
      const data = await this.api("GET", `/api/files/read?path=${encodeURIComponent(path)}`);
      this.editPath = path;
      this.editContent = data.content;
      if (this.page !== "files") { this.page = "files"; }
      await this.$nextTick();
      await this.mountFileEditor(data.content);
    } catch (e) { this.toast(e.message, "error"); }
  },

  onFileClick(event) {
    const btn = event.target.closest(".file-btn");
    if (btn?.dataset.path) this.editFile(btn.dataset.path);
  },

  async waitForPanelEditor(timeoutMs = 8000) {
    if (typeof window.PanelEditor !== "undefined") return true;
    return new Promise((resolve) => {
      const start = Date.now();
      const onReady = () => { cleanup(); resolve(true); };
      const tick = () => {
        if (typeof window.PanelEditor !== "undefined") { cleanup(); resolve(true); return; }
        if (Date.now() - start >= timeoutMs) { cleanup(); resolve(false); return; }
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
      onDirtyChange: (dirty) => { this.fileEditorDirty = dirty; },
    });
  },

  fileEditorUndo() { window.PanelEditor?.get("file")?.undo(); },
  fileEditorRedo() { window.PanelEditor?.get("file")?.redo(); },

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
        this.toast("Arquivo salvo!");
      } catch (e) { this.toast(e.message, "error"); }
    });
  },
};
