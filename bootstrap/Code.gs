/**
 * SOCIAL AIO - Stable GitHub Bootstrap V2
 * onOpen chỉ dựng menu LOCAL, KHÔNG gọi UrlFetchApp.
 * Vì vậy menu luôn xuất hiện sau khi reload Sheet.
 * Remote runtime chỉ được tải khi người dùng bấm một menu item.
 */
const BOOTSTRAP_VERSION = '2.2-auto-monitor-v2';

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
        .addSeparator()
        .addItem('⚡ Cấp quyền & BẬT AUTO V2', 'enableAutoMonitorV2Menu')
        .addItem('Ⅱ TẮT AUTO V2', 'disableAutoMonitorV2Menu')
        .addItem('🧪 Nghiệm thu Production', 'runProductionAcceptanceMenu')
        .addSeparator()
        .addItem('ℹ Thông tin phiên bản', 'showRuntimeInfo')
    )
    .addToUi();
}

function showControlCenterHome() { return callRemote_('showControlCenter', ['scan']); }
function openSignalFeed() { return callRemote_('openSignalFeed', []); }
function openLeadInbox() { return callRemote_('openLeadInbox', []); }

function showSettingsDialog() { return callRemote_('showControlCenter', ['settings']); }
function showScanDialog() { return callRemote_('showControlCenter', ['scan']); }
function showAiDialog() { return callRemote_('showControlCenter', ['ai']); }
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

/**
 * Installable time-trigger entrypoint for Auto Monitor V2.
 * MUST stay global/local because Apps Script triggers cannot directly target
 * a function that only exists inside the remotely-evaluated Runtime object.
 */
function autoMonitorTick() {
  // Time-driven triggers have no guaranteed active spreadsheet context.
  // Bind the exact Sheet captured when AUTO MONITOR V2 was enabled.
  const id = String(
    PropertiesService.getDocumentProperties()
      .getProperty('SOCIAL_AIO_AUTO_MONITOR_SPREADSHEET_ID_V1') || ''
  ).trim();
  if (!id) throw new Error('AUTO MONITOR V2 thiếu Spreadsheet ID binding. Hãy mở Sheet và bật AUTO lại.');
  const ss = SpreadsheetApp.openById(id);
  SpreadsheetApp.setActiveSpreadsheet(ss);
  return callRemote_('autoMonitorTick', []);
}

function enableAutoMonitorV2Menu() {
  const result = callRemote_('setAutoMonitorV2Enabled_', [true, {commentEnabled:true}]);
  SpreadsheetApp.getUi().alert(
    'AUTO MONITOR V2: ' + (result && result.enabled ? 'ON' : 'OFF') +
    '\nTrigger: ' + (result && result.triggerInstalled ? 'OK' : 'MISSING') +
    '\nComment Intelligence: ' + (result && result.commentEnabled ? 'ON' : 'OFF') +
    '\n\n' + String(result && result.message || '')
  );
  return result;
}

function disableAutoMonitorV2Menu() {
  const result = callRemote_('setAutoMonitorV2Enabled_', [false, {commentEnabled:true}]);
  SpreadsheetApp.getUi().alert('AUTO MONITOR V2 đã tắt. Manual scan vẫn dùng bình thường.');
  return result;
}

function runProductionAcceptanceMenu() {
  const result = callRemote_('runProductionAcceptance_', [{repair:true}]);
  const checks = (result && result.checks) || [];
  const lines = checks.map(function(x) {
    return (x.pass ? 'PASS ' : 'FAIL ') + x.id + ' - ' + x.detail;
  });
  SpreadsheetApp.getUi().alert(
    (result && result.pass ? 'PRODUCTION ACCEPTANCE PASS' : 'PRODUCTION ACCEPTANCE CÒN GATE FAIL') +
    '\nRuntime: ' + (result && result.version || 'unknown') +
    '\n\n' + lines.join('\n') +
    '\n\nRepairs: duplicate=' +
      Number(result && result.repairs && result.repairs.duplicates && result.repairs.duplicates.repaired || 0) +
    ', stale-running=' +
      Number(result && result.repairs && result.repairs.staleRunning && result.repairs.staleRunning.repaired || 0)
  );
  return result;
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
    'Lưu ý: nút này KHÔNG tự thay Code.gs/bootstrap. ' +
    'Menu native được tạo bởi Code.gs đang cài trong Apps Script project.'
  );
}

function callRemote_(functionName, args) {
  const app = loadRemoteApp_(false);
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

function getRemoteHtml_() {
  const cache = CacheService.getScriptCache();
  const key = 'SOCIAL_AIO_REMOTE_HTML';
  let html = cache.get(key);

  if (!html) {
    html = fetchGithubText_(GITHUB_RUNTIME.HTML_FILE, false);
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
