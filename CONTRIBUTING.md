# Contribuindo com o Vikinger Panel

Obrigado por considerar contribuir! Este projeto é aberto para a comunidade sob a
[Polyform Shield 1.0.0](LICENSE).

## Antes de começar

- Leia o [README](README.md) e a [licença comercial](COMMERCIAL-LICENSE.md) para entender
  o modelo de uso.
- Contribuições são aceitas sob os **mesmos termos** da licença do projeto.
- Issues e discussões em português ou inglês são bem-vindas.

## Como contribuir

1. **Fork** o repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Faça suas alterações com testes
4. Abra um **Pull Request** descrevendo o problema e a solução

## Desenvolvimento local

### Pré-requisitos

- Docker e Docker Compose
- Python 3.12+
- Node.js 22+ (para rebuild do frontend)

### Dev com hot-reload (recomendado)

```bash
./scripts/dev.sh
```

Sobe o painel com `uvicorn --reload` e um watcher de frontend. Editar `panel/**` reflete
no navegador com F5, sem rebuild da imagem.

### Testes (obrigatório para features de API/UI)

```bash
cd panel
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/playwright install chromium

# Unitários (rápido, sem browser)
.venv/bin/pytest tests/unit -q

# E2E (sobe painel hermético com docker falso)
.venv/bin/pytest tests/e2e -q
```

### Frontend

```bash
cd panel
npm install
npm run build   # gera app.css, app.bundle.js, editor.bundle.js
npm run watch   # modo watch (usado pelo dev.sh)
```

### Deploy de produção (Docker)

Fora do modo dev, o painel serve arquivos embarcados na imagem. Após mudanças em `panel/`,
reconstrua o container — **F5 no navegador não basta**:

```bash
./scripts/reload-panel.sh           # docker compose build panel && up -d
./scripts/reload-panel.sh --tests   # pytest unit + e2e, depois deploy
```

### Convenções

- Rotas mutantes (`POST`/`PUT`/`DELETE`) são auditadas em `panel-data/logs/audit.jsonl`
- Ações de UI usam `withBusy(key, fn)` — botões com `:disabled="isBusy('key')"`
- Novas rotas: teste unitário em `tests/unit/test_api.py`
- Novos fluxos de UI: teste E2E em `tests/e2e/test_features.py`

## CI/CD e branch protection

### Workflows (GitHub Actions)

| Workflow | Trigger | O que faz |
|----------|---------|-----------|
| `ci.yml` | PR e push em `main` | Roda `pytest tests/unit` e `pytest tests/e2e` |
| `release.yml` | Push em `main` (exceto `[skip ci]`) | Testes → bump patch → build Docker → GHCR → ZIP → tag → GitHub Release |

### Versionamento automático

- Fonte da verdade: `panel/version.py` (`__version__`)
- A cada release na `main`, o patch sobe automaticamente (`2.1.0` → `2.1.1`)
- Para mudar major ou minor, edite `__version__` manualmente no commit desejado; o patch continua automático depois
- O commit de release do bot usa `[skip ci]` para não disparar outro release em loop

### Proteção da branch `main` (configuração no GitHub)

Para garantir que nenhum código entre na `main` sem testes:

1. Vá em **Settings → Branches → Add branch protection rule**
2. Branch name pattern: `main`
3. Marque **Require status checks to pass before merging**
4. Selecione o check **`test`** (job do workflow `CI`)
5. (Recomendado) **Require a pull request before merging**

### Pacote de release para usuários finais

O workflow `release.yml` gera um ZIP sem código-fonte em [GitHub Releases](https://github.com/viniciuspetrachin/vikinger-panel/releases), com:

- Imagem Docker pré-construída (`.tar` + publicação no GHCR)
- `docker-compose.yml` sem `build:`
- Scripts `start.sh` e `reload-panel.sh`
- `README-INSTALL.md` com instruções para leigos

Templates em `release/`; montagem via `scripts/assemble-release.sh`.

## O que evitar

- Commits com segredos (`.env`, senhas, tokens)
- Mudanças que quebrem o modelo de licenciamento sem discussão prévia
- PRs grandes sem issue ou contexto — prefira mudanças focadas

## Código de conduta

Seja respeitoso. Foco em feedback construtivo e colaboração.
