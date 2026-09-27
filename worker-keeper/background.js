const VERSION = '1.2.0';

const DEFAULTS = {
  autoReconnect: true,
  autoDismissWebSocketError: true,
  autoRestoreTab: true,
  checkIntervalMs: 5000,
  workerUrl: 'https://fbaio.org/#/apis',
  bindingLocked: false,
  boundTabId: null,
  boundWindowId: null,
  expectedClientFingerprint: '',
  expectedClientMasked: '',
  reconnectBaseMs: 2000,
  reconnectMaxMs: 30000,
  staleAfterMs: 20000,
  eventLog: []
};

const API_HOSTS = new Set(['fbaio.org', 'www.fbaio.org']);
const MAX_EVENTS = 100;

function now() { return Date.now(); }
function tabUrl(tab) { return String((tab && (tab.url || tab.pendingUrl)) || ''); }

function isApiTabUrl(url) {
  try {
    const u = new URL(String(url || ''));
    if (!API_HOSTS.has(u.hostname)) return false;
    const route = (u.pathname + u.search + u.hash).toLowerCase();
    return route.includes('/apis') || u.hash.toLowerCase().startsWith('#/apis');
  } catch (_) {
    return false;
  }
}

function normalizeWorkerUrl(input) {
  const raw = String(input || '').trim() || DEFAULTS.workerUrl;
  const u = new URL(raw);
  if (u.protocol !== 'https:' || !API_HOSTS.has(u.hostname)) {
    throw new Error('Chỉ hỗ trợ URL https://fbaio.org/... hoặc https://www.fbaio.org/...');
  }
  if (!isApiTabUrl(u.href)) {
    throw new Error('URL phải là trang Social AIO APIs, ví dụ https://fbaio.org/#/apis');
  }
  return u.href;
}

async function getSettings() {
  const value = await chrome.storage.local.get(DEFAULTS);
  return Object.assign({}, DEFAULTS, value);
}

async function appendEvent(code, severity, message, action, extra) {
  const data = await chrome.storage.local.get({eventLog:[]});
  const log = Array.isArray(data.eventLog) ? data.eventLog : [];
  const t = now();
  const last = log[0];

  if (
    last &&
    last.code === code &&
    String(last.message || '') === String(message || '') &&
    t - Number(last.ts || 0) < 10000
  ) return last;

  const event = Object.assign({
    ts:t,
    code:String(code || 'INFO'),
    severity:String(severity || 'INFO'),
    message:String(message || ''),
    action:String(action || '')
  }, extra || {});

  log.unshift(event);
  if (log.length > MAX_EVENTS) log.length = MAX_EVENTS;
  await chrome.storage.local.set({eventLog:log});
  return event;
}

async function updateActionVisual(status, detail) {
  const s = String(status || 'UNKNOWN').toUpperCase();
  const map = {
    ONLINE:     {text:'ON', color:'#16a34a'},
    CONNECTING: {text:'...',color:'#d97706'},
    STALE:      {text:'?',  color:'#ca8a04'},
    ERROR:      {text:'!',  color:'#dc2626'},
    OFFLINE:    {text:'OFF',color:'#dc2626'},
    RESTORING:  {text:'R',  color:'#2563eb'},
    NO_TAB:     {text:'—',  color:'#64748b'},
    UNKNOWN:    {text:'?',  color:'#64748b'}
  };
  const v = map[s] || map.UNKNOWN;
  try {
    await chrome.action.setBadgeText({text:v.text});
    await chrome.action.setBadgeBackgroundColor({color:v.color});
    await chrome.action.setTitle({
      title:'Social AIO W1 — '+s+(detail ? ' — '+detail : '')
    });
  } catch (_) {}
}

async function setWorkerState(patch) {
  const data = await chrome.storage.local.get({workerState:{}});
  const state = Object.assign({}, data.workerState || {}, patch || {}, {updatedAt:now()});
  await chrome.storage.local.set({workerState:state});
  await updateActionVisual(state.status, state.lastError || state.lastAction || '');
  return state;
}

async function getApiTabs() {
  const tabs = await chrome.tabs.query({});
  return tabs.filter(t => isApiTabUrl(tabUrl(t)));
}

async function pingContent(tabId) {
  try {
    const r = await chrome.tabs.sendMessage(Number(tabId), {type:'KEEPER_PING'});
    return !!(r && r.ok);
  } catch (_) {
    return false;
  }
}

async function ensureContentScript(tabId) {
  if (await pingContent(tabId)) return true;
  try {
    await chrome.scripting.executeScript({
      target:{tabId:Number(tabId)},
      files:['content.js']
    });
  } catch (_) {
    return false;
  }

  for (let i=0;i<10;i++) {
    await new Promise(r => setTimeout(r, 200));
    if (await pingContent(tabId)) return true;
  }
  return false;
}

async function makeWorkerTabDurable(tabId) {
  try {
    await chrome.tabs.update(Number(tabId), {pinned:true, autoDiscardable:false});
  } catch (_) {
    try { await chrome.tabs.update(Number(tabId), {pinned:true}); } catch (_) {}
  }
}

async function publishBinding(boundTabId) {
  const tabs = await getApiTabs();
  for (const tab of tabs) {
    const primary = Number(tab.id) === Number(boundTabId);
    if (primary) {
      await ensureContentScript(tab.id);
      await makeWorkerTabDurable(tab.id);
    }
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type:'KEEPER_PRIMARY_CHANGED',
        primary,
        primaryTabId:boundTabId || null
      });
    } catch (_) {}
  }
}

async function findRestorableTab(settings) {
  const tabs = await chrome.tabs.query({});
  const exact = tabs.filter(t => tabUrl(t) === settings.workerUrl);
  if (!exact.length) return null;

  const sameWindowPinned = exact.find(t =>
    Number(t.windowId) === Number(settings.boundWindowId) && t.pinned
  );
  if (sameWindowPinned) return sameWindowPinned;

  const sameWindow = exact.find(t =>
    Number(t.windowId) === Number(settings.boundWindowId)
  );
  if (sameWindow) return sameWindow;

  const pinned = exact.find(t => t.pinned);
  return pinned || exact[0];
}

async function getBoundTab(options) {
  const opts = Object.assign({restore:false}, options || {});
  const settings = await getSettings();

  if (!settings.bindingLocked) return null;

  if (settings.boundTabId) {
    try {
      const tab = await chrome.tabs.get(Number(settings.boundTabId));
      if (tab && isApiTabUrl(tabUrl(tab))) return tab;

      await appendEvent(
        'E_TAB_NAVIGATED','ERROR',
        'W1 bound tab đã rời khỏi URL APIs.',
        'Khôi phục W1 về Worker URL.',
        {tabId:settings.boundTabId,url:tabUrl(tab)}
      );
    } catch (_) {}
  }

  const existing = await findRestorableTab(settings);
  if (existing) {
    await chrome.storage.local.set({
      boundTabId:Number(existing.id),
      boundWindowId:Number(existing.windowId)
    });
    await publishBinding(existing.id);
    await appendEvent(
      'W1_REBOUND','INFO',
      'Đã khôi phục binding W1 vào tab hiện có.',
      'Reuse exact Worker URL.',
      {tabId:existing.id,url:tabUrl(existing)}
    );
    return existing;
  }

  if (opts.restore && settings.autoRestoreTab) {
    return restoreBoundTab('bound-tab-missing');
  }

  return null;
}

async function claimTab(tabId, rememberUrl=true) {
  const tab = await chrome.tabs.get(Number(tabId));
  const url = tabUrl(tab);
  if (!isApiTabUrl(url)) {
    throw new Error('Tab được chọn không phải trang Social AIO /apis.');
  }

  const patch = {
    bindingLocked:true,
    boundTabId:Number(tab.id),
    boundWindowId:Number(tab.windowId)
  };
  if (rememberUrl) patch.workerUrl = normalizeWorkerUrl(url);
  await chrome.storage.local.set(patch);

  await makeWorkerTabDurable(tab.id);
  await ensureContentScript(tab.id);
  await publishBinding(tab.id);

  await appendEvent(
    'W1_BOUND','INFO',
    'Đã gắn W1 cố định vào tab #'+tab.id+'.',
    'Sticky binding + pin tab.',
    {tabId:tab.id,windowId:tab.windowId,url}
  );

  await setWorkerState({
    status:'UNKNOWN',
    boundTabId:Number(tab.id),
    boundWindowId:Number(tab.windowId),
    boundUrl:url,
    lastAction:'W1 bound'
  });

  return {tabId:Number(tab.id),windowId:Number(tab.windowId),url,pinned:true};
}

async function openAndClaimWorkerUrl(inputUrl) {
  const url = normalizeWorkerUrl(inputUrl);
  await chrome.storage.local.set({workerUrl:url});

  const tabs = await chrome.tabs.query({});
  let tab = tabs.find(t => tabUrl(t) === url);

  if (!tab) {
    tab = await chrome.tabs.create({url,active:true,pinned:true});
  } else {
    await chrome.tabs.update(tab.id,{active:true,pinned:true});
    if (tab.windowId != null) {
      try { await chrome.windows.update(tab.windowId,{focused:true}); } catch (_) {}
    }
  }

  if (tab.status === 'complete') await ensureContentScript(tab.id);
  return claimTab(tab.id,true);
}

async function claimCurrentTab() {
  const tabs = await chrome.tabs.query({active:true,currentWindow:true});
  if (!tabs.length) throw new Error('Không tìm thấy tab hiện tại.');
  return claimTab(tabs[0].id,true);
}

async function restoreBoundTab(reason) {
  const settings = await getSettings();
  if (!settings.bindingLocked || !settings.autoRestoreTab) return null;

  await setWorkerState({
    status:'RESTORING',
    lastAction:'Restoring W1 tab',
    lastError:''
  });

  let createProps = {url:settings.workerUrl, active:false, pinned:true};
  if (settings.boundWindowId != null) {
    try {
      await chrome.windows.get(Number(settings.boundWindowId));
      createProps.windowId = Number(settings.boundWindowId);
    } catch (_) {}
  }

  const tab = await chrome.tabs.create(createProps);
  await chrome.storage.local.set({
    boundTabId:Number(tab.id),
    boundWindowId:Number(tab.windowId)
  });

  await appendEvent(
    'W1_RESTORE','WARN',
    'W1 tab bị đóng/mất; đã tự mở lại.',
    'Auto restore Worker URL.',
    {reason:String(reason || ''),tabId:tab.id,url:settings.workerUrl}
  );

  return tab;
}

async function focusBoundTab() {
  let tab = await getBoundTab({restore:true});
  if (!tab) throw new Error('W1 chưa được gắn. Hãy dùng MỞ & GẮN hoặc GẮN TAB HIỆN TẠI.');
  tab = await chrome.tabs.get(Number(tab.id));
  await chrome.tabs.update(tab.id,{active:true});
  if (tab.windowId != null) {
    try { await chrome.windows.update(tab.windowId,{focused:true}); } catch (_) {}
  }
  return tab;
}

async function unbindWorker() {
  const settings = await getSettings();
  const oldId = settings.boundTabId;
  if (oldId) {
    try {
      await chrome.tabs.sendMessage(Number(oldId),{
        type:'KEEPER_PRIMARY_CHANGED',
        primary:false,
        primaryTabId:null
      });
    } catch (_) {}
  }

  await chrome.storage.local.set({
    bindingLocked:false,
    boundTabId:null,
    boundWindowId:null,
    expectedClientFingerprint:'',
    expectedClientMasked:''
  });

  await setWorkerState({
    status:'NO_TAB',
    boundTabId:null,
    boundWindowId:null,
    clientGuard:'UNSET',
    lastAction:'W1 unbound',
    lastError:''
  });

  await appendEvent(
    'W1_UNBOUND','WARN',
    'Đã bỏ gắn W1. Tab hiện tại không bị đóng.',
    'Manual unbind.'
  );

  return {ok:true};
}

async function acceptCurrentClient() {
  const data = await chrome.storage.local.get({workerState:{}});
  const state = data.workerState || {};
  if (!state.clientIdFingerprint) {
    throw new Error('Chưa đọc được Client ID hiện tại.');
  }

  await chrome.storage.local.set({
    expectedClientFingerprint:state.clientIdFingerprint,
    expectedClientMasked:state.clientIdMasked || ''
  });

  await setWorkerState({
    clientGuard:'OK',
    status:state.connected ? 'ONLINE' : state.status,
    lastError:'',
    lastAction:'Accepted current Client ID'
  });

  await appendEvent(
    'CLIENT_ACCEPTED','WARN',
    'Đã xác nhận Client ID hiện tại làm baseline mới.',
    'Manual operator approval.',
    {clientIdMasked:state.clientIdMasked || ''}
  );

  return {ok:true,clientIdMasked:state.clientIdMasked || ''};
}

function countEvents(log, code, sinceMs) {
  const cutoff = now() - sinceMs;
  return (log || []).filter(e =>
    Number(e.ts || 0) >= cutoff && (!code || e.code === code)
  ).length;
}

async function getPublicState() {
  const data = await chrome.storage.local.get(DEFAULTS);
  const state = Object.assign({}, data.workerState || {});
  const log = Array.isArray(data.eventLog) ? data.eventLog : [];
  const age = state.updatedAt ? now() - Number(state.updatedAt) : Infinity;

  if (
    data.bindingLocked &&
    state.status === 'ONLINE' &&
    age > Number(data.staleAfterMs || DEFAULTS.staleAfterMs)
  ) state.status = 'STALE';

  state.heartbeatAgeMs = Number.isFinite(age) ? age : null;
  state.reconnect1h = countEvents(log,'RECONNECT_ATTEMPT',60*60*1000);
  state.reconnect24h = countEvents(log,'RECONNECT_ATTEMPT',24*60*60*1000);
  state.eventCount = log.length;

  return {
    version:VERSION,
    workerState:state,
    bindingLocked:!!data.bindingLocked,
    boundTabId:data.boundTabId,
    boundWindowId:data.boundWindowId,
    workerUrl:data.workerUrl,
    autoReconnect:data.autoReconnect !== false,
    autoDismissWebSocketError:data.autoDismissWebSocketError !== false,
    autoRestoreTab:data.autoRestoreTab !== false,
    expectedClientMasked:data.expectedClientMasked || '',
    eventLog:log
  };
}

async function runSelfTest() {
  const settings = await getSettings();
  const checks = [];
  let tab = null;

  checks.push({
    name:'Binding',
    pass:!!settings.bindingLocked,
    detail:settings.bindingLocked ? 'W1 sticky binding active' : 'W1 chưa được gắn'
  });

  if (settings.bindingLocked) tab = await getBoundTab({restore:false});
  checks.push({
    name:'Worker tab',
    pass:!!tab,
    detail:tab ? ('Tab #'+tab.id+' • '+tabUrl(tab)) : 'Không tìm thấy bound tab'
  });

  if (tab) {
    checks.push({
      name:'Pinned',
      pass:!!tab.pinned,
      detail:tab.pinned ? 'Tab đã pin' : 'Tab chưa pin'
    });

    const injected = await ensureContentScript(tab.id);
    checks.push({
      name:'Content script',
      pass:!!injected,
      detail:injected ? 'Keeper content alive' : 'Không inject/ping được content script'
    });

    if (injected) {
      try {
        const page = await chrome.tabs.sendMessage(tab.id,{type:'KEEPER_SELF_TEST'});
        for (const c of (page && page.checks || [])) checks.push(c);
      } catch (e) {
        checks.push({name:'Page health',pass:false,detail:String(e && e.message || e)});
      }
    }
  }

  const publicState = await getPublicState();
  const age = publicState.workerState.heartbeatAgeMs;
  checks.push({
    name:'Heartbeat',
    pass:age != null && age <= Number(settings.staleAfterMs || DEFAULTS.staleAfterMs),
    detail:age == null ? 'Chưa có heartbeat' : Math.round(age/1000)+'s trước'
  });

  checks.push({
    name:'Client guard',
    pass:publicState.workerState.clientGuard !== 'MISMATCH',
    detail:publicState.workerState.clientGuard === 'MISMATCH'
      ? 'Client ID khác baseline'
      : (publicState.workerState.clientGuard || 'UNSET')
  });

  const pass = checks.every(c => c.pass);
  await appendEvent(
    'SELF_TEST',
    pass ? 'INFO' : 'ERROR',
    pass ? 'Self Test PASS' : 'Self Test FAIL',
    pass ? 'No action.' : 'Mở log và xử lý check FAIL.'
  );

  return {ok:true,pass,checks,state:publicState.workerState};
}

async function scanErrorsNow() {
  const tab = await getBoundTab({restore:false});
  if (!tab) throw new Error('Không có bound W1 tab.');
  await ensureContentScript(tab.id);
  const result = await chrome.tabs.sendMessage(tab.id,{type:'KEEPER_SCAN_ERRORS'});
  return result;
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(DEFAULTS);
  await chrome.storage.local.set(Object.assign({},DEFAULTS,current));
  chrome.alarms.create('keeper-health',{periodInMinutes:1});
  const settings = await getSettings();
  if (settings.bindingLocked) await getBoundTab({restore:true});
  else await setWorkerState({status:'NO_TAB',lastAction:'Install ready'});
});

chrome.runtime.onStartup.addListener(async () => {
  chrome.alarms.create('keeper-health',{periodInMinutes:1});
  const settings = await getSettings();
  if (settings.bindingLocked) await getBoundTab({restore:true});
  else await updateActionVisual('NO_TAB','W1 not bound');
});

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'keeper-health') return;
  const settings = await getSettings();
  if (settings.bindingLocked) {
    const tab = await getBoundTab({restore:true});
    if (tab) {
      const alive = await ensureContentScript(tab.id);
      if (!alive) {
        await setWorkerState({
          status:'ERROR',
          lastError:'Không ping/inject được content script',
          lastAction:'Alarm health check'
        });
        await appendEvent(
          'E_CONTENT_DEAD','ERROR',
          'Không giao tiếp được với W1 content script.',
          'Thử focus W1 hoặc reload extension.'
        );
      }
    }
  }
});

chrome.tabs.onRemoved.addListener(async tabId => {
  const settings = await getSettings();
  if (!settings.bindingLocked || Number(settings.boundTabId) !== Number(tabId)) return;

  await chrome.storage.local.set({boundTabId:null});
  await setWorkerState({
    status:settings.autoRestoreTab ? 'RESTORING' : 'NO_TAB',
    boundTabId:null,
    lastError:'W1 tab was closed',
    lastAction:settings.autoRestoreTab ? 'Auto restore scheduled' : 'Waiting for manual restore'
  });

  await appendEvent(
    'E_TAB_CLOSED','WARN',
    'Bound W1 tab đã bị đóng.',
    settings.autoRestoreTab ? 'Auto restore.' : 'Manual restore required.'
  );

  if (settings.autoRestoreTab) {
    setTimeout(() => restoreBoundTab('tab-closed').catch(()=>{}),1200);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId,changeInfo,tab) => {
  const settings = await getSettings();
  if (!settings.bindingLocked || Number(settings.boundTabId) !== Number(tabId)) return;

  const url = tabUrl(tab);
  if ((changeInfo.url || changeInfo.status === 'complete') && !isApiTabUrl(url)) {
    await setWorkerState({
      status:'ERROR',
      lastError:'Bound W1 tab navigated away from APIs',
      lastAction:'Navigation guard'
    });
    await appendEvent(
      'E_TAB_NAVIGATED','ERROR',
      'W1 tab đã rời khỏi trang APIs.',
      'Bấm MỞ W1 để trở lại Worker URL.',
      {url}
    );
    return;
  }

  if (changeInfo.status === 'complete' && isApiTabUrl(url)) {
    await makeWorkerTabDurable(tabId);
    await ensureContentScript(tabId);
    await publishBinding(tabId);
  }
});

chrome.runtime.onMessage.addListener((msg,sender,sendResponse) => {
  (async () => {
    if (!msg || !msg.type) return sendResponse({ok:false});

    if (msg.type === 'KEEPER_REGISTER') {
      const settings = await getSettings();
      const senderId = sender.tab && Number(sender.tab.id);
      const primary = !!(
        settings.bindingLocked &&
        settings.boundTabId &&
        senderId === Number(settings.boundTabId)
      );

      // Crucial V1.2 behavior: registration NEVER changes the binding.
      if (primary) await makeWorkerTabDurable(senderId);
      sendResponse({
        ok:true,
        primary,
        primaryTabId:settings.boundTabId || null,
        settings
      });
      return;
    }

    if (msg.type === 'KEEPER_HEARTBEAT') {
      const settings = await getSettings();
      const tabId = sender.tab && Number(sender.tab.id);
      if (!settings.bindingLocked || tabId !== Number(settings.boundTabId)) {
        sendResponse({ok:true,primary:false});
        return;
      }

      const incoming = Object.assign({}, msg.state || {});
      let clientGuard = 'UNSET';
      let status = String(incoming.status || 'UNKNOWN').toUpperCase();

      if (incoming.clientIdFingerprint) {
        if (!settings.expectedClientFingerprint) {
          await chrome.storage.local.set({
            expectedClientFingerprint:incoming.clientIdFingerprint,
            expectedClientMasked:incoming.clientIdMasked || ''
          });
          clientGuard = 'OK';
          await appendEvent(
            'CLIENT_BASELINE','INFO',
            'Đã ghi baseline Client ID cho W1.',
            'Automatic first baseline.',
            {clientIdMasked:incoming.clientIdMasked || ''}
          );
        } else if (settings.expectedClientFingerprint !== incoming.clientIdFingerprint) {
          clientGuard = 'MISMATCH';
          status = 'ERROR';
          await appendEvent(
            'E_CLIENT_ID_CHANGED','ERROR',
            'Client ID của W1 đã thay đổi.',
            'Không tự ghi đè. Kiểm tra rồi bấm XÁC NHẬN CLIENT HIỆN TẠI.',
            {
              expected:settings.expectedClientMasked || '',
              actual:incoming.clientIdMasked || ''
            }
          );
        } else {
          clientGuard = 'OK';
        }
      }

      const state = await setWorkerState(Object.assign({},incoming,{
        status,
        clientGuard,
        boundTabId:tabId,
        boundWindowId:sender.tab && sender.tab.windowId,
        boundUrl:tabUrl(sender.tab)
      }));

      sendResponse({
        ok:true,
        primary:true,
        clientGuard,
        guardBlocked:clientGuard === 'MISMATCH',
        status:state.status
      });
      return;
    }

    if (msg.type === 'KEEPER_EVENT') {
      const settings = await getSettings();
      const tabId = sender.tab && Number(sender.tab.id);
      if (!settings.bindingLocked || tabId !== Number(settings.boundTabId)) {
        sendResponse({ok:false,ignored:true});
        return;
      }

      await appendEvent(
        msg.code,
        msg.severity,
        msg.message,
        msg.action,
        Object.assign({tabId},msg.extra || {})
      );

      if (String(msg.severity || '').toUpperCase() === 'ERROR') {
        await setWorkerState({
          status:'ERROR',
          lastError:String(msg.message || msg.code || 'Page error'),
          lastErrorCode:String(msg.code || 'E_PAGE'),
          lastAction:String(msg.action || '')
        });
      }

      sendResponse({ok:true});
      return;
    }

    if (msg.type === 'KEEPER_RECONNECT_ATTEMPT') {
      const settings = await getSettings();
      const tabId = sender.tab && Number(sender.tab.id);
      if (tabId === Number(settings.boundTabId)) {
        await appendEvent(
          'RECONNECT_ATTEMPT','WARN',
          'Reconnect attempt #'+Number(msg.count || 0),
          String(msg.source || 'Auto reconnect'),
          {tabId}
        );
      }
      sendResponse({ok:true});
      return;
    }

    if (msg.type === 'KEEPER_GET_STATE') {
      sendResponse({ok:true,data:await getPublicState()});
      return;
    }

    if (msg.type === 'KEEPER_SAVE_SETTINGS') {
      const patch = Object.assign({},msg.settings || {});
      delete patch.boundTabId;
      delete patch.boundWindowId;
      delete patch.bindingLocked;
      delete patch.workerState;
      delete patch.eventLog;
      delete patch.expectedClientFingerprint;
      delete patch.expectedClientMasked;
      if (patch.workerUrl != null) patch.workerUrl = normalizeWorkerUrl(patch.workerUrl);
      await chrome.storage.local.set(patch);
      const tab = await getBoundTab({restore:false});
      if (tab) {
        try {
          await chrome.tabs.sendMessage(tab.id,{
            type:'KEEPER_SETTINGS_CHANGED',
            settings:await getSettings()
          });
        } catch (_) {}
      }
      sendResponse({ok:true,settings:await getSettings()});
      return;
    }

    if (msg.type === 'KEEPER_OPEN_URL') {
      const result = await openAndClaimWorkerUrl(msg.url);
      sendResponse({ok:true,result});
      return;
    }

    if (msg.type === 'KEEPER_CLAIM_CURRENT') {
      const result = await claimCurrentTab();
      sendResponse({ok:true,result});
      return;
    }

    if (msg.type === 'KEEPER_FOCUS_API') {
      const tab = await focusBoundTab();
      sendResponse({ok:true,tabId:tab.id});
      return;
    }

    if (msg.type === 'KEEPER_UNBIND') {
      sendResponse(await unbindWorker());
      return;
    }

    if (msg.type === 'KEEPER_ACCEPT_CLIENT') {
      sendResponse(await acceptCurrentClient());
      return;
    }

    if (msg.type === 'KEEPER_RECONNECT_NOW') {
      const tab = await getBoundTab({restore:true});
      if (!tab) throw new Error('W1 chưa được gắn.');
      await ensureContentScript(tab.id);
      const result = await chrome.tabs.sendMessage(tab.id,{type:'KEEPER_RECONNECT_NOW'});
      sendResponse({ok:true,result});
      return;
    }

    if (msg.type === 'KEEPER_SELF_TEST') {
      sendResponse(await runSelfTest());
      return;
    }

    if (msg.type === 'KEEPER_SCAN_ERRORS') {
      sendResponse({ok:true,result:await scanErrorsNow()});
      return;
    }

    if (msg.type === 'KEEPER_GET_LOG') {
      const data = await chrome.storage.local.get({eventLog:[]});
      sendResponse({ok:true,log:data.eventLog || []});
      return;
    }

    sendResponse({ok:false,error:'UNKNOWN_MESSAGE'});
  })().catch(async e => {
    const message = String(e && e.message || e);
    await appendEvent('E_BACKGROUND','ERROR',message,'Background command failed.');
    sendResponse({ok:false,error:message});
  });
  return true;
});
