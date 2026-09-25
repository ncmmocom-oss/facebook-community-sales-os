const RemoteApp = (() => {
  const CFG = {
    VERSION: '1.2.0',
    RAW_SHEET: 'NHẬP JSON',
    OPPORTUNITY_SHEET: 'CƠ HỘI',
    GROUP_SCAN_SHEET: 'QUÉT NHÓM',
    GROUP_SUMMARY_SHEET: 'NHÓM',
    LEAD_SHEET: 'KHÁCH HÀNG TIỀM NĂNG',
    COORDINATION_SHEET: 'ĐIỀU PHỐI',
  };

  function getVersion() { return CFG.VERSION; }

  function onOpen() {
    SpreadsheetApp.getUi()
      .createMenu('SOCIAL AIO')
      .addItem('Import JSON', 'showImportDialog')
      .addItem('CẬP NHẬT DỮ LIỆU', 'refreshCurrentData')
      .addSeparator()
      .addItem('Đồng bộ KH tiềm năng', 'syncPotentialCustomers')
      .addItem('Kiểm tra bài trùng', 'auditDuplicates')
      .addSeparator()
      .addItem('Cập nhật phiên bản từ GitHub', 'githubForceUpdate')
      .addItem('Thông tin phiên bản', 'showRuntimeInfo')
      .addToUi();
  }

  function showRuntimeInfo() {
    SpreadsheetApp.getUi().alert(
      'SOCIAL AIO Community Sales\n' +
      'Runtime: V' + CFG.VERSION + '\n' +
      'Nguồn code: GitHub\n' +
      'Nút CẬP NHẬT DỮ LIỆU chỉ đồng bộ/lọc trùng/làm mới bảng; không tự AI chấm Pain/Intent/Score.'
    );
  }

  function showImportDialog() {
    const html = HtmlService.createHtmlOutput(getRemoteHtml_())
      .setWidth(600)
      .setHeight(560);
    SpreadsheetApp.getUi().showModalDialog(html, 'Import JSON từ Social AIO');
  }

  function importJsonFiles(files) {
    if (!Array.isArray(files) || files.length === 0) throw new Error('Chưa chọn file JSON.');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawSheet = mustSheet_(ss, CFG.RAW_SHEET);
    const oppSheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);
    const groupSheet = mustSheet_(ss, CFG.GROUP_SCAN_SHEET);

    const existingKeys = loadExistingPostKeys_(rawSheet, oppSheet);
    const groupMap = loadGroupMap_(groupSheet);
    const rawRows = [];
    const oppRows = [];
    const groupStats = {};
    const errors = [];
    let duplicateCount = 0;
    let scannedCount = 0;

    files.forEach(file => {
      try {
        const parsed = JSON.parse(file.text || '[]');
        const posts = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.data) ? parsed.data : []);
        if (!posts.length) {
          errors.push(`${file.name}: không thấy danh sách bài viết.`);
          return;
        }

        const fileGroupKeys = [...new Set(posts.map(p => extractGroupKey_(p && p.url)).filter(Boolean))];
        const fileGroupKey = fileGroupKeys.length === 1 ? fileGroupKeys[0] : '';

        posts.forEach(post => {
          scannedCount += 1;
          const url = String(post.url || '').trim();
          const postId = normalizePostId_(post.post_id || post.id || '', url);
          if (!postId && !url) return;

          const groupKey = extractGroupKey_(url) || fileGroupKey;
          const groupInfo = groupMap[groupKey] || { name: `Group ${groupKey || 'không rõ'}`, row: null };

          if (groupKey) {
            if (!groupStats[groupKey]) {
              groupStats[groupKey] = { scanned: 0, newCount: 0, fileName: file.name || '', row: groupInfo.row };
            }
            groupStats[groupKey].scanned += 1;
            groupStats[groupKey].fileName = file.name || groupStats[groupKey].fileName;
          }

          const keys = makePostKeys_(postId, url);
          if (keys.some(k => existingKeys.has(k))) {
            duplicateCount += 1;
            return;
          }
          keys.forEach(k => existingKeys.add(k));

          const actor = post.actor || {};
          const authorName = String(actor.name || '');
          const authorUrl = String(actor.url || '');
          const message = String(post.message || post.title || post.summary || (post.content && post.content.text) || '');
          const comments = toNumber_(post.comments && post.comments.total);
          const reactions = toNumber_(post.reactions && post.reactions.total);
          const shares = toNumber_(post.shares && post.shares.total);
          const attachments = post.content && Array.isArray(post.content.attachments) ? post.content.attachments : [];
          const mediaCount = attachments.length;
          const postDate = post.creation_time ? new Date(Number(post.creation_time)) : new Date();
          const now = new Date();
          const resultText = `${comments} bình luận | ${reactions} reaction | ${shares} share`;

          rawRows.push([now, file.name || '', groupInfo.name, groupKey, postId, url, authorName, authorUrl, message, comments, reactions, shares, mediaCount, 'Chưa phân tích']);
          oppRows.push([postDate, postId, url, 'Bài viết', groupInfo.name, authorName, authorUrl, message, '', '', '', '', '', '', 'Chưa tương tác', '', '', 'Chưa có', resultText, 'Mới']);

          if (groupKey && groupStats[groupKey]) groupStats[groupKey].newCount += 1;
        });
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    });

    if (rawRows.length) {
      const rawStart = rawSheet.getLastRow() + 1;
      const oppStart = oppSheet.getLastRow() + 1;
      rawSheet.getRange(rawStart, 5, rawRows.length, 1).setNumberFormat('@');
      oppSheet.getRange(oppStart, 2, oppRows.length, 1).setNumberFormat('@');
      rawSheet.getRange(rawStart, 1, rawRows.length, 14).setValues(rawRows);
      oppSheet.getRange(oppStart, 1, oppRows.length, 20).setValues(oppRows);
    }

    updateGroupScanStatus_(groupSheet, groupStats);
    SpreadsheetApp.flush();
    return { version: CFG.VERSION, files: files.length, scanned: scannedCount, imported: rawRows.length, duplicates: duplicateCount, errors };
  }

  function refreshCurrentData() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawSheet = mustSheet_(ss, CFG.RAW_SHEET);
    const oppSheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);

    const rawFix = normalizeAndDedupeSheet_(rawSheet, { headerRows: 4, idCol: 5, urlCol: 6, totalCols: 14, preferComplete: false });
    const oppFix = normalizeAndDedupeSheet_(oppSheet, { headerRows: 1, idCol: 2, urlCol: 3, totalCols: 20, preferComplete: true });
    const leadStats = syncPotentialCustomers({ silent: true });
    const groupStats = refreshGroupSummary_();
    const queueStats = refreshCoordination_();
    SpreadsheetApp.flush();

    const result = {
      version: CFG.VERSION,
      rawRemoved: rawFix.removed,
      oppRemoved: oppFix.removed,
      repairedIds: rawFix.repairedIds + oppFix.repairedIds,
      leads: leadStats.count,
      groups: groupStats.groups,
      queue: queueStats.count,
    };

    SpreadsheetApp.getActive().toast(
      `V${CFG.VERSION} | Trùng xóa: ${result.rawRemoved + result.oppRemoved} | KH: ${result.leads} | Điều phối: ${result.queue}`,
      'CẬP NHẬT DỮ LIỆU',
      8
    );
    return result;
  }

  function auditDuplicates() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const raw = auditSheetDuplicates_(mustSheet_(ss, CFG.RAW_SHEET), 4, 5, 6);
    const opp = auditSheetDuplicates_(mustSheet_(ss, CFG.OPPORTUNITY_SHEET), 1, 2, 3);
    SpreadsheetApp.getUi().alert(
      `Kiểm tra lọc trùng - V${CFG.VERSION}\n` +
      `NHẬP JSON: ${raw.rows} dòng | ${raw.duplicateRows} dòng trùng\n` +
      `CƠ HỘI: ${opp.rows} dòng | ${opp.duplicateRows} dòng trùng`
    );
    return { raw, opp };
  }

  function syncPotentialCustomers(options) {
    const silent = options && options.silent;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const oppSheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);
    const leadSheet = mustSheet_(ss, CFG.LEAD_SHEET);

    const oppLast = oppSheet.getLastRow();
    const opp = oppLast >= 2 ? oppSheet.getRange(2, 1, oppLast - 1, 20).getValues() : [];
    const existing = loadExistingLeadState_(leadSheet);
    const grouped = {};

    opp.forEach(r => {
      const classification = String(r[11] || '').trim();
      if (classification !== 'Rất tiềm năng' && classification !== 'Tiềm năng') return;

      const sourceUrl = normalizeUrl_(r[2] || '');
      const fbUrl = normalizeFacebookProfileUrl_(r[6] || '');
      const key = fbUrl ? `FB|${fbUrl}` : `ANON|${sourceUrl}`;
      if (!key || key === 'ANON|') return;
      const score = Number(r[10] || 0);

      if (!grouped[key]) grouped[key] = { count: 0, best: r, bestScore: score };
      grouped[key].count += 1;
      if (score > grouped[key].bestScore) {
        grouped[key].best = r;
        grouped[key].bestScore = score;
      }
    });

    const output = Object.keys(grouped).map(key => {
      const g = grouped[key];
      const r = g.best;
      const old = existing[key] || {};
      return [
        r[5] || '', r[6] || '', r[4] || '', r[3] || '', r[2] || '', r[7] || '', r[8] || '', r[9] || '',
        Number(r[10] || 0), r[11] || '', g.count,
        old.lastAction || r[14] || '', old.nextAction || r[15] || '', old.followUp || r[16] || '',
        old.conversion || r[17] || 'Chưa có', old.note || ''
      ];
    }).sort((a, b) => Number(b[8] || 0) - Number(a[8] || 0));

    const oldLast = leadSheet.getLastRow();
    if (oldLast >= 2) leadSheet.getRange(2, 1, oldLast - 1, 16).clearContent();
    if (output.length) leadSheet.getRange(2, 1, output.length, 16).setValues(output);
    SpreadsheetApp.flush();

    if (!silent) SpreadsheetApp.getUi().alert(`Đã đồng bộ ${output.length} khách hàng tiềm năng.`);
    return { count: output.length };
  }

  function refreshGroupSummary_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const groupSheet = ss.getSheetByName(CFG.GROUP_SUMMARY_SHEET);
    const leadSheet = ss.getSheetByName(CFG.LEAD_SHEET);
    if (!groupSheet || !leadSheet) return { groups: 0 };

    const leadLast = leadSheet.getLastRow();
    const leads = leadLast >= 2 ? leadSheet.getRange(2, 1, leadLast - 1, 16).getValues() : [];
    const byGroup = {};
    leads.forEach(r => {
      const group = String(r[2] || '').trim();
      if (!group) return;
      if (!byGroup[group]) byGroup[group] = [];
      byGroup[group].push(r);
    });

    const last = groupSheet.getLastRow();
    if (last < 2) return { groups: 0 };
    const names = groupSheet.getRange(2, 1, last - 1, 1).getValues().flat();
    let touched = 0;
    names.forEach((name, i) => {
      const group = String(name || '').trim();
      if (!group) return;
      const list = (byGroup[group] || []).sort((a,b) => Number(b[8]||0)-Number(a[8]||0));
      const leadCount = list.length;
      const top = list.slice(0, 5).map(r => `${r[0]} (${Number(r[8] || 0)})`).join('\n');
      const sold = list.filter(r => String(r[14] || '').trim() === 'Đã bán').length;
      groupSheet.getRange(i + 2, 8, 1, 3).setValues([[leadCount, top, sold]]);
      touched += 1;
    });
    return { groups: touched };
  }

  function refreshCoordination_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const oppSheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);
    const outSheet = ss.getSheetByName(CFG.COORDINATION_SHEET);
    if (!outSheet) return { count: 0 };

    const last = oppSheet.getLastRow();
    const rows = last >= 2 ? oppSheet.getRange(2, 1, last - 1, 20).getValues() : [];
    const now = new Date(); now.setHours(23,59,59,999);
    const items = [];

    rows.forEach(r => {
      const score = Number(r[10] || 0);
      const cls = String(r[11] || '').trim();
      const status = String(r[19] || '').trim();
      const follow = r[16] instanceof Date ? r[16] : null;
      const due = follow && follow <= now;
      if (status === 'Đóng') return;
      if (!(score >= 60 || cls === 'Rất tiềm năng' || cls === 'Tiềm năng' || due)) return;
      const boost = due ? 1000 : 0;
      items.push({ rank: boost + score, row: [0, r[4] || '', r[5] || '', r[2] || '', score, status || 'Mới', r[15] || '', r[16] || ''] });
    });

    items.sort((a,b) => b.rank - a.rank);
    items.forEach((x,i) => x.row[0] = i + 1);
    const out = items.slice(0, 200).map(x => x.row);

    const oldLast = outSheet.getLastRow();
    if (oldLast >= 7) outSheet.getRange(7, 1, oldLast - 6, 8).clearContent();
    if (out.length) outSheet.getRange(7, 1, out.length, 8).setValues(out);
    return { count: out.length };
  }

  function normalizeAndDedupeSheet_(sheet, cfg) {
    const last = sheet.getLastRow();
    const dataStart = cfg.headerRows + 1;
    if (last < dataStart) return { removed: 0, repairedIds: 0, rows: 0 };

    const rows = sheet.getRange(dataStart, 1, last - cfg.headerRows, cfg.totalCols).getValues();
    const idIndex = cfg.idCol - 1;
    const urlIndex = cfg.urlCol - 1;
    let repairedIds = 0;

    rows.forEach(r => {
      const before = r[idIndex];
      const after = normalizePostId_(before, r[urlIndex]);
      if (String(before || '') !== String(after || '')) repairedIds += 1;
      r[idIndex] = after;
    });

    const groups = [];
    const keyToIndex = new Map();
    rows.forEach((r, idx) => {
      const keys = makePostKeys_(r[idIndex], r[urlIndex]);
      let target = -1;
      for (const k of keys) if (keyToIndex.has(k)) { target = keyToIndex.get(k); break; }
      if (target < 0) {
        target = groups.length;
        groups.push({ row: r, originalIndex: idx });
        keys.forEach(k => keyToIndex.set(k, target));
      } else if (cfg.preferComplete) {
        const current = groups[target].row;
        if (rowCompleteness_(r) > rowCompleteness_(current)) groups[target].row = mergeRows_(r, current);
        else groups[target].row = mergeRows_(current, r);
      }
    });

    const deduped = groups.map(g => g.row);
    const removed = rows.length - deduped.length;
    sheet.getRange(dataStart, 1, rows.length, cfg.totalCols).clearContent();
    if (deduped.length) {
      sheet.getRange(dataStart, cfg.idCol, deduped.length, 1).setNumberFormat('@');
      sheet.getRange(dataStart, 1, deduped.length, cfg.totalCols).setValues(deduped);
    }
    return { removed, repairedIds, rows: deduped.length };
  }

  function auditSheetDuplicates_(sheet, headerRows, idCol, urlCol) {
    const last = sheet.getLastRow();
    if (last <= headerRows) return { rows: 0, duplicateRows: 0 };
    const rows = sheet.getRange(headerRows + 1, 1, last - headerRows, Math.max(idCol, urlCol)).getValues();
    const seen = new Set();
    let dup = 0;
    rows.forEach(r => {
      const keys = makePostKeys_(normalizePostId_(r[idCol-1], r[urlCol-1]), r[urlCol-1]);
      if (keys.some(k => seen.has(k))) dup += 1;
      else keys.forEach(k => seen.add(k));
    });
    return { rows: rows.length, duplicateRows: dup };
  }

  function rowCompleteness_(r) {
    return r.reduce((n,v) => n + ((v !== '' && v !== null && v !== undefined) ? 1 : 0), 0);
  }

  function mergeRows_(primary, secondary) {
    return primary.map((v,i) => (v !== '' && v !== null && v !== undefined) ? v : secondary[i]);
  }

  function loadExistingLeadState_(leadSheet) {
    const state = {};
    const last = leadSheet.getLastRow();
    if (last < 2) return state;
    const rows = leadSheet.getRange(2, 1, last - 1, 16).getValues();
    rows.forEach(r => {
      const sourceUrl = normalizeUrl_(r[4] || '');
      const fbUrl = normalizeFacebookProfileUrl_(r[1] || '');
      const key = fbUrl ? `FB|${fbUrl}` : `ANON|${sourceUrl}`;
      if (!key || key === 'ANON|') return;
      state[key] = { lastAction: r[11] || '', nextAction: r[12] || '', followUp: r[13] || '', conversion: r[14] || '', note: r[15] || '' };
    });
    return state;
  }

  function loadExistingPostKeys_(rawSheet, oppSheet) {
    const keys = new Set();
    const rawLast = rawSheet.getLastRow();
    if (rawLast >= 5) {
      rawSheet.getRange(5, 5, rawLast - 4, 2).getValues().forEach(r => makePostKeys_(normalizePostId_(r[0], r[1]), r[1]).forEach(k => keys.add(k)));
    }
    const oppLast = oppSheet.getLastRow();
    if (oppLast >= 2) {
      oppSheet.getRange(2, 2, oppLast - 1, 2).getValues().forEach(r => makePostKeys_(normalizePostId_(r[0], r[1]), r[1]).forEach(k => keys.add(k)));
    }
    return keys;
  }

  function makePostKeys_(postId, url) {
    const out = [];
    const id = String(postId || '').trim();
    const normalizedUrl = normalizeUrl_(url);
    if (id) out.push(`ID|${id}`);
    if (normalizedUrl) out.push(`URL|${normalizedUrl}`);
    return out;
  }

  function normalizePostId_(value, url) {
    if (typeof value === 'number') {
      const fromUrl = extractPostIdFromUrl_(url);
      if (fromUrl) return fromUrl;
      if (Number.isSafeInteger(value)) return String(value);
      return String(Math.trunc(value));
    }
    const s = String(value || '').trim();
    if (s && !/[eE][+-]?\d+/.test(s)) return s.replace(/^'+/, '');
    const fromUrl = extractPostIdFromUrl_(url);
    return fromUrl || s.replace(/[\s,]/g, '');
  }

  function extractPostIdFromUrl_(url) {
    const s = String(url || '');
    let m = s.match(/\/permalink\/(\d+)/i);
    if (m) return m[1];
    m = s.match(/[?&]story_fbid=(\d+)/i);
    return m ? m[1] : '';
  }

  function loadGroupMap_(sheet) {
    const map = {};
    const last = sheet.getLastRow();
    if (last < 2) return map;
    const values = sheet.getRange(2, 1, last - 1, 16).getDisplayValues();
    values.forEach((r, i) => {
      const active = r[0], name = r[2], url = r[3];
      const explicitId = String(r[4] || '').trim().toLowerCase();
      const urlKey = extractGroupKey_(url);
      const info = { name: name || `Group ${explicitId || urlKey}`, row: i + 2, active };
      if (explicitId) map[explicitId] = info;
      if (urlKey) map[urlKey] = info;
    });
    return map;
  }

  function updateGroupScanStatus_(sheet, stats) {
    const now = new Date();
    Object.keys(stats).forEach(groupKey => {
      const s = stats[groupKey];
      if (!s.row) return;
      sheet.getRange(s.row, 10).setValue(now);
      sheet.getRange(s.row, 13).setValue(s.fileName);
      sheet.getRange(s.row, 14).setValue(s.newCount || 0);
    });
  }

  function extractGroupKey_(url) {
    const m = String(url || '').match(/facebook\.com\/groups\/([^\/?#]+)/i);
    return m ? decodeURIComponent(m[1]).trim().toLowerCase() : '';
  }

  function normalizeUrl_(url) {
    return String(url || '').trim().replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();
  }

  function normalizeFacebookProfileUrl_(url) {
    let s = String(url || '').trim();
    if (!s) return '';
    try {
      const u = new URL(s);
      const host = u.hostname.toLowerCase().replace(/^www\./, '');
      if (host !== 'facebook.com' && !host.endsWith('.facebook.com')) return normalizeUrl_(s);
      const id = u.searchParams.get('id');
      if (/\/profile\.php$/i.test(u.pathname) && id) return `facebook.com/profile.php?id=${id}`;
      const userMatch = u.pathname.match(/\/groups\/[^/]+\/user\/(\d+)/i);
      if (userMatch) return `facebook.com/user/${userMatch[1]}`;
      return `facebook.com${u.pathname}`.replace(/\/+$/, '').toLowerCase();
    } catch (e) {
      return normalizeUrl_(s);
    }
  }

  function toNumber_(value) {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n : 0;
  }

  function mustSheet_(ss, name) {
    const s = ss.getSheetByName(name);
    if (!s) throw new Error('Thiếu sheet ' + name + '.');
    return s;
  }

  return {
    getVersion,
    onOpen,
    showRuntimeInfo,
    showImportDialog,
    importJsonFiles,
    refreshCurrentData,
    syncPotentialCustomers,
    auditDuplicates,
  };
})();
