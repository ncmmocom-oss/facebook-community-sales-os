const RemoteApp = (() => {
  const CFG = {
    VERSION: '1.7.0',
    RAW_SHEET: 'NHẬP JSON',
    OPPORTUNITY_SHEET: 'CƠ HỘI',
    GROUP_SCAN_SHEET: 'QUÉT NHÓM',
    GROUP_SUMMARY_SHEET: 'NHÓM',
    LEAD_SHEET: 'KHÁCH HÀNG TIỀM NĂNG',
    COORDINATION_SHEET: 'ĐIỀU PHỐI',
    AI_LOG_SHEET: 'NHẬT KÝ AI',
    COMMENT_SHEET: 'BÌNH LUẬN',
    PERSON_TIMELINE_SHEET: 'LỊCH SỬ KH',
    IMPORT_LOG_SHEET: 'NHẬT KÝ IMPORT',
    DAILY_STATS_SHEET: 'THỐNG KÊ NGÀY',
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
      'V1.7.0: Daily Metrics + Import Log + Nested Comment Intake + Media URLs + Fast Sync + Token Saver.\nAPI key được lưu trong Script Properties, không lưu trong Sheet hoặc GitHub.'
    );
  }

  function showImportDialog() {
    const html = HtmlService.createHtmlOutput(getRemoteHtml_())
      .setWidth(680)
      .setHeight(720);
    SpreadsheetApp.getUi().showModalDialog(html, 'Import JSON từ Social AIO');
  }

  function importJsonFiles(files) {
    if (Array.isArray(files) && files.length === 1 && files[0] && files[0].__command) {
      return handleUiCommand_(files[0]);
    }
    if (!Array.isArray(files) || files.length === 0) throw new Error('Chưa chọn file JSON.');

    const startedMs = Date.now();
    const importRunId = Utilities.getUuid().slice(0, 8);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureV16Sheets_();

    const rawSheet = mustSheet_(ss, CFG.RAW_SHEET);
    const oppSheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);
    const groupSheet = mustSheet_(ss, CFG.GROUP_SCAN_SHEET);
    const commentSheet = mustSheet_(ss, CFG.COMMENT_SHEET);

    const existingPostKeys = loadExistingPostKeys_(rawSheet, oppSheet);
    const existingCommentKeys = loadExistingCommentKeys_(commentSheet, oppSheet);
    const groupMap = loadGroupMap_(groupSheet);
    const postLookup = loadPostContext_(oppSheet);

    const rawRows = [];
    const commentRows = [];
    const oppRows = [];
    const groupStats = {};
    const errors = [];
    let duplicateCount = 0;
    let postScanned = 0;
    let commentScanned = 0;
    let postImported = 0;
    let commentImported = 0;

    const ctx = {
      rawRows, commentRows, oppRows, groupStats, groupMap, groupSheet,
      existingCommentKeys, postLookup
    };

    files.forEach(file => {
      try {
        const parsed = JSON.parse(file.text || '[]');
        const kind = detectJsonKind_(file.name || '', parsed);

        if (kind === 'comments') {
          const comments = extractCommentRecords_(parsed, file.name || '');
          if (!comments.length) {
            errors.push(`${file.name}: nhận diện comment JSON nhưng không bóc được comment record.`);
            return;
          }
          comments.forEach(item => {
            const x = ingestCommentRecord_(item, file.name || '', ctx);
            commentScanned += x.scanned;
            commentImported += x.imported;
            duplicateCount += x.duplicate;
          });
          return;
        }

        const posts = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.data) ? parsed.data : []);
        if (!posts.length) {
          errors.push(`${file.name}: không thấy danh sách bài viết.`);
          return;
        }

        const fileGroupKeys = [...new Set(posts.map(p => extractGroupKey_(p && (p.url || p.permalink_url))).filter(Boolean))];
        const fileGroupKey = fileGroupKeys.length === 1 ? fileGroupKeys[0] : '';

        posts.forEach(post => {
          postScanned += 1;
          const url = String(post.url || post.permalink_url || post.permalink || '').trim();
          const postId = normalizePostId_(post.post_id || post.postId || post.id || '', url);
          if (!postId && !url) return;

          const groupKey = extractGroupKey_(url) || String(post.group_id || post.groupId || '').trim().toLowerCase() || fileGroupKey;
          if (groupKey && !groupMap[groupKey]) groupMap[groupKey] = ensureGroupRegistered_(groupSheet, groupKey);
          const groupInfo = groupMap[groupKey] || { name:`Group ${groupKey || 'không rõ'}`, row:null };
          const stat = touchGroupStat_(groupStats, groupKey, groupInfo, file.name || '');
          stat.postScanned += 1;

          const actor = post.actor || post.author || post.user || {};
          const authorName = String(actor.name || post.author_name || '');
          const authorUrl = String(actor.url || actor.profile_url || post.author_url || '');
          const message = String(post.message || post.title || post.summary || (post.content && post.content.text) || post.text || '');
          const commentsCount = toNumber_(post.comments && post.comments.total !== undefined ? post.comments.total : (post.comments_count || post.comment_count));
          const reactions = toNumber_(post.reactions && post.reactions.total !== undefined ? post.reactions.total : (post.reactions_count || post.reaction_count));
          const shares = toNumber_(post.shares && post.shares.total !== undefined ? post.shares.total : (post.shares_count || post.share_count));
          const mediaUrls = extractMediaUrls_(post);
          const postDate = toDate_(post.creation_time || post.created_time || post.createdAt || post.created_at) || new Date();
          const now = new Date();
          const resultText = `${commentsCount} bình luận | ${reactions} reaction | ${shares} share`;

          postLookup[postId] = { url, group:groupInfo.name, groupKey, content:message, media:mediaUrls.join('\n') };

          const keys = makePostKeys_(postId, url);
          const isDup = keys.some(k => existingPostKeys.has(k));
          if (isDup) {
            duplicateCount += 1;
            stat.duplicates += 1;
          } else {
            keys.forEach(k => existingPostKeys.add(k));
            rawRows.push([
              now,file.name || '',groupInfo.name,groupKey,postId,url,authorName,authorUrl,message,
              commentsCount,reactions,shares,mediaUrls.length,'Chờ AI',mediaUrls.join('\n'),mediaUrls.length
            ]);
            oppRows.push([
              postDate,postId,url,'Bài viết',groupInfo.name,authorName,authorUrl,message,
              '','','','','','','Chưa tương tác','','','Chưa có',resultText,'Mới',mediaUrls.join('\n')
            ]);
            postImported += 1;
            stat.postNew += 1;
          }

          // Social AIO can embed actual comments inside a posts JSON. Always inspect
          // nested comments even when the post itself is already a duplicate.
          const nested = extractCommentRecords_(post, file.name || '');
          nested.forEach(item => {
            const x = ingestCommentRecord_(item, file.name || '', ctx, {
              postId, postUrl:url, groupKey, groupName:groupInfo.name
            });
            commentScanned += x.scanned;
            commentImported += x.imported;
            duplicateCount += x.duplicate;
          });
        });
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    });

    writeRowsNewestFirst_(rawSheet, 5, rawRows, 16, [5]);
    writeRowsNewestFirst_(commentSheet, 2, commentRows, 23, [5,7]);
    writeRowsNewestFirst_(oppSheet, 2, oppRows, 21, [2]);

    finalizeGroupStats_(groupStats);
    updateGroupScanStatus_(groupSheet, groupStats);
    logImportRun_(importRunId, groupStats, files.length, Date.now() - startedMs, errors);

    // Keep import latency low: commit data first, then let the dialog start AI
    // in a second asynchronous Apps Script call when autoAnalyze is enabled.
    const aiCfg = getAiConfig_();
    const autoAnalyzeRequested = !!(aiCfg.autoAnalyze && aiCfg.configured && oppRows.length);
    const refresh = refreshCurrentData({ silent:true, fast:true });
    SpreadsheetApp.flush();

    return {
      version: CFG.VERSION,
      runId: importRunId,
      files: files.length,
      scanned: postScanned + commentScanned,
      postScanned,
      commentScanned,
      imported: postImported + commentImported,
      postImported,
      commentImported,
      duplicates: duplicateCount,
      durationMs: Date.now() - startedMs,
      errors,
      autoAnalyzeRequested,
      refresh
    };
  }

  function touchGroupStat_(stats, groupKey, groupInfo, fileName) {
    const key = String(groupKey || '__unknown__').toLowerCase();
    if (!stats[key]) {
      stats[key] = {
        key,
        name: groupInfo && groupInfo.name ? groupInfo.name : (groupKey ? 'Group ' + groupKey : 'Group không rõ'),
        row: groupInfo && groupInfo.row ? groupInfo.row : null,
        files: {},
        fileName: '',
        scanned: 0,
        newCount: 0,
        postScanned: 0,
        commentScanned: 0,
        postNew: 0,
        commentNew: 0,
        duplicates: 0
      };
    }
    const s = stats[key];
    if (fileName) {
      s.files[fileName] = true;
      s.fileName = fileName;
    }
    return s;
  }

  function finalizeGroupStats_(stats) {
    Object.keys(stats).forEach(k => {
      const s = stats[k];
      s.scanned = Number(s.postScanned || 0) + Number(s.commentScanned || 0);
      s.newCount = Number(s.postNew || 0) + Number(s.commentNew || 0);
    });
  }

  function ingestCommentRecord_(item, fileName, ctx, fallback) {
    const n = normalizeCommentRecord_(item.record, item.parentId, fileName, ctx.postLookup);
    if (!n.message) return { scanned:1, imported:0, duplicate:0 };

    if (fallback) {
      n.postId = n.postId || fallback.postId || '';
      n.postUrl = n.postUrl || fallback.postUrl || '';
      n.groupKey = n.groupKey || fallback.groupKey || '';
      n.groupName = n.groupName || fallback.groupName || '';
    }

    let groupKey = String(n.groupKey || '').toLowerCase();
    if (groupKey && !ctx.groupMap[groupKey]) ctx.groupMap[groupKey] = ensureGroupRegistered_(ctx.groupSheet, groupKey);
    const groupInfo = ctx.groupMap[groupKey] || { name:n.groupName || `Group ${groupKey || 'không rõ'}`, row:null };
    const groupName = n.groupName || groupInfo.name;
    const stat = touchGroupStat_(ctx.groupStats, groupKey, groupInfo, fileName);
    stat.commentScanned += 1;

    const commentId = n.commentId || stableId_([n.postId,n.authorUrl,n.authorName,n.message,n.createdAt].join('|'));
    const sourceId = 'C:' + commentId;
    const keys = makeCommentKeys_(commentId, n.commentUrl);
    if (keys.some(k => ctx.existingCommentKeys.has(k))) {
      stat.duplicates += 1;
      return { scanned:1, imported:0, duplicate:1 };
    }
    keys.forEach(k => ctx.existingCommentKeys.add(k));

    const postCtx = n.postId && ctx.postLookup[n.postId] ? ctx.postLookup[n.postId] : null;
    const postUrl = n.postUrl || (postCtx ? postCtx.url : '');
    const commentUrl = n.commentUrl || postUrl;
    let evidence = n.message;
    if (postCtx && postCtx.content) {
      evidence += '\n\n[Ngữ cảnh bài gốc]\n' + String(postCtx.content).slice(0, 900);
    }

    const mediaUrls = extractMediaUrls_(item.record);
    const now = new Date();
    const eventDate = n.createdAt || now;
    const resultText = `${n.reactions} reaction | ${n.replies} reply` + (n.postId ? ` | Post ID ${n.postId}` : '');

    ctx.commentRows.push([
      now,fileName || '',groupName,groupKey,n.postId,postUrl,commentId,commentUrl,n.parentId || '',
      n.authorName,n.authorUrl,n.message,eventDate,n.reactions,n.replies,
      '','','','','','','Chờ AI',mediaUrls.join('\n')
    ]);

    ctx.oppRows.push([
      eventDate,sourceId,commentUrl,'Bình luận',groupName,n.authorName,n.authorUrl,evidence,
      '','','','','','','Chưa tương tác','','','Chưa có',resultText,'Mới',mediaUrls.join('\n')
    ]);

    stat.commentNew += 1;
    return { scanned:1, imported:1, duplicate:0 };
  }

  function extractMediaUrls_(obj) {
    const out = [];
    const seen = {};
    const mediaKey = /media|image|photo|video|thumbnail|picture|src|uri|playable|attachment/i;
    const mediaUrl = /fbcdn|scontent|\.jpe?g(?:\?|$)|\.png(?:\?|$)|\.webp(?:\?|$)|\.gif(?:\?|$)|\.mp4(?:\?|$)|\.mov(?:\?|$)|\.m3u8(?:\?|$)/i;

    const add = s => {
      s = String(s || '').trim();
      if (!/^https?:\/\//i.test(s) || seen[s]) return;
      if (!(mediaUrl.test(s))) return;
      seen[s] = true;
      if (out.length < 12) out.push(s);
    };

    const walk = (v, keyHint, depth) => {
      if (depth > 7 || v === null || v === undefined || out.length >= 12) return;
      if (typeof v === 'string') {
        if (mediaKey.test(String(keyHint || '')) || mediaUrl.test(v)) add(v);
        return;
      }
      if (Array.isArray(v)) {
        v.forEach(x => walk(x,keyHint,depth+1));
        return;
      }
      if (typeof v === 'object') {
        Object.keys(v).forEach(k => walk(v[k],k,depth+1));
      }
    };
    walk(obj,'',0);
    return out;
  }

  function writeRowsNewestFirst_(sheet, startRow, rows, totalCols, textCols) {
    if (!rows || !rows.length) return;
    sheet.insertRowsBefore(startRow, rows.length);
    sheet.setRowHeights(startRow, rows.length, 42);
    const range = sheet.getRange(startRow,1,rows.length,totalCols);
    range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    range.setVerticalAlignment('middle');
    (textCols || []).forEach(col => sheet.getRange(startRow,col,rows.length,1).setNumberFormat('@'));
    range.setValues(rows);
  }

  function logImportRun_(runId, groupStats, fileCount, durationMs, errors) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = mustSheet_(ss, CFG.IMPORT_LOG_SHEET);
    const now = new Date();
    const rows = [];

    Object.keys(groupStats).forEach(k => {
      const s = groupStats[k];
      rows.push([
        now,runId,s.name || '',k === '__unknown__' ? '' : k,Object.keys(s.files || {}).join('\n'),
        fileCount,s.scanned || 0,s.postScanned || 0,s.commentScanned || 0,s.postNew || 0,s.commentNew || 0,
        s.duplicates || 0,s.postScanned || 0,durationMs,
        errors && errors.length ? 'CÓ LỖI' : ((s.postNew||0)+(s.commentNew||0) ? 'CÓ DỮ LIỆU MỚI' : 'KHÔNG CÓ MỚI'),
        CFG.VERSION,(errors || []).join(' | ').slice(0,2500),''
      ]);
    });

    if (!rows.length) {
      rows.push([now,runId,'','','',fileCount,0,0,0,0,0,0,0,durationMs,errors.length?'CÓ LỖI':'KHÔNG CÓ MỚI',CFG.VERSION,(errors||[]).join(' | ').slice(0,2500),'']);
    }
    writeRowsNewestFirst_(sheet,2,rows,18,[]);
  }

  function dateKey_(value) {
    const d = value instanceof Date ? value : toDate_(value);
    if (!d || isNaN(d.getTime())) return '';
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  function refreshDailyStats_() {
    ensureV16Sheets_();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = mustSheet_(ss,CFG.IMPORT_LOG_SHEET);
    const statSheet = mustSheet_(ss,CFG.DAILY_STATS_SHEET);
    const scanSheet = mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    const oppSheet = mustSheet_(ss,CFG.OPPORTUNITY_SHEET);
    const leadSheet = mustSheet_(ss,CFG.LEAD_SHEET);
    const today = dateKey_(new Date());

    const scanRows = scanSheet.getLastRow()>=2 ? scanSheet.getRange(2,1,scanSheet.getLastRow()-1,22).getValues() : [];
    const registry = {};
    scanRows.forEach((r,i)=>{
      const id=String(r[4]||'').toLowerCase();
      const name=String(r[2]||'').trim();
      if(id||name) registry[id||name]={id,name,row:i+2};
    });

    const agg = {};
    const logRows = logSheet.getLastRow()>=2 ? logSheet.getRange(2,1,logSheet.getLastRow()-1,18).getValues() : [];
    logRows.forEach(r=>{
      if(dateKey_(r[0])!==today) return;
      const id=String(r[3]||'').toLowerCase();
      const name=String(r[2]||'').trim();
      const key=id||name||'__unknown__';
      if(!agg[key]) agg[key]={id,name,runs:{},records:0,postScanned:0,commentScanned:0,postNew:0,commentNew:0,dup:0,maxPost:0,lastTime:null,lastRecords:0,lastPost:0};
      const a=agg[key];
      a.runs[String(r[1]||'')]=true;
      a.records+=Number(r[6]||0); a.postScanned+=Number(r[7]||0); a.commentScanned+=Number(r[8]||0);
      a.postNew+=Number(r[9]||0); a.commentNew+=Number(r[10]||0); a.dup+=Number(r[11]||0);
      a.maxPost=Math.max(a.maxPost,Number(r[12]||0));
      const t=r[0] instanceof Date?r[0]:toDate_(r[0]);
      if(t && (!a.lastTime || t>a.lastTime)){a.lastTime=t;a.lastRecords=Number(r[6]||0);a.lastPost=Number(r[7]||0);}
    });

    const current={};
    const oppRows=oppSheet.getLastRow()>=2 ? oppSheet.getRange(2,1,oppSheet.getLastRow()-1,21).getValues() : [];
    oppRows.forEach(r=>{
      const name=String(r[4]||'').trim();
      if(!name) return;
      if(!current[name]) current[name]={posts:0,comments:0};
      if(String(r[3]||'')==='Bình luận') current[name].comments++; else current[name].posts++;
    });

    const leadNow={};
    const leadNew={};
    const leadRows=leadSheet.getLastRow()>=2 ? leadSheet.getRange(2,1,leadSheet.getLastRow()-1,17).getValues() : [];
    leadRows.forEach(r=>{
      const name=String(r[2]||'').trim();
      if(!name) return;
      leadNow[name]=(leadNow[name]||0)+1;
      if(dateKey_(r[16])===today) leadNew[name]=(leadNew[name]||0)+1;
    });

    const todayRows=[];
    scanRows.forEach((r,i)=>{
      const id=String(r[4]||'').toLowerCase();
      const name=String(r[2]||'').trim();
      if(!name) return;
      const a=agg[id]||agg[name]||{runs:{},records:0,postScanned:0,commentScanned:0,postNew:0,commentNew:0,dup:0,maxPost:0,lastTime:null,lastRecords:0,lastPost:0};
      const cur=current[name]||{posts:0,comments:0};
      const newLead=leadNew[name]||0;
      const status=newLead>0?'CÓ KH MỚI':((a.postNew+a.commentNew)>0?'CÓ DỮ LIỆU MỚI':(Object.keys(a.runs).length?'KHÔNG CÓ MỚI':'CHƯA QUÉT'));
      const note=(Object.keys(a.runs).length && (a.postNew+a.commentNew)===0 && (a.postScanned+a.commentScanned)>0)?'Dữ liệu quét hôm nay đều đã có/trùng':'';
      todayRows.push([
        new Date(),name,id,Object.keys(a.runs).length,a.records,a.postScanned,a.commentScanned,a.postNew,a.commentNew,a.dup,
        a.maxPost,cur.posts,cur.comments,newLead,leadNow[name]||0,a.lastTime||'',status,note
      ]);
      scanRows[i][16]=Object.keys(a.runs).length;
      scanRows[i][17]=a.lastRecords||0;
      scanRows[i][18]=a.lastPost||0;
      scanRows[i][19]=a.postNew||0;
      scanRows[i][20]=a.commentNew||0;
      scanRows[i][21]=newLead;
    });

    const old = statSheet.getLastRow()>=2 ? statSheet.getRange(2,1,statSheet.getLastRow()-1,18).getValues() : [];
    const history = old.filter(r=>dateKey_(r[0])!==today);
    const output=todayRows.concat(history);
    if(statSheet.getLastRow()>=2) statSheet.getRange(2,1,statSheet.getLastRow()-1,18).clearContent();
    if(output.length) statSheet.getRange(2,1,output.length,18).setValues(output);
    if(scanRows.length) scanSheet.getRange(2,17,scanRows.length,6).setValues(scanRows.map(r=>r.slice(16,22)));
    return {rows:todayRows.length,today};
  }

  function auditConsistency_() {
    ensureV16Sheets_();
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const raw=mustSheet_(ss,CFG.RAW_SHEET);
    const comments=mustSheet_(ss,CFG.COMMENT_SHEET);
    const opp=mustSheet_(ss,CFG.OPPORTUNITY_SHEET);
    const lead=mustSheet_(ss,CFG.LEAD_SHEET);
    const scan=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);

    const rawIds=new Set();
    if(raw.getLastRow()>=5) raw.getRange(5,5,raw.getLastRow()-4,1).getDisplayValues().forEach(r=>{if(r[0])rawIds.add(String(r[0]));});
    const commentIds=new Set();
    if(comments.getLastRow()>=2) comments.getRange(2,7,comments.getLastRow()-1,1).getDisplayValues().forEach(r=>{if(r[0])commentIds.add(String(r[0]));});

    const oppPost=new Set(), oppComment=new Set(), oppUrls=new Set(), oppGroups=new Set();
    if(opp.getLastRow()>=2) opp.getRange(2,1,opp.getLastRow()-1,21).getValues().forEach(r=>{
      const id=String(r[1]||'');
      if(String(r[3]||'')==='Bình luận') oppComment.add(id.replace(/^C:/,''));
      else if(id) oppPost.add(id);
      if(r[2]) oppUrls.add(normalizeUrl_(r[2]));
      if(r[4]) oppGroups.add(String(r[4]));
    });

    const registry=new Set();
    if(scan.getLastRow()>=2) scan.getRange(2,3,scan.getLastRow()-1,1).getDisplayValues().forEach(r=>{if(r[0])registry.add(String(r[0]));});

    let leadMissing=0;
    if(lead.getLastRow()>=2) lead.getRange(2,1,lead.getLastRow()-1,17).getValues().forEach(r=>{
      if(r[4] && !oppUrls.has(normalizeUrl_(r[4]))) leadMissing++;
    });

    const result={
      version:CFG.VERSION,
      rawPosts:rawIds.size,
      commentRows:commentIds.size,
      opportunityPosts:oppPost.size,
      opportunityComments:oppComment.size,
      rawWithoutOpportunity:[...rawIds].filter(x=>!oppPost.has(x)).length,
      opportunityPostWithoutRaw:[...oppPost].filter(x=>!rawIds.has(x)).length,
      commentsWithoutOpportunity:[...commentIds].filter(x=>!oppComment.has(x)).length,
      opportunityCommentsWithoutRaw:[...oppComment].filter(x=>!commentIds.has(x)).length,
      unknownGroups:[...oppGroups].filter(x=>x!=='Group không rõ'&&!registry.has(x)).length,
      leadsWithoutEvidence:leadMissing
    };
    result.ok = !result.rawWithoutOpportunity && !result.opportunityPostWithoutRaw &&
      !result.commentsWithoutOpportunity && !result.opportunityCommentsWithoutRaw &&
      !result.unknownGroups && !result.leadsWithoutEvidence;
    return result;
  }

  function detectJsonKind_(fileName, parsed) {
    const name = String(fileName || '').toLowerCase();
    if (/comment|reply|repl(y|ies)|binh.?luan/i.test(name)) return 'comments';
    if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.comments)) return 'comments';
    const sample = Array.isArray(parsed) ? parsed.slice(0,5) : (parsed && Array.isArray(parsed.data) ? parsed.data.slice(0,5) : []);
    if (sample.some(x => looksLikeComment_(x))) return 'comments';
    return 'posts';
  }

  function looksLikeComment_(o) {
    if (!o || typeof o !== 'object') return false;
    if (o.comment_id || o.commentId || o.parent_comment_id || o.parentCommentId || o.reply_count || o.replies_count) return true;
    const u = String(o.comment_url || o.permalink_url || o.url || '');
    if (/comment_id=|\/comments?\/|\/comment\//i.test(u)) return true;
    return false;
  }

  function extractCommentRecords_(parsed, fileName) {
    let roots = [];
    if (Array.isArray(parsed)) roots = parsed;
    else if (parsed && Array.isArray(parsed.comments)) roots = parsed.comments;
    else if (parsed && Array.isArray(parsed.data)) roots = parsed.data;
    else if (parsed && typeof parsed === 'object') roots = [parsed];

    const out = [];
    const visited = [];
    const forceRootComment = /comment|reply/i.test(String(fileName || ''));

    const walk = (obj, parentCommentId, forceComment, depth) => {
      if (!obj || typeof obj !== 'object' || depth > 8) return;
      if (visited.indexOf(obj) >= 0) return;
      visited.push(obj);

      const isComment = !!forceComment || looksLikeComment_(obj);
      const cid = isComment ? String(pickPath_(obj,['comment_id','commentId','id']) || '') : '';

      if (isComment) {
        out.push({
          record:obj,
          parentId: parentCommentId || pickPath_(obj,['parent_comment_id','parentCommentId','parent.id']) || ''
        });
      }

      Object.keys(obj).forEach(key => {
        if (!/comment|repl(?:y|ies)|children/i.test(key)) return;
        let child = obj[key];
        if (child && !Array.isArray(child) && Array.isArray(child.data)) child = child.data;
        if (child && !Array.isArray(child) && Array.isArray(child.items)) child = child.items;
        if (Array.isArray(child)) {
          child.forEach(x => walk(x, isComment ? cid : parentCommentId, true, depth+1));
        } else if (child && typeof child === 'object' && !('total' in child && Object.keys(child).length <= 2)) {
          walk(child, isComment ? cid : parentCommentId, false, depth+1);
        }
      });
    };

    roots.forEach(x => walk(x,'',forceRootComment,0));
    return out;
  }

  function pickPath_(obj, paths) {
    for (const p of paths) {
      const parts = String(p).split('.');
      let cur = obj;
      let ok = true;
      for (const part of parts) {
        if (cur == null || typeof cur !== 'object' || !(part in cur)) { ok=false; break; }
        cur = cur[part];
      }
      if (ok && cur !== undefined && cur !== null && cur !== '') return cur;
    }
    return '';
  }

  function normalizeCommentRecord_(o, parentId, fileName, postLookup) {
    const author = pickPath_(o,['actor','author','user','commenter','owner']) || {};
    const commentUrl = String(pickPath_(o,['comment_url','commentUrl','permalink_url','permalink','url']) || '').trim();
    let postUrl = String(pickPath_(o,['post_url','postUrl','post.permalink_url','post.url','target.url']) || '').trim();
    let postId = String(pickPath_(o,['post_id','postId','post.id','target_id','feedback.target_id']) || '').trim();
    if (!postId) postId = extractPostIdFromUrl_(postUrl || commentUrl);
    if (postId && postLookup[postId]) postUrl = postUrl || postLookup[postId].url;

    const explicitGroup = String(pickPath_(o,['group_id','groupId','group.id']) || '').trim().toLowerCase();
    const groupKey = explicitGroup || extractGroupKey_(postUrl) || extractGroupKey_(commentUrl) ||
      (postId && postLookup[postId] ? postLookup[postId].groupKey : '');
    const groupName = String(pickPath_(o,['group_name','groupName','group.name']) || '') ||
      (postId && postLookup[postId] ? postLookup[postId].group : '');

    let message = pickPath_(o,['message','text','body','comment_text','commentText','content.text','content']);
    if (message && typeof message === 'object') message = pickPath_(message,['text','message','body']);
    message = String(message || '').trim();

    const commentId = normalizeCommentId_(pickPath_(o,['comment_id','commentId','id']) || '', commentUrl);
    const authorName = String(pickPath_(author,['name','full_name','display_name']) || pickPath_(o,['author_name','user_name','name']) || '').trim();
    const authorUrl = String(pickPath_(author,['url','profile_url','profileUrl','link']) || pickPath_(o,['author_url','profile_url','user_url']) || '').trim();
    const createdAt = toDate_(pickPath_(o,['creation_time','created_time','createdAt','created_at','timestamp','time']));
    const reactions = toNumber_(pickPath_(o,['reactions.total','reaction_count','reactions_count','like_count','likes','feedback.reaction_count']));
    const replies = toNumber_(pickPath_(o,['replies.total','reply_count','replies_count','children.total','comments_count']));

    return {
      commentId, parentId:String(parentId || ''), postId, postUrl, commentUrl, groupKey, groupName,
      authorName, authorUrl, message, createdAt, reactions, replies
    };
  }

  function loadPostContext_(oppSheet) {
    const out = {};
    const last = oppSheet.getLastRow();
    if (last < 2) return out;
    oppSheet.getRange(2,1,last-1,21).getValues().forEach(r => {
      if (String(r[3] || '') !== 'Bài viết') return;
      const id = String(r[1] || '').trim();
      if (!id) return;
      out[id] = { url:String(r[2]||''), group:String(r[4]||''), groupKey:extractGroupKey_(r[2]||''), content:String(r[7]||'') };
    });
    return out;
  }

  function loadExistingCommentKeys_(commentSheet, oppSheet) {
    const keys = new Set();
    const last = commentSheet.getLastRow();
    if (last >= 2) {
      commentSheet.getRange(2,7,last-1,2).getValues().forEach(r => makeCommentKeys_(r[0],r[1]).forEach(k=>keys.add(k)));
    }
    const oppLast = oppSheet.getLastRow();
    if (oppLast >= 2) {
      oppSheet.getRange(2,2,oppLast-1,3).getValues().forEach(r => {
        if (String(r[2]||'') !== 'Bình luận') return;
        const id = String(r[0]||'').replace(/^C:/,'');
        makeCommentKeys_(id,r[1]).forEach(k=>keys.add(k));
      });
    }
    return keys;
  }

  function extractCommentIdFromUrl_(url) {
    const s = String(url || '');
    let m = s.match(/[?&](?:comment_id|reply_comment_id)=([^&#]+)/i);
    if (m) return decodeURIComponent(m[1]);
    m = s.match(/\/comments?\/([^\/?#]+)/i);
    if (m) return decodeURIComponent(m[1]);
    m = s.match(/\/comment\/([^\/?#]+)/i);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function normalizeCommentId_(value, url) {
    if (typeof value === 'number') {
      const fromUrl = extractCommentIdFromUrl_(url);
      if (fromUrl) return fromUrl;
      if (Number.isSafeInteger(value)) return String(value);
      return '';
    }
    const s = String(value || '').trim();
    if (s && !/[eE][+-]?\d+/.test(s)) return s.replace(/^'+/,'');
    return extractCommentIdFromUrl_(url) || s.replace(/[\s,]/g,'');
  }

  function normalizeCommentUrl_(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    const cid = extractCommentIdFromUrl_(raw);
    if (cid) return 'comment-id:' + cid.toLowerCase();
    return raw.replace(/#.*$/,'').replace(/\/+$/,'').toLowerCase();
  }

  function makeCommentKeys_(commentId, url) {
    const out = [];
    const id = normalizeCommentId_(commentId, url);
    const u = normalizeCommentUrl_(url);
    if (id) out.push('CID|' + id);
    if (u && /comment-id:|\/comments?\/|\/comment\//i.test(u)) out.push('CURL|' + u);
    return out;
  }

  function stableId_(text) {
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ''), Utilities.Charset.UTF_8);
    return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/,'').slice(0,24);
  }

  function toDate_(value) {
    if (value instanceof Date) return value;
    if (value === '' || value === null || value === undefined) return null;
    if (typeof value === 'number') return new Date(value < 100000000000 ? value * 1000 : value);
    const s = String(value).trim();
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      return new Date(n < 100000000000 ? n * 1000 : n);
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  function ensureV16Sheets_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let cs = ss.getSheetByName(CFG.COMMENT_SHEET);
    if (!cs) cs = ss.insertSheet(CFG.COMMENT_SHEET);
    if (cs.getMaxColumns() < 23) cs.insertColumnsAfter(cs.getMaxColumns(), 23 - cs.getMaxColumns());
    cs.getRange(1,1,1,23).setValues([[
      'Ngày import','File JSON','Nhóm','Group ID','Post ID','URL bài','Comment ID','URL comment','Parent Comment ID',
      'Người comment','Link Facebook','Nội dung comment','Ngày comment','Reaction','Reply','Pain','Intent','Điểm',
      'Phân loại KH','Reply gợi ý','Hành động tiếp theo','Trạng thái xử lý','Media URL'
    ]]);

    let ts = ss.getSheetByName(CFG.PERSON_TIMELINE_SHEET);
    if (!ts) ts = ss.insertSheet(CFG.PERSON_TIMELINE_SHEET);
    ts.getRange(1,1,1,18).setValues([[
      'Person Key','Tên','URL Facebook','Thời gian','Nhóm','Loại nguồn','Source ID','URL nguồn',
      'Nội dung / bằng chứng','Pain','Intent','Điểm','Phân loại','Hành động tiếp theo','Follow-up',
      'Chuyển đổi','Trạng thái','Ghi chú'
    ]]);

    let il = ss.getSheetByName(CFG.IMPORT_LOG_SHEET);
    if (!il) il = ss.insertSheet(CFG.IMPORT_LOG_SHEET);
    if (il.getMaxColumns() < 18) il.insertColumnsAfter(il.getMaxColumns(), 18 - il.getMaxColumns());
    il.getRange(1,1,1,18).setValues([[
      'Thời gian','Run ID','Group','Group ID','File','Số file','Bản ghi đọc','Post đọc','Comment đọc',
      'Post mới','Comment mới','Trùng','Bài/lần','Duration ms','Trạng thái','Version','Lỗi','Ghi chú'
    ]]);

    let ds = ss.getSheetByName(CFG.DAILY_STATS_SHEET);
    if (!ds) ds = ss.insertSheet(CFG.DAILY_STATS_SHEET);
    if (ds.getMaxColumns() < 18) ds.insertColumnsAfter(ds.getMaxColumns(), 18 - ds.getMaxColumns());
    ds.getRange(1,1,1,18).setValues([[
      'Ngày','Group','Group ID','Lượt cập nhật','JSON đọc hôm nay','Bài quét hôm nay','Comment quét hôm nay',
      'Bài mới hôm nay','Comment mới hôm nay','Trùng hôm nay','Max bài/lần','Tổng bài đang lưu',
      'Tổng comment đang lưu','KH mới hôm nay','KH tiềm năng hiện tại','Lần cập nhật cuối','Trạng thái','Ghi chú'
    ]]);

    const raw = ss.getSheetByName(CFG.RAW_SHEET);
    if (raw && raw.getMaxColumns() >= 16) raw.getRange(4,15,1,2).setValues([['Media URL','Media count']]);

    const opp = ss.getSheetByName(CFG.OPPORTUNITY_SHEET);
    if (opp && opp.getMaxColumns() >= 21) {
      opp.getRange(1,2).setValue('Source ID');
      opp.getRange(1,21).setValue('Media URL');
    }

    const lead = ss.getSheetByName(CFG.LEAD_SHEET);
    if (lead) {
      if (lead.getMaxColumns() < 17) lead.insertColumnsAfter(lead.getMaxColumns(), 17-lead.getMaxColumns());
      lead.getRange(1,17).setValue('Ngày thành KH tiềm năng');
    }

    const scan = ss.getSheetByName(CFG.GROUP_SCAN_SHEET);
    if (scan) {
      if (scan.getMaxColumns() < 22) scan.insertColumnsAfter(scan.getMaxColumns(),22-scan.getMaxColumns());
      scan.getRange(1,17,1,6).setValues([[
        'Lượt cập nhật hôm nay','Bản ghi lần cuối','Bài quét lần cuối',
        'Bài mới hôm nay','Comment mới hôm nay','KH mới hôm nay'
      ]]);
    }
  }

  function handleUiCommand_(command) {
    const name = String(command.__command || '');
    if (name === 'GET_AI_CONFIG') return getAiConfig_();
    if (name === 'SAVE_AI_CONFIG') return saveAiConfig_(command);
    if (name === 'ANALYZE_NEW') return analyzeNewPosts_({ silent: false });
    if (name === 'TEST_AI') return testAiConnection_();
    if (name === 'GET_AI_PROGRESS') return getAiProgress_();
    if (name === 'AUDIT_CONSISTENCY') return auditConsistency_();
    throw new Error('Lệnh giao diện không được hỗ trợ: ' + name);
  }

  function getAiConfig_() {
    const p = PropertiesService.getScriptProperties();
    const provider = String(p.getProperty('AI_PROVIDER') || 'openai').toLowerCase();
    let model = p.getProperty('AI_MODEL') || (provider === 'gemini' ? 'gemini-auto' : 'gpt-5.6-luna');

    // Repair invalid legacy model IDs from earlier builds.
    if (provider === 'openai' && /^gpt-6/i.test(model)) model = 'gpt-5.6-luna';
    if (provider === 'gemini' && /^gemini-2\.5-/i.test(model)) model = 'gemini-auto';

    const openaiConfigured = !!String(p.getProperty('OPENAI_API_KEY') || '').trim();
    const geminiConfigured = !!String(p.getProperty('GEMINI_API_KEY') || '').trim();
    const configured = provider === 'gemini' ? geminiConfigured : openaiConfigured;

    return {
      version: CFG.VERSION,
      provider,
      configured,
      openaiConfigured,
      geminiConfigured,
      model,
      lastGeminiModel: p.getProperty('AI_LAST_GEMINI_MODEL') || '',
      businessContext: p.getProperty('AI_BUSINESS_CONTEXT') || '',
      autoAnalyze: (p.getProperty('AI_AUTO_ANALYZE') || 'true') === 'true',
      maxRows: Math.max(1, Math.min(200, Number(p.getProperty('AI_MAX_ROWS') || 100))),
    };
  }

  function saveAiConfig_(command) {
    const p = PropertiesService.getScriptProperties();
    const provider = String(command.provider || 'openai').toLowerCase() === 'gemini' ? 'gemini' : 'openai';
    const openaiKey = String(command.openaiApiKey || command.apiKey || '').trim();
    const geminiKey = String(command.geminiApiKey || '').trim();
    const defaultModel = provider === 'gemini' ? 'gemini-auto' : 'gpt-5.6-luna';
    let model = String(command.model || defaultModel).trim() || defaultModel;
    if (provider === 'openai' && /^gpt-6/i.test(model)) model = 'gpt-5.6-luna';

    const businessContext = String(command.businessContext || '').trim();
    const autoAnalyze = command.autoAnalyze !== false;
    const maxRows = Math.max(1, Math.min(200, Number(command.maxRows || 100)));

    if (openaiKey) p.setProperty('OPENAI_API_KEY', openaiKey);
    if (geminiKey) p.setProperty('GEMINI_API_KEY', geminiKey);
    p.setProperty('AI_PROVIDER', provider);
    p.setProperty('AI_MODEL', model);
    p.setProperty('AI_BUSINESS_CONTEXT', businessContext);
    p.setProperty('AI_AUTO_ANALYZE', String(autoAnalyze));
    p.setProperty('AI_MAX_ROWS', String(maxRows));

    const cfg = getAiConfig_();
    if (!cfg.configured) {
      throw new Error(provider === 'gemini'
        ? 'Chưa có Gemini API key cho nhà cung cấp đang chọn.'
        : 'Chưa có OpenAI API key cho nhà cung cấp đang chọn.');
    }
    return cfg;
  }

  function testAiConnection_() {
    const cfg = getAiConfig_();
    if (!cfg.configured) throw new Error('Chưa cấu hình API key cho ' + cfg.provider + '.');

    if (cfg.provider === 'gemini') {
      const result = callGeminiStructured_(
        'Trả về JSON đúng schema. Không thêm giải thích.',
        'Kiểm tra kết nối. Trả status=ok.',
        {
          type: 'object',
          properties: { status: { type: 'string' } },
          required: ['status']
        },
        cfg
      );
      return { ok: result.data && result.data.status === 'ok', provider: cfg.provider, model: result.model, version: CFG.VERSION };
    }

    const payload = {
      model: cfg.model,
      input: [
        { role: 'system', content: 'Trả về JSON đúng schema. Không thêm giải thích.' },
        { role: 'user', content: 'Kiểm tra kết nối. Trả status=ok.' }
      ],
      max_output_tokens: 50,
      text: {
        format: {
          type: 'json_schema',
          name: 'connection_test',
          strict: true,
          schema: {
            type: 'object',
            properties: { status: { type: 'string' } },
            required: ['status'],
            additionalProperties: false
          }
        }
      }
    };
    const json = callOpenAi_(payload);
    const parsed = parseStructuredResponse_(json);
    return { ok: parsed && parsed.status === 'ok', provider: cfg.provider, model: cfg.model, version: CFG.VERSION };
  }

  function analyzeNewPosts() {
    return analyzeNewPosts_({ silent: false });
  }

  function getAiProgress_() {
    const raw = PropertiesService.getScriptProperties().getProperty('AI_PROGRESS_JSON');
    if (!raw) return { active: false, version: CFG.VERSION };
    try {
      const p = JSON.parse(raw);
      p.version = CFG.VERSION;
      return p;
    } catch (_) {
      return { active: false, version: CFG.VERSION };
    }
  }

  function setAiProgress_(p) {
    const payload = Object.assign({
      version: CFG.VERSION,
      updatedAt: new Date().toISOString()
    }, p || {});
    PropertiesService.getScriptProperties().setProperty('AI_PROGRESS_JSON', JSON.stringify(payload));
    return payload;
  }

  function ensureAiLogSheet_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CFG.AI_LOG_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(CFG.AI_LOG_SHEET);
      sheet.getRange(1, 1, 1, 12).setValues([[
        'Thời gian','Run ID','Sự kiện','Provider','Model','Batch','Tổng batch',
        'Đã phân tích','Tổng chọn','Còn lại','Trạng thái','Chi tiết'
      ]]);
      sheet.setFrozenRows(1);
    }
    return sheet;
  }

  function logAi_(data) {
    try {
      const sheet = ensureAiLogSheet_();
      sheet.appendRow([
        new Date(),
        data.runId || '',
        data.event || '',
        data.provider || '',
        data.model || '',
        data.batch || '',
        data.totalBatches || '',
        data.analyzed || 0,
        data.total || 0,
        data.remaining || 0,
        data.status || '',
        data.message || ''
      ]);
    } catch (_) {}
  }

  function compressEvidenceForAi_(content, sourceType) {
    let s = String(content || '').replace(/\r/g,'').replace(/\n{3,}/g,'\n\n').trim();
    const type = String(sourceType || '');
    const max = type === 'Bình luận' ? 1800 : 2600;
    if (s.length <= max) return s;

    // Preserve the beginning and the closing part where CTA/contact/requirements often live.
    const head = Math.floor(max * 0.75);
    const tail = max - head - 24;
    return s.slice(0,head) + '\n...[rút gọn]...\n' + s.slice(-tail);
  }

  function analyzeNewPosts_(options) {
    const silent = options && options.silent;
    const cfg = getAiConfig_();
    if (!cfg.configured) throw new Error('Chưa cấu hình API key cho nhà cung cấp AI đang chọn.');

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(1000)) {
      const p = getAiProgress_();
      throw new Error('AI đang chạy ở phiên khác' + (p && p.runId ? ' (Run ' + p.runId + ')' : '') + '.');
    }

    const runId = Utilities.getUuid().slice(0, 8);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);
      const last = sheet.getLastRow();
      if (last < 2) {
        setAiProgress_({ active:false, runId, status:'DONE', analyzed:0, total:0, remaining:0 });
        return { version: CFG.VERSION, analyzed: 0, remaining: 0, errors: [] };
      }

      const rows = sheet.getRange(2, 1, last - 1, 20).getValues();
      const candidates = [];
      rows.forEach((r, i) => {
        const content = String(r[7] || '').trim();
        const already = [r[8], r[9], r[10], r[11]].some(v => v !== '' && v !== null && v !== undefined);
        const status = String(r[19] || '').trim();
        if (!content || already || status === 'Đóng') return;
        const sourceType = String(r[3] || 'Bài viết');
        candidates.push({
          rowNumber: i + 2,
          group: String(r[4] || ''),
          author: String(r[5] || ''),
          content: compressEvidenceForAi_(content, sourceType),
          sourceType,
          sourceUrl: String(r[2] || ''),
          engagement: String(r[18] || ''),
          postDate: r[0] instanceof Date
            ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')
            : String(r[0] || '')
        });
      });

      const selected = candidates.slice(0, cfg.maxRows);
      const total = selected.length;
      const batchSize = 25;
      const totalBatches = Math.ceil(total / batchSize);

      if (!selected.length) {
        setAiProgress_({ active:false, runId, status:'DONE', analyzed:0, total:0, remaining:0, batch:0, totalBatches:0 });
        const result = { version: CFG.VERSION, analyzed: 0, remaining: 0, errors: [] };
        if (!silent) SpreadsheetApp.getActive().toast('Không còn bài mới cần AI phân tích.', 'AI PHÂN TÍCH', 5);
        return result;
      }

      const startModel = cfg.provider === 'gemini'
        ? (PropertiesService.getScriptProperties().getProperty('AI_LAST_GEMINI_MODEL') || cfg.model)
        : cfg.model;

      setAiProgress_({
        active:true, runId, status:'RUNNING', provider:cfg.provider, model:startModel,
        batch:0, totalBatches, analyzed:0, total, remaining:total, errors:0
      });
      logAi_({
        runId, event:'START', provider:cfg.provider, model:startModel, batch:0, totalBatches,
        analyzed:0, total, remaining:total, status:'RUNNING',
        message:'Bắt đầu phân tích ' + total + ' bài.'
      });

      const errors = [];
      let analyzed = 0;

      for (let start = 0; start < selected.length; start += batchSize) {
        const batch = selected.slice(start, start + batchSize);
        const batchNo = Math.floor(start / batchSize) + 1;

        setAiProgress_({
          active:true, runId, status:'RUNNING', provider:cfg.provider,
          model: PropertiesService.getScriptProperties().getProperty('AI_LAST_GEMINI_MODEL') || cfg.model,
          batch:batchNo, totalBatches, analyzed, total, remaining:Math.max(0,total-analyzed), errors:errors.length
        });

        try {
          const results = cfg.provider === 'gemini'
            ? analyzeBatchWithGemini_(batch, cfg)
            : analyzeBatchWithOpenAi_(batch, cfg);

          applyAiAnalysis_(sheet, results);
          SpreadsheetApp.flush();
          analyzed += results.length;

          const actualModel = cfg.provider === 'gemini'
            ? (PropertiesService.getScriptProperties().getProperty('AI_LAST_GEMINI_MODEL') || cfg.model)
            : cfg.model;

          setAiProgress_({
            active:true, runId, status:'RUNNING', provider:cfg.provider, model:actualModel,
            batch:batchNo, totalBatches, analyzed, total, remaining:Math.max(0,total-analyzed), errors:errors.length
          });
          logAi_({
            runId, event:'BATCH_OK', provider:cfg.provider, model:actualModel, batch:batchNo, totalBatches,
            analyzed, total, remaining:Math.max(0,total-analyzed), status:'OK',
            message:'Batch ' + batchNo + '/' + totalBatches + ' hoàn thành: ' + results.length + ' bài.'
          });
        } catch (e) {
          const msg = 'Batch ' + batchNo + ': ' + e.message;
          errors.push(msg);
          setAiProgress_({
            active:true, runId, status:'RUNNING_WITH_ERRORS', provider:cfg.provider,
            model: PropertiesService.getScriptProperties().getProperty('AI_LAST_GEMINI_MODEL') || cfg.model,
            batch:batchNo, totalBatches, analyzed, total, remaining:Math.max(0,total-analyzed), errors:errors.length,
            lastError:e.message
          });
          logAi_({
            runId, event:'BATCH_ERROR', provider:cfg.provider,
            model: PropertiesService.getScriptProperties().getProperty('AI_LAST_GEMINI_MODEL') || cfg.model,
            batch:batchNo, totalBatches, analyzed, total, remaining:Math.max(0,total-analyzed),
            status:'ERROR', message:e.message
          });
        }
      }

      const refresh = refreshCurrentData({ silent:true, fast:true });
      const remaining = Math.max(0, candidates.length - analyzed);
      const actualModel = cfg.provider === 'gemini'
        ? (PropertiesService.getScriptProperties().getProperty('AI_LAST_GEMINI_MODEL') || cfg.model)
        : cfg.model;

      setAiProgress_({
        active:false, runId, status:errors.length ? 'DONE_WITH_ERRORS' : 'DONE',
        provider:cfg.provider, model:actualModel, batch:totalBatches, totalBatches,
        analyzed, total, remaining, errors:errors.length
      });
      logAi_({
        runId, event:'DONE', provider:cfg.provider, model:actualModel, batch:totalBatches, totalBatches,
        analyzed, total, remaining, status:errors.length ? 'DONE_WITH_ERRORS' : 'DONE',
        message:errors.length ? errors.join(' | ').slice(0, 4000) : 'Hoàn thành.'
      });

      const result = { version: CFG.VERSION, runId, analyzed, remaining, errors, provider: cfg.provider, model: actualModel, refresh };

      if (!silent) {
        SpreadsheetApp.getActive().toast(
          'Run ' + runId + ' | Đã phân tích ' + analyzed + ' bài | Còn ' + remaining + (errors.length ? ' | Có lỗi' : ''),
          'AI PHÂN TÍCH',
          8
        );
      }
      return result;
    } finally {
      try { lock.releaseLock(); } catch (_) {}
    }
  }

  function analyzeBatchWithOpenAi_(batch, cfg) {
    const systemPrompt = aiSystemPrompt_(cfg);

    const payload = {
      model: cfg.model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(batch) }
      ],
      max_output_tokens: 12000,
      text: {
        format: {
          type: 'json_schema',
          name: 'community_sales_analysis',
          strict: true,
          schema: analysisSchema_()
        }
      }
    };

    const response = callOpenAi_(payload);
    const parsed = parseStructuredResponse_(response);
    if (!parsed || !Array.isArray(parsed.analyses)) throw new Error('OpenAI không trả về analyses hợp lệ.');
    return parsed.analyses;
  }

  function analysisSchema_() {
    return {
      type: 'object',
      properties: {
        analyses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row_number: { type: 'integer' },
              pain: { type: 'string' },
              intent: { type: 'string' },
              score: { type: 'integer' },
              classification: { type: 'string' },
              value_solution: { type: 'string' },
              suggested_comment: { type: 'string' },
              next_action: { type: 'string' },
              follow_up_days: { type: 'integer' }
            },
            required: ['row_number','pain','intent','score','classification','value_solution','suggested_comment','next_action','follow_up_days'],
            additionalProperties: false
          }
        }
      },
      required: ['analyses'],
      additionalProperties: false
    };
  }

  function aiSystemPrompt_(cfg) {
    return [
      'Bạn là Community Sales Intelligence Agent.',
      'Phân tích CHỈ dựa trên nội dung được cung cấp; không suy đoán thuộc tính nhạy cảm hay thông tin cá nhân ngoài dữ liệu.',
      'Mục tiêu là nhận diện người có nhu cầu thật, pain, intent và hành động hội thoại phù hợp.',
      'Không coi người bán/quảng cáo là khách hàng chỉ vì họ đăng sản phẩm. Nếu bài của người bán có nhiều tương tác và có thể chứa người mua trong comment, phân loại là "Nguồn hội thoại".',
      'Comment gợi ý phải tự nhiên, hữu ích, không giả vờ đã dùng sản phẩm, không tạo testimonial giả, không spam và không chèn link bán hàng.',
      'Nếu sourceType là Bình luận: coi chính người comment là đối tượng cần đánh giá; ưu tiên tín hiệu hỏi giá, hỏi cách mua, hỏi giải pháp, phản đối, so sánh hoặc cần gấp. suggested_comment phải là câu reply nối tiếp hội thoại, không phải comment mới độc lập.',
      'Ưu tiên 8+2: phần lớn là giá trị/chẩn đoán/nối hội thoại; chỉ dùng CTA khi intent mua rất rõ.',
      'Thang điểm 0-100: intent mua + pain/urgency + khả năng hành động + khả năng phản hồi + độ mới/tín hiệu tương tác + độ phù hợp thương mại.',
      'Nếu business context trống, hãy chấm cơ hội bán hàng tổng quát thay vì tự bịa product fit.',
      'Intent phải là một trong: Hỏi kinh nghiệm, Tìm giải pháp, So sánh, Xác thực, Phản đối, Muốn đổi, Muốn mua, Cần mua gấp, Chia sẻ, Thảo luận, Không ưu tiên.',
      'Phân loại phải là một trong: Rất tiềm năng, Tiềm năng, Theo dõi, Nguồn hội thoại, Không phải KH.',
      'Hành động tiếp theo phải là một trong: Bỏ qua, Theo dõi, Comment giá trị, Hỏi chẩn đoán, Tạo nhu cầu, Nối tiếp hội thoại, Xử lý phản đối, Gợi ý giải pháp, Mời inbox, Kết bạn, CTA.',
      'follow_up_days: 0 nếu không cần follow-up; nếu cần thì 1-30 ngày.',
      'Business context: ' + (cfg.businessContext || '(chưa cấu hình)')
    ].join('\n');
  }

  function analyzeBatchWithGemini_(batch, cfg) {
    const result = callGeminiStructured_(
      aiSystemPrompt_(cfg),
      JSON.stringify(batch),
      analysisSchema_(),
      cfg
    );
    const parsed = result.data;
    if (!parsed || !Array.isArray(parsed.analyses)) throw new Error('Gemini không trả về analyses hợp lệ.');
    return parsed.analyses;
  }

  function sanitizeGeminiSchema_(schema) {
    if (Array.isArray(schema)) return schema.map(sanitizeGeminiSchema_);
    if (!schema || typeof schema !== 'object') return schema;

    const out = {};
    Object.keys(schema).forEach(key => {
      // Legacy Gemini generateContent.responseSchema is not full JSON Schema.
      // Keep only fields accepted by the Schema message.
      if (key === 'additionalProperties' || key === '$schema' || key === '$id' || key === '$defs' || key === '$ref') return;
      out[key] = sanitizeGeminiSchema_(schema[key]);
    });
    return out;
  }

  function getGeminiFallbackModels_(selected) {
    const stable = [
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite'
    ];
    const s = String(selected || 'gemini-auto').trim();
    if (!s || s === 'gemini-auto') return stable;
    return [s].concat(stable.filter(m => m !== s));
  }

  function getGeminiAvailableModels_(key) {
    const cache = CacheService.getScriptCache();
    const cacheKey = 'GEMINI_AVAILABLE_MODELS_V1';
    const cached = cache.get(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch (_) {}
    }

    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key);
      const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) return [];
      const json = JSON.parse(res.getContentText('UTF-8'));
      const models = (json.models || [])
        .filter(m => (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0)
        .map(m => String(m.name || '').replace(/^models\//, ''))
        .filter(Boolean);
      try { cache.put(cacheKey, JSON.stringify(models), 600); } catch (_) {}
      return models;
    } catch (_) {
      return [];
    }
  }

  function isTransientGeminiCode_(code) {
    return code === 408 || code === 429 || code === 500 || code === 502 || code === 503 || code === 504;
  }

  function callGeminiStructured_(systemPrompt, userPrompt, schema, cfg) {
    const key = String(PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '').trim();
    if (!key) throw new Error('Thiếu GEMINI_API_KEY.');

    const available = getGeminiAvailableModels_(key);
    const candidates = getGeminiFallbackModels_(cfg.model);
    let models = available.length ? candidates.filter(m => available.indexOf(m) >= 0) : candidates;

    // If the explicit model is not returned by models.list, do not get stuck on it.
    if (!models.length) models = candidates;

    const errors = [];
    const schemaForGemini = sanitizeGeminiSchema_(schema);

    for (let mi = 0; mi < models.length; mi++) {
      const model = models[mi];
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);

      const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schemaForGemini
        }
      };

      for (let attempt = 0; attempt < 3; attempt++) {
        const res = UrlFetchApp.fetch(url, {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });

        const code = res.getResponseCode();
        const body = res.getContentText('UTF-8');

        if (code >= 200 && code < 300) {
          let json;
          try { json = JSON.parse(body); } catch (e) { throw new Error('Gemini ' + model + ': phản hồi không phải JSON.'); }

          const candidatesOut = json.candidates || [];
          const parts = candidatesOut[0] && candidatesOut[0].content && candidatesOut[0].content.parts
            ? candidatesOut[0].content.parts : [];
          const text = parts.map(p => p.text || '').join('').trim();
          if (!text) throw new Error('Gemini ' + model + ' không trả text JSON.');

          PropertiesService.getScriptProperties().setProperty('AI_LAST_GEMINI_MODEL', model);
          return { data: JSON.parse(text), model };
        }

        let jsonErr = null;
        try { jsonErr = JSON.parse(body); } catch (_) {}
        const msg = jsonErr && jsonErr.error && jsonErr.error.message
          ? jsonErr.error.message
          : body.slice(0, 350);

        errors.push(model + ' HTTP ' + code + ': ' + msg);

        if (!isTransientGeminiCode_(code)) {
          // Model unavailable/permission/schema errors are not fixed by retrying the same request.
          break;
        }

        if (attempt < 2) {
          const base = Math.pow(2, attempt) * 1000;
          const jitter = Math.floor(Math.random() * 700);
          Utilities.sleep(base + jitter);
        }
      }
      // After retries, try the next currently available stable model.
    }

    throw new Error(
      'Gemini không xử lý được sau retry/fallback. ' +
      errors.slice(-6).join(' | ')
    );
  }

  function callOpenAi_(payload) {
    const key = String(PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY') || '').trim();
    if (!key) throw new Error('Thiếu OPENAI_API_KEY.');

    const res = UrlFetchApp.fetch('https://api.openai.com/v1/responses', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + key },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const code = res.getResponseCode();
    const text = res.getContentText('UTF-8');
    let json;
    try { json = JSON.parse(text); } catch (e) { throw new Error('OpenAI HTTP ' + code + ': phản hồi không phải JSON.'); }
    if (code < 200 || code >= 300) {
      const msg = json && json.error && json.error.message ? json.error.message : text.slice(0, 500);
      throw new Error('OpenAI HTTP ' + code + ': ' + msg);
    }
    return json;
  }

  function parseStructuredResponse_(json) {
    if (!json) throw new Error('OpenAI trả về dữ liệu rỗng.');
    let text = String(json.output_text || '').trim();
    if (!text && Array.isArray(json.output)) {
      for (const item of json.output) {
        if (!item || !Array.isArray(item.content)) continue;
        for (const part of item.content) {
          if (part && part.type === 'output_text' && part.text) {
            text = String(part.text).trim();
            break;
          }
        }
        if (text) break;
      }
    }
    if (!text) throw new Error('Không tìm thấy output_text trong Responses API.');
    return JSON.parse(text);
  }

  function applyAiAnalysis_(sheet, analyses) {
    const allowedIntent = new Set(['Hỏi kinh nghiệm','Tìm giải pháp','So sánh','Xác thực','Phản đối','Muốn đổi','Muốn mua','Cần mua gấp','Chia sẻ','Thảo luận','Không ưu tiên']);
    const allowedClass = new Set(['Rất tiềm năng','Tiềm năng','Theo dõi','Nguồn hội thoại','Không phải KH']);
    const allowedAction = new Set(['Bỏ qua','Theo dõi','Comment giá trị','Hỏi chẩn đoán','Tạo nhu cầu','Nối tiếp hội thoại','Xử lý phản đối','Gợi ý giải pháp','Mời inbox','Kết bạn','CTA']);
    const now = new Date();

    const valid=(analyses||[])
      .map(a=>({a,row:Number(a.row_number||0)}))
      .filter(x=>x.row>=2&&x.row<=sheet.getLastRow());
    if(!valid.length) return;

    const minRow=Math.min(...valid.map(x=>x.row));
    const maxRow=Math.max(...valid.map(x=>x.row));
    const values=sheet.getRange(minRow,1,maxRow-minRow+1,21).getValues();

    valid.forEach(x=>{
      const a=x.a;
      const idx=x.row-minRow;
      const r=values[idx];
      const intent=allowedIntent.has(String(a.intent))?String(a.intent):'Thảo luận';
      const classification=allowedClass.has(String(a.classification))?String(a.classification):'Theo dõi';
      const action=allowedAction.has(String(a.next_action))?String(a.next_action):'Theo dõi';
      const score=Math.max(0,Math.min(100,Math.round(Number(a.score||0))));
      const days=Math.max(0,Math.min(30,Math.round(Number(a.follow_up_days||0))));
      const follow=days>0?new Date(now.getTime()+days*86400000):'';

      let status='Theo dõi';
      if(classification==='Rất tiềm năng'||classification==='Tiềm năng') status='Đang xử lý';
      if(classification==='Không phải KH'&&action==='Bỏ qua') status='Đóng';

      r[8]=String(a.pain||'');
      r[9]=intent;
      r[10]=score;
      r[11]=classification;
      r[12]=String(a.value_solution||'');
      r[13]=String(a.suggested_comment||'');
      r[15]=action;
      r[16]=follow;
      r[19]=status;
    });

    sheet.getRange(minRow,1,values.length,21).setValues(values);
  }

  function normalizeAndDedupeCommentSheet_(sheet) {
    const last = sheet.getLastRow();
    if (last < 2) return { removed:0, rows:0 };
    const rows = sheet.getRange(2,1,last-1,23).getValues();
    const groups = [];
    const keyMap = new Map();

    rows.forEach(r => {
      const keys = makeCommentKeys_(r[6],r[7]);
      let idx = -1;
      for (const k of keys) if (keyMap.has(k)) { idx=keyMap.get(k); break; }
      if (idx < 0) {
        idx = groups.length;
        groups.push(r);
        keys.forEach(k=>keyMap.set(k,idx));
      } else {
        groups[idx] = rowCompleteness_(r) > rowCompleteness_(groups[idx]) ? mergeRows_(r,groups[idx]) : mergeRows_(groups[idx],r);
      }
    });

    const removed = rows.length-groups.length;
    sheet.getRange(2,1,rows.length,23).clearContent();
    if (groups.length) {
      sheet.getRange(2,5,groups.length,4).setNumberFormat('@');
      sheet.getRange(2,1,groups.length,23).setValues(groups);
    }
    return { removed, rows:groups.length };
  }

  function normalizeAndDedupeOpportunitySheet_(sheet) {
    const last = sheet.getLastRow();
    if (last < 2) return { removed:0, repairedIds:0, rows:0 };
    const rows = sheet.getRange(2,1,last-1,21).getValues();
    const groups = [];
    const keyMap = new Map();
    let repairedIds = 0;

    rows.forEach(r => {
      const type = String(r[3]||'');
      if (type !== 'Bình luận') {
        const before=r[1];
        const after=normalizePostId_(before,r[2]);
        if (String(before||'')!==String(after||'')) repairedIds += 1;
        r[1]=after;
      }
      const id=String(r[1]||'').trim();
      const url=normalizeUrl_(r[2]);
      const keys=[];
      if (id) keys.push('OID|'+id);
      if (type !== 'Bình luận' && url) keys.push('OURL|'+url);

      let idx=-1;
      for (const k of keys) if (keyMap.has(k)) { idx=keyMap.get(k); break; }
      if (idx<0) {
        idx=groups.length;
        groups.push(r);
        keys.forEach(k=>keyMap.set(k,idx));
      } else {
        groups[idx]=rowCompleteness_(r)>rowCompleteness_(groups[idx]) ? mergeRows_(r,groups[idx]) : mergeRows_(groups[idx],r);
      }
    });

    const removed=rows.length-groups.length;
    sheet.getRange(2,1,rows.length,21).clearContent();
    if (groups.length) {
      sheet.getRange(2,2,groups.length,1).setNumberFormat('@');
      sheet.getRange(2,1,groups.length,21).setValues(groups);
    }
    return { removed, repairedIds, rows:groups.length };
  }

  function auditCommentDuplicates_(sheet) {
    const last=sheet.getLastRow();
    if (last<2) return {rows:0,duplicateRows:0};
    const rows=sheet.getRange(2,1,last-1,23).getValues();
    const seen=new Set(); let dup=0;
    rows.forEach(r=>{
      const keys=makeCommentKeys_(r[6],r[7]);
      if(keys.some(k=>seen.has(k))) dup++; else keys.forEach(k=>seen.add(k));
    });
    return {rows:rows.length,duplicateRows:dup};
  }

  function auditOpportunityDuplicates_(sheet) {
    const last=sheet.getLastRow();
    if(last<2) return {rows:0,duplicateRows:0};
    const rows=sheet.getRange(2,1,last-1,21).getValues();
    const seen=new Set(); let dup=0;
    rows.forEach(r=>{
      const type=String(r[3]||'');
      const id=String(r[1]||'').trim();
      const url=normalizeUrl_(r[2]);
      const keys=[];
      if(id) keys.push('OID|'+id);
      if(type!=='Bình luận'&&url) keys.push('OURL|'+url);
      if(keys.some(k=>seen.has(k))) dup++; else keys.forEach(k=>seen.add(k));
    });
    return {rows:rows.length,duplicateRows:dup};
  }

  function syncCommentAnalysis_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const cs=ss.getSheetByName(CFG.COMMENT_SHEET);
    const os=ss.getSheetByName(CFG.OPPORTUNITY_SHEET);
    if(!cs||!os) return {rows:0};

    const map={};
    const ol=os.getLastRow();
    if(ol>=2) {
      os.getRange(2,1,ol-1,21).getValues().forEach(r=>{
        if(String(r[3]||'')!=='Bình luận') return;
        const id=String(r[1]||'').replace(/^C:/,'');
        if(id) map[id]=r;
      });
    }

    const cl=cs.getLastRow();
    if(cl<2) return {rows:0};
    const rows=cs.getRange(2,1,cl-1,23).getValues();
    rows.forEach(r=>{
      const o=map[String(r[6]||'')];
      if(!o) { r[21]='Chờ AI'; return; }
      r[15]=o[8]||'';
      r[16]=o[9]||'';
      r[17]=o[10]||'';
      r[18]=o[11]||'';
      r[19]=o[13]||'';
      r[20]=o[15]||'';
      r[21]=[o[8],o[9],o[10],o[11]].some(v=>v!==''&&v!==null&&v!==undefined)?'Đã phân tích':'Chờ AI';
    });
    cs.getRange(2,1,rows.length,23).setValues(rows);
    return {rows:rows.length};
  }

  function refreshPersonTimeline_() {
    ensureV16Sheets_();
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const os=mustSheet_(ss,CFG.OPPORTUNITY_SHEET);
    const ts=mustSheet_(ss,CFG.PERSON_TIMELINE_SHEET);
    const last=os.getLastRow();
    const rows=last>=2?os.getRange(2,1,last-1,21).getValues():[];
    const out=[];

    rows.forEach(r=>{
      const name=String(r[5]||'').trim();
      const fb=normalizeFacebookProfileUrl_(r[6]||'');
      const source=normalizeUrl_(r[2]||'');
      if(!name&&!fb) return;
      const key=fb?('FB|'+fb):('ANON|'+source);
      out.push([
        key,name,r[6]||'',r[0]||'',r[4]||'',r[3]||'',r[1]||'',r[2]||'',r[7]||'',
        r[8]||'',r[9]||'',Number(r[10]||0),r[11]||'',r[15]||'',r[16]||'',r[17]||'',r[19]||'',
        r[18]||''
      ]);
    });

    out.sort((a,b)=>{
      const n=String(a[1]||'').localeCompare(String(b[1]||''),'vi');
      if(n!==0) return n;
      const ta=a[3] instanceof Date?a[3].getTime():0;
      const tb=b[3] instanceof Date?b[3].getTime():0;
      return tb-ta;
    });

    const old=ts.getLastRow();
    if(old>=2) ts.getRange(2,1,old-1,18).clearContent();
    if(out.length) ts.getRange(2,1,out.length,18).setValues(out);
    return {rows:out.length};
  }

  function refreshCurrentData(options) {
    options = options || {};
    const silent = !!options.silent;
    const fast = !!options.fast;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureV16Sheets_();
    const rawSheet = mustSheet_(ss, CFG.RAW_SHEET);
    const oppSheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);
    const commentSheet = mustSheet_(ss, CFG.COMMENT_SHEET);

    const registryStats = fast ? {rows:0} : repairScanRegistry_();
    const remapStats = fast ? {changed:0} : remapGroupNames_();
    const rawFix = fast ? {removed:0,repairedIds:0} : normalizeAndDedupeSheet_(rawSheet, { headerRows:4, idCol:5, urlCol:6, totalCols:16, preferComplete:false });
    const commentFix = fast ? {removed:0} : normalizeAndDedupeCommentSheet_(commentSheet);
    const oppFix = fast ? {removed:0,repairedIds:0} : normalizeAndDedupeOpportunitySheet_(oppSheet);

    const rawStatusStats = syncRawProcessingStatus_();
    const commentStats = syncCommentAnalysis_();
    const timelineStats = refreshPersonTimeline_();
    const leadStats = syncPotentialCustomers({ silent:true });
    const groupStats = refreshGroupSummary_();
    const queueStats = refreshCoordination_();
    const dailyStats = refreshDailyStats_();
    SpreadsheetApp.flush();

    const result = {
      version: CFG.VERSION,
      fast,
      rawRemoved: rawFix.removed || 0,
      commentRemoved: commentFix.removed || 0,
      oppRemoved: oppFix.removed || 0,
      repairedIds: (rawFix.repairedIds || 0) + (oppFix.repairedIds || 0),
      registryRows: registryStats.rows || 0,
      remappedGroups: remapStats.changed || 0,
      rawStatuses: rawStatusStats.rows,
      comments: commentStats.rows,
      timeline: timelineStats.rows,
      leads: leadStats.count,
      groups: groupStats.groups,
      queue: queueStats.count,
      dailyStats: dailyStats.rows
    };

    if (!silent) {
      SpreadsheetApp.getActive().toast(
        `V${CFG.VERSION} | ${fast?'FAST':'FULL'} | Trùng xóa: ${result.rawRemoved + result.commentRemoved + result.oppRemoved} | Comment: ${result.comments} | KH: ${result.leads}`,
        'CẬP NHẬT DỮ LIỆU',
        8
      );
    }
    return result;
  }

  function auditDuplicates() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureV16Sheets_();
    const raw = auditSheetDuplicates_(mustSheet_(ss, CFG.RAW_SHEET), 4, 5, 6);
    const comments = auditCommentDuplicates_(mustSheet_(ss, CFG.COMMENT_SHEET));
    const opp = auditOpportunityDuplicates_(mustSheet_(ss, CFG.OPPORTUNITY_SHEET));
    SpreadsheetApp.getUi().alert(
      `Kiểm tra lọc trùng - V${CFG.VERSION}\n` +
      `NHẬP JSON: ${raw.rows} dòng | ${raw.duplicateRows} dòng trùng\n` +
      `BÌNH LUẬN: ${comments.rows} dòng | ${comments.duplicateRows} dòng trùng\n` +
      `CƠ HỘI: ${opp.rows} dòng | ${opp.duplicateRows} dòng trùng`
    );
    return { raw, comments, opp };
  }

  function syncPotentialCustomers(options) {
    const silent = options && options.silent;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const oppSheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);
    const leadSheet = mustSheet_(ss, CFG.LEAD_SHEET);

    const oppLast = oppSheet.getLastRow();
    const opp = oppLast >= 2 ? oppSheet.getRange(2,1,oppLast-1,21).getValues() : [];
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

      if (!grouped[key]) grouped[key] = { count:0, best:r, bestScore:score };
      grouped[key].count += 1;
      if (score > grouped[key].bestScore) {
        grouped[key].best = r;
        grouped[key].bestScore = score;
      }
    });

    const now = new Date();
    const output = Object.keys(grouped).map(key => {
      const g = grouped[key];
      const r = g.best;
      const old = existing[key] || {};
      return [
        r[5] || '', r[6] || '', r[4] || '', r[3] || '', r[2] || '', r[7] || '', r[8] || '', r[9] || '',
        Number(r[10] || 0), r[11] || '', g.count,
        old.lastAction || r[14] || '', old.nextAction || r[15] || '', old.followUp || r[16] || '',
        old.conversion || r[17] || 'Chưa có', old.note || '', old.firstLeadAt || now
      ];
    }).sort((a,b)=>Number(b[8]||0)-Number(a[8]||0));

    const oldLast = leadSheet.getLastRow();
    if (oldLast >= 2) leadSheet.getRange(2,1,oldLast-1,17).clearContent();
    if (output.length) {
      leadSheet.getRange(2,1,output.length,17).setValues(output);
      leadSheet.setRowHeights(2,output.length,42);
      leadSheet.getRange(2,1,output.length,17).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    }
    SpreadsheetApp.flush();

    if (!silent) SpreadsheetApp.getUi().alert(`Đã đồng bộ ${output.length} khách hàng tiềm năng.`);
    return { count:output.length };
  }

  function refreshGroupSummary_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const summarySheet = ss.getSheetByName(CFG.GROUP_SUMMARY_SHEET);
    const scanSheet = ss.getSheetByName(CFG.GROUP_SCAN_SHEET);
    const oppSheet = ss.getSheetByName(CFG.OPPORTUNITY_SHEET);
    if (!summarySheet || !scanSheet || !oppSheet) return { groups: 0 };

    const old = {};
    const oldLast = summarySheet.getLastRow();
    if (oldLast >= 2) {
      summarySheet.getRange(2, 1, oldLast - 1, 12).getValues().forEach(r => {
        const name = String(r[0] || '').trim();
        const url = String(r[1] || '').trim();
        if (name) old['NAME|' + name] = r;
        if (url) old['URL|' + normalizeUrl_(url)] = r;
      });
    }

    const scanLast = scanSheet.getLastRow();
    const scanRows = scanLast >= 2 ? scanSheet.getRange(2, 1, scanLast - 1, 16).getValues() : [];
    const oppLast = oppSheet.getLastRow();
    const oppRows = oppLast >= 2 ? oppSheet.getRange(2, 1, oppLast - 1, 20).getValues() : [];
    const byGroup = {};
    oppRows.forEach(r => {
      const g = String(r[4] || '').trim();
      if (!g) return;
      if (!byGroup[g]) byGroup[g] = [];
      byGroup[g].push(r);
    });

    const output = [];
    scanRows.forEach(s => {
      const url = String(s[3] || '').trim();
      if (!url) return;
      const name = String(s[2] || '').trim() || ('Group ' + String(s[4] || extractGroupKey_(url)));
      const prev = old['NAME|' + name] || old['URL|' + normalizeUrl_(url)] || [];
      const list = byGroup[name] || [];
      const leads = list
        .filter(r => ['Rất tiềm năng','Tiềm năng'].includes(String(r[11] || '').trim()))
        .sort((a,b) => Number(b[10] || 0) - Number(a[10] || 0));
      const top = leads.slice(0, 5).map(r => `${r[5] || '(ẩn danh)'} (${Number(r[10] || 0)})`).join('\n');
      const sold = list.filter(r => String(r[17] || '').trim() === 'Đã bán').length;
      const analyzed = list.filter(r => [r[8],r[9],r[10],r[11]].some(v => v !== '' && v !== null && v !== undefined)).length;
      const pending = Math.max(0, list.length - analyzed);
      const posts = list.filter(r => String(r[3]||'') === 'Bài viết').length;
      const comments = list.filter(r => String(r[3]||'') === 'Bình luận').length;
      const stat = `${posts} bài | ${comments} comment | ${analyzed} đã phân tích | ${pending} chờ AI`;
      const oldNote = String(prev[11] || '').split('\n').filter(x => !/\d+ bài \| (?:\d+ comment \| )?\d+ đã phân tích \| \d+ chờ AI/.test(x)).join('\n').trim();

      output.push([
        name,
        url,
        s[1] || prev[2] || '',
        prev[3] || '',
        s[5] || prev[4] || '',
        prev[5] || '',
        prev[6] || '',
        leads.length,
        top,
        sold,
        s[6] || prev[10] || 'Thử nghiệm',
        oldNote ? oldNote + '\n' + stat : stat
      ]);
    });

    if (oldLast >= 2) summarySheet.getRange(2, 1, oldLast - 1, 12).clearContent();
    if (output.length) summarySheet.getRange(2, 1, output.length, 12).setValues(output);
    return { groups: output.length };
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


  function repairScanRegistry_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CFG.GROUP_SCAN_SHEET);
    if (!sheet) return { rows: 0 };
    const last = sheet.getLastRow();
    if (last < 2) return { rows: 0 };

    const rows = sheet.getRange(2, 1, last - 1, 16).getValues();
    let touched = 0;
    rows.forEach((r, i) => {
      const rowNum = i + 2;
      const url = String(r[3] || '').trim();
      if (!url) return;
      const key = extractGroupKey_(url);
      if (!key) return;

      if (!r[0]) sheet.getRange(rowNum, 1).setValue('Có');
      if (!r[2]) sheet.getRange(rowNum, 3).setValue('Group ' + key);
      if (!r[4]) sheet.getRange(rowNum, 5).setValue(key);
      if (!r[6]) sheet.getRange(rowNum, 7).setValue('Thử nghiệm');
      if (!r[7]) sheet.getRange(rowNum, 8).setValue(3);
      if (!r[8]) sheet.getRange(rowNum, 9).setValue(100);

      sheet.getRange(rowNum, 11).setFormula(`=IF(OR(H${rowNum}="";J${rowNum}="");"";J${rowNum}+1/H${rowNum})`);
      sheet.getRange(rowNum, 12).setFormula(`=IF(A${rowNum}<>"Có";"TẮT";IF(K${rowNum}="";"CẦN QUÉT";IF(K${rowNum}<=NOW();"CẦN QUÉT";"CHỜ")))`);
      touched += 1;
    });
    return { rows: touched };
  }

  function remapGroupNames_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scanSheet = ss.getSheetByName(CFG.GROUP_SCAN_SHEET);
    const rawSheet = ss.getSheetByName(CFG.RAW_SHEET);
    const oppSheet = ss.getSheetByName(CFG.OPPORTUNITY_SHEET);
    if (!scanSheet || !rawSheet || !oppSheet) return { changed: 0 };

    const map = loadGroupMap_(scanSheet);
    const rawLast = rawSheet.getLastRow();
    const rawRows = rawLast >= 5 ? rawSheet.getRange(5, 1, rawLast - 4, 14).getValues() : [];
    const fileIds = {};

    rawRows.forEach(r => {
      const file = String(r[1] || '').trim();
      const gid = String(r[3] || '').trim().toLowerCase();
      if (!file) return;
      if (!fileIds[file]) fileIds[file] = {};
      if (gid) fileIds[file][gid] = true;
    });

    const fileSingle = {};
    Object.keys(fileIds).forEach(file => {
      const ids = Object.keys(fileIds[file]);
      if (ids.length === 1) fileSingle[file] = ids[0];
    });

    const postMap = {};
    let changed = 0;
    let rawDirty = false;

    rawRows.forEach(r => {
      const file = String(r[1] || '').trim();
      let gid = String(r[3] || '').trim().toLowerCase();
      if (!gid && fileSingle[file]) gid = fileSingle[file];

      let name = String(r[2] || '').trim();
      if (gid && map[gid]) name = map[gid].name;
      else if (gid && (!name || name === 'Group không rõ' || name === 'Group 3')) name = 'Group ' + gid;

      if (String(r[3] || '').trim().toLowerCase() !== gid || String(r[2] || '') !== name) {
        r[3] = gid;
        r[2] = name;
        changed += 1;
        rawDirty = true;
      }
      const postId = String(r[4] || '').trim();
      if (postId) postMap[postId] = { gid, name };
    });

    if (rawDirty && rawRows.length) rawSheet.getRange(5, 1, rawRows.length, 14).setValues(rawRows);

    const oppLast = oppSheet.getLastRow();
    const oppRows = oppLast >= 2 ? oppSheet.getRange(2, 1, oppLast - 1, 20).getValues() : [];
    let oppDirty = false;

    oppRows.forEach(r => {
      const postId = String(r[1] || '').trim();
      const source = postMap[postId];
      let name = source && source.name ? source.name : '';
      if (!name) {
        const key = extractGroupKey_(r[2] || '');
        name = key && map[key] ? map[key].name : String(r[4] || '').trim();
      }
      if (name && String(r[4] || '') !== name) {
        r[4] = name;
        changed += 1;
        oppDirty = true;
      }
    });

    if (oppDirty && oppRows.length) oppSheet.getRange(2, 1, oppRows.length, 20).setValues(oppRows);
    return { changed };
  }

  function syncRawProcessingStatus_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawSheet = ss.getSheetByName(CFG.RAW_SHEET);
    const oppSheet = ss.getSheetByName(CFG.OPPORTUNITY_SHEET);
    if (!rawSheet || !oppSheet) return { rows: 0 };

    const oppLast = oppSheet.getLastRow();
    const state = {};
    if (oppLast >= 2) {
      oppSheet.getRange(2, 1, oppLast - 1, 20).getValues().forEach(r => {
        const pid = String(r[1] || '').trim();
        if (!pid) return;
        state[pid] = [r[8],r[9],r[10],r[11]].some(v => v !== '' && v !== null && v !== undefined);
      });
    }

    const rawLast = rawSheet.getLastRow();
    if (rawLast < 5) return { rows: 0 };
    const rows = rawSheet.getRange(5, 1, rawLast - 4, 14).getValues();
    rows.forEach(r => {
      const pid = String(r[4] || '').trim();
      r[13] = state[pid] ? 'Đã phân tích' : 'Chờ AI';
    });
    rawSheet.getRange(5, 1, rows.length, 14).setValues(rows);
    return { rows: rows.length };
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
    const rows = leadSheet.getRange(2,1,last-1,17).getValues();
    rows.forEach(r => {
      const sourceUrl = normalizeUrl_(r[4] || '');
      const fbUrl = normalizeFacebookProfileUrl_(r[1] || '');
      const key = fbUrl ? `FB|${fbUrl}` : `ANON|${sourceUrl}`;
      if (!key || key === 'ANON|') return;
      state[key] = {
        lastAction:r[11] || '', nextAction:r[12] || '', followUp:r[13] || '',
        conversion:r[14] || '', note:r[15] || '', firstLeadAt:r[16] || ''
      };
    });
    return state;
  }

  function loadExistingPostKeys_(rawSheet, oppSheet) {
    const keys = new Set();
    const rawLast = rawSheet.getLastRow();
    if (rawLast >= 5) {
      rawSheet.getRange(5,5,rawLast-4,2).getValues().forEach(r =>
        makePostKeys_(normalizePostId_(r[0],r[1]),r[1]).forEach(k=>keys.add(k))
      );
    }
    const oppLast = oppSheet.getLastRow();
    if (oppLast >= 2) {
      oppSheet.getRange(2,2,oppLast-1,3).getValues().forEach(r => {
        if(String(r[2]||'')==='Bình luận') return;
        makePostKeys_(normalizePostId_(r[0],r[1]),r[1]).forEach(k=>keys.add(k));
      });
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


  function ensureGroupRegistered_(sheet, groupKey) {
    const key = String(groupKey || '').trim().toLowerCase();
    if (!key) return { name: 'Group không rõ', row: null };

    const row = sheet.getLastRow() + 1;
    const name = 'Group ' + key;
    const url = 'https://www.facebook.com/groups/' + key + '/';
    sheet.getRange(row, 1, 1, 9).setValues([[
      'Có', '', name, url, key, '', 'Thử nghiệm', 3, 100
    ]]);
    sheet.getRange(row, 11).setFormula(`=IF(OR(H${row}="";J${row}="");"";J${row}+1/H${row})`);
    sheet.getRange(row, 12).setFormula(`=IF(A${row}<>"Có";"TẮT";IF(K${row}="";"CẦN QUÉT";IF(K${row}<=NOW();"CẦN QUÉT";"CHỜ")))`);
    sheet.getRange(row, 16).setValue('Tự thêm khi import JSON');
    return { name, row, active: 'Có' };
  }

  function updateGroupScanStatus_(sheet, stats) {
    const now = new Date();
    Object.keys(stats).forEach(groupKey => {
      const s = stats[groupKey];
      if (!s.row) return;
      sheet.getRange(s.row, 10).setValue(now);
      sheet.getRange(s.row, 13).setValue(s.fileName);
      sheet.getRange(s.row, 14).setValue(s.postNew !== undefined ? s.postNew : (s.newCount || 0));
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
    const original = s;
    s = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    if (!/^facebook\.com\//i.test(s)) return normalizeUrl_(original);

    const idMatch = original.match(/[?&]id=(\d+)/i);
    if (/^facebook\.com\/profile\.php/i.test(s) && idMatch) {
      return 'facebook.com/profile.php?id=' + idMatch[1];
    }

    const userMatch = s.match(/^facebook\.com\/groups\/[^/]+\/user\/(\d+)/i);
    if (userMatch) return 'facebook.com/user/' + userMatch[1];

    const pathOnly = s.split('?')[0].split('#')[0].replace(/\/+$/, '');
    return pathOnly.toLowerCase();
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
    analyzeNewPosts,
  };
})();
