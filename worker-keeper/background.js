const DEFAULTS = {
  autoReconnect: true,
  autoDismissWebSocketError: true,
  checkIntervalMs: 5000,
  primaryTabId: null,
  reconnectBaseMs: 2000,
  reconnectMaxMs: 30000
};

const API_HOSTS = new Set(['fbaio.org', 'www.fbaio.org']);

function isApiTabUrl(url) {
  try {
    const u = new URL(String(url || ''));
    if (!API_HOSTS.has(u.hostname)) return false;
    return /(^|\/)apis(?:$|[/?#])/.test(u.pathname + u.hash) || u.hash.startsWith('#/apis');
  } catch (_) {
    return false;
  }
}

async function getSettings() {
  const v = await chrome.storage.local.get(DEFAULTS);
  return Object.assign({}, DEFAULTS, v);
}

async function getApiTabs() {
  const tabs = await chrome.tabs.query({url:[
    'https://fbaio.org/*',
    'https://www.fbaio.org/*'
  ]});
  return tabs.filter(t => isApiTabUrl(t.url));
}

async function electPrimary(preferredTabId) {
  const tabs = await getApiTabs();
  if (!tabs.length) {
    await chrome.storage.local.set({
      primaryTabId: null,
      workerState: {
        status: 'NO_TAB',
        updatedAt: Date.now(),
        message: 'Không có tab Social AIO /apis.'
      }
    });
    return null;
  }

  const settings = await getSettings();
  const validIds = new Set(tabs.map(t => t.id));
  let primary = Number(preferredTabId || settings.primaryTabId || 0);

  if (!validIds.has(primary)) {
    tabs.sort((a,b) => Number(a.id || 0) - Number(b.id || 0));
    primary = tabs[0].id;
  }

  await chrome.storage.local.set({primaryTabId: primary});
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'KEEPER_PRIMARY_CHANGED',
        primary: tab.id === primary,
        primaryTabId: primary
      });
    } catch (_) {}
  }
  return primary;
}

async function focusOrOpenApiTab() {
  const primary = await electPrimary();
  if (primary) {
    const tab = await chrome.tabs.get(primary);
    await chrome.tabs.update(primary, {active:true});
    if (tab.windowId != null) {
      await chrome.windows.update(tab.windowId, {focused:true});
    }
    return primary;
  }

  const tab = await chrome.tabs.create({url:'https://fbaio.org/#/apis', active:true});
  await chrome.storage.local.set({primaryTabId: tab.id});
  return tab.id;
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(DEFAULTS);
  await chrome.storage.local.set(Object.assign({}, DEFAULTS, current));
  chrome.alarms.create('keeper-health', {periodInMinutes:1});
  await electPrimary();
});

chrome.runtime.onStartup.addListener(async () => {
  chrome.alarms.create('keeper-health', {periodInMinutes:1});
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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== 'complete') return;
  if (isApiTabUrl(tab.url)) await electPrimary();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (!msg || !msg.type) return sendResponse({ok:false});

    if (msg.type === 'KEEPER_REGISTER') {
      const primary = await electPrimary();
      sendResponse({
        ok:true,
        primary: sender.tab && sender.tab.id === primary,
        primaryTabId: primary,
        settings: await getSettings()
      });
      return;
    }

    if (msg.type === 'KEEPER_HEARTBEAT') {
      const {primaryTabId} = await chrome.storage.local.get('primaryTabId');
      const tabId = sender.tab && sender.tab.id;
      const primary = Number(tabId) === Number(primaryTabId);
      if (primary) {
        await chrome.storage.local.set({
          workerState: Object.assign({}, msg.state || {}, {
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
        'workerState','primaryTabId',
        'autoReconnect','autoDismissWebSocketError',
        'checkIntervalMs','reconnectBaseMs','reconnectMaxMs'
      ]);
      sendResponse({ok:true,data});
      return;
    }

    if (msg.type === 'KEEPER_SAVE_SETTINGS') {
      const patch = Object.assign({}, msg.settings || {});
      delete patch.primaryTabId;
      delete patch.workerState;
      await chrome.storage.local.set(patch);
      const primary = await electPrimary();
      if (primary) {
        try {
          await chrome.tabs.sendMessage(primary, {
            type:'KEEPER_SETTINGS_CHANGED',
            settings:await getSettings()
          });
        } catch (_) {}
      }
      sendResponse({ok:true,settings:await getSettings()});
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
      try {
        const r = await chrome.tabs.sendMessage(primary, {type:'KEEPER_RECONNECT_NOW'});
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
