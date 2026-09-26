/**
 * SOCIAL AIO - Stable GitHub Bootstrap V2
 * onOpen chỉ dựng menu LOCAL, KHÔNG gọi UrlFetchApp.
 * Vì vậy menu luôn xuất hiện sau khi reload Sheet.
 * Remote runtime chỉ được tải khi người dùng bấm một menu item.
 */
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
  ui.createMenu('SOCIAL AIO')
    .addItem('1. ⚙ CÀI ĐẶT', 'showSettingsDialog')
    .addItem('2. 🔎 QUÉT GROUP', 'showScanDialog')
    .addItem('3. 🤖 AI PHÂN TÍCH', 'showAiDialog')
    .addItem('4. 🔄 CẬP NHẬT DỮ LIỆU', 'refreshCurrentData')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('CÔNG CỤ')
        .addItem('Import JSON thủ công', 'showSettingsDialog')
        .addItem('Đồng bộ KH PASS', 'syncPotentialCustomers')
        .addItem('Kiểm tra bài trùng', 'auditDuplicates')
    )
    .addSubMenu(
      ui.createMenu('HỆ THỐNG')
        .addItem('Cập nhật runtime từ GitHub', 'githubForceUpdate')
        .addItem('Thông tin phiên bản', 'showRuntimeInfo')
        .addSeparator()
        .addItem('Bridge: TEST kết nối', 'apiBridgeTest')
        .addItem('Bridge: Trạng thái', 'apiBridgeStatus')
    )
    .addToUi();
}

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

function githubForceUpdate() {
  const cache = CacheService.getScriptCache();
  cache.remove('SOCIAL_AIO_REMOTE_RUNTIME');
  cache.remove('SOCIAL_AIO_REMOTE_HTML');

  const app = loadRemoteApp_(true);
  const version = app.getVersion ? app.getVersion() : 'unknown';
  buildLocalMenu_();

  SpreadsheetApp.getUi().alert(
    'Đã tải runtime mới nhất từ GitHub.\n' +
    'Phiên bản: ' + version + '\n\n' +
    'Không cần reload để menu xuất hiện.'
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
