const DEFAULTS = {
  autoReconnect: true,
  autoDismissWebSocketError: true,
  checkIntervalMs: 5000,
  primaryTabId: null,
  workerUrl: 'https://fbaio.org/#/apis',
  reconnectBaseMs: 2000,
  reconnectMaxMs: 30000
};

const API_HOSTS = new Set(['fbaio.org', 'www.fbaio.org']);

function tabUrl(tab) {
  return String((tab && (tab.url || tab.pendingUrl)) || '');
}

function normalizeWorkerUrl(input) {
  const raw = String(input || '').trim() || DEFAULTS.workerUrl;
  const u = new URL(raw);
  if (u.protocol !== 'https:' || !API_HOSTS.has(u.hostname)) {
    throw new Error('Chỉ hỗ trợ URL https://fbaio.org/... hoặc https://www.fbaio.org/...');
  }
  if (!isApiTabUrl(u.href)) {
    throw new Error('URL phải trỏ tới trang Social AIO APIs, ví dụ https://fbaio.org/#/apis');
  }
  return u.href;
}

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

async function getSettings() {
  const v = await chrome.storage.local.get(DEFAULTS);
  return Object.assign({}, DEFAULTS, v);
}

async function getApiTabs() {
  // Query every tab, then inspect the real URL ourselves.
  // This is more reliable for SPA hash routes such as #/apis.
  const tabs = await chrome.tabs.query({});
  return tabs.filter(t => isApiTabUrl(tabUrl(t)));
}

async function pingContent(tabId) {
  try {
    const r = await chrome.tabs.sendMessage(tabId, {type:'KEEPER_PING'});
    return !!(r && r.ok);
  } catch (_) {
    return false;
  }
}

async function ensureContentScript(tabId) {
  if (await pingContent(tabId)) return true;
  try {
    await chrome.scripting.executeScript({
      target:{tabId},
      files:['content.js']
    });
  } catch (e) {
    return false;
  }

  for (let i=0;i<8;i++) {
    await new Promise(r => setTimeout(r, 200));
    if (await pingContent(tabId)) return true;
  }
  return false;
}

async function publishPrimary(primary, tabs) {
  await chrome.storage.local.set({primaryTabId: primary || null});
  for (const tab of tabs || []) {
    const isPrimary = Number(tab.id) === Number(primary);
    if (isPrimary) await ensureContentScript(tab.id);
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type:'KEEPER_PRIMARY_CHANGED',
        primary:isPrimary,
        primaryTabId:primary || null
      });
    } catch (_) {}
  }
}

async function electPrimary(preferredTabId) {
  const tabs = await getApiTabs();
  if (!tabs.length) {
    await chrome.storage.local.set({
      primaryTabId:null,
      workerState:{
        status:'NO_TAB',
        updatedAt:Date.now(),
        message:'Chưa bắt được tab Social AIO /apis.'
      }
    });
    return null;
  }

  const settings = await getSettings();
  const validIds = new Set(tabs.map(t => Number(t.id)));
  let primary = Number(preferredTabId || settings.primaryTabId || 0);

  if (!validIds.has(primary)) {
    const preferredUrl = String(settings.workerUrl || '');
    const urlMatch = tabs.find(t => tabUrl(t) === preferredUrl);
    if (urlMatch) primary = Number(urlMatch.id);
  }

  if (!validIds.has(primary)) {
    const active = tabs.find(t => t.active);
    if (active) primary = Number(active.id);
  }

  if (!validIds.has(primary)) {
    tabs.sort((a,b) => Number(a.id || 0) - Number(b.id || 0));
    primary = Number(tabs[0].id);
  }

  await publishPrimary(primary, tabs);
  return primary;
}

async function claimTab(tabId, rememberUrl=true) {
  const tab = await chrome.tabs.get(Number(tabId));
  const url = tabUrl(tab);
  if (!isApiTabUrl(url)) {
    throw new Error('Tab được chọn không phải trang Social AIO /apis.');
  }

  if (rememberUrl) {
    await chrome.storage.local.set({workerUrl:normalizeWorkerUrl(url)});
  }
  const tabs = await getApiTabs();
  await publishPrimary(Number(tab.id), tabs);
  return {
    tabId:Number(tab.id),
    url,
    injected:await ensureContentScript(Number(tab.id))
  };
}

async function openAndClaimWorkerUrl(inputUrl) {
  const url = normalizeWorkerUrl(inputUrl);
  await chrome.storage.local.set({workerUrl:url});

  const tabs = await chrome.tabs.query({});
  let tab = tabs.find(t => tabUrl(t) === url);

  if (!tab) {
    tab = await chrome.tabs.create({url,active:true});
  } else {
    await chrome.tabs.update(tab.id,{active:true});
    if (tab.windowId != null) {
      try { await chrome.windows.update(tab.windowId,{focused:true}); } catch (_) {}
    }
  }

  await chrome.storage.local.set({primaryTabId:Number(tab.id)});

  if (tab.status === 'complete') {
    await ensureContentScript(tab.id);
    await claimTab(tab.id,false);
  }

  return {tabId:Number(tab.id),url};
}

async function claimCurrentTab() {
  const tabs = await chrome.tabs.query({active:true,currentWindow:true});
  if (!tabs.length) throw new Error('Không tìm thấy tab hiện tại.');
  return claimTab(tabs[0].id,true);
}

async function focusOrOpenApiTab() {
  const settings = await getSettings();
  const primary = await electPrimary();
  if (primary) {
    const tab = await chrome.tabs.get(primary);
    await chrome.tabs.update(primary,{active:true});
    if (tab.windowId != null) {
      try { await chrome.windows.update(tab.windowId,{focused:true}); } catch (_) {}
    }
    await ensureContentScript(primary);
    return primary;
  }

  const opened = await openAndClaimWorkerUrl(settings.workerUrl);
  return opened.tabId;
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(DEFAULTS);
  await chrome.storage.local.set(Object.assign({},DEFAULTS,current));
  chrome.alarms.create('keeper-health',{periodInMinutes:1});
  await electPrimary();
});

chrome.runtime.onStartup.addListener(async () => {
  chrome.alarms.create('keeper-health',{periodInMinutes:1});
  await electPrimary();
});

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'keeper-health') return;
  await electPrimary();
});

chrome.tabs.onRemoved.addListener(async tabId => {
  const {primaryTabId} = await chrome.storage.local.get('primaryTabId');
  if (Number(primaryTabId) === Number(tabId)) {
    await chrome.storage.local.set({primaryTabId:null});
    await electPrimary();
  }
});

chrome.tabs.onUpdated.addListener(async (tabId,changeInfo,tab) => {
  if (!changeInfo.url && changeInfo.status !== 'complete') return;
  if (!isApiTabUrl(tabUrl(tab))) return;

  const {primaryTabId} = await chrome.storage.local.get('primaryTabId');
  if (!primaryTabId || Number(primaryTabId) === Number(tabId)) {
    await claimTab(tabId,true);
  } else {
    await electPrimary();
  }
});

chrome.runtime.onMessage.addListener((msg,sender,sendResponse) => {
  (async () => {
    if (!msg || !msg.type) return sendResponse({ok:false});

    if (msg.type === 'KEEPER_REGISTER') {
      const primary = await electPrimary(sender.tab && sender.tab.id);
      sendResponse({
        ok:true,
        primary:sender.tab && Number(sender.tab.id) === Number(primary),
        primaryTabId:primary,
        settings:await getSettings()
      });
      return;
    }

    if (msg.type === 'KEEPER_HEARTBEAT') {
      const {primaryTabId} = await chrome.storage.local.get('primaryTabId');
      const tabId = sender.tab && sender.tab.id;
      const primary = Number(tabId) === Number(primaryTabId);
      if (primary) {
        await chrome.storage.local.set({
          workerState:Object.assign({},msg.state || {},{
            tabId,
            primary:true,
            updatedAt:Date.now()
          })
        });
      }
      sendResponse({ok:true,primary});
      return;
    }

    if (msg.type === 'KEEPER_GET_STATE') {
      const data = await chrome.storage.local.get([
        'workerState','primaryTabId','workerUrl',
        'autoReconnect','autoDismissWebSocketError',
        'checkIntervalMs','reconnectBaseMs','reconnectMaxMs'
      ]);
      sendResponse({ok:true,data});
      return;
    }

    if (msg.type === 'KEEPER_SAVE_SETTINGS') {
      const patch = Object.assign({},msg.settings || {});
      delete patch.primaryTabId;
      delete patch.workerState;
      if (patch.workerUrl != null) patch.workerUrl = normalizeWorkerUrl(patch.workerUrl);
      await chrome.storage.local.set(patch);
      const primary = await electPrimary();
      if (primary) {
        try {
          await chrome.tabs.sendMessage(primary,{
            type:'KEEPER_SETTINGS_CHANGED',
            settings:await getSettings()
          });
        } catch (_) {}
      }
      sendResponse({ok:true,settings:await getSettings()});
      return;
    }

    if (msg.type === 'KEEPER_OPEN_URL') {
      const r = await openAndClaimWorkerUrl(msg.url);
      sendResponse({ok:true,result:r});
      return;
    }

    if (msg.type === 'KEEPER_CLAIM_CURRENT') {
      const r = await claimCurrentTab();
      sendResponse({ok:true,result:r});
      return;
    }

    if (msg.type === 'KEEPER_FOCUS_API') {
      const tabId = await focusOrOpenApiTab();
      sendResponse({ok:true,tabId});
      return;
    }

    if (msg.type === 'KEEPER_RECONNECT_NOW') {
      const primary = await electPrimary();
      if (!primary) {
        const tabId = await focusOrOpenApiTab();
        sendResponse({ok:true,tabId,opened:true});
        return;
      }
      await ensureContentScript(primary);
      try {
        const r = await chrome.tabs.sendMessage(primary,{type:'KEEPER_RECONNECT_NOW'});
        sendResponse({ok:true,result:r});
      } catch (e) {
        sendResponse({ok:false,error:String(e && e.message || e)});
      }
      return;
    }

    sendResponse({ok:false,error:'UNKNOWN_MESSAGE'});
  })().catch(e => sendResponse({ok:false,error:String(e && e.message || e)}));
  return true;
});
