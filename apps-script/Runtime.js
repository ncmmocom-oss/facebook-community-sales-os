const RemoteApp = (() => {
  const CFG = {
    VERSION: '1.5.1',
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
      'AI V1.5.0: OpenAI hoặc Gemini → Pain / Intent / Score / Phân loại KH / Comment / Next Action.\nAPI key được lưu trong Script Properties, không lưu trong Sheet hoặc GitHub.'
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
          if (groupKey && !groupMap[groupKey]) {
            groupMap[groupKey] = ensureGroupRegistered_(groupSheet, groupKey);
          }
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

    let ai = null;
    if (getAiConfig_().autoAnalyze && getAiConfig_().configured && rawRows.length) {
      try {
        ai = analyzeNewPosts_({ silent: true });
      } catch (e) {
        errors.push('AI: ' + e.message);
      }
    }

    const refresh = ai && ai.refresh ? ai.refresh : refreshCurrentData({ silent: true });
    SpreadsheetApp.flush();
    return {
      version: CFG.VERSION,
      files: files.length,
      scanned: scannedCount,
      imported: rawRows.length,
      duplicates: duplicateCount,
      errors,
      ai,
      refresh
    };
  }


  function handleUiCommand_(command) {
    const name = String(command.__command || '');
    if (name === 'GET_AI_CONFIG') return getAiConfig_();
    if (name === 'SAVE_AI_CONFIG') return saveAiConfig_(command);
    if (name === 'ANALYZE_NEW') return analyzeNewPosts_({ silent: false });
    if (name === 'TEST_AI') return testAiConnection_();
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

  function analyzeNewPosts_(options) {
    const silent = options && options.silent;
    const cfg = getAiConfig_();
    if (!cfg.configured) throw new Error('Chưa cấu hình API key cho nhà cung cấp AI đang chọn.');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);
    const last = sheet.getLastRow();
    if (last < 2) return { version: CFG.VERSION, analyzed: 0, remaining: 0, errors: [] };

    const rows = sheet.getRange(2, 1, last - 1, 20).getValues();
    const candidates = [];
    rows.forEach((r, i) => {
      const content = String(r[7] || '').trim();
      const already = [r[8], r[9], r[10], r[11]].some(v => v !== '' && v !== null && v !== undefined);
      const status = String(r[19] || '').trim();
      if (!content || already || status === 'Đóng') return;
      candidates.push({
        rowNumber: i + 2,
        group: String(r[4] || ''),
        author: String(r[5] || ''),
        content: content.slice(0, 5000),
        sourceType: String(r[3] || 'Bài viết'),
        sourceUrl: String(r[2] || ''),
        engagement: String(r[18] || ''),
        postDate: r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : String(r[0] || '')
      });
    });

    const selected = candidates.slice(0, cfg.maxRows);
    if (!selected.length) {
      const result = { version: CFG.VERSION, analyzed: 0, remaining: 0, errors: [] };
      if (!silent) SpreadsheetApp.getActive().toast('Không còn bài mới cần AI phân tích.', 'AI PHÂN TÍCH', 5);
      return result;
    }

    const batchSize = 20;
    const errors = [];
    let analyzed = 0;

    for (let start = 0; start < selected.length; start += batchSize) {
      const batch = selected.slice(start, start + batchSize);
      try {
        const results = cfg.provider === 'gemini' ? analyzeBatchWithGemini_(batch, cfg) : analyzeBatchWithOpenAi_(batch, cfg);
        applyAiAnalysis_(sheet, results);
        analyzed += results.length;
      } catch (e) {
        errors.push('Batch ' + (Math.floor(start / batchSize) + 1) + ': ' + e.message);
      }
    }

    const refresh = refreshCurrentData({ silent: true });
    const remaining = Math.max(0, candidates.length - analyzed);
    const actualModel = cfg.provider === 'gemini'
      ? (PropertiesService.getScriptProperties().getProperty('AI_LAST_GEMINI_MODEL') || cfg.model)
      : cfg.model;
    const result = { version: CFG.VERSION, analyzed, remaining, errors, provider: cfg.provider, model: actualModel, refresh };

    if (!silent) {
      SpreadsheetApp.getActive().toast(
        'Đã phân tích ' + analyzed + ' bài | Còn ' + remaining + (errors.length ? ' | Có lỗi' : ''),
        'AI PHÂN TÍCH',
        8
      );
    }
    return result;
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

    analyses.forEach(a => {
      const row = Number(a.row_number || 0);
      if (row < 2 || row > sheet.getLastRow()) return;

      const intent = allowedIntent.has(String(a.intent)) ? String(a.intent) : 'Thảo luận';
      const classification = allowedClass.has(String(a.classification)) ? String(a.classification) : 'Theo dõi';
      const action = allowedAction.has(String(a.next_action)) ? String(a.next_action) : 'Theo dõi';
      const score = Math.max(0, Math.min(100, Math.round(Number(a.score || 0))));
      const days = Math.max(0, Math.min(30, Math.round(Number(a.follow_up_days || 0))));
      const follow = days > 0 ? new Date(now.getTime() + days * 86400000) : '';

      let status = 'Theo dõi';
      if (classification === 'Rất tiềm năng' || classification === 'Tiềm năng') status = 'Đang xử lý';
      if (classification === 'Không phải KH' && action === 'Bỏ qua') status = 'Đóng';

      sheet.getRange(row, 9, 1, 6).setValues([[
        String(a.pain || ''),
        intent,
        score,
        classification,
        String(a.value_solution || ''),
        String(a.suggested_comment || '')
      ]]);
      sheet.getRange(row, 16).setValue(action);
      sheet.getRange(row, 17).setValue(follow);
      sheet.getRange(row, 20).setValue(status);
    });
  }

  function refreshCurrentData(options) {
    const silent = options && options.silent;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawSheet = mustSheet_(ss, CFG.RAW_SHEET);
    const oppSheet = mustSheet_(ss, CFG.OPPORTUNITY_SHEET);

    const registryStats = repairScanRegistry_();
    const remapStats = remapGroupNames_();
    const rawFix = normalizeAndDedupeSheet_(rawSheet, { headerRows: 4, idCol: 5, urlCol: 6, totalCols: 14, preferComplete: false });
    const oppFix = normalizeAndDedupeSheet_(oppSheet, { headerRows: 1, idCol: 2, urlCol: 3, totalCols: 20, preferComplete: true });
    const rawStatusStats = syncRawProcessingStatus_();
    const leadStats = syncPotentialCustomers({ silent: true });
    const groupStats = refreshGroupSummary_();
    const queueStats = refreshCoordination_();
    SpreadsheetApp.flush();

    const result = {
      version: CFG.VERSION,
      rawRemoved: rawFix.removed,
      oppRemoved: oppFix.removed,
      repairedIds: rawFix.repairedIds + oppFix.repairedIds,
      registryRows: registryStats.rows,
      remappedGroups: remapStats.changed,
      rawStatuses: rawStatusStats.rows,
      leads: leadStats.count,
      groups: groupStats.groups,
      queue: queueStats.count,
    };

    if (!silent) {
      SpreadsheetApp.getActive().toast(
        `V${CFG.VERSION} | Trùng xóa: ${result.rawRemoved + result.oppRemoved} | Remap group: ${result.remappedGroups} | KH: ${result.leads} | Điều phối: ${result.queue}`,
        'CẬP NHẬT DỮ LIỆU',
        8
      );
    }
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
      const stat = `${list.length} bài | ${analyzed} đã phân tích | ${pending} chờ AI`;
      const oldNote = String(prev[11] || '').split('\n').filter(x => !/\d+ bài \| \d+ đã phân tích \| \d+ chờ AI/.test(x)).join('\n').trim();

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
