(() => {
  if (globalThis.__SOCIAL_AIO_WORKER_KEEPER__) return;
  globalThis.__SOCIAL_AIO_WORKER_KEEPER__ = '1.2.0';

  const STATE = {
    primary:false,
    connected:false,
    clientId:'',
    clientIdFingerprint:'',
    reconnectCount:0,
    consecutiveFailures:0,
    nextDelayMs:0,
    lastConnectedAt:0,
    onlineSince:0,
    lastReconnectAt:0,
    connectPendingUntil:0,
    lastError:'',
    lastErrorCode:'',
    lastAction:'',
    guardBlocked:false,
    timer:null,
    reconnectTimer:null,
    observer:null,
    settings:null,
    lastEventKey:'',
    lastEventAt:0,
    checkQueued:false
  };

  const DEFAULTS = {
    autoReconnect:true,
    autoDismissWebSocketError:true,
    autoRestoreTab:true,
    checkIntervalMs:5000,
    reconnectBaseMs:2000,
    reconnectMaxMs:30000
  };

  const ERROR_RULES = [
    {
      code:'E_WS_ERROR',
      severity:'ERROR',
      test:text => /WebSocket error/i.test(text) || /Can not connect to:\s*wss:\/\/api\.fbaio\.org\/?/i.test(text),
      action:'Dismiss modal + reconnect with backoff.'
    },
    {
      code:'E_CLIENT_NOT_CONNECTED',
      severity:'ERROR',
      test:text => /Client\s+not\s+connected/i.test(text),
      action:'Reconnect W1.'
    },
    {
      code:'E_AUTH_EXPIRED',
      severity:'ERROR',
      test:text => /(session|login|authentication|authorization).{0,30}(expired|required|invalid)|please\s+log\s*in/i.test(text),
      action:'Operator login required. Auto reconnect blocked.'
    },
    {
      code:'E_SITE_UPDATE',
      severity:'WARN',
      test:text => /New update available|Reload to apply the update/i.test(text),
      action:'Site update detected. Do not auto reload during active scans.'
    }
  ];

  function now(){ return Date.now(); }
  function normalizeText(value){ return String(value || '').replace(/\s+/g,' ').trim(); }

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

  function pageText(){ return normalizeText(document.body && document.body.innerText); }

  function detectClientId(text) {
    const m = String(text || '').match(/Client\s*ID\s*:\s*([^\s]+)/i);
    return m ? m[1] : '';
  }

  function maskClientId(id) {
    const value = String(id || '');
    if (!value) return '';
    if (value.length <= 14) return value.slice(0,4)+'…'+value.slice(-4);
    return value.slice(0,8)+'…'+value.slice(-4);
  }

  function fingerprintClientId(value) {
    const text = String(value || '');
    if (!text) return '';
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    for (let i=0;i<text.length;i++) {
      const c = text.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1,0x01000193) >>> 0;
      h2 ^= (c + i);
      h2 = Math.imul(h2,0x85ebca6b) >>> 0;
    }
    return text.length.toString(16)+':'+h1.toString(16)+':'+h2.toString(16);
  }

  function scanErrorRules(text) {
    const found = [];
    for (const rule of ERROR_RULES) {
      try {
        if (rule.test(text)) found.push({
          code:rule.code,
          severity:rule.severity,
          action:rule.action
        });
      } catch (_) {}
    }
    return found;
  }

  function detectStatus() {
    const text = pageText();
    const disconnect = exactButton('Disconnect');
    const connect = exactButton('Connect');
    const ready = /Ready to receive API calls/i.test(text);
    const connectedWord = /Status:\s*Connected/i.test(text);
    const clientId = detectClientId(text);
    const errors = scanErrorRules(text);

    return {
      text,
      connected:!!disconnect || ready || connectedWord,
      connectButton:connect,
      disconnectButton:disconnect,
      clientId,
      clientIdMasked:maskClientId(clientId),
      clientIdFingerprint:fingerprintClientId(clientId),
      errors
    };
  }

  async function emitEvent(code,severity,message,action,extra) {
    const key = [code,message].join('|');
    const t = now();
    if (STATE.lastEventKey === key && t - STATE.lastEventAt < 10000) return;
    STATE.lastEventKey = key;
    STATE.lastEventAt = t;

    try {
      await chrome.runtime.sendMessage({
        type:'KEEPER_EVENT',
        code,severity,message,action,extra:extra || {}
      });
    } catch (_) {}
  }

  function dismissWebSocketError(status) {
    if (!STATE.settings.autoDismissWebSocketError) return false;
    if (!status.errors.some(e => e.code === 'E_WS_ERROR')) return false;
    const ok = exactButton('OK');
    if (!ok) return false;
    try {
      ok.click();
      STATE.lastAction = 'Dismissed WebSocket error';
      emitEvent(
        'WS_MODAL_DISMISSED','INFO',
        'Đã đóng popup WebSocket error.',
        'Reconnect may proceed.'
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  function currentBackoff() {
    const base = Math.max(1000,Number(STATE.settings.reconnectBaseMs || 2000));
    const max = Math.max(base,Number(STATE.settings.reconnectMaxMs || 30000));
    const exp = Math.max(0,STATE.consecutiveFailures - 1);
    return Math.min(max,base * Math.pow(2,exp));
  }

  function clearReconnectTimer() {
    if (STATE.reconnectTimer) clearTimeout(STATE.reconnectTimer);
    STATE.reconnectTimer = null;
    STATE.nextDelayMs = 0;
  }

  async function heartbeat(extra) {
    if (!STATE.primary) return null;
    const payload = Object.assign({
      status:STATE.guardBlocked ? 'ERROR' : (STATE.connected ? 'ONLINE' : 'OFFLINE'),
      connected:STATE.connected,
      clientIdMasked:maskClientId(STATE.clientId),
      clientIdFingerprint:STATE.clientIdFingerprint,
      reconnectCount:STATE.reconnectCount,
      consecutiveFailures:STATE.consecutiveFailures,
      lastConnectedAt:STATE.lastConnectedAt,
      onlineSince:STATE.onlineSince,
      lastReconnectAt:STATE.lastReconnectAt,
      nextDelayMs:STATE.nextDelayMs,
      lastError:STATE.lastError,
      lastErrorCode:STATE.lastErrorCode,
      lastAction:STATE.lastAction,
      url:location.href
    },extra || {});

    try {
      const response = await chrome.runtime.sendMessage({
        type:'KEEPER_HEARTBEAT',
        state:payload
      });
      if (response && response.guardBlocked) {
        STATE.guardBlocked = true;
        STATE.lastErrorCode = 'E_CLIENT_ID_CHANGED';
        STATE.lastError = 'Client ID khác baseline';
        clearReconnectTimer();
      } else if (response && response.clientGuard === 'OK') {
        STATE.guardBlocked = false;
      }
      return response;
    } catch (_) {
      return null;
    }
  }

  function scheduleReconnect(reason) {
    if (!STATE.primary || !STATE.settings.autoReconnect || STATE.connected || STATE.guardBlocked) return;
    if (STATE.reconnectTimer) return;

    const delay = currentBackoff();
    STATE.nextDelayMs = delay;
    STATE.lastError = reason || STATE.lastError || 'Disconnected';
    heartbeat();

    STATE.reconnectTimer = setTimeout(() => {
      STATE.reconnectTimer = null;
      STATE.nextDelayMs = 0;
      reconnectNow('scheduled:'+(reason || 'offline'));
    },delay);
  }

  function reconnectNow(source) {
    if (!STATE.primary) return {ok:false,reason:'NOT_PRIMARY'};
    if (STATE.guardBlocked) return {ok:false,reason:'CLIENT_GUARD_BLOCKED'};

    const st = detectStatus();
    STATE.clientId = st.clientId || STATE.clientId;
    STATE.clientIdFingerprint = st.clientIdFingerprint || STATE.clientIdFingerprint;

    if (st.connected) {
      onConnected(st,'already-connected');
      return {ok:true,connected:true};
    }

    if (st.errors.some(e => e.code === 'E_AUTH_EXPIRED')) {
      STATE.lastErrorCode = 'E_AUTH_EXPIRED';
      STATE.lastError = 'Authentication/session expired';
      emitEvent(
        'E_AUTH_EXPIRED','ERROR',
        'Social AIO yêu cầu đăng nhập/xác thực lại.',
        'Đăng nhập thủ công; Keeper không tự click login.'
      );
      heartbeat();
      return {ok:false,reason:'AUTH_EXPIRED'};
    }

    dismissWebSocketError(st);
    const connect = exactButton('Connect') || st.connectButton;

    if (!connect) {
      STATE.consecutiveFailures++;
      STATE.lastErrorCode = 'E_CONNECT_MISSING';
      STATE.lastError = 'Không tìm thấy nút Connect';
      STATE.lastAction = source || 'reconnect';
      emitEvent(
        'E_CONNECT_MISSING','ERROR',
        'Worker đang offline nhưng không tìm thấy nút Connect.',
        'Kiểm tra UI Social AIO/site update.'
      );
      scheduleReconnect('connect-button-missing');
      heartbeat();
      return {ok:false,reason:'CONNECT_BUTTON_MISSING'};
    }

    try {
      connect.click();
      STATE.reconnectCount++;
      STATE.lastReconnectAt = now();
      STATE.connectPendingUntil = now()+7000;
      STATE.lastAction = source || 'connect-click';
      chrome.runtime.sendMessage({
        type:'KEEPER_RECONNECT_ATTEMPT',
        count:STATE.reconnectCount,
        source:STATE.lastAction
      }).catch(()=>{});
      setTimeout(checkHealth,1200);
      return {ok:true,clicked:true};
    } catch (e) {
      STATE.consecutiveFailures++;
      STATE.lastErrorCode = 'E_CONNECT_CLICK';
      STATE.lastError = String(e && e.message || e);
      scheduleReconnect('connect-click-error');
      heartbeat();
      return {ok:false,reason:'CONNECT_CLICK_ERROR'};
    }
  }

  async function onConnected(st,source) {
    const wasConnected = STATE.connected;
    STATE.connected = true;
    STATE.clientId = st.clientId || STATE.clientId;
    STATE.clientIdFingerprint = st.clientIdFingerprint || STATE.clientIdFingerprint;
    STATE.consecutiveFailures = 0;
    STATE.lastError = '';
    STATE.lastErrorCode = '';
    STATE.connectPendingUntil = 0;
    STATE.lastAction = source || STATE.lastAction;
    if (!wasConnected) {
      STATE.lastConnectedAt = now();
      STATE.onlineSince = now();
      emitEvent(
        'W1_ONLINE','INFO',
        'W1 ONLINE.',
        'Heartbeat healthy.',
        {clientIdMasked:st.clientIdMasked || ''}
      );
    } else if (!STATE.onlineSince) {
      STATE.onlineSince = now();
    }
    clearReconnectTimer();
    await heartbeat();
  }

  async function handleDetectedErrors(st) {
    for (const err of st.errors) {
      if (err.code === 'E_WS_ERROR') {
        STATE.lastErrorCode = err.code;
        STATE.lastError = 'WebSocket error';
        dismissWebSocketError(st);
        await emitEvent(
          err.code,err.severity,
          'Phát hiện WebSocket error trên W1.',
          err.action
        );
      } else if (err.code === 'E_CLIENT_NOT_CONNECTED') {
        STATE.lastErrorCode = err.code;
        STATE.lastError = 'Client not connected';
        await emitEvent(
          err.code,err.severity,
          'Social AIO báo Client not connected.',
          err.action
        );
      } else if (err.code === 'E_AUTH_EXPIRED') {
        STATE.lastErrorCode = err.code;
        STATE.lastError = 'Authentication/session expired';
        await emitEvent(
          err.code,err.severity,
          'Session/login có dấu hiệu hết hạn.',
          err.action
        );
      } else if (err.code === 'E_SITE_UPDATE') {
        await emitEvent(
          err.code,err.severity,
          'Social AIO có update mới.',
          err.action
        );
      }
    }
  }

  async function onDisconnected(st,reason) {
    STATE.connected = false;
    if (STATE.onlineSince) STATE.onlineSince = 0;
    STATE.clientId = st.clientId || STATE.clientId;
    STATE.clientIdFingerprint = st.clientIdFingerprint || STATE.clientIdFingerprint;

    await handleDetectedErrors(st);

    if (STATE.connectPendingUntil && now() < STATE.connectPendingUntil) {
      STATE.lastAction = 'Waiting for WebSocket handshake';
      await heartbeat({status:'CONNECTING'});
      return;
    }

    STATE.connectPendingUntil = 0;
    STATE.consecutiveFailures = Math.max(1,STATE.consecutiveFailures+1);
    if (!STATE.lastError) STATE.lastError = reason || 'Disconnected';
    if (!STATE.lastErrorCode) STATE.lastErrorCode = 'E_OFFLINE';

    if (!STATE.guardBlocked) scheduleReconnect(STATE.lastError);
    await heartbeat();
  }

  async function checkHealth() {
    if (!STATE.primary || STATE.checkQueued) return;
    STATE.checkQueued = true;
    try {
      const st = detectStatus();
      STATE.clientId = st.clientId || STATE.clientId;
      STATE.clientIdFingerprint = st.clientIdFingerprint || STATE.clientIdFingerprint;

      await handleDetectedErrors(st);
      if (st.connected) await onConnected(st,'health-check');
      else await onDisconnected(st,st.errors.length ? st.errors[0].code : 'Not connected');
    } finally {
      STATE.checkQueued = false;
    }
  }

  function startLoop() {
    if (STATE.timer) clearInterval(STATE.timer);
    const interval = Math.max(2000,Number(STATE.settings.checkIntervalMs || 5000));
    STATE.timer = setInterval(checkHealth,interval);
    checkHealth();
  }

  async function register() {
    try {
      const res = await chrome.runtime.sendMessage({type:'KEEPER_REGISTER'});
      STATE.primary = !!(res && res.primary);
      STATE.settings = Object.assign({},DEFAULTS,res && res.settings || {});
      if (STATE.primary) startLoop();
      else {
        if (STATE.timer) clearInterval(STATE.timer);
        STATE.timer = null;
        clearReconnectTimer();
      }
    } catch (_) {
      STATE.settings = Object.assign({},DEFAULTS);
    }
  }

  function selfTest() {
    const st = detectStatus();
    const checks = [
      {name:'Primary',pass:STATE.primary,detail:STATE.primary ? 'Đúng W1 bound tab' : 'Tab này không phải W1'},
      {name:'URL',pass:/fbaio\.org/i.test(location.hostname) && isFinite(location.href.length),detail:location.href},
      {name:'Connected',pass:st.connected,detail:st.connected ? 'Connected' : 'Offline'},
      {name:'Client ID',pass:!!st.clientId,detail:st.clientIdMasked || 'Không đọc được'},
      {name:'Page errors',pass:!st.errors.some(e=>e.severity==='ERROR'),detail:st.errors.map(e=>e.code).join(', ') || 'Không có lỗi ERROR'}
    ];
    return {ok:true,pass:checks.every(c=>c.pass),checks,errors:st.errors};
  }

  function scanErrors() {
    const st = detectStatus();
    handleDetectedErrors(st);
    return {
      ok:true,
      connected:st.connected,
      clientIdMasked:st.clientIdMasked,
      errors:st.errors
    };
  }

  chrome.runtime.onMessage.addListener((msg,_sender,sendResponse) => {
    if (!msg || !msg.type) return;

    if (msg.type === 'KEEPER_PING') {
      sendResponse({ok:true,version:'1.2.0',primary:STATE.primary});
      return;
    }

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
      STATE.settings = Object.assign({},DEFAULTS,msg.settings || {});
      if (STATE.primary) startLoop();
      sendResponse({ok:true});
      return;
    }

    if (msg.type === 'KEEPER_RECONNECT_NOW') {
      sendResponse(reconnectNow('manual-popup'));
      return;
    }

    if (msg.type === 'KEEPER_SELF_TEST') {
      sendResponse(selfTest());
      return;
    }

    if (msg.type === 'KEEPER_SCAN_ERRORS') {
      sendResponse(scanErrors());
      return;
    }
  });

  STATE.observer = new MutationObserver(() => {
    if (!STATE.primary) return;
    setTimeout(checkHealth,100);
  });

  function bootObserver() {
    if (!document.documentElement) return setTimeout(bootObserver,100);
    STATE.observer.observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','style','disabled','aria-hidden']
    });
  }

  bootObserver();
  register();
})();
