# Contribuindo com o Valheim Panel

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

### Testes (obrigatório para features de API/UI)

```bash
cd app
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
cd app
npm install
npm run build   # gera app.css, app.bundle.js, editor.bundle.js
```

### Deploy local (Docker)

Após mudanças em `app/`, reconstrua o container — **F5 no navegador não basta**:

```bash
./scripts/reload-panel.sh           # docker compose build panel && up -d
./scripts/reload-panel.sh --tests   # pytest unit + e2e, depois deploy
```

### Convenções

- Rotas mutantes (`POST`/`PUT`/`DELETE`) são auditadas em `panel-data/logs/audit.jsonl`
- Ações de UI usam `withBusy(key, fn)` — botões com `:disabled="isBusy('key')"`
- Novas rotas: teste unitário em `tests/unit/test_api.py`
- Novos fluxos de UI: teste E2E em `tests/e2e/test_features.py`

## O que evitar

- Commits com segredos (`.env`, senhas, tokens)
- Mudanças que quebrem o modelo de licenciamento sem discussão prévia
- PRs grandes sem issue ou contexto — prefira mudanças focadas

## Código de conduta

Seja respeitoso. Foco em feedback construtivo e colaboração.
