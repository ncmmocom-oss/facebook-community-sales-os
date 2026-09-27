(() => {
  const STATE = {
    primary: false,
    connected: false,
    clientId: '',
    reconnectCount: 0,
    consecutiveFailures: 0,
    nextDelayMs: 0,
    lastConnectedAt: 0,
    lastReconnectAt: 0,
    connectPendingUntil: 0,
    lastError: '',
    lastAction: '',
    timer: null,
    reconnectTimer: null,
    observer: null,
    settings: null
  };

  const DEFAULTS = {
    autoReconnect: true,
    autoDismissWebSocketError: true,
    checkIntervalMs: 5000,
    reconnectBaseMs: 2000,
    reconnectMaxMs: 30000
  };

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function visible(el) {
    if (!el) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function allClickable() {
    return [...document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"],a')].filter(visible);
  }

  function exactButton(label) {
    const target = normalizeText(label).toLowerCase();
    return allClickable().find(el => {
      const text = normalizeText(el.innerText || el.value || el.getAttribute('aria-label')).toLowerCase();
      return text === target;
    }) || null;
  }

  function pageText() {
    return normalizeText(document.body && document.body.innerText);
  }

  function detectClientId(text) {
    const m = String(text || '').match(/Client\s*ID\s*:\s*([^\s]+)/i);
    return m ? m[1] : '';
  }

  function detectStatus() {
    const text = pageText();
    const disconnect = exactButton('Disconnect');
    const connect = exactButton('Connect');
    const ready = /Ready to receive API calls/i.test(text);
    const connectedWord = /Status:\s*Connected/i.test(text);
    const wsError = /WebSocket error/i.test(text) || /Can not connect to:\s*wss:\/\/api\.fbaio\.org\/?/i.test(text);
    return {
      text,
      connected: !!disconnect || ready || connectedWord,
      connectButton: connect,
      disconnectButton: disconnect,
      wsError,
      clientId: detectClientId(text)
    };
  }

  function dismissWebSocketError(status) {
    if (!STATE.settings.autoDismissWebSocketError || !status.wsError) return false;
    const ok = exactButton('OK');
    if (!ok) return false;
    try {
      ok.click();
      STATE.lastAction = 'Dismissed WebSocket error';
      return true;
    } catch (_) {
      return false;
    }
  }

  function currentBackoff() {
    const base = Math.max(1000, Number(STATE.settings.reconnectBaseMs || 2000));
    const max = Math.max(base, Number(STATE.settings.reconnectMaxMs || 30000));
    const exp = Math.max(0, STATE.consecutiveFailures - 1);
    return Math.min(max, base * Math.pow(2, exp));
  }

  function clearReconnectTimer() {
    if (STATE.reconnectTimer) clearTimeout(STATE.reconnectTimer);
    STATE.reconnectTimer = null;
    STATE.nextDelayMs = 0;
  }

  async function heartbeat(extra) {
    if (!STATE.primary) return;
    const payload = Object.assign({
      status: STATE.connected ? 'ONLINE' : 'OFFLINE',
      connected: STATE.connected,
      clientIdMasked: STATE.clientId ? STATE.clientId.slice(0, 8) + '…' + STATE.clientId.slice(-4) : '',
      reconnectCount: STATE.reconnectCount,
      consecutiveFailures: STATE.consecutiveFailures,
      lastConnectedAt: STATE.lastConnectedAt,
      lastReconnectAt: STATE.lastReconnectAt,
      nextDelayMs: STATE.nextDelayMs,
      lastError: STATE.lastError,
      lastAction: STATE.lastAction,
      url: location.href
    }, extra || {});

    try {
      await chrome.runtime.sendMessage({type:'KEEPER_HEARTBEAT', state:payload});
    } catch (_) {}
  }

  function scheduleReconnect(reason) {
    if (!STATE.primary || !STATE.settings.autoReconnect || STATE.connected) return;
    if (STATE.reconnectTimer) return;

    const delay = currentBackoff();
    STATE.nextDelayMs = delay;
    STATE.lastError = reason || STATE.lastError || 'Disconnected';
    heartbeat();

    STATE.reconnectTimer = setTimeout(() => {
      STATE.reconnectTimer = null;
      STATE.nextDelayMs = 0;
      reconnectNow('scheduled:' + (reason || 'offline'));
    }, delay);
  }

  function reconnectNow(source) {
    if (!STATE.primary) return {ok:false,reason:'NOT_PRIMARY'};
    const st = detectStatus();
    STATE.clientId = st.clientId || STATE.clientId;

    if (st.connected) {
      onConnected(st, 'already-connected');
      return {ok:true,connected:true};
    }

    dismissWebSocketError(st);
    const connect = exactButton('Connect') || st.connectButton;
    if (!connect) {
      STATE.consecutiveFailures++;
      STATE.lastError = 'Không tìm thấy nút Connect';
      STATE.lastAction = source || 'reconnect';
      scheduleReconnect('connect-button-missing');
      heartbeat();
      return {ok:false,reason:'CONNECT_BUTTON_MISSING'};
    }

    try {
      connect.click();
      STATE.reconnectCount++;
      STATE.lastReconnectAt = Date.now();
      STATE.connectPendingUntil = Date.now() + 7000;
      STATE.lastAction = source || 'connect-click';
      setTimeout(checkHealth, 1200);
      return {ok:true,clicked:true};
    } catch (e) {
      STATE.consecutiveFailures++;
      STATE.lastError = String(e && e.message || e);
      scheduleReconnect('connect-click-error');
      heartbeat();
      return {ok:false,reason:'CONNECT_CLICK_ERROR'};
    }
  }

  function onConnected(st, source) {
    const wasConnected = STATE.connected;
    STATE.connected = true;
    STATE.clientId = st.clientId || STATE.clientId;
    STATE.consecutiveFailures = 0;
    STATE.lastError = '';
    STATE.connectPendingUntil = 0;
    STATE.lastAction = source || STATE.lastAction;
    if (!wasConnected || !STATE.lastConnectedAt) STATE.lastConnectedAt = Date.now();
    clearReconnectTimer();
    heartbeat();
  }

  function onDisconnected(st, reason) {
    STATE.connected = false;
    STATE.clientId = st.clientId || STATE.clientId;
    if (STATE.connectPendingUntil && Date.now() < STATE.connectPendingUntil) {
      STATE.lastAction = 'Waiting for WebSocket handshake';
      heartbeat({status:'CONNECTING'});
      return;
    }
    STATE.connectPendingUntil = 0;
    STATE.consecutiveFailures = Math.max(1, STATE.consecutiveFailures + 1);
    if (st.wsError) STATE.lastError = 'WebSocket error';
    else STATE.lastError = reason || 'Disconnected';
    dismissWebSocketError(st);
    scheduleReconnect(STATE.lastError);
    heartbeat();
  }

  function checkHealth() {
    if (!STATE.primary) return;
    const st = detectStatus();
    STATE.clientId = st.clientId || STATE.clientId;

    if (st.connected) onConnected(st, 'health-check');
    else onDisconnected(st, st.wsError ? 'WebSocket error' : 'Not connected');
  }

  function startLoop() {
    if (STATE.timer) clearInterval(STATE.timer);
    const interval = Math.max(2000, Number(STATE.settings.checkIntervalMs || 5000));
    STATE.timer = setInterval(checkHealth, interval);
    checkHealth();
  }

  async function register() {
    try {
      const res = await chrome.runtime.sendMessage({type:'KEEPER_REGISTER'});
      STATE.primary = !!(res && res.primary);
      STATE.settings = Object.assign({}, DEFAULTS, res && res.settings || {});
      if (STATE.primary) startLoop();
      else {
        if (STATE.timer) clearInterval(STATE.timer);
        STATE.timer = null;
        clearReconnectTimer();
      }
    } catch (_) {
      STATE.settings = Object.assign({}, DEFAULTS);
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || !msg.type) return;

    if (msg.type === 'KEEPER_PRIMARY_CHANGED') {
      STATE.primary = !!msg.primary;
      if (STATE.primary) startLoop();
      else {
        if (STATE.timer) clearInterval(STATE.timer);
        STATE.timer = null;
        clearReconnectTimer();
      }
      sendResponse({ok:true,primary:STATE.primary});
      return;
    }

    if (msg.type === 'KEEPER_SETTINGS_CHANGED') {
      STATE.settings = Object.assign({}, DEFAULTS, msg.settings || {});
      if (STATE.primary) startLoop();
      sendResponse({ok:true});
      return;
    }

    if (msg.type === 'KEEPER_RECONNECT_NOW') {
      sendResponse(reconnectNow('manual-popup'));
      return;
    }
  });

  STATE.observer = new MutationObserver(() => {
    if (!STATE.primary) return;
    const st = detectStatus();
    if (st.connected && !STATE.connected) onConnected(st, 'dom-observer');
    if (st.wsError) {
      dismissWebSocketError(st);
      if (!st.connected) scheduleReconnect('WebSocket error');
    }
  });

  function bootObserver() {
    if (!document.documentElement) return setTimeout(bootObserver, 100);
    STATE.observer.observe(document.documentElement, {
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','style','disabled']
    });
  }

  bootObserver();
  register();
})();
