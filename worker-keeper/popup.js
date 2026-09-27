function ago(ms) {
  if (!ms) return '—';
  const s = Math.max(0, Math.round((Date.now() - Number(ms)) / 1000));
  if (s < 10) return 'vừa xong';
  if (s < 60) return s + 's trước';
  const m = Math.round(s / 60);
  if (m < 60) return m + 'p trước';
  return Math.round(m / 60) + 'h trước';
}

async function send(type, extra) {
  return chrome.runtime.sendMessage(Object.assign({type}, extra || {}));
}

function render(data) {
  const state = data.workerState || {};
  const status = state.status || (data.primaryTabId ? 'UNKNOWN' : 'NO_TAB');
  const el = document.getElementById('status');
  el.textContent = status;
  el.className = 'status ' + (status === 'ONLINE' ? 'online' : status === 'OFFLINE' ? 'offline' : 'unknown');
  document.getElementById('client').textContent = state.clientIdMasked || '—';
  document.getElementById('reconnects').textContent = Number(state.reconnectCount || 0);
  document.getElementById('lastOk').textContent = ago(state.lastConnectedAt);
  document.getElementById('lastError').textContent =
    state.lastError ? ('Lỗi gần nhất: ' + state.lastError) : (state.lastAction ? ('Action: ' + state.lastAction) : '');
  document.getElementById('autoReconnect').checked = data.autoReconnect !== false;
  document.getElementById('autoDismiss').checked = data.autoDismissWebSocketError !== false;
}

async function refresh() {
  const r = await send('KEEPER_GET_STATE');
  if (r && r.ok) render(r.data || {});
}

async function saveSettings() {
  await send('KEEPER_SAVE_SETTINGS', {
    settings:{
      autoReconnect:document.getElementById('autoReconnect').checked,
      autoDismissWebSocketError:document.getElementById('autoDismiss').checked
    }
  });
  await refresh();
}

document.getElementById('autoReconnect').addEventListener('change', saveSettings);
document.getElementById('autoDismiss').addEventListener('change', saveSettings);
document.getElementById('open').addEventListener('click', async () => {
  await send('KEEPER_FOCUS_API');
  window.close();
});
document.getElementById('reconnect').addEventListener('click', async () => {
  await send('KEEPER_RECONNECT_NOW');
  setTimeout(refresh, 800);
});

refresh();
setInterval(refresh, 2000);
