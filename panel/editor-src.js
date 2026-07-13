/**
 * Fonte do bundle CodeMirror — rode: npm run build:editor
 */
import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine, placeholder } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap, indentWithTab, undo, redo } from '@codemirror/commands';
import { search, searchKeymap, highlightSelectionMatches, openSearchPanel, closeSearchPanel } from '@codemirror/search';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';

const DRAFT_PREFIX = 'valheim-panel:draft:';

const valheimTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0f1614',
    color: '#d1d5db',
    fontSize: '12px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-content': { caretColor: '#e8c547', padding: '8px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#e8c547' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'rgba(201, 162, 39, 0.25) !important',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(42, 61, 53, 0.45)' },
  '.cm-gutters': {
    backgroundColor: '#0a0e0d',
    color: '#4b5563',
    border: 'none',
  },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(42, 61, 53, 0.45)' },
  '&.cm-focused': { outline: 'none' },
}, { dark: true });

function langForPath(path) {
  if (!path) return [];
  const lower = path.toLowerCase();
  if (lower.endsWith('.json')) return [json()];
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return [yaml()];
  return [];
}

function draftKey(path) {
  return DRAFT_PREFIX + path;
}

function loadDraft(path) {
  try {
    const raw = localStorage.getItem(draftKey(path));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(path, content) {
  try {
    localStorage.setItem(draftKey(path), JSON.stringify({ content, ts: Date.now() }));
  } catch { /* quota */ }
}

function clearDraft(path) {
  try { localStorage.removeItem(draftKey(path)); } catch { /* ignore */ }
}

class PanelEditorInstance {
  constructor(container, options) {
    this.path = options.path || '';
    this.onSave = options.onSave || (() => {});
    this.onDirtyChange = options.onDirtyChange || (() => {});
    this.readOnly = !!options.readOnly;
    this.savedContent = options.content ?? '';
    this._draftTimer = null;
    this._destroyed = false;

    const languageCompartment = new Compartment();
    const saveBinding = {
      key: 'Mod-s',
      run: () => {
        this.save();
        return true;
      },
    };

    const extensions = [
      lineNumbers(),
      drawSelection(),
      highlightActiveLine(),
      history(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      search({ top: true }),
      highlightSelectionMatches(),
      valheimTheme,
      EditorView.lineWrapping,
      languageCompartment.of(langForPath(this.path)),
      EditorState.readOnly.of(this.readOnly),
      keymap.of([saveBinding, ...searchKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this._scheduleDraft();
          this._notifyDirty();
        }
      }),
    ];

    if (options.placeholder) {
      extensions.push(placeholder(options.placeholder));
    }

    const initial = this._resolveInitialContent(options.content ?? '');
    this.state = EditorState.create({ doc: initial, extensions });
    this.view = new EditorView({ state: this.state, parent: container });
    this._languageCompartment = languageCompartment;

    if (options.minHeight) {
      container.style.minHeight = typeof options.minHeight === 'number'
        ? `${options.minHeight}px`
        : options.minHeight;
    }

    this._notifyDirty();
    this._scheduleDraft();
  }

  _resolveInitialContent(serverContent) {
    const draft = loadDraft(this.path);
    if (draft && draft.content !== serverContent) {
      return draft.content;
    }
    return serverContent;
  }

  getContent() {
    return this.view.state.doc.toString();
  }

  setContent(content, { markSaved = false, path = null } = {}) {
    if (path && path !== this.path) {
      this.path = path;
      this.view.dispatch({
        effects: this._languageCompartment.reconfigure(langForPath(path)),
      });
    }
    const cur = this.getContent();
    if (cur !== content) {
      this.view.dispatch({ changes: { from: 0, to: cur.length, insert: content } });
    }
    if (markSaved) {
      this.savedContent = content;
      clearDraft(this.path);
      this._notifyDirty();
    }
  }

  discardDraft() {
    clearDraft(this.path);
    this.setContent(this.savedContent, { markSaved: true });
  }

  restoreDraftFromStorage() {
    const draft = loadDraft(this.path);
    if (draft?.content != null) {
      this.setContent(draft.content);
    }
  }

  isDirty() {
    return this.getContent() !== this.savedContent;
  }

  undo() { undo(this.view); }
  redo() { redo(this.view); }

  openSearch(query = '') {
    openSearchPanel(this.view);
    if (query) {
      const panel = this.view.dom.querySelector('.cm-search input[name="search"]');
      if (panel) {
        panel.value = query;
        panel.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  closeSearch() {
    closeSearchPanel(this.view);
  }

  async save() {
    if (this.readOnly) return;
    const content = this.getContent();
    await this.onSave(content);
    this.savedContent = content;
    clearDraft(this.path);
    this._notifyDirty();
  }

  _notifyDirty() {
    this.onDirtyChange(this.isDirty());
  }

  _scheduleDraft() {
    if (this.readOnly || !this.path) return;
    clearTimeout(this._draftTimer);
    this._draftTimer = setTimeout(() => {
      if (this._destroyed) return;
      saveDraft(this.path, this.getContent());
    }, 2000);
  }

  destroy() {
    this._destroyed = true;
    clearTimeout(this._draftTimer);
    this.view.destroy();
  }
}

const instances = new Map();

window.PanelEditor = {
  mount(key, container, options) {
    this.destroy(key);
    const inst = new PanelEditorInstance(container, options);
    instances.set(key, inst);
    return inst;
  },
  get(key) {
    return instances.get(key);
  },
  destroy(key) {
    const inst = instances.get(key);
    if (inst) {
      inst.destroy();
      instances.delete(key);
    }
  },
  destroyAll() {
    for (const key of [...instances.keys()]) {
      this.destroy(key);
    }
  },
  loadDraft,
  clearDraft,
};

window.dispatchEvent(new Event('panel-editor-ready'));
