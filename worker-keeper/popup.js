let LAST = null;

function ago(ms) {
  if (!ms) return '—';
  const s = Math.max(0,Math.round((Date.now()-Number(ms))/1000));
  if (s < 10) return 'vừa xong';
  if (s < 60) return s+'s trước';
  const m = Math.round(s/60);
  if (m < 60) return m+'p trước';
  const h = Math.round(m/60);
  if (h < 48) return h+'h trước';
  return Math.round(h/24)+'d trước';
}

function duration(ms) {
  if (!ms || ms < 0) return '—';
  const s = Math.floor(ms/1000);
  if (s < 60) return s+'s';
  const m = Math.floor(s/60);
  if (m < 60) return m+'p';
  const h = Math.floor(m/60);
  return h+'h '+(m%60)+'p';
}

async function send(type,extra) {
  return chrome.runtime.sendMessage(Object.assign({type},extra || {}));
}

function showMessage(text,type) {
  const el=document.getElementById('message');
  el.textContent=text || '';
  el.style.color=type==='ok'?'#15803d':type==='bad'?'#b91c1c':'#64748b';
}

function statusClass(status) {
  const s=String(status || 'UNKNOWN').toLowerCase();
  if (['online','offline','error','connecting','stale','restoring'].includes(s)) return s;
  return 'unknown';
}

function renderLog(log) {
  const el=document.getElementById('log');
  const rows=(log || []).slice(0,8);
  if (!rows.length) {
    el.innerHTML='<div class="muted">Chưa có event.</div>';
    return;
  }
  el.innerHTML=rows.map(e=>{
    const t=new Date(Number(e.ts || 0)).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    return '<div class="logline"><span class="code">'+escapeHtml(e.code || '')+'</span> • '+t+'<br>'+
      escapeHtml(e.message || '')+
      (e.action?'<div class="muted">'+escapeHtml(e.action)+'</div>':'')+
      '</div>';
  }).join('');
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#39;");
}

function render(data) {
  LAST=data;
  const state=data.workerState || {};
  const status=state.status || (data.bindingLocked?'UNKNOWN':'NO_TAB');

  const statusEl=document.getElementById('status');
  statusEl.textContent=status;
  statusEl.className='status '+statusClass(status);

  document.getElementById('boundTab').textContent=data.bindingLocked
    ? ('#'+(data.boundTabId || 'restoring'))
    : '—';
  document.getElementById('client').textContent=state.clientIdMasked || '—';
  document.getElementById('clientGuard').textContent=state.clientGuard || 'UNSET';
  document.getElementById('uptime').textContent=state.onlineSince
    ? duration(Date.now()-Number(state.onlineSince))
    : '—';
  document.getElementById('reconnectMetric').textContent=
    Number(state.reconnect1h || 0)+' / '+Number(state.reconnect24h || 0);
  document.getElementById('lastOk').textContent=ago(state.lastConnectedAt);
  document.getElementById('lastError').textContent=state.lastError
    ? ('Lỗi: '+(state.lastErrorCode?state.lastErrorCode+' • ':'')+state.lastError)
    : (state.lastAction?'Action: '+state.lastAction:'');

  document.getElementById('autoReconnect').checked=data.autoReconnect !== false;
  document.getElementById('autoDismiss').checked=data.autoDismissWebSocketError !== false;
  document.getElementById('autoRestore').checked=data.autoRestoreTab !== false;

  if (document.activeElement !== document.getElementById('workerUrl')) {
    document.getElementById('workerUrl').value=data.workerUrl || 'https://fbaio.org/#/apis';
  }

  const binding=document.getElementById('bindingInfo');
  if (data.bindingLocked) {
    binding.className='binding '+(status==='ONLINE'?'good':status==='ERROR'||status==='OFFLINE'?'bad':'warn');
    binding.textContent='W1 LOCKED • tab #'+(data.boundTabId || '?')+
      ' • tab khác không được cướp Worker.';
  } else {
    binding.className='binding warn';
    binding.textContent='W1 chưa được gắn. Dùng MỞ & GẮN hoặc GẮN TAB HIỆN TẠI.';
  }

  document.getElementById('acceptClient').classList.toggle(
    'hidden',
    state.clientGuard !== 'MISMATCH'
  );

  renderLog(data.eventLog || []);
}

async function refresh() {
  try {
    const r=await send('KEEPER_GET_STATE');
    if (r && r.ok) render(r.data || {});
  } catch (_) {}
}

async function saveSettings() {
  const r=await send('KEEPER_SAVE_SETTINGS',{
    settings:{
      autoReconnect:document.getElementById('autoReconnect').checked,
      autoDismissWebSocketError:document.getElementById('autoDismiss').checked,
      autoRestoreTab:document.getElementById('autoRestore').checked
    }
  });
  if (!r || !r.ok) showMessage((r && r.error) || 'Không lưu được Settings','bad');
  await refresh();
}

document.getElementById('autoReconnect').addEventListener('change',saveSettings);
document.getElementById('autoDismiss').addEventListener('change',saveSettings);
document.getElementById('autoRestore').addEventListener('change',saveSettings);

document.getElementById('openUrl').addEventListener('click',async () => {
  const url=document.getElementById('workerUrl').value.trim();
  showMessage('Đang mở và khóa W1 vào URL này...','');
  const r=await send('KEEPER_OPEN_URL',{url});
  if (r && r.ok) showMessage('Đã gắn cố định W1 vào tab #'+r.result.tabId+'.','ok');
  else showMessage((r && r.error) || 'Không gắn được W1.','bad');
  setTimeout(refresh,500);
});

document.getElementById('claimCurrent').addEventListener('click',async () => {
  showMessage('Đang gắn tab hiện tại làm W1...','');
  const r=await send('KEEPER_CLAIM_CURRENT');
  if (r && r.ok) showMessage('W1 locked vào tab #'+r.result.tabId+'.','ok');
  else showMessage((r && r.error) || 'Không bắt được tab.','bad');
  setTimeout(refresh,500);
});

document.getElementById('focus').addEventListener('click',async () => {
  const r=await send('KEEPER_FOCUS_API');
  if (!r || !r.ok) showMessage((r && r.error) || 'Không mở được W1.','bad');
});

document.getElementById('unbind').addEventListener('click',async () => {
  if (!confirm('Bỏ gắn W1? Tab Social AIO sẽ không bị đóng.')) return;
  const r=await send('KEEPER_UNBIND');
  if (r && r.ok) showMessage('Đã bỏ gắn W1.','ok');
  else showMessage((r && r.error) || 'Không bỏ gắn được.','bad');
  await refresh();
});

document.getElementById('reconnect').addEventListener('click',async () => {
  showMessage('Đang yêu cầu reconnect W1...','');
  const r=await send('KEEPER_RECONNECT_NOW');
  if (r && r.ok) showMessage('Đã gửi reconnect.','ok');
  else showMessage((r && r.error) || 'Reconnect thất bại.','bad');
  setTimeout(refresh,800);
});

document.getElementById('selfTest').addEventListener('click',async () => {
  const el=document.getElementById('testResult');
  el.textContent='Đang chạy Self Test...';
  const r=await send('KEEPER_SELF_TEST');
  if (!r || !r.ok) {
    el.textContent=(r && r.error) || 'Self Test lỗi.';
    return;
  }
  el.innerHTML='<b style="color:'+(r.pass?'#15803d':'#b91c1c')+'">'+
    (r.pass?'PASS':'FAIL')+'</b><br>'+
    (r.checks || []).map(c=>
      (c.pass?'✅ ':'❌ ')+escapeHtml(c.name)+': '+escapeHtml(c.detail)
    ).join('<br>');
  await refresh();
});

document.getElementById('scanErrors').addEventListener('click',async () => {
  const el=document.getElementById('testResult');
  el.textContent='Đang quét lỗi trên W1...';
  const r=await send('KEEPER_SCAN_ERRORS');
  if (!r || !r.ok) {
    el.textContent=(r && r.error) || 'Quét lỗi thất bại.';
    return;
  }
  const errors=(r.result && r.result.errors) || [];
  el.innerHTML=errors.length
    ? errors.map(e=>'⚠ '+escapeHtml(e.code)+' — '+escapeHtml(e.action || '')).join('<br>')
    : '✅ Không phát hiện error banner/modal đã biết.';
  await refresh();
});

document.getElementById('acceptClient').addEventListener('click',async () => {
  if (!confirm('Xác nhận Client ID hiện tại làm baseline W1 mới?')) return;
  const r=await send('KEEPER_ACCEPT_CLIENT');
  if (r && r.ok) showMessage('Đã xác nhận Client '+(r.clientIdMasked || '')+'.','ok');
  else showMessage((r && r.error) || 'Không xác nhận được Client.','bad');
  await refresh();
});

document.getElementById('copyLog').addEventListener('click',async () => {
  const r=await send('KEEPER_GET_LOG');
  const log=(r && r.log) || [];
  const state=LAST && LAST.workerState || {};
  const lines=[
    'Social AIO Worker Keeper V1.2.0',
    'Status: '+(state.status || 'UNKNOWN'),
    'Bound tab: '+(LAST && LAST.boundTabId || '—'),
    'Client: '+(state.clientIdMasked || '—'),
    'Client guard: '+(state.clientGuard || 'UNSET'),
    'Reconnect 1h/24h: '+Number(state.reconnect1h || 0)+'/'+Number(state.reconnect24h || 0),
    '',
    ...log.map(e=>{
      const t=new Date(Number(e.ts || 0)).toISOString();
      return t+' | '+e.severity+' | '+e.code+' | '+e.message+(e.action?' | '+e.action:'');
    })
  ];
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    showMessage('Đã copy Health Log.','ok');
  } catch (e) {
    showMessage('Không copy được log: '+String(e && e.message || e),'bad');
  }
});

refresh();
setInterval(refresh,2000);
