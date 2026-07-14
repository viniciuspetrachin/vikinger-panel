// Live WebSocket client (/ws/live) pushing status + metrics + players every
// ~2s. Falls back gracefully to REST polling when the socket is unavailable.

export const ws = {
  wsConn: null,
  wsConnected: false,
  wsReconnectTimer: null,

  initLive() {
    this.connectLive();
  },

  connectLive() {
    if (this.wsConn) return;
    let url;
    try {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      url = `${proto}://${window.location.host}/ws/live`;
    } catch {
      return;
    }
    let conn;
    try {
      conn = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.wsConn = conn;
    conn.onopen = () => {
      this.wsConnected = true;
    };
    conn.onmessage = (ev) => this.onLiveMessage(ev);
    conn.onclose = () => {
      this.wsConnected = false;
      this.wsConn = null;
      this.scheduleReconnect();
    };
    conn.onerror = () => {
      try {
        conn.close();
      } catch {
        /* ignore */
      }
    };
  },

  scheduleReconnect() {
    if (this.wsReconnectTimer) return;
    this.wsReconnectTimer = setTimeout(() => {
      this.wsReconnectTimer = null;
      this.connectLive();
    }, 5000);
  },

  onLiveMessage(ev) {
    let data;
    try {
      data = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (data.status && typeof data.status === "object") this.status = data.status;
    if (data.players && typeof data.players === "object") this.players = data.players;
    if (data.metrics && typeof data.metrics === "object") {
      this.metrics = data.metrics;
      this.metricsLoading = false;
      this.pushLiveMetricSample?.(data.metrics);
    }
  },

  // True when we are receiving live data and REST polling can back off.
  liveActive() {
    return this.wsConnected;
  },
};
