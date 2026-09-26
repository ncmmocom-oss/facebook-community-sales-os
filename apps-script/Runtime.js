const RemoteApp = (() => {
  const CFG = {
    VERSION: '1.8.7-lead-gate',
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
    API_DIAG_SHEET: 'NHẬT KÝ API',
    BRIDGE_SERVER: 'https://api.fbaio.org',
    BRIDGE_CLIENT_ID_KEY: 'SOCIAL_AIO_BRIDGE_CLIENT_ID',
    WORKER_POOL_KEY: 'SOCIAL_AIO_WORKER_POOL_V1',
    BRIDGE_STOP_ALL_KEY: 'SOCIAL_AIO_BRIDGE_STOP_ALL',
    BRIDGE_STOP_PREFIX: 'SOCIAL_AIO_BRIDGE_STOP_',
    GROUP_CONTROL_START_COL: 23,
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
      'V1.8.7: Lead Qualification Hard Gate + AI scope AUTO/MANUAL + per-Group AI Context/Offer.\nV1.8.6: Social AIO Group pagination fix — cursor trên result item.\nV1.8.5-diagnostic: API RESPONSE DIAGNOSTIC — kiểm tra raw wrapper, array path, cursor và input mode mà không import dữ liệu.\nV1.8.4-pilot: Pilot chạy 1 Worker (W1); W2/W3 giữ sẵn nhưng tắt mặc định để mở rộng sau.\nV1.8.4-poc: 3 Social AIO Client IDs = 3 worker song song, smart load balancing + Profile affinity.\nV1.8.3-poc: Operator Simple UX — chọn Group, chọn 10/15/20/25 bài, QUÉT; có bộ đếm trạng thái và Retry.\nV1.8.2-poc: Triggerless modeless control center + active-row scan + multi-select queue controls.\nV1.8.1-poc: Sheet-native Group controls + batch selection + stop state + clearer comment URL validation.\nV1.8.0-poc: Official Social AIO HTTP Relay Bridge + direct Group/Post Comment POC.\nV1.7.0: Daily Metrics + Import Log + Nested Comment Intake + Media URLs + Fast Sync + Token Saver.\nAPI key được lưu trong Script Properties, không lưu trong Sheet hoặc GitHub.'
    );
  }

  function showControlCenter(view) {
    ensureV16Sheets_(true);
    const allowed=new Set(['scan','ai','settings']);
    const initial=allowed.has(String(view||''))?String(view):'scan';
    let htmlText=getRemoteHtml_();
    htmlText=htmlText.replace('<body>', '<body data-initial-view="'+initial+'">');
    const html = HtmlService.createHtmlOutput(htmlText)
      .setWidth(720)
      .setHeight(780);
    SpreadsheetApp.getUi().showModelessDialog(html, 'Social AIO Control Center');
  }

  function showImportDialog() {
    return showControlCenter('scan');
  }

  function importJsonFiles(files) {
    if (Array.isArray(files) && files.length === 1 && files[0] && files[0].__command) {
      return handleUiCommand_(files[0]);
    }
    if (!Array.isArray(files) || files.length === 0) throw new Error('Chưa chọn file JSON.');

    const startedMs = Date.now();
    const workerFast = files.some(f => f && f.__workerFast === true);
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
    const postRowMap = loadPostRowMap_(rawSheet, oppSheet);
    const postUpdates = [];

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

          const actor = post.actor || post.author || post.user || (Array.isArray(post.actors) ? post.actors[0] : {}) || {};
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
            postUpdates.push({ postId, commentsCount, reactions, shares, mediaUrls, resultText });
          } else {
            keys.forEach(k => existingPostKeys.add(k));
            rawRows.push([
              now,file.name || '',groupInfo.name,groupKey,postId,url,authorName,authorUrl,message,
              commentsCount,reactions,shares,mediaUrls.length,'Chờ AI',mediaUrls.join('\n'),mediaUrls.length
            ]);
            oppRows.push([
              postDate,postId,url,'Bài viết',groupInfo.name,authorName,authorUrl,message,
              '','','','','','','Chưa tương tác','','','Chưa có',resultText,'Mới',mediaUrls.join('\n'),
              '','','','',''
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

    applyPostMetadataUpdates_(rawSheet, oppSheet, postRowMap, postUpdates);
    writeRowsNewestFirst_(rawSheet, 5, rawRows, 16, [5]);
    writeRowsNewestFirst_(commentSheet, 2, commentRows, 27, [5,7]);
    writeRowsNewestFirst_(oppSheet, 2, oppRows, 26, [2]);

    finalizeGroupStats_(groupStats);
    updateGroupScanStatus_(groupSheet, groupStats);
    logImportRun_(importRunId, groupStats, files.length, Date.now() - startedMs, errors);

    // V1.8.7: manual JSON import is a fallback ingestion path.
    // Auto AI belongs to the Group-scan workflow only; manual imports wait for an explicit AI scope.
    const aiCfg = getAiConfig_();
    const autoAnalyzeRequested = false;
    const refresh = workerFast ? null : refreshCurrentData({ silent:true, fast:true });
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
      newSourceIds: oppRows.map(r=>String(r[1]||'').trim()).filter(Boolean),
      duplicates: duplicateCount,
      durationMs: Date.now() - startedMs,
      workerFast,
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
      '','','','','','','Chờ AI',mediaUrls.join('\n'),'','','',''
    ]);

    ctx.oppRows.push([
      eventDate,sourceId,commentUrl,'Bình luận',groupName,n.authorName,n.authorUrl,evidence,
      '','','','','','','Chưa tương tác','','','Chưa có',resultText,'Mới',mediaUrls.join('\n'),
      '','','','',''
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
    const leadRows=leadSheet.getLastRow()>=2 ? leadSheet.getRange(2,1,leadSheet.getLastRow()-1,21).getValues() : [];
    leadRows.forEach(r=>{
      if(String(r[19]||'').trim()!=='PASS') return;
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

  function loadPostRowMap_(rawSheet, oppSheet) {
    const map = {};
    const rawLast = rawSheet.getLastRow();
    if (rawLast >= 5) {
      rawSheet.getRange(5,5,rawLast-4,1).getDisplayValues().forEach((r,i)=>{
        const id=String(r[0]||'').trim();
        if(id){ if(!map[id])map[id]={}; map[id].rawRow=i+5; }
      });
    }
    const oppLast=oppSheet.getLastRow();
    if(oppLast>=2){
      oppSheet.getRange(2,2,oppLast-1,3).getDisplayValues().forEach((r,i)=>{
        if(String(r[2]||'')==='Bình luận') return;
        const id=String(r[0]||'').trim();
        if(id){ if(!map[id])map[id]={}; map[id].oppRow=i+2; }
      });
    }
    return map;
  }

  function applyPostMetadataUpdates_(rawSheet, oppSheet, rowMap, updates) {
    if(!updates || !updates.length) return {rows:0};
    const uniq={};
    updates.forEach(u=>{ if(u.postId) uniq[u.postId]=u; });
    const ids=Object.keys(uniq);
    if(!ids.length) return {rows:0};

    const rawRows=ids.map(id=>rowMap[id]&&rowMap[id].rawRow).filter(Boolean);
    if(rawRows.length){
      const min=Math.min(...rawRows), max=Math.max(...rawRows);
      const vals=rawSheet.getRange(min,10,max-min+1,7).getValues(); // J:P
      ids.forEach(id=>{
        const meta=rowMap[id]; if(!meta||!meta.rawRow)return;
        const u=uniq[id], r=vals[meta.rawRow-min];
        r[0]=u.commentsCount||0; r[1]=u.reactions||0; r[2]=u.shares||0;
        if ((u.mediaUrls||[]).length) {
          r[3]=u.mediaUrls.length;
          r[5]=u.mediaUrls.join('\n');
          r[6]=u.mediaUrls.length;
        }
      });
      rawSheet.getRange(min,10,vals.length,7).setValues(vals);
    }

    const oppRows=ids.map(id=>rowMap[id]&&rowMap[id].oppRow).filter(Boolean);
    if(oppRows.length){
      const min=Math.min(...oppRows), max=Math.max(...oppRows);
      const vals=oppSheet.getRange(min,19,max-min+1,3).getValues(); // S:U
      ids.forEach(id=>{
        const meta=rowMap[id]; if(!meta||!meta.oppRow)return;
        const u=uniq[id], r=vals[meta.oppRow-min];
        r[0]=u.resultText||r[0];
        if ((u.mediaUrls||[]).length) r[2]=u.mediaUrls.join('\n');
      });
      oppSheet.getRange(min,19,vals.length,3).setValues(vals);
    }
    return {rows:ids.length};
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

  function ensureV16Sheets_(force) {
    const props = PropertiesService.getDocumentProperties();
    const schemaKey = 'SOCIAL_AIO_SCHEMA_VERSION';
    if (!force && props.getProperty(schemaKey) === CFG.VERSION) return;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let cs = ss.getSheetByName(CFG.COMMENT_SHEET);
    if (!cs) cs = ss.insertSheet(CFG.COMMENT_SHEET);
    if (cs.getMaxColumns() < 27) cs.insertColumnsAfter(cs.getMaxColumns(), 27 - cs.getMaxColumns());
    cs.getRange(1,1,1,27).setValues([[
      'Ngày import','File JSON','Nhóm','Group ID','Post ID','URL bài','Comment ID','URL comment','Parent Comment ID',
      'Người comment','Link Facebook','Nội dung comment','Ngày comment','Reaction','Reply','Pain','Intent','Điểm',
      'Phân loại KH','Reply gợi ý','Hành động tiếp theo','Trạng thái xử lý','Media URL',
      'Vai trò mua','Product Fit','Bằng chứng nhu cầu','Lead Gate'
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
    if (opp) {
      if (opp.getMaxColumns() < 26) opp.insertColumnsAfter(opp.getMaxColumns(), 26 - opp.getMaxColumns());
      opp.getRange(1,2).setValue('Source ID');
      opp.getRange(1,21,1,6).setValues([[
        'Media URL','Vai trò mua','Product Fit','Bằng chứng nhu cầu','Lead Gate','Lý do Gate'
      ]]);
    }

    const lead = ss.getSheetByName(CFG.LEAD_SHEET);
    if (lead) {
      if (lead.getMaxColumns() < 21) lead.insertColumnsAfter(lead.getMaxColumns(), 21-lead.getMaxColumns());
      lead.getRange(1,17,1,5).setValues([[
        'Ngày thành KH tiềm năng','Vai trò mua','Product Fit','Lead Gate','Bằng chứng Gate'
      ]]);
    }

    const scan = ss.getSheetByName(CFG.GROUP_SCAN_SHEET);
    if (scan) {
      if (scan.getMaxColumns() < 27) scan.insertColumnsAfter(scan.getMaxColumns(),27-scan.getMaxColumns());
      scan.getRange(1,17,1,6).setValues([[
        'Lượt cập nhật hôm nay','Bản ghi lần cuối','Bài quét lần cuối',
        'Bài mới hôm nay','Comment mới hôm nay','KH mới hôm nay'
      ]]);
      scan.getRange(1,27).setValue('AI Context / Offer');
      setupBridgeControlColumns_(scan);
    }
    props.setProperty(schemaKey, CFG.VERSION);
  }

  function handleUiCommand_(command) {
    const name = String(command.__command || '');
    if (name === 'GET_AI_CONFIG') return getAiConfig_();
    if (name === 'SAVE_AI_CONFIG') return saveAiConfig_(command);
    if (name === 'ANALYZE_NEW') return analyzeNewPosts_({ silent: false });
    if (name === 'ANALYZE_SCOPE') return analyzeByScope_(command);
    if (name === 'TEST_AI') return testAiConnection_();
    if (name === 'GET_AI_PROGRESS') return getAiProgress_();
    if (name === 'AUDIT_CONSISTENCY') return auditConsistency_();
    if (name === 'GET_BRIDGE_CONFIG') return getApiBridgeConfig_();
    if (name === 'SAVE_BRIDGE_CONFIG') return saveApiBridgeConfig_(command);
    if (name === 'TEST_BRIDGE') return testApiBridge_();
    if (name === 'GET_WORKER_POOL') return getWorkerPoolPublic_();
    if (name === 'SAVE_WORKER_POOL') return saveWorkerPool_(command.workers || []);
    if (name === 'TEST_WORKER_POOL') return testWorkerPool_();
    if (name === 'RUN_API_DIAGNOSTIC') return runApiResponseDiagnostic_(command);
    if (name === 'PREPARE_WORKER_BATCH') return prepareWorkerBatch_(command.targetCount, false);
    if (name === 'PREPARE_RETRY_WORKER_BATCH') return prepareWorkerBatch_(command.targetCount, true);
    if (name === 'RUN_WORKER_JOB') return runWorkerJob_(command);
    if (name === 'FINALIZE_WORKER_BATCH') return finalizeWorkerBatch_();
    if (name === 'BRIDGE_SCAN_GROUP') return scanGroupApiBridge_(command.groupUrl, command.targetCount || 25);
    if (name === 'BRIDGE_FETCH_COMMENTS') return fetchCommentsApiBridge_(command.postUrl);
    if (name === 'GET_GROUP_SCAN_CONTROL') return getGroupScanControlState_();
    if (name === 'RUN_ACTIVE_GROUP') return scanActiveGroupApiBridge_(command.targetCount);
    if (name === 'RUN_CHECKED_GROUPS') return scanCheckedGroupsApiBridge_(command.targetCount);
    if (name === 'RETRY_FAILED_GROUPS') return retryFailedGroupsApiBridge_();
    if (name === 'STOP_CHECKED_GROUPS') return stopCheckedGroupsApiBridge_();
    if (name === 'CLEAR_CHECKED_GROUPS') return clearCheckedGroups_();
    if (name === 'SETUP_GROUP_CONTROLS') return setupGroupScanControls_();
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
      analysisMode: p.getProperty('AI_ANALYSIS_MODE') || (((p.getProperty('AI_AUTO_ANALYZE') || 'true') === 'true') ? 'auto_scan' : 'manual'),
      autoAnalyze: (p.getProperty('AI_ANALYSIS_MODE') || (((p.getProperty('AI_AUTO_ANALYZE') || 'true') === 'true') ? 'auto_scan' : 'manual')) === 'auto_scan',
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
    const analysisMode = String(command.analysisMode || (command.autoAnalyze === false ? 'manual' : 'auto_scan')) === 'manual' ? 'manual' : 'auto_scan';
    const autoAnalyze = analysisMode === 'auto_scan';
    const maxRows = Math.max(1, Math.min(200, Number(command.maxRows || 100)));

    if (openaiKey) p.setProperty('OPENAI_API_KEY', openaiKey);
    if (geminiKey) p.setProperty('GEMINI_API_KEY', geminiKey);
    p.setProperty('AI_PROVIDER', provider);
    p.setProperty('AI_MODEL', model);
    p.setProperty('AI_BUSINESS_CONTEXT', businessContext);
    p.setProperty('AI_ANALYSIS_MODE', analysisMode);
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
    return analyzeNewPosts_({ silent: false, scope:'all_waiting' });
  }

  function analyzeByScope_(command) {
    command=command||{};
    let scope=String(command.scope||'all_waiting');
    const options={silent:false,scope};

    if(scope==='selected_groups') {
      const selected=getCheckedGroupRows_();
      if(!selected.length) throw new Error('Chưa tick Group nào trong QUÉT NHÓM.');
      options.scope='groups';
      options.groupNames=selected.map(x=>String(x.name||'')).filter(Boolean);
    } else if(scope==='groups') {
      options.groupNames=(command.groupNames||[]).map(x=>String(x||'')).filter(Boolean);
      if(!options.groupNames.length) throw new Error('Không có Group nào để AI phân tích.');
    } else if(scope==='selected_rows') {
      const ss=SpreadsheetApp.getActiveSpreadsheet();
      const sh=ss.getActiveSheet();
      const ar=sh&&sh.getActiveRange();
      if(!sh || sh.getName()!==CFG.OPPORTUNITY_SHEET || !ar || ar.getRow()<2) {
        throw new Error('Hãy chọn các dòng cần phân tích trong sheet CƠ HỘI trước.');
      }
      const start=Math.max(2,ar.getRow());
      const end=ar.getLastRow();
      options.rowNumbers=[];
      for(let r=start;r<=end;r++) options.rowNumbers.push(r);
    } else if(scope==='source_ids') {
      options.sourceIds=(command.sourceIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
      if(!options.sourceIds.length) throw new Error('Không có Source ID mới để AI phân tích.');
    } else if(scope==='legacy_gate') {
      options.scope='legacy_gate';
    } else {
      options.scope='all_waiting';
    }

    return analyzeNewPosts_(options);
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

  function loadGroupAiContextMap_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=ss.getSheetByName(CFG.GROUP_SCAN_SHEET);
    const out={};
    if(!sh || sh.getLastRow()<2) return out;
    const rows=sh.getRange(2,1,sh.getLastRow()-1,27).getDisplayValues();
    rows.forEach(r=>{
      const name=String(r[2]||'').trim();
      const key=String(r[4]||extractGroupKey_(r[3])||'').trim().toLowerCase();
      const ctx=String(r[26]||'').trim();
      if(!ctx) return;
      if(name) out['NAME|'+name]=ctx;
      if(key) out['KEY|'+key]=ctx;
    });
    return out;
  }

  function resolveAiContextForGroup_(groupName,groupKey,cfg,map) {
    const m=map||loadGroupAiContextMap_();
    return String(
      m['NAME|'+String(groupName||'').trim()] ||
      m['KEY|'+String(groupKey||'').trim().toLowerCase()] ||
      (cfg&&cfg.businessContext) || ''
    ).trim();
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

      const scope=String((options&&options.scope)||'all_waiting');
      const groupSet=new Set(((options&&options.groupNames)||[]).map(x=>String(x||'').trim()).filter(Boolean));
      const rowSet=new Set(((options&&options.rowNumbers)||[]).map(x=>Number(x||0)).filter(x=>x>=2));
      const sourceSet=new Set(((options&&options.sourceIds)||[]).map(x=>String(x||'').trim()).filter(Boolean));
      const rows = sheet.getRange(2, 1, last - 1, 26).getValues();
      const contextMap=loadGroupAiContextMap_();
      const candidates = [];

      rows.forEach((r, i) => {
        const rowNumber=i+2;
        const content = String(r[7] || '').trim();
        const priorAnalyzed=[r[8], r[9], r[10], r[11]].some(v => v !== '' && v !== null && v !== undefined);
        const gate=String(r[24]||'').trim();
        const status = String(r[19] || '').trim();
        const group=String(r[4]||'').trim();

        if(!content || status==='Đóng') return;
        if(scope==='groups' && !groupSet.has(group)) return;
        if(scope==='selected_rows' && !rowSet.has(rowNumber)) return;
        if(scope==='source_ids' && !sourceSet.has(String(r[1]||'').trim())) return;
        if(scope==='legacy_gate') {
          if(!priorAnalyzed || gate) return;
        } else if(scope==='selected_rows') {
          // Explicit selection is a force re-analysis action.
        } else {
          // Normal/auto scopes process only genuinely pending sources.
          if(priorAnalyzed || gate) return;
        }

        const sourceType = String(r[3] || 'Bài viết');
        candidates.push({
          rowNumber,
          group,
          author: String(r[5] || ''),
          content: compressEvidenceForAi_(content, sourceType),
          sourceType,
          sourceUrl: String(r[2] || ''),
          offerContext: resolveAiContextForGroup_(group,'',cfg,contextMap),
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
        const result = { version: CFG.VERSION, analyzed: 0, remaining: 0, errors: [], scope };
        if (!silent) SpreadsheetApp.getActive().toast('Không có nguồn phù hợp với phạm vi AI đã chọn.', 'AI PHÂN TÍCH', 5);
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

      const result = { version: CFG.VERSION, runId, analyzed, remaining, errors, provider: cfg.provider, model: actualModel, refresh, scope };

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
              buyer_role: { type: 'string' },
              product_fit: { type: 'string' },
              need_evidence: { type: 'string' },
              need_score: { type: 'integer' },
              fit_score: { type: 'integer' },
              action_score: { type: 'integer' },
              urgency_score: { type: 'integer' },
              reachability_score: { type: 'integer' },
              freshness_score: { type: 'integer' },
              score: { type: 'integer' },
              classification: { type: 'string' },
              value_solution: { type: 'string' },
              suggested_comment: { type: 'string' },
              next_action: { type: 'string' },
              follow_up_days: { type: 'integer' }
            },
            required: [
              'row_number','pain','intent','buyer_role','product_fit','need_evidence',
              'need_score','fit_score','action_score','urgency_score','reachability_score','freshness_score',
              'score','classification','value_solution','suggested_comment','next_action','follow_up_days'
            ],
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
      'Bạn là Community Sales Intelligence Agent cho hệ thống Facebook Community Sales.',
      'Phân tích CHỈ dựa trên evidence được cung cấp; không suy đoán thuộc tính nhạy cảm hay thông tin cá nhân ngoài dữ liệu.',
      'Mục tiêu không phải tìm mọi người có vấn đề. Mục tiêu là phân biệt: (1) người có nhu cầu, (2) người có khả năng là buyer, (3) nhu cầu có phù hợp đúng sản phẩm/dịch vụ đang bán hay không.',
      'buyer_role chỉ được dùng: Có, Không, Chưa rõ. Có = chính người đăng/comment có tín hiệu là người có thể mua/ra quyết định/sử dụng giải pháp. Không = người bán, quảng cáo, chia sẻ kiến thức hoặc không phải đối tượng mua. Chưa rõ = evidence không đủ.',
      'Mỗi input có thể có offerContext. offerContext là ngữ cảnh bán hàng của đúng Group và được ƯU TIÊN để đánh giá Product Fit; Business context toàn cục chỉ là fallback khi offerContext trống.',
      'product_fit chỉ được dùng: Có, Không, Chưa rõ. Có chỉ khi nhu cầu khớp trực tiếp offerContext hoặc Business context fallback. Không khi nhu cầu lệch offer/context. Chưa rõ khi cả hai context trống hoặc evidence không đủ.',
      'Nếu cả offerContext và Business context đều trống: BẮT BUỘC product_fit = Chưa rõ. Không được tự bịa product fit.',
      'need_evidence phải là bằng chứng ngắn, cụ thể từ nội dung cho thấy nhu cầu/ý định; nếu không có thì ghi Không có bằng chứng nhu cầu rõ.',
      'Không coi người bán/quảng cáo là khách hàng chỉ vì họ đăng sản phẩm. Nếu nội dung của họ hữu ích để tham gia thảo luận hoặc có thể chứa buyer trong comment, phân loại là Nguồn hội thoại.',
      'Comment gợi ý phải tự nhiên, hữu ích, không giả vờ đã dùng sản phẩm, không tạo testimonial giả, không spam và không chèn link bán hàng.',
      'Nếu sourceType là Bình luận: coi chính người comment là đối tượng đánh giá; suggested_comment phải là reply nối tiếp hội thoại.',
      'Ưu tiên chiến thuật 8+2: giá trị/chẩn đoán/nối hội thoại trước; CTA chỉ khi buyer intent rõ.',
      'Chấm 6 thành phần độc lập: need_score 0-25; fit_score 0-25; action_score 0-20; urgency_score 0-15; reachability_score 0-10; freshness_score 0-5.',
      'score = tổng 6 thành phần, tối đa 100. fit_score phải rất thấp nếu product_fit = Không hoặc Chưa rõ.',
      'Intent chỉ được dùng: Hỏi kinh nghiệm, Tìm giải pháp, So sánh, Xác thực, Phản đối, Muốn đổi, Muốn mua, Cần mua gấp, Chia sẻ, Thảo luận, Không ưu tiên.',
      'classification là gợi ý sơ bộ: Rất tiềm năng, Tiềm năng, Theo dõi, Nguồn hội thoại, Không phải KH. Code sẽ áp Hard Gate cuối cùng.',
      'Hành động tiếp theo chỉ được dùng: Bỏ qua, Theo dõi, Comment giá trị, Hỏi chẩn đoán, Tạo nhu cầu, Nối tiếp hội thoại, Xử lý phản đối, Gợi ý giải pháp, Mời inbox, Kết bạn, CTA.',
      'follow_up_days: 0 nếu không cần follow-up; nếu cần thì 1-30 ngày.',
      'Business context: ' + (cfg.businessContext || '(CHƯA CẤU HÌNH — không được xác nhận Product Fit)')
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

  function clampScore_(v,min,max) {
    const n=Math.round(Number(v||0));
    return Math.max(min,Math.min(max,isFinite(n)?n:0));
  }

  function applyAiAnalysis_(sheet, analyses) {
    const allowedIntent = new Set(['Hỏi kinh nghiệm','Tìm giải pháp','So sánh','Xác thực','Phản đối','Muốn đổi','Muốn mua','Cần mua gấp','Chia sẻ','Thảo luận','Không ưu tiên']);
    const allowedClass = new Set(['Rất tiềm năng','Tiềm năng','Theo dõi','Nguồn hội thoại','Không phải KH']);
    const allowedAction = new Set(['Bỏ qua','Theo dõi','Comment giá trị','Hỏi chẩn đoán','Tạo nhu cầu','Nối tiếp hội thoại','Xử lý phản đối','Gợi ý giải pháp','Mời inbox','Kết bạn','CTA']);
    const allowedBinary = new Set(['Có','Không','Chưa rõ']);
    const cfg=getAiConfig_();
    const groupContextMap=loadGroupAiContextMap_();
    const now = new Date();

    const valid=(analyses||[])
      .map(a=>({a,row:Number(a.row_number||0)}))
      .filter(x=>x.row>=2&&x.row<=sheet.getLastRow());
    if(!valid.length) return;

    const minRow=Math.min(...valid.map(x=>x.row));
    const maxRow=Math.max(...valid.map(x=>x.row));
    const values=sheet.getRange(minRow,1,maxRow-minRow+1,26).getValues();

    valid.forEach(x=>{
      const a=x.a;
      const idx=x.row-minRow;
      const r=values[idx];
      const intent=allowedIntent.has(String(a.intent))?String(a.intent):'Thảo luận';
      const suggestedClass=allowedClass.has(String(a.classification))?String(a.classification):'Theo dõi';
      const action=allowedAction.has(String(a.next_action))?String(a.next_action):'Theo dõi';
      const buyerRole=allowedBinary.has(String(a.buyer_role))?String(a.buyer_role):'Chưa rõ';
      let productFit=allowedBinary.has(String(a.product_fit))?String(a.product_fit):'Chưa rõ';
      const rowGroup=String(r[4]||'').trim();
      const effectiveContext=resolveAiContextForGroup_(rowGroup,'',cfg,groupContextMap);
      if(!effectiveContext) productFit='Chưa rõ';

      const needScore=clampScore_(a.need_score,0,25);
      const fitScore=clampScore_(a.fit_score,0,25);
      const actionScore=clampScore_(a.action_score,0,20);
      const urgencyScore=clampScore_(a.urgency_score,0,15);
      const reachScore=clampScore_(a.reachability_score,0,10);
      const freshScore=clampScore_(a.freshness_score,0,5);
      const componentsPresent=['need_score','fit_score','action_score','urgency_score','reachability_score','freshness_score']
        .some(k=>a[k]!==undefined&&a[k]!==null&&a[k]!=='');
      const score=componentsPresent
        ? needScore+fitScore+actionScore+urgencyScore+reachScore+freshScore
        : clampScore_(a.score,0,100);

      let gate='WATCH';
      if(buyerRole==='Không' || productFit==='Không') gate='FAIL';
      else if(buyerRole==='Có' && productFit==='Có' && score>=65) gate='PASS';

      let classification=suggestedClass;
      if(gate==='PASS') classification=score>=80?'Rất tiềm năng':'Tiềm năng';
      else if(gate==='FAIL') classification=suggestedClass==='Nguồn hội thoại'?'Nguồn hội thoại':'Không phải KH';
      else if(!['Nguồn hội thoại','Không phải KH'].includes(suggestedClass)) classification='Theo dõi';

      const days=Math.max(0,Math.min(30,Math.round(Number(a.follow_up_days||0))));
      const follow=days>0?new Date(now.getTime()+days*86400000):'';
      let status='Theo dõi';
      if(gate==='PASS') status='Đang xử lý';
      if(gate==='FAIL'&&classification==='Không phải KH') status='Đóng';

      const evidence=String(a.need_evidence||'').trim() || 'Không có bằng chứng nhu cầu rõ';
      const gateReason=[
        'Buyer='+buyerRole,
        'Fit='+productFit,
        'Context='+(effectiveContext?'Có':'Thiếu'),
        'Need '+needScore+'/25',
        'Fit '+fitScore+'/25',
        'Action '+actionScore+'/20',
        'Urgency '+urgencyScore+'/15',
        'Reach '+reachScore+'/10',
        'Fresh '+freshScore+'/5',
        'Total='+score
      ].join(' | ');

      r[8]=String(a.pain||'');
      r[9]=intent;
      r[10]=score;
      r[11]=classification;
      r[12]=String(a.value_solution||'');
      r[13]=String(a.suggested_comment||'');
      r[15]=action;
      r[16]=follow;
      r[19]=status;
      r[21]=buyerRole;
      r[22]=productFit;
      r[23]=evidence;
      r[24]=gate;
      r[25]=gateReason;
    });

    sheet.getRange(minRow,1,values.length,26).setValues(values);
  }

  function normalizeAndDedupeCommentSheet_(sheet) {
    const last = sheet.getLastRow();
    if (last < 2) return { removed:0, rows:0 };
    const rows = sheet.getRange(2,1,last-1,27).getValues();
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
    sheet.getRange(2,1,rows.length,27).clearContent();
    if (groups.length) {
      sheet.getRange(2,5,groups.length,4).setNumberFormat('@');
      sheet.getRange(2,1,groups.length,27).setValues(groups);
    }
    return { removed, rows:groups.length };
  }

  function normalizeAndDedupeOpportunitySheet_(sheet) {
    const last = sheet.getLastRow();
    if (last < 2) return { removed:0, repairedIds:0, rows:0 };
    const rows = sheet.getRange(2,1,last-1,26).getValues();
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
    sheet.getRange(2,1,rows.length,26).clearContent();
    if (groups.length) {
      sheet.getRange(2,2,groups.length,1).setNumberFormat('@');
      sheet.getRange(2,1,groups.length,26).setValues(groups);
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
      os.getRange(2,1,ol-1,26).getValues().forEach(r=>{
        if(String(r[3]||'')!=='Bình luận') return;
        const id=String(r[1]||'').replace(/^C:/,'');
        if(id) map[id]=r;
      });
    }

    const cl=cs.getLastRow();
    if(cl<2) return {rows:0};
    const rows=cs.getRange(2,1,cl-1,27).getValues();
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
      r[23]=o[21]||'';
      r[24]=o[22]||'';
      r[25]=o[23]||'';
      r[26]=o[24]||'';
    });
    cs.getRange(2,1,rows.length,27).setValues(rows);
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
      newLeads: leadStats.newCount || 0,
      groups: groupStats.groups,
      queue: queueStats.count,
      dailyStats: dailyStats.rows
    };

    if (!silent) {
      SpreadsheetApp.getActive().toast(
        `V${CFG.VERSION} | ${fast?'FAST':'FULL'} | Trùng xóa: ${result.rawRemoved + result.commentRemoved + result.oppRemoved} | Comment: ${result.comments} | KH PASS: ${result.leads} | KH mới: ${result.newLeads}`,
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
    const opp = oppLast >= 2 ? oppSheet.getRange(2,1,oppLast-1,26).getValues() : [];
    const existing = loadExistingLeadState_(leadSheet);
    const oldLast=leadSheet.getLastRow();
    const oldRows=oldLast>=2 ? leadSheet.getRange(2,1,oldLast-1,21).getValues() : [];
    const grouped = {};
    const evaluatedKeys=new Set();
    const pendingKeys=new Set();
    const opportunityKeys=new Set();

    opp.forEach(r => {
      const sourceUrl = normalizeUrl_(r[2] || '');
      const fbUrl = normalizeFacebookProfileUrl_(r[6] || '');
      const key = fbUrl ? `FB|${fbUrl}` : `ANON|${sourceUrl}`;
      if (!key || key === 'ANON|') return;

      opportunityKeys.add(key);
      const gate=String(r[24]||'').trim();
      if(gate) evaluatedKeys.add(key); else pendingKeys.add(key);
      if(gate!=='PASS') return;

      const classification = String(r[11] || '').trim();
      if (classification !== 'Rất tiềm năng' && classification !== 'Tiềm năng') return;
      if(String(r[21]||'')!=='Có' || String(r[22]||'')!=='Có') return;

      const score = Number(r[10] || 0);
      if (!grouped[key]) grouped[key] = { count:0, best:r, bestScore:score };
      grouped[key].count += 1;
      if (score > grouped[key].bestScore) {
        grouped[key].best = r;
        grouped[key].bestScore = score;
      }
    });

    const passKeys=Object.keys(grouped);
    const passSet=new Set(passKeys);
    const newCount=passKeys.filter(key=>!existing[key] || String(existing[key].gate||'')!=='PASS').length;
    const now = new Date();
    const passRows = passKeys.map(key => {
      const g = grouped[key];
      const r = g.best;
      const old = existing[key] || {};
      return [
        r[5] || '', r[6] || '', r[4] || '', r[3] || '', r[2] || '', r[7] || '', r[8] || '', r[9] || '',
        Number(r[10] || 0), r[11] || '', g.count,
        old.lastAction || r[14] || '', old.nextAction || r[15] || '', old.followUp || r[16] || '',
        old.conversion || r[17] || 'Chưa có', old.note || '', (String(old.gate||'')==='PASS' && old.firstLeadAt) ? old.firstLeadAt : now,
        r[21] || '', r[22] || '', 'PASS', r[23] || ''
      ];
    });

    // Preserve old derived leads only until their source/person is re-qualified.
    // They are visibly marked LEGACY and excluded from every PASS counter.
    const legacyRows=[];
    oldRows.forEach(r=>{
      const sourceUrl=normalizeUrl_(r[4]||'');
      const fbUrl=normalizeFacebookProfileUrl_(r[1]||'');
      const key=fbUrl ? `FB|${fbUrl}` : `ANON|${sourceUrl}`;
      if(!key || key==='ANON|' || passSet.has(key)) return;
      // Drop LEGACY only when all currently-known opportunities for this person
      // have been re-qualified and none PASS. If any source is still ungated,
      // keep the legacy row so partial/manual re-analysis cannot silently lose it.
      if(evaluatedKeys.has(key) && !pendingKeys.has(key)) return;
      const x=r.slice(0,21);
      while(x.length<21) x.push('');
      x[19]='LEGACY';
      x[20]=x[20] || 'Chưa đánh giá lại bằng Lead Qualification Hard Gate V1.8.7';
      legacyRows.push(x);
    });

    const output=passRows.concat(legacyRows).sort((a,b)=>{
      const ga=String(a[19]||'')==='PASS'?1:0;
      const gb=String(b[19]||'')==='PASS'?1:0;
      if(gb!==ga) return gb-ga;
      return Number(b[8]||0)-Number(a[8]||0);
    });

    if (oldLast >= 2) leadSheet.getRange(2,1,oldLast-1,21).clearContent();
    if (output.length) {
      leadSheet.getRange(2,1,output.length,21).setValues(output);
      leadSheet.setRowHeights(2,output.length,42);
      leadSheet.getRange(2,1,output.length,21).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    }
    SpreadsheetApp.flush();

    if (!silent) SpreadsheetApp.getUi().alert(`KH PASS: ${passRows.length} | Mới: ${newCount} | Legacy chờ đánh giá lại: ${legacyRows.length}.`);
    return { count:passRows.length, newCount, legacyCount:legacyRows.length, rows:output.length };
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
    const oppRows = oppLast >= 2 ? oppSheet.getRange(2, 1, oppLast - 1, 26).getValues() : [];
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
        .filter(r => String(r[24] || '').trim()==='PASS')
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
    const rows = last >= 2 ? oppSheet.getRange(2, 1, last - 1, 26).getValues() : [];
    const now = new Date(); now.setHours(23,59,59,999);
    const items = [];

    rows.forEach(r => {
      const score = Number(r[10] || 0);
      const cls = String(r[11] || '').trim();
      const gate = String(r[24] || '').trim();
      const status = String(r[19] || '').trim();
      const follow = r[16] instanceof Date ? r[16] : null;
      const due = follow && follow <= now;
      if (status === 'Đóng' && cls !== 'Nguồn hội thoại') return;

      const actionable =
        gate === 'PASS' ||
        (gate === 'WATCH' && score >= 60) ||
        cls === 'Nguồn hội thoại' ||
        due;
      if (!actionable) return;

      const boost = (due ? 1000 : 0) + (gate === 'PASS' ? 500 : (gate === 'WATCH' ? 100 : 0));
      const stage = gate === 'PASS' ? 'LEAD PASS' : (cls === 'Nguồn hội thoại' ? 'HỘI THOẠI' : (status || 'Theo dõi'));
      items.push({ rank: boost + score, row: [0, r[4] || '', r[5] || '', r[2] || '', score, stage, r[15] || '', r[16] || ''] });
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
    const rows = leadSheet.getRange(2,1,last-1,21).getValues();
    rows.forEach(r => {
      const sourceUrl = normalizeUrl_(r[4] || '');
      const fbUrl = normalizeFacebookProfileUrl_(r[1] || '');
      const key = fbUrl ? `FB|${fbUrl}` : `ANON|${sourceUrl}`;
      if (!key || key === 'ANON|') return;
      state[key] = {
        lastAction:r[11] || '', nextAction:r[12] || '', followUp:r[13] || '',
        conversion:r[14] || '', note:r[15] || '', firstLeadAt:r[16] || '',
        buyerRole:r[17] || '', productFit:r[18] || '', gate:r[19] || '', evidence:r[20] || ''
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


  // ============================================================
  // V1.8.0 POC - Official Social AIO HTTP Relay Bridge
  // Official contract:
  // POST https://api.fbaio.org/call
  // { id: CLIENT_ID, apiname: API_ID, apiparams: {...} }
  // CLIENT_ID is obtained from Social AIO > Automation > APIs > Connect.
  // Never store Facebook cookies/access tokens in Sheet/GitHub.
  // ============================================================


  function getApiBridgeConfig_() {
    const id = String(
      PropertiesService.getDocumentProperties().getProperty(CFG.BRIDGE_CLIENT_ID_KEY) || ''
    ).trim();
    return {
      version:CFG.VERSION,
      relay:CFG.BRIDGE_SERVER,
      configured:!!id,
      clientIdMasked:id ? maskBridgeClientId_(id) : ''
    };
  }

  function saveApiBridgeConfig_(command) {
    const id=String(command.clientId || '').trim();
    if (!id) throw new Error('CLIENT_ID đang trống.');
    if (id.length < 6 || id.length > 200) throw new Error('CLIENT_ID không hợp lệ.');
    PropertiesService.getDocumentProperties().setProperty(CFG.BRIDGE_CLIENT_ID_KEY,id);
    return getApiBridgeConfig_();
  }

  function testApiBridge_() {
    const started=Date.now();
    const versionResult=callSocialAioApi_('get_ext_version',{});
    let profileResult=null;
    try { profileResult=callSocialAioApi_('get_my_profile_lite',{}); } catch (_) {}
    const version=pickBridgeValue_(versionResult,['version']) || compactBridgePreview_(versionResult,120);
    const profile=pickBridgeValue_(profileResult,['name','profile.name']) || '';
    return {
      ok:true,
      version:CFG.VERSION,
      relay:CFG.BRIDGE_SERVER,
      clientId:maskBridgeClientId_(getBridgeClientId_()),
      socialAioVersion:version || 'OK',
      profile,
      durationMs:Date.now()-started
    };
  }

  function normalizeGroupTarget_(value) {
    const n=Number(value||25);
    if(n<=10) return 10;
    if(n<=15) return 15;
    if(n<=20) return 20;
    return 25;
  }

  function scanGroupApiBridge_(groupUrl,targetCount,groupKey,clientId,workerFast) {
    groupUrl=String(groupUrl || '').trim();
    if(!/facebook\.com\/groups\//i.test(groupUrl)) {
      throw new Error('Hãy nhập URL Group Facebook hợp lệ.');
    }

    const target=normalizeGroupTarget_(targetCount);
    const started=Date.now();
    const pageBudgetMs=60000;
    const seenPost={};
    const seenCursor={};
    const posts=[];
    let cursor='';
    let nextCursor='';
    let pages=0;
    let exhausted=false;
    let stopped=false;
    const relayClient=String(clientId||'').trim() || getBridgeClientId_();

    while(posts.length<target && pages<30 && (Date.now()-started)<pageBudgetMs) {
      if(groupKey && isGroupStopRequested_(groupKey)) {
        stopped=true;
        break;
      }

      const apiResult=callSocialAioApiWithClient_(relayClient,'get_list_fb_group_posts',{
        url:groupUrl,
        sorting:'Newest Posts',
        cursor:cursor || ''
      });
      pages++;

      const pagePosts=findBridgeArray_(apiResult,['posts']);
      if(!pagePosts.length) {
        exhausted=true;
        nextCursor='';
        break;
      }

      pagePosts.forEach(p=>{
        if(posts.length>=target) return;
        const u=String((p&&(p.url||p.permalink_url||p.permalink))||'').trim();
        const id=String((p&&(p.post_id||p.postId||p.id))||'').trim();
        const k=id ? ('ID|'+id) : ('URL|'+normalizeUrl_(u));
        if(!k || seenPost[k]) return;
        seenPost[k]=true;
        posts.push(p);
      });

      nextCursor=findBridgeCursor_(apiResult)||'';
      if(!nextCursor || nextCursor===cursor || seenCursor[nextCursor]) {
        exhausted=true;
        break;
      }
      seenCursor[nextCursor]=true;
      cursor=nextCursor;
    }

    if(!posts.length) {
      throw new Error('API trả về nhưng không tìm thấy post cho Group này.');
    }

    const selectedPosts=posts.slice(0,target);
    const fileName='api_posts_'+(extractGroupKey_(groupUrl)||'group')+'_'+
      Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss')+'.json';

    // Three workers may fetch concurrently, but Sheet dedupe/write must be serialized.
    const lock=LockService.getDocumentLock();
    if(!lock.tryLock(120000)) throw new Error('Sheet đang bận ghi dữ liệu từ Worker khác. Hãy RETRY.');
    let imported;
    try{
      imported=importJsonFiles([{
        name:fileName,
        text:JSON.stringify(selectedPosts),
        __workerFast:!!workerFast
      }]);
    }finally{
      lock.releaseLock();
    }

    return {
      ok:true,
      version:CFG.VERSION,
      groupUrl,
      targetCount:target,
      postsRead:selectedPosts.length,
      pages,
      exhausted,
      stopped,
      incomplete:selectedPosts.length<target,
      nextCursor:nextCursor||'',
      imported,
      durationMs:Date.now()-started
    };
  }

  function fetchCommentsApiBridge_(postUrl) {
    postUrl=String(postUrl || '').trim();
    if(!postUrl) throw new Error('Hãy nhập URL bài Facebook.');
    if (/facebook\.com\/groups\/[^\/?#]+\/?(?:[?#].*)?$/i.test(postUrl)) {
      throw new Error('URL đang nhập là URL NHÓM, không phải URL BÀI VIẾT. Muốn lấy comment hãy dùng URL post/permalink cụ thể.');
    }
    const started=Date.now();
    const apiResult=callSocialAioApi_('get_list_fb_comment',{
      url:postUrl,
      type:'Newest',
      cursor:''
    });
    const comments=findBridgeArray_(apiResult,['comments']);
    if(!comments.length) {
      return {
        ok:true,
        version:CFG.VERSION,
        postUrl,
        commentsRead:0,
        nextCursor:findBridgeCursor_(apiResult)||'',
        responsePreview:compactBridgePreview_(apiResult,700),
        imported:null,
        durationMs:Date.now()-started
      };
    }
    const postId=normalizePostId_('',postUrl)||'post';
    const fileName='api_comments_'+postId+'_'+
      Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss')+'.json';
    const imported=importJsonFiles([{name:fileName,text:JSON.stringify(comments)}]);
    return {
      ok:true,
      version:CFG.VERSION,
      postUrl,
      commentsRead:comments.length,
      nextCursor:findBridgeCursor_(apiResult)||'',
      imported,
      durationMs:Date.now()-started
    };
  }


  // ============================================================
  // V1.8.1 POC - QUÉT NHÓM operator controls inside sheet
  // W: checkbox selection
  // X: per-row command (▶ QUÉT / ■ DỪNG)
  // Y: API status
  // Z: API detail
  // Q:V daily counters are preserved but hidden to keep controls adjacent to Ghi chú.
  // ============================================================

  function setupBridgeControlColumns_(sheet) {
    if (!sheet) return { rows:0 };
    if (sheet.getMaxColumns() < 26) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), 26 - sheet.getMaxColumns());
    }

    sheet.getRange(1,9).setValue('Số bài/lần');
    sheet.getRange(1,23,1,4).setValues([[
      'Chọn','Trạng thái','Tiến độ','Lỗi / Ghi chú'
    ]]);
    sheet.getRange(1,23,1,4)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    const last=Math.max(2,sheet.getLastRow());
    const n=Math.max(1,last-1);

    // Optional affinity: blank/AUTO = smart dispatcher; W1/W2/W3 pins a Group.
    const profileRule=SpreadsheetApp.newDataValidation()
      .requireValueInList(['AUTO','W1','W2','W3'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(2,2,n,1).setDataValidation(profileRule);

    // Operator target: only 10/15/20/25 posts per selected Group.
    const targetRule=SpreadsheetApp.newDataValidation()
      .requireValueInList(['10','15','20','25'], true)
      .setAllowInvalid(false)
      .build();
    const targetRange=sheet.getRange(2,9,n,1);
    targetRange.setDataValidation(targetRule);
    const targetValues=targetRange.getValues();
    let targetDirty=false;
    targetValues.forEach(r=>{
      const v=Number(r[0]||0);
      if(![10,15,20,25].includes(v)) {
        r[0]=25;
        targetDirty=true;
      }
    });
    if(targetDirty) targetRange.setValues(targetValues);

    sheet.getRange(2,23,n,1).insertCheckboxes();

    // V1.8.1 used X as a command dropdown. From V1.8.3+ X:Y:Z are output-only
    // status/progress/error columns, so remove every legacy validation rule first.
    sheet.getRange(2,24,n,3).clearDataValidations();

    const statusRange=sheet.getRange(2,24,n,1);
    const statusValues=statusRange.getDisplayValues();
    let statusDirty=false;
    statusValues.forEach(r=>{
      const current=String(r[0]||'').trim();
      if(!current || ['▶ QUÉT','■ DỪNG','ĐANG QUÉT…','SẴN SÀNG'].includes(current)){
        r[0]='CHỜ';
        statusDirty=true;
      }
    });
    if(statusDirty) statusRange.setValues(statusValues);

    sheet.setColumnWidth(9,90);
    sheet.setColumnWidth(23,60);
    sheet.setColumnWidth(24,110);
    sheet.setColumnWidth(25,270);
    sheet.setColumnWidth(26,300);
    sheet.getRange(2,23,n,4).setVerticalAlignment('middle');
    sheet.getRange(2,25,n,2).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    try { sheet.hideColumns(17,6); } catch (_) {}
    return { rows:n };
  }

  function setupGroupScanControls_() {
    ensureV16Sheets_(true);
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sheet=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    const schema=setupBridgeControlColumns_(sheet);
    SpreadsheetApp.flush();
    return {
      version:CFG.VERSION,
      rows:schema.rows,
      mode:'SIDEBAR_CONTROL',
      triggerRequired:false
    };
  }

  function scanActiveGroupApiBridge_(targetOverride) {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sheet=ss.getActiveSheet();
    if(!sheet || sheet.getName()!==CFG.GROUP_SCAN_SHEET) {
      throw new Error('Hãy mở sheet QUÉT NHÓM và chọn một ô trên dòng Group cần quét.');
    }
    const range=sheet.getActiveRange();
    const row=range ? range.getRow() : 0;
    if(row<2) throw new Error('Hãy chọn một dòng Group từ dòng 2 trở xuống.');
    return scanGroupRowApiBridge_(row,{source:'ACTIVE_ROW',targetCount:targetOverride});
  }


  function groupStopKey_(groupKey) {
    return CFG.BRIDGE_STOP_PREFIX + String(groupKey || '').toLowerCase();
  }

  function clearGroupStop_(groupKey) {
    if(groupKey) PropertiesService.getDocumentProperties().deleteProperty(groupStopKey_(groupKey));
  }

  function isGroupStopRequested_(groupKey) {
    const p=PropertiesService.getDocumentProperties();
    return p.getProperty(CFG.BRIDGE_STOP_ALL_KEY)==='1' ||
      (groupKey && p.getProperty(groupStopKey_(groupKey))==='1');
  }

  function setGroupRowStatus_(sheet,row,status,progress,note) {
    sheet.getRange(row,24).setValue(status || '');
    if(progress!==undefined) sheet.getRange(row,25).setValue(String(progress || '').slice(0,1500));
    if(note!==undefined) sheet.getRange(row,26).setValue(String(note || '').slice(0,2000));

    const cell=sheet.getRange(row,24);
    if(status==='ĐANG QUÉT') cell.setBackground('#fff2cc');
    else if(status==='XONG') cell.setBackground('#d9ead3');
    else if(status==='THIẾU') cell.setBackground('#fce5cd');
    else if(status==='LỖI') cell.setBackground('#f4cccc');
    else if(/^DỪNG/.test(status||'')) cell.setBackground('#d9d9d9');
    else cell.setBackground(null);
  }

  function requestStopGroupRow_(row) {
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const groupUrl=String(sheet.getRange(row,4).getDisplayValue()||'').trim();
    const groupKey=String(sheet.getRange(row,5).getDisplayValue()||extractGroupKey_(groupUrl)||'').trim().toLowerCase();
    if(groupKey) PropertiesService.getDocumentProperties().setProperty(groupStopKey_(groupKey),'1');
    setGroupRowStatus_(sheet,row,'DỪNG YÊU CẦU','Đang chờ dừng','Sẽ dừng sau API call/page hiện tại.');
    SpreadsheetApp.flush();
    return { ok:true, row, groupKey, stopRequested:true };
  }

  function scanGroupRowApiBridge_(row,options) {
    options=options||{};
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sheet=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    if(row<2 || row>sheet.getLastRow()) throw new Error('Dòng nhóm không hợp lệ: '+row);

    const name=String(sheet.getRange(row,3).getDisplayValue()||'').trim() || ('Group dòng '+row);
    const groupUrl=String(sheet.getRange(row,4).getDisplayValue()||'').trim();
    const groupKey=String(sheet.getRange(row,5).getDisplayValue()||extractGroupKey_(groupUrl)||'').trim().toLowerCase();
    const target=normalizeGroupTarget_(options.targetCount || sheet.getRange(row,9).getValue() || 25);

    if(!/facebook\.com\/groups\//i.test(groupUrl)) {
      throw new Error('Dòng '+row+' không có URL Group Facebook hợp lệ.');
    }

    const currentStatus=String(sheet.getRange(row,24).getDisplayValue()||'');
    if(currentStatus==='ĐANG QUÉT' && options.source!=='BATCH' && options.source!=='RETRY') {
      return {ok:false,alreadyRunning:true,row,name,groupUrl,targetCount:target};
    }

    sheet.getRange(row,9).setValue(target);
    clearGroupStop_(groupKey);
    setGroupRowStatus_(sheet,row,'ĐANG QUÉT','0/'+target+' bài','');
    SpreadsheetApp.flush();

    const started=Date.now();
    try {
      const result=scanGroupApiBridge_(groupUrl,target,groupKey);
      const imported=result.imported||{};
      const stopped=!!result.stopped || isGroupStopRequested_(groupKey);

      sheet.getRange(row,10).setValue(new Date());
      sheet.getRange(row,14).setValue(Number(imported.postImported||0));

      const progress=[
        (result.postsRead||0)+'/'+target+' bài',
        (imported.postImported||0)+' mới',
        (imported.duplicates||0)+' trùng',
        (result.pages||1)+' page',
        (Math.round((Date.now()-started)/100)/10)+'s'
      ].join(' • ');

      let status='XONG';
      let note='';
      if(stopped) {
        status='DỪNG';
        note='Đã dừng theo yêu cầu.';
      } else if((result.postsRead||0)<target) {
        status='THIẾU';
        note='API dừng ở '+(result.postsRead||0)+'/'+target+' bài'+
          (result.nextCursor ? ' trước time budget.' : ' vì không còn cursor.');
      }

      setGroupRowStatus_(sheet,row,status,progress,note);
      clearGroupStop_(groupKey);
      SpreadsheetApp.flush();
      return Object.assign({},result,{row,name,groupKey,status,targetCount:target,stopped,incomplete:status==='THIẾU',progress,note});
    } catch(err) {
      const msg=String(err.message||err);
      setGroupRowStatus_(sheet,row,'LỖI','0/'+target+' bài',msg);
      SpreadsheetApp.flush();
      return {
        ok:false,row,name,groupKey,groupUrl,targetCount:target,status:'LỖI',
        error:msg,durationMs:Date.now()-started
      };
    }
  }

  function getCheckedGroupRows_() {
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const last=sheet.getLastRow();
    if(last<2) return [];
    const values=sheet.getRange(2,1,last-1,26).getValues();
    const out=[];
    values.forEach((r,i)=>{
      if(r[22]===true) {
        const row=i+2;
        const url=String(r[3]||'').trim();
        if(!url) return;
        out.push({
          row,
          name:String(r[2]||'').trim() || ('Group '+String(r[4]||'')),
          profile:String(r[1]||'').trim() || 'AUTO',
          url,
          groupKey:String(r[4]||extractGroupKey_(url)||'').trim().toLowerCase(),
          targetCount:normalizeGroupTarget_(r[8]||25),
          status:String(r[23]||'')
        });
      }
    });
    return out;
  }

  function getGroupScanControlState_() {
    ensureV16Sheets_(false);
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const selected=getCheckedGroupRows_();
    const last=sheet.getLastRow();
    const counts={running:0,done:0,error:0,stopped:0,incomplete:0,waiting:0};
    if(last>=2) {
      sheet.getRange(2,24,last-1,1).getDisplayValues().forEach(r=>{
        const s=String(r[0]||'');
        if(s==='ĐANG QUÉT') counts.running++;
        else if(s==='XONG') counts.done++;
        else if(s==='LỖI') counts.error++;
        else if(/^DỪNG/.test(s)) counts.stopped++;
        else if(s==='THIẾU') counts.incomplete++;
        else counts.waiting++;
      });
    }
    return {
      version:CFG.VERSION,
      selectedCount:selected.length,
      selectedTargetTotal:selected.reduce((sum,x)=>sum+Number(x.targetCount||0),0),
      runningCount:counts.running,
      doneCount:counts.done,
      errorCount:counts.error,
      stoppedCount:counts.stopped,
      incompleteCount:counts.incomplete,
      waitingCount:counts.waiting,
      selected:selected.slice(0,30)
    };
  }

  function getWorkerBySlot_(slot) {
    const s=String(slot||'').trim().toUpperCase();
    const w=getWorkerPoolRaw_().find(x=>x.slot===s);
    if(!w || !w.enabled || !w.clientId) throw new Error('Worker '+s+' chưa được cấu hình/enable.');
    return w;
  }

  function runWorkerJob_(command) {
    ensureV16Sheets_(false);
    const row=Number(command.row||0);
    const target=normalizeGroupTarget_(command.targetCount||25);
    const worker=getWorkerBySlot_(command.workerSlot);
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sheet=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    if(row<2 || row>sheet.getLastRow()) throw new Error('Dòng Group không hợp lệ.');

    const name=String(sheet.getRange(row,3).getDisplayValue()||'').trim() || ('Group '+row);
    const groupUrl=String(sheet.getRange(row,4).getDisplayValue()||'').trim();
    const groupKey=String(sheet.getRange(row,5).getDisplayValue()||extractGroupKey_(groupUrl)||'').trim().toLowerCase();
    if(!/facebook\.com\/groups\//i.test(groupUrl)) throw new Error('Dòng '+row+' không có URL Group hợp lệ.');

    sheet.getRange(row,9).setValue(target);
    clearGroupStop_(groupKey);
    const workerTag=worker.slot + (worker.profile?(' · '+worker.profile):(' · '+worker.label));
    setGroupRowStatus_(sheet,row,'ĐANG QUÉT',workerTag+' • 0/'+target+' bài','');
    SpreadsheetApp.flush();

    const started=Date.now();
    try{
      const result=scanGroupApiBridge_(groupUrl,target,groupKey,worker.clientId,true);
      const imported=result.imported||{};
      const stopped=!!result.stopped || isGroupStopRequested_(groupKey);

      sheet.getRange(row,10).setValue(new Date());
      sheet.getRange(row,14).setValue(Number(imported.postImported||0));

      const progress=[
        worker.slot,
        (result.postsRead||0)+'/'+target+' bài',
        (imported.postImported||0)+' mới',
        (imported.duplicates||0)+' trùng',
        (result.pages||1)+' page',
        (Math.round((Date.now()-started)/100)/10)+'s'
      ].join(' • ');

      let status='XONG', note='';
      if(stopped){status='DỪNG';note='Đã dừng theo yêu cầu.';}
      else if((result.postsRead||0)<target){
        status='THIẾU';
        note='API dừng ở '+(result.postsRead||0)+'/'+target+' bài'+
          (result.nextCursor?' trước time budget.':' vì không còn cursor.');
      }

      setGroupRowStatus_(sheet,row,status,progress,note);
      if(status==='XONG') sheet.getRange(row,23).setValue(false);
      clearGroupStop_(groupKey);
      SpreadsheetApp.flush();

      return Object.assign({},result,{
        row,name,groupKey,status,targetCount:target,
        workerSlot:worker.slot,workerProfile:worker.profile||'',workerLabel:worker.label||'',
        stopped,incomplete:status==='THIẾU',progress,note
      });
    }catch(err){
      const msg=String(err.message||err);
      setGroupRowStatus_(sheet,row,'LỖI',worker.slot+' • 0/'+target+' bài',msg);
      SpreadsheetApp.flush();
      return {
        ok:false,row,name,groupKey,groupUrl,targetCount:target,status:'LỖI',
        workerSlot:worker.slot,workerProfile:worker.profile||'',workerLabel:worker.label||'',
        error:msg,durationMs:Date.now()-started
      };
    }
  }

  function finalizeWorkerBatch_() {
    const started=Date.now();
    const refresh=refreshCurrentData({silent:true,fast:true});
    const aiCfg=getAiConfig_();
    SpreadsheetApp.flush();
    return {
      version:CFG.VERSION,
      refresh,
      analysisMode:aiCfg.analysisMode||'manual',
      autoAnalyzeRequested:!!(aiCfg.configured&&aiCfg.analysisMode==='auto_scan'),
      durationMs:Date.now()-started
    };
  }

  function scanCheckedGroupsApiBridge_(targetOverride) {
    ensureV16Sheets_(false);
    const props=PropertiesService.getDocumentProperties();
    props.deleteProperty(CFG.BRIDGE_STOP_ALL_KEY);

    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const selected=getCheckedGroupRows_();
    if(!selected.length) throw new Error('Chưa chọn Group nào ở cột Chọn.');

    const override=targetOverride ? normalizeGroupTarget_(targetOverride) : 0;
    const started=Date.now();
    const budgetMs=230000;
    const results=[];
    let deferred=0;

    for(let i=0;i<selected.length;i++) {
      if(props.getProperty(CFG.BRIDGE_STOP_ALL_KEY)==='1') break;
      if(Date.now()-started>budgetMs) {
        deferred=selected.length-i;
        break;
      }

      const item=selected[i];
      const target=override || item.targetCount || 25;
      if(override) sheet.getRange(item.row,9).setValue(target);

      if(isGroupStopRequested_(item.groupKey)) {
        setGroupRowStatus_(sheet,item.row,'DỪNG','0/'+target+' bài','Bỏ qua theo yêu cầu dừng.');
        results.push({ok:false,stopped:true,row:item.row,name:item.name,targetCount:target});
        continue;
      }

      const r=scanGroupRowApiBridge_(item.row,{source:'BATCH',targetCount:target});
      results.push(r);
      if(r && r.ok && !r.stopped && !r.incomplete) sheet.getRange(item.row,23).setValue(false);
    }

    props.deleteProperty(CFG.BRIDGE_STOP_ALL_KEY);
    SpreadsheetApp.flush();

    const passed=results.filter(r=>r&&r.ok&&!r.stopped&&!r.incomplete).length;
    const incomplete=results.filter(r=>r&&r.incomplete).length;
    const stopped=results.filter(r=>r&&r.stopped).length;
    const failed=results.filter(r=>r&&!r.ok&&!r.stopped).length;
    return {
      version:CFG.VERSION,
      selected:selected.length,
      targetOverride:override||null,
      processed:results.length,
      passed,failed,stopped,incomplete,deferred,
      remainingChecked:getCheckedGroupRows_().length,
      durationMs:Date.now()-started,
      results
    };
  }

  function retryFailedGroupsApiBridge_() {
    ensureV16Sheets_(false);
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const last=sheet.getLastRow();
    if(last<2) return {version:CFG.VERSION,retried:0,passed:0,failed:0,incomplete:0};

    const rows=sheet.getRange(2,1,last-1,26).getValues();
    const retryRows=[];
    rows.forEach((r,i)=>{
      const status=String(r[23]||'');
      if(status==='LỖI' || status==='THIẾU') retryRows.push(i+2);
    });
    if(!retryRows.length) throw new Error('Không có Group LỖI hoặc THIẾU để retry.');

    const started=Date.now();
    const budgetMs=230000;
    const results=[];
    let deferred=0;
    for(let i=0;i<retryRows.length;i++) {
      if(Date.now()-started>budgetMs){deferred=retryRows.length-i;break;}
      results.push(scanGroupRowApiBridge_(retryRows[i],{source:'RETRY'}));
    }
    const passed=results.filter(r=>r&&r.ok&&!r.incomplete&&!r.stopped).length;
    const incomplete=results.filter(r=>r&&r.incomplete).length;
    const failed=results.filter(r=>r&&!r.ok&&!r.stopped).length;
    return {
      version:CFG.VERSION,retried:results.length,passed,failed,incomplete,deferred,
      durationMs:Date.now()-started,results
    };
  }

  function stopCheckedGroupsApiBridge_() {
    const props=PropertiesService.getDocumentProperties();
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const selected=getCheckedGroupRows_();
    selected.forEach(item=>{
      if(item.groupKey) props.setProperty(groupStopKey_(item.groupKey),'1');
      setGroupRowStatus_(sheet,item.row,'DỪNG YÊU CẦU','Đang chờ dừng','Sẽ dừng sau API call/page hiện tại.');
    });
    props.setProperty(CFG.BRIDGE_STOP_ALL_KEY,'1');
    SpreadsheetApp.flush();
    return { ok:true, requested:selected.length };
  }

  function clearCheckedGroups_() {
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const last=sheet.getLastRow();
    if(last>=2) sheet.getRange(2,23,last-1,1).setValue(false);
    return { ok:true };
  }

  function apiBridgeConfigure() {
    const ui = SpreadsheetApp.getUi();
    const props = PropertiesService.getDocumentProperties();
    const current = props.getProperty(CFG.BRIDGE_CLIENT_ID_KEY) || '';
    const res = ui.prompt(
      'SOCIAL AIO API BRIDGE - POC',
      '1) Mở Social AIO > Automation > APIs\n' +
      '2) Bấm Connect và giữ tab APIs đang kết nối\n' +
      '3) Copy CLIENT_ID rồi dán vào đây.\n\n' +
      (current ? 'Đã có Client ID lưu trước đó. Dán ID mới để thay thế.' : 'Chưa có Client ID.'),
      ui.ButtonSet.OK_CANCEL
    );
    if (res.getSelectedButton() !== ui.Button.OK) return { saved:false };
    const id = String(res.getResponseText() || '').trim();
    if (!id) throw new Error('CLIENT_ID đang trống.');
    if (id.length < 6 || id.length > 200) throw new Error('CLIENT_ID không hợp lệ.');
    props.setProperty(CFG.BRIDGE_CLIENT_ID_KEY, id);
    ui.alert(
      'Đã lưu CLIENT_ID trong Document Properties.\n' +
      'Không ghi CLIENT_ID vào ô Sheet hoặc GitHub.\n\n' +
      'Bước tiếp theo: SOCIAL AIO > API BRIDGE POC > TEST KẾT NỐI.'
    );
    return { saved:true, masked:maskBridgeClientId_(id) };
  }

  function apiBridgeClearConfig() {
    PropertiesService.getDocumentProperties().deleteProperty(CFG.BRIDGE_CLIENT_ID_KEY);
    SpreadsheetApp.getUi().alert('Đã xoá CLIENT_ID của API Bridge khỏi Document Properties.');
    return { cleared:true };
  }

  function apiBridgeTest() {
    const started = Date.now();
    const versionResult = callSocialAioApi_('get_ext_version', {});
    let profileResult = null;
    try { profileResult = callSocialAioApi_('get_my_profile_lite', {}); } catch (_) {}

    const version = pickBridgeValue_(versionResult, ['version']) || compactBridgePreview_(versionResult, 120);
    const profile = pickBridgeValue_(profileResult, ['name','profile.name']) || '';
    const id = getBridgeClientId_();

    SpreadsheetApp.getUi().alert(
      '✅ API BRIDGE KẾT NỐI THÀNH CÔNG\n\n' +
      'Relay: ' + CFG.BRIDGE_SERVER + '\n' +
      'Client ID: ' + maskBridgeClientId_(id) + '\n' +
      'Social AIO version: ' + (version || 'OK') + '\n' +
      (profile ? ('Facebook profile: ' + profile + '\n') : '') +
      'Round-trip: ' + (Date.now() - started) + ' ms'
    );
    return {
      ok:true,
      relay:CFG.BRIDGE_SERVER,
      clientId:maskBridgeClientId_(id),
      version,
      profile,
      durationMs:Date.now()-started
    };
  }

  function apiBridgeScanSelectedGroup() {
    const groupUrl = resolveBridgeGroupUrl_();
    const started = Date.now();

    const apiResult = callSocialAioApi_('get_list_fb_group_posts', {
      url: groupUrl,
      sorting: 'Newest Posts',
      cursor: ''
    });

    const posts = findBridgeArray_(apiResult, ['posts']);
    if (!posts.length) {
      throw new Error(
        'API trả về nhưng không tìm thấy mảng posts. Response: ' +
        compactBridgePreview_(apiResult, 700)
      );
    }

    const fileName = 'api_posts_' + (extractGroupKey_(groupUrl) || 'group') + '_' +
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '.json';

    const imported = importJsonFiles([{ name:fileName, text:JSON.stringify(posts) }]);
    const cursor = findBridgeCursor_(apiResult);

    SpreadsheetApp.getUi().alert(
      '✅ POC GROUP SCAN PASS\n\n' +
      'Group: ' + groupUrl + '\n' +
      'API đọc: ' + posts.length + ' post\n' +
      'Post mới: ' + (imported.postImported || 0) + '\n' +
      'Trùng: ' + (imported.duplicates || 0) + '\n' +
      'Cursor tiếp: ' + (cursor ? 'CÓ' : 'KHÔNG') + '\n' +
      'Thời gian: ' + (Date.now() - started) + ' ms\n\n' +
      'Dữ liệu đã đẩy thẳng vào NHẬP JSON / CƠ HỘI, không tạo file thủ công.'
    );

    return {
      ok:true,
      groupUrl,
      postsRead:posts.length,
      nextCursor:cursor || '',
      imported,
      durationMs:Date.now()-started
    };
  }

  function apiBridgeFetchCommentsSelectedPost() {
    const postUrl = resolveBridgePostUrl_();
    const started = Date.now();

    const apiResult = callSocialAioApi_('get_list_fb_comment', {
      url: postUrl,
      type: 'Newest',
      cursor: ''
    });
    const comments = findBridgeArray_(apiResult, ['comments']);
    if (!comments.length) {
      SpreadsheetApp.getUi().alert(
        'API chạy thành công nhưng page đầu không có comment record.\n\n' +
        'Post: ' + postUrl + '\n' +
        'Response: ' + compactBridgePreview_(apiResult, 600)
      );
      return { ok:true, postUrl, commentsRead:0, imported:null, durationMs:Date.now()-started };
    }

    const postId = normalizePostId_('', postUrl) || 'post';
    const fileName = 'api_comments_' + postId + '_' +
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '.json';
    const imported = importJsonFiles([{ name:fileName, text:JSON.stringify(comments) }]);
    const cursor = findBridgeCursor_(apiResult);

    SpreadsheetApp.getUi().alert(
      '✅ POC COMMENT SCAN PASS\n\n' +
      'Post: ' + postUrl + '\n' +
      'API đọc: ' + comments.length + ' comment\n' +
      'Comment mới: ' + (imported.commentImported || 0) + '\n' +
      'Trùng: ' + (imported.duplicates || 0) + '\n' +
      'Cursor tiếp: ' + (cursor ? 'CÓ' : 'KHÔNG') + '\n' +
      'Thời gian: ' + (Date.now() - started) + ' ms'
    );

    return {
      ok:true,
      postUrl,
      commentsRead:comments.length,
      nextCursor:cursor || '',
      imported,
      durationMs:Date.now()-started
    };
  }

  function apiBridgeStatus() {
    const id = PropertiesService.getDocumentProperties().getProperty(CFG.BRIDGE_CLIENT_ID_KEY) || '';
    const msg =
      'SOCIAL AIO API BRIDGE - POC\n\n' +
      'Runtime: V' + CFG.VERSION + '\n' +
      'Relay: ' + CFG.BRIDGE_SERVER + '\n' +
      'CLIENT_ID: ' + (id ? maskBridgeClientId_(id) : 'CHƯA CẤU HÌNH') + '\n\n' +
      'POC Gate:\n' +
      '1. TEST KẾT NỐI\n' +
      '2. Quét Group đang chọn\n' +
      '3. Lấy comment Post đang chọn\n\n' +
      'Lưu ý: tab Social AIO > APIs phải đang Connect để relay chuyển request vào browser.';
    SpreadsheetApp.getUi().alert(msg);
    return { version:CFG.VERSION, relay:CFG.BRIDGE_SERVER, configured:!!id, clientId:id?maskBridgeClientId_(id):'' };
  }

  function callSocialAioApi_(apiName, apiParams) {
    return callSocialAioApiWithClient_(getBridgeClientId_(), apiName, apiParams);
  }

  function apiDiagRaw_(clientId, params) {
    const url=CFG.BRIDGE_SERVER.replace(/\/$/,'')+'/call';
    const started=Date.now();
    const res=UrlFetchApp.fetch(url,{
      method:'post',
      contentType:'application/json',
      muteHttpExceptions:true,
      followRedirects:true,
      payload:JSON.stringify({
        id:String(clientId||'').trim(),
        apiname:'get_list_fb_group_posts',
        apiparams:params||{}
      })
    });
    const text=res.getContentText('UTF-8');
    let parsed=text;
    try{ parsed=JSON.parse(text); }catch(_){}
    return {
      code:res.getResponseCode(),
      text,
      parsed,
      durationMs:Date.now()-started,
      error:findBridgeError_(parsed)
    };
  }

  function apiDiagShape_(value) {
    const arrays=[], cursors=[], seen=[];
    const walk=(v,path,depth)=>{
      if(depth>8 || v===null || v===undefined) return;
      if(Array.isArray(v)){
        const keys=(v[0] && typeof v[0]==='object' && !Array.isArray(v[0])) ? Object.keys(v[0]).slice(0,16) : [];
        arrays.push({path,length:v.length,keys});
        for(let i=0;i<Math.min(2,v.length);i++) walk(v[i],path+'['+i+']',depth+1);
        return;
      }
      if(typeof v==='string'){
        const s=v.trim();
        if((s.startsWith('{')&&s.endsWith('}'))||(s.startsWith('[')&&s.endsWith(']'))){
          try{ walk(JSON.parse(s),path+'<json>',depth+1); }catch(_){}
        }
        return;
      }
      if(typeof v!=='object' || seen.indexOf(v)>=0) return;
      seen.push(v);
      Object.keys(v).forEach(k=>{
        const child=v[k], p=path+'.'+k, lk=String(k).toLowerCase();
        if(/cursor|after|next|page.?info|paging/.test(lk)){
          if(typeof child==='string' || typeof child==='number') cursors.push({path:p,value:String(child)});
          else if(child && typeof child==='object') cursors.push({path:p,value:''});
        }
        walk(child,p,depth+1);
      });
    };
    walk(value,'$',0);
    return {
      rootType:Array.isArray(value)?'array':(value===null?'null':typeof value),
      topKeys:(value&&typeof value==='object'&&!Array.isArray(value)) ? Object.keys(value).slice(0,30) : [],
      arrays,
      cursors
    };
  }

  function apiDiagBestArray_(shape) {
    const scored=(shape.arrays||[]).map(a=>{
      const p=String(a.path||'').toLowerCase();
      const keys=(a.keys||[]).map(x=>String(x).toLowerCase());
      let score=0;
      if(/posts?/.test(p)) score+=100;
      if(/feed|edges|nodes/.test(p)) score+=30;
      if(/result|data/.test(p)) score+=10;
      ['post_id','postid','message','actor','author','url','permalink'].forEach(k=>{
        if(keys.indexOf(k)>=0) score+=12;
      });
      return Object.assign({},a,{score});
    });
    scored.sort((a,b)=>b.score-a.score || Number(b.length||0)-Number(a.length||0));
    return scored[0] || {path:'',length:0,score:-1,keys:[]};
  }

  function apiDiagCursor_(shape) {
    const list=(shape.cursors||[]).filter(x=>x.value);
    const rank=x=>{
      const p=String(x.path||'').toLowerCase();
      if(/next_cursor|end_cursor/.test(p)) return 100;
      if(/after/.test(p)) return 90;
      if(/cursor/.test(p)) return 80;
      if(/next/.test(p)) return 70;
      return 10;
    };
    list.sort((a,b)=>rank(b)-rank(a));
    return list[0] || null;
  }

  function apiDiagVariant_(worker,name,params) {
    const raw=apiDiagRaw_(worker.clientId,params);
    const rawShape=apiDiagShape_(raw.parsed);
    const unwrapped=unwrapBridgeResult_(raw.parsed);
    const unShape=apiDiagShape_(unwrapped);
    const rawBest=apiDiagBestArray_(rawShape);
    const unBest=apiDiagBestArray_(unShape);
    const preferred=findBridgeArray_(raw.parsed,['posts']);
    const unPreferred=findBridgeArray_(unwrapped,['posts']);
    const cursor=findBridgeCursor_(raw.parsed)||'';
    const cursorObj=cursor ? {path:'findBridgeCursor_',value:cursor} : apiDiagCursor_(rawShape);

    return {
      name,
      params,
      httpCode:raw.code,
      durationMs:raw.durationMs,
      bytes:Utilities.newBlob(raw.text||'').getBytes().length,
      error:raw.error||'',
      rawType:rawShape.rootType,
      topKeys:rawShape.topKeys,
      rawPreferred:Array.isArray(preferred)?preferred.length:0,
      rawBestPath:rawBest.path,
      rawBestCount:Number(rawBest.length||0),
      arrays:(rawShape.arrays||[])
        .slice()
        .sort((a,b)=>Number(b.length||0)-Number(a.length||0))
        .slice(0,12)
        .map(a=>a.path+'['+a.length+'] keys='+(a.keys||[]).slice(0,6).join(','))
        .join(' | '),
      cursorPath:cursorObj?cursorObj.path:'',
      cursorValue:cursorObj?cursorObj.value:'',
      cursorSummary:(rawShape.cursors||[])
        .slice(0,15)
        .map(x=>x.path+'='+(x.value?('len:'+String(x.value).length):'<object>'))
        .join(' | '),
      unType:unShape.rootType,
      unPreferred:Array.isArray(unPreferred)?unPreferred.length:0,
      unBestCount:Number(unBest.length||0),
      unCursor:findBridgeCursor_(unwrapped)||''
    };
  }

  function apiDiagConclusion_(results,page2) {
    const first=results[0]||{};
    const uid=results.find(x=>x.name==='UID+sorting');
    const def=results.find(x=>x.name==='URL-default');

    if(first.cursorValue && !first.unCursor){
      return {
        code:'B_UNWRAP_CURSOR',
        title:'Wrapper/unwrap làm mất cursor',
        action:'Giữ pagination metadata trước khi unwrap.'
      };
    }

    if(page2 && page2.rawBestCount>0){
      return {
        code:'B_CURSOR_CONFIRMED',
        title:'Cursor hoạt động nhưng scanner chưa dùng đúng metadata',
        action:'Chuyển scanner sang raw-wrapper pagination.'
      };
    }

    if(uid && uid.rawBestCount>Math.max(first.rawBestCount,first.rawPreferred)){
      return {
        code:'D_UID_MODE',
        title:'Group UID trả nhiều bài hơn URL',
        action:'Ưu tiên Group ID/UID khi gọi API.'
      };
    }

    if(def && def.rawBestCount>Math.max(first.rawBestCount,first.rawPreferred)){
      return {
        code:'E_SORTING_PARAM',
        title:'Bỏ sorting cho response tốt hơn',
        action:'Không truyền sorting label, dùng default API.'
      };
    }

    const mismatch=results.find(x=>
      Number(x.rawBestCount||0)>Number(x.rawPreferred||0) ||
      Number(x.rawBestCount||0)>Number(x.unPreferred||0)
    );
    if(mismatch){
      return {
        code:'A_ARRAY_PARSER',
        title:'Parser đang chọn nhầm/mất array bài viết',
        action:'Parse theo path array thực tế.'
      };
    }

    const max=Math.max.apply(null,results.map(x=>Number(x.rawBestCount||0)).concat([0]));
    if(max<=1 && !results.some(x=>x.cursorValue)){
      return {
        code:'C_UPSTREAM_1_NO_CURSOR',
        title:'Raw API chỉ trả 1 bài và không có cursor',
        action:'API hiện chưa tương đương Bulk Downloader.'
      };
    }

    return {
      code:'Z_UNKNOWN',
      title:'Chưa đủ bằng chứng kết luận',
      action:'Đọc NHẬT KÝ API và bổ sung parser theo schema thật.'
    };
  }

  function ensureApiDiagSheet_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    let sh=ss.getSheetByName(CFG.API_DIAG_SHEET);
    const h=[
      'Thời gian','Diag ID','Group','Group ID','Worker','Variant',
      'HTTP','Latency ms','Bytes','Raw type','Top keys','Preferred posts',
      'Best array path','Best array count','Array summary','Cursor path',
      'Cursor summary','Unwrapped type','Unwrapped posts','Page2 posts',
      'Kết luận','Mã','Version','Ghi chú'
    ];

    if(!sh){
      sh=ss.insertSheet(CFG.API_DIAG_SHEET);
      sh.getRange(1,1,1,h.length).setValues([h]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,h.length)
        .setFontWeight('bold')
        .setBackground('#0b3b70')
        .setFontColor('#ffffff');
      sh.setColumnWidth(3,220);
      sh.setColumnWidth(13,250);
      sh.setColumnWidth(15,500);
      sh.setColumnWidth(17,500);
      sh.setColumnWidth(21,340);
      sh.setColumnWidth(24,400);
    }
    return sh;
  }

  function logApiDiag_(d) {
    const sh=ensureApiDiagSheet_();
    const rows=d.results.map(r=>[
      new Date(),
      d.diagId,
      d.groupName,
      d.groupKey,
      d.workerSlot,
      r.name,
      r.httpCode,
      r.durationMs,
      r.bytes,
      r.rawType,
      (r.topKeys||[]).join(', '),
      r.rawPreferred,
      r.rawBestPath,
      r.rawBestCount,
      r.arrays,
      r.cursorPath,
      r.cursorSummary,
      r.unType,
      r.unPreferred,
      (d.page2&&d.page2.sourceVariant===r.name)?d.page2.rawBestCount:'',
      d.conclusion.title,
      d.conclusion.code,
      CFG.VERSION,
      (r.error?('API error: '+r.error+' | '):'')+d.conclusion.action
    ]);

    if(rows.length){
      sh.insertRowsBefore(2,rows.length);
      sh.getRange(2,1,rows.length,24).setValues(rows);
    }
  }

  function runApiResponseDiagnostic_(command) {
    ensureV16Sheets_(false);

    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet=ss.getActiveSheet();
    const active=activeSheet&&activeSheet.getActiveRange();
    const requestedRow=Number(command&&command.row||0);
    const sh=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    const row=requestedRow>=2 ? requestedRow :
      ((activeSheet&&activeSheet.getName()===CFG.GROUP_SCAN_SHEET&&active)?active.getRow():0);

    if(row<2 || row>sh.getLastRow()){
      throw new Error('Chọn một dòng Group hợp lệ trong QUÉT NHÓM để chẩn đoán.');
    }

    const groupName=String(sh.getRange(row,3).getDisplayValue()||'').trim()||('Group '+row);
    const groupUrl=String(sh.getRange(row,4).getDisplayValue()||'').trim();
    const groupKey=String(sh.getRange(row,5).getDisplayValue()||extractGroupKey_(groupUrl)||'').trim();

    if(!groupUrl) throw new Error('Dòng đang chọn chưa có URL Group.');

    const pool=getWorkerPoolRaw_();
    const worker=pool.find(w=>w.enabled&&w.clientId) || pool.find(w=>w.clientId);
    if(!worker) throw new Error('Chưa có W1 CLIENT_ID.');

    const variants=[
      {name:'URL+sorting',params:{url:groupUrl,sorting:'Newest Posts',cursor:''}}
    ];
    if(groupKey){
      variants.push({
        name:'UID+sorting',
        params:{url:groupKey,sorting:'Newest Posts',cursor:''}
      });
    }
    variants.push({
      name:'URL-default',
      params:{url:groupUrl,cursor:''}
    });

    const results=variants.map(v=>{
      try{
        return apiDiagVariant_(worker,v.name,v.params);
      }catch(e){
        return {
          name:v.name,
          params:v.params,
          httpCode:0,
          durationMs:0,
          bytes:0,
          error:String(e.message||e),
          rawType:'error',
          topKeys:[],
          rawPreferred:0,
          rawBestPath:'',
          rawBestCount:0,
          arrays:'',
          cursorPath:'',
          cursorSummary:'',
          cursorValue:'',
          unType:'error',
          unPreferred:0,
          unBestCount:0,
          unCursor:''
        };
      }
    });

    let page2=null;
    const source=results
      .filter(x=>x.cursorValue)
      .sort((a,b)=>Number(b.rawBestCount||0)-Number(a.rawBestCount||0))[0];

    if(source){
      try{
        const p=apiDiagVariant_(
          worker,
          'PAGE2-probe',
          Object.assign({},source.params,{cursor:source.cursorValue})
        );
        page2={
          sourceVariant:source.name,
          rawBestCount:p.rawBestCount,
          rawPreferred:p.rawPreferred,
          httpCode:p.httpCode,
          durationMs:p.durationMs
        };
      }catch(e){
        page2={
          sourceVariant:source.name,
          rawBestCount:0,
          httpCode:0,
          error:String(e.message||e)
        };
      }
    }

    const conclusion=apiDiagConclusion_(results,page2);
    const diagId='API-'+Utilities.getUuid().slice(0,8);

    logApiDiag_({
      diagId,
      groupName,
      groupKey,
      workerSlot:worker.slot,
      results,
      page2,
      conclusion
    });
    SpreadsheetApp.flush();

    return {
      ok:true,
      version:CFG.VERSION,
      diagId,
      row,
      groupName,
      groupKey,
      workerSlot:worker.slot,
      results:results.map(r=>({
        name:r.name,
        httpCode:r.httpCode,
        durationMs:r.durationMs,
        bytes:r.bytes,
        rawType:r.rawType,
        topKeys:r.topKeys,
        rawPreferred:r.rawPreferred,
        rawBestPath:r.rawBestPath,
        rawBestCount:r.rawBestCount,
        cursorPresent:!!r.cursorValue,
        cursorPath:r.cursorPath,
        unType:r.unType,
        unPreferred:r.unPreferred,
        unCursorPresent:!!r.unCursor,
        error:r.error||''
      })),
      page2,
      conclusion
    };
  }

  function callSocialAioApiWithClient_(clientId, apiName, apiParams) {
    const id=String(clientId || '').trim();
    if(!id) throw new Error('Thiếu CLIENT_ID Social AIO.');
    const url = CFG.BRIDGE_SERVER.replace(/\/$/,'') + '/call';
    const payload = {
      id,
      apiname:String(apiName || '').trim(),
      apiparams:apiParams || {}
    };
    if (!payload.apiname) throw new Error('Thiếu Social AIO API name.');

    const res = UrlFetchApp.fetch(url, {
      method:'post',
      contentType:'application/json',
      payload:JSON.stringify(payload),
      muteHttpExceptions:true,
      followRedirects:true
    });

    const code = res.getResponseCode();
    const text = res.getContentText('UTF-8');
    if (code < 200 || code >= 300) {
      throw new Error('Social AIO relay HTTP ' + code + ': ' + text.slice(0,700));
    }

    let parsed = text;
    try { parsed = JSON.parse(text); } catch (_) {}

    const err = findBridgeError_(parsed);
    if (err) {
      if (/not\s+connected/i.test(err)) {
        throw new Error(
          'Social AIO báo Client not connected. Mở đúng tab Social AIO > Automation > APIs, bấm Connect và giữ tab đó hoạt động. Chi tiết: ' + err
        );
      }
      throw new Error('Social AIO API lỗi: ' + err);
    }
    return unwrapBridgeResult_(parsed);
  }

  function getBridgeClientId_() {
    const props=PropertiesService.getDocumentProperties();
    const legacy=String(props.getProperty(CFG.BRIDGE_CLIENT_ID_KEY) || '').trim();
    if(legacy) return legacy;

    const pool=getWorkerPoolRaw_();
    const w=pool.find(x=>x.enabled && x.clientId);
    if(w) return w.clientId;
    throw new Error('Chưa có CLIENT_ID. Hãy cấu hình ít nhất 1 Worker trong Cấu hình nâng cao.');
  }

  function defaultWorkerPool_() {
    return [1,2,3].map(i=>({
      slot:'W'+i,
      label:'FB-0'+i,
      enabled:i===1,
      clientId:'',
      profile:'',
      socialAioVersion:'',
      latencyMs:0,
      testOk:false,
      lastTestAt:''
    }));
  }

  function getWorkerPoolRaw_() {
    const props=PropertiesService.getDocumentProperties();
    const raw=props.getProperty(CFG.WORKER_POOL_KEY);
    let pool=null;
    if(raw){
      try{ pool=JSON.parse(raw); }catch(_){}
    }
    const defaults=defaultWorkerPool_();
    const bySlot={};
    (Array.isArray(pool)?pool:[]).forEach(w=>{if(w&&w.slot)bySlot[String(w.slot).toUpperCase()]=w;});
    // Seamless migration: the already-working single CLIENT_ID becomes W1 automatically.
    if(!raw){
      const legacy=String(props.getProperty(CFG.BRIDGE_CLIENT_ID_KEY)||'').trim();
      if(legacy) bySlot.W1={slot:'W1',label:'FB-01',enabled:true,clientId:legacy};
    }
    return defaults.map(d=>{
      const x=bySlot[d.slot]||{};
      return Object.assign({},d,x,{
        slot:d.slot,
        label:String(x.label||d.label).trim()||d.label,
        enabled:x.enabled!==undefined ? !!x.enabled : !!d.enabled,
        clientId:String(x.clientId||'').trim(),
        profile:String(x.profile||'').trim(),
        socialAioVersion:String(x.socialAioVersion||'').trim(),
        latencyMs:Number(x.latencyMs||0),
        testOk:!!x.testOk,
        lastTestAt:String(x.lastTestAt||'')
      });
    });
  }

  function saveWorkerPoolRaw_(pool) {
    PropertiesService.getDocumentProperties().setProperty(CFG.WORKER_POOL_KEY,JSON.stringify(pool||[]));
  }

  function workerPublic_(w) {
    return {
      slot:w.slot,
      label:w.label,
      enabled:!!w.enabled,
      configured:!!w.clientId,
      clientIdMasked:w.clientId?maskBridgeClientId_(w.clientId):'',
      profile:w.profile||'',
      socialAioVersion:w.socialAioVersion||'',
      latencyMs:Number(w.latencyMs||0),
      testOk:!!w.testOk,
      lastTestAt:w.lastTestAt||''
    };
  }

  function getWorkerPoolPublic_() {
    return {
      version:CFG.VERSION,
      relay:CFG.BRIDGE_SERVER,
      workers:getWorkerPoolRaw_().map(workerPublic_)
    };
  }

  function saveWorkerPool_(inputWorkers) {
    const old=getWorkerPoolRaw_();
    const incoming={};
    (Array.isArray(inputWorkers)?inputWorkers:[]).forEach(w=>{
      if(w&&w.slot) incoming[String(w.slot).toUpperCase()]=w;
    });

    const merged=old.map(prev=>{
      const x=incoming[prev.slot]||{};
      const clientInput=String(x.clientId||'').trim();
      return Object.assign({},prev,{
        label:String(x.label!==undefined?x.label:prev.label).trim()||prev.label,
        enabled:x.enabled!==undefined?!!x.enabled:prev.enabled,
        clientId:clientInput || prev.clientId
      });
    });

    saveWorkerPoolRaw_(merged);

    const first=merged.find(w=>w.enabled&&w.clientId);
    if(first){
      PropertiesService.getDocumentProperties().setProperty(CFG.BRIDGE_CLIENT_ID_KEY,first.clientId);
    }
    return getWorkerPoolPublic_();
  }

  function testOneWorker_(worker) {
    const started=Date.now();
    if(!worker.clientId){
      return Object.assign({},worker,{testOk:false,profile:'',latencyMs:0,lastTestAt:new Date().toISOString(),error:'Chưa có CLIENT_ID'});
    }
    try{
      const ver=callSocialAioApiWithClient_(worker.clientId,'get_ext_version',{});
      let profileRes=null;
      try{profileRes=callSocialAioApiWithClient_(worker.clientId,'get_my_profile_lite',{});}catch(_){}
      const profile=pickBridgeValue_(profileRes,['name','profile.name'])||worker.profile||'';
      const socialAioVersion=pickBridgeValue_(ver,['version'])||compactBridgePreview_(ver,80)||'OK';
      return Object.assign({},worker,{
        testOk:true,
        profile,
        socialAioVersion,
        latencyMs:Date.now()-started,
        lastTestAt:new Date().toISOString(),
        error:''
      });
    }catch(err){
      return Object.assign({},worker,{
        testOk:false,
        latencyMs:Date.now()-started,
        lastTestAt:new Date().toISOString(),
        error:String(err.message||err).slice(0,500)
      });
    }
  }

  function testWorkerPool_() {
    const pool=getWorkerPoolRaw_();
    const tested=pool.map(w=>w.enabled?testOneWorker_(w):Object.assign({},w,{testOk:false}));
    saveWorkerPoolRaw_(tested);
    const first=tested.find(w=>w.enabled&&w.clientId);
    if(first) PropertiesService.getDocumentProperties().setProperty(CFG.BRIDGE_CLIENT_ID_KEY,first.clientId);
    return {
      version:CFG.VERSION,
      relay:CFG.BRIDGE_SERVER,
      onlineCount:tested.filter(w=>w.enabled&&w.testOk).length,
      workers:tested.map(w=>Object.assign(workerPublic_(w),{error:w.error||''}))
    };
  }

  function workerMatchesProfile_(worker, profile) {
    const p=String(profile||'').trim().toLowerCase();
    if(!p || p==='auto') return true;
    const aliases=[worker.slot,worker.label,worker.profile].map(x=>String(x||'').trim().toLowerCase()).filter(Boolean);
    return aliases.includes(p);
  }

  function collectRetryJobs_() {
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const last=sheet.getLastRow();
    if(last<2) return [];
    const values=sheet.getRange(2,1,last-1,26).getValues();
    const out=[];
    values.forEach((r,i)=>{
      const status=String(r[23]||'');
      if(status!=='LỖI' && status!=='THIẾU') return;
      const url=String(r[3]||'').trim();
      if(!url) return;
      out.push({
        row:i+2,
        name:String(r[2]||'').trim() || ('Group '+String(r[4]||'')),
        profile:String(r[1]||'').trim() || 'AUTO',
        url,
        groupKey:String(r[4]||extractGroupKey_(url)||'').trim().toLowerCase(),
        targetCount:normalizeGroupTarget_(r[8]||25),
        status
      });
    });
    return out;
  }

  function prepareWorkerBatch_(targetOverride,retryMode) {
    ensureV16Sheets_(false);
    const jobs=retryMode?collectRetryJobs_():getCheckedGroupRows_();
    if(!jobs.length) throw new Error(retryMode?'Không có Group LỖI/THIẾU để retry.':'Chưa chọn Group nào.');

    const override=targetOverride?normalizeGroupTarget_(targetOverride):0;
    const configured=getWorkerPoolRaw_().filter(w=>w.enabled&&w.clientId);
    if(!configured.length) throw new Error('Chưa cấu hình Worker. Mở Cấu hình nâng cao → Worker Pool.');
    const online=configured.filter(w=>w.testOk);
    const pool=online.length ? online : configured;

    const loads={};
    pool.forEach(w=>loads[w.slot]=0);
    const assignments={};
    pool.forEach(w=>assignments[w.slot]=[]);

    jobs.forEach(job=>{
      const target=override||job.targetCount||25;
      const pinned=String(job.profile||'').trim() && String(job.profile||'').trim().toLowerCase()!=='auto';
      let candidates=pool.filter(w=>workerMatchesProfile_(w,job.profile));
      if(!candidates.length && pinned){
        job.assignmentError='Không có Worker khớp Profile "'+job.profile+'".';
        return;
      }
      if(!candidates.length) candidates=pool.slice();

      candidates.sort((a,b)=>{
        const la=loads[a.slot]||0, lb=loads[b.slot]||0;
        if(la!==lb) return la-lb;
        const aa=a.testOk?0:1, bb=b.testOk?0:1;
        if(aa!==bb) return aa-bb;
        return Number(a.latencyMs||999999)-Number(b.latencyMs||999999);
      });
      const chosen=candidates[0];
      const weight=Math.max(1,Number(chosen.latencyMs||1500)/1000);
      loads[chosen.slot]+=target*weight;
      assignments[chosen.slot].push(Object.assign({},job,{targetCount:target,workerSlot:chosen.slot}));
    });

    const workers=pool.map(w=>({
      slot:w.slot,label:w.label,profile:w.profile||'',testOk:!!w.testOk,latencyMs:Number(w.latencyMs||0),
      jobs:assignments[w.slot]||[]
    })).filter(w=>w.jobs.length);

    const unassigned=jobs.filter(j=>j.assignmentError).map(j=>({row:j.row,name:j.name,error:j.assignmentError}));
    return {
      version:CFG.VERSION,
      retryMode:!!retryMode,
      selected:jobs.length,
      assigned:workers.reduce((n,w)=>n+w.jobs.length,0),
      unassigned,
      workers,
      onlineCount:pool.filter(w=>w.testOk).length,
      configuredCount:pool.length
    };
  }

  function maskBridgeClientId_(id) {
    const s = String(id || '');
    if (s.length <= 8) return s.slice(0,2) + '***' + s.slice(-2);
    return s.slice(0,5) + '…' + s.slice(-4);
  }

  function unwrapBridgeResult_(value) {
    let v = value;
    for (let i=0;i<5;i++) {
      if (typeof v === 'string') {
        const s = v.trim();
        if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
          try { v = JSON.parse(s); continue; } catch (_) {}
        }
        return v;
      }
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const keys = Object.keys(v);
        if (keys.length <= 4 && Object.prototype.hasOwnProperty.call(v,'result') && v.result !== undefined) {
          v = v.result;
          continue;
        }
      }
      break;
    }
    return v;
  }

  function findBridgeError_(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') {
      const s = value.trim();
      if (/^\{.*\}$/.test(s)) {
        try { return findBridgeError_(JSON.parse(s)); } catch (_) {}
      }
      return /^error\s*:/i.test(s) || /not\s+connected/i.test(s) ? s : '';
    }
    if (typeof value !== 'object') return '';
    if (value.error) {
      if (typeof value.error === 'string') return value.error;
      try { return JSON.stringify(value.error); } catch (_) { return String(value.error); }
    }
    if (value.success === false && value.message) return String(value.message);
    return '';
  }

  function findBridgeArray_(value, preferredKeys) {
    const preferred = new Set((preferredKeys || []).map(x=>String(x).toLowerCase()));
    const seen = [];
    let fallback = null;

    const walk = (v, depth) => {
      if (depth > 7 || v === null || v === undefined) return null;
      if (Array.isArray(v)) {
        if (!fallback && v.length) fallback = v;
        for (let i=0;i<v.length;i++) {
          const nested = walk(v[i], depth+1);
          if (nested && nested.__preferred) return nested;
        }
        return null;
      }
      if (typeof v === 'string') {
        const s=v.trim();
        if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
          try { return walk(JSON.parse(s), depth+1); } catch (_) {}
        }
        return null;
      }
      if (typeof v !== 'object') return null;
      if (seen.indexOf(v) >= 0) return null;
      seen.push(v);

      const keys=Object.keys(v);
      for (const k of keys) {
        if (preferred.has(String(k).toLowerCase()) && Array.isArray(v[k])) {
          const arr=v[k];
          arr.__preferred=true;
          return arr;
        }
      }
      for (const k of keys) {
        const x=walk(v[k],depth+1);
        if (x && x.__preferred) return x;
      }
      return null;
    };

    const exact=walk(value,0);
    if (exact && exact.__preferred) {
      try { delete exact.__preferred; } catch (_) {}
      return exact;
    }
    return fallback || [];
  }

  function findBridgeCursor_(value) {
    const preferred = ['next_cursor','end_cursor','nextcursor','endcursor'];
    const generic = ['cursor'];
    const seen = [];

    const walk = (v, depth, allowGeneric) => {
      if (depth > 7 || v === null || v === undefined || typeof v !== 'object') return '';
      if (seen.indexOf(v) >= 0) return '';
      seen.push(v);
      if (Array.isArray(v)) {
        for (let i=v.length-1;i>=0;i--) {
          const found=walk(v[i],depth+1,true);
          if (found) return found;
        }
        return '';
      }
      const keys=Object.keys(v);
      for (const wanted of preferred) {
        const k=keys.find(x=>String(x).toLowerCase()===wanted);
        if (k && typeof v[k] === 'string' && v[k]) return v[k];
      }
      if (v.page_info && typeof v.page_info === 'object') {
        const p=v.page_info;
        if (typeof p.end_cursor === 'string' && p.end_cursor) return p.end_cursor;
      }
      if (allowGeneric) {
        for (const wanted of generic) {
          const k=keys.find(x=>String(x).toLowerCase()===wanted);
          if (k && typeof v[k] === 'string' && v[k]) return v[k];
        }
      }
      for (const k of keys) {
        const found=walk(v[k],depth+1,false);
        if (found) return found;
      }
      return '';
    };
    return walk(value,0,true);
  }

  function pickBridgeValue_(obj, paths) {
    for (const path of paths || []) {
      let v=obj;
      for (const part of String(path).split('.')) {
        if (v === null || v === undefined || typeof v !== 'object') { v=undefined; break; }
        v=v[part];
      }
      if (v !== undefined && v !== null && v !== '') return String(v);
    }
    if (obj && typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        if (String(k).toLowerCase()==='version' && obj[k] !== undefined) return String(obj[k]);
      }
    }
    return '';
  }

  function compactBridgePreview_(value, maxLen) {
    let s='';
    try { s=typeof value==='string' ? value : JSON.stringify(value); }
    catch (_) { s=String(value); }
    s=s.replace(/\s+/g,' ').trim();
    return s.slice(0, maxLen || 500);
  }

  function resolveBridgeGroupUrl_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=ss.getActiveSheet();
    const row=sh.getActiveRange() ? sh.getActiveRange().getRow() : 0;
    if (sh.getName()===CFG.GROUP_SCAN_SHEET && row>=2) {
      const url=String(sh.getRange(row,4).getDisplayValue() || '').trim();
      if (url) return url;
    }
    const ui=SpreadsheetApp.getUi();
    const res=ui.prompt(
      'POC - Quét 1 Group',
      'Chọn một dòng trong sheet QUÉT NHÓM rồi chạy lại, hoặc dán URL Group Facebook vào đây:',
      ui.ButtonSet.OK_CANCEL
    );
    if(res.getSelectedButton()!==ui.Button.OK) throw new Error('Đã huỷ.');
    const url=String(res.getResponseText()||'').trim();
    if(!/facebook\.com\/groups\//i.test(url)) throw new Error('URL Group Facebook không hợp lệ.');
    return url;
  }

  function resolveBridgePostUrl_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=ss.getActiveSheet();
    const row=sh.getActiveRange() ? sh.getActiveRange().getRow() : 0;
    if (sh.getName()===CFG.OPPORTUNITY_SHEET && row>=2) {
      const type=String(sh.getRange(row,4).getDisplayValue()||'');
      const url=String(sh.getRange(row,3).getDisplayValue()||'').trim();
      if(type!=='Bình luận' && url) return url;
    }
    if (sh.getName()===CFG.RAW_SHEET && row>=5) {
      const url=String(sh.getRange(row,6).getDisplayValue()||'').trim();
      if(url) return url;
    }
    const ui=SpreadsheetApp.getUi();
    const res=ui.prompt(
      'POC - Lấy comment 1 Post',
      'Chọn một bài trong CƠ HỘI / NHẬP JSON rồi chạy lại, hoặc dán URL bài Facebook vào đây:',
      ui.ButtonSet.OK_CANCEL
    );
    if(res.getSelectedButton()!==ui.Button.OK) throw new Error('Đã huỷ.');
    const url=String(res.getResponseText()||'').trim();
    if(!url) throw new Error('URL Post đang trống.');
    return url;
  }

  return {
    getVersion,
    onOpen,
    showRuntimeInfo,
    showControlCenter,
    showImportDialog,
    importJsonFiles,
    refreshCurrentData,
    syncPotentialCustomers,
    auditDuplicates,
    analyzeNewPosts,
    apiBridgeConfigure,
    apiBridgeClearConfig,
    apiBridgeTest,
    apiBridgeScanSelectedGroup,
    apiBridgeFetchCommentsSelectedPost,
    apiBridgeStatus,
    runApiResponseDiagnostic_,
    setupGroupScanControls_,
    getGroupScanControlState_,
    scanActiveGroupApiBridge_,
    scanCheckedGroupsApiBridge_,
    retryFailedGroupsApiBridge_,
    stopCheckedGroupsApiBridge_,
    clearCheckedGroups_,
  };
})();
