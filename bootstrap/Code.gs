/**
 * SOCIAL AIO - Stable GitHub Bootstrap V2
 * onOpen chỉ dựng menu LOCAL, KHÔNG gọi UrlFetchApp.
 * Vì vậy menu luôn xuất hiện sau khi reload Sheet.
 * Remote runtime chỉ được tải khi người dùng bấm một menu item.
 */
const BOOTSTRAP_VERSION = '2.4-auto-monitor-auth';

const GITHUB_RUNTIME = {
  RAW_BASE: 'https://raw.githubusercontent.com/ncmmocom-oss/facebook-community-sales-os/main/apps-script',
  RUNTIME_FILE: 'Runtime.js',
  HTML_FILE: 'ImportDialog.html',
  CACHE_SECONDS: 300,
};

function onOpen() {
  buildLocalMenu_();
}

function buildLocalMenu_() {
  const ui=SpreadsheetApp.getUi();

  // V1.9.2 UX Shell P1:
  // Native Google Sheets menu is only the entry point.
  // Operational workflows live in the Control Center.
  ui.createMenu('SOCIAL AIO')
    .addItem('🚀 MỞ CONTROL CENTER', 'showControlCenterHome')
    .addSeparator()
    .addItem('📡 TÍN HIỆU', 'openSignalFeed')
    .addItem('🎯 LEAD INBOX', 'openLeadInbox')
    .addSeparator()
    .addItem('⚙ CÀI ĐẶT', 'showSettingsDialog')
    .addSubMenu(
      ui.createMenu('HỆ THỐNG')
        .addItem('🔄 Cập nhật runtime từ GitHub', 'githubForceUpdate')
        .addItem('🔐 Cấp quyền AUTO MONITOR', 'authorizeAutoMonitor')
        .addItem('ℹ Thông tin phiên bản', 'showRuntimeInfo')
    )
    .addToUi();
}

function showControlCenterHome() { return callRemote_('showControlCenter', ['scan'], true); }
function openSignalFeed() { return callRemote_('openSignalFeed', []); }
function openLeadInbox() { return callRemote_('openLeadInbox', []); }

function showSettingsDialog() { return callRemote_('showControlCenter', ['settings'], true); }
function showScanDialog() { return callRemote_('showControlCenter', ['scan'], true); }
function showAiDialog() { return callRemote_('showControlCenter', ['ai'], true); }
function showImportDialog() { return showSettingsDialog(); }
function analyzePendingPosts() { return callRemote_('analyzeNewPosts', []); }
function importJsonFiles(files) { return callRemote_('importJsonFiles', [files]); }
function syncPotentialCustomers() { return callRemote_('syncPotentialCustomers', []); }
function refreshCurrentData() { return callRemote_('refreshCurrentData', []); }
function auditDuplicates() { return callRemote_('auditDuplicates', []); }
function showRuntimeInfo() { return callRemote_('showRuntimeInfo', []); }
function apiBridgeConfigure() { return callRemote_('apiBridgeConfigure', []); }
function apiBridgeClearConfig() { return callRemote_('apiBridgeClearConfig', []); }
function apiBridgeTest() { return callRemote_('apiBridgeTest', []); }
function apiBridgeScanSelectedGroup() { return callRemote_('apiBridgeScanSelectedGroup', []); }
function apiBridgeFetchCommentsSelectedPost() { return callRemote_('apiBridgeFetchCommentsSelectedPost', []); }
function apiBridgeStatus() { return callRemote_('apiBridgeStatus', []); }

// Installable time-driven trigger entrypoint for Auto Monitor V2.
function autoMonitorTick() { return callRemote_('autoMonitorTick', []); }

// No-op target used only to verify ScriptApp trigger authorization.
// The probe trigger is created and deleted immediately; it never runs in normal flow.
function autoMonitorAuthProbe_() {}

function authorizeAutoMonitor() {
  const ui=SpreadsheetApp.getUi();
  let probe=null;
  try {
    // Accessing and mutating installable triggers forces Apps Script to request
    // https://www.googleapis.com/auth/script.scriptapp when the local manifest includes it.
    const existing=ScriptApp.getProjectTriggers();
    probe=ScriptApp.newTrigger('autoMonitorAuthProbe_')
      .timeBased()
      .after(60 * 1000)
      .create();
    ScriptApp.deleteTrigger(probe);
    probe=null;

    ui.alert(
      'AUTO MONITOR — QUYỀN ĐÃ SẴN SÀNG\n\n' +
      'ScriptApp: OK\n' +
      'Trigger probe: PASS\n' +
      'Existing project triggers: ' + existing.length + '\n\n' +
      'Bước tiếp theo: mở Control Center → TEST 1 CYCLE.'
    );
    return {ok:true,permissionOk:true,triggerProbe:true,existingTriggers:existing.length};
  } catch (err) {
    if (probe) {
      try { ScriptApp.deleteTrigger(probe); } catch (_) {}
    }
    const msg=String(err && err.message || err || '');
    ui.alert(
      'AUTO MONITOR — CHƯA ĐƯỢC CẤP QUYỀN\n\n' +
      'Project phải dùng appsscript.json Bootstrap V2.4 có scope:\n' +
      'https://www.googleapis.com/auth/script.scriptapp\n\n' +
      'Sau khi Save, chạy lại HỆ THỐNG → Cấp quyền AUTO MONITOR và chọn Review permissions → Allow.\n\n' +
      'Chi tiết: ' + msg
    );
    throw err;
  }
}

function githubForceUpdate() {
  const cache = CacheService.getScriptCache();
  cache.remove('SOCIAL_AIO_REMOTE_RUNTIME');
  cache.remove('SOCIAL_AIO_REMOTE_HTML');

  const app = loadRemoteApp_(true);
  const version = app.getVersion ? app.getVersion() : 'unknown';
  buildLocalMenu_();

  SpreadsheetApp.getUi().alert(
    'Đã tải RUNTIME mới nhất từ GitHub.\n' +
    'Runtime: ' + version + '\n' +
    'Bootstrap local: ' + BOOTSTRAP_VERSION + '\n\n' +
    'Control Center dùng atomic Runtime/UI refresh để tránh lệch cache/scope.\n' +
    'Auto Monitor V2 dùng trigger global autoMonitorTick().\n' +
    'Nếu AUTO_AUTH_REQUIRED: HỆ THỐNG → Cấp quyền AUTO MONITOR.\n' +
    'Lưu ý: runtime update không tự thay Code.gs/appsscript.json.'
  );
}

function callRemote_(functionName, args, freshUi) {
  // Control Center must load Runtime + HTML as one logical release. This prevents
  // a cached old UI from calling commands whose meaning changed in a newer runtime.
  if (freshUi === true) {
    const cache = CacheService.getScriptCache();
    cache.remove('SOCIAL_AIO_REMOTE_RUNTIME');
    cache.remove('SOCIAL_AIO_REMOTE_HTML');
  }
  const app = loadRemoteApp_(freshUi === true);
  if (!app || typeof app[functionName] !== 'function') {
    throw new Error('Runtime GitHub không có hàm: ' + functionName);
  }
  return app[functionName].apply(null, args || []);
}

function loadRemoteApp_(force) {
  const cache = CacheService.getScriptCache();
  const key = 'SOCIAL_AIO_REMOTE_RUNTIME';
  let code = force ? null : cache.get(key);

  if (!code) {
    code = fetchGithubText_(GITHUB_RUNTIME.RUNTIME_FILE, force);
    try { cache.put(key, code, GITHUB_RUNTIME.CACHE_SECONDS); } catch (_) {}
  }

  const app = eval(code + '\n;RemoteApp;');
  if (!app) throw new Error('Runtime GitHub không khởi tạo RemoteApp.');
  return app;
}

function getRemoteHtml_(force) {
  const cache = CacheService.getScriptCache();
  const key = 'SOCIAL_AIO_REMOTE_HTML';
  let html = force ? null : cache.get(key);

  if (!html) {
    html = fetchGithubText_(GITHUB_RUNTIME.HTML_FILE, force === true);
    try { cache.put(key, html, GITHUB_RUNTIME.CACHE_SECONDS); } catch (_) {}
  }
  return html;
}

function fetchGithubText_(fileName, bustCache) {
  const suffix = bustCache ? ('?t=' + Date.now()) : '';
  const url = GITHUB_RUNTIME.RAW_BASE.replace(/\/$/, '') + '/' + fileName + suffix;
  const res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true
  });

  const code = res.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('GitHub HTTP ' + code + ' khi tải ' + fileName);
  }
  return res.getContentText('UTF-8');
}
