function ago(ms) {
  if (!ms) return '—';
  const s = Math.max(0,Math.round((Date.now()-Number(ms))/1000));
  if (s < 10) return 'vừa xong';
  if (s < 60) return s+'s trước';
  const m = Math.round(s/60);
  if (m < 60) return m+'p trước';
  return Math.round(m/60)+'h trước';
}

async function send(type,extra) {
  return chrome.runtime.sendMessage(Object.assign({type},extra || {}));
}

function setBindResult(text,ok) {
  const el=document.getElementById('bindResult');
  el.textContent=text || '';
  el.style.color=ok===true?'#15803d':ok===false?'#b91c1c':'#64748b';
}

function render(data) {
  const state=data.workerState || {};
  const status=state.status || (data.primaryTabId?'UNKNOWN':'NO_TAB');
  const el=document.getElementById('status');
  el.textContent=status;
  el.className='status '+(
    status==='ONLINE'?'online':
    status==='OFFLINE'?'offline':
    status==='CONNECTING'?'connecting':'unknown'
  );
  document.getElementById('client').textContent=state.clientIdMasked || '—';
  document.getElementById('reconnects').textContent=Number(state.reconnectCount || 0);
  document.getElementById('lastOk').textContent=ago(state.lastConnectedAt);
  document.getElementById('lastError').textContent=
    state.lastError?('Lỗi gần nhất: '+state.lastError):(state.lastAction?('Action: '+state.lastAction):'');
  document.getElementById('autoReconnect').checked=data.autoReconnect !== false;
  document.getElementById('autoDismiss').checked=data.autoDismissWebSocketError !== false;
  if (document.activeElement !== document.getElementById('workerUrl')) {
    document.getElementById('workerUrl').value=data.workerUrl || 'https://fbaio.org/#/apis';
  }
}

async function refresh() {
  const r=await send('KEEPER_GET_STATE');
  if (r && r.ok) render(r.data || {});
}

async function saveSettings() {
  await send('KEEPER_SAVE_SETTINGS',{
    settings:{
      autoReconnect:document.getElementById('autoReconnect').checked,
      autoDismissWebSocketError:document.getElementById('autoDismiss').checked
    }
  });
  await refresh();
}

document.getElementById('autoReconnect').addEventListener('change',saveSettings);
document.getElementById('autoDismiss').addEventListener('change',saveSettings);

document.getElementById('openUrl').addEventListener('click',async () => {
  const url=document.getElementById('workerUrl').value.trim();
  setBindResult('Đang mở và bắt Worker URL...',null);
  try {
    const r=await send('KEEPER_OPEN_URL',{url});
    if (!r || !r.ok) throw new Error(r && r.error || 'Không mở được URL');
    setBindResult('Đã gán URL cho W1. Mở lại popup sau 2–5 giây để kiểm tra ONLINE.',true);
  } catch (e) {
    setBindResult(String(e && e.message || e),false);
  }
});

document.getElementById('claimCurrent').addEventListener('click',async () => {
  setBindResult('Đang bắt tab hiện tại...',null);
  try {
    const r=await send('KEEPER_CLAIM_CURRENT');
    if (!r || !r.ok) throw new Error(r && r.error || 'Không bắt được tab');
    setBindResult('Đã bắt tab hiện tại làm W1 primary.',true);
    setTimeout(refresh,500);
  } catch (e) {
    setBindResult(String(e && e.message || e),false);
  }
});

document.getElementById('open').addEventListener('click',async () => {
  await send('KEEPER_FOCUS_API');
  window.close();
});

document.getElementById('reconnect').addEventListener('click',async () => {
  setBindResult('Đang yêu cầu reconnect...',null);
  const r=await send('KEEPER_RECONNECT_NOW');
  if (r && r.ok) setBindResult('Đã gửi reconnect.',true);
  else setBindResult((r && r.error) || 'Reconnect thất bại.',false);
  setTimeout(refresh,800);
});

refresh();
setInterval(refresh,2000);
