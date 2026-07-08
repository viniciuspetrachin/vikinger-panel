// Ajuda: FAQ orientado a dados + busca + links de referência.

export const help = {
  faqSearch: "",
  faqOpen: {},

  faqCategories: [
    {
      id: "primeiros-passos",
      label: "Primeiros passos",
      items: [
        { q: "Como meus amigos entram no servidor?", a: "No Valheim, use <b>Juntar-se por IP</b> e informe <code>SEU_IP:2456</code> (a porta padrão é 2456). Depois digite a senha do servidor. O endereço atual aparece na aba <b>Visão Geral</b>, no bloco “Como conectar”." },
        { q: "Onde defino o nome e a senha do servidor?", a: "Na aba <b>Servidor</b>. A senha precisa ter no mínimo 5 caracteres e não pode conter o nome do servidor. Salve e reinicie para aplicar." },
        { q: "O servidor não aparece na lista pública. E agora?", a: "A lista pública do Valheim costuma demorar alguns minutos e às vezes falha. Prefira <b>Juntar-se por IP</b>. Confirme também que <code>SERVER_PUBLIC</code> está como <code>true</code> na aba Servidor." },
        { q: "Preciso liberar portas no roteador?", a: "Sim, para jogar pela internet libere as portas UDP <b>2456–2458</b> apontando para a máquina do servidor (port forwarding)." },
        { q: "Como habilito crossplay (PC + Xbox/Game Pass)?", a: "Na aba Servidor, adicione <code>-crossplay</code> no campo <b>Argumentos extra</b> e reinicie." },
      ],
    },
    {
      id: "servidor",
      label: "Servidor",
      items: [
        { q: "Qual a diferença entre Iniciar, Parar, Reiniciar, Pausar e Retomar?", a: "<b>Iniciar/Parar/Reiniciar</b> ligam/desligam o container inteiro. <b>Pausar/Retomar</b> apenas suspendem o processo do Valheim dentro do container (mais rápido, mantém o container ligado)." },
        { q: "O que são as listas de Administradores, Banidos e Permitidos?", a: "Listas de Steam IDs. <b>Admin</b> ganha comandos de moderação; <b>Banidos</b> não conseguem entrar; <b>Permitidos</b> funciona como whitelist (se preenchida, só esses IDs entram)." },
        { q: "Como descubro o Steam ID de um jogador?", a: "Peça para o jogador acessar <a href=\"https://steamid.io\" target=\"_blank\" rel=\"noopener\">steamid.io</a> e enviar o <b>steamID64</b> (número de 17 dígitos)." },
      ],
    },
    {
      id: "mundos",
      label: "Mundos",
      items: [
        { q: "Como crio um mundo novo?", a: "Na aba <b>Mundos</b>, digite um nome e clique em <b>Criar</b> (fica pendente) ou <b>Criar e Ativar</b> (troca o servidor para ele). Um mundo só é gerado de fato no primeiro boot." },
        { q: "O que são os presets (Fácil, Difícil, Hardcore...)?", a: "São os mesmos modificadores da tela de criação de mundo do Valheim, gravados no arquivo <code>.fwl</code>. Você pode usar um preset e ainda sobrescrever itens individuais (combate, recursos, raids, portais, penalidade de morte)." },
        { q: "Posso importar um mundo que já tenho?", a: "Sim. Copie os arquivos <code>NomeDoMundo.fwl</code> e <code>NomeDoMundo.db</code> para a pasta <code>config/worlds_local/</code> (aba Arquivos ou volume Docker) e ele aparecerá na lista." },
        { q: "Trocar de mundo apaga o anterior?", a: "Não. Trocar apenas muda qual mundo está ativo; o progresso dos outros continua salvo em <code>config/worlds_local/</code>." },
      ],
    },
    {
      id: "mods",
      label: "Mods e BepInEx",
      items: [
        { q: "Como instalo um mod?", a: "Na aba <b>Mods e Configs</b>, cole a URL do <a href=\"https://thunderstore.io/c/valheim/\" target=\"_blank\" rel=\"noopener\">Thunderstore</a> (página, link de download ou r2modman) e clique em Instalar, ou faça upload de um <code>.zip</code>/<code>.dll</code>." },
        { q: "Os jogadores também precisam do mod?", a: "Depende do mod. Mods de servidor (ex.: ServerSideMap) rodam só no servidor; a maioria dos mods de gameplay/UI precisa estar instalada também no cliente de cada jogador, na mesma versão." },
        { q: "O que é BepInEx?", a: "É o carregador de mods usado pelo Valheim. Cada mod costuma gerar um arquivo <code>.cfg</code> em <code>config/bepinex</code>, editável na própria aba Mods e Configs." },
        { q: "Vanilla ou com mods?", a: "Na aba <b>Servidor</b>, em <b>Atualizações do jogo</b>, escolha <b>Vanilla</b> (sem BepInEx) ou <b>Com mods</b>. Os arquivos dos mods permanecem no disco; apenas o carregador é desativado no modo vanilla." },
        { q: "Como funcionam as atualizações do jogo?", a: "O container usa o <code>valheim-updater</code> (SteamCMD). Na aba <b>Servidor</b>, você pode ativar auto-atualização, desligá-la ou clicar em <b>Verificar atualizações agora</b>. Com mods instalados, prefira atualizar manualmente após conferir compatibilidade." },
        { q: "Atualizações podem quebrar mods?", a: "Sim. Um patch do Valheim pode exigir versões novas dos mods. Faça backup, atualize o jogo e depois use <b>Buscar atualizações</b> em cada mod vinculado ao Thunderstore." },
        { q: "Como atualizo um mod?", a: "Mods instalados via Thunderstore mostram status de versão. Use <b>Buscar atualizações</b> e, se houver nova versão, <b>Atualizar mod</b>. Mods enviados por upload precisam ser <b>vinculados</b> a uma URL Thunderstore para checagem automática." },
        { q: "Ativei/desativei um mod e nada mudou.", a: "Alterações de mods exigem <b>reiniciar o servidor</b>. Use o botão Reiniciar na Visão Geral." },
      ],
    },
    {
      id: "backups",
      label: "Backups",
      items: [
        { q: "Os backups são automáticos?", a: "Sim. Na aba <b>Backups</b> você define o intervalo (cron). A retenção é de 30 dias — backups mais antigos são apagados automaticamente." },
        { q: "Como faço um backup agora?", a: "Clique em <b>Backup Agora</b> e escolha o tipo: Mundo ativo (rápido), Completo ou Somente configs." },
        { q: "Como restauro um backup?", a: "Baixe o <code>.zip</code> pela lista, extraia e coloque os arquivos do mundo em <code>config/worlds_local/</code> (com o servidor parado)." },
      ],
    },
    {
      id: "recursos",
      label: "Recursos e desempenho",
      items: [
        { q: "Quanta RAM o servidor precisa?", a: "Um servidor Valheim costuma usar de 2 a 4 GB, subindo com mais jogadores/mods. Ajuste o teto na aba <b>Servidor</b>, em <b>Capacidade do servidor</b>. Métricas em tempo real ficam na <b>Visão Geral</b>." },
        { q: "Como defino o limite de jogadores?", a: "Na aba <b>Servidor</b>, em <b>Capacidade do servidor</b>. O vanilla aceita até 10 jogadores; acima disso é preciso um mod (Valheim Plus ou MaxPlayerCount). O painel sincroniza o valor no .cfg do mod, se instalado." },
        { q: "Alterar o limite de RAM derruba os jogadores?", a: "Sim — aplicar um novo limite recria o container e desconecta quem estiver online. Faça isso em horários tranquilos." },
      ],
    },
    {
      id: "docker",
      label: "Instalação e Docker",
      items: [
        { q: "Como subo o painel + servidor?", a: "Copie <code>.env.example</code> para <code>.env</code>, ajuste os valores e rode <code>docker compose up -d</code>. O painel fica em <code>http://SEU_IP:8080</code>." },
        { q: "Tenho erro de permissão em pastas.", a: "Rodando via Docker, painel e servidor usam o mesmo usuário (UID/GID 1000) e compartilham os volumes, então não há erro de permissão. Confirme que as pastas <code>config/</code> e <code>data/</code> pertencem ao UID 1000." },
        { q: "É seguro montar o docker.sock no painel?", a: "O painel precisa do <code>docker.sock</code> para controlar o container do Valheim. Isso concede controle do Docker ao container do painel — mantenha o painel em rede privada/atrás de proxy com autenticação em produção." },
      ],
    },
    {
      id: "problemas",
      label: "Solução de problemas",
      items: [
        { q: "Onde vejo o que está acontecendo?", a: "Abra <b>Logs</b> (docker/BepInEx) na seção Ferramentas. A aba <b>Auditoria</b> mostra todas as ações feitas pelo painel. CPU e RAM em tempo real ficam na <b>Visão Geral</b>." },
        { q: "O painel está sem responder / com erro 500.", a: "Verifique os Logs e a Auditoria. Confirme que o Docker está rodando e que o container <code>valheim-server</code> existe." },
        { q: "Uma alteração não aplicou.", a: "Muitas mudanças (mods, listas, config de mundo em execução) só valem após reiniciar o servidor." },
      ],
    },
  ],

  referenceLinks: [
    { label: "Wiki oficial do Valheim", url: "https://valheim.fandom.com/wiki/Valheim_Wiki" },
    { label: "Thunderstore (mods de Valheim)", url: "https://thunderstore.io/c/valheim/" },
    { label: "BepInEx (carregador de mods)", url: "https://docs.bepinex.dev/" },
    { label: "Imagem Docker lloesche/valheim-server", url: "https://github.com/lloesche/valheim-server-docker" },
    { label: "Servidor dedicado (guia oficial)", url: "https://valheim.fandom.com/wiki/Hosting_a_Dedicated_Server" },
  ],

  faqToggle(key) {
    this.faqOpen[key] = !this.faqOpen[key];
  },

  faqFilteredCategories() {
    const term = (this.faqSearch || "").trim().toLowerCase();
    if (!term) return this.faqCategories;
    return this.faqCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) => it.q.toLowerCase().includes(term) || it.a.toLowerCase().includes(term),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  },
};
