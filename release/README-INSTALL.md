# Vikinger Panel — Instalação

Pacote pronto para uso **sem código-fonte**. Basta Docker e Docker Compose.

## Requisitos

- Linux com **Docker** e **Docker Compose** v2
- Portas UDP **2456–2458** liberadas no firewall (jogadores externos)
- ~4 GB de RAM (Valheim + BepInEx + painel)
- Usuário com acesso ao `docker.sock` (grupo `docker`)

## Instalação rápida

### 1. Extrair o pacote

```bash
unzip vikinger-panel-*-dist.zip
cd vikinger-panel-*/
```

### 2. Configurar o `.env`

```bash
cp .env.example .env
nano .env   # ou seu editor preferido
```

| Variável | O que preencher |
|----------|-----------------|
| `HOST_PROJECT_DIR` | Caminho **absoluto** desta pasta (ex.: `/home/vinicius/vikinger-panel`) |
| `DOCKER_GID` | GID do grupo docker: `getent group docker \| cut -d: -f3` |
| `SERVER_NAME` | Nome do servidor na lista |
| `WORLD_NAME` | Nome do mundo |
| `SERVER_PASS` | Senha do servidor (vazio = aberto) |
| `PANEL_PORT` | Porta HTTP do painel (padrão `8080`) |

### 3. Subir tudo

```bash
chmod +x scripts/*.sh
./scripts/start.sh
```

O script carrega a imagem Docker incluída em `images/` e sobe os dois containers:
**valheim-server** (jogo) e **vikinger-panel** (interface web).

### 4. Acessar o painel

Abra no navegador: **http://localhost:8080** (ou a porta em `PANEL_PORT`).

Na **primeira subida**, o Valheim baixa o jogo e instala o BepInEx — pode levar vários minutos.
Acompanhe o progresso na aba **Visão Geral** do painel.

---

## Atualizar para uma versão nova

1. Baixe o ZIP da nova release em [GitHub Releases](https://github.com/viniciuspetrachin/vikinger-panel/releases)
2. Extraia **por cima** da pasta existente (ou migre `config/`, `data/` e `panel-data/`)
3. Execute:

```bash
./scripts/reload-panel.sh --load-image
```

Seus mundos, mods e configurações em `config/`, `data/` e `panel-data/` são preservados.

---

## Alternativa: baixar imagem pela internet

Se preferir não usar o arquivo `.tar` local:

```bash
# Substitua VERSION pela versão do arquivo VERSION nesta pasta
docker pull ghcr.io/viniciuspetrachin/vikinger-panel:VERSION
docker compose up -d
```

---

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `docker compose ps` | Status dos containers |
| `docker compose logs -f valheim` | Logs do servidor de jogo |
| `docker compose logs -f panel` | Logs do painel |
| `docker compose down` | Parar tudo |
| `docker compose up -d` | Subir novamente |

---

## Pastas importantes

| Pasta | Conteúdo |
|-------|----------|
| `config/` | Configuração do Valheim e BepInEx |
| `data/` | Dados do jogo (mundos, Steam, mods instalados) |
| `panel-data/` | Auditoria, backups FWL, registry de mods |

**Faça backup** de `config/`, `data/` e `panel-data/` antes de atualizações grandes.

---

## Licença

Este software é distribuído sob a [Polyform Shield 1.0.0](LICENSE).
Uso comercial requer licença separada — veja [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md).
