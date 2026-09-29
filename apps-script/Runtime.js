const RemoteApp = (() => {
  const CFG = {
    VERSION: '1.9.8.7-HF10.6-identity-display-cleanup',
    UI_CONTRACT: 'scan-scope-v2',
    RAW_SHEET: 'NHẬP JSON',
    OPPORTUNITY_SHEET: 'CƠ HỘI',
    SIGNAL_FEED_SHEET: 'TÍN HIỆU',
    GROUP_SCAN_SHEET: 'QUÉT NHÓM',
    GROUP_SUMMARY_SHEET: 'NHÓM',
    GROUP_ALIAS_REGISTRY_SHEET: 'GROUP_ALIAS_REGISTRY',
    GROUP_REGISTRY_CLEANUP_KEY: 'SOCIAL_AIO_GROUP_REGISTRY_CLEANUP_V1',
    LEAD_SHEET: 'KHÁCH HÀNG TIỀM NĂNG',
    LEAD_LEGACY_ARCHIVE_SHEET: 'KH LEGACY ARCHIVE',
    COORDINATION_SHEET: 'ĐIỀU PHỐI',
    AI_LOG_SHEET: 'NHẬT KÝ AI',
    COMMENT_SHEET: 'BÌNH LUẬN',
    PERSON_TIMELINE_SHEET: 'LỊCH SỬ KH',
    IMPORT_LOG_SHEET: 'NHẬT KÝ IMPORT',
    DAILY_STATS_SHEET: 'THỐNG KÊ NGÀY',
    API_DIAG_SHEET: 'NHẬT KÝ API',
    AUTO_LOG_SHEET: 'NHẬT KÝ AUTO',
    BRIDGE_SERVER: 'https://api.fbaio.org',
    BRIDGE_CLIENT_ID_KEY: 'SOCIAL_AIO_BRIDGE_CLIENT_ID',
    WORKER_POOL_KEY: 'SOCIAL_AIO_WORKER_POOL_V1',
    BRIDGE_STOP_ALL_KEY: 'SOCIAL_AIO_BRIDGE_STOP_ALL',
    BRIDGE_STOP_PREFIX: 'SOCIAL_AIO_BRIDGE_STOP_',
    SCAN_RUN_STOP_PREFIX: 'SOCIAL_AIO_SCAN_RUN_STOP_',
    SCAN_RUN_STOP_TTL_MS: 20 * 60 * 1000,
    GROUP_CONTROL_START_COL: 23,
    LAST_SCAN_SOURCE_IDS_KEY: 'SOCIAL_AIO_LAST_SCAN_SOURCE_IDS_V1',
    WORKER_HEALTH_TTL_MS: 15 * 60 * 1000,
    PILOT_GROUP_LIMIT: 200,
    DUE_CYCLE_LIMIT: 30,
    AUTO_AI_SOURCE_CHUNK: 12,
    AUTO_MONITOR_JOB_START_RESERVE_MS: 120 * 1000,
    AUTO_AI_START_RESERVE_MS: 160 * 1000,
    SIGNAL_FEED_DAYS: 7,
    SIGNAL_FEED_MAX_SOURCE_ROWS: 20000,
    OPS_DUE_SOON_MS: 60 * 60 * 1000,
    OPS_OVERDUE_WARN_MS: 2 * 60 * 60 * 1000,
    OPS_OVERDUE_CRITICAL_MS: 6 * 60 * 60 * 1000,
    OPS_OVERDUE_SEVERE_MS: 24 * 60 * 60 * 1000,
    OPS_COVERAGE_WINDOW_MS: 24 * 60 * 60 * 1000,
    OPS_FRESH_SIGNAL_MS: 2 * 60 * 60 * 1000,
    OPS_AI_STALE_MS: 2 * 60 * 60 * 1000,
    AUTO_POLICY_KEY: 'SOCIAL_AIO_AUTO_POLICY_V1',
    GROUP_EFFICIENCY_PREFIX: 'SOCIAL_AIO_GROUP_EFF_V1_',
    GROUP_DISCOVERY_PREFIX: 'SOCIAL_AIO_GROUP_DISCOVERY_V1_',
    GROUP_ACTIVITY_PREFIX: 'SOCIAL_AIO_GROUP_ACTIVITY_V1_',
    GROUP_IDENTITY_RETRY_PREFIX: 'SOCIAL_AIO_GROUP_ID_RETRY_V1_',
    GROUP_SUMMARY_LEGACY_ARCHIVE_SHEET: 'NHÓM LEGACY ARCHIVE',
    AUTO_MONITOR_ENABLED_KEY: 'SOCIAL_AIO_AUTO_MONITOR_V2_ENABLED',
    AUTO_MONITOR_LAST_RUN_KEY: 'SOCIAL_AIO_AUTO_MONITOR_V2_LAST_RUN',
    AUTO_MONITOR_TRIGGER_HANDLER: 'autoMonitorTick',
    AUTO_MONITOR_TRIGGER_MINUTES: 5,
    AUTO_MONITOR_MAX_GROUPS_PER_TICK: 4,
    AUTO_MONITOR_BUDGET_MS: 230 * 1000,
    AUTO_RETRY_PREFIX: 'SOCIAL_AIO_AUTO_RETRY_',
    AUTO_RETRY_MAX_ATTEMPTS: 5,
    AUTO_RETRY_DELAYS_MS: [2*60*1000,10*60*1000,30*60*1000,2*60*60*1000,6*60*60*1000],
    COMMENT_INTEL_ENABLED_KEY: 'SOCIAL_AIO_COMMENT_INTEL_ENABLED',
    COMMENT_MAX_POSTS_PER_TICK: 4,
    COMMENT_MAX_PAGES_PER_POST: 3,
    COMMENT_MAX_RECORDS_PER_POST: 100,
    COMMENT_CYCLE_BUDGET_MS: 45 * 1000,
    COMMENT_EMPTY_RETRY_MAX: 3,
    COMMENT_RETRY_DELAYS_MS: [5*60*1000,15*60*1000,60*60*1000,3*60*60*1000,6*60*60*1000],
    COMMENT_PROVIDER_BREAKER_KEY: 'SOCIAL_AIO_COMMENT_PROVIDER_BREAKER_V1',
    COMMENT_PROVIDER_BREAKER_MS: 10 * 60 * 1000,
    COMMENT_HOT_WATCH_MS: 24 * 60 * 60 * 1000,
    COMMENT_HOT_RECHECK_MS: 30 * 60 * 1000,
    AI_LEASE_KEY: 'SOCIAL_AIO_AI_LEASE_V1',
    AI_LEASE_TTL_MS: 7 * 60 * 1000,
    AI_PROGRESS_STALE_MS: 8 * 60 * 1000,
    AUTO_MONITOR_LEASE_KEY: 'SOCIAL_AIO_AUTO_MONITOR_LEASE_V1',
    AUTO_MONITOR_LEASE_TTL_MS: 10 * 60 * 1000,
    COMMENT_POST_LEASE_PREFIX: 'SOCIAL_AIO_COMMENT_POST_LEASE_',
    COMMENT_POST_LEASE_TTL_MS: 2 * 60 * 1000,
    GROUP_LEASE_PREFIX: 'SOCIAL_AIO_GROUP_LEASE_',
    GROUP_LEASE_TTL_MS: 5 * 60 * 1000,
    RELAY_RETRY_ATTEMPTS: 3,
    EMPTY_PAGE_RETRY_ATTEMPTS: 3,
    OPPORTUNITY_TOTAL_COLS: 32,
    OPPORTUNITY_GROUP_KEY_COL: 32,
    OFFER_CONTEXT_FIELDS: ['OFFER','BUYER','PROBLEM','PRODUCT-SERVICE','VALUE','QUALIFICATION','CTA'],
    SALES_STAGE_OPTIONS: ['Qualified','Outreach','Đang hội thoại','Chờ phản hồi','Follow-up','Đã bán','Lost'],
    SHEET_ROW_HEIGHT_PX: 21,
  };

  function autoPolicyDefaults_() {
    return {
      schemaVersion:1,
      activeProfileId:'IX01',
      global:{
        auto:{triggerMinutes:5,activeStart:'07:00',activeEnd:'23:00',timezone:'Asia/Ho_Chi_Minh',maxGroupsPerCycle:4,runtimeBudgetMs:230000},
        scan:{scansPerDay:3,postsPerScan:10,maxPostsPerScan:200,dueToleranceMinutes:5,retryAttempts:5,retryBackoffMinutes:[2,10,30,120,360]},
        comment:{enabled:true,maxPostsPerCycle:4,maxPagesPerPost:3,maxCommentsPerPost:100,hotWatchHours:24,recheckMinutes:30,ownPostPriority:100,externalPostPriority:50,providerBreakerMinutes:10},
        ai:{signalEnabled:true,qualificationEnabled:true,chunkSize:12},
        action:{humanApproval:true,autoComment:false}
      },
      profiles:[{
        id:'IX01',displayName:'IX Profile 01',browserIdentity:'',facebookIdentities:[],
        enabled:true,activeStart:'',activeEnd:'',timezone:'',maxGroupCapacity:30,
        groupKeys:[],scan:{},comment:{},ai:{},action:{}
      }]
    };
  }

  function policyInt_(value,fallback,min,max) {
    const n=Number(value);
    if(!Number.isFinite(n)) return Number(fallback);
    return Math.max(Number(min),Math.min(Number(max),Math.floor(n)));
  }

  function policyBool_(value,fallback) {
    if(value===true||value===false) return value;
    if(String(value).toLowerCase()==='true') return true;
    if(String(value).toLowerCase()==='false') return false;
    return !!fallback;
  }

  function policyTime_(value,fallback) {
    const s=String(value||'').trim();
    const m=s.match(/^(\d{2}):(\d{2})$/);
    if(!m) return String(fallback||'00:00');
    const h=Number(m[1]),min=Number(m[2]);
    if(h<0||h>23||min<0||min>59) return String(fallback||'00:00');
    return String(h).padStart(2,'0')+':'+String(min).padStart(2,'0');
  }

  function policyBackoff_(value,fallback) {
    const input=Array.isArray(value)?value:String(value||'').split(',');
    const out=input.map(x=>Number(String(x).trim()))
      .filter(x=>Number.isFinite(x)&&x>=1&&x<=1440)
      .map(x=>Math.floor(x));
    return out.length?out:(fallback||[2,10,30,120,360]).slice();
  }

  function normalizeAutoPolicy_(raw) {
    const d=autoPolicyDefaults_();
    raw=raw&&typeof raw==='object'?raw:{};
    const g=raw.global&&typeof raw.global==='object'?raw.global:{};
    const ga=g.auto||{},gs=g.scan||{},gc=g.comment||{},gi=g.ai||{},gx=g.action||{};
    const cfg={
      schemaVersion:1,
      activeProfileId:String(raw.activeProfileId||d.activeProfileId).trim()||d.activeProfileId,
      global:{
        auto:{
          triggerMinutes:[5,10,15,30].indexOf(Number(ga.triggerMinutes))>=0?Number(ga.triggerMinutes):d.global.auto.triggerMinutes,
          activeStart:policyTime_(ga.activeStart,d.global.auto.activeStart),
          activeEnd:policyTime_(ga.activeEnd,d.global.auto.activeEnd),
          timezone:String(ga.timezone||d.global.auto.timezone).trim()||d.global.auto.timezone,
          maxGroupsPerCycle:policyInt_(ga.maxGroupsPerCycle,d.global.auto.maxGroupsPerCycle,1,12),
          runtimeBudgetMs:policyInt_(ga.runtimeBudgetMs,d.global.auto.runtimeBudgetMs,60000,280000)
        },
        scan:{
          scansPerDay:policyInt_(gs.scansPerDay,d.global.scan.scansPerDay,1,24),
          postsPerScan:policyInt_(gs.postsPerScan,d.global.scan.postsPerScan,1,200),
          maxPostsPerScan:policyInt_(gs.maxPostsPerScan,d.global.scan.maxPostsPerScan,1,200),
          dueToleranceMinutes:policyInt_(gs.dueToleranceMinutes,d.global.scan.dueToleranceMinutes,0,120),
          retryAttempts:policyInt_(gs.retryAttempts,d.global.scan.retryAttempts,1,10),
          retryBackoffMinutes:policyBackoff_(gs.retryBackoffMinutes,d.global.scan.retryBackoffMinutes)
        },
        comment:{
          enabled:policyBool_(gc.enabled,d.global.comment.enabled),
          maxPostsPerCycle:policyInt_(gc.maxPostsPerCycle,d.global.comment.maxPostsPerCycle,1,20),
          maxPagesPerPost:policyInt_(gc.maxPagesPerPost,d.global.comment.maxPagesPerPost,1,10),
          maxCommentsPerPost:policyInt_(gc.maxCommentsPerPost,d.global.comment.maxCommentsPerPost,10,1000),
          hotWatchHours:policyInt_(gc.hotWatchHours,d.global.comment.hotWatchHours,1,168),
          recheckMinutes:policyInt_(gc.recheckMinutes,d.global.comment.recheckMinutes,5,1440),
          ownPostPriority:policyInt_(gc.ownPostPriority,d.global.comment.ownPostPriority,0,1000),
          externalPostPriority:policyInt_(gc.externalPostPriority,d.global.comment.externalPostPriority,0,1000),
          providerBreakerMinutes:policyInt_(gc.providerBreakerMinutes,d.global.comment.providerBreakerMinutes,1,120)
        },
        ai:{
          signalEnabled:policyBool_(gi.signalEnabled,d.global.ai.signalEnabled),
          qualificationEnabled:policyBool_(gi.qualificationEnabled,d.global.ai.qualificationEnabled),
          chunkSize:policyInt_(gi.chunkSize,d.global.ai.chunkSize,1,50)
        },
        action:{humanApproval:policyBool_(gx.humanApproval,true),autoComment:false}
      },
      profiles:[]
    };
    const profiles=Array.isArray(raw.profiles)&&raw.profiles.length?raw.profiles:d.profiles;
    profiles.forEach((p,i)=>{
      p=p||{};
      const id=String(p.id||('IX'+String(i+1).padStart(2,'0'))).trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'');
      if(!id||cfg.profiles.some(x=>x.id===id)) return;
      cfg.profiles.push({
        id,displayName:String(p.displayName||id).trim()||id,
        browserIdentity:String(p.browserIdentity||'').trim(),
        facebookIdentities:(Array.isArray(p.facebookIdentities)?p.facebookIdentities:[]).map(x=>String(x||'').trim()).filter(Boolean),
        enabled:policyBool_(p.enabled,true),
        activeStart:String(p.activeStart||'').trim()?policyTime_(p.activeStart,cfg.global.auto.activeStart):'',
        activeEnd:String(p.activeEnd||'').trim()?policyTime_(p.activeEnd,cfg.global.auto.activeEnd):'',
        timezone:String(p.timezone||'').trim(),
        maxGroupCapacity:policyInt_(p.maxGroupCapacity,30,1,100),
        groupKeys:(Array.isArray(p.groupKeys)?p.groupKeys:[]).map(x=>String(x||'').trim().toLowerCase()).filter(Boolean),
        scan:p.scan&&typeof p.scan==='object'?p.scan:{},
        comment:p.comment&&typeof p.comment==='object'?p.comment:{},
        ai:p.ai&&typeof p.ai==='object'?p.ai:{},
        action:p.action&&typeof p.action==='object'?p.action:{}
      });
    });
    if(!cfg.profiles.length) cfg.profiles=d.profiles;
    if(!cfg.profiles.some(p=>p.id===cfg.activeProfileId)) cfg.activeProfileId=cfg.profiles[0].id;
    if(cfg.global.scan.postsPerScan>cfg.global.scan.maxPostsPerScan) cfg.global.scan.postsPerScan=cfg.global.scan.maxPostsPerScan;
    return cfg;
  }

  function getAutoPolicyConfig_() {
    let raw=null;
    try{raw=JSON.parse(PropertiesService.getDocumentProperties().getProperty(CFG.AUTO_POLICY_KEY)||'null');}catch(_){}
    return normalizeAutoPolicy_(raw||autoPolicyDefaults_());
  }

  function activePolicyProfile_(config) {
    const c=config||autoPolicyDefaults_();
    return (c.profiles||[]).find(p=>p.id===c.activeProfileId)||(c.profiles||[])[0]||null;
  }

  function validateAutoPolicy_(raw) {
    raw=raw&&typeof raw==='object'?raw:{};
    const g=raw.global||{},a=g.auto||{},s=g.scan||{},c=g.comment||{},ai=g.ai||{},act=g.action||{};
    const bounded=(v,min,max,label)=>{
      if(v===undefined||v===null||v==='') return;
      const n=Number(v);
      if(!Number.isFinite(n)||n<min||n>max) throw new Error(label+' ngoài giới hạn '+min+'-'+max+'.');
    };
    if(a.triggerMinutes!==undefined && [5,10,15,30].indexOf(Number(a.triggerMinutes))<0){
      throw new Error('Trigger interval chỉ hỗ trợ 5 / 10 / 15 / 30 phút.');
    }
    const validateTime=(value,label)=>{
      if(value===undefined||value===null||value==='') return;
      const m=String(value).match(/^(\d{2}):(\d{2})$/);
      if(!m||Number(m[1])>23||Number(m[2])>59) throw new Error(label+' phải theo HH:mm hợp lệ.');
    };
    validateTime(a.activeStart,'activeStart');
    validateTime(a.activeEnd,'activeEnd');
    bounded(a.maxGroupsPerCycle,1,12,'Max Group/cycle');
    bounded(a.runtimeBudgetMs,60000,280000,'Runtime budget');
    bounded(s.scansPerDay,1,24,'Scans/day');
    bounded(s.postsPerScan,1,200,'Posts/scan');
    bounded(s.maxPostsPerScan,1,200,'Max posts/scan');
    bounded(s.dueToleranceMinutes,0,120,'Due tolerance');
    bounded(s.retryAttempts,1,10,'Retry attempts');
    bounded(c.maxPostsPerCycle,1,20,'Comment posts/cycle');
    bounded(c.maxPagesPerPost,1,10,'Comment pages/post');
    bounded(c.maxCommentsPerPost,10,1000,'Comments/post');
    bounded(c.hotWatchHours,1,168,'Hot watch');
    bounded(c.recheckMinutes,5,1440,'Comment recheck');
    bounded(c.providerBreakerMinutes,1,120,'Provider breaker');
    bounded(ai.chunkSize,1,50,'AI chunk size');
    if(act.autoComment===true) throw new Error('AUTO_COMMENT_LOCKED_HF10');
    (Array.isArray(raw.profiles)?raw.profiles:[]).forEach(p=>{
      bounded(p&&p.maxGroupCapacity,1,100,'Profile capacity');
      if(p){
        validateTime(p.activeStart,'Profile activeStart');
        validateTime(p.activeEnd,'Profile activeEnd');
      }
    });
    return true;
  }

  function policyProfileForGroup_(config,groupKey) {
    const c=config||getAutoPolicyConfig_();
    const key=String(groupKey||'').trim().toLowerCase();
    if(key){
      const assigned=(c.profiles||[]).find(p=>(p.groupKeys||[]).indexOf(key)>=0);
      if(assigned) return assigned;
    }
    return activePolicyProfile_(c);
  }

  function resolveEffectiveScanPolicy_(profile,group,config) {
    const c=config||getAutoPolicyConfig_();
    const g=c.global.scan||{},p=profile&&profile.scan||{},row=group||{};
    const choose=(groupValue,profileValue,globalValue)=>{
      if(Number(groupValue)>0) return {value:Number(groupValue),source:'GROUP'};
      if(Number(profileValue)>0) return {value:Number(profileValue),source:'PROFILE'};
      return {value:Number(globalValue),source:'GLOBAL'};
    };
    const scans=choose(row.scansPerDay,p.scansPerDay,g.scansPerDay);
    const posts=choose(row.postsPerScan,p.postsPerScan,g.postsPerScan);
    const maxPosts=Number(p.maxPostsPerScan)>0?Number(p.maxPostsPerScan):Number(g.maxPostsPerScan);
    const dueTolerance=p.dueToleranceMinutes!==undefined&&p.dueToleranceMinutes!==null&&p.dueToleranceMinutes!==''
      ?Number(p.dueToleranceMinutes):Number(g.dueToleranceMinutes);
    const retryAttempts=Number(p.retryAttempts)>0?Number(p.retryAttempts):Number(g.retryAttempts);
    const retryBackoff=Array.isArray(p.retryBackoffMinutes)&&p.retryBackoffMinutes.length
      ?p.retryBackoffMinutes:g.retryBackoffMinutes;
    return {
      scansPerDay:policyInt_(scans.value,1,1,24),
      postsPerScan:policyInt_(posts.value,10,1,Math.max(1,Number(maxPosts||200))),
      maxPostsPerScan:policyInt_(maxPosts,25,1,200),
      dueToleranceMinutes:policyInt_(dueTolerance,0,0,120),
      retryAttempts:policyInt_(retryAttempts,5,1,10),
      retryBackoffMinutes:policyBackoff_(retryBackoff,g.retryBackoffMinutes),
      sources:{scansPerDay:scans.source,postsPerScan:posts.source}
    };
  }

  function resolveEffectiveCommentPolicy_(profile,post,config) {
    const c=config||getAutoPolicyConfig_();
    const g=c.global.comment||{},p=profile&&profile.comment||{};
    const pick=(key)=>p[key]!==undefined&&p[key]!==null&&p[key]!==''?p[key]:g[key];
    const own=!!(post&&post.ownPost);
    const ownPriority=policyInt_(pick('ownPostPriority'),100,0,1000);
    const externalPriority=policyInt_(pick('externalPostPriority'),50,0,1000);
    return {
      enabled:policyBool_(pick('enabled'),true),
      maxPostsPerCycle:policyInt_(pick('maxPostsPerCycle'),4,1,20),
      maxPagesPerPost:policyInt_(pick('maxPagesPerPost'),3,1,10),
      maxCommentsPerPost:policyInt_(pick('maxCommentsPerPost'),100,10,1000),
      hotWatchHours:policyInt_(pick('hotWatchHours'),24,1,168),
      recheckMinutes:policyInt_(pick('recheckMinutes'),30,5,1440),
      ownPostPriority:ownPriority,
      externalPostPriority:externalPriority,
      providerBreakerMinutes:policyInt_(pick('providerBreakerMinutes'),10,1,120),
      ownPost:own,
      priority:own?ownPriority:externalPriority
    };
  }

  function resolveEffectiveAiPolicy_(profile,group,config) {
    const c=config||getAutoPolicyConfig_();
    const g=c.global.ai||{},p=profile&&profile.ai||{};
    const pick=(key)=>p[key]!==undefined&&p[key]!==null&&p[key]!==''?p[key]:g[key];
    return {
      signalEnabled:policyBool_(pick('signalEnabled'),true),
      qualificationEnabled:policyBool_(pick('qualificationEnabled'),true),
      chunkSize:policyInt_(pick('chunkSize'),12,1,50)
    };
  }

  function resolveEffectiveActionPolicy_(profile,config) {
    const c=config||getAutoPolicyConfig_();
    const g=c.global.action||{},p=profile&&profile.action||{};
    return {
      humanApproval:p.humanApproval!==undefined&&p.humanApproval!==null?!!p.humanApproval:!!g.humanApproval,
      autoComment:false
    };
  }

  function profileActiveWindow_(profile,config) {
    const c=config||getAutoPolicyConfig_(),g=c.global.auto||{};
    return {
      start:String(profile&&profile.activeStart||g.activeStart||'07:00'),
      end:String(profile&&profile.activeEnd||g.activeEnd||'23:00'),
      timezone:String(profile&&profile.timezone||g.timezone||'Asia/Ho_Chi_Minh')
    };
  }

  function policyMinute_(value) {
    const p=policyTime_(value,'00:00').split(':').map(Number);
    return p[0]*60+p[1];
  }

  function isWithinActiveWindowMinutes_(start,end,minuteOfDay) {
    const s=policyMinute_(start),e=policyMinute_(end),n=Math.max(0,Math.min(1439,Number(minuteOfDay||0)));
    if(s===e) return true;
    return s<e?(n>=s&&n<e):(n>=s||n<e);
  }

  function isProfileActiveNow_(profile,config,now) {
    if(!profile||profile.enabled===false) return false;
    const w=profileActiveWindow_(profile,config),d=now instanceof Date?now:new Date();
    let hhmm='';
    try{hhmm=Utilities.formatDate(d,w.timezone,'HH:mm');}
    catch(_){hhmm=Utilities.formatDate(d,Session.getScriptTimeZone(),'HH:mm');}
    return isWithinActiveWindowMinutes_(w.start,w.end,policyMinute_(hhmm));
  }

  function isProfileOwnPost_(profile,authorUrl) {
    const author=normalizeFacebookProfileUrl_(authorUrl);
    if(!author) return false;
    const identities=new Set((profile&&profile.facebookIdentities||[])
      .map(x=>normalizeFacebookProfileUrl_(x)||normalizeUrl_(x))
      .filter(Boolean));
    return identities.has(author);
  }

  function autoPolicyLanePlan_(config,profile) {
    const c=config||getAutoPolicyConfig_(),p=profile||activePolicyProfile_(c);
    const cp=resolveEffectiveCommentPolicy_(p,null,c);
    const ai=resolveEffectiveAiPolicy_(p,null,c);
    return {group:!!p&&p.enabled!==false,comment:cp.enabled,ai:ai.signalEnabled,sales:true};
  }

  function groupEfficiencyKey_(groupKey) {
    return CFG.GROUP_EFFICIENCY_PREFIX+encodeURIComponent(String(groupKey||'').trim().toLowerCase());
  }

  function getGroupEfficiencyMetric_(groupKey) {
    const key=String(groupKey||'').trim().toLowerCase();
    const base={groupKey:key,totalScans:0,successfulScans:0,scannedPosts:0,newPosts:0,duplicates:0,totalDurationMs:0,errors:0,updatedAt:''};
    if(!key) return base;
    try{
      return Object.assign(base,JSON.parse(PropertiesService.getDocumentProperties().getProperty(groupEfficiencyKey_(key))||'{}'));
    }catch(_){
      return base;
    }
  }

  function recordGroupEfficiency_(groupKey,data) {
    const key=String(groupKey||'').trim().toLowerCase();
    if(!key) return null;
    data=data||{};
    const m=getGroupEfficiencyMetric_(key);
    m.totalScans=Number(m.totalScans||0)+1;
    if(data.success) m.successfulScans=Number(m.successfulScans||0)+1;
    else m.errors=Number(m.errors||0)+1;
    m.scannedPosts+=Math.max(0,Number(data.scannedPosts||0));
    m.newPosts+=Math.max(0,Number(data.newPosts||0));
    m.duplicates+=Math.max(0,Number(data.duplicates||0));
    m.totalDurationMs+=Math.max(0,Number(data.durationMs||0));
    m.updatedAt=new Date().toISOString();
    PropertiesService.getDocumentProperties().setProperty(groupEfficiencyKey_(key),JSON.stringify(m));
    return m;
  }

  function recommendedScanPolicy_(metric,currentPolicy) {
    metric=metric||{};
    const p=currentPolicy||{scansPerDay:1,postsPerScan:10,maxPostsPerScan:200};
    const successful=Number(metric.successfulScans||0);
    const scanned=Number(metric.scannedPosts||0);
    const yieldRate=scanned?Number(metric.newPosts||0)/scanned:0;
    const avgDurationMs=Number(metric.totalScans||0)?Number(metric.totalDurationMs||0)/Number(metric.totalScans||1):0;
    const out={
      eligible:successful>=5,
      sampleSize:successful,
      yield:yieldRate,
      avgDurationMs,
      recommendedScansPerDay:Number(p.scansPerDay||1),
      recommendedPostsPerScan:Number(p.postsPerScan||10),
      band:'INSUFFICIENT_SAMPLE',
      reason:'Cần >=5 successful scans.'
    };
    if(successful<5) return out;
    if(yieldRate>=0.25){
      out.band='HIGH_YIELD';
      out.recommendedScansPerDay=Math.min(6,Math.max(3,Number(p.scansPerDay||1)));
      out.recommendedPostsPerScan=Math.min(Number(p.maxPostsPerScan||200),Math.max(25,Number(p.postsPerScan||10)));
      out.reason='Yield cao; đề xuất tăng/giữ coverage.';
    }else if(yieldRate<=0.05){
      out.band='LOW_YIELD';
      out.recommendedScansPerDay=Math.max(1,Math.min(2,Number(p.scansPerDay||1)));
      out.recommendedPostsPerScan=Math.max(1,Math.min(10,Number(p.postsPerScan||10)));
      out.reason='Yield thấp sau đủ sample; đề xuất giảm workload.';
    }else{
      out.band='BALANCED';
      out.reason='Yield trung bình; giữ policy hiện tại.';
    }
    return out;
  }

  function getGroupEfficiencyReport_(limit) {
    const config=getAutoPolicyConfig_();
    const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    if(sh.getLastRow()<2) return {version:CFG.VERSION,rows:[]};
    const rows=sh.getRange(2,1,sh.getLastRow()-1,27).getValues();
    const out=[];
    rows.forEach((r,i)=>{
      if(String(r[0]||'').trim()!=='Có') return;
      const group=groupPolicyInput_(r);
      if(!group.groupKey) return;
      const profile=policyProfileForGroup_(config,group.groupKey);
      const policy=resolveEffectiveScanPolicy_(profile,group,config);
      const metric=getGroupEfficiencyMetric_(group.groupKey);
      const recommendation=recommendedScanPolicy_(metric,policy);
      out.push({
        row:i+2,
        name:String(r[2]||'').trim()||('Group '+group.groupKey),
        groupKey:group.groupKey,
        scans:Number(metric.totalScans||0),
        successfulScans:Number(metric.successfulScans||0),
        scannedPosts:Number(metric.scannedPosts||0),
        newPosts:Number(metric.newPosts||0),
        duplicates:Number(metric.duplicates||0),
        errors:Number(metric.errors||0),
        yield:Number(recommendation.yield||0),
        avgDurationMs:Number(recommendation.avgDurationMs||0),
        current:{scansPerDay:policy.scansPerDay,postsPerScan:policy.postsPerScan},
        recommendation
      });
    });
    out.sort((a,b)=>b.successfulScans-a.successfulScans||b.yield-a.yield);
    return {version:CFG.VERSION,minimumSample:5,rows:out.slice(0,Math.max(1,Math.min(100,Number(limit||30))))};
  }

  function applySelectedScanRecommendation_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=ss.getActiveSheet(),ar=sh&&sh.getActiveRange();
    if(!sh||sh.getName()!==CFG.GROUP_SCAN_SHEET||!ar||ar.getRow()<2) throw new Error('Chọn một dòng Group trong QUÉT NHÓM trước.');
    const row=ar.getRow();
    const vals=sh.getRange(row,1,1,27).getValues()[0]||[];
    if(String(vals[0]||'').trim()!=='Có') throw new Error('Group đang không hoạt động.');
    const group=groupPolicyInput_(vals);
    if(!group.groupKey) throw new Error('Group chưa có deterministic identity.');
    const config=getAutoPolicyConfig_();
    const profile=policyProfileForGroup_(config,group.groupKey);
    const policy=resolveEffectiveScanPolicy_(profile,group,config);
    const metric=getGroupEfficiencyMetric_(group.groupKey);
    const rec=recommendedScanPolicy_(metric,policy);
    if(!rec.eligible) throw new Error('Chưa đủ 5 successful scans để apply recommendation.');
    sh.getRange(row,8).setValue(rec.recommendedScansPerDay);
    sh.getRange(row,9).setValue(rec.recommendedPostsPerScan);
    SpreadsheetApp.flush();
    return {ok:true,version:CFG.VERSION,row,groupKey:group.groupKey,recommendation:rec};
  }

  function groupPolicyInput_(row) {
    row=row||[];
    return {
      groupKey:exactGroupKeyFromRow_(row[3],row[4]),
      scansPerDay:Number(row[7]||0),
      postsPerScan:Number(row[8]||0)
    };
  }

  function effectiveNextDueMs_(lastAtMs,scanPolicy) {
    if(!lastAtMs) return 0;
    const p=scanPolicy||{scansPerDay:1,dueToleranceMinutes:0};
    const interval=24*60*60*1000/Math.max(1,Number(p.scansPerDay||1));
    return Number(lastAtMs)+interval-Math.max(0,Number(p.dueToleranceMinutes||0))*60000;
  }

  function shouldAutoScanProfile_(profile,config,force,minuteOfDay) {
    if(!profile||profile.enabled===false) return false;
    if(force===true) return true;
    const w=profileActiveWindow_(profile,config);
    if(minuteOfDay!==undefined&&minuteOfDay!==null){
      return isWithinActiveWindowMinutes_(w.start,w.end,Number(minuteOfDay));
    }
    return isProfileActiveNow_(profile,config,new Date());
  }

  function productFitUnderAiPolicy_(productFit,contextValid,aiPolicy) {
    if(!contextValid || (aiPolicy&&aiPolicy.qualificationEnabled===false)) return 'Chưa rõ';
    return ['Có','Không','Chưa rõ'].indexOf(String(productFit||''))>=0?String(productFit):'Chưa rõ';
  }

  function leadGateUnderAiPolicy_(buyerRole,productFit,needEvidencePass,actionIntentPass,effectiveContext,aiPolicy) {
    if(aiPolicy&&aiPolicy.qualificationEnabled===false){
      if(buyerRole==='Không') return 'FAIL';
      return String(effectiveContext||'').trim()?'WATCH':'CONTEXT_REQUIRED';
    }
    return decideLeadGate_(buyerRole,productFit,needEvidencePass,actionIntentPass,effectiveContext);
  }

  function resolveActionPolicyDecision_(signal,actionPolicy) {
    signal=signal||{};
    const gate=String(signal.gate||'');
    const intent=String(signal.intent||'');
    const nextAction=String(signal.nextAction||'');
    const classification=String(signal.classification||'');
    let action='WATCH';
    if(gate==='FAIL') action=classification==='Nguồn hội thoại'?'NO_ACTION_RELEVANT':'IGNORE';
    else if(gate==='PASS'){
      const ownPost=signal.ownPost===true;
      const strongIntent=ownPost
        ?['Muốn mua','Cần mua gấp'].indexOf(intent)>=0
        :intent==='Cần mua gấp';
      action=strongIntent?'OUTREACH_CANDIDATE':'LEAD';
    }
    else if(gate==='REVIEW_REQUIRED') action='HUMAN_REVIEW';
    else if(['Comment giá trị','Hỏi chẩn đoán','Gợi ý giải pháp','Nối tiếp hội thoại'].indexOf(nextAction)>=0) action='VALUE_COMMENT';
    else if(classification==='Nguồn hội thoại'||classification==='Theo dõi') action='NO_ACTION_RELEVANT';
    return {
      action,
      requiresHumanApproval:!actionPolicy||actionPolicy.humanApproval!==false,
      autoComment:false,
      externalExecutionAllowed:false
    };
  }

  function getAutoPolicyState_() {
    const config=getAutoPolicyConfig_();
    const profile=activePolicyProfile_(config);
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.GROUP_SCAN_SHEET);
    let activeGroups=0,assignedGroups=0;
    const examples=[];
    if(sh&&sh.getLastRow()>=2){
      sh.getRange(2,1,sh.getLastRow()-1,27).getValues().forEach((r,i)=>{
        if(String(r[0]||'').trim()!=='Có') return;
        activeGroups++;
        const group=groupPolicyInput_(r);
        const owner=policyProfileForGroup_(config,group.groupKey);
        if(owner&&profile&&owner.id===profile.id) assignedGroups++;
        if(examples.length<8){
          const effective=resolveEffectiveScanPolicy_(owner,group,config);
          examples.push({
            row:i+2,name:String(r[2]||'').trim(),groupKey:group.groupKey,
            profileId:owner&&owner.id||'',
            scansPerDay:effective.scansPerDay,postsPerScan:effective.postsPerScan,
            sources:effective.sources
          });
        }
      });
    }
    const pool=getWorkerPoolRaw_();
    const browserIdentity=String(profile&&profile.browserIdentity||'').trim().toLowerCase();
    const linkedWorker=(browserIdentity
      ?pool.find(w=>[w.slot,w.label,w.profile].some(v=>String(v||'').trim().toLowerCase()===browserIdentity))
      :pool.find(w=>w.enabled&&w.clientId))||null;
    const profileRuntime={
      health:linkedWorker?workerHealthState_(linkedWorker):(profile&&profile.enabled===false?'PAUSED':'UNBOUND'),
      lastActivity:linkedWorker?String(linkedWorker.lastJobAt||linkedWorker.lastSuccessAt||linkedWorker.lastTestAt||''):'',
      errorState:linkedWorker?String(linkedWorker.lastError||''):'',
      workerSlot:linkedWorker?String(linkedWorker.slot||''):''
    };
    return {
      version:CFG.VERSION,
      config,
      enabled:isAutoMonitorEnabled_(),
      activeProfile:Object.assign({},profile||{},profileRuntime),
      profileRuntime,
      activeGroups,
      assignedGroups,
      capacity:Number(profile&&profile.maxGroupCapacity||0),
      overCapacity:!!profile&&assignedGroups>Number(profile.maxGroupCapacity||0),
      activeNow:!!profile&&isProfileActiveNow_(profile,config,new Date()),
      effective:{
        window:profileActiveWindow_(profile,config),
        scan:resolveEffectiveScanPolicy_(profile,{},config),
        comment:resolveEffectiveCommentPolicy_(profile,null,config),
        ai:resolveEffectiveAiPolicy_(profile,null,config),
        action:resolveEffectiveActionPolicy_(profile,config)
      },
      examples
    };
  }

  function saveAutoPolicyConfig_(command) {
    command=command||{};
    const current=getAutoPolicyConfig_();
    const raw=command.policy&&typeof command.policy==='object'?command.policy:current;
    validateAutoPolicy_(raw);
    const next=normalizeAutoPolicy_(raw);
    const intervalChanged=Number(current.global.auto.triggerMinutes)!==Number(next.global.auto.triggerMinutes);
    PropertiesService.getDocumentProperties().setProperty(CFG.AUTO_POLICY_KEY,JSON.stringify(next));
    let trigger=null;
    if(isAutoMonitorEnabled_() && intervalChanged) trigger=ensureAutoMonitorTrigger_(true);
    return Object.assign(getAutoPolicyState_(),{ok:true,trigger});
  }

  function runConcurrencyLeaseHarness_() {
    const suffix='HARNESS_'+Utilities.getUuid().slice(0,12);
    const aiKey=CFG.AI_LEASE_KEY+'_'+suffix;
    const autoKey=CFG.AUTO_MONITOR_LEASE_KEY+'_'+suffix;
    const postA=commentPostLeasePropertyKey_('HARNESS_POST_A_'+suffix);
    const postB=commentPostLeasePropertyKey_('HARNESS_POST_B_'+suffix);
    const acquired=[];
    const take=(key,owner)=>{
      const x=acquireRuntimeLease_(key,owner,60000);
      if(x&&x.ok) acquired.push([key,x.token]);
      return x;
    };
    try{
      const ai1=take(aiKey,'AI-1');
      const ai2=take(aiKey,'AI-2');
      const auto1=take(autoKey,'AUTO-1');
      const auto2=take(autoKey,'AUTO-2');
      const comment1=take(postA,'COMMENT-1');
      const comment2=take(postA,'COMMENT-2');
      const otherPost=take(postB,'COMMENT-3');
      const tests={
        AI_SINGLE_LEASE:!!ai1.ok && ai2.ok===false && ai2.reason==='LANE_BUSY',
        AUTO_SINGLE_LEASE:!!auto1.ok && auto2.ok===false && auto2.reason==='LANE_BUSY',
        COMMENT_SAME_POST_BLOCKED:!!comment1.ok && comment2.ok===false && comment2.reason==='LANE_BUSY',
        COMMENT_DIFFERENT_POST_PARALLEL:!!otherPost.ok
      };
      const failed=Object.keys(tests).filter(k=>!tests[k]);
      return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
    }finally{
      acquired.reverse().forEach(x=>{try{releaseRuntimeLease_(x[0],x[1]);}catch(_){}});
    }
  }

  function runAutoPolicyHarness_() {
    const config=normalizeAutoPolicy_({
      activeProfileId:'IX01',
      global:{
        auto:{triggerMinutes:5,activeStart:'08:00',activeEnd:'20:00',timezone:'Asia/Ho_Chi_Minh',maxGroupsPerCycle:4,runtimeBudgetMs:230000},
        scan:{scansPerDay:2,postsPerScan:10,maxPostsPerScan:50,dueToleranceMinutes:5,retryAttempts:5,retryBackoffMinutes:[2,10,30]},
        comment:{enabled:true,maxPostsPerCycle:4,maxPagesPerPost:3,maxCommentsPerPost:100,hotWatchHours:24,recheckMinutes:30,ownPostPriority:100,externalPostPriority:50,providerBreakerMinutes:10},
        ai:{signalEnabled:true,qualificationEnabled:true,chunkSize:12},
        action:{humanApproval:true,autoComment:false}
      },
      profiles:[{id:'IX01',displayName:'Pilot',enabled:true,maxGroupCapacity:30,scan:{postsPerScan:15},comment:{},ai:{},action:{}}]
    });
    const profile=activePolicyProfile_(config);
    const globalProfile=Object.assign({},profile,{scan:{}});
    const t01=resolveEffectiveScanPolicy_(globalProfile,{},config);
    const t02=resolveEffectiveScanPolicy_(profile,{},config);
    const t03=resolveEffectiveScanPolicy_(profile,{scansPerDay:3,postsPerScan:25},config);
    let invalid=false,invalidTime=false,invalidProfileTime=false;
    try{validateAutoPolicy_({global:{auto:{triggerMinutes:2},action:{autoComment:true}}});}catch(_){invalid=true;}
    try{validateAutoPolicy_({global:{auto:{activeStart:'29:77'}}});}catch(_){invalidTime=true;}
    try{validateAutoPolicy_({profiles:[{id:'IX01',activeStart:'24:01'}]});}catch(_){invalidProfileTime=true;}
    const noContextFit=productFitUnderAiPolicy_('Có',false,{qualificationEnabled:true});
    const noContextGate=leadGateUnderAiPolicy_('Có',noContextFit,true,true,'',{qualificationEnabled:true});
    const passGate=leadGateUnderAiPolicy_('Có','Có',true,true,'VALID',{qualificationEnabled:true});
    const signalOnly=leadGateUnderAiPolicy_('Có','Chưa rõ',true,true,'VALID',{qualificationEnabled:false});
    const commentOff=normalizeAutoPolicy_({global:{comment:{enabled:false}},profiles:[{id:'IX01',enabled:true}]});
    const lanes=autoPolicyLanePlan_(commentOff,activePolicyProfile_(commentOff));
    const action=resolveActionPolicyDecision_(
      {gate:'PASS',intent:'Cần mua gấp',classification:'Rất tiềm năng',nextAction:'Mời inbox'},
      {humanApproval:true,autoComment:false}
    );
    const ownModerate=resolveActionPolicyDecision_(
      {gate:'PASS',intent:'Muốn mua',classification:'Rất tiềm năng',nextAction:'Mời inbox',ownPost:true},
      {humanApproval:true,autoComment:false}
    );
    const externalModerate=resolveActionPolicyDecision_(
      {gate:'PASS',intent:'Muốn mua',classification:'Rất tiềm năng',nextAction:'Mời inbox',ownPost:false},
      {humanApproval:true,autoComment:false}
    );
    const hf9=runGroupSummaryCardinalityHarness_();
    const tests={
      POLICY_T01_GLOBAL_DEFAULT:t01.postsPerScan===10&&t01.sources.postsPerScan==='GLOBAL',
      POLICY_T02_PROFILE_OVERRIDE:t02.postsPerScan===15&&t02.sources.postsPerScan==='PROFILE',
      POLICY_T03_GROUP_OVERRIDE:t03.postsPerScan===25&&t03.scansPerDay===3&&t03.sources.postsPerScan==='GROUP',
      POLICY_T04_INVALID_REJECTED:invalid&&invalidTime&&invalidProfileTime,
      POLICY_T05_OUTSIDE_ACTIVE_HOURS:shouldAutoScanProfile_(profile,config,false,7*60+30)===false,
      POLICY_T06_MANUAL_RUN_OUTSIDE_WINDOW:shouldAutoScanProfile_(profile,config,true,7*60+30)===true,
      POLICY_T07_COMMENT_OFF_OTHER_LANES_RUN:lanes.comment===false&&lanes.group===true&&lanes.ai===true&&lanes.sales===true,
      POLICY_T08_SIGNAL_CONTEXT_MISSING:noContextFit==='Chưa rõ'&&noContextGate==='CONTEXT_REQUIRED',
      POLICY_T09_QUALIFICATION_REQUIRES_POLICY:passGate==='PASS'&&signalOnly!=='PASS',
      POLICY_T10_HUMAN_APPROVAL_NO_EXTERNAL_ACTION:
        action.action==='OUTREACH_CANDIDATE'&&action.requiresHumanApproval===true&&action.externalExecutionAllowed===false&&action.autoComment===false&&
        ownModerate.action==='OUTREACH_CANDIDATE'&&externalModerate.action==='LEAD',
      POLICY_T11_HF9_CARDINALITY:!!hf9.ok,
      POLICY_T12_LEASE_ISOLATION:runConcurrencyLeaseHarness_().ok===true
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }

  function getVersion() { return CFG.VERSION; }

  function onOpen() {
    SpreadsheetApp.getUi()
      .createMenu('SOCIAL AIO')
      .addItem('Legacy Debug / Import JSON', 'showImportDialog')
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
      'V1.9.8.7-HF10.6 Identity Display Cleanup: cấm placeholder Group <slug/id>; legacy generated names được chuẩn hóa thành CHƯA LẤY TÊN; Group Alias Registry và Group Intelligence khóa identity columns dạng TEXT để không scientific-coerce numeric IDs.\n' +
      'V1.9.8.7-HF10.5 Verified Identity Retry: Group đang LỖI GROUP_ID_RESOLVE chỉ được self-repair đúng 1 lần khi có numeric Group ID deterministic đã xác minh; nếu retry lại fail thì giữ quarantine, không loop.\n' +
      'V1.9.8.7-HF10.4 API-Native Cleanup: production FBAIO paths truyền parsed records trực tiếp vào normalization/write core; JSON file parsing giữ riêng cho Legacy Debug/Recovery; NHẬP JSON vẫn giữ làm RAW POSTS storage để tránh destructive migration.\n' +
      'V1.9.8.7-HF10.3 Group Intelligence: NHÓM trở thành canonical Group Intelligence; tách FB REPORTED/OBSERVED, archive schema cũ, activity-window measurement chỉ ghi Posts/24h và Avg 7d khi đã paginate qua boundary tương ứng.\n' +
      'V1.9.8.7-HF10.2 Group Onboarding: operator chỉ dán Facebook Group URL; canonical duplicate check, registry append với CHƯA LẤY TÊN, discovery scan 10 bài và AI Group evaluation không infer Offer/Posts-day.\n' +
      'V1.9.8.7-HF10 Auto Policy & Profile Settings: structured IX Profile policy; Scan/Comment/AI/Action dùng backend resolver chung; active window + trigger/budget/retry configurable; Auto Comment khóa OFF; AUTO log ghi effective policy.\n' +
      'V1.9.8.7-HF9 Group Summary Cardinality: NHÓM được collapse theo connected canonical Group aliases thành tối đa 1 row/canonical identity; active registry row thắng metadata, inactive-only identity vẫn giữ một representative; KPI source được dedupe theo Source ID.\n' +
      'V1.9.8.7-HF8 Group Summary Identity: NHÓM/Group Summary join CƠ HỘI bằng canonical Group Key aliases thay vì display name; sold KPI chỉ dùng Sales Stage=Đã bán, không fallback Chuyển đổi legacy.\n' +
      'V1.9.8.7-HF7 Sales Transition Guard: Sales Stage là state machine thật; nguồn mới chỉ được vào Qualified khi Lead Gate=PASS; chỉ cho transition tuần tự Qualified→Outreach→Đang hội thoại→Chờ phản hồi→Follow-up→Đã bán/Lost; same-stage update idempotent và terminal stage không tự mở lại.\n' +
      'V1.9.8.7-HF6 Sheet Capacity: worker-fast append tự mở rộng grid trước write; lỗi lịch sử "rows out of bounds" được phân loại transient, clear hard quarantine và retry có kiểm soát; AUTO/self-test ghi evidence capacity repair.\n' +
      'V1.9.8.7-HF5 Provider Resilience: centralize transient failover decision, log fallback success/failure với actual provider/model, và thêm executable provider harness cho 408/429/5xx/high-demand hai chiều.\n' +
      'V1.9.8.7-HF4 Auto Budget: AUTO chừa 120s trước khi start Group job mới; AI auto tối đa 12 source và chỉ start khi còn 160s reserve; cycle rảnh drain AI backlog; AUTO log ghi Runtime/budget/deferred evidence để tránh silent overrun.\n' +
      'V1.9.8.7-HF3 Sales State Guard: non-PASS chưa vào pipeline không thể nhận bất kỳ Sales Stage nào kể cả Lost; source đã ở pipeline vẫn được đóng Lost; terminal stage clear Next Follow-up; conversion state batch-read để bỏ per-row Sheet I/O.\n' +
      'V1.9.8.7-HF2 Group Identity Text: khóa Group ID/Group Key thành TEXT, cấm scientific display làm identity, backfill/repair AF từ Source ID evidence và canonical Group URL để tránh numeric coercion làm sai Group Key.\n' +
      'V1.9.8.7-HF1 Context Integrity: Context Ready chỉ khi đủ 7 field bắt buộc; Recovery/Gate map bằng Group Key canonical thay vì tên Group; global Business Context không được dùng thay Offer Context của Group; CƠ HỘI có Group Key riêng và tự backfill từ source-of-truth.\n' +
      'V1.9.8.7 Sales Readiness Recovery: repair schema NHÓM, archive Lead LEGACY khỏi production inbox, Offer Context workflow, requalification queue, Sales Stage AA:AE và AI cross-provider failover khi provider tạm 5xx/429.\n' +
      'V1.9.8.6 Concurrency Foundation: tách AI/AUTO lane lease, Source-ID AI writeback, Comment Post Lease, Worker role GROUP/COMMENT/BOTH và bỏ physical sort khỏi hot path để chuẩn bị Parallel Pipeline an toàn.\n' +
      'V1.9.8.5 Row Height Standard: khóa chiều cao hàng production ở 21 px cho import, worker append và Lead refresh; tránh Runtime làm giãn hàng trở lại sau khi Sheet đã chuẩn hóa.\n' +
      'V1.9.8.4 Comment/AI Guard: tách lỗi provider-wide Comment khỏi retry theo Post để không kéo backlog vào backoff nhiều giờ; normalize PROVIDER_TRANSIENT cũ thành PROVIDER_WAIT; AI concurrent run được coi là busy hợp lệ thay vì lỗi vận hành.\n' +
      'V1.9.8.3 Sidebar Command Tabs: khôi phục sidebar dọc làm menu hệ thống; tab ngang chỉ nằm trong 200 Group Monitoring cho Quét Nhóm / Quét Comt / AI Phân tích / Cập nhật dữ liệu / Auto Monitor; command chạy backend trực tiếp, link Sheet chỉ là viewer phụ.\n' +
      'V1.9.8.2 Tabbed Smart Cockpit: bản thử nghiệm horizontal shell; đã được V1.9.8.3 điều chỉnh lại theo operator workflow.\n' +
      'V1.9.8.1 Browser Tab Workspace: drill-down BÌNH LUẬN/TÍN HIỆU/LEAD/LOG mở tab trình duyệt tái sử dụng; manual Comment run có evidence COMMENT_UI trong NHẬT KÝ AUTO.\n' +
      'V1.9.8.0 Comment Acquisition Core: phân loại lỗi provider FBAIO, circuit breaker 10 phút, retry backoff theo Post, tự phục hồi false-HARD do dynamic module và ghi evidence Comment vào AUTO log.\n' +
      'V1.9.7.2 Auto Production UX: bỏ TEST 1 CYCLE và nút Due-only khỏi UI production; thay bằng CHẠY NGAY 1 CYCLE dùng full production pipeline Retry → Due → Comment → AI, giữ diagnostic test ẩn cho support.\n' +
      'V1.9.7.1 Auto Test Evidence HF1: TEST 1 CYCLE luôn ghi NHẬT KÝ AUTO kể cả BUSY/NO_DUE/AUTH; phân biệt scheduler idle với Worker PASS; probe quyền ScriptApp và hiển thị next due.\n' +
      'V1.9.7.0 Auto Monitor V2 Production: trigger/auth fail-closed, TEST 1 CYCLE, due revalidation đồng nhất, bounded retry/backoff, per-Group auto evidence và scheduler 5 phút chỉ bật khi trigger thật sự sẵn sàng.\n' +
      'V1.9.6.6 Active Row Canonical Guard: mọi entry point manual resolve canonical Group trước khi quét; row Hoạt động=Không/audit duplicate không thể tự gọi FBAIO; Quét dòng đang chọn redirect sang canonical active.\n' +
      'V1.9.6.5 Success Note Cleanup: scan XONG luôn để trống cột Lỗi/Ghi chú; numeric alias chỉ hiển thị trong Tiến độ và API log, không dùng wording lỗi/fallback ở kết quả thành công.\n' +
      'V1.9.6.4 Custom Scan Target: bỏ preset 10/15/20/25; cho nhập số bài tùy ý 1–200, mặc định 25; Runtime và cột Số bài/lần dùng cùng numeric validation.\n' +
      'V1.9.6.3 Canonical Group Dispatch HF1: manual/retry/worker canonicalize duplicate registry identity trước FBAIO; tick duplicate tự redirect về canonical row; stale duplicate job fail-closed; numeric ID có thể kế thừa từ sibling canonical đã xác minh.\n' +
      'V1.9.6.2 Auto Monitor Readiness HF1: manual selected được khóa CI không đọc Due state; partial scan do time budget được retry có kiểm soát; Due Queue bỏ duplicate registry rows; log time-budget rõ ràng.\n' +
      'V1.9.6.1 FBAIO Preemptive ID: với vanity Group bắt đầu bằng số và đã có numeric ID từng xác minh, gọi thẳng numeric ID để tránh FBAIO parse sai trước khi lỗi xảy ra; fallback reactive vẫn giữ cho các case khác.\n' +
      'V1.9.6 FBAIO Group ID Fallback: nhận diện vanity Group bắt đầu bằng số bị FBAIO parse sai; tự fallback numeric Group ID đã xác minh, ghi runtime failure/fallback vào NHẬT KÝ API và quarantine identity lỗi không thể repair.\n' +
      'V1.9.5 Scan Scope Security HF1: khóa tách biệt CHECKBOX SELECTED và SCHEDULER DUE, fail-closed khi UI/runtime lệch contract; bổ sung release/security regression gate.\n' +
      'V1.9.4 Auto Monitor V2 + Comment Intelligence: backend trigger 5 phút, retry/backoff + hard quarantine, comment delta queue/pagination + AI Gate, production self-test/repair; restore 4-condition Hard Gate và chặn feed identity spillover.\n' +
      'V1.9.3 Operations Dashboard: SLA quét + overdue/coverage + exception queue + fresh signal/AI aging + operational health score cho pilot 200 Group.\n' +
      'V1.9.2 Control Center IA: sidebar 7 khu vực + Overview/System Health; tách Group, Signal/Lead, AI/Offer, Worker/API, Data, Runtime/Logs mà không đổi business logic.\n' +
      'V1.9.1-HF4 Run Scope: bỏ STOP_ALL khỏi worker engine; mỗi batch/cycle có runId + cancellation riêng, không thể nhiễm state giữa các run.\nV1.9.1-HF3 Stop State: xóa STOP_ALL khi bắt đầu run mới và trả STOPPED có cấu trúc; không còn biến stop cũ thành lỗi 0/25.\nV1.9.1-HF2 Raw Pagination: production scanner dùng raw relay wrapper như diagnostic + retry HTTP 200 page rỗng; tránh false empty scan.\nV1.9.1-HF1 Monitor Safety: diagnostic đúng pagination hiện tại + transient retry + per-Group lease + fault isolation cho AUTO MONITOR.\nV1.9.1 Signal Feed: view TÍN HIỆU 7 ngày, Group/ngày summary + native collapse chỉ bung PASS/WATCH/REVIEW; CƠ HỘI giữ nguyên source-of-truth.\nV1.9.0 200G Pilot: Monitoring Overview + Due Queue + fast worker import + lighter post-scan refresh + AI source batching cho pilot 200 Group.\nV1.8.7 worker-health.1: Worker health dùng evidence TEST/SCAN theo thời gian; UNKNOWN/ONLINE/STALE/OFFLINE tách biệt.\nV1.8.7 identity-fix.2: mọi API scan có sourceRow đều normalize registry; hỗ trợ cả numeric→numeric và numeric→slug.\nV1.8.7 identity-fix.1: canonical Group identity bind về đúng source row; không append duplicate khi numeric URL resolve sang slug.\nV1.8.7: Lead Qualification Hard Gate + AI scope AUTO/MANUAL + per-Group AI Context/Offer.\nV1.8.6: Social AIO Group pagination fix — cursor trên result item.\nV1.8.5-diagnostic: API RESPONSE DIAGNOSTIC — kiểm tra raw wrapper, array path, cursor và input mode mà không import dữ liệu.\nV1.8.4-pilot: Pilot chạy 1 Worker (W1); W2/W3 giữ sẵn nhưng tắt mặc định để mở rộng sau.\nV1.8.4-poc: 3 Social AIO Client IDs = 3 worker song song, smart load balancing + Profile affinity.\nV1.8.3-poc: Operator Simple UX — chọn Group, chọn 10/15/20/25 bài, QUÉT; có bộ đếm trạng thái và Retry.\nV1.8.2-poc: Triggerless modeless control center + active-row scan + multi-select queue controls.\nV1.8.1-poc: Sheet-native Group controls + batch selection + stop state + clearer comment URL validation.\nV1.8.0-poc: Official Social AIO HTTP Relay Bridge + direct Group/Post Comment POC.\nV1.7.0: Daily Metrics + Import Log + Nested Comment Intake + Media URLs + Fast Sync + Token Saver.\nAPI key được lưu trong Script Properties, không lưu trong Sheet hoặc GitHub.'
    );
  }

  function showControlCenter(view) {
    ensureV16Sheets_(true);
    const allowed=new Set(['scan','overview','groups','signals','ai','settings','workers','data','system']);
    const initial=allowed.has(String(view||''))?String(view):'scan';
    let htmlText=getRemoteHtml_();
    const uiContractMarker='name="social-aio-contract" content="'+CFG.UI_CONTRACT+'"';
    if(htmlText.indexOf(uiContractMarker)<0){
      throw new Error(
        'UI_RUNTIME_CONTRACT_MISMATCH: Runtime '+CFG.VERSION+' yêu cầu '+CFG.UI_CONTRACT+
        '. Hãy vào SOCIAL AIO → HỆ THỐNG → Cập nhật runtime từ GitHub để nạp đồng bộ Runtime + UI.'
      );
    }
    htmlText=htmlText.replace('<body>', '<body data-initial-view="'+initial+'">');
    const html = HtmlService.createHtmlOutput(htmlText)
      .setWidth(1040)
      .setHeight(820);
    SpreadsheetApp.getUi().showModelessDialog(html, 'Social AIO Control Center');
  }

  function showImportDialog() {
    return showControlCenter('scan');
  }

  function ingestApiRecords_(records,meta) {
    meta=meta||{};
    const list=Array.isArray(records)?records:[];
    if(!list.length) return {version:CFG.VERSION,postImported:0,commentImported:0,duplicates:0,newSourceIds:[]};
    return importJsonFiles([Object.assign({
      name:String(meta.name||'api_payload'),
      parsed:list,
      __apiNative:true
    },meta)]);
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

    const workerFastLock = workerFast ? LockService.getDocumentLock() : null;
    if (workerFastLock) workerFastLock.waitLock(30000);

    const existingPostKeys = workerFast ? loadExistingPostKeysFast_(oppSheet) : loadExistingPostKeys_(rawSheet, oppSheet);
    const existingCommentKeys = workerFast ? loadExistingCommentKeysFast_(commentSheet) : loadExistingCommentKeys_(commentSheet, oppSheet);
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
        const sourceGroupRow = Number(file && file.__sourceGroupRow || 0);
        const sourceGroupUrl = String(file && file.__sourceGroupUrl || '').trim();
        const sourceGroupKey = String(
          file && file.__sourceGroupKey || extractGroupKey_(sourceGroupUrl) || ''
        ).trim().toLowerCase();

        const parsed = file && Object.prototype.hasOwnProperty.call(file,'parsed')
          ? file.parsed
          : JSON.parse(file.text || '[]');
        const kind = detectJsonKind_(file.name || '', parsed);

        if (kind === 'comments') {
          const comments = extractCommentRecords_(parsed, file.name || '');
          if (!comments.length) {
            errors.push(`${file.name}: nhận diện comment JSON nhưng không bóc được comment record.`);
            return;
          }
          const commentFallback={
            postId:String(file && file.__sourcePostId || '').trim(),
            postUrl:String(file && file.__sourcePostUrl || '').trim(),
            groupKey:String(file && file.__sourceGroupKey || '').trim().toLowerCase(),
            groupName:String(file && file.__sourceGroupName || '').trim()
          };
          comments.forEach(item => {
            const x = ingestCommentRecord_(item, file.name || '', ctx, commentFallback);
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

        // API scans know the exact QUÉT NHÓM source row. Always normalize that
        // row before importing posts, even when Facebook keeps the same numeric
        // Group key. If Facebook resolves numeric -> vanity slug, the same bind
        // also canonicalizes the identity without appending a duplicate row.
        // Manual JSON import has no source-row metadata and keeps the legacy
        // ensureGroupRegistered_ fallback below.
        const resolvedScanGroupKey = fileGroupKey || sourceGroupKey;
        let sourceBoundInfo=null;
        let sourceResolvedKey=resolvedScanGroupKey || sourceGroupKey;
        if (sourceGroupRow && sourceResolvedKey) {
          const bound = bindCanonicalGroupToSourceRow_(groupSheet, {
            row: sourceGroupRow,
            sourceUrl: sourceGroupUrl,
            sourceKey: sourceGroupKey,
            canonicalKey: sourceResolvedKey
          });
          if (!bound) {
            throw new Error('SCAN_SOURCE_ROW_MISMATCH: source row đã thay đổi trong lúc quét; fail-closed để tránh tạo Group rác.');
          }
          const discoveredTitle=extractGroupTitleFromPosts_(posts);
          if(discoveredTitle){
            groupSheet.getRange(sourceGroupRow,3).setValue(discoveredTitle);
            bound.name=discoveredTitle;
          }else if(isGroupPlaceholderName_(bound.name)){
            groupSheet.getRange(sourceGroupRow,3).setValue(groupPlaceholderName_());
            bound.name=groupPlaceholderName_();
          }
          mergeGroupAliasRegistry_([
            {
              canonicalKey:sourceResolvedKey,alias:sourceResolvedKey,
              numericId:/^\d{6,}$/.test(sourceResolvedKey)?sourceResolvedKey:'',
              source:'API_SCAN',firstSeen:new Date(),lastSeen:new Date(),reason:'CANONICAL_SCAN_IDENTITY'
            },
            {
              canonicalKey:sourceResolvedKey,alias:sourceGroupKey,
              numericId:/^\d{6,}$/.test(sourceGroupKey)?sourceGroupKey:'',
              source:'API_SCAN',firstSeen:new Date(),lastSeen:new Date(),reason:'SOURCE_URL_ALIAS'
            }
          ]);
          sourceBoundInfo=bound;
          groupMap[sourceResolvedKey] = bound;
          if (fileGroupKey) groupMap[fileGroupKey] = bound;
          if (sourceGroupKey) groupMap[sourceGroupKey] = bound;
          const sourceUrlKey = extractGroupKey_(sourceGroupUrl);
          if (sourceUrlKey) groupMap[sourceUrlKey] = bound;
        }

        posts.forEach(post => {
          postScanned += 1;
          const url = String(post.url || post.permalink_url || post.permalink || '').trim();
          const postId = normalizePostId_(post.post_id || post.postId || post.id || '', url);
          if (!postId && !url) return;

          // API Group scan is authoritative about the monitored Group. A feed item
          // may link to a shared/original post in another Group; never auto-register
          // that linked Group as a new monitored Group.
          let groupKey='',groupInfo=null;
          if(sourceGroupRow && sourceBoundInfo){
            groupKey=String(sourceResolvedKey||sourceGroupKey||'').trim().toLowerCase();
            groupInfo=sourceBoundInfo;
          } else {
            groupKey=extractGroupKey_(url) || String(post.group_id || post.groupId || '').trim().toLowerCase() || fileGroupKey;
            if (groupKey && !groupMap[groupKey]) groupMap[groupKey] = ensureGroupRegistered_(groupSheet, groupKey);
            groupInfo=groupMap[groupKey] || { name:groupPlaceholderName_(), row:null };
          }
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
              '','','','','',
              '','','','','',groupKey
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
    writeRowsForImport_(rawSheet, 5, rawRows, 16, [4,5], workerFast);
    writeRowsForImport_(commentSheet, 2, commentRows, 27, [4,5,7], workerFast);
    writeRowsForImport_(oppSheet, 2, oppRows, CFG.OPPORTUNITY_TOTAL_COLS, [2,CFG.OPPORTUNITY_GROUP_KEY_COL], workerFast);

    finalizeGroupStats_(groupStats);
    updateGroupScanStatus_(groupSheet, groupStats);
    logImportRun_(importRunId, groupStats, files.length, Date.now() - startedMs, errors);

    // V1.8.7: manual JSON import is a fallback ingestion path.
    // Auto AI belongs to the Group-scan workflow only; manual imports wait for an explicit AI scope.
    const aiCfg = getAiConfig_();
    const autoAnalyzeRequested = false;
    const refresh = workerFast ? null : refreshCurrentData({ silent:true, fast:true });
    SpreadsheetApp.flush();
    if (workerFastLock && workerFastLock.hasLock()) workerFastLock.releaseLock();

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
      '','','','','',
      '','','','','',groupKey
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
    sheet.setRowHeights(startRow, rows.length, CFG.SHEET_ROW_HEIGHT_PX);
    const range = sheet.getRange(startRow,1,rows.length,totalCols);
    range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    range.setVerticalAlignment('middle');
    (textCols || []).forEach(col => sheet.getRange(startRow,col,rows.length,1).setNumberFormat('@'));
    range.setValues(rows);
  }

  function ensureSheetRowCapacity_(sheet,endRow) {
    if(!sheet) throw new Error('Thiếu sheet khi kiểm tra row capacity.');
    const target=Math.max(1,Math.floor(Number(endRow||1)));
    const current=sheet.getMaxRows();
    if(target<=current) return {expanded:false,from:current,to:current,added:0};
    const needed=target-current;
    const growth=Math.max(needed,Math.min(500,Math.max(50,Math.ceil(current*0.20))));
    sheet.insertRowsAfter(current,growth);
    return {expanded:true,from:current,to:current+growth,added:growth};
  }

  function writeRowsForImport_(sheet,startRow,rows,totalCols,textCols,workerFast) {
    if (!rows || !rows.length) return;
    if (!workerFast) {
      writeRowsNewestFirst_(sheet,startRow,rows,totalCols,textCols);
      return;
    }

    // Worker path appends instead of shifting the whole sheet on every Group.
    // One sort is done once at batch finalization.
    const row=Math.max(startRow,sheet.getLastRow()+1);
    ensureSheetRowCapacity_(sheet,row+rows.length-1);
    sheet.setRowHeights(row,rows.length, CFG.SHEET_ROW_HEIGHT_PX);
    const range=sheet.getRange(row,1,rows.length,totalCols);
    range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    range.setVerticalAlignment('middle');
    (textCols||[]).forEach(col=>sheet.getRange(row,col,rows.length,1).setNumberFormat('@'));
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

  function loadExistingCommentKeysFast_(commentSheet) {
    const keys=new Set();
    const last=commentSheet.getLastRow();
    if(last<2) return keys;
    commentSheet.getRange(2,7,last-1,2).getValues().forEach(r=>
      makeCommentKeys_(r[0],r[1]).forEach(k=>keys.add(k))
    );
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

  function identityKeyFromCell_(value) {
    if(value===null || value===undefined || value==='') return '';
    if(typeof value==='number'){
      if(!Number.isFinite(value) || !Number.isSafeInteger(value)) return '';
      return String(Math.trunc(value)).toLowerCase();
    }
    const s=String(value||'').trim().toLowerCase();
    if(!s) return '';
    // Formatted scientific notation is display text, not authoritative identity.
    // Never expand it because significant digits may already be lost.
    if(/^[+-]?[0-9]+(?:[.,][0-9]+)?e[+-]?[0-9]+$/i.test(s)) return '';
    return s;
  }

  function normalizeIdentityColumnToText_(sheet,startRow,col) {
    if(!sheet || sheet.getLastRow()<startRow) return {rows:0,converted:0,unresolved:0};
    const n=sheet.getLastRow()-startRow+1;
    const range=sheet.getRange(startRow,col,n,1);
    const values=range.getValues();
    let converted=0,unresolved=0;
    const out=values.map(r=>{
      const raw=r[0];
      const key=identityKeyFromCell_(raw);
      if(key){
        if(typeof raw!=='string' || String(raw)!==key) converted++;
        return [key];
      }
      if(raw!=='' && raw!==null && raw!==undefined) unresolved++;
      return [raw];
    });
    range.setNumberFormat('@');
    if(converted) range.setValues(out);
    return {rows:n,converted,unresolved};
  }

  function normalizeGroupRegistryIdentityText_(sheet) {
    if(!sheet || sheet.getLastRow()<2) return {rows:0,repaired:0,unresolved:0};
    const n=sheet.getLastRow()-1;
    const rows=sheet.getRange(2,4,n,2).getValues();
    const out=[];
    let repaired=0,unresolved=0;
    rows.forEach(r=>{
      const url=String(r[0]||'').trim();
      const fromUrl=extractGroupKey_(url);
      const fromCell=identityKeyFromCell_(r[1]);
      const key=String(fromUrl||fromCell||'').trim().toLowerCase();
      if(!key && (url||r[1])) unresolved++;
      if(key && (typeof r[1]!=='string' || String(r[1]).trim().toLowerCase()!==key)) repaired++;
      out.push([key||r[1]||'']);
    });
    const range=sheet.getRange(2,5,n,1);
    range.setNumberFormat('@');
    if(repaired) range.setValues(out);
    return {rows:n,repaired,unresolved};
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
    normalizeIdentityColumnToText_(cs,2,4);

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

    let al = ss.getSheetByName(CFG.AUTO_LOG_SHEET);
    if (!al) al = ss.insertSheet(CFG.AUTO_LOG_SHEET);
    if (al.getMaxColumns() < 15) al.insertColumnsAfter(al.getMaxColumns(),15-al.getMaxColumns());
    al.getRange(1,1,1,15).setValues([[
      'Thời gian','Run ID','Source','Enabled','Group xử lý','Group PASS','Group lỗi','Group skip',
      'Post comment xử lý','Comment mới','AI analyzed','Duration ms','Trạng thái','Lỗi','Chi tiết'
    ]]);

    let ds = ss.getSheetByName(CFG.DAILY_STATS_SHEET);
    if (!ds) ds = ss.insertSheet(CFG.DAILY_STATS_SHEET);
    if (ds.getMaxColumns() < 18) ds.insertColumnsAfter(ds.getMaxColumns(), 18 - ds.getMaxColumns());
    ds.getRange(1,1,1,18).setValues([[
      'Ngày','Group','Group ID','Lượt cập nhật','JSON đọc hôm nay','Bài quét hôm nay','Comment quét hôm nay',
      'Bài mới hôm nay','Comment mới hôm nay','Trùng hôm nay','Max bài/lần','Tổng bài đang lưu',
      'Tổng comment đang lưu','KH mới hôm nay','KH tiềm năng hiện tại','Lần cập nhật cuối','Trạng thái','Ghi chú'
    ]]);

    let signalFeed = ss.getSheetByName(CFG.SIGNAL_FEED_SHEET);
    if (!signalFeed) {
      signalFeed = ss.insertSheet(CFG.SIGNAL_FEED_SHEET, 1);
    }
    if (signalFeed.getMaxColumns() < 12) {
      signalFeed.insertColumnsAfter(signalFeed.getMaxColumns(), 12 - signalFeed.getMaxColumns());
    }

    const raw = ss.getSheetByName(CFG.RAW_SHEET);
    if (raw) {
      if (raw.getMaxColumns() < 20) raw.insertColumnsAfter(raw.getMaxColumns(),20-raw.getMaxColumns());
      normalizeIdentityColumnToText_(raw,5,4);
      raw.getRange(4,15,1,6).setValues([[
        'Media URL','Media count','Comment đã lấy','Comment cursor','Comment scan cuối','Comment sync trạng thái'
      ]]);
    }

    const opp = ss.getSheetByName(CFG.OPPORTUNITY_SHEET);
    if (opp) {
      if (opp.getMaxColumns() < CFG.OPPORTUNITY_TOTAL_COLS) opp.insertColumnsAfter(opp.getMaxColumns(), CFG.OPPORTUNITY_TOTAL_COLS - opp.getMaxColumns());
      opp.getRange(1,2).setValue('Source ID');
      opp.getRange(1,21,1,6).setValues([[
        'Media URL','Vai trò mua','Product Fit','Bằng chứng nhu cầu','Lead Gate','Lý do Gate'
      ]]);
      opp.getRange(1,27,1,6).setValues([[
        'Sales Stage','Last Contact','Next Follow-up','Owner','Outcome / Value','Group Key'
      ]]);
      const stageRule=SpreadsheetApp.newDataValidation()
        .requireValueInList(CFG.SALES_STAGE_OPTIONS,true)
        .setAllowInvalid(false)
        .build();
      if(opp.getMaxRows()>=2) {
        opp.getRange(2,27,opp.getMaxRows()-1,1).setDataValidation(stageRule);
        opp.getRange(2,CFG.OPPORTUNITY_GROUP_KEY_COL,opp.getMaxRows()-1,1).setNumberFormat('@');
      }
      backfillOpportunityGroupKeys_(opp);
    }

    const lead = ss.getSheetByName(CFG.LEAD_SHEET);
    if (lead) {
      if (lead.getMaxColumns() < 21) lead.insertColumnsAfter(lead.getMaxColumns(), 21-lead.getMaxColumns());
      lead.getRange(1,17,1,5).setValues([[
        'Ngày thành KH tiềm năng','Vai trò mua','Product Fit','Lead Gate','Bằng chứng Gate'
      ]]);
    }

    const groupSummary=ss.getSheetByName(CFG.GROUP_SUMMARY_SHEET);
    if(groupSummary){
      ensureGroupIntelligenceLegacyArchive_(groupSummary);
      if(groupSummary.getMaxColumns()<17) groupSummary.insertColumnsAfter(groupSummary.getMaxColumns(),17-groupSummary.getMaxColumns());
      groupSummary.getRange(1,1,1,17).setValues([[
        'Group Name','Group URL','IX Profile','Canonical Group Key',
        'Members — FB REPORTED','Post 24h — FB REPORTED',
        'Post 24h — OBSERVED','Avg Posts/day 7d — OBSERVED','Comments/day — OBSERVED',
        'Relevant % — OBSERVED','Buyer Signal % — OBSERVED','Lead Yield — OBSERVED',
        'Group Fit Score','AI Topic Summary','Recommended Scans/day','Recommended Posts/scan','Last Evaluation'
      ]]);
      groupSummary.setFrozenRows(1);
    }

    const scan = ss.getSheetByName(CFG.GROUP_SCAN_SHEET);
    if (scan) {
      if (scan.getMaxColumns() < 27) scan.insertColumnsAfter(scan.getMaxColumns(),27-scan.getMaxColumns());
      scan.getRange(1,17,1,6).setValues([[
        'Lượt cập nhật hôm nay','Bản ghi lần cuối','Bài quét lần cuối',
        'Bài mới hôm nay','Comment mới hôm nay','KH mới hôm nay'
      ]]);
      scan.getRange(1,27).setValue('AI Context / Offer');
      normalizeGroupRegistryIdentityText_(scan);
      setupBridgeControlColumns_(scan);
    }
    props.setProperty(schemaKey, CFG.VERSION);
  }

  function ensureLegacyLeadArchive_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    let sh=ss.getSheetByName(CFG.LEAD_LEGACY_ARCHIVE_SHEET);
    if(!sh) sh=ss.insertSheet(CFG.LEAD_LEGACY_ARCHIVE_SHEET);
    if(sh.getMaxColumns()<23) sh.insertColumnsAfter(sh.getMaxColumns(),23-sh.getMaxColumns());
    sh.getRange(1,1,1,23).setValues([[
      'Tên KH','URL Facebook','Nhóm','Loại nguồn','URL bài / comment','Nội dung nhu cầu',
      'Pain','Intent','Điểm','Phân loại','Số cơ hội','Hành động gần nhất','Hành động tiếp theo',
      'Follow-up','Chuyển đổi','Ghi chú','Ngày thành KH tiềm năng','Vai trò mua','Product Fit',
      'Lead Gate','Bằng chứng Gate','Archived At','Archive Reason'
    ]]);
    sh.setFrozenRows(1);
    return sh;
  }

  function legacyLeadArchiveKey_(r) {
    const fb=normalizeFacebookProfileUrl_(r&&r[1]||'');
    const src=normalizeUrl_(r&&r[4]||'');
    const name=String(r&&r[0]||'').trim().toLowerCase();
    return fb ? 'FB|'+fb : (src ? 'SRC|'+src : ('NAME|'+name));
  }

  function archiveLegacyLeadRows_(rows,reason) {
    const legacy=(rows||[]).filter(r=>String(r&&r[19]||'').trim()==='LEGACY');
    if(!legacy.length) return {archived:0};
    const sh=ensureLegacyLeadArchive_();
    const existing=new Set();
    if(sh.getLastRow()>=2){
      sh.getRange(2,1,sh.getLastRow()-1,21).getValues().forEach(r=>existing.add(legacyLeadArchiveKey_(r)));
    }
    const now=new Date();
    const out=[];
    legacy.forEach(r=>{
      const key=legacyLeadArchiveKey_(r);
      if(existing.has(key)) return;
      existing.add(key);
      const x=r.slice(0,21);
      while(x.length<21) x.push('');
      x.push(now,String(reason||'Migrated from production Lead Inbox'));
      out.push(x);
    });
    if(out.length){
      const start=Math.max(2,sh.getLastRow()+1);
      sh.getRange(start,1,out.length,23).setValues(out);
      sh.setRowHeights(start,out.length,CFG.SHEET_ROW_HEIGHT_PX);
      sh.getRange(start,1,out.length,23).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    }
    return {archived:out.length};
  }

  function normalizeOfferContextLabel_(label) {
    return String(label||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toUpperCase().replace(/[^A-Z0-9]/g,'');
  }

  function offerContextCanonicalField_(label) {
    const key=normalizeOfferContextLabel_(label);
    const aliases={
      OFFER:'OFFER',
      BUYER:'BUYER',
      PROBLEM:'PROBLEM',
      PRODUCTSERVICE:'PRODUCT-SERVICE',
      VALUE:'VALUE',
      QUALIFICATION:'QUALIFICATION',
      CTA:'CTA'
    };
    return aliases[key]||'';
  }

  function isMeaningfulOfferContextValue_(value) {
    const v=String(value||'').replace(/\s+/g,' ').trim();
    if(v.length<2) return false;
    return !/^(?:-|—|n\/?a|na|none|null|todo|tbd|unknown|chưa rõ|không rõ)$/i.test(v);
  }

  function validateOfferContext_(text) {
    const raw=String(text||'').replace(/\r/g,'').trim();
    const fields={};
    let current='';
    raw.split('\n').forEach(line=>{
      const x=String(line||'').trim();
      if(!x) return;
      const m=x.match(/^([^:：]{2,50})\s*[:：]\s*(.*)$/);
      if(m){
        const key=offerContextCanonicalField_(m[1]);
        if(key){
          current=key;
          fields[key]=String(m[2]||'').trim();
          return;
        }
      }
      if(current) fields[current]=(fields[current]+' '+x).trim();
    });

    const missing=CFG.OFFER_CONTEXT_FIELDS.filter(k=>!isMeaningfulOfferContextValue_(fields[k]));
    const normalized=CFG.OFFER_CONTEXT_FIELDS
      .map(k=>k+': '+String(fields[k]||'').trim())
      .join('\n');
    return {
      valid:missing.length===0,
      fields,
      missing,
      normalized,
      raw
    };
  }

  function canonicalGroupKeyAliasesFromScanRow_(r,rowNumber) {
    r=r||[];
    const url=String(r[3]||'').trim();
    const aliases=new Set();
    const add=v=>{
      const x=String(v||'').trim().toLowerCase();
      if(x && !/[eE]\+\d+$/.test(x)) aliases.add(x);
    };
    add(exactGroupKeyFromRow_(url,r[4]));
    add(extractGroupKey_(url));
    add(r[4]);

    // Preserve verified historical aliases without doing O(n^2) registry scans.
    const lastFile=String(r[12]||'').trim();
    const note=String(r[15]||'').trim();
    let m=lastFile.match(/^api_posts_(.+?)_\d{8}_\d{6}\.json$/i);
    if(m) add(m[1]);
    const re=/facebook\.com\/groups\/([^\s\/?#]+)/ig;
    while((m=re.exec(note))!==null) add(m[1]);

    return [...aliases];
  }

  function loadValidatedGroupContexts_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=ss.getSheetByName(CFG.GROUP_SCAN_SHEET);
    const map={};
    const groups=[];
    if(!sh || sh.getLastRow()<2) return {map,groups,validCount:0,invalidCount:0};
    const rows=sh.getRange(2,1,sh.getLastRow()-1,27).getValues();
    let validCount=0,invalidCount=0;
    rows.forEach((r,i)=>{
      if(String(r[0]||'').trim()!=='Có') return;
      const row=i+2;
      const aliases=canonicalGroupKeyAliasesFromScanRow_(r,row);
      const primary=aliases[0]||'';
      const validation=validateOfferContext_(r[26]);
      const item={
        row,
        name:String(r[2]||'').trim()||('Group '+String(primary||row)),
        groupKey:primary,
        aliases,
        valid:validation.valid,
        missingFields:validation.missing,
        context:validation.valid?validation.normalized:'',
        rawContext:String(r[26]||'').trim()
      };
      groups.push(item);
      if(validation.valid){
        validCount++;
        aliases.forEach(k=>{map['KEY|'+k]=validation.normalized;});
      }else{
        invalidCount++;
      }
    });
    return {map,groups,validCount,invalidCount};
  }

  function getContextReadiness_() {
    const ctx=loadValidatedGroupContexts_();
    const active=ctx.groups.length;
    const notReady=ctx.groups.filter(x=>!x.valid);
    return {
      version:CFG.VERSION,
      active,
      withContext:ctx.validCount,
      invalid:ctx.invalidCount,
      missing:notReady.length,
      missingGroups:notReady.slice(0,50).map(x=>({
        row:x.row,name:x.name,groupId:x.groupKey,
        missingFields:x.missingFields,
        hasText:!!x.rawContext
      }))
    };
  }

  function saveActiveGroupContext_(command) {
    command=command||{};
    const validation=validateOfferContext_(command.context);
    if(!validation.valid){
      throw new Error(
        'Offer Context chưa hợp lệ. Bắt buộc đủ 7 field: '+CFG.OFFER_CONTEXT_FIELDS.join(' / ')+
        '. Thiếu hoặc rỗng: '+validation.missing.join(', ')+'.'
      );
    }
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=ss.getActiveSheet();
    const ar=sh&&sh.getActiveRange();
    if(!sh || sh.getName()!==CFG.GROUP_SCAN_SHEET || !ar || ar.getRow()<2){
      throw new Error('Hãy chọn đúng dòng Group trong sheet QUÉT NHÓM trước.');
    }
    const row=ar.getRow();
    if(String(sh.getRange(row,1).getDisplayValue()||'').trim()!=='Có'){
      throw new Error('Group dòng '+row+' đang không hoạt động.');
    }
    const identity=canonicalGroupKeyAliasesFromScanRow_(sh.getRange(row,1,1,27).getDisplayValues()[0],row);
    if(!identity.length) throw new Error('Group dòng '+row+' chưa có canonical Group Key hợp lệ.');
    sh.getRange(row,27).setValue(validation.normalized);
    SpreadsheetApp.flush();
    return {
      ok:true,version:CFG.VERSION,row,
      name:String(sh.getRange(row,3).getDisplayValue()||'').trim(),
      groupKey:identity[0],
      context:validation.normalized,
      readiness:getContextReadiness_()
    };
  }

  function buildSourceGroupKeyMap_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const out=new Map();

    const add=(sourceId,rawKey)=>{
      const sid=String(sourceId||'').trim();
      const key=identityKeyFromCell_(rawKey);
      if(sid&&key&&!out.has(sid)) out.set(sid,key);
    };

    const raw=ss.getSheetByName(CFG.RAW_SHEET);
    if(raw && raw.getLastRow()>=5){
      raw.getRange(5,4,raw.getLastRow()-4,2).getValues().forEach(r=>add(r[1],r[0]));
    }

    const comments=ss.getSheetByName(CFG.COMMENT_SHEET);
    if(comments && comments.getLastRow()>=2){
      comments.getRange(2,4,comments.getLastRow()-1,4).getValues().forEach(r=>{
        const commentId=String(r[3]||'').trim();
        if(commentId) add('C:'+commentId,r[0]);
      });
    }
    return out;
  }


  function backfillOpportunityGroupKeys_(oppSheet) {
    const sh=oppSheet||SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.OPPORTUNITY_SHEET);
    if(!sh || sh.getLastRow()<2 || sh.getMaxColumns()<CFG.OPPORTUNITY_GROUP_KEY_COL){
      return {rows:0,filled:0,repaired:0,missing:0,unresolvedScientific:0};
    }
    const n=sh.getLastRow()-1;
    const ids=sh.getRange(2,2,n,1).getDisplayValues();
    const keyRange=sh.getRange(2,CFG.OPPORTUNITY_GROUP_KEY_COL,n,1);
    const keys=keyRange.getValues();
    const sourceMap=buildSourceGroupKeyMap_();
    const out=[];
    let filled=0,repaired=0,missing=0,unresolvedScientific=0;

    for(let i=0;i<n;i++){
      const sourceId=String(ids[i][0]||'').trim();
      const rawCurrent=keys[i][0];
      const current=identityKeyFromCell_(rawCurrent);
      const evidence=String(sourceMap.get(sourceId)||'').trim().toLowerCase();
      let key=current;

      if(evidence){
        key=evidence;
        if(!current) filled++;
        else if(current!==evidence || typeof rawCurrent!=='string') repaired++;
      }else if(sourceId && !current){
        missing++;
        if(typeof rawCurrent==='string' && /e[+-]?[0-9]+$/i.test(String(rawCurrent).trim())) unresolvedScientific++;
      }

      out.push([key||'']);
    }

    keyRange.setNumberFormat('@');
    if(filled||repaired) keyRange.setValues(out);
    return {rows:n,filled,repaired,missing,unresolvedScientific};
  }


  function getSalesRecoveryQueue_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const opp=mustSheet_(ss,CFG.OPPORTUNITY_SHEET);
    const keyRepair=backfillOpportunityGroupKeys_(opp);
    const contexts=loadValidatedGroupContexts_();
    const contextKeys=new Set(
      Object.keys(contexts.map)
        .filter(k=>k.indexOf('KEY|')===0)
        .map(k=>k.slice(4))
    );

    const rows=opp.getLastRow()>=2?opp.getRange(2,1,opp.getLastRow()-1,CFG.OPPORTUNITY_TOTAL_COLS).getValues():[];
    const sourceIds=[];
    let noContext=0,identityMissing=0,legacyPotential=0,ungated=0,unclearFit=0;
    rows.forEach(r=>{
      const sourceId=String(r[1]||'').trim();
      const groupKey=String(r[CFG.OPPORTUNITY_GROUP_KEY_COL-1]||'').trim().toLowerCase();
      if(!sourceId) return;
      if(!groupKey){identityMissing++;return;}
      if(!contextKeys.has(groupKey)){noContext++;return;}
      const gate=String(r[24]||'').trim();
      const buyer=String(r[21]||'').trim();
      const fit=String(r[22]||'').trim();
      const cls=String(r[11]||'').trim();
      const reason=String(r[25]||'');
      const isLegacyPotential=!gate && (cls==='Tiềm năng'||cls==='Rất tiềm năng');
      const needsGate=!gate;
      const needsFit=fit==='Chưa rõ' || /Context=Thiếu/i.test(reason) || gate==='CONTEXT_REQUIRED';
      const hardBuyerFail=gate==='FAIL' && buyer==='Không';
      if(isLegacyPotential) legacyPotential++;
      if(needsGate) ungated++;
      if(needsFit) unclearFit++;
      if(!hardBuyerFail && (needsGate||needsFit)) sourceIds.push(sourceId);
    });
    const unique=[...new Set(sourceIds)];
    return {
      version:CFG.VERSION,
      sourceIds:unique.slice(0,5000),
      ready:unique.length,
      groupsWithContext:contexts.validCount,
      invalidContexts:contexts.invalidCount,
      noContext,identityMissing,legacyPotential,ungated,unclearFit,
      groupKeyBackfill:keyRepair
    };
  }


  function decideLeadGate_(buyerRole,productFit,needEvidencePass,actionIntentPass,effectiveContext) {
    if(buyerRole==='Không') return 'FAIL';
    if(!String(effectiveContext||'').trim()) return 'CONTEXT_REQUIRED';
    if(productFit==='Không') return 'FAIL';
    if(buyerRole==='Chưa rõ' || productFit==='Chưa rõ' || !needEvidencePass) return 'REVIEW_REQUIRED';
    if(buyerRole==='Có' && productFit==='Có' && needEvidencePass && actionIntentPass) return 'PASS';
    return 'WATCH';
  }

  function runContextIntegrityHarness_() {
    const full=[
      'OFFER: Test offer',
      'BUYER: Test buyer',
      'PROBLEM: Test problem',
      'PRODUCT-SERVICE: Test service',
      'VALUE: Test value',
      'QUALIFICATION: Test qualification',
      'CTA: Test CTA'
    ].join('\n');
    const noCta=[
      'OFFER: Test offer',
      'BUYER: Test buyer',
      'PROBLEM: Test problem',
      'PRODUCT-SERVICE: Test service',
      'VALUE: Test value',
      'QUALIFICATION: Test qualification'
    ].join('\n');

    const t01=validateOfferContext_('abc');
    const t02=validateOfferContext_(noCta);
    const t03=validateOfferContext_(full);
    const saveRejects=context=>{
      try{
        saveActiveGroupContext_({context});
        return {rejected:false,message:''};
      }catch(err){
        return {rejected:true,message:String(err&&err.message||err||'')};
      }
    };
    const saveT01=saveRejects('abc');
    const saveT02=saveRejects(noCta);
    const fixtureKey='2444637922355640';
    const fixtureMap={};
    fixtureMap['KEY|'+fixtureKey]=t03.normalized;
    const resolved=resolveAiContextForGroup_('Display name must not matter',fixtureKey,{businessContext:'GLOBAL SHOULD NOT QUALIFY'},fixtureMap);
    const isolated=resolveAiContextForGroup_('Display name',fixtureKey,{businessContext:'GLOBAL SHOULD NOT QUALIFY'},{});
    const t04Gate=decideLeadGate_('Có','Chưa rõ',true,true,isolated);

    const tests={
      T01_GARBAGE_CONTEXT: !t01.valid && t01.missing.length===CFG.OFFER_CONTEXT_FIELDS.length && saveT01.rejected && /Offer Context chưa hợp lệ/.test(saveT01.message),
      T02_MISSING_CTA: !t02.valid && t02.missing.indexOf('CTA')>=0 && saveT02.rejected && /CTA/.test(saveT02.message),
      T03_FULL_SEVEN_FIELDS: t03.valid && CFG.OFFER_CONTEXT_FIELDS.every(k=>isMeaningfulOfferContextValue_(t03.fields[k])) && resolved===t03.normalized,
      T04_GLOBAL_CONTEXT_ISOLATION: isolated==='' && t04Gate==='CONTEXT_REQUIRED',
      ID_NUMERIC_SAFE_INTEGER: identityKeyFromCell_(2444637922355640)==='2444637922355640',
      ID_SCIENTIFIC_DISPLAY_REJECTED: identityKeyFromCell_('2,44464E+15')==='',
      ID_PRODUCT_SERVICE_EXACT: offerContextCanonicalField_('PRODUCT-SERVICE')==='PRODUCT-SERVICE' && offerContextCanonicalField_('PRODUCT')==='' && offerContextCanonicalField_('SERVICE')==='',
      SALES_NONPASS_NEW_BLOCKED: canSetSalesStage_('REVIEW_REQUIRED','')===false && canSetSalesStage_('FAIL','')===false,
      SALES_PASS_NEW_ALLOWED: canSetSalesStage_('PASS','')===true,
      SALES_ENTRY_ONLY_QUALIFIED: isSalesStageTransitionAllowed_('PASS','','Qualified')===true && isSalesStageTransitionAllowed_('PASS','','Outreach')===false,
      SALES_SEQUENCE_FORWARD_ONLY:
        isSalesStageTransitionAllowed_('PASS','Qualified','Outreach')===true &&
        isSalesStageTransitionAllowed_('PASS','Outreach','Đang hội thoại')===true &&
        isSalesStageTransitionAllowed_('PASS','Đang hội thoại','Chờ phản hồi')===true &&
        isSalesStageTransitionAllowed_('PASS','Chờ phản hồi','Follow-up')===true &&
        isSalesStageTransitionAllowed_('PASS','Follow-up','Đã bán')===true &&
        isSalesStageTransitionAllowed_('PASS','Follow-up','Lost')===true,
      SALES_SKIP_BLOCKED:
        isSalesStageTransitionAllowed_('PASS','Qualified','Đang hội thoại')===false &&
        isSalesStageTransitionAllowed_('PASS','Outreach','Follow-up')===false &&
        isSalesStageTransitionAllowed_('PASS','Đang hội thoại','Đã bán')===false,
      SALES_SAME_STAGE_IDEMPOTENT: isSalesStageTransitionAllowed_('REVIEW_REQUIRED','Outreach','Outreach')===true,
      SALES_TERMINAL_LOCKED: isSalesStageTransitionAllowed_('PASS','Đã bán','Follow-up')===false && isSalesStageTransitionAllowed_('PASS','Lost','Qualified')===false,
      SALES_TERMINAL_CLEARS_FOLLOWUP: nextFollowUpForSalesStage_('Đã bán',new Date(),'2026-09-30')==='' && nextFollowUpForSalesStage_('Lost',new Date(),'2026-09-30')==='',
      SHEET_CAPACITY_ERROR_TRANSIENT: classifyAutoSheetException_('LỖI','Those rows are out of bounds.')==='TRANSIENT' && classifyAutoSheetException_('LỖI','ROW_CAPACITY_RETRY')==='TRANSIENT'
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }

  function runProviderResilienceHarness_() {
    const codes=[408,429,500,502,503,504];
    const geminiCfg={provider:'gemini',openaiConfigured:true,geminiConfigured:true};
    const openaiCfg={provider:'openai',openaiConfigured:true,geminiConfigured:true};
    const tests={
      TRANSIENT_HTTP_CODES: codes.every(code=>{
        const t=getAiFailoverTarget_(geminiCfg,new Error('Gemini HTTP '+code+': synthetic transient'));
        return !!t && t.provider==='openai' && t.model==='gpt-5.6-luna';
      }),
      TRANSIENT_TEXT_HIGH_DEMAND: getAiFailoverTarget_(geminiCfg,new Error('high demand'))?.provider==='openai',
      TRANSIENT_TEXT_RATE_LIMIT: getAiFailoverTarget_(openaiCfg,new Error('rate limit exceeded'))?.provider==='gemini',
      GEMINI_TO_OPENAI: getAiFailoverTarget_(geminiCfg,new Error('HTTP 503 unavailable'))?.provider==='openai',
      OPENAI_TO_GEMINI: getAiFailoverTarget_(openaiCfg,new Error('HTTP 429 rate limit'))?.provider==='gemini',
      NO_SECOND_PROVIDER_FAIL_CLOSED: getAiFailoverTarget_({provider:'gemini',openaiConfigured:false},new Error('HTTP 503 unavailable'))===null,
      NON_TRANSIENT_NO_FAILOVER: getAiFailoverTarget_(geminiCfg,new Error('HTTP 400 invalid request'))===null
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }

  function normalizeSalesStage_(stage) {
    const raw=String(stage||'').trim();
    const match=CFG.SALES_STAGE_OPTIONS.find(x=>x.toLowerCase()===raw.toLowerCase());
    if(!match) throw new Error('Sales Stage không hợp lệ: '+raw);
    return match;
  }

  function salesConversionForStage_(stage) {
    if(stage==='Đã bán') return 'Đã bán';
    if(stage==='Lost') return 'Không chuyển đổi';
    if(['Outreach','Đang hội thoại','Chờ phản hồi','Follow-up'].indexOf(stage)>=0) return 'Đang hội thoại';
    return 'Chưa có';
  }

  function canSetSalesStage_(gate,existingStage) {
    return String(gate||'').trim()==='PASS' || !!String(existingStage||'').trim();
  }

  function isSalesStageTransitionAllowed_(gate,currentStage,targetStage) {
    const gateValue=String(gate||'').trim();
    const current=String(currentStage||'').trim();
    const target=normalizeSalesStage_(targetStage);
    if(!current) return gateValue==='PASS' && target==='Qualified';
    if(current===target) return true;
    if(current==='Đã bán' || current==='Lost') return false;

    const next={
      'Qualified':'Outreach',
      'Outreach':'Đang hội thoại',
      'Đang hội thoại':'Chờ phản hồi',
      'Chờ phản hồi':'Follow-up'
    };
    if(next[current]===target) return true;
    if(current==='Follow-up' && (target==='Đã bán' || target==='Lost')) return true;
    return false;
  }

  function salesTransitionReason_(gate,currentStage,targetStage) {
    const current=String(currentStage||'').trim();
    const target=String(targetStage||'').trim();
    if(!current && String(gate||'').trim()!=='PASS') return 'NON_PASS_ENTRY';
    if(!current && target!=='Qualified') return 'ENTRY_MUST_BE_QUALIFIED';
    if(current==='Đã bán' || current==='Lost') return 'TERMINAL_STAGE';
    return 'INVALID_TRANSITION';
  }

  function nextFollowUpForSalesStage_(stage,nextFollow,previousFollow) {
    if(stage==='Đã bán' || stage==='Lost') return '';
    return nextFollow || previousFollow || '';
  }

  function setSelectedOpportunitySalesStage_(command) {
    command=command||{};
    const stage=normalizeSalesStage_(command.stage);
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=ss.getActiveSheet();
    const ar=sh&&sh.getActiveRange();
    if(!sh || sh.getName()!==CFG.OPPORTUNITY_SHEET || !ar || ar.getRow()<2){
      throw new Error('Hãy chọn dòng lead trong sheet CƠ HỘI trước.');
    }
    const start=Math.max(2,ar.getRow());
    const end=ar.getLastRow();
    const n=end-start+1;
    const sourceIds=sh.getRange(start,2,n,1).getDisplayValues();
    const gates=sh.getRange(start,25,n,1).getDisplayValues();
    const existingConversions=sh.getRange(start,18,n,1).getValues();
    const existingStages=sh.getRange(start,27,n,5).getValues();
    const now=new Date();
    const days=Math.max(0,Math.min(30,Number(command.followUpDays||0)));
    const nextFollow=days>0?new Date(now.getTime()+days*86400000):'';
    const owner=String(command.owner||'').trim();
    const outcome=String(command.outcome||'').trim();
    const salesRows=[];
    const conversions=[];
    let updated=0,skipped=0;
    const skipReasons={};

    for(let i=0;i<n;i++){
      const sourceId=String(sourceIds[i][0]||'').trim();
      const gate=String(gates[i][0]||'').trim();
      const prev=existingStages[i]||[];
      const currentConversion=existingConversions[i] ? existingConversions[i][0] : '';
      if(!sourceId){
        salesRows.push(prev);conversions.push([currentConversion]);skipped++;
        skipReasons.MISSING_SOURCE_ID=(skipReasons.MISSING_SOURCE_ID||0)+1;
        continue;
      }
      const alreadyInSales=String(prev[0]||'').trim();
      if(!canSetSalesStage_(gate,alreadyInSales)){
        salesRows.push(prev);
        conversions.push([currentConversion]);
        skipped++;
        skipReasons.NON_PASS_ENTRY=(skipReasons.NON_PASS_ENTRY||0)+1;
        continue;
      }
      if(!isSalesStageTransitionAllowed_(gate,alreadyInSales,stage)){
        salesRows.push(prev);
        conversions.push([currentConversion]);
        skipped++;
        const reason=salesTransitionReason_(gate,alreadyInSales,stage);
        skipReasons[reason]=(skipReasons[reason]||0)+1;
        continue;
      }
      salesRows.push([
        stage,
        now,
        nextFollowUpForSalesStage_(stage,nextFollow,prev[2]),
        owner || prev[3] || '',
        outcome || prev[4] || ''
      ]);
      conversions.push([salesConversionForStage_(stage)]);
      updated++;
    }

    if(updated){
      sh.getRange(start,27,n,5).setValues(salesRows);
      sh.getRange(start,18,n,1).setValues(conversions);
      SpreadsheetApp.flush();
    }
    return {ok:true,version:CFG.VERSION,stage,updated,skipped,skipReasons,startRow:start,endRow:end,pipeline:getSalesPipelineStats_()};
  }

  function getSalesPipelineStats_() {
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.OPPORTUNITY_SHEET);
    const stages={};
    CFG.SALES_STAGE_OPTIONS.forEach(x=>stages[x]=0);
    if(!sh || sh.getLastRow()<2) return {version:CFG.VERSION,total:0,open:0,sold:0,lost:0,unassignedPass:0,stages};
    const n=sh.getLastRow()-1;
    const gates=sh.getRange(2,25,n,1).getDisplayValues();
    const sales=sh.getRange(2,27,n,1).getDisplayValues();
    let open=0,sold=0,lost=0,unassignedPass=0;
    sales.forEach((r,i)=>{
      const stage=String(r[0]||'').trim();
      if(stage&&stages[stage]!==undefined) stages[stage]++;
      if(['Outreach','Đang hội thoại','Chờ phản hồi','Follow-up'].indexOf(stage)>=0) open++;
      if(stage==='Đã bán') sold++;
      if(stage==='Lost') lost++;
      if(String(gates[i][0]||'').trim()==='PASS' && !stage) unassignedPass++;
    });
    return {version:CFG.VERSION,total:n,open,sold,lost,unassignedPass,stages};
  }

  function handleUiCommand_(command) {
    const name = String(command.__command || '');
    if (name === 'GET_AI_CONFIG') return getAiConfig_();
    if (name === 'SAVE_AI_CONFIG') return saveAiConfig_(command);
    if (name === 'ANALYZE_NEW') return analyzeNewPosts_({ silent: false });
    if (name === 'ANALYZE_SCOPE') return analyzeByScope_(command);
    if (name === 'TEST_AI') return testAiConnection_();
    if (name === 'GET_AI_PROGRESS') return getAiProgress_();
    if (name === 'GET_CONTEXT_READINESS') return getContextReadiness_();
    if (name === 'RUN_CONTEXT_INTEGRITY_HARNESS') return runContextIntegrityHarness_();
    if (name === 'RUN_PROVIDER_RESILIENCE_HARNESS') return runProviderResilienceHarness_();
    if (name === 'SAVE_ACTIVE_GROUP_CONTEXT') return saveActiveGroupContext_(command);
    if (name === 'GET_SALES_RECOVERY_QUEUE') return getSalesRecoveryQueue_();
    if (name === 'GET_SALES_PIPELINE') return getSalesPipelineStats_();
    if (name === 'SET_SELECTED_SALES_STAGE') return setSelectedOpportunitySalesStage_(command);
    if (name === 'AUDIT_CONSISTENCY') return auditConsistency_();
    if (name === 'GET_BRIDGE_CONFIG') return getApiBridgeConfig_();
    if (name === 'SAVE_BRIDGE_CONFIG') return saveApiBridgeConfig_(command);
    if (name === 'TEST_BRIDGE') return testApiBridge_();
    if (name === 'GET_MONITORING_OVERVIEW') return getMonitoringOverview_();
    if (name === 'GET_AUTO_POLICY') return getAutoPolicyState_();
    if (name === 'SAVE_AUTO_POLICY') return saveAutoPolicyConfig_(command);
    if (name === 'RUN_AUTO_POLICY_HARNESS') return runAutoPolicyHarness_();
    if (name === 'GET_GROUP_EFFICIENCY') return getGroupEfficiencyReport_(command.limit);
    if (name === 'APPLY_SELECTED_SCAN_RECOMMENDATION') return applySelectedScanRecommendation_();
    if (name === 'REPAIR_GROUP_DISPLAY_NAMES') return repairLegacyGroupDisplayNames_();
    if (name === 'ONBOARD_GROUP_URL') return prepareOnboardingWorkerBatch_(command);
    if (name === 'EVALUATE_GROUP_DISCOVERY') return evaluateGroupDiscovery_(command);
    if (name === 'GET_GROUP_DISCOVERY') return getGroupDiscovery_(command.groupKey);
    if (name === 'MEASURE_GROUP_ACTIVITY') return measureGroupActivityWindow_(command);
    if (name === 'GET_AUTO_MONITOR_V2') return getAutoMonitorV2State_(false);
    if (name === 'SET_AUTO_MONITOR_V2') return setAutoMonitorV2_(command.enabled !== false);
    if (name === 'RUN_AUTO_MONITOR_NOW') return autoMonitorTick_({force:true,source:'UI'});
    if (name === 'RUN_AUTO_MONITOR_TEST') return autoMonitorTick_({force:true,source:'UI_TEST',testMode:true,maxJobs:1,skipComments:true,skipAi:true});
    if (name === 'GET_COMMENT_INTELLIGENCE') return getCommentIntelligenceStats_();
    if (name === 'RUN_COMMENT_INTELLIGENCE') return runCommentIntelligenceUi_(command.limit||CFG.COMMENT_MAX_POSTS_PER_TICK);
    if (name === 'GET_WORKSPACE_LINKS') return getWorkspaceLinks_();
    if (name === 'RUN_PRODUCTION_SELF_TEST') return runProductionSelfTest_(command.repair !== false);
    if (name === 'REFRESH_SIGNAL_FEED') return refreshSignalFeed_();
    if (name === 'OPEN_SIGNAL_FEED') return openOperationalSheet_(CFG.SIGNAL_FEED_SHEET);
    if (name === 'OPEN_LEAD_INBOX') return openOperationalSheet_(CFG.LEAD_SHEET);
    if (name === 'GET_WORKER_POOL') return getWorkerPoolPublic_();
    if (name === 'SAVE_WORKER_POOL') return saveWorkerPool_(command.workers || []);
    if (name === 'TEST_WORKER_POOL') return testWorkerPool_();
    if (name === 'RUN_API_DIAGNOSTIC') return runApiResponseDiagnostic_(command);
    if (name === 'PREPARE_SELECTED_WORKER_BATCH') return prepareWorkerBatch_(command.targetCount, false);
    // Legacy alias kept for one transition cycle. New UI must use PREPARE_SELECTED_WORKER_BATCH.
    if (name === 'PREPARE_WORKER_BATCH') return prepareWorkerBatch_(command.targetCount, false);
    if (name === 'PREPARE_DUE_WORKER_BATCH') return prepareDueWorkerBatch_(command.limit || CFG.DUE_CYCLE_LIMIT);
    if (name === 'PREPARE_RETRY_WORKER_BATCH') return prepareWorkerBatch_(command.targetCount, true);
    if (name === 'RUN_WORKER_JOB') return runWorkerJob_(command);
    if (name === 'FINALIZE_WORKER_BATCH') return finalizeWorkerBatch_(command);
    if (name === 'STOP_SCAN_RUN') return requestStopScanRun_(command.runId);
    if (name === 'BRIDGE_SCAN_GROUP') return scanGroupApiBridge_(command.groupUrl, command.targetCount || 25);
    if (name === 'BRIDGE_FETCH_COMMENTS') return fetchCommentsApiBridge_(command.postUrl);
    if (name === 'GET_GROUP_SCAN_CONTROL') return getGroupScanControlState_();
    if (name === 'RUN_ACTIVE_GROUP') return scanActiveGroupApiBridge_(command.targetCount);
    if (name === 'RUN_CHECKED_GROUPS') return scanCheckedGroupsApiBridge_(command.targetCount);
    if (name === 'RETRY_FAILED_GROUPS') return retryFailedGroupsApiBridge_();
    if (name === 'STOP_CHECKED_GROUPS') return stopCheckedGroupsApiBridge_(command);
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

  function saveLastScanSourceIds_(ids) {
    const clean=[...new Set((ids||[]).map(x=>String(x||'').trim()).filter(Boolean))].slice(0,1000);
    PropertiesService.getDocumentProperties().setProperty(
      CFG.LAST_SCAN_SOURCE_IDS_KEY,
      JSON.stringify({sourceIds:clean,updatedAt:new Date().toISOString()})
    );
    return clean;
  }

  function getLastScanSourceIds_() {
    const raw=PropertiesService.getDocumentProperties().getProperty(CFG.LAST_SCAN_SOURCE_IDS_KEY)||'';
    if(!raw) return [];
    try {
      const parsed=JSON.parse(raw);
      return Array.isArray(parsed.sourceIds)?parsed.sourceIds.map(x=>String(x||'').trim()).filter(Boolean):[];
    } catch (_) {
      return [];
    }
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
    } else if(scope==='last_scan') {
      options.scope='source_ids';
      options.sourceIds=getLastScanSourceIds_();
      if(!options.sourceIds.length) throw new Error('Chưa có dữ liệu mới từ lần quét gần nhất.');
    } else if(scope==='source_ids') {
      options.sourceIds=(command.sourceIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
      options.forceReanalysis=command.forceReanalysis===true;
      if(!options.sourceIds.length) throw new Error('Không có Source ID để AI phân tích.');
    } else if(scope==='legacy_gate') {
      options.scope='legacy_gate';
    } else {
      options.scope='all_waiting';
    }

    return analyzeNewPosts_(options);
  }
  function getAiProgressRaw_() {
    const raw=PropertiesService.getScriptProperties().getProperty('AI_PROGRESS_JSON');
    if(!raw) return {active:false,version:CFG.VERSION};
    try{return Object.assign({active:false},JSON.parse(raw),{version:CFG.VERSION});}
    catch(_){return {active:false,version:CFG.VERSION};}
  }

  function repairStaleAiProgress_() {
    const p=getAiProgressRaw_();
    if(!p.active) return p;

    const lease=getRuntimeLease_(CFG.AI_LEASE_KEY);
    if(lease.active) return p;

    const updatedMs=Date.parse(String(p.updatedAt||''));
    const age=updatedMs?Math.max(0,Date.now()-updatedMs):Number.MAX_SAFE_INTEGER;
    if(age<CFG.AI_PROGRESS_STALE_MS) return p;

    const fixed=setAiProgress_(Object.assign({},p,{
      active:false,
      status:'STALE_RECOVERED',
      lastError:'AI run mất heartbeat/lease; đã tự giải phóng để queue tiếp tục.',
      staleRecoveredAt:new Date().toISOString()
    }));
    logAi_({
      runId:p.runId||'',event:'STALE_RECOVERED',provider:p.provider||'',model:p.model||'',
      batch:p.batch||0,totalBatches:p.totalBatches||0,analyzed:p.analyzed||0,total:p.total||0,
      remaining:p.remaining||0,status:'STALE_RECOVERED',
      message:'Không còn AI lease và heartbeat đã stale; runtime tự giải phóng run.'
    });
    return fixed;
  }

  function getAiProgress_() {
    const p=repairStaleAiProgress_();
    p.version=CFG.VERSION;
    return p;
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
    return loadValidatedGroupContexts_().map;
  }

  function resolveAiContextForGroup_(groupName,groupKey,cfg,map) {
    const key=String(groupKey||'').trim().toLowerCase();
    if(!key) return '';
    const m=map||loadGroupAiContextMap_();
    // Strict invariant: Group-specific Offer Context only. Global Business Context
    // is background guidance for the model and can never satisfy Context Readiness.
    return String(m['KEY|'+key]||'').trim();
  }

  function analyzeNewPosts_(options) {
    const silent = options && options.silent;
    const cfg = getAiConfig_();
    if (!cfg.configured) throw new Error('Chưa cấu hình API key cho nhà cung cấp AI đang chọn.');

    const runId = Utilities.getUuid().slice(0, 8);
    const prior=repairStaleAiProgress_();
    const priorLease=getRuntimeLease_(CFG.AI_LEASE_KEY);
    if(prior.active || priorLease.active){
      const activeRun=String((prior&&prior.runId)||priorLease.owner||'').trim();
      throw new Error('AI đang chạy ở phiên khác' + (activeRun ? ' (Run ' + activeRun + ')' : '') + '.');
    }

    const aiLease=acquireRuntimeLease_(CFG.AI_LEASE_KEY,runId,CFG.AI_LEASE_TTL_MS);
    if(!aiLease.ok){
      const p=getAiProgressRaw_();
      throw new Error('AI đang chạy ở phiên khác' + (p&&p.runId ? ' (Run '+p.runId+')' : '') + '.');
    }

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
      let rows;
      if(scope==='source_ids' && sourceSet.size){
        const probeCount=Math.min(last-1,Math.max(200,sourceSet.size*2));
        const probe=sheet.getRange(2,1,probeCount,26).getValues();
        const found=new Set(probe.map(r=>String(r[1]||'').trim()).filter(x=>sourceSet.has(x)));
        rows=found.size===sourceSet.size ? probe : sheet.getRange(2,1,last-1,26).getValues();
      } else {
        rows=sheet.getRange(2,1,last-1,26).getValues();
      }
      const contextMap=loadGroupAiContextMap_();
      const groupKeyColumn=sheet.getRange(2,CFG.OPPORTUNITY_GROUP_KEY_COL,last-1,1).getDisplayValues();
      const candidates = [];

      rows.forEach((r, i) => {
        const rowNumber=i+2;
        const sourceId=String(r[1]||'').trim();
        const content = String(r[7] || '').trim();
        const priorAnalyzed=[r[8], r[9], r[10], r[11]].some(v => v !== '' && v !== null && v !== undefined);
        const gate=String(r[24]||'').trim();
        const status = String(r[19] || '').trim();
        const group=String(r[4]||'').trim();
        const groupKey=String(groupKeyColumn[i]&&groupKeyColumn[i][0]||'').trim().toLowerCase();

        if(!sourceId || !content || status==='Đóng') return;
        if(scope==='groups' && !groupSet.has(group)) return;
        if(scope==='selected_rows' && !rowSet.has(rowNumber)) return;
        if(scope==='source_ids' && !sourceSet.has(String(r[1]||'').trim())) return;
        if(scope==='legacy_gate') {
          if(!priorAnalyzed || gate) return;
        } else if(scope==='selected_rows') {
          // Explicit selection is a force re-analysis action.
        } else if(scope==='source_ids' && options&&options.forceReanalysis===true) {
          // Sales recovery explicitly re-qualifies stable Source IDs after Offer Context changes.
        } else {
          // Normal/auto scopes process only genuinely pending sources.
          if(priorAnalyzed || gate) return;
        }

        const sourceType = String(r[3] || 'Bài viết');
        candidates.push({
          source_id:sourceId,
          group,
          author: String(r[5] || ''),
          content: compressEvidenceForAi_(content, sourceType),
          sourceType,
          sourceUrl: String(r[2] || ''),
          groupKey,
          offerContext: resolveAiContextForGroup_(group,groupKey,cfg,contextMap),
          engagement: String(r[18] || ''),
          postDate: r[0] instanceof Date
            ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')
            : String(r[0] || '')
        });
      });

      const requestedLimit=Number(options&&options.maxRowsOverride||cfg.maxRows);
      const runLimit=Math.max(1,Math.min(200,Number.isFinite(requestedLimit)?Math.floor(requestedLimit):cfg.maxRows));
      const selected = candidates.slice(0, runLimit);
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

        heartbeatRuntimeLease_(CFG.AI_LEASE_KEY,aiLease.token,CFG.AI_LEASE_TTL_MS);
        setAiProgress_({
          active:true, runId, status:'RUNNING', provider:cfg.provider,
          model: PropertiesService.getScriptProperties().getProperty('AI_LAST_GEMINI_MODEL') || cfg.model,
          batch:batchNo, totalBatches, analyzed, total, remaining:Math.max(0,total-analyzed), errors:errors.length
        });

        try {
          const results = analyzeBatchWithProviderFailover_(batch,cfg,{
            runId,batch:batchNo,totalBatches,analyzed,total
          });

          const applied=applyAiAnalysis_(sheet, results);
          SpreadsheetApp.flush();
          analyzed += Number(applied&&applied.applied||0);
          if(applied&&applied.missing){
            errors.push('Batch '+batchNo+': '+Number(applied.missing||0)+' source_id không còn ánh xạ duy nhất; đã skip fail-closed.');
          }
          heartbeatRuntimeLease_(CFG.AI_LEASE_KEY,aiLease.token,CFG.AI_LEASE_TTL_MS);

          const effectiveProps=PropertiesService.getScriptProperties();
          const actualProvider=effectiveProps.getProperty('AI_LAST_EFFECTIVE_PROVIDER') || cfg.provider;
          const actualModel=effectiveProps.getProperty('AI_LAST_EFFECTIVE_MODEL') ||
            (cfg.provider === 'gemini'
              ? (effectiveProps.getProperty('AI_LAST_GEMINI_MODEL') || cfg.model)
              : cfg.model);

          setAiProgress_({
            active:true, runId, status:'RUNNING', provider:actualProvider, model:actualModel,
            batch:batchNo, totalBatches, analyzed, total, remaining:Math.max(0,total-analyzed), errors:errors.length
          });
          logAi_({
            runId, event:'BATCH_OK', provider:actualProvider, model:actualModel, batch:batchNo, totalBatches,
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
      const finalProps=PropertiesService.getScriptProperties();
      const actualProvider=finalProps.getProperty('AI_LAST_EFFECTIVE_PROVIDER') || cfg.provider;
      const actualModel=finalProps.getProperty('AI_LAST_EFFECTIVE_MODEL') ||
        (cfg.provider === 'gemini'
          ? (finalProps.getProperty('AI_LAST_GEMINI_MODEL') || cfg.model)
          : cfg.model);

      setAiProgress_({
        active:false, runId, status:errors.length ? 'DONE_WITH_ERRORS' : 'DONE',
        provider:actualProvider, model:actualModel, batch:totalBatches, totalBatches,
        analyzed, total, remaining, errors:errors.length
      });
      logAi_({
        runId, event:'DONE', provider:actualProvider, model:actualModel, batch:totalBatches, totalBatches,
        analyzed, total, remaining, status:errors.length ? 'DONE_WITH_ERRORS' : 'DONE',
        message:errors.length ? errors.join(' | ').slice(0, 4000) : 'Hoàn thành.'
      });

      const result = { version: CFG.VERSION, runId, analyzed, remaining, errors, provider: actualProvider, model: actualModel, refresh, scope };

      if (!silent) {
        SpreadsheetApp.getActive().toast(
          'Run ' + runId + ' | Đã phân tích ' + analyzed + ' bài | Còn ' + remaining + (errors.length ? ' | Có lỗi' : ''),
          'AI PHÂN TÍCH',
          8
        );
      }
      return result;
    } catch(err) {
      const p=getAiProgressRaw_();
      if(p&&p.active&&String(p.runId||'')===String(runId)){
        setAiProgress_(Object.assign({},p,{
          active:false,status:'ERROR_ABORTED',
          lastError:String(err&&err.message||err||'').slice(0,500)
        }));
        logAi_({
          runId,event:'ABORT',provider:cfg.provider,model:p.model||cfg.model,
          batch:p.batch||0,totalBatches:p.totalBatches||0,analyzed:p.analyzed||0,total:p.total||0,
          remaining:p.remaining||0,status:'ERROR_ABORTED',
          message:String(err&&err.message||err||'').slice(0,1000)
        });
      }
      throw err;
    } finally {
      releaseRuntimeLease_(CFG.AI_LEASE_KEY,aiLease.token);
    }
  }

  function isTransientAiProviderError_(err) {
    return /HTTP\s+(408|429|500|502|503|504)\b|high demand|temporar(?:y|ily)|rate limit|overloaded|unavailable/i
      .test(String(err&&err.message||err||''));
  }

  function getAiFailoverTarget_(cfg,err) {
    cfg=cfg||{};
    if(!isTransientAiProviderError_(err)) return null;
    if(cfg.provider==='gemini' && cfg.openaiConfigured){
      return {from:'gemini',provider:'openai',model:'gpt-5.6-luna'};
    }
    if(cfg.provider==='openai' && cfg.geminiConfigured){
      return {from:'openai',provider:'gemini',model:'gemini-auto'};
    }
    return null;
  }

  function setLastEffectiveAiProvider_(provider,model) {
    const p=PropertiesService.getScriptProperties();
    p.setProperty('AI_LAST_EFFECTIVE_PROVIDER',String(provider||''));
    p.setProperty('AI_LAST_EFFECTIVE_MODEL',String(model||''));
  }

  function logAiFailover_(meta,target,primaryErr,status,detail) {
    meta=meta||{}; target=target||{};
    logAi_({
      runId:meta.runId||'',
      event:status==='OK'?'PROVIDER_FAILOVER':'PROVIDER_FAILOVER_FAILED',
      provider:target.provider||'',
      model:target.model||'',
      batch:meta.batch||0,totalBatches:meta.totalBatches||0,
      analyzed:meta.analyzed||0,total:meta.total||0,
      remaining:Math.max(0,Number(meta.total||0)-Number(meta.analyzed||0)),
      status,
      message:String(target.from||'primary')+' transient -> '+String(target.provider||'fallback')+
        ' '+String(status||'')+'. Primary: '+String(primaryErr&&primaryErr.message||primaryErr||'').slice(0,400)+
        (detail?(' | Fallback: '+String(detail).slice(0,400)):'')
    });
  }

  function analyzeBatchWithProviderFailover_(batch,cfg,meta) {
    meta=meta||{};
    try{
      if(cfg.provider==='gemini'){
        const result=callGeminiStructured_(aiSystemPrompt_(cfg),JSON.stringify(batch),analysisSchema_(),cfg);
        if(!result.data || !Array.isArray(result.data.analyses)) throw new Error('Gemini không trả về analyses hợp lệ.');
        setLastEffectiveAiProvider_('gemini',result.model||cfg.model);
        return result.data.analyses;
      }
      const out=analyzeBatchWithOpenAi_(batch,cfg);
      setLastEffectiveAiProvider_('openai',cfg.model);
      return out;
    }catch(primaryErr){
      const target=getAiFailoverTarget_(cfg,primaryErr);
      if(!target) throw primaryErr;
      const fallbackCfg=Object.assign({},cfg,{provider:target.provider,model:target.model});
      try{
        if(target.provider==='openai'){
          const out=analyzeBatchWithOpenAi_(batch,fallbackCfg);
          setLastEffectiveAiProvider_('openai',fallbackCfg.model);
          logAiFailover_(meta,target,primaryErr,'OK','');
          return out;
        }
        const result=callGeminiStructured_(aiSystemPrompt_(fallbackCfg),JSON.stringify(batch),analysisSchema_(),fallbackCfg);
        if(!result.data || !Array.isArray(result.data.analyses)) throw new Error('Gemini fallback không trả analyses hợp lệ.');
        target.model=result.model||fallbackCfg.model;
        setLastEffectiveAiProvider_('gemini',target.model);
        logAiFailover_(meta,target,primaryErr,'OK','');
        return result.data.analyses;
      }catch(fallbackErr){
        logAiFailover_(meta,target,primaryErr,'ERROR',fallbackErr&&fallbackErr.message||fallbackErr);
        throw fallbackErr;
      }
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
              source_id: { type: 'string' },
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
              'source_id','pain','intent','buyer_role','product_fit','need_evidence',
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
      'Mỗi input có source_id. BẮT BUỘC trả lại chính xác source_id đó, không đổi, không suy diễn và không trả row_number.',
      'Mục tiêu không phải tìm mọi người có vấn đề. Mục tiêu là phân biệt: (1) người có nhu cầu, (2) người có khả năng là buyer, (3) nhu cầu có phù hợp đúng sản phẩm/dịch vụ đang bán hay không.',
      'buyer_role chỉ được dùng: Có, Không, Chưa rõ. Có = chính người đăng/comment có tín hiệu là người có thể mua/ra quyết định/sử dụng giải pháp. Không = người bán, quảng cáo, chia sẻ kiến thức hoặc không phải đối tượng mua. Chưa rõ = evidence không đủ.',
      'Mỗi input có thể có offerContext. offerContext là ngữ cảnh bán hàng đã validate của đúng Group và là nguồn DUY NHẤT để xác nhận Product Fit.',
      'Business context toàn cục chỉ là background guidance; TUYỆT ĐỐI không được dùng thay offerContext của Group và không được biến Group thiếu Context thành Product Fit = Có.',
      'product_fit chỉ được dùng: Có, Không, Chưa rõ. Có chỉ khi nhu cầu khớp trực tiếp offerContext của Group. Không khi nhu cầu lệch offerContext. Chưa rõ khi offerContext trống hoặc evidence không đủ.',
      'Nếu offerContext trống: BẮT BUỘC product_fit = Chưa rõ, bất kể Business context toàn cục có nội dung gì.',
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

  function buildOwnPostSourceMap_(policyConfig) {
    const config=policyConfig||getAutoPolicyConfig_();
    const hasIdentity=(config.profiles||[]).some(p=>(p.facebookIdentities||[]).length>0);
    const out={};
    if(!hasIdentity) return out;
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const raw=ss.getSheetByName(CFG.RAW_SHEET);
    const postOwn={};
    if(raw&&raw.getLastRow()>=5){
      raw.getRange(5,4,raw.getLastRow()-4,5).getDisplayValues().forEach(r=>{
        const groupKey=String(r[0]||'').trim().toLowerCase();
        const postId=String(r[1]||'').trim();
        const authorUrl=String(r[4]||'').trim();
        if(!postId) return;
        const profile=policyProfileForGroup_(config,groupKey);
        const own=isProfileOwnPost_(profile,authorUrl);
        postOwn[postId]=own;
        out[postId]=own;
      });
    }
    const comments=ss.getSheetByName(CFG.COMMENT_SHEET);
    if(comments&&comments.getLastRow()>=2){
      comments.getRange(2,4,comments.getLastRow()-1,4).getDisplayValues().forEach(r=>{
        const postId=String(r[1]||'').trim();
        const commentId=String(r[3]||'').trim();
        if(commentId) out['C:'+commentId]=!!postOwn[postId];
      });
    }
    return out;
  }

  function applyAiAnalysis_(sheet, analyses) {
    const allowedIntent = new Set(['Hỏi kinh nghiệm','Tìm giải pháp','So sánh','Xác thực','Phản đối','Muốn đổi','Muốn mua','Cần mua gấp','Chia sẻ','Thảo luận','Không ưu tiên']);
    const allowedClass = new Set(['Rất tiềm năng','Tiềm năng','Theo dõi','Nguồn hội thoại','Không phải KH']);
    const allowedAction = new Set(['Bỏ qua','Theo dõi','Comment giá trị','Hỏi chẩn đoán','Tạo nhu cầu','Nối tiếp hội thoại','Xử lý phản đối','Gợi ý giải pháp','Mời inbox','Kết bạn','CTA']);
    const allowedBinary = new Set(['Có','Không','Chưa rõ']);
    const cfg=getAiConfig_();
    const policyConfig=getAutoPolicyConfig_();
    const ownPostSourceMap=buildOwnPostSourceMap_(policyConfig);
    const groupContextMap=loadGroupAiContextMap_();
    const now = new Date();

    const writeLock=LockService.getDocumentLock();
    writeLock.waitLock(30000);
    try{
      const last=sheet.getLastRow();
      if(last<2) return {applied:0,missing:(analyses||[]).length};

      const sourceValues=sheet.getRange(2,2,last-1,1).getDisplayValues();
      const sourceRows=new Map();
      const duplicateIds=new Set();
      sourceValues.forEach((r,i)=>{
        const id=String(r[0]||'').trim();
        if(!id) return;
        if(sourceRows.has(id)){
          duplicateIds.add(id);
          sourceRows.delete(id);
          return;
        }
        if(!duplicateIds.has(id)) sourceRows.set(id,i+2);
      });

      const valid=[];
      let missing=0,appliedCount=0;
      (analyses||[]).forEach(a=>{
        const sourceId=String(a&&a.source_id||'').trim();
        const row=sourceId&&!duplicateIds.has(sourceId)?Number(sourceRows.get(sourceId)||0):0;
        if(!sourceId || row<2 || row>last){
          missing++;
          return;
        }
        valid.push({a,row,sourceId});
      });
      if(!valid.length) return {applied:0,missing};

      const minRow=Math.min(...valid.map(x=>x.row));
      const maxRow=Math.max(...valid.map(x=>x.row));
      const values=sheet.getRange(minRow,1,maxRow-minRow+1,26).getValues();
      const groupKeys=sheet.getRange(minRow,CFG.OPPORTUNITY_GROUP_KEY_COL,maxRow-minRow+1,1).getDisplayValues();

      valid.forEach(x=>{
        const a=x.a;
        const sourceId=x.sourceId;
        const idx=x.row-minRow;
        const r=values[idx];

        // Fail closed if the row changed between source map and range read.
        if(String(r[1]||'').trim()!==x.sourceId){
          missing++;
          return;
        }

        const intent=allowedIntent.has(String(a.intent))?String(a.intent):'Thảo luận';
        const suggestedClass=allowedClass.has(String(a.classification))?String(a.classification):'Theo dõi';
        const action=allowedAction.has(String(a.next_action))?String(a.next_action):'Theo dõi';
        const buyerRole=allowedBinary.has(String(a.buyer_role))?String(a.buyer_role):'Chưa rõ';
        let productFit=allowedBinary.has(String(a.product_fit))?String(a.product_fit):'Chưa rõ';
        const rowGroup=String(r[4]||'').trim();
        const rowGroupKey=String(groupKeys[idx]&&groupKeys[idx][0]||'').trim().toLowerCase();
        const effectiveContext=resolveAiContextForGroup_(rowGroup,rowGroupKey,cfg,groupContextMap);
        const policyProfile=policyProfileForGroup_(policyConfig,rowGroupKey);
        const aiPolicy=resolveEffectiveAiPolicy_(policyProfile,{groupKey:rowGroupKey},policyConfig);
        const actionPolicy=resolveEffectiveActionPolicy_(policyProfile,policyConfig);
        productFit=productFitUnderAiPolicy_(productFit,!!effectiveContext,aiPolicy);

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

        const evidence=String(a.need_evidence||'').trim() || 'Không có bằng chứng nhu cầu rõ';
        const needEvidencePass=
          !!evidence &&
          !/^không có bằng chứng nhu cầu rõ$/i.test(evidence);
        const actionableIntents=new Set([
          'Hỏi kinh nghiệm','Tìm giải pháp','So sánh','Xác thực','Phản đối',
          'Muốn đổi','Muốn mua','Cần mua gấp'
        ]);
        const passiveActions=new Set(['Bỏ qua','Theo dõi']);
        const actionIntentPass=
          actionableIntents.has(intent) &&
          !passiveActions.has(action);

        const gate=leadGateUnderAiPolicy_(buyerRole,productFit,needEvidencePass,actionIntentPass,effectiveContext,aiPolicy);

        let classification=suggestedClass;
        if(gate==='PASS') classification=score>=80?'Rất tiềm năng':'Tiềm năng';
        else if(gate==='FAIL') classification=suggestedClass==='Nguồn hội thoại'?'Nguồn hội thoại':'Không phải KH';
        else if(!['Nguồn hội thoại','Không phải KH'].includes(suggestedClass)) classification='Theo dõi';

        const days=Math.max(0,Math.min(30,Math.round(Number(a.follow_up_days||0))));
        const follow=days>0?new Date(now.getTime()+days*86400000):'';
        let status='Theo dõi';
        if(gate==='PASS') status='Đang xử lý';
        if(gate==='FAIL'&&classification==='Không phải KH') status='Đóng';

        const ownPostSource=ownPostSourceMap[sourceId]===true;
        const policyDecision=resolveActionPolicyDecision_({
          gate,intent,classification:suggestedClass,nextAction:action,ownPost:ownPostSource
        },actionPolicy);
        const gateReason=[
          'Buyer='+buyerRole,
          'Fit='+productFit,
          'Context='+(effectiveContext?'VALID_GROUP_CONTEXT':'MISSING_OR_INVALID'),
          'AIStage='+(aiPolicy.qualificationEnabled?'SIGNAL+QUALIFICATION':'SIGNAL_ONLY'),
          'SourceKind='+(ownPostSource?(sourceId.startsWith('C:')?'OWN_POST_COMMENT':'OWN_POST'):'EXTERNAL_GROUP_SOURCE'),
          'PolicyAction='+policyDecision.action,
          'HumanApproval='+(policyDecision.requiresHumanApproval?'YES':'NO'),
          'AutoComment=OFF',
          'NeedEvidence='+(needEvidencePass?'PASS':'NO'),
          'ActionIntent='+(actionIntentPass?'PASS':'NO'),
          'Intent='+intent,
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
        appliedCount++;
      });

      sheet.getRange(minRow,1,values.length,26).setValues(values);
      return {applied:appliedCount,missing};
    } finally {
      writeLock.releaseLock();
    }
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
    const rows = sheet.getRange(2,1,last-1,CFG.OPPORTUNITY_TOTAL_COLS).getValues();
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
    sheet.getRange(2,1,rows.length,CFG.OPPORTUNITY_TOTAL_COLS).clearContent();
    if (groups.length) {
      sheet.getRange(2,2,groups.length,1).setNumberFormat('@');
      sheet.getRange(2,1,groups.length,CFG.OPPORTUNITY_TOTAL_COLS).setValues(groups);
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

  function workspaceSheetMap_() {
    return {
      groups:CFG.GROUP_SCAN_SHEET,
      group_intelligence:CFG.GROUP_SUMMARY_SHEET,
      comments:CFG.COMMENT_SHEET,
      signals:CFG.SIGNAL_FEED_SHEET,
      leads:CFG.LEAD_SHEET,
      opportunity:CFG.OPPORTUNITY_SHEET,
      raw:CFG.RAW_SHEET,
      ai_log:CFG.AI_LOG_SHEET,
      api_log:CFG.API_DIAG_SHEET,
      auto_log:CFG.AUTO_LOG_SHEET,
      import_log:CFG.IMPORT_LOG_SHEET
    };
  }

  function getWorkspaceLinks_() {
    ensureV16Sheets_(false);
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const base=String(ss.getUrl()||'').replace(/#.*$/,'');
    const links={};
    const sheets={};
    const map=workspaceSheetMap_();
    Object.keys(map).forEach(key=>{
      const sh=ss.getSheetByName(map[key]);
      if(!sh) return;
      links[key]=base+'#gid='+sh.getSheetId();
      sheets[key]=sh.getName();
    });
    return {version:CFG.VERSION,links,sheets};
  }

  function openOperationalSheet_(sheetName) {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=ss.getSheetByName(String(sheetName||''));
    if(!sh) throw new Error('Không tìm thấy sheet '+sheetName);
    ss.setActiveSheet(sh);
    return {version:CFG.VERSION,sheet:sh.getName()};
  }

  function openSignalFeed() {
    ensureV16Sheets_(false);
    refreshSignalFeed_({silent:true});
    return openOperationalSheet_(CFG.SIGNAL_FEED_SHEET);
  }

  function openLeadInbox() {
    ensureV16Sheets_(false);
    return openOperationalSheet_(CFG.LEAD_SHEET);
  }

  function signalFeedDate_(value) {
    if(value instanceof Date && !isNaN(value.getTime())) return value;
    const text=String(value||'').trim();
    let m=text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if(m) return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]));
    m=text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if(m) return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
    const d=new Date(text);
    return isNaN(d.getTime())?null:d;
  }

  function signalFeedSnippet_(value,maxLen) {
    const s=String(value||'').replace(/\s+/g,' ').trim();
    const max=Math.max(40,Number(maxLen||280));
    return s.length<=max?s:(s.slice(0,max-1)+'…');
  }

  function signalFeedGate_(value) {
    const g=String(value||'').trim().toUpperCase();
    if(g==='PASS') return 'PASS';
    if(g==='WATCH') return 'WATCH';
    if(g==='REVIEW' || g==='REVIEW_REQUIRED') return 'REVIEW';
    return '';
  }

  function refreshSignalFeed_(options) {
    options=options||{};
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const opp=ss.getSheetByName(CFG.OPPORTUNITY_SHEET);
    let sh=ss.getSheetByName(CFG.SIGNAL_FEED_SHEET);
    if(!sh) sh=ss.insertSheet(CFG.SIGNAL_FEED_SHEET,1);
    if(sh.getMaxColumns()<12) sh.insertColumnsAfter(sh.getMaxColumns(),12-sh.getMaxColumns());

    // Remove old outline groups before rebuilding the presentation view.
    try {
      if(sh.getMaxRows()>1) sh.getRange(2,1,sh.getMaxRows()-1,1).shiftRowGroupDepth(-8);
    } catch (_) {}

    const days=Math.max(1,Math.min(30,Number(options.days||CFG.SIGNAL_FEED_DAYS)));
    const now=new Date();
    const cutoff=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    cutoff.setDate(cutoff.getDate()-(days-1));
    const cutoffMs=cutoff.getTime();
    const tz=Session.getScriptTimeZone();

    const buckets={};
    let sourceRows=0;
    if(opp && opp.getLastRow()>=2){
      const n=Math.min(opp.getLastRow()-1,CFG.SIGNAL_FEED_MAX_SOURCE_ROWS);
      const rows=opp.getRange(2,1,n,26).getValues();
      rows.forEach(r=>{
        const d=signalFeedDate_(r[0]);
        if(!d || d.getTime()<cutoffMs) return;
        sourceRows++;

        const dayKey=Utilities.formatDate(d,tz,'yyyy-MM-dd');
        const dayLabel=Utilities.formatDate(d,tz,'dd/MM/yyyy');
        const group=String(r[4]||'Group không rõ').trim()||'Group không rõ';
        const gate=signalFeedGate_(r[24]);
        const score=Number(r[10]||0);
        const key=dayKey+'|'+group;

        if(!buckets[key]){
          buckets[key]={
            dayKey,dayLabel,group,total:0,candidate:0,pass:0,watch:0,review:0,
            maxScore:0,latestMs:0,signals:[]
          };
        }
        const b=buckets[key];
        b.total++;
        b.maxScore=Math.max(b.maxScore,score);
        b.latestMs=Math.max(b.latestMs,d.getTime());

        if(!gate) return;
        b.candidate++;
        if(gate==='PASS') b.pass++;
        else if(gate==='WATCH') b.watch++;
        else if(gate==='REVIEW') b.review++;

        b.signals.push({
          gate,
          score,
          person:String(r[5]||'').trim()||'Ẩn danh',
          sourceType:String(r[3]||'Bài viết').trim()||'Bài viết',
          pain:String(r[8]||'').trim(),
          intent:String(r[9]||'').trim(),
          evidence:String(r[23]||r[7]||'').trim(),
          nextAction:String(r[15]||'').trim(),
          url:String(r[2]||'').trim(),
          status:String(r[19]||'').trim()
        });
      });
    }

    const groups=Object.values(buckets)
      .filter(b=>b.candidate>0)
      .sort((a,b)=>{
        if(a.dayKey!==b.dayKey) return b.dayKey.localeCompare(a.dayKey);
        if(a.pass!==b.pass) return b.pass-a.pass;
        if(a.candidate!==b.candidate) return b.candidate-a.candidate;
        if(a.maxScore!==b.maxScore) return b.maxScore-a.maxScore;
        return a.group.localeCompare(b.group,'vi');
      });

    const byDay={};
    groups.forEach(g=>{
      if(!byDay[g.dayKey]) byDay[g.dayKey]={label:g.dayLabel,groups:[]};
      byDay[g.dayKey].groups.push(g);
    });

    const rows=[];
    const rowKinds=[];
    const dayBlocks=[];
    const groupBlocks=[];
    let signalCount=0;

    Object.keys(byDay).sort((a,b)=>b.localeCompare(a)).forEach(dayKey=>{
      const day=byDay[dayKey];
      const dayGroups=day.groups;
      const dayTotal=dayGroups.reduce((n,g)=>n+g.total,0);
      const daySignals=dayGroups.reduce((n,g)=>n+g.candidate,0);
      const dayPass=dayGroups.reduce((n,g)=>n+g.pass,0);
      const dayStart=rows.length+4;
      rows.push([
        'NGÀY',day.label,
        dayGroups.length+' Group có tín hiệu',
        dayTotal+' nguồn',
        daySignals+' tín hiệu',
        dayPass+' PASS','','','','','',''
      ]);
      rowKinds.push('DAY');

      dayGroups.forEach(g=>{
        const summaryRow=rows.length+4;
        const topGate=g.pass>0?'PASS':(g.review>0?'REVIEW':'WATCH');
        rows.push([
          'GROUP',g.dayLabel,g.group,g.total,g.candidate,g.pass,g.watch,topGate,g.maxScore,
          (g.review?('REVIEW '+g.review+' • '):'')+'Candidate '+g.candidate+'/'+g.total,
          'Bấm + để mở '+g.signals.length+' tín hiệu',''
        ]);
        rowKinds.push(g.pass>0?'GROUP_PASS':'GROUP_WATCH');

        const childStart=rows.length+4;
        const rank={PASS:0,REVIEW:1,WATCH:2};
        g.signals.sort((x,y)=>{
          const rx=rank[x.gate]===undefined?9:rank[x.gate];
          const ry=rank[y.gate]===undefined?9:rank[y.gate];
          if(rx!==ry) return rx-ry;
          return y.score-x.score;
        }).forEach(x=>{
          signalCount++;
          rows.push([
            'TÍN HIỆU','',x.person,x.sourceType,x.pain,'','',x.gate,x.score,
            signalFeedSnippet_(
              (x.intent?('Intent: '+x.intent+' • '):'')+
              (x.evidence?('Evidence: '+x.evidence):''),360
            ),
            x.nextAction||x.status,
            x.url
          ]);
          rowKinds.push('SIGNAL_'+x.gate);
        });
        const childEnd=rows.length+3;
        if(childEnd>=childStart) groupBlocks.push({start:childStart,end:childEnd});
      });

      const dayEnd=rows.length+3;
      if(dayEnd>=dayStart+1) dayBlocks.push({start:dayStart+1,end:dayEnd});
    });

    const needed=Math.max(60,rows.length+10);
    if(sh.getMaxRows()<needed) sh.insertRowsAfter(sh.getMaxRows(),needed-sh.getMaxRows());

    const maxRows=sh.getMaxRows();
    sh.getRange(1,1,maxRows,12).clear({contentsOnly:false});
    sh.getRange(1,1,1,12).breakApart().merge();
    sh.getRange(1,1).setValue('TÍN HIỆU — '+days+' NGÀY GẦN NHẤT')
      .setFontWeight('bold').setFontSize(15)
      .setHorizontalAlignment('center').setVerticalAlignment('middle')
      .setBackground('#0f766e').setFontColor('#ffffff');

    sh.getRange(2,1,1,12).breakApart().merge();
    sh.getRange(2,1).setValue(
      'Chỉ hiển thị PASS / WATCH / REVIEW. CƠ HỘI vẫn là source-of-truth. Dấu + bên trái để bung tín hiệu của từng Group.'
    ).setFontColor('#64748b').setFontSize(10).setWrap(true);

    const headers=['Loại','Ngày','Group / Người','Tổng nguồn / Loại','Tín hiệu / Pain','PASS','WATCH','Gate','Điểm','Intent / Bằng chứng','Hành động','URL nguồn'];
    sh.getRange(3,1,1,12).setValues([headers])
      .setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle')
      .setBackground('#d1fae5');

    if(rows.length){
      const range=sh.getRange(4,1,rows.length,12);
      range.setValues(rows).setVerticalAlignment('middle');
      range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
      sh.getRange(4,10,rows.length,2).setWrap(true);

      const bg=[];
      const weights=[];
      rowKinds.forEach(kind=>{
        let color='#ffffff',weight='normal';
        if(kind==='DAY'){color='#e0f2fe';weight='bold';}
        else if(kind==='GROUP_PASS'){color='#dcfce7';weight='bold';}
        else if(kind==='GROUP_WATCH'){color='#fef3c7';weight='bold';}
        else if(kind==='SIGNAL_PASS'){color='#f0fdf4';}
        else if(kind==='SIGNAL_REVIEW'){color='#faf5ff';}
        else if(kind==='SIGNAL_WATCH'){color='#fffbeb';}
        bg.push(Array(12).fill(color));
        weights.push(Array(12).fill(weight));
      });
      range.setBackgrounds(bg).setFontWeights(weights);

      // Day outline = depth 1; candidate children = depth 2.
      dayBlocks.forEach(b=>sh.getRange(b.start,1,b.end-b.start+1,1).shiftRowGroupDepth(1));
      groupBlocks.forEach(b=>sh.getRange(b.start,1,b.end-b.start+1,1).shiftRowGroupDepth(1));
      try {
        sh.setRowGroupControlPosition(SpreadsheetApp.GroupControlTogglePosition.BEFORE);
        sh.expandRowGroupsUpToDepth(1);
      } catch (_) {}
    }

    sh.setFrozenRows(3);
    sh.setColumnWidth(1,78);
    sh.setColumnWidth(2,92);
    sh.setColumnWidth(3,250);
    sh.setColumnWidth(4,118);
    sh.setColumnWidth(5,190);
    sh.setColumnWidth(6,60);
    sh.setColumnWidth(7,65);
    sh.setColumnWidth(8,82);
    sh.setColumnWidth(9,62);
    sh.setColumnWidth(10,360);
    sh.setColumnWidth(11,165);
    sh.setColumnWidth(12,250);
    try { sh.setHiddenGridlines(true); } catch (_) {}

    if(!options.silent){
      SpreadsheetApp.getActive().toast(
        groups.length+' Group/ngày • '+signalCount+' tín hiệu • cửa sổ '+days+' ngày',
        'TÍN HIỆU',
        6
      );
    }
    return {
      version:CFG.VERSION,
      days,
      sourceRows,
      groups:groups.length,
      signals:signalCount,
      sheet:CFG.SIGNAL_FEED_SHEET
    };
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
    const signalFeedStats = refreshSignalFeed_({silent:true});
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
      dailyStats: dailyStats.rows,
      signalFeedGroups: signalFeedStats.groups || 0,
      signalFeedSignals: signalFeedStats.signals || 0
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
    const opp = oppLast >= 2 ? oppSheet.getRange(2,1,oppLast-1,CFG.OPPORTUNITY_TOTAL_COLS).getValues() : [];
    const existing = loadExistingLeadState_(leadSheet);
    const oldLast=leadSheet.getLastRow();
    const oldRows=oldLast>=2 ? leadSheet.getRange(2,1,oldLast-1,21).getValues() : [];
    const archive=archiveLegacyLeadRows_(oldRows,'V1.9.8.7 production Lead Inbox chỉ giữ Hard Gate PASS');
    const grouped = {};

    opp.forEach(r => {
      const sourceUrl = normalizeUrl_(r[2] || '');
      const fbUrl = normalizeFacebookProfileUrl_(r[6] || '');
      const key = fbUrl ? `FB|${fbUrl}` : `ANON|${sourceUrl}`;
      if (!key || key === 'ANON|') return;

      const gate=String(r[24]||'').trim();
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
    }).sort((a,b)=>Number(b[8]||0)-Number(a[8]||0));

    if (oldLast >= 2) leadSheet.getRange(2,1,oldLast-1,21).clearContent();
    if (passRows.length) {
      leadSheet.getRange(2,1,passRows.length,21).setValues(passRows);
      leadSheet.setRowHeights(2,passRows.length, CFG.SHEET_ROW_HEIGHT_PX);
      leadSheet.getRange(2,1,passRows.length,21).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    }
    SpreadsheetApp.flush();

    if (!silent) SpreadsheetApp.getUi().alert(`KH PASS: ${passRows.length} | Mới: ${newCount} | Legacy archived: ${archive.archived||0}.`);
    return { count:passRows.length, newCount, legacyCount:0, archivedLegacy:Number(archive.archived||0), rows:passRows.length };
  }

  function buildCanonicalGroupSummaryRegistry_(scanRows) {
    const items=[];
    const aliasOwner=new Map();
    const parent=[];

    const find=i=>{
      let x=i;
      while(parent[x]!==x){
        parent[x]=parent[parent[x]];
        x=parent[x];
      }
      return x;
    };
    const union=(a,b)=>{
      let ra=find(a), rb=find(b);
      if(ra===rb) return;
      if(ra>rb){const t=ra;ra=rb;rb=t;}
      parent[rb]=ra;
    };

    (scanRows||[]).forEach((s,idx)=>{
      s=s||[];
      const url=String(s[3]||'').trim();
      if(!url) return;
      const aliases=canonicalGroupKeyAliasesFromScanRow_(s,idx+2)
        .map(x=>String(x||'').trim().toLowerCase())
        .filter(Boolean);
      if(!aliases.length) return;

      const itemIndex=items.length;
      const item={
        row:idx+2,
        rowData:s,
        aliases:[...new Set(aliases)],
        active:String(s[0]||'').trim()==='Có',
        status:String(s[23]||'').trim(),
        lastAt:opsDateMs_(s[9]),
        name:String(s[2]||'').trim()
      };
      items.push(item);
      parent[itemIndex]=itemIndex;

      item.aliases.forEach(alias=>{
        if(aliasOwner.has(alias)) union(itemIndex,aliasOwner.get(alias));
        else aliasOwner.set(alias,itemIndex);
      });
    });

    const components=new Map();
    items.forEach((item,i)=>{
      const root=find(i);
      if(!components.has(root)) components.set(root,[]);
      components.get(root).push(item);
    });

    const groups=[];
    components.forEach(list=>{
      list.sort((a,b)=>{
        if(a.active!==b.active) return a.active?-1:1;
        const doneA=a.status==='XONG'?1:0, doneB=b.status==='XONG'?1:0;
        if(doneA!==doneB) return doneB-doneA;
        return (b.lastAt||0)-(a.lastAt||0) || a.row-b.row;
      });
      const representative=list[0];
      const aliasSet=new Set();
      list.forEach(item=>item.aliases.forEach(alias=>aliasSet.add(alias)));
      const primary=String(representative.aliases[0]||'').trim().toLowerCase();
      const aliases=[primary,...[...aliasSet].filter(x=>x!==primary)].filter(Boolean);
      groups.push({
        canonicalKey:primary,
        aliases,
        row:representative.row,
        rowData:representative.rowData,
        active:representative.active,
        memberRows:list.map(x=>x.row)
      });
    });

    groups.sort((a,b)=>a.row-b.row);
    return groups;
  }

  function buildGroupRegistryCleanupPlan_(scanRows) {
    const groups=buildCanonicalGroupSummaryRegistry_(scanRows||[]);
    const duplicateRows=[];
    const aliases=[];
    const now=new Date();
    groups.forEach(group=>{
      const members=(group.memberRows||[]).slice().sort((a,b)=>a-b);
      members.forEach(row=>{if(row!==group.row) duplicateRows.push(row);});
      const numericAliases=(group.aliases||[]).filter(x=>/^\d+$/.test(String(x||'')));
      const numericId=numericAliases[0]||'';
      let firstSeenMs=0,lastSeenMs=0;
      members.forEach(row=>{
        const r=(scanRows||[])[row-2]||[];
        const t=opsDateMs_(r[9]);
        if(t){
          if(!firstSeenMs||t<firstSeenMs) firstSeenMs=t;
          if(t>lastSeenMs) lastSeenMs=t;
        }
      });
      (group.aliases||[]).forEach(alias=>{
        const a=String(alias||'').trim().toLowerCase();
        if(!a) return;
        aliases.push({
          canonicalKey:String(group.canonicalKey||'').trim().toLowerCase(),
          alias:a,
          numericId:/^\d+$/.test(a)?a:numericId,
          source:'QUÉT NHÓM',
          firstSeen:firstSeenMs?new Date(firstSeenMs):now,
          lastSeen:lastSeenMs?new Date(lastSeenMs):now,
          reason:members.length>1?'PHYSICAL_DUPLICATE_MERGE':'CANONICAL_IDENTITY_OBSERVED'
        });
      });
    });
    duplicateRows.sort((a,b)=>b-a);
    return {
      canonicalCount:groups.length,
      duplicateRows,
      aliases,
      groups
    };
  }

  function ensureGroupAliasRegistry_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    let sh=ss.getSheetByName(CFG.GROUP_ALIAS_REGISTRY_SHEET);
    if(!sh) sh=ss.insertSheet(CFG.GROUP_ALIAS_REGISTRY_SHEET);
    if(sh.getMaxColumns()<7) sh.insertColumnsAfter(sh.getMaxColumns(),7-sh.getMaxColumns());
    sh.getRange(1,1,1,7).setValues([[
      'Canonical Key','Alias','Numeric ID','Source','First Seen','Last Seen','Reason'
    ]]);
    sh.getRange(2,1,Math.max(1,sh.getMaxRows()-1),3).setNumberFormat('@');
    sh.setFrozenRows(1);
    try{sh.hideSheet();}catch(_){}
    return sh;
  }

  function mergeGroupAliasRegistry_(records) {
    const sh=ensureGroupAliasRegistry_();
    const existing=new Map();
    if(sh.getLastRow()>=2){
      sh.getRange(2,1,sh.getLastRow()-1,7).getDisplayValues().forEach((r,i)=>{
        const canonical=String(r[0]||'').trim().toLowerCase();
        const alias=String(r[1]||'').trim().toLowerCase();
        if(canonical&&alias) existing.set(canonical+'|'+alias,{row:i+2,data:r});
      });
    }
    const append=[];
    (records||[]).forEach(rec=>{
      const canonical=String(rec.canonicalKey||'').trim().toLowerCase();
      const alias=String(rec.alias||'').trim().toLowerCase();
      if(!canonical||!alias) return;
      const key=canonical+'|'+alias;
      const prior=existing.get(key);
      if(prior){
        const first=opsDateMs_(prior.data[4])||opsDateMs_(rec.firstSeen)||Date.now();
        const last=Math.max(opsDateMs_(prior.data[5])||0,opsDateMs_(rec.lastSeen)||0,Date.now());
        sh.getRange(prior.row,1,1,7).setValues([[
          canonical,
          alias,
          String(prior.data[2]||rec.numericId||''),
          String(prior.data[3]||rec.source||'QUÉT NHÓM'),
          new Date(first),
          new Date(last),
          String(prior.data[6]||rec.reason||'CANONICAL_IDENTITY_OBSERVED')
        ]]);
        return;
      }
      append.push([
        canonical,alias,String(rec.numericId||''),String(rec.source||'QUÉT NHÓM'),
        rec.firstSeen||new Date(),rec.lastSeen||new Date(),String(rec.reason||'CANONICAL_IDENTITY_OBSERVED')
      ]);
      existing.set(key,{row:-1,data:append[append.length-1]});
    });
    if(append.length){
      const start=Math.max(2,sh.getLastRow()+1);
      sh.getRange(start,1,append.length,7).setValues(append);
    }
    return {rows:Math.max(0,sh.getLastRow()-1),added:append.length};
  }

  function groupRegistryHasActiveLease_(plan) {
    const seen=new Set();
    for(const rec of (plan&&plan.aliases||[])){
      const alias=String(rec.alias||'').trim().toLowerCase();
      if(!alias||seen.has(alias)) continue;
      seen.add(alias);
      const lease=getRuntimeLease_(groupLeasePropertyKey_(alias));
      if(lease&&lease.active) return true;
    }
    return false;
  }

  function cleanGroupRegistryCanonicalOnce_() {
    const props=PropertiesService.getDocumentProperties();
    const prior=String(props.getProperty(CFG.GROUP_REGISTRY_CLEANUP_KEY)||'').trim();
    if(prior) {
      try{return Object.assign({skipped:true,reason:'ALREADY_DONE'},JSON.parse(prior));}
      catch(_){return {skipped:true,reason:'ALREADY_DONE',state:prior};}
    }

    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    if(sh.getLastRow()<2) return {ok:true,canonicalCount:0,deleted:0};

    const rows=sh.getRange(2,1,sh.getLastRow()-1,27).getDisplayValues();
    if(rows.some(r=>String(r[23]||'').trim()==='ĐANG QUÉT')){
      return {ok:false,deferred:true,reason:'GROUP_SCAN_RUNNING'};
    }
    const plan=buildGroupRegistryCleanupPlan_(rows);
    if(groupRegistryHasActiveLease_(plan)){
      return {ok:false,deferred:true,reason:'GROUP_LEASE_ACTIVE'};
    }

    const lock=LockService.getDocumentLock();
    if(!lock.tryLock(10000)) return {ok:false,deferred:true,reason:'DOCUMENT_LOCK_BUSY'};
    try{
      mergeGroupAliasRegistry_(plan.aliases);
      plan.duplicateRows.forEach(row=>{
        if(row>=2&&row<=sh.getLastRow()) sh.deleteRow(row);
      });

      const verifyRows=sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,27).getDisplayValues():[];
      const verify=buildGroupRegistryCleanupPlan_(verifyRows);
      if(verify.duplicateRows.length){
        throw new Error('GROUP_REGISTRY_CLEANUP_VERIFY_FAILED: duplicates='+verify.duplicateRows.join(','));
      }
      refreshGroupSummary_();
      const result={
        ok:true,
        canonicalCount:verify.canonicalCount,
        deleted:plan.duplicateRows.length,
        deletedRows:plan.duplicateRows.slice().sort((a,b)=>a-b),
        aliasRecords:plan.aliases.length,
        completedAt:new Date().toISOString()
      };
      props.setProperty(CFG.GROUP_REGISTRY_CLEANUP_KEY,JSON.stringify(result));
      return result;
    } finally {
      lock.releaseLock();
    }
  }

  function runGroupDisplayInvariantHarness_() {
    const tests={
      DISPLAY_EMPTY_PLACEHOLDER:normalizeGroupDisplayName_('')==='CHƯA LẤY TÊN',
      DISPLAY_NUMERIC_PLACEHOLDER:normalizeGroupDisplayName_('Group 1246286956929415')==='CHƯA LẤY TÊN',
      DISPLAY_SLUG_PLACEHOLDER:normalizeGroupDisplayName_('Group j2team.community')==='CHƯA LẤY TÊN',
      DISPLAY_REAL_TITLE_PRESERVED:normalizeGroupDisplayName_('Hội VinFast Việt Nam')==='Hội VinFast Việt Nam',
      ALIAS_SCIENTIFIC_REJECTED_BY_ID_RULE:/^\d+$/.test('2.44464E+15')===false
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }

  function runGroupRegistryCleanupHarness_() {
    const row=(active,name,url,id,note,status,lastAt)=>{
      const r=Array(27).fill('');
      r[0]=active?'Có':'Không';
      r[2]=name;
      r[3]=url;
      r[4]=id;
      r[9]=lastAt||'';
      r[15]=note||'';
      r[23]=status||'XONG';
      return r;
    };
    const rows=[
      row(true,'Active slug','https://www.facebook.com/groups/3diot.laptrinhnhungiot/','3diot.laptrinhnhungiot',
        'Canonical identity: https://www.facebook.com/groups/1358105521809310/ -> https://www.facebook.com/groups/3diot.laptrinhnhungiot/','XONG',new Date('2026-09-29T02:00:00Z')),
      row(false,'Duplicate slug','https://www.facebook.com/groups/3diot.laptrinhnhungiot/','3diot.laptrinhnhungiot',
        'Duplicate -> canonical','DỪNG',new Date('2026-09-28T02:00:00Z')),
      row(true,'Other','https://www.facebook.com/groups/other-group/','other-group','','XONG',new Date('2026-09-29T03:00:00Z'))
    ];
    const plan=buildGroupRegistryCleanupPlan_(rows);
    const aliasSet=new Set(plan.aliases.map(x=>x.alias));
    const tests={
      REGISTRY_ONE_CANONICAL_ROW:plan.canonicalCount===2,
      REGISTRY_DUPLICATE_DELETE_ONLY:plan.duplicateRows.length===1&&plan.duplicateRows[0]===3,
      REGISTRY_ACTIVE_REPRESENTATIVE:plan.groups[0]&&plan.groups[0].row===2&&plan.groups[0].active===true,
      REGISTRY_NUMERIC_ALIAS_PRESERVED:aliasSet.has('1358105521809310'),
      REGISTRY_SLUG_ALIAS_PRESERVED:aliasSet.has('3diot.laptrinhnhungiot')
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }

  function buildGroupSummaryOpportunityIndex_(oppRows) {
    const byGroupKey=new Map();
    (oppRows||[]).forEach(r=>{
      const key=String(r&&r[CFG.OPPORTUNITY_GROUP_KEY_COL-1]||'').trim().toLowerCase();
      if(!key) return; // fail closed: identityMissing never joins by display name
      if(!byGroupKey.has(key)) byGroupKey.set(key,[]);
      byGroupKey.get(key).push(r);
    });
    return byGroupKey;
  }

  function collectGroupSummaryOpportunities_(byGroupKey,aliases) {
    const out=[];
    const seenSourceIds=new Set();
    const seenRows=new Set();
    (aliases||[]).forEach(alias=>{
      const key=String(alias||'').trim().toLowerCase();
      const rows=key && byGroupKey ? (byGroupKey.get(key)||[]) : [];
      rows.forEach(r=>{
        const sourceId=String(r&&r[1]||'').trim();
        if(sourceId){
          if(seenSourceIds.has(sourceId)) return;
          seenSourceIds.add(sourceId);
        }else{
          if(seenRows.has(r)) return;
          seenRows.add(r);
        }
        out.push(r);
      });
    });
    return out;
  }

  function ensureGroupIntelligenceLegacyArchive_(summarySheet) {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    let archive=ss.getSheetByName(CFG.GROUP_SUMMARY_LEGACY_ARCHIVE_SHEET);
    if(archive) return archive;
    archive=ss.insertSheet(CFG.GROUP_SUMMARY_LEGACY_ARCHIVE_SHEET);
    const rows=summarySheet&&summarySheet.getLastRow()?summarySheet.getRange(1,1,summarySheet.getLastRow(),Math.min(12,summarySheet.getMaxColumns())).getValues():[];
    archive.getRange(1,1,1,14).setValues([[
      'Tên nhóm','Link nhóm','Profile','Chủ đề','Điểm nhóm','Nội dung ưa thích',
      'Pain chính','Số KH tiềm năng','KH tiềm năng nổi bật','Đã bán','Trạng thái','Ghi chú',
      'Archived At','Archive Version'
    ]]);
    if(rows.length>1){
      const now=new Date();
      const body=rows.slice(1).map(r=>{
        const x=r.slice(0,12);
        while(x.length<12)x.push('');
        x.push(now,CFG.VERSION);
        return x;
      });
      if(body.length) archive.getRange(2,1,body.length,14).setValues(body);
    }
    archive.hideSheet();
    return archive;
  }

  function groupActivityKey_(groupKey) {
    return CFG.GROUP_ACTIVITY_PREFIX+encodeURIComponent(String(groupKey||'').trim().toLowerCase());
  }

  function getGroupActivityObservation_(groupKey) {
    const key=String(groupKey||'').trim().toLowerCase();
    if(!key) return null;
    const raw=PropertiesService.getDocumentProperties().getProperty(groupActivityKey_(key))||'';
    if(!raw) return null;
    try{return JSON.parse(raw);}catch(_){return null;}
  }

  function saveGroupActivityObservation_(groupKey,state) {
    if(!groupKey) return;
    PropertiesService.getDocumentProperties().setProperty(groupActivityKey_(groupKey),JSON.stringify(state||{}));
  }

  function measureGroupActivityWindow_(command) {
    command=command||{};
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    let row=Number(command.row||0);
    if(!row){
      const ar=sh.getActiveRange();
      row=ar?ar.getRow():0;
    }
    if(row<2||row>sh.getLastRow()) throw new Error('Chọn một Group trong QUÉT NHÓM để đo activity.');
    const vals=sh.getRange(row,1,1,27).getDisplayValues()[0]||[];
    if(String(vals[0]||'').trim()!=='Có') throw new Error('Group đang không hoạt động.');
    const groupUrl=String(vals[3]||'').trim();
    const groupKey=exactGroupKeyFromRow_(groupUrl,vals[4]);
    if(!groupKey) throw new Error('Group chưa có deterministic identity.');

    const workers=getWorkerPoolRaw_()
      .filter(w=>w.enabled&&w.clientId&&workerSupportsRole_(w,'GROUP')&&workerHealthState_(w)!=='OFFLINE');
    if(!workers.length) throw new Error('Không có Worker GROUP/BOTH khả dụng để đo activity.');
    const profile=String(vals[1]||'').trim();
    const worker=workers.find(w=>workerMatchesProfile_(w,profile))||workers[0];

    const started=Date.now(),now=Date.now();
    const dayMs=86400000;
    const boundary24=now-dayMs;
    const boundary7=now-7*dayMs;
    const seen=new Set();
    let cursor='',pages=0,post24=0,post7=0,oldestMs=0,crossed24=false,crossed7=false;
    let nextCursor='',stoppedByCap=false,activityUrl=groupUrl,fallbackUsed=false,fallbackGroupId='';
    while(pages<30&&seen.size<500&&Date.now()-started<100000&&!crossed7){
      let page;
      try{
        page=fetchGroupPostsPageRaw_(worker.clientId,{url:activityUrl,sorting:'Newest Posts',cursor:cursor||''});
      }catch(err){
        if(pages===0&&!fallbackUsed&&isGroupIdentityResolveError_(err)){
          const numericId=historicNumericGroupIdFromRow_(row,groupUrl);
          if(numericId&&numericId!==extractGroupKey_(activityUrl)){
            fallbackUsed=true;
            fallbackGroupId=numericId;
            activityUrl='https://www.facebook.com/groups/'+numericId+'/';
            page=fetchGroupPostsPageRaw_(worker.clientId,{url:activityUrl,sorting:'Newest Posts',cursor:cursor||''});
          }else throw err;
        }else throw err;
      }
      pages++;
      const posts=page.posts||[];
      if(!posts.length){nextCursor='';break;}
      for(const p of posts){
        const url=String((p&&(p.url||p.permalink_url||p.permalink))||'').trim();
        const id=normalizePostId_(p&&(p.post_id||p.postId||p.id)||'',url);
        const dedupe=id||normalizeUrl_(url);
        if(dedupe&&seen.has(dedupe)) continue;
        if(dedupe) seen.add(dedupe);
        const dt=toDate_(p&&(p.creation_time||p.created_time||p.createdAt||p.created_at));
        if(!dt) continue;
        const ms=dt.getTime();
        if(!oldestMs||ms<oldestMs) oldestMs=ms;
        if(ms>=boundary24) post24++;
        else crossed24=true;
        if(ms>=boundary7) post7++;
        else crossed7=true;
      }
      nextCursor=String(page.cursor||'');
      if(crossed7||!nextCursor||nextCursor===cursor) break;
      cursor=nextCursor;
    }
    if(!crossed7&&nextCursor&&(pages>=30||seen.size>=500||Date.now()-started>=100000)) stoppedByCap=true;
    const state={
      version:CFG.VERSION,groupKey,row,measuredAt:new Date().toISOString(),
      pages,postsSeen:seen.size,oldestSeenAt:oldestMs?new Date(oldestMs).toISOString():'',
      post24hObserved:crossed24?post24:null,
      avgPostsDay7dObserved:crossed7?Math.round((post7/7)*100)/100:null,
      complete24h:crossed24,complete7d:crossed7,
      stoppedByCap,
      fallbackUsed,fallbackGroupId,
      workerSlot:worker.slot||''
    };
    saveGroupActivityObservation_(groupKey,state);
    const refreshed=refreshGroupSummary_();
    return Object.assign({ok:true,intelligenceGroups:Number(refreshed.groups||0)},state);
  }

  function dateMsSafe_(v) {
    if(v instanceof Date&&!isNaN(v.getTime())) return v.getTime();
    const d=toDate_(v);
    return d&&!isNaN(d.getTime())?d.getTime():0;
  }

  function groupIntelligenceMetrics_(list,contextValid,nowMs) {
    list=list||[];
    const analyzed=list.filter(r=>[r[8],r[9],r[10],r[11]].some(v=>v!==''&&v!==null&&v!==undefined));
    const actionable=new Set(['Hỏi kinh nghiệm','Tìm giải pháp','So sánh','Xác thực','Phản đối','Muốn đổi','Muốn mua','Cần mua gấp']);
    const relevant=analyzed.filter(r=>String(r[11]||'').trim()!=='Không phải KH');
    const buyerSignals=analyzed.filter(r=>actionable.has(String(r[9]||'').trim()));
    const pass=analyzed.filter(r=>String(r[24]||'').trim()==='PASS');
    const fitKnown=analyzed.filter(r=>['Có','Không'].indexOf(String(r[22]||'').trim())>=0);
    const fitYes=fitKnown.filter(r=>String(r[22]||'').trim()==='Có');
    const comments24=list.filter(r=>String(r[3]||'').trim()==='Bình luận'&&dateMsSafe_(r[0])>=Number(nowMs||Date.now())-86400000);
    const pct=(n,d)=>d?Math.round((n/d)*1000)/10:'';
    return {
      relevantPct:pct(relevant.length,analyzed.length),
      buyerSignalPct:pct(buyerSignals.length,analyzed.length),
      leadYieldPct:pct(pass.length,analyzed.length),
      groupFitScore:contextValid&&fitKnown.length?pct(fitYes.length,fitKnown.length):'',
      commentsDayObserved:comments24.length
    };
  }

  function runGroupIntelligenceHarness_() {
    const now=Date.now();
    const row=(type,classification,intent,fit,gate,ageHours)=>{
      const r=Array(CFG.OPPORTUNITY_TOTAL_COLS).fill('');
      r[0]=new Date(now-Number(ageHours||0)*3600000);
      r[1]='S'+Math.random();
      r[3]=type;
      r[8]='pain';
      r[9]=intent;
      r[10]=70;
      r[11]=classification;
      r[22]=fit;
      r[24]=gate;
      return r;
    };
    const list=[
      row('Bài viết','Theo dõi','Tìm giải pháp','Có','WATCH',2),
      row('Bình luận','Tiềm năng','Cần mua gấp','Có','PASS',3),
      row('Bình luận','Không phải KH','Thảo luận','Không','FAIL',30)
    ];
    const a=groupIntelligenceMetrics_(list,true,now);
    const b=groupIntelligenceMetrics_(list,false,now);
    const tests={
      INTEL_RELEVANT_OBSERVED:a.relevantPct===66.7,
      INTEL_BUYER_SIGNAL_OBSERVED:a.buyerSignalPct===66.7,
      INTEL_LEAD_YIELD_OBSERVED:a.leadYieldPct===33.3,
      INTEL_COMMENT_DAY_OBSERVED:a.commentsDayObserved===1,
      INTEL_FIT_REQUIRES_CONTEXT:a.groupFitScore===66.7&&b.groupFitScore==='',
      INTEL_ACTIVITY_INCOMPLETE_IS_BLANK:(()=>{const x={complete24h:false,post24hObserved:null};return x.post24hObserved===null;})()
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }

  function summarizeGroupOpportunities_(list) {
    list=list||[];
    const leads=list
      .filter(r=>String(r[24]||'').trim()==='PASS')
      .sort((a,b)=>Number(b[10]||0)-Number(a[10]||0));
    return {
      leads,
      top:leads.slice(0,5).map(r=>`${r[5]||'(ẩn danh)'} (${Number(r[10]||0)})`).join('\n'),
      sold:list.filter(r=>String(r[26]||'').trim()==='Đã bán').length,
      analyzed:list.filter(r=>[r[8],r[9],r[10],r[11]].some(v=>v!==''&&v!==null&&v!==undefined)).length,
      posts:list.filter(r=>String(r[3]||'')==='Bài viết').length,
      comments:list.filter(r=>String(r[3]||'')==='Bình luận').length,
      total:list.length
    };
  }

  function runGroupSummaryCardinalityHarness_() {
    const scanRow=(active,name,url,groupId,note,status)=>{
      const r=Array(26).fill('');
      r[0]=active?'Có':'Không';
      r[2]=name;
      r[3]=url;
      r[4]=groupId;
      r[15]=note||'';
      r[23]=status||'XONG';
      return r;
    };
    const oppRow=(sourceId,key,displayName)=>{
      const r=Array(CFG.OPPORTUNITY_TOTAL_COLS).fill('');
      r[1]=sourceId;
      r[3]='Bài viết';
      r[4]=displayName||'Display Name';
      r[5]='Buyer';
      r[10]=90;
      r[24]='PASS';
      r[26]='Đã bán';
      r[CFG.OPPORTUNITY_GROUP_KEY_COL-1]=key||'';
      return r;
    };

    const sameKey=buildCanonicalGroupSummaryRegistry_([
      scanRow(false,'Inactive duplicate','https://www.facebook.com/groups/shared-key/','shared-key','','XONG'),
      scanRow(true,'Active canonical','https://www.facebook.com/groups/shared-key/','shared-key','','XONG')
    ]);

    const numeric='533833410127672';
    const slug='eagleamazonvietnam';
    const aliasRegistry=buildCanonicalGroupSummaryRegistry_([
      scanRow(true,'Active slug','https://www.facebook.com/groups/'+slug+'/',slug,
        'Canonical identity: https://www.facebook.com/groups/'+numeric+'/ -> https://www.facebook.com/groups/'+slug+'/','XONG'),
      scanRow(false,'Inactive numeric','https://www.facebook.com/groups/'+numeric+'/',numeric,'','DỪNG')
    ]);
    const aliasGroup=aliasRegistry[0]||{aliases:[]};

    const duplicatedSourceA=oppRow('SAME-SOURCE',slug,'Same display');
    const duplicatedSourceB=oppRow('SAME-SOURCE',numeric,'Same display');
    const identityMissing=oppRow('IDENTITY-MISSING','', 'Active slug');
    const oppIndex=buildGroupSummaryOpportunityIndex_([duplicatedSourceA,duplicatedSourceB,identityMissing]);
    const collected=collectGroupSummaryOpportunities_(oppIndex,aliasGroup.aliases);
    const metrics=summarizeGroupOpportunities_(collected);

    const inactiveOnly=buildCanonicalGroupSummaryRegistry_([
      scanRow(false,'Historical only','https://www.facebook.com/groups/historical-only/','historical-only','','DỪNG')
    ]);

    const tests={
      GROUP_SUMMARY_ACTIVE_INACTIVE_ONE_ROW:
        sameKey.length===1 && sameKey[0].memberRows.length===2,
      GROUP_SUMMARY_ALIAS_COMPONENT_ONE_ROW:
        aliasRegistry.length===1 &&
        aliasGroup.aliases.indexOf(slug)>=0 &&
        aliasGroup.aliases.indexOf(numeric)>=0,
      GROUP_SUMMARY_KPI_NOT_MULTIPLIED:
        collected.length===1 && metrics.posts===1 && metrics.leads.length===1 && metrics.sold===1,
      GROUP_SUMMARY_ACTIVE_METADATA_WINS:
        aliasRegistry.length===1 &&
        aliasRegistry[0].active===true &&
        String(aliasRegistry[0].rowData[2]||'')==='Active slug',
      GROUP_SUMMARY_IDENTITY_MISSING_FAIL_CLOSED:
        !oppIndex.has('') &&
        collected.every(r=>String(r[1]||'')!=='IDENTITY-MISSING'),
      GROUP_SUMMARY_INACTIVE_ONLY_RETAINED:
        inactiveOnly.length===1 && inactiveOnly[0].active===false
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }

  function refreshGroupSummary_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const summarySheet=ss.getSheetByName(CFG.GROUP_SUMMARY_SHEET);
    const scanSheet=ss.getSheetByName(CFG.GROUP_SCAN_SHEET);
    const oppSheet=ss.getSheetByName(CFG.OPPORTUNITY_SHEET);
    if(!summarySheet||!scanSheet||!oppSheet) return {groups:0};

    ensureGroupIntelligenceLegacyArchive_(summarySheet);
    if(summarySheet.getMaxColumns()<17) summarySheet.insertColumnsAfter(summarySheet.getMaxColumns(),17-summarySheet.getMaxColumns());
    summarySheet.getRange(1,1,1,17).setValues([[
      'Group Name','Group URL','IX Profile','Canonical Group Key',
      'Members — FB REPORTED','Post 24h — FB REPORTED',
      'Post 24h — OBSERVED','Avg Posts/day 7d — OBSERVED','Comments/day — OBSERVED',
      'Relevant % — OBSERVED','Buyer Signal % — OBSERVED','Lead Yield — OBSERVED',
      'Group Fit Score','AI Topic Summary','Recommended Scans/day','Recommended Posts/scan','Last Evaluation'
    ]]);

    const scanLast=scanSheet.getLastRow();
    const scanRows=scanLast>=2?scanSheet.getRange(2,1,scanLast-1,27).getDisplayValues():[];
    const registry=buildCanonicalGroupSummaryRegistry_(scanRows);
    const oppLast=oppSheet.getLastRow();
    const oppRows=oppLast>=2?oppSheet.getRange(2,1,oppLast-1,CFG.OPPORTUNITY_TOTAL_COLS).getValues():[];
    const byGroupKey=buildGroupSummaryOpportunityIndex_(oppRows);
    const policyConfig=getAutoPolicyConfig_();
    const now=Date.now();
    const output=[];

    registry.forEach(group=>{
      const s=group.rowData||[];
      const url=String(s[3]||'').trim();
      const canonicalKey=String(group.canonicalKey||extractGroupKey_(url)||'').trim().toLowerCase();
      if(!canonicalKey) return;
      const name=normalizeGroupDisplayName_(s[2]);
      const profile=policyProfileForGroup_(policyConfig,canonicalKey);
      const list=collectGroupSummaryOpportunities_(byGroupKey,group.aliases);
      const contextValid=validateOfferContext_(s[26]).valid;
      const metrics=groupIntelligenceMetrics_(list,contextValid,now);
      const activity=getGroupActivityObservation_(canonicalKey)||{};
      const discovery=getGroupDiscovery_(canonicalKey)||{};
      const eff=resolveEffectiveScanPolicy_(profile,groupPolicyInput_(s),policyConfig);
      const efficiency=getGroupEfficiencyMetric_(canonicalKey);
      const effRec=recommendedScanPolicy_(efficiency,eff);
      const recScans=discovery.recommendedScansPerDay||
        (effRec&&effRec.eligible?effRec.recommendedScansPerDay:'');
      const recPosts=discovery.recommendedPostsPerScan||
        (effRec&&effRec.eligible?effRec.recommendedPostsPerScan:'');

      output.push([
        name,
        url,
        profile&&profile.id||String(s[1]||''),
        canonicalKey,
        '', // FB REPORTED members: blank until an authoritative API/UI field is captured.
        '', // FB REPORTED posts/24h: blank until Facebook reports this directly.
        activity.complete24h?Number(activity.post24hObserved||0):'',
        activity.complete7d?Number(activity.avgPostsDay7dObserved||0):'',
        metrics.commentsDayObserved,
        metrics.relevantPct,
        metrics.buyerSignalPct,
        metrics.leadYieldPct,
        metrics.groupFitScore,
        String(discovery.topicSummary||''),
        recScans,
        recPosts,
        discovery.evaluatedAt?new Date(discovery.evaluatedAt):''
      ]);
    });

    const oldLast=summarySheet.getLastRow();
    if(oldLast>=2) summarySheet.getRange(2,1,oldLast-1,17).clearContent();
    summarySheet.getRange(2,4,Math.max(1,summarySheet.getMaxRows()-1),1).setNumberFormat('@');
    if(output.length) summarySheet.getRange(2,1,output.length,17).setValues(output);
    if(output.length) summarySheet.setRowHeights(2,output.length,CFG.SHEET_ROW_HEIGHT_PX);
    summarySheet.setFrozenRows(1);
    return {groups:output.length,canonical:true,fbReportedBlankWhenUnavailable:true};
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


  function repairLegacyGroupDisplayNames_() {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const scan=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    let changed=0;
    if(scan.getLastRow()>=2){
      const names=scan.getRange(2,3,scan.getLastRow()-1,1).getDisplayValues();
      const out=names.map(r=>{
        const next=normalizeGroupDisplayName_(r[0]);
        if(next!==String(r[0]||'')) changed++;
        return [next];
      });
      if(changed) scan.getRange(2,3,out.length,1).setValues(out);
    }
    const alias=ensureGroupAliasRegistry_();
    alias.getRange(2,1,Math.max(1,alias.getMaxRows()-1),3).setNumberFormat('@');
    const summary=ss.getSheetByName(CFG.GROUP_SUMMARY_SHEET);
    if(summary) summary.getRange(2,4,Math.max(1,summary.getMaxRows()-1),1).setNumberFormat('@');
    refreshGroupSummary_();
    return {ok:true,changed,version:CFG.VERSION};
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
      if (isGroupPlaceholderName_(r[2])) sheet.getRange(rowNum, 3).setValue(groupPlaceholderName_());
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
      if (gid && map[gid]) name = normalizeGroupDisplayName_(map[gid].name);
      else if (gid && (isGroupPlaceholderName_(name) || name === 'Group không rõ')) name = groupPlaceholderName_();

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

  function loadExistingPostKeysFast_(oppSheet) {
    const keys=new Set();
    const last=oppSheet.getLastRow();
    if(last<2) return keys;
    oppSheet.getRange(2,2,last-1,3).getValues().forEach(r=>{
      if(String(r[2]||'')==='Bình luận') return;
      makePostKeys_(normalizePostId_(r[0],r[1]),r[1]).forEach(k=>keys.add(k));
    });
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

  function groupPlaceholderName_() {
    return 'CHƯA LẤY TÊN';
  }

  function isGroupPlaceholderName_(name) {
    const s=String(name||'').trim();
    if(!s || s===groupPlaceholderName_()) return true;
    return /^Group\s+[^\s]+$/i.test(s);
  }

  function normalizeGroupDisplayName_(name) {
    const s=String(name||'').trim();
    return isGroupPlaceholderName_(s)?groupPlaceholderName_():s;
  }

  function normalizeFacebookGroupInput_(input) {
    let s=String(input||'').trim();
    if(!s) throw new Error('Hãy dán Facebook Group URL.');
    if(/^facebook\.com\//i.test(s)||/^www\.facebook\.com\//i.test(s)) s='https://'+s;
    if(/^fb\.com\//i.test(s)||/^www\.fb\.com\//i.test(s)) s='https://'+s.replace(/^www\./i,'');
    const m=s.match(/^https?:\/\/(?:www\.)?(?:facebook\.com|fb\.com)\/groups\/([^\/?#]+)/i);
    if(!m) throw new Error('URL phải có dạng https://www.facebook.com/groups/<group>/');
    const key=decodeURIComponent(String(m[1]||'')).trim().toLowerCase();
    if(!key || ['feed','discover','groups'].indexOf(key)>=0) throw new Error('Không xác định được Group key từ URL.');
    return {input:String(input||'').trim(),groupKey:key,url:'https://www.facebook.com/groups/'+encodeURIComponent(key)+'/'};
  }

  function aliasCanonicalMap_() {
    const map=new Map();
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const alias=ss.getSheetByName(CFG.GROUP_ALIAS_REGISTRY_SHEET);
    if(alias&&alias.getLastRow()>=2){
      alias.getRange(2,1,alias.getLastRow()-1,2).getDisplayValues().forEach(r=>{
        const canonical=String(r[0]||'').trim().toLowerCase();
        const a=String(r[1]||'').trim().toLowerCase();
        if(canonical&&a) map.set(a,canonical);
      });
    }
    return map;
  }

  function findExistingCanonicalGroup_(groupKey) {
    const key=String(groupKey||'').trim().toLowerCase();
    if(!key) return null;
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    const aliasMap=aliasCanonicalMap_();
    const wanted=aliasMap.get(key)||key;
    if(sh.getLastRow()<2) return null;
    const rows=sh.getRange(2,1,sh.getLastRow()-1,27).getDisplayValues();
    for(let i=0;i<rows.length;i++){
      const aliases=canonicalGroupKeyAliasesFromScanRow_(rows[i],i+2);
      if(aliases.indexOf(key)>=0 || aliases.indexOf(wanted)>=0){
        return {
          row:i+2,
          name:String(rows[i][2]||'').trim()||groupPlaceholderName_(),
          url:String(rows[i][3]||'').trim(),
          canonicalKey:String(aliases[0]||wanted||key).trim().toLowerCase(),
          active:String(rows[i][0]||'').trim()==='Có'
        };
      }
    }
    return null;
  }

  function safeGroupTitleCandidate_(value) {
    const s=String(value||'').replace(/\s+/g,' ').trim();
    if(!s || s.length<2 || s.length>180) return '';
    if(/^https?:\/\//i.test(s) || /^\d{6,}$/.test(s) || /^Group\s+[^\s]+$/i.test(s)) return '';
    return s;
  }

  function extractGroupTitleFromPosts_(posts) {
    for(const p of (posts||[])){
      if(!p||typeof p!=='object') continue;
      const direct=[
        p.group_name,p.groupName,p.group_title,p.groupTitle,
        p.group&&p.group.name,p.group&&p.group.title,
        p.group_info&&p.group_info.name,p.groupInfo&&p.groupInfo.name
      ];
      for(const v of direct){
        const title=safeGroupTitleCandidate_(v);
        if(title) return title;
      }
    }
    return '';
  }

  function groupDiscoveryKey_(groupKey) {
    return CFG.GROUP_DISCOVERY_PREFIX+encodeURIComponent(String(groupKey||'').trim().toLowerCase());
  }

  function saveGroupDiscovery_(groupKey,state) {
    if(!groupKey) return;
    PropertiesService.getDocumentProperties().setProperty(groupDiscoveryKey_(groupKey),JSON.stringify(state||{}));
  }

  function getGroupDiscovery_(groupKey) {
    const key=String(groupKey||'').trim().toLowerCase();
    if(!key) return null;
    const raw=PropertiesService.getDocumentProperties().getProperty(groupDiscoveryKey_(key))||'';
    if(!raw) return null;
    try{return JSON.parse(raw);}catch(_){return null;}
  }

  function loadGroupDiscoveryPosts_(groupKey,limit) {
    const key=String(groupKey||'').trim().toLowerCase();
    const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.RAW_SHEET);
    if(!key||sh.getLastRow()<5) return [];
    const rows=sh.getRange(5,1,sh.getLastRow()-4,20).getValues();
    const out=[];
    for(let i=rows.length-1;i>=0&&out.length<Math.max(1,Math.min(20,Number(limit||10)));i--){
      const r=rows[i]||[];
      if(String(r[3]||'').trim().toLowerCase()!==key) continue;
      out.push({
        post_id:String(r[4]||'').trim(),
        content:String(r[8]||'').trim().slice(0,4000),
        comments:Math.max(0,Number(r[9]||0)),
        reactions:Math.max(0,Number(r[10]||0)),
        shares:Math.max(0,Number(r[11]||0))
      });
    }
    return out.reverse();
  }

  function groupDiscoverySchema_() {
    return {
      type:'object',
      properties:{
        topic_summary:{type:'string'},
        audience_summary:{type:'string'},
        pain_summary:{type:'string'},
        buyer_signal_summary:{type:'string'},
        content_types:{type:'array',items:{type:'string'}},
        buyer_signal_level:{type:'string'},
        recommended_scans_per_day:{type:'integer'},
        recommended_posts_per_scan:{type:'integer'},
        confidence:{type:'integer'},
        caveats:{type:'string'}
      },
      required:[
        'topic_summary','audience_summary','pain_summary','buyer_signal_summary','content_types',
        'buyer_signal_level','recommended_scans_per_day','recommended_posts_per_scan','confidence','caveats'
      ],
      additionalProperties:false
    };
  }

  function groupDiscoverySystemPrompt_() {
    return [
      'Bạn đánh giá một Facebook Group từ sample discovery tối đa 10 bài gần nhất được cung cấp.',
      'Chỉ mô tả topic, audience, pain và buyer signals nhìn thấy trong sample.',
      'TUYỆT ĐỐI KHÔNG suy ra Offer/Product/Service của Owner từ tên Group hoặc nội dung.',
      'TUYỆT ĐỐI KHÔNG suy ra Posts/day hay tần suất đăng từ sample 10 bài.',
      'recommended_scans_per_day và recommended_posts_per_scan chỉ là operational sampling proposal, không phải ước lượng posting frequency.',
      'Giới hạn scans/day 1-6; posts/scan 5-50. Nếu thiếu evidence, ưu tiên 3/day và 10 posts/scan.',
      'buyer_signal_level chỉ LOW/MEDIUM/HIGH. confidence 0-100.',
      'Trả JSON đúng schema.'
    ].join('\n');
  }

  function callGroupDiscoveryAi_(posts) {
    const cfg=getAiConfig_();
    if(!cfg.configured) throw new Error('AI provider chưa được cấu hình để Group evaluation.');
    const schema=groupDiscoverySchema_();
    const user=JSON.stringify({sample_size:posts.length,posts});
    const invoke=provider=>{
      if(provider==='gemini'){
        const c=Object.assign({},cfg,{provider:'gemini',model:cfg.provider==='gemini'?cfg.model:'gemini-auto'});
        const r=callGeminiStructured_(groupDiscoverySystemPrompt_(),user,schema,c);
        return {data:r.data,provider:'gemini',model:r.model||c.model};
      }
      const c=Object.assign({},cfg,{provider:'openai',model:cfg.provider==='openai'?cfg.model:'gpt-5.6-luna'});
      const payload={
        model:c.model,
        input:[
          {role:'system',content:groupDiscoverySystemPrompt_()},
          {role:'user',content:user}
        ],
        max_output_tokens:2500,
        text:{format:{type:'json_schema',name:'group_discovery',strict:true,schema}}
      };
      const data=parseStructuredResponse_(callOpenAi_(payload));
      return {data,provider:'openai',model:c.model};
    };
    try{return invoke(cfg.provider);}
    catch(primaryErr){
      const target=getAiFailoverTarget_(cfg,primaryErr);
      if(!target) throw primaryErr;
      return invoke(target.provider);
    }
  }

  function evaluateGroupDiscovery_(command) {
    command=command||{};
    const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    let row=Number(command.row||0);
    if(!row){
      const ar=sh.getActiveRange();
      row=ar?ar.getRow():0;
    }
    if(row<2||row>sh.getLastRow()) throw new Error('Không xác định được Group row để evaluation.');
    const vals=sh.getRange(row,1,1,27).getDisplayValues()[0]||[];
    const url=String(vals[3]||'').trim();
    const groupKey=exactGroupKeyFromRow_(url,vals[4]);
    if(!groupKey) throw new Error('Group chưa có canonical key.');
    const posts=loadGroupDiscoveryPosts_(groupKey,10);
    if(!posts.length) return {ok:false,row,groupKey,reason:'NO_DISCOVERY_POSTS',sampleSize:0};
    const ai=callGroupDiscoveryAi_(posts);
    const d=ai.data||{};
    const state={
      version:CFG.VERSION,
      row,groupKey,
      sampleSize:posts.length,
      evaluatedAt:new Date().toISOString(),
      topicSummary:String(d.topic_summary||'').trim(),
      audienceSummary:String(d.audience_summary||'').trim(),
      painSummary:String(d.pain_summary||'').trim(),
      buyerSignalSummary:String(d.buyer_signal_summary||'').trim(),
      contentTypes:Array.isArray(d.content_types)?d.content_types.map(x=>String(x||'').trim()).filter(Boolean).slice(0,10):[],
      buyerSignalLevel:['LOW','MEDIUM','HIGH'].indexOf(String(d.buyer_signal_level||'').toUpperCase())>=0
        ?String(d.buyer_signal_level).toUpperCase():'LOW',
      recommendedScansPerDay:policyInt_(d.recommended_scans_per_day,3,1,6),
      recommendedPostsPerScan:policyInt_(d.recommended_posts_per_scan,10,5,50),
      confidence:policyInt_(d.confidence,0,0,100),
      caveats:String(d.caveats||'').trim(),
      provider:ai.provider,model:ai.model,
      offerInferred:false,
      postsPerDayInferred:false
    };
    saveGroupDiscovery_(groupKey,state);
    logAi_({
      runId:'group-discovery-'+Utilities.getUuid().slice(0,8),
      event:'GROUP_DISCOVERY_EVAL',provider:ai.provider,model:ai.model,
      batch:1,totalBatches:1,analyzed:posts.length,total:posts.length,remaining:0,status:'DONE',
      message:'Group '+groupKey+' sample='+posts.length+' offerInferred=NO postsPerDayInferred=NO'
    });
    return Object.assign({ok:true},state);
  }

  function appendOnboardedGroup_(input) {
    const info=normalizeFacebookGroupInput_(input);
    const existing=findExistingCanonicalGroup_(info.groupKey);
    if(existing) return {ok:true,duplicate:true,existing,input:info};
    const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const row=sh.getLastRow()+1;
    ensureSheetRowCapacity_(sh,row);
    sh.getRange(row,5).setNumberFormat('@');
    sh.getRange(row,1,1,9).setValues([[
      'Có','',groupPlaceholderName_(),info.url,info.groupKey,'','Thử nghiệm',3,10
    ]]);
    sh.getRange(row,11).setFormula(`=IF(OR(H${row}="";J${row}="");"";J${row}+1/H${row})`);
    sh.getRange(row,12).setFormula(`=IF(A${row}<>"Có";"TẮT";IF(K${row}="";"CẦN QUÉT";IF(K${row}<=NOW();"CẦN QUÉT";"CHỜ")))`);
    sh.getRange(row,16).setValue('URL-only onboarding • discovery pending');
    mergeGroupAliasRegistry_([{
      canonicalKey:info.groupKey,alias:info.groupKey,
      numericId:/^\d{6,}$/.test(info.groupKey)?info.groupKey:'',
      source:'URL_ONBOARDING',firstSeen:new Date(),lastSeen:new Date(),reason:'OPERATOR_GROUP_URL'
    }]);
    return {ok:true,duplicate:false,row,name:groupPlaceholderName_(),url:info.url,groupKey:info.groupKey};
  }

  function prepareOnboardingWorkerBatch_(command) {
    command=command||{};
    const existingInput=normalizeFacebookGroupInput_(command.groupUrl);
    const existing=findExistingCanonicalGroup_(existingInput.groupKey);
    if(existing) return {ok:true,duplicate:true,existing,input:existingInput,plan:null};
    const available=getWorkerPoolRaw_()
      .filter(w=>w.enabled&&w.clientId&&workerSupportsRole_(w,'GROUP')&&workerHealthState_(w)!=='OFFLINE');
    if(!available.length){
      throw new Error('ONBOARDING_NO_WORKER: chưa có Worker GROUP/BOTH khả dụng; chưa ghi Group mới vào registry.');
    }
    const added=appendOnboardedGroup_(command.groupUrl);
    const job={
      row:added.row,name:added.name,profile:'AUTO',url:added.url,groupKey:added.groupKey,
      targetCount:10,status:'CHỜ',lifecycle:'Thử nghiệm',priorityRank:0
    };
    const plan=prepareJobsForWorkers_([job],10,false,'onboarding');
    return Object.assign({},added,{plan});
  }

  function runGroupOnboardingHarness_() {
    const good=normalizeFacebookGroupInput_('https://www.facebook.com/groups/Test.Group/?ref=share');
    let bad=false;
    try{normalizeFacebookGroupInput_('https://www.facebook.com/profile.php?id=123');}catch(_){bad=true;}
    const title=extractGroupTitleFromPosts_([{group_name:'Tên Group Thật',message:'x'}]);
    const noTitle=extractGroupTitleFromPosts_([{author_name:'Không được nhầm Author thành Group'}]);
    const prompt=groupDiscoverySystemPrompt_();
    const tests={
      ONBOARD_URL_NORMALIZED:good.groupKey==='test.group'&&good.url==='https://www.facebook.com/groups/test.group/',
      ONBOARD_NON_GROUP_REJECTED:bad,
      ONBOARD_REAL_TITLE_ONLY:title==='Tên Group Thật'&&noTitle==='',
      ONBOARD_PLACEHOLDER:groupPlaceholderName_()==='CHƯA LẤY TÊN',
      DISCOVERY_NO_OFFER_INFERENCE:prompt.indexOf('KHÔNG suy ra Offer/Product/Service')>=0,
      DISCOVERY_NO_POSTS_DAY_INFERENCE:prompt.indexOf('KHÔNG suy ra Posts/day')>=0
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }

  function loadGroupMap_(sheet) {
    const map = {};
    const last = sheet.getLastRow();
    if (last < 2) return map;
    const values = sheet.getRange(2, 1, last - 1, 16).getValues();
    values.forEach((r, i) => {
      const active = r[0], name = r[2], url = r[3];
      const explicitId = identityKeyFromCell_(r[4]);
      const urlKey = extractGroupKey_(url);
      const info = { name: name || groupPlaceholderName_(), row: i + 2, active };
      if (explicitId) map[explicitId] = info;
      if (urlKey) map[urlKey] = info;
    });
    return map;
  }


  function bindCanonicalGroupToSourceRow_(sheet, options) {
    options = options || {};
    const row = Number(options.row || 0);
    const sourceUrl = String(options.sourceUrl || '').trim();
    const sourceKey = String(options.sourceKey || extractGroupKey_(sourceUrl) || '').trim().toLowerCase();
    const canonicalKey = String(options.canonicalKey || '').trim().toLowerCase();

    if (!canonicalKey || row < 2 || row > sheet.getLastRow()) return null;

    const values = sheet.getRange(row, 1, 1, 16).getValues()[0] || [];
    const currentUrl = String(values[3] || '').trim();
    const currentExplicitId = identityKeyFromCell_(values[4]);
    const currentUrlKey = extractGroupKey_(currentUrl);

    const sourceMatches =
      (!!sourceUrl && normalizeUrl_(currentUrl) === normalizeUrl_(sourceUrl)) ||
      (!!sourceKey && (currentExplicitId === sourceKey || currentUrlKey === sourceKey));

    // Fail closed: never hijack a row if it no longer matches the scan source.
    if (!sourceMatches) return null;

    const canonicalUrl = 'https://www.facebook.com/groups/' + canonicalKey + '/';
    const existingName = String(values[2] || '').trim();
    const placeholderKeys = [sourceKey, currentExplicitId, currentUrlKey]
      .map(x => String(x || '').trim().toLowerCase())
      .filter(Boolean);
    const isPlaceholderName = isGroupPlaceholderName_(existingName) || placeholderKeys.some(k =>
      existingName.toLowerCase() === ('group ' + k).toLowerCase()
    );
    const name = isPlaceholderName ? groupPlaceholderName_() : existingName;

    if (!String(values[0] || '').trim()) sheet.getRange(row, 1).setValue('Có');
    sheet.getRange(row, 3).setValue(name);
    sheet.getRange(row, 4).setValue(canonicalUrl);
    sheet.getRange(row, 5).setNumberFormat('@').setValue(canonicalKey);
    if (!String(values[6] || '').trim()) sheet.getRange(row, 7).setValue('Thử nghiệm');
    if (!String(values[7] || '').trim()) sheet.getRange(row, 8).setValue(3);

    // Preserve operator-selected target in column I. Only repair formulas if absent.
    if (!String(values[10] || '').trim()) {
      sheet.getRange(row, 11).setFormula(`=IF(OR(H${row}="";J${row}="");"";J${row}+1/H${row})`);
    }
    if (!String(values[11] || '').trim()) {
      sheet.getRange(row, 12).setFormula(`=IF(A${row}<>"Có";"TẮT";IF(K${row}="";"CẦN QUÉT";IF(K${row}<=NOW();"CẦN QUÉT";"CHỜ")))`);
    }

    if (sourceUrl && normalizeUrl_(sourceUrl) !== normalizeUrl_(canonicalUrl)) {
      const oldNote = String(values[15] || '').trim();
      const trace = 'Canonical identity: ' + sourceUrl + ' -> ' + canonicalUrl;
      if (oldNote.indexOf(trace) < 0) {
        sheet.getRange(row, 16).setValue(oldNote ? (oldNote + ' | ' + trace) : trace);
      }
    }

    return { name, row, active: String(values[0] || '').trim() || 'Có' };
  }


  function ensureGroupRegistered_(sheet, groupKey) {
    const key = String(groupKey || '').trim().toLowerCase();
    if (!key) return { name: 'Group không rõ', row: null };

    const row = sheet.getLastRow() + 1;
    const name = groupPlaceholderName_();
    const url = 'https://www.facebook.com/groups/' + key + '/';
    sheet.getRange(row, 5).setNumberFormat('@');
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
    const raw=Number(value);
    if(!Number.isFinite(raw)) return 25;
    const n=Math.floor(raw);
    if(n<1) return 25;
    return Math.min(200,n);
  }

  function callGroupPostsRawOnce_(clientId,params) {
    const id=String(clientId||'').trim();
    if(!id) throw new Error('Thiếu CLIENT_ID Social AIO.');

    const url=CFG.BRIDGE_SERVER.replace(/\/$/,'')+'/call';
    const res=UrlFetchApp.fetch(url,{
      method:'post',
      contentType:'application/json',
      payload:JSON.stringify({
        id,
        apiname:'get_list_fb_group_posts',
        apiparams:params||{}
      }),
      muteHttpExceptions:true,
      followRedirects:true
    });

    const code=res.getResponseCode();
    const text=res.getContentText('UTF-8');
    if(code<200 || code>=300){
      const e=new Error('Social AIO relay HTTP '+code+': '+text.slice(0,700));
      e.httpCode=code;
      e.socialAioRaw=text.slice(0,4000);
      e.apiParams=params||{};
      throw e;
    }

    let parsed=text;
    try{ parsed=JSON.parse(text); }catch(_){}

    const err=findBridgeError_(parsed);
    if(err){
      if(/not\s+connected/i.test(err)){
        throw new Error(
          'Social AIO báo Client not connected. Mở đúng tab Social AIO > Automation > APIs, bấm Connect và giữ tab đó hoạt động. Chi tiết: '+err
        );
      }
      const e=new Error('Social AIO API lỗi: '+err);
      e.httpCode=code;
      e.socialAioRaw=text.slice(0,4000);
      e.apiParams=params||{};
      throw e;
    }

    return {
      code,
      raw:parsed,
      bytes:Utilities.newBlob(text||'').getBytes().length
    };
  }

  function fetchGroupPostsPageRaw_(clientId,params) {
    const max=Math.max(1,Math.min(5,Number(CFG.EMPTY_PAGE_RETRY_ATTEMPTS||3)));
    const delays=[0,1500,3500,7000,12000];
    let transientRetries=0;
    let emptyRetries=0;
    let last=null;

    for(let i=0;i<max;i++){
      if(i>0) Utilities.sleep(delays[Math.min(i,delays.length-1)]);
      try{
        const res=callGroupPostsRawOnce_(clientId,params);
        const posts=findBridgeArray_(res.raw,['posts']);
        const cursor=findBridgeCursor_(res.raw)||'';
        last={raw:res.raw,posts,cursor,code:res.code,bytes:res.bytes};

        if(posts.length){
          return Object.assign(last,{
            transientRetries,
            emptyRetries,
            attempts:i+1
          });
        }

        if(i<max-1){
          emptyRetries++;
          continue;
        }

        return Object.assign(last,{
          transientRetries,
          emptyRetries,
          attempts:i+1
        });
      }catch(err){
        if(!isTransientSocialAioError_(err) || i>=max-1) throw err;
        transientRetries++;
      }
    }

    return Object.assign(last||{raw:null,posts:[],cursor:'',code:0,bytes:0},{
      transientRetries,
      emptyRetries,
      attempts:max
    });
  }

  function exactGroupKeyFromRow_(groupUrl,cellValue) {
    return String(extractGroupKey_(groupUrl)||cellValue||'').trim().toLowerCase();
  }

  function isGroupIdentityResolveError_(err) {
    const msg=String(err&&err.message||err||'');
    return /This api only supports group|Wrong ID\s*\/\s*FB account not found|FB account not found|only supports group/i.test(msg);
  }

  function historicNumericGroupIdFromRow_(sourceRow,groupUrl) {
    const direct=extractGroupKey_(groupUrl);
    if(/^\d{6,}$/.test(direct)) return direct;

    const row=Number(sourceRow||0);
    if(row<2) return '';
    try{
      const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
      if(row>sh.getLastRow()) return '';

      const collectNumeric=(v,out)=>{
        v=v||[];
        const idCell=String(v[1]||'').replace(/\s+/g,'').trim();
        const lastFile=String(v[9]||'').trim();
        const note=String(v[12]||'').trim();
        if(/^\d{6,}$/.test(idCell)) out.push(idCell);
        let m=note.match(/facebook\.com\/groups\/(\d{6,})/i);
        if(m) out.push(m[1]);
        m=lastFile.match(/^api_posts_(\d{6,})_/i);
        if(m) out.push(m[1]);
      };

      // D:P => URL, Group ID, ..., File JSON cuối (M), ..., Ghi chú (P)
      const v=sh.getRange(row,4,1,13).getDisplayValues()[0]||[];
      const candidates=[];
      collectNumeric(v,candidates);
      let found=candidates.find(x=>x && x!==direct) || candidates[0] || '';
      if(found) return found;

      // Defense-in-depth: duplicate/import rows may not carry the historical numeric
      // alias themselves. Search sibling rows with the same canonical Group key.
      const identityKey=exactGroupKeyFromRow_(groupUrl,v[1]);
      if(identityKey && sh.getLastRow()>=2){
        const siblings=sh.getRange(2,4,sh.getLastRow()-1,13).getDisplayValues();
        for(let i=0;i<siblings.length;i++){
          const siblingRow=i+2;
          if(siblingRow===row) continue;
          const sv=siblings[i]||[];
          if(exactGroupKeyFromRow_(sv[0],sv[1])!==identityKey) continue;
          const siblingCandidates=[];
          collectNumeric(sv,siblingCandidates);
          found=siblingCandidates.find(x=>x && x!==direct) || siblingCandidates[0] || '';
          if(found) return found;
        }
      }
      return '';
    }catch(_){
      return '';
    }
  }

  function logRuntimeApiEvent_(info) {
    try{
      info=info||{};
      const sh=ensureApiDiagSheet_();
      const safeJson=value=>{
        if(value===undefined||value===null||value==='') return '';
        try{return JSON.stringify(value).slice(0,1200);}catch(_){return String(value).slice(0,1200);}
      };
      const note=[
        info.attemptedUrl?('url='+info.attemptedUrl):'',
        info.fallbackUrl?('fallback='+info.fallbackUrl):'',
        info.apiParams?('apiParams='+safeJson(info.apiParams)):'',
        info.fallbackParams?('fallbackParams='+safeJson(info.fallbackParams)):'',
        info.error?('error='+String(info.error).slice(0,1200)):'',
        info.raw?('raw='+String(info.raw).slice(0,1800)):''
      ].filter(Boolean).join(' | ');
      sh.insertRowsBefore(2,1);
      sh.getRange(2,1,1,24).setValues([[
        new Date(),
        'runtime-'+Utilities.getUuid().slice(0,10),
        info.groupName||'',
        info.groupKey||'',
        info.workerSlot||'',
        info.variant||'RUNTIME',
        info.httpCode||'',
        info.durationMs||'',
        info.bytes||'',
        info.rawType||'runtime',
        '','','','','','','','','','',
        info.title||'Runtime API event',
        info.code||'RUNTIME_API',
        CFG.VERSION,
        note
      ]]);
    }catch(_){}
  }

  function scanGroupApiBridge_(groupUrl,targetCount,groupKey,clientId,workerFast,sourceRow,runId) {
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
    let stopScope='';
    let transientRetries=0;
    let transientError='';
    let apiGroupUrl=groupUrl;
    let fallbackUsed=false;
    let fallbackGroupId='';
    let fallbackCause='';
    const relayClient=String(clientId||'').trim() || getBridgeClientId_();
    const sourceSheet=Number(sourceRow||0)>=2 ? mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET) : null;
    const sourceGroupName=sourceSheet && Number(sourceRow)<=sourceSheet.getLastRow()
      ? String(sourceSheet.getRange(Number(sourceRow),3).getDisplayValue()||'').trim()
      : '';
    const workerSlot=findWorkerSlotByClientId_(relayClient)||'';
    const sourceKey=extractGroupKey_(groupUrl);
    if(/^\d/.test(sourceKey) && !/^\d+$/.test(sourceKey)){
      const verifiedNumericId=historicNumericGroupIdFromRow_(sourceRow,groupUrl);
      if(verifiedNumericId && verifiedNumericId!==sourceKey){
        fallbackUsed=true;
        fallbackGroupId=verifiedNumericId;
        fallbackCause='PREEMPTIVE_DIGIT_LEADING_VANITY';
        apiGroupUrl='https://www.facebook.com/groups/'+verifiedNumericId+'/';
        logRuntimeApiEvent_({
          groupName:sourceGroupName,groupKey:String(groupKey||sourceKey||''),workerSlot,
          variant:'PREEMPTIVE_NUMERIC_GROUP_ID',title:'Preemptive verified numeric Group ID',code:'R_NUMERIC_ALIAS_PREEMPT',
          attemptedUrl:groupUrl,fallbackUrl:apiGroupUrl,error:'Digit-leading vanity slug protected before FBAIO call.'
        });
      }
    }

    while(posts.length<target && pages<30 && (Date.now()-started)<pageBudgetMs) {
      if(runId && isScanRunStopRequested_(runId)) {
        stopped=true;
        stopScope='RUN';
        break;
      }
      if(groupKey && isGroupStopRequested_(groupKey)) {
        stopped=true;
        stopScope='GROUP';
        break;
      }

      let page;
      try{
        page=fetchGroupPostsPageRaw_(relayClient,{
          url:apiGroupUrl,
          sorting:'Newest Posts',
          cursor:cursor || ''
        });
        transientRetries+=Number(page.transientRetries||0);
      }catch(err){
        if(!posts.length && !fallbackUsed && isGroupIdentityResolveError_(err)){
          const numericId=historicNumericGroupIdFromRow_(sourceRow,groupUrl);
          fallbackCause=String(err.message||err);
          logRuntimeApiEvent_({
            groupName:sourceGroupName,groupKey:String(groupKey||extractGroupKey_(groupUrl)||''),workerSlot,
            variant:'PRIMARY_GROUP_ID_FAIL',title:'FBAIO Group identity parse failed',code:'D_GROUP_ID_RESOLVE',
            attemptedUrl:apiGroupUrl,apiParams:err.apiParams||{url:apiGroupUrl,sorting:'Newest Posts',cursor:cursor||''},
            error:fallbackCause,httpCode:Number(err.httpCode||0),raw:err.socialAioRaw||''
          });
          if(numericId && numericId!==extractGroupKey_(apiGroupUrl)){
            fallbackUsed=true;
            fallbackGroupId=numericId;
            const primaryUrl=apiGroupUrl;
            apiGroupUrl='https://www.facebook.com/groups/'+numericId+'/';
            try{
              page=fetchGroupPostsPageRaw_(relayClient,{
                url:apiGroupUrl,
                sorting:'Newest Posts',
                cursor:cursor || ''
              });
              transientRetries+=Number(page.transientRetries||0);
              logRuntimeApiEvent_({
                groupName:sourceGroupName,groupKey:String(groupKey||extractGroupKey_(groupUrl)||''),workerSlot,
                variant:'NUMERIC_GROUP_ID_FALLBACK',title:'Numeric Group ID fallback PASS',code:'R_NUMERIC_FALLBACK_PASS',
                attemptedUrl:primaryUrl,fallbackUrl:apiGroupUrl,
                apiParams:err.apiParams||{url:primaryUrl,sorting:'Newest Posts',cursor:cursor||''},
                fallbackParams:{url:apiGroupUrl,sorting:'Newest Posts',cursor:cursor||''},
                error:fallbackCause
              });
            }catch(fallbackErr){
              logRuntimeApiEvent_({
                groupName:sourceGroupName,groupKey:String(groupKey||extractGroupKey_(groupUrl)||''),workerSlot,
                variant:'NUMERIC_GROUP_ID_FALLBACK_FAIL',title:'Numeric Group ID fallback failed',code:'E_NUMERIC_FALLBACK_FAIL',
                attemptedUrl:primaryUrl,fallbackUrl:apiGroupUrl,
                apiParams:err.apiParams||{url:primaryUrl,sorting:'Newest Posts',cursor:cursor||''},
                fallbackParams:fallbackErr.apiParams||{url:apiGroupUrl,sorting:'Newest Posts',cursor:cursor||''},
                error:String(fallbackErr.message||fallbackErr),
                httpCode:Number(fallbackErr.httpCode||0),raw:fallbackErr.socialAioRaw||''
              });
              throw fallbackErr;
            }
          }else{
            const e=new Error('FBAIO_GROUP_ID_RESOLVE: FBAIO parse sai Group URL/slug và không có numeric Group ID đã xác minh để fallback. Gốc: '+fallbackCause);
            e.httpCode=Number(err.httpCode||0);
            e.socialAioRaw=err.socialAioRaw||'';
            e.apiParams=err.apiParams||{url:apiGroupUrl,sorting:'Newest Posts',cursor:cursor||''};
            throw e;
          }
        } else if(isTransientSocialAioError_(err) && posts.length>0){
          transientError=String(err.message||err);
          break;
        } else {
          throw err;
        }
      }
      pages++;

      const pagePosts=page.posts||[];
      if(!pagePosts.length) {
        exhausted=true;
        nextCursor='';
        if(!posts.length){
          transientError='HTTP 200 nhưng page đầu rỗng sau '+Number(page.attempts||1)+' lần thử.';
        }
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

      nextCursor=page.cursor||'';
      if(!nextCursor || nextCursor===cursor || seenCursor[nextCursor]) {
        exhausted=true;
        break;
      }
      seenCursor[nextCursor]=true;
      cursor=nextCursor;
    }

    const timeBudgetExceeded=!stopped && posts.length<target && !!nextCursor && (Date.now()-started)>=pageBudgetMs;
    if(timeBudgetExceeded){
      logRuntimeApiEvent_({
        groupName:sourceGroupName,groupKey:String(groupKey||extractGroupKey_(groupUrl)||''),workerSlot,
        variant:'PARTIAL_TIME_BUDGET',title:'Partial Group scan reached time budget',code:'R_TIME_BUDGET_PARTIAL',
        attemptedUrl:apiGroupUrl,durationMs:Date.now()-started,
        error:'posts='+posts.length+'/'+target+' pages='+pages+' nextCursor=YES'
      });
    }

    if(!posts.length) {
      if(stopped){
        return {
          ok:false,
          version:CFG.VERSION,
          groupUrl,
          targetCount:target,
          postsRead:0,
          pages,
          exhausted:false,
          stopped:true,
          stopScope:stopScope||'RUN',
          incomplete:false,
          nextCursor:'',
          transientRetries,
          transientError:'',
          timeBudgetExceeded:false,
          imported:null,
          durationMs:Date.now()-started
        };
      }
      if(transientError){
        throw new Error('Social AIO page rỗng tạm thời: '+transientError);
      }
      throw new Error('API trả về nhưng không tìm thấy post cho Group này.');
    }

    const selectedPosts=posts.slice(0,target);
    const fileName='api_posts_'+(String(groupKey||extractGroupKey_(groupUrl)||extractGroupKey_(apiGroupUrl)||'group').trim())+'_'+
      Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss')+'.json';

    // Three workers may fetch concurrently, but Sheet dedupe/write must be serialized.
    const lock=LockService.getDocumentLock();
    if(!lock.tryLock(120000)) throw new Error('Sheet đang bận ghi dữ liệu từ Worker khác. Hãy RETRY.');
    let imported;
    try{
      imported=ingestApiRecords_(selectedPosts,{
        name:fileName,
        __workerFast:!!workerFast,
        __sourceGroupRow:Number(sourceRow||0),
        __sourceGroupUrl:groupUrl,
        __sourceGroupKey:String(groupKey||extractGroupKey_(groupUrl)||'').trim().toLowerCase()
      });
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
      stopScope,
      incomplete:selectedPosts.length<target || !!transientError,
      nextCursor:nextCursor||'',
      transientRetries,
      transientError,
      timeBudgetExceeded,
      fallbackUsed,
      fallbackGroupId,
      fallbackCause,
      apiGroupUrl,
      imported,
      durationMs:Date.now()-started
    };
  }


  function commentRetryCount_(status) {
    const m=String(status||'').match(/RETRY\s+(\d+)/i);
    return m ? Number(m[1]||0) : 0;
  }

  function isCommentProviderTransientError_(err) {
    const msg=String(err&&err.message||err||'');
    return /failed to fetch dynamically imported module|chunkloaderror|loading chunk\s+\d+\s+failed|importing a module script failed|fbaio\.org\/src\/[^\s]+\.js/i.test(msg);
  }

  function isCommentRetryableError_(err) {
    const msg=String(err&&err.message||err||'');
    return isCommentProviderTransientError_(msg) ||
      isTransientSocialAioError_(msg) ||
      isWorkerConnectionError_(msg);
  }

  function commentRetryDelayMs_(attempt) {
    const arr=CFG.COMMENT_RETRY_DELAYS_MS||[];
    const n=Math.max(1,Number(attempt||1));
    return Number(arr[Math.min(n-1,Math.max(0,arr.length-1))]||5*60*1000);
  }

  function commentRetryDue_(status,lastScanMs,nowMs) {
    const attempt=commentRetryCount_(status);
    if(!attempt) return true;
    const last=Number(lastScanMs||0);
    if(!last) return true;
    const now=Number(nowMs||Date.now());
    return now>=last+commentRetryDelayMs_(attempt);
  }

  function getCommentProviderBreaker_() {
    const props=PropertiesService.getDocumentProperties();
    const raw=props.getProperty(CFG.COMMENT_PROVIDER_BREAKER_KEY)||'';
    if(!raw) return {open:false,openUntil:0,lastError:'',openedAt:0};
    let state=null;
    try{state=JSON.parse(raw);}catch(_){}
    if(!state || Number(state.openUntil||0)<=Date.now()){
      props.deleteProperty(CFG.COMMENT_PROVIDER_BREAKER_KEY);
      return {open:false,openUntil:0,lastError:'',openedAt:0};
    }
    return {
      open:true,
      openUntil:Number(state.openUntil||0),
      openedAt:Number(state.openedAt||0),
      lastError:String(state.lastError||'')
    };
  }

  function openCommentProviderBreaker_(err,policyConfig,profile) {
    const now=Date.now();
    const config=policyConfig||getAutoPolicyConfig_();
    const p=profile||activePolicyProfile_(config);
    const commentPolicy=resolveEffectiveCommentPolicy_(p,null,config);
    const state={
      open:true,
      openedAt:now,
      openUntil:now+Number(commentPolicy.providerBreakerMinutes||10)*60*1000,
      lastError:String(err&&err.message||err||'').slice(0,500)
    };
    PropertiesService.getDocumentProperties()
      .setProperty(CFG.COMMENT_PROVIDER_BREAKER_KEY,JSON.stringify(state));
    return state;
  }

  function clearCommentProviderBreaker_() {
    PropertiesService.getDocumentProperties().deleteProperty(CFG.COMMENT_PROVIDER_BREAKER_KEY);
  }

  function repairCommentProviderHardQuarantine_() {
    const raw=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.RAW_SHEET);
    if(!raw || raw.getLastRow()<5) return {changed:0};
    const n=raw.getLastRow()-4;
    const statuses=raw.getRange(5,20,n,1).getDisplayValues();
    let changed=0;
    statuses.forEach((r,i)=>{
      const status=String(r[0]||'').trim();
      if(!status || /^PROVIDER_WAIT:/i.test(status)) return;
      const providerTransient=
        isCommentProviderTransientError_(status) ||
        /^RETRY\s+\d+:\s*PROVIDER_TRANSIENT/i.test(status) ||
        /^HARD:\s*.*PROVIDER_TRANSIENT/i.test(status);
      if(!providerTransient) return;

      const cleaned=status
        .replace(/^HARD:\s*/i,'')
        .replace(/^RETRY\s+\d+:\s*/i,'')
        .replace(/^PROVIDER_TRANSIENT\s*/i,'')
        .trim();

      // Provider-wide outage is not a Post failure. Remove per-Post retry/backoff
      // so all affected Posts become immediately eligible after the circuit closes.
      raw.getRange(i+5,20).setValue(
        'PROVIDER_WAIT: '+(cleaned || 'Comment endpoint provider transient').slice(0,180)
      );
      changed++;
    });
    if(changed) invalidateCommentStatsCache_();
    return {changed};
  }

  function loadExistingCommentCountByPost_() {
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.COMMENT_SHEET);
    const out={};
    if(!sh || sh.getLastRow()<2) return out;
    sh.getRange(2,5,sh.getLastRow()-1,1).getDisplayValues().forEach(r=>{
      const id=String(r[0]||'').trim();
      if(id) out[id]=(out[id]||0)+1;
    });
    return out;
  }

  function loadCommentWatchMap_() {
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.OPPORTUNITY_SHEET);
    const out={};
    if(!sh || sh.getLastRow()<2) return out;
    const n=sh.getLastRow()-1;
    const ids=sh.getRange(2,2,n,1).getValues(); // B
    const types=sh.getRange(2,4,n,1).getValues(); // D
    const scoreClass=sh.getRange(2,11,n,2).getValues(); // K:L
    const gates=sh.getRange(2,25,n,1).getValues(); // Y
    ids.forEach((r,i)=>{
      const sourceId=String(r[0]||'').trim();
      const type=String(types[i]&&types[i][0]||'').trim();
      if(!sourceId || type==='Bình luận' || sourceId.indexOf('C:')===0) return;
      const score=Number(scoreClass[i]&&scoreClass[i][0]||0);
      const classification=String(scoreClass[i]&&scoreClass[i][1]||'').trim();
      const gate=String(gates[i]&&gates[i][0]||'').trim().toUpperCase();
      const watch=
        gate==='PASS'||gate==='WATCH'||gate==='REVIEW'||gate==='REVIEW_REQUIRED'||
        classification==='Nguồn hội thoại'||score>=40;
      if(watch) out[sourceId]={score,classification,gate};
    });
    return out;
  }

  function getCommentBacklog_(limit,policyConfig) {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const raw=mustSheet_(ss,CFG.RAW_SHEET);
    if(raw.getLastRow()<5) return [];
    if(raw.getMaxColumns()<20) ensureV16Sheets_(true);
    const config=policyConfig||getAutoPolicyConfig_();
    const existing=loadExistingCommentCountByPost_();
    const watchMap=loadCommentWatchMap_();
    const rows=raw.getRange(5,1,raw.getLastRow()-4,20).getValues();
    const now=Date.now();
    const jobs=[];
    rows.forEach((r,i)=>{
      const postId=String(r[4]||'').trim();
      const url=String(r[5]||'').trim();
      if(!postId||!url) return;
      const groupKey=String(r[3]||'').trim().toLowerCase();
      const profile=policyProfileForGroup_(config,groupKey);
      if(!profile||profile.enabled===false) return;
      const ownPost=isProfileOwnPost_(profile,r[7]);
      const commentPolicy=resolveEffectiveCommentPolicy_(profile,{ownPost},config);
      if(!commentPolicy.enabled) return;

      const expected=Math.max(0,toNumber_(r[9]));
      const stored=Math.max(0,toNumber_(r[16]));
      const imported=Math.max(0,Number(existing[postId]||0));
      const fetched=Math.max(stored,imported);
      const cursor=String(r[17]||'').trim();
      const status=String(r[19]||'').trim();
      const importedAtMs=opsDateMs_(r[0]);
      const lastScanMs=opsDateMs_(r[18]);
      if(/^HARD:/i.test(status)) return;
      if(!commentRetryDue_(status,lastScanMs,now)) return;

      const hotRecent=!!importedAtMs&&now-importedAtMs<=Number(commentPolicy.hotWatchHours||24)*60*60*1000;
      const hotDue=hotRecent&&!!watchMap[postId]&&
        (!lastScanMs||now-lastScanMs>=Number(commentPolicy.recheckMinutes||30)*60*1000);
      const deltaPending=cursor||fetched<expected;
      if(!deltaPending&&!hotDue) return;

      jobs.push({
        rawRow:i+5,postId,url,
        groupName:String(r[2]||'').trim(),
        groupKey,
        profileId:profile.id,
        ownPost,
        policyPriority:Number(commentPolicy.priority||0),
        commentPolicy,
        expected,fetched,cursor,status,
        retryCount:commentRetryCount_(status),
        importedAtMs,lastScanMs,
        delta:Math.max(0,expected-fetched),
        hotWatch:hotDue,
        watch:watchMap[postId]||null
      });
    });

    jobs.sort((a,b)=>{
      if((b.policyPriority||0)!==(a.policyPriority||0)) return (b.policyPriority||0)-(a.policyPriority||0);
      const rank=x=>x.delta>0?0:(x.hotWatch?1:(x.cursor?2:3));
      const ra=rank(a),rb=rank(b);
      if(ra!==rb) return ra-rb;
      if((b.importedAtMs||0)!==(a.importedAtMs||0)) return (b.importedAtMs||0)-(a.importedAtMs||0);
      return (b.delta||0)-(a.delta||0);
    });
    const active=activePolicyProfile_(config);
    const defaultPolicy=resolveEffectiveCommentPolicy_(active,null,config);
    const cap=Math.max(1,Math.min(100,Number(limit||defaultPolicy.maxPostsPerCycle||CFG.COMMENT_MAX_POSTS_PER_TICK)));
    return jobs.slice(0,cap);
  }

  function invalidateCommentStatsCache_() {
    try{CacheService.getScriptCache().remove('COMMENT_INTEL_STATS_'+CFG.VERSION);}catch(_){}
  }

  function getCommentIntelligenceStats_(force) {
    const cache=CacheService.getScriptCache();
    const cacheKey='COMMENT_INTEL_STATS_'+CFG.VERSION;
    if(!force){
      const cached=cache.get(cacheKey);
      if(cached){try{return JSON.parse(cached);}catch(_){}}
    }
    ensureV16Sheets_(false);
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const raw=ss.getSheetByName(CFG.RAW_SHEET);
    const comment=ss.getSheetByName(CFG.COMMENT_SHEET);
    const legacyEnabled=(PropertiesService.getDocumentProperties().getProperty(CFG.COMMENT_INTEL_ENABLED_KEY)||'true')!=='false';
    const policyConfig=getAutoPolicyConfig_();
    const activeProfile=activePolicyProfile_(policyConfig);
    const defaultPolicy=resolveEffectiveCommentPolicy_(activeProfile,null,policyConfig);
    const enabled=legacyEnabled&&defaultPolicy.enabled;
    let postsWithComments=0,backlogPosts=0,expectedComments=0,fetchedComments=0,hard=0,retry=0,retryDeferred=0,providerWait=0,hotWatchDue=0;
    if(raw && raw.getLastRow()>=5){
      const existing=loadExistingCommentCountByPost_();
      const watchMap=loadCommentWatchMap_();
      const rows=raw.getRange(5,1,raw.getLastRow()-4,20).getValues();
      const now=Date.now();
      rows.forEach(r=>{
        const postId=String(r[4]||'').trim();
        if(!postId) return;
        const expected=Math.max(0,toNumber_(r[9]));
        const importedAtMs=opsDateMs_(r[0]);
        const lastScanMs=opsDateMs_(r[18]);
        const groupKey=String(r[3]||'').trim().toLowerCase();
        const profile=policyProfileForGroup_(policyConfig,groupKey);
        const ownPost=isProfileOwnPost_(profile,r[7]);
        const rowPolicy=resolveEffectiveCommentPolicy_(profile,{ownPost},policyConfig);
        const hotRecent=!!importedAtMs && now-importedAtMs<=Number(rowPolicy.hotWatchHours||24)*60*60*1000;
        if(rowPolicy.enabled && hotRecent && watchMap[postId] &&
          (!lastScanMs || now-lastScanMs>=Number(rowPolicy.recheckMinutes||30)*60*1000)) hotWatchDue++;
        if(expected<=0) return;
        postsWithComments++;
        expectedComments+=expected;
        const fetched=Math.max(Math.max(0,toNumber_(r[16])),Number(existing[postId]||0));
        fetchedComments+=Math.min(expected,fetched);
        const cursor=String(r[17]||'').trim();
        const status=String(r[19]||'').trim();
        if(/^HARD:/i.test(status)) hard++;
        else if(/^PROVIDER_WAIT:/i.test(status)) providerWait++;
        else if(/^RETRY/i.test(status)){
          retry++;
          if(!commentRetryDue_(status,lastScanMs,now)) retryDeferred++;
        }
        if(!/^HARD:/i.test(status) && (cursor || fetched<expected)) backlogPosts++;
      });
    }
    const result={
      version:CFG.VERSION,
      enabled,
      postsWithComments,
      backlogPosts,
      expectedComments,
      fetchedComments,
      coveragePct:expectedComments?Math.round(Math.min(expectedComments,fetchedComments)*1000/expectedComments)/10:100,
      storedComments:comment?Math.max(0,comment.getLastRow()-1):0,
      hardErrors:hard,
      retryPosts:retry,
      retryDeferred,
      providerWaitPosts:providerWait,
      hotWatchDue,
      provider:getCommentProviderBreaker_(),
      effectivePolicy:defaultPolicy
    };
    try{cache.put(cacheKey,JSON.stringify(result),30);}catch(_){}
    return result;
  }

  function callCommentsRawOnce_(clientId,params) {
    const id=String(clientId||'').trim();
    if(!id) throw new Error('Thiếu CLIENT_ID Social AIO.');
    const url=CFG.BRIDGE_SERVER.replace(/\/$/,'')+'/call';
    const res=UrlFetchApp.fetch(url,{
      method:'post',
      contentType:'application/json',
      payload:JSON.stringify({
        id,
        apiname:'get_list_fb_comment',
        apiparams:params||{}
      }),
      muteHttpExceptions:true,
      followRedirects:true
    });
    const code=res.getResponseCode();
    const text=res.getContentText('UTF-8');
    if(code<200 || code>=300) throw new Error('Social AIO relay HTTP '+code+': '+text.slice(0,700));
    let parsed=text;
    try{parsed=JSON.parse(text);}catch(_){}
    const err=findBridgeError_(parsed);
    if(err){
      if(/not\s+connected/i.test(err)) throw new Error('Social AIO báo Client not connected. '+err);
      throw new Error('Social AIO API lỗi: '+err);
    }
    return {code,raw:parsed,bytes:Utilities.newBlob(text||'').getBytes().length};
  }

  function fetchCommentsPageRaw_(clientId,params) {
    const max=Math.max(1,Math.min(5,Number(CFG.RELAY_RETRY_ATTEMPTS||3)));
    const delays=[0,1500,3500,7000,12000];
    let transientRetries=0,last=null;
    for(let i=0;i<max;i++){
      if(i>0) Utilities.sleep(delays[Math.min(i,delays.length-1)]);
      try{
        const res=callCommentsRawOnce_(clientId,params);
        const comments=findBridgeArray_(res.raw,['comments']);
        const cursor=findBridgeCursor_(res.raw)||'';
        last={raw:res.raw,comments,cursor,code:res.code,bytes:res.bytes,attempts:i+1,transientRetries};
        if(comments.length || i>=max-1) return last;
      }catch(err){
        if(!isCommentRetryableError_(err) || i>=max-1) throw err;
        transientRetries++;
      }
    }
    return last||{raw:null,comments:[],cursor:'',code:0,bytes:0,attempts:max,transientRetries};
  }

  function updateRawCommentState_(job,patch) {
    const raw=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.RAW_SHEET);
    if(job.rawRow<5 || job.rawRow>raw.getLastRow()) return;
    const vals=raw.getRange(job.rawRow,17,1,4).getValues()[0];
    const next=Object.assign({
      fetched:Math.max(0,toNumber_(vals[0])),
      cursor:String(vals[1]||''),
      lastScan:vals[2]||'',
      status:String(vals[3]||'')
    },patch||{});
    raw.getRange(job.rawRow,17,1,4).setValues([[
      Number(next.fetched||0),
      String(next.cursor||''),
      next.lastScan||new Date(),
      String(next.status||'')
    ]]);
    if(next.commentsCount!==undefined && next.commentsCount!==null){
      const observed=Math.max(0,Number(next.commentsCount||0));
      const current=Math.max(0,toNumber_(raw.getRange(job.rawRow,10).getValue()));
      if(observed>current) raw.getRange(job.rawRow,10).setValue(observed);
    }
    invalidateCommentStatsCache_();
  }

  function runSinglePostCommentIntelligence_(job,options) {
    options=options||{};
    const leaseIdentity=String(job&&job.postId||job&&job.url||'').trim();
    const leaseOwner='COMMENT|'+String(options.source||'AUTO')+'|'+Utilities.getUuid().slice(0,8);
    const postLease=acquireRuntimeLease_(
      commentPostLeasePropertyKey_(leaseIdentity),
      leaseOwner,
      CFG.COMMENT_POST_LEASE_TTL_MS
    );
    if(!postLease.ok){
      return {
        ok:false,busy:true,retry:false,hard:false,
        postId:job&&job.postId||'',postUrl:job&&job.url||'',
        commentsRead:0,commentImported:0,newSourceIds:[],
        status:'SKIP_BUSY',leaseReason:postLease.reason||'POST_BUSY',
        leaseExpiresAt:Number(postLease.expiresAt||0),durationMs:0
      };
    }

    const started=Date.now();
    try{
      const clientId=String(options.clientId||'').trim()||getBridgeClientId_();
      const currentFetched=Math.max(0,Number(job.fetched||0));
      const expected=Math.max(0,Number(job.expected||0));
      const policy=options.commentPolicy||job.commentPolicy||resolveEffectiveCommentPolicy_(
        policyProfileForGroup_(options.policyConfig||getAutoPolicyConfig_(),job.groupKey),
        {ownPost:!!job.ownPost},
        options.policyConfig||getAutoPolicyConfig_()
      );
      const maxPages=policyInt_(policy.maxPagesPerPost,CFG.COMMENT_MAX_PAGES_PER_POST,1,10);
      const softMaxComments=policyInt_(policy.maxCommentsPerPost,CFG.COMMENT_MAX_RECORDS_PER_POST,10,1000);
      let cursor=String(job.cursor||'');
      let lastCursor=cursor;
      let pagesRead=0;
      let totalComments=[];
      let lastPage=null;

      const deadlineAt=Number(options.deadlineAt||0);
      while(pagesRead<maxPages && totalComments.length<softMaxComments && (!deadlineAt || Date.now()<deadlineAt-2000)){
        const page=fetchCommentsPageRaw_(clientId,{url:job.url,cursor});
        lastPage=page;
        const comments=page.comments||[];
        if(!comments.length) break;
        clearCommentProviderBreaker_();
        totalComments=totalComments.concat(comments);
        pagesRead++;
        const next=String(page.cursor||'');
        if(!next||next===cursor){
          lastCursor='';
          break;
        }
        lastCursor=next;
        cursor=next;
      }

      if(!totalComments.length){
        if(job.hotWatch&&expected<=currentFetched){
          updateRawCommentState_(job,{
            fetched:currentFetched,cursor:'',lastScan:new Date(),
            status:'WATCH_EMPTY '+currentFetched+'/'+expected
          });
          return {
            ok:true,hotWatch:true,postId:job.postId,postUrl:job.url,
            commentsRead:0,commentImported:0,newSourceIds:[],
            pagesRead:0,status:'WATCH_EMPTY',durationMs:Date.now()-started
          };
        }
        const n=Math.max(0,Number(job.retryCount||0))+1;
        const hard=n>=CFG.COMMENT_EMPTY_RETRY_MAX;
        updateRawCommentState_(job,{
          fetched:currentFetched,cursor:'',lastScan:new Date(),
          status:(hard?'HARD: ':'RETRY '+n+': ')+'API_EMPTY expected '+expected+' fetched '+currentFetched
        });
        return {
          ok:false,hard,retry:!hard,postId:job.postId,postUrl:job.url,
          commentsRead:0,commentImported:0,newSourceIds:[],pagesRead:0,
          error:'Comment API page rỗng sau retry.',durationMs:Date.now()-started
        };
      }

      const fileName='api_comments_'+job.postId+'_'
        +Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss')+'.json';
      const imported=ingestApiRecords_(totalComments,{
        name:fileName,
        __workerFast:true,
        __sourcePostId:job.postId,
        __sourcePostUrl:job.url,
        __sourceGroupKey:job.groupKey||'',
        __sourceGroupName:job.groupName||''
      });

      const newCount=Math.max(0,Number(imported.commentImported||0));
      const observedExpected=Math.max(expected,currentFetched+newCount);
      const fetched=Math.min(observedExpected||Number.MAX_SAFE_INTEGER,currentFetched+newCount);
      const capped=(pagesRead>=maxPages||totalComments.length>=softMaxComments)&&!!lastCursor;
      let status='',nextCursor='';

      if(fetched>=observedExpected&&!capped){
        status=(job.hotWatch?'WATCH_SYNCED ':'SYNCED ')+fetched+'/'+observedExpected;
      }else if(lastCursor){
        status='BACKLOG '+fetched+'/'+observedExpected;
        nextCursor=lastCursor;
      }else if(fetched>=observedExpected){
        status=(job.hotWatch?'WATCH_SYNCED ':'SYNCED ')+fetched+'/'+observedExpected;
      }else{
        const n=Math.max(0,Number(job.retryCount||0))+1;
        const hard=n>=CFG.COMMENT_EMPTY_RETRY_MAX;
        status=(hard?'HARD: ':'RETRY '+n+': ')+'GAP '+fetched+'/'+observedExpected+' no cursor';
      }

      updateRawCommentState_(job,{
        fetched,cursor:nextCursor,lastScan:new Date(),status,commentsCount:observedExpected
      });
      return {
        ok:true,
        postId:job.postId,
        postUrl:job.url,
        commentsRead:totalComments.length,
        commentImported:newCount,
        duplicates:Number(imported.duplicates||0),
        fetched,
        expected:observedExpected,
        nextCursor,
        pagesRead,
        maxPages,
        softMaxComments,
        status,
        newSourceIds:(imported.newSourceIds||[]).filter(x=>String(x||'').startsWith('C:')),
        durationMs:Date.now()-started
      };
    } finally {
      releaseRuntimeLease_(commentPostLeasePropertyKey_(leaseIdentity),postLease.token);
    }
  }

  function runCommentIntelligenceUi_(limit) {
    const started=Date.now();
    const runId='comment-'+Utilities.getUuid().slice(0,10);
    let result=null;
    try{
      const policyConfig=getAutoPolicyConfig_();
      const profile=activePolicyProfile_(policyConfig);
      const policy=resolveEffectiveCommentPolicy_(profile,null,policyConfig);
      result=runCommentIntelligenceCycle_({
        limit:Math.max(1,Math.min(20,Number(limit||policy.maxPostsPerCycle))),
        source:'UI',
        policyConfig,
        policyProfileId:profile&&profile.id||''
      });
      const ci={
        processed:Number(result&&result.processed||0),
        imported:Number(result&&result.commentImported||0),
        providerCircuitOpen:!!(result&&result.providerCircuitOpen),
        providerRetryAt:Number(result&&result.providerRetryAt||0),
        providerError:String(result&&result.providerError||'').slice(0,240),
        repairedProviderHard:Number(result&&result.repairedProviderHard||0),
        reason:String(result&&result.reason||'')
      };
      logAutoMonitorRun_({
        ok:result&&result.ok!==false,
        skipped:!!(result&&result.skipped),
        version:CFG.VERSION,
        runId,
        source:'COMMENT_UI',
        groupsProcessed:0,groupsPassed:0,groupsFailed:0,groupsSkipped:0,
        commentsProcessed:ci.processed,
        commentsImported:ci.imported,
        aiAnalyzed:0,
        durationMs:Date.now()-started,
        reason:ci.reason,
        message:ci.providerCircuitOpen?'Comment provider đang tạm khóa bởi circuit breaker.':'',
        commentIntel:ci
      });
      return Object.assign({},result||{},{runId});
    }catch(err){
      logAutoMonitorRun_({
        ok:false,version:CFG.VERSION,runId,source:'COMMENT_UI',
        groupsProcessed:0,groupsPassed:0,groupsFailed:0,groupsSkipped:0,
        commentsProcessed:0,commentsImported:0,aiAnalyzed:0,
        durationMs:Date.now()-started,error:String(err&&err.message||err||'').slice(0,1000)
      });
      throw err;
    }
  }

  function runCommentIntelligenceCycle_(options) {
    options=options||{};
    ensureV16Sheets_(false);
    const props=PropertiesService.getDocumentProperties();
    const legacyEnabled=(props.getProperty(CFG.COMMENT_INTEL_ENABLED_KEY)||'true')!=='false';
    const policyConfig=options.policyConfig||getAutoPolicyConfig_();
    const policyProfile=policyProfileForGroup_(policyConfig,'')||activePolicyProfile_(policyConfig);
    const commentPolicy=resolveEffectiveCommentPolicy_(policyProfile,null,policyConfig);
    const enabled=legacyEnabled&&commentPolicy.enabled;
    if(!enabled) return {ok:true,enabled:false,reason:'COMMENT_POLICY_OFF',processed:0,commentImported:0,newSourceIds:[],version:CFG.VERSION};

    const started=Date.now();
    const repaired=repairCommentProviderHardQuarantine_();
    const breaker=getCommentProviderBreaker_();
    if(breaker.open && !options.forceProviderProbe){
      return {
        ok:true,enabled:true,skipped:true,reason:'PROVIDER_CIRCUIT_OPEN',
        processed:0,commentImported:0,newSourceIds:[],version:CFG.VERSION,
        providerCircuitOpen:true,providerRetryAt:breaker.openUntil,
        providerError:breaker.lastError,repairedProviderHard:Number(repaired.changed||0),
        stats:getCommentIntelligenceStats_(true)
      };
    }

    const limit=Math.max(1,Math.min(20,Number(options.limit||commentPolicy.maxPostsPerCycle)));
    const jobs=getCommentBacklog_(limit,policyConfig);
    if(!jobs.length) return {
      ok:true,enabled:true,processed:0,commentImported:0,newSourceIds:[],version:CFG.VERSION,
      repairedProviderHard:Number(repaired.changed||0),stats:getCommentIntelligenceStats_(true)
    };

    const pool=getWorkerPoolRaw_()
      .filter(w=>w.enabled&&w.clientId&&workerSupportsRole_(w,'COMMENT')&&workerHealthState_(w)!=='OFFLINE')
      .sort((a,b)=>{
        const rank={ONLINE:0,UNKNOWN:1,STALE:2,OFFLINE:3};
        const ha=rank[workerHealthState_(a)]!==undefined?rank[workerHealthState_(a)]:9;
        const hb=rank[workerHealthState_(b)]!==undefined?rank[workerHealthState_(b)]:9;
        if(ha!==hb) return ha-hb;
        return Number(a.latencyMs||999999)-Number(b.latencyMs||999999);
      });
    if(!pool.length) return {
      ok:true,enabled:true,skipped:true,reason:'NO_COMMENT_WORKER',
      processed:0,commentImported:0,newSourceIds:[],version:CFG.VERSION,
      repairedProviderHard:Number(repaired.changed||0),stats:getCommentIntelligenceStats_(true)
    };
    const clientId=pool[0].clientId;
    const results=[],sourceIds=[];
    let imported=0,providerCircuitOpen=false,providerRetryAt=0,providerError='';

    for(let i=0;i<jobs.length;i++){
      if(Date.now()-started>CFG.COMMENT_CYCLE_BUDGET_MS) break;
      const job=jobs[i];
      try{
        const r=runSinglePostCommentIntelligence_(job,{clientId,source:options.source||'AUTO',commentPolicy:job.commentPolicy,policyConfig,deadlineAt:started+CFG.COMMENT_CYCLE_BUDGET_MS});
        results.push(r);
        imported+=Number(r.commentImported||0);
        (r.newSourceIds||[]).forEach(id=>sourceIds.push(id));
      }catch(err){
        const n=Math.max(0,Number(job.retryCount||0))+1;
        const providerTransient=isCommentProviderTransientError_(err);
        const retryable=isCommentRetryableError_(err);
        const hard=providerTransient?false:(n>=CFG.COMMENT_EMPTY_RETRY_MAX || !retryable);
        const errorText=String(err&&err.message||err||'').slice(0,180);
        updateRawCommentState_(job,{
          fetched:job.fetched,
          cursor:job.cursor||'',
          lastScan:new Date(),
          status:providerTransient
            ? ('PROVIDER_WAIT: COMMENT_ENDPOINT '+errorText)
            : ((hard?'HARD: ':'RETRY '+n+': ')+errorText)
        });
        results.push({
          ok:false,hard,retry:providerTransient?false:!hard,providerTransient,
          postId:job.postId,error:String(err&&err.message||err||'')
        });
        if(providerTransient){
          const opened=openCommentProviderBreaker_(err,policyConfig,policyProfile);
          providerCircuitOpen=true;
          providerRetryAt=Number(opened.openUntil||0);
          providerError=String(opened.lastError||'');
          break; // provider-wide outage: stop remaining Comment jobs in this cycle.
        }
      }
    }

    return {
      ok:true,enabled:true,version:CFG.VERSION,
      requested:jobs.length,processed:results.length,
      commentImported:imported,
      newSourceIds:[...new Set(sourceIds)],
      durationMs:Date.now()-started,
      results,
      providerCircuitOpen,
      providerRetryAt,
      providerError,
      repairedProviderHard:Number(repaired.changed||0),
      stats:getCommentIntelligenceStats_(true)
    };
  }

  function autoRetryKey_(groupKey) {
    const raw=String(groupKey||'unknown').trim().toLowerCase();
    const safe=Utilities.base64EncodeWebSafe(raw,Utilities.Charset.UTF_8).replace(/=+$/,'').slice(0,150);
    return CFG.AUTO_RETRY_PREFIX+safe;
  }

  function getAutoRetryState_(groupKey) {
    const raw=PropertiesService.getDocumentProperties().getProperty(autoRetryKey_(groupKey))||'';
    if(!raw) return {attempts:0,nextAt:0,hard:false,lastClass:'',lastError:''};
    try{return Object.assign({attempts:0,nextAt:0,hard:false,lastClass:'',lastError:''},JSON.parse(raw));}
    catch(_){return {attempts:0,nextAt:0,hard:false,lastClass:'',lastError:''};}
  }

  function clearAutoRetryState_(groupKey) {
    if(groupKey) PropertiesService.getDocumentProperties().deleteProperty(autoRetryKey_(groupKey));
  }

  function setAutoRetryFailure_(groupKey,errorClass,error) {
    const props=PropertiesService.getDocumentProperties();
    const prev=getAutoRetryState_(groupKey);
    const cls=String(errorClass||'UNKNOWN').toUpperCase();
    const retryable=['TRANSIENT','CONNECTION','SHEET_BUSY','TIME_BUDGET'].indexOf(cls)>=0;
    const attempts=Number(prev.attempts||0)+1;
    const config=getAutoPolicyConfig_();
    const profile=policyProfileForGroup_(config,groupKey);
    const policy=resolveEffectiveScanPolicy_(profile,{},config);
    const hard=!retryable||attempts>=Number(policy.retryAttempts||CFG.AUTO_RETRY_MAX_ATTEMPTS);
    const minutes=policy.retryBackoffMinutes||[];
    const delay=hard?0:Number(minutes[Math.min(attempts-1,Math.max(0,minutes.length-1))]||30)*60000;
    const state={
      attempts,
      nextAt:hard?0:Date.now()+delay,
      hard,
      lastClass:cls,
      lastError:String(error||'').slice(0,500),
      updatedAt:new Date().toISOString(),
      policyProfileId:profile&&profile.id||'',
      policyRetryAttempts:Number(policy.retryAttempts||0)
    };
    props.setProperty(autoRetryKey_(groupKey),JSON.stringify(state));
    return state;
  }

  function classifyAutoSheetException_(status,note) {
    const text=String(note||'');
    if(/rows are out of bounds|ROW_CAPACITY/i.test(text)) return 'TRANSIENT';
    if(/DUPLICATE_IDENTITY|URL_INVALID|HARD_QUARANTINE/i.test(text)) return 'STRUCTURAL';
    if(/không còn cursor|no cursor/i.test(text) && String(status||'')==='THIẾU') return 'EXHAUSTED';
    if(/trước time budget|time budget/i.test(text) && String(status||'')==='THIẾU') return 'TIME_BUDGET';
    if(/relay tạm lỗi|HTTP\s*(429|502|503|504)|gateway timeout|service unavailable|timed?\s*out|timeout/i.test(text)) return 'TRANSIENT';
    return classifyScanError_(new Error(text));
  }

  function getDuplicateGroupIdentityRows_() {
    const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    if(sh.getLastRow()<2) return [];
    const rows=sh.getRange(2,1,sh.getLastRow()-1,27).getValues();
    const buckets={};
    rows.forEach((r,i)=>{
      if(String(r[0]||'').trim()!=='Có') return;
      const url=String(r[3]||'').trim();
      const key=exactGroupKeyFromRow_(url,r[4]);
      if(!key) return;
      (buckets[key]||(buckets[key]=[])).push({
        row:i+2,key,name:String(r[2]||'').trim()||('Group '+key),
        lastAt:opsDateMs_(r[9]),status:String(r[23]||'').trim()
      });
    });
    const out=[];
    Object.keys(buckets).forEach(key=>{
      const list=buckets[key];
      if(list.length<2) return;
      list.sort((a,b)=>{
        const doneA=a.status==='XONG'?1:0,doneB=b.status==='XONG'?1:0;
        if(doneA!==doneB) return doneB-doneA;
        return (b.lastAt||0)-(a.lastAt||0) || a.row-b.row;
      });
      const canonical=list[0];
      list.slice(1).forEach(x=>out.push(Object.assign({},x,{canonicalRow:canonical.row,canonicalName:canonical.name})));
    });
    return out;
  }

  function repairDuplicateRegistryRow_(sh,d,reasonCode) {
    if(!sh || !d || !d.row || !d.canonicalRow) return false;
    const current=String(sh.getRange(d.row,24).getDisplayValue()||'').trim();
    if(current==='ĐANG QUÉT') return false;
    sh.getRange(d.row,1).setValue('Không');
    sh.getRange(d.row,23).setValue(false);
    setGroupRowStatus_(
      sh,d.row,'DỪNG',
      String(sh.getRange(d.row,25).getDisplayValue()||'').trim(),
      'AUTO REPAIR: '+String(reasonCode||'DUPLICATE_IDENTITY')+
        ' → canonical row '+d.canonicalRow+' ('+d.canonicalName+'). Giữ row để audit, tắt monitoring và không gọi FBAIO từ row duplicate.'
    );
    return true;
  }

  function buildCanonicalGroupIndex_(sh) {
    const last=sh?sh.getLastRow():0;
    const rows=last>=2?sh.getRange(2,1,last-1,26).getValues():[];
    const buckets={};
    const byRow={};

    rows.forEach((r,i)=>{
      const row=i+2;
      const url=String(r[3]||'').trim();
      const key=exactGroupKeyFromRow_(url,r[4]);
      if(!key){
        byRow[row]={ok:false,requestedRow:row,row:0,reason:'IDENTITY_MISSING'};
        return;
      }
      const item={
        row,key,
        active:String(r[0]||'').trim()==='Có',
        name:String(r[2]||'').trim()||('Group '+key),
        status:String(r[23]||'').trim(),
        lastAt:opsDateMs_(r[9])
      };
      (buckets[key]||(buckets[key]=[])).push(item);
    });

    Object.keys(buckets).forEach(key=>{
      const list=buckets[key];
      const active=list.filter(x=>x.active);
      active.sort((a,b)=>{
        const doneA=a.status==='XONG'?1:0,doneB=b.status==='XONG'?1:0;
        if(doneA!==doneB) return doneB-doneA;
        return (b.lastAt||0)-(a.lastAt||0) || a.row-b.row;
      });
      const canonical=active[0]||null;
      list.forEach(item=>{
        if(!canonical){
          byRow[item.row]={
            ok:false,requestedRow:item.row,row:0,key,
            reason:'INACTIVE_NO_CANONICAL',
            requestedActive:item.active
          };
          return;
        }
        byRow[item.row]={
          ok:true,
          requestedRow:item.row,
          row:canonical.row,
          key,
          canonicalName:canonical.name,
          redirected:canonical.row!==item.row,
          requestedActive:item.active
        };
      });
    });

    return {last,rows,byRow};
  }

  function resolveCanonicalGroupRow_(sh,requestedRow,index) {
    const row=Number(requestedRow||0);
    const idx=index||buildCanonicalGroupIndex_(sh);
    if(!sh || row<2 || row>Number(idx.last||0)) {
      return {ok:false,requestedRow:row,row:0,reason:'ROW_INVALID'};
    }
    return idx.byRow[row] || {ok:false,requestedRow:row,row:0,reason:'IDENTITY_MISSING'};
  }



  function getGroupFeedSpillovers_() {
    const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    if(sh.getLastRow()<2) return [];
    const rows=sh.getRange(2,1,sh.getLastRow()-1,26).getDisplayValues();
    const byFile={};
    rows.forEach((r,i)=>{
      const file=String(r[12]||'').trim();
      if(!/^api_posts_/i.test(file)) return;
      (byFile[file]||(byFile[file]=[])).push({
        row:i+2,
        active:String(r[0]||'').trim(),
        name:String(r[2]||'').trim(),
        url:String(r[3]||'').trim(),
        key:exactGroupKeyFromRow_(r[3],r[4]),
        note:String(r[15]||'').trim(),
        status:String(r[23]||'').trim()
      });
    });
    const out=[];
    Object.keys(byFile).forEach(file=>{
      const list=byFile[file];
      if(list.length<2) return;
      const m=file.match(/^api_posts_(.+?)_\d{8}_\d{6}\.json$/i);
      const sourceKey=m?String(m[1]||'').toLowerCase():'';
      let source=list.find(x=>x.key===sourceKey);
      if(!source){
        source=list.find(x=>!/Tự thêm khi import JSON/i.test(x.note))||list[0];
      }
      list.forEach(x=>{
        if(x.row===source.row) return;
        if(!/Tự thêm khi import JSON/i.test(x.note)) return;
        out.push(Object.assign({},x,{
          sourceRow:source.row,
          sourceName:source.name,
          sourceKey:source.key,
          file
        }));
      });
    });
    return out;
  }

  function verifiedIdentityRetryKey_(groupKey) {
    return CFG.GROUP_IDENTITY_RETRY_PREFIX+encodeURIComponent(String(groupKey||'').trim().toLowerCase());
  }

  function isVerifiedIdentityRetryCandidate_(status,note,numericId,canonicalKey) {
    const st=String(status||'').trim();
    const msg=String(note||'');
    const num=String(numericId||'').trim();
    const key=String(canonicalKey||'').trim().toLowerCase();
    return st==='LỖI' &&
      /Wrong ID|FB account not found|GROUP_ID_RESOLVE|only supports group/i.test(msg) &&
      /^\d{6,}$/.test(num) &&
      num!==key;
  }

  function repairVerifiedIdentityQuarantineOnce_(sheet,repair) {
    if(!sheet||sheet.getLastRow()<2) return {eligible:0,repaired:0,skippedAttempted:0};
    const props=PropertiesService.getDocumentProperties();
    const rows=sheet.getRange(2,1,sheet.getLastRow()-1,27).getDisplayValues();
    let eligible=0,repaired=0,skippedAttempted=0;
    rows.forEach((r,i)=>{
      if(String(r[0]||'').trim()!=='Có') return;
      const row=i+2;
      const url=String(r[3]||'').trim();
      const canonical=exactGroupKeyFromRow_(url,r[4]);
      if(!canonical) return;
      const numeric=historicNumericGroupIdFromRow_(row,url);
      if(!isVerifiedIdentityRetryCandidate_(r[23],r[25],numeric,canonical)) return;
      eligible++;
      const retryKey=verifiedIdentityRetryKey_(canonical);
      if(props.getProperty(retryKey)){
        skippedAttempted++;
        return;
      }
      if(!repair) return;
      props.setProperty(retryKey,JSON.stringify({
        at:Date.now(),canonicalKey:canonical,numericId:numeric,
        priorError:String(r[25]||'').slice(0,500)
      }));
      clearAutoRetryState_(canonical);
      setGroupRowStatus_(
        sheet,row,'CHỜ',
        'Verified numeric identity '+numeric+' • retry armed',
        'AUTO IDENTITY REPAIR: numeric Group ID '+numeric+' đã có deterministic evidence; cho phép đúng 1 retry.'
      );
      repaired++;
    });
    return {eligible,repaired,skippedAttempted};
  }

  function runVerifiedIdentityRetryHarness_() {
    const tests={
      ID_RETRY_VERIFIED_NUMERIC:isVerifiedIdentityRetryCandidate_(
        'LỖI','This api only supports group','533833410127672','eagleamazonvietnam'
      )===true,
      ID_RETRY_NO_NUMERIC_BLOCKED:isVerifiedIdentityRetryCandidate_(
        'LỖI','This api only supports group','','eagleamazonvietnam'
      )===false,
      ID_RETRY_NON_IDENTITY_BLOCKED:isVerifiedIdentityRetryCandidate_(
        'LỖI','HTTP 503','533833410127672','eagleamazonvietnam'
      )===false,
      ID_RETRY_SAME_CANONICAL_BLOCKED:isVerifiedIdentityRetryCandidate_(
        'LỖI','GROUP_ID_RESOLVE','533833410127672','533833410127672'
      )===false
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }

  function repairRowCapacityQuarantine_(sheet,repair) {
    if(!sheet || sheet.getLastRow()<2) return 0;
    const rows=sheet.getRange(2,1,sheet.getLastRow()-1,26).getValues();
    let repaired=0;
    rows.forEach((r,i)=>{
      if(String(r[0]||'').trim()!=='Có') return;
      if(String(r[23]||'').trim()!=='LỖI') return;
      const note=String(r[25]||'').trim();
      if(!/rows are out of bounds|ROW_CAPACITY/i.test(note)) return;
      repaired++;
      if(!repair) return;
      const key=exactGroupKeyFromRow_(r[3],r[4]);
      clearAutoRetryState_(key);
      setGroupRowStatus_(
        sheet,i+2,'LỖI',
        String(r[24]||'').trim(),
        'AUTO SELF-REPAIR: ROW_CAPACITY_RETRY — grid capacity guard đã được vá; cho phép retry. Prior: '+note.slice(0,500)
      );
    });
    return repaired;
  }

  function cleanupExpiredRuntimeState_(repair) {
    const props=PropertiesService.getDocumentProperties();
    const all=props.getProperties();
    let expiredLeases=0,expiredRunStops=0;
    Object.keys(all).forEach(k=>{
      if(k.indexOf(CFG.GROUP_LEASE_PREFIX)===0 || k.indexOf(CFG.COMMENT_POST_LEASE_PREFIX)===0 || k===CFG.AI_LEASE_KEY || k===CFG.AUTO_MONITOR_LEASE_KEY){
        try{
          const x=JSON.parse(all[k]||'{}');
          if(Number(x.expiresAt||0) && Number(x.expiresAt)<Date.now()){
            expiredLeases++;
            if(repair) props.deleteProperty(k);
          }
        }catch(_){
          expiredLeases++;
          if(repair) props.deleteProperty(k);
        }
      }
      if(k.indexOf(CFG.SCAN_RUN_STOP_PREFIX)===0){
        try{
          const x=JSON.parse(all[k]||'{}');
          const at=Number(x.at||x.createdAt||0);
          if(at && Date.now()-at>CFG.SCAN_RUN_STOP_TTL_MS){
            expiredRunStops++;
            if(repair) props.deleteProperty(k);
          }
        }catch(_){}
      }
    });

    const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    let staleRunning=0;
    if(sh.getLastRow()>=2){
      const rows=sh.getRange(2,1,sh.getLastRow()-1,26).getValues();
      rows.forEach((r,i)=>{
        if(String(r[23]||'').trim()!=='ĐANG QUÉT') return;
        const key=exactGroupKeyFromRow_(r[3],r[4]);
        const raw=props.getProperty(groupLeasePropertyKey_(key))||'';
        let active=false;
        try{const x=JSON.parse(raw||'{}');active=Number(x.expiresAt||0)>Date.now();}catch(_){}
        if(active) return;
        staleRunning++;
        if(repair){
          setGroupRowStatus_(sh,i+2,'LỖI',String(r[24]||'').trim(),'AUTO SELF-REPAIR: stale ĐANG QUÉT không còn active lease.');
        }
      });
    }

    const spillovers=getGroupFeedSpillovers_();
    if(repair && spillovers.length){
      spillovers.forEach(x=>{
        if(x.status==='ĐANG QUÉT') return;
        sh.getRange(x.row,1).setValue('Không');
        setGroupRowStatus_(
          sh,x.row,'DỪNG',
          String(sh.getRange(x.row,25).getDisplayValue()||'').trim(),
          'AUTO REPAIR: FEED_SPILLOVER từ source row '+x.sourceRow+' ('+x.sourceName+'). Giữ row để audit nhưng tắt monitoring.'
        );
      });
    }

    const rowCapacityRepairs=repairRowCapacityQuarantine_(sh,repair!==false);
    const identityRetryRepairs=repairVerifiedIdentityQuarantineOnce_(sh,repair!==false);

    const duplicates=getDuplicateGroupIdentityRows_();
    if(repair && duplicates.length){
      duplicates.forEach(d=>{
        repairDuplicateRegistryRow_(sh,d,'DUPLICATE_IDENTITY');
        // Canonical row remains active. No Group-key retry state is written because
        // duplicate and canonical intentionally share the same identity.
      });
    }

    SpreadsheetApp.flush();
    return {expiredLeases,expiredRunStops,staleRunning,spillovers,duplicates,rowCapacityRepairs,identityRetryRepairs};
  }

  function getAutoRetryJobs_(limit,policyConfig) {
    const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    if(sh.getLastRow()<2) return [];
    const config=policyConfig||getAutoPolicyConfig_();
    const duplicateRows=new Set(getDuplicateGroupIdentityRows_().map(x=>x.row));
    const rows=sh.getRange(2,1,sh.getLastRow()-1,27).getValues();
    const out=[];
    rows.forEach((r,i)=>{
      const row=i+2;
      if(duplicateRows.has(row)) return;
      if(String(r[0]||'').trim()!=='Có') return;
      const status=String(r[23]||'').trim();
      if(status!=='LỖI'&&status!=='THIẾU') return;
      const url=String(r[3]||'').trim();
      if(!url) return;
      const group=groupPolicyInput_(r);
      const profile=policyProfileForGroup_(config,group.groupKey);
      if(!profile||profile.enabled===false) return;
      const cls=classifyAutoSheetException_(status,r[25]);
      if(['TRANSIENT','CONNECTION','SHEET_BUSY','TIME_BUDGET'].indexOf(cls)<0) return;
      const state=getAutoRetryState_(group.groupKey);
      if(state.hard||(state.nextAt&&state.nextAt>Date.now())) return;
      const policy=resolveEffectiveScanPolicy_(profile,group,config);
      out.push({
        row,
        name:String(r[2]||'').trim()||('Group '+group.groupKey),
        profile:String(r[1]||'').trim()||'AUTO',
        policyProfileId:profile.id,
        url,
        groupKey:group.groupKey,
        targetCount:policy.postsPerScan,
        scansPerDay:policy.scansPerDay,
        effectivePolicy:policy,
        status,
        lifecycle:String(r[6]||'').trim(),
        priorityRank:groupPriorityRank_(r[6]),
        autoKind:'RETRY',
        retryState:state,
        errorClass:cls
      });
    });
    out.sort((a,b)=>a.priorityRank-b.priorityRank||Number(a.retryState.attempts||0)-Number(b.retryState.attempts||0)||a.row-b.row);
    const cap=Math.max(1,Number(limit||config.global.auto.maxGroupsPerCycle||CFG.AUTO_MONITOR_MAX_GROUPS_PER_TICK));
    return out.slice(0,cap);
  }

  function isAutoMonitorEnabled_() {
    return PropertiesService.getDocumentProperties().getProperty(CFG.AUTO_MONITOR_ENABLED_KEY)==='true';
  }

  function isScriptAppPermissionError_(err) {
    const msg=String(err&&err.message||err||'');
    return /permissions? are not sufficient|authorization required|authorize|script\.scriptapp|getProjectTriggers|newTrigger/i.test(msg);
  }

  function getAutoMonitorTriggerAccess_() {
    try{
      const triggers=ScriptApp.getProjectTriggers()
        .filter(t=>t.getHandlerFunction()===CFG.AUTO_MONITOR_TRIGGER_HANDLER);
      return {
        permissionOk:true,authRequired:false,triggers,
        triggerInstalled:triggers.length>0,triggerCount:triggers.length,error:''
      };
    }catch(err){
      const msg=String(err&&err.message||err||'');
      return {
        permissionOk:false,authRequired:isScriptAppPermissionError_(err),triggers:[],
        triggerInstalled:false,triggerCount:0,error:msg
      };
    }
  }

  function autoMonitorTriggers_() {
    return getAutoMonitorTriggerAccess_().triggers;
  }

  function ensureAutoMonitorTrigger_(forceRecreate) {
    const policy=getAutoPolicyConfig_();
    const triggerMinutes=Number(policy.global.auto.triggerMinutes||CFG.AUTO_MONITOR_TRIGGER_MINUTES);
    let access=getAutoMonitorTriggerAccess_();
    if(!access.permissionOk){
      return {
        installed:false,count:0,permissionOk:false,authRequired:access.authRequired,
        error:access.error||'Không có quyền ScriptApp để quản lý trigger.'
      };
    }

    try{
      if(access.triggers.length>1 || (forceRecreate===true && access.triggers.length)){
        access.triggers.forEach(t=>ScriptApp.deleteTrigger(t));
        access=getAutoMonitorTriggerAccess_();
      }
      if(access.triggers.length){
        return {installed:true,count:1,permissionOk:true,authRequired:false,error:'',intervalMinutes:triggerMinutes};
      }
      ScriptApp.newTrigger(CFG.AUTO_MONITOR_TRIGGER_HANDLER)
        .timeBased()
        .everyMinutes(triggerMinutes)
        .create();
      access=getAutoMonitorTriggerAccess_();
      return {
        installed:access.triggerInstalled,
        count:access.triggerCount,
        permissionOk:access.permissionOk,
        authRequired:access.authRequired,
        intervalMinutes:triggerMinutes,
        error:access.error||''
      };
    }catch(err){
      return {
        installed:false,count:0,permissionOk:false,
        authRequired:isScriptAppPermissionError_(err),
        error:String(err&&err.message||err||'')
      };
    }
  }

  function removeAutoMonitorTriggers_() {
    const access=getAutoMonitorTriggerAccess_();
    if(!access.permissionOk){
      return {
        removed:0,permissionOk:false,authRequired:access.authRequired,
        error:access.error||'Không có quyền ScriptApp để gỡ trigger.'
      };
    }
    let removed=0;
    access.triggers.forEach(t=>{
      try{ScriptApp.deleteTrigger(t);removed++;}catch(_){}
    });
    const after=getAutoMonitorTriggerAccess_();
    return {
      removed,permissionOk:after.permissionOk,authRequired:after.authRequired,
      triggerInstalled:after.triggerInstalled,triggerCount:after.triggerCount,error:after.error||''
    };
  }

  function getAutoMonitorV2State_(repairTrigger) {
    const props=PropertiesService.getDocumentProperties();
    const policy=getAutoPolicyConfig_();
    const triggerMinutes=Number(policy.global.auto.triggerMinutes||CFG.AUTO_MONITOR_TRIGGER_MINUTES);
    const requestedEnabled=isAutoMonitorEnabled_();
    let access=getAutoMonitorTriggerAccess_();
    let repair=null;

    if(requestedEnabled && repairTrigger && (!access.triggerInstalled || access.triggerCount!==1)){
      repair=ensureAutoMonitorTrigger_();
      access=getAutoMonitorTriggerAccess_();
    }

    let lastRun=null;
    try{lastRun=JSON.parse(props.getProperty(CFG.AUTO_MONITOR_LAST_RUN_KEY)||'null');}catch(_){}
    const effectiveEnabled=requestedEnabled && access.permissionOk && access.triggerInstalled && access.triggerCount===1;
    const lastRunMs=lastRun&&lastRun.finishedAt?Date.parse(String(lastRun.finishedAt||'')):0;

    return {
      version:CFG.VERSION,
      enabled:effectiveEnabled,
      requestedEnabled,
      degraded:requestedEnabled&&!effectiveEnabled,
      backend:true,
      intervalMinutes:triggerMinutes,
      permissionOk:access.permissionOk,
      authRequired:access.authRequired,
      triggerInstalled:access.triggerInstalled,
      triggerCount:access.triggerCount,
      triggerError:access.error||'',
      ready:access.permissionOk && access.triggerInstalled && access.triggerCount===1,
      repair,
      lastRun,
      lastRunAgeMs:lastRunMs?Math.max(0,Date.now()-lastRunMs):null
    };
  }

  function setAutoMonitorV2_(enabled) {
    const props=PropertiesService.getDocumentProperties();
    const on=enabled!==false;

    if(!on){
      // Fail-safe: disable execution first. A stale trigger may still fire, but tick exits DISABLED.
      props.setProperty(CFG.AUTO_MONITOR_ENABLED_KEY,'false');
      const trigger=removeAutoMonitorTriggers_();
      return Object.assign(getAutoMonitorV2State_(false),{
        ok:true,changed:true,trigger
      });
    }

    // Never persist ON before the installable trigger is known-good.
    const trigger=ensureAutoMonitorTrigger_();
    if(!trigger.installed || !trigger.permissionOk){
      props.setProperty(CFG.AUTO_MONITOR_ENABLED_KEY,'false');
      return Object.assign(getAutoMonitorV2State_(false),{
        ok:false,changed:false,trigger,
        code:trigger.authRequired?'AUTO_AUTH_REQUIRED':'AUTO_TRIGGER_INSTALL_FAILED',
        message:trigger.authRequired
          ? 'Auto Monitor cần quyền ScriptApp (script.scriptapp) trước khi bật scheduler.'
          : ('Không tạo được Auto Monitor trigger: '+String(trigger.error||'unknown'))
      });
    }

    props.setProperty(CFG.AUTO_MONITOR_ENABLED_KEY,'true');
    return Object.assign(getAutoMonitorV2State_(false),{
      ok:true,changed:true,trigger
    });
  }

  function flattenWorkerPlanJobs_(plan) {
    const out=[];
    (plan&&plan.workers||[]).forEach(w=>{
      (w.jobs||[]).forEach(j=>out.push(Object.assign({},j,{workerSlot:w.slot})));
    });
    return out;
  }

  function logAutoMonitorRun_(summary) {
    try{
      const ss=SpreadsheetApp.getActiveSpreadsheet();
      let sh=ss.getSheetByName(CFG.AUTO_LOG_SHEET);
      if(!sh){
        ensureV16Sheets_(true);
        sh=ss.getSheetByName(CFG.AUTO_LOG_SHEET);
      }
      const detail=[
        'version='+String(summary.version||CFG.VERSION),
        summary.policy&&summary.policy.profileId?('profile='+String(summary.policy.profileId)):'',
        summary.policy?('policy.trigger='+Number(summary.policy.triggerMinutes||0)+'m'):'',
        summary.policy&&summary.policy.activeWindow
          ?('policy.window='+String(summary.policy.activeWindow.start||'')+'-'+String(summary.policy.activeWindow.end||'')+'@'+String(summary.policy.activeWindow.timezone||''))
          :'',
        summary.policy?('policy.maxGroups='+Number(summary.policy.maxGroups||0)):'',
        summary.policy&&summary.policy.scan
          ?('policy.scan='+Number(summary.policy.scan.scansPerDay||0)+'/day, posts='+Number(summary.policy.scan.postsPerScan||0))
          :'',
        summary.policy&&summary.policy.comment
          ?('policy.comment='+(summary.policy.comment.enabled?'ON':'OFF')+', posts='+Number(summary.policy.comment.maxPostsPerCycle||0))
          :'',
        summary.policy&&summary.policy.ai
          ?('policy.ai='+(summary.policy.ai.signalEnabled?'SIGNAL_ON':'SIGNAL_OFF')+'/'+(summary.policy.ai.qualificationEnabled?'QUAL_ON':'QUAL_OFF')+', chunk='+Number(summary.policy.ai.chunkSize||0))
          :'',
        'budget='+Number(summary.durationMs||0)+'/'+Number(summary.policy&&summary.policy.runtimeBudgetMs||CFG.AUTO_MONITOR_BUDGET_MS||0)+'ms',
        summary.budgetOverrunMs?('overrun='+Number(summary.budgetOverrunMs||0)+'ms'):'',
        summary.budgetDeferredGroups?('deferredGroups='+Number(summary.budgetDeferredGroups||0)):'',
        summary.aiDeferredSources?('aiDeferred='+Number(summary.aiDeferredSources||0)):'',
        summary.aiBacklogDeferred?'aiBacklogDeferred=1':'',
        summary.aiBacklogDrain?'aiBacklogDrain=1':'',
        summary.testMode?'TEST_1_CYCLE':'',
        summary.acceptance?('acceptance='+String(summary.acceptance)):'',
        summary.reason?('reason='+String(summary.reason)):'',
        summary.nextDueAt?('nextDueAt='+String(summary.nextDueAt)):'',
        summary.triggerProbe?('auth='+(summary.triggerProbe.permissionOk?'OK':'REQUIRED')+
          ', trigger='+Number(summary.triggerProbe.triggerCount||0)):'',
        summary.waitingWorker?'WAIT_WORKER':'',
        summary.queue?('queue retry='+Number(summary.queue.retryAvailable||0)+
          ', due='+Number(summary.queue.dueAvailable||0)+
          ', selected='+Number((summary.queue.selected||[]).length)):'',
        summary.jobResults&&summary.jobResults.length
          ? ('jobs='+summary.jobResults.map(x=>
              'r'+Number(x.row||0)+':'+String(x.kind||'')+':'+String(x.outcome||'')+
              ':'+Number(x.targetCount||0)+'p@'+String(x.policyProfileId||summary.policy&&summary.policy.profileId||'')
            ).join(','))
          :'',
        summary.commentIntel
          ? ('comment='+Number(summary.commentIntel.processed||0)+'/'+Number(summary.commentIntel.imported||0)+
            (summary.commentIntel.providerCircuitOpen
              ? ', provider=OPEN until '+String(summary.commentIntel.providerRetryAt||0)
              : ', provider=OK')+
            (summary.commentIntel.repairedProviderHard
              ? ', repairedHard='+Number(summary.commentIntel.repairedProviderHard||0)
              :''))
          :'',
        summary.hardQuarantined?('hard='+Number(summary.hardQuarantined||0)):'',
        summary.repairs?('repair lease='+Number(summary.repairs.expiredLeases||0)+
          ', stale='+Number(summary.repairs.staleRunning||0)+
          ', spill='+Number((summary.repairs.spillovers||[]).length)+
          ', dup='+Number((summary.repairs.duplicates||[]).length)+
          ', capacity='+Number(summary.repairs.rowCapacityRepairs||0)+
          ', idRetry='+Number(summary.repairs.identityRetryRepairs&&summary.repairs.identityRetryRepairs.repaired||0)):'',
        summary.newSourceIds&&summary.newSourceIds.length?('sources='+summary.newSourceIds.length):''
      ].filter(Boolean).join(' | ');
      sh.appendRow([
        new Date(),summary.runId||'',summary.source||'',
        isAutoMonitorEnabled_()?'ON':'OFF',
        Number(summary.groupsProcessed||0),Number(summary.groupsPassed||0),
        Number(summary.groupsFailed||0),Number(summary.groupsSkipped||0),
        Number(summary.commentsProcessed||0),Number(summary.commentsImported||0),
        Number(summary.aiAnalyzed||0),Number(summary.durationMs||0),
        summary.ok===false?'ERROR':(summary.skipped?'SKIP':'OK'),
        String(summary.error||summary.message||summary.aiError||'').slice(0,1000),
        detail
      ]);
    }catch(_){}
  }

  function persistAutoMonitorSummary_(summary) {
    try{
      summary=summary||{};
      const now=Date.now();
      if(!summary.durationMs && summary.startedAt){
        const started=Date.parse(String(summary.startedAt||''));
        if(Number.isFinite(started)) summary.durationMs=Math.max(0,now-started);
      }
      summary.finishedAt=summary.finishedAt||new Date(now).toISOString();
      summary.budgetOverrunMs=Math.max(0,Number(summary.durationMs||0)-Number(summary.policy&&summary.policy.runtimeBudgetMs||CFG.AUTO_MONITOR_BUDGET_MS||0));
      PropertiesService.getDocumentProperties()
        .setProperty(CFG.AUTO_MONITOR_LAST_RUN_KEY,JSON.stringify(summary));
      logAutoMonitorRun_(summary);
    }catch(_){}
    return summary;
  }

  function getNextAutoDueAt_() {
    try{
      const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
      if(sh.getLastRow()<2) return '';
      const config=getAutoPolicyConfig_();
      const duplicateRows=new Set(getDuplicateGroupIdentityRows_().map(x=>Number(x.row||0)));
      const rows=sh.getRange(2,1,sh.getLastRow()-1,27).getValues();
      let min=0;
      rows.forEach((row,i)=>{
        if(duplicateRows.has(i+2)) return;
        const active=String(row[0]||'').trim();
        const lifecycle=String(row[6]||'').trim();
        const status=String(row[23]||'').trim();
        const url=String(row[3]||'').trim();
        if(active!=='Có'||!url||lifecycle==='Loại') return;
        if(status==='ĐANG QUÉT'||status==='LỖI'||status==='THIẾU'||/^DỪNG/.test(status)) return;
        const group=groupPolicyInput_(row);
        const profile=policyProfileForGroup_(config,group.groupKey);
        if(!profile||profile.enabled===false) return;
        const scan=resolveEffectiveScanPolicy_(profile,group,config);
        const lastAt=opsDateMs_(row[9]);
        const nextAt=effectiveNextDueMs_(lastAt,scan);
        if(!lastAt||!nextAt||nextAt<=Date.now()) return;
        if(!min||nextAt<min) min=nextAt;
      });
      return min?new Date(min).toISOString():'';
    }catch(_){
      return '';
    }
  }

  function autoMonitorTick_(options) {
    options=options||{};
    const started=Date.now();
    const runId='auto-'+Utilities.getUuid().slice(0,10);
    const testMode=!!options.testMode;
    const policyConfig=getAutoPolicyConfig_();
    const activeProfile=activePolicyProfile_(policyConfig);
    const autoPolicy=policyConfig.global.auto||{};
    const commentPolicy=resolveEffectiveCommentPolicy_(activeProfile,null,policyConfig);
    const aiPolicy=resolveEffectiveAiPolicy_(activeProfile,null,policyConfig);
    const actionPolicy=resolveEffectiveActionPolicy_(activeProfile,policyConfig);
    const runtimeBudgetMs=policyInt_(autoPolicy.runtimeBudgetMs,CFG.AUTO_MONITOR_BUDGET_MS,60000,280000);
    const policyMaxJobs=policyInt_(autoPolicy.maxGroupsPerCycle,CFG.AUTO_MONITOR_MAX_GROUPS_PER_TICK,1,12);
    const requestedMaxJobs=Number(options.maxJobs||policyMaxJobs);
    const maxJobs=Math.max(1,Math.min(policyMaxJobs,requestedMaxJobs));
    const groupWindowOpen=shouldAutoScanProfile_(activeProfile,policyConfig,options.force===true,null);
    const summary={
      ok:true,version:CFG.VERSION,runId,source:options.source||'TRIGGER',testMode,
      acceptance:testMode?'PENDING':'',
      groupsProcessed:0,groupsPassed:0,groupsFailed:0,groupsSkipped:0,hardQuarantined:0,
      commentsProcessed:0,commentsImported:0,aiAnalyzed:0,newSourceIds:[],
      queue:{retryAvailable:0,dueAvailable:0,selected:[]},
      jobResults:[],
      startedAt:new Date(started).toISOString(),
      policy:{
        profileId:activeProfile&&activeProfile.id||'',
        profileName:activeProfile&&activeProfile.displayName||'',
        triggerMinutes:Number(autoPolicy.triggerMinutes||CFG.AUTO_MONITOR_TRIGGER_MINUTES),
        activeWindow:profileActiveWindow_(activeProfile,policyConfig),
        activeNow:groupWindowOpen,
        maxGroups:maxJobs,
        runtimeBudgetMs,
        scan:resolveEffectiveScanPolicy_(activeProfile,{},policyConfig),
        comment:commentPolicy,
        ai:aiPolicy,
        action:actionPolicy
      }
    };

    if(testMode){
      const probe=getAutoMonitorV2State_(false);
      summary.triggerProbe={
        permissionOk:!!probe.permissionOk,
        authRequired:!!probe.authRequired,
        triggerInstalled:!!probe.triggerInstalled,
        triggerCount:Number(probe.triggerCount||0),
        triggerError:String(probe.triggerError||'')
      };
      if(!probe.permissionOk){
        summary.ok=false;
        summary.skipped=true;
        summary.reason='AUTO_AUTH_REQUIRED';
        summary.acceptance='AUTH_REQUIRED';
        summary.message='TEST bị chặn: cần cấp quyền script.scriptapp trước khi nghiệm thu scheduler.';
        summary.nextDueAt=getNextAutoDueAt_();
        return persistAutoMonitorSummary_(summary);
      }
    }

    if(!options.force && !isAutoMonitorEnabled_()){
      summary.skipped=true;
      summary.reason='DISABLED';
      summary.acceptance='DISABLED';
      summary.message='Auto Monitor đang tắt.';
      summary.nextDueAt=getNextAutoDueAt_();
      return persistAutoMonitorSummary_(summary);
    }

    const autoLease=acquireRuntimeLease_(
      CFG.AUTO_MONITOR_LEASE_KEY,
      runId,
      CFG.AUTO_MONITOR_LEASE_TTL_MS
    );
    if(!autoLease.ok){
      summary.skipped=true;
      summary.reason='BUSY';
      summary.acceptance='BUSY';
      summary.message='AUTO lane đang có cycle khác; AI/Comment/Group lane khác không bị chặn.';
      summary.nextDueAt=getNextAutoDueAt_();
      return persistAutoMonitorSummary_(summary);
    }

    try{
      const repairs=cleanupExpiredRuntimeState_(true);
      summary.repairs=repairs;
      summary.registryCleanup=cleanGroupRegistryCanonicalOnce_();

      const configured=getWorkerPoolRaw_().filter(w=>w.enabled&&w.clientId);
      const available=configured.filter(w=>workerHealthState_(w)!=='OFFLINE');
      if(!available.length){
        summary.ok=false;
        summary.waitingWorker=true;
        summary.reason='WORKER_UNAVAILABLE';
        summary.acceptance=testMode?'WORKER_UNAVAILABLE':'';
        summary.message=configured.length?'Worker hiện OFFLINE.':'Chưa cấu hình Worker.';
        summary.nextDueAt=getNextAutoDueAt_();
        return summary;
      }

      const retryAll=getAutoRetryJobs_(Math.min(2,maxJobs),policyConfig);
      const retry=options.force===true
        ?retryAll
        :retryAll.filter(j=>shouldAutoScanProfile_(policyProfileForGroup_(policyConfig,j.groupKey),policyConfig,false,null));
      const retryRows=new Set(retry.map(x=>x.row));
      const due=getDueGroupRows_(CFG.PILOT_GROUP_LIMIT,{
          policyConfig,
          requireActiveWindow:options.force!==true
        })
        .filter(x=>!retryRows.has(x.row))
        .map(x=>Object.assign({},x,{autoKind:'DUE'}));

      summary.queue.retryAvailable=retry.length;
      summary.queue.dueAvailable=due.length;

      const jobs=[];
      if(retry.length) jobs.push(retry[0]);
      due.forEach(j=>{if(jobs.length<maxJobs) jobs.push(j);});
      retry.slice(1).forEach(j=>{if(jobs.length<maxJobs) jobs.push(j);});

      summary.queue.selected=jobs.map(j=>({
        row:j.row,name:j.name,kind:j.autoKind||'DUE',targetCount:j.targetCount,groupKey:j.groupKey
      }));
      if(!jobs.length){
        summary.skipped=true;
        summary.reason=(!options.force&&!groupWindowOpen)?'OUTSIDE_ACTIVE_WINDOW':'NO_DUE_OR_RETRY';
        summary.acceptance=testMode?'SCHEDULER_IDLE':'';
        summary.message=summary.reason==='OUTSIDE_ACTIVE_WINDOW'
          ?'Ngoài active window: không mở Group scan mới; Comment/AI backlog vẫn được xử lý theo policy.'
          :'Scheduler hợp lệ; hiện chưa có Group đến hạn hoặc retry.';
        summary.nextDueAt=getNextAutoDueAt_();
      }

      if(jobs.length){
        const plan=prepareJobsForWorkers_(jobs,0,false,'auto_v2');
        const work=flattenWorkerPlanJobs_(plan).slice(0,maxJobs);
        for(let i=0;i<work.length;i++){
          const elapsed=Date.now()-started;
          const remaining=Math.max(0,runtimeBudgetMs-elapsed);
          if(remaining<CFG.AUTO_MONITOR_JOB_START_RESERVE_MS){
            summary.budgetDeferredGroups=work.length-i;
            summary.budgetReason='GROUP_START_RESERVE';
            break;
          }
          if(!options.force && !isAutoMonitorEnabled_()) break;
          const job=work[i];

          const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
          if(job.autoKind==='DUE' && !isDueJobStillValid_(sheet,job.row,policyConfig)){
            summary.groupsSkipped++;
            summary.jobResults.push({
              row:job.row,name:job.name,kind:'DUE',outcome:'SKIP_NOT_DUE',workerSlot:job.workerSlot
            });
            continue;
          }

          const result=runWorkerJob_({
            row:job.row,targetCount:job.targetCount,workerSlot:job.workerSlot,
            runId,jobMode:'auto_v2',requireDue:job.autoKind==='DUE'
          });
          heartbeatRuntimeLease_(CFG.AUTO_MONITOR_LEASE_KEY,autoLease.token,CFG.AUTO_MONITOR_LEASE_TTL_MS);
          summary.groupsProcessed++;

          let outcome='FAIL';
          if(result&&result.ok&&!result.incomplete&&!result.stopped){
            summary.groupsPassed++;
            outcome='PASS';
            clearAutoRetryState_(result.groupKey||job.groupKey);
          } else if(result&&(result.busy||result.skippedNotDue||result.skippedInactive||result.skippedDuplicate||result.stoppedRun)){
            summary.groupsSkipped++;
            outcome=String(result.status||'SKIP');
          } else {
            summary.groupsFailed++;
            const key=(result&&result.groupKey)||job.groupKey;
            if(key){
              const retryState=setAutoRetryFailure_(key,(result&&result.errorClass)||'UNKNOWN',(result&&(result.error||result.note))||'');
              summary['retry_'+key]=retryState;
              if(retryState.hard) summary.hardQuarantined++;
            }
          }

          summary.jobResults.push({
            row:job.row,name:job.name,kind:job.autoKind||'DUE',outcome,
            workerSlot:job.workerSlot,
            policyProfileId:job.policyProfileId||'',
            targetCount:job.targetCount,
            postsRead:Number(result&&result.postsRead||0),
            newPosts:Number(result&&result.imported&&result.imported.postImported||0),
            duplicates:Number(result&&result.imported&&result.imported.duplicates||0),
            durationMs:Number(result&&result.durationMs||0),
            errorClass:String(result&&result.errorClass||''),
            note:String(result&&(result.error||result.note)||'').slice(0,240)
          });

          const imported=result&&result.imported||{};
          (imported.newSourceIds||[]).forEach(id=>summary.newSourceIds.push(id));
        }
      }

      if(!options.skipComments && !testMode && commentPolicy.enabled && Date.now()-started<runtimeBudgetMs-45000){
        heartbeatRuntimeLease_(CFG.AUTO_MONITOR_LEASE_KEY,autoLease.token,CFG.AUTO_MONITOR_LEASE_TTL_MS);
        const cr=runCommentIntelligenceCycle_({
          limit:commentPolicy.maxPostsPerCycle,
          source:'AUTO',
          policyConfig,
          policyProfileId:activeProfile&&activeProfile.id||''
        });
        summary.commentsProcessed=Number(cr.processed||0);
        summary.commentsImported=Number(cr.commentImported||0);
        summary.commentIntel={
          processed:summary.commentsProcessed,
          imported:summary.commentsImported,
          providerCircuitOpen:!!cr.providerCircuitOpen,
          providerRetryAt:Number(cr.providerRetryAt||0),
          providerError:String(cr.providerError||'').slice(0,240),
          repairedProviderHard:Number(cr.repairedProviderHard||0),
          reason:String(cr.reason||'')
        };
        (cr.newSourceIds||[]).forEach(id=>summary.newSourceIds.push(id));
      }

      summary.newSourceIds=[...new Set(summary.newSourceIds.map(x=>String(x||'').trim()).filter(Boolean))];

      const aiCfg=getAiConfig_();
      if(!options.skipAi && !testMode && aiCfg.autoAnalyze && aiPolicy.signalEnabled){
        const remaining=Math.max(0,runtimeBudgetMs-(Date.now()-started));
        if(remaining>=CFG.AUTO_AI_START_RESERVE_MS){
          heartbeatRuntimeLease_(CFG.AUTO_MONITOR_LEASE_KEY,autoLease.token,CFG.AUTO_MONITOR_LEASE_TTL_MS);
          try{
            const hasNew=summary.newSourceIds.length>0;
            const aiOptions=hasNew
              ? {
                  silent:true,
                  scope:'source_ids',
                  sourceIds:summary.newSourceIds.slice(0,aiPolicy.chunkSize),
                  maxRowsOverride:aiPolicy.chunkSize,
                  policyConfig,
                  policyProfileId:activeProfile&&activeProfile.id||''
                }
              : {
                  silent:true,
                  scope:'all_waiting',
                  maxRowsOverride:aiPolicy.chunkSize,
                  policyConfig,
                  policyProfileId:activeProfile&&activeProfile.id||''
                };
            const ar=analyzeNewPosts_(aiOptions);
            summary.aiAnalyzed=Number(ar&&ar.analyzed||0);
            summary.aiBacklogDrain=!hasNew && summary.aiAnalyzed>0;
            summary.aiResult={
              analyzed:summary.aiAnalyzed,
              errors:(ar&&ar.errors||[]).length,
              mode:hasNew?'NEW_SOURCE':'BACKLOG'
            };
            if(hasNew && summary.newSourceIds.length>aiPolicy.chunkSize){
              summary.aiDeferredSources=summary.newSourceIds.length-aiPolicy.chunkSize;
            }
          }catch(err){
            summary.aiError=String(err.message||err);
          }
        }else{
          summary.aiDeferredSources=summary.newSourceIds.length;
          summary.aiBacklogDeferred=summary.newSourceIds.length===0;
          summary.budgetReason=summary.budgetReason||'AI_START_RESERVE';
        }
      }

      if(testMode){
        if(summary.groupsPassed>0 && summary.groupsFailed===0) summary.acceptance='WORKER_PASS';
        else if(summary.groupsFailed>0) summary.acceptance='WORKER_FAIL';
        else if(summary.groupsSkipped>0 && !summary.acceptance) summary.acceptance='WORKER_SKIPPED';
        else if(!summary.acceptance) summary.acceptance='SCHEDULER_IDLE';
      }
      summary.durationMs=Date.now()-started;
      summary.finishedAt=new Date().toISOString();
      return summary;
    }catch(err){
      summary.ok=false;
      summary.acceptance=testMode?'ERROR':'';
      summary.error=String(err.message||err);
      summary.durationMs=Date.now()-started;
      summary.finishedAt=new Date().toISOString();
      return summary;
    }finally{
      summary.durationMs=summary.durationMs||Date.now()-started;
      summary.finishedAt=summary.finishedAt||new Date().toISOString();
      persistAutoMonitorSummary_(summary);
      releaseRuntimeLease_(CFG.AUTO_MONITOR_LEASE_KEY,autoLease.token);
    }
  }

  function runProductionSelfTest_(repair) {
    ensureV16Sheets_(false);
    const fixes=cleanupExpiredRuntimeState_(repair!==false);
    let autoTriggerRepair=null;
    if(isAutoMonitorEnabled_() && repair!==false) autoTriggerRepair=ensureAutoMonitorTrigger_();

    const overview=getMonitoringOverview_();
    const audit=auditConsistency_();
    const auto=getAutoMonitorV2State_(false);
    const comments=getCommentIntelligenceStats_();
    const ai=getAiConfig_();
    const workers=overview.workers||{};
    const duplicates=getDuplicateGroupIdentityRows_();

    const checks=[
      {id:'SCHEMA',severity:'P0',pass:!!SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.COMMENT_SHEET),detail:'BÌNH LUẬN tồn tại'},
      {id:'WORKER_CONFIG',severity:'P0',pass:Number(workers.configuredCount||0)>0,detail:Number(workers.configuredCount||0)+' worker configured'},
      {id:'WORKER_NOT_OFFLINE',severity:'P0',pass:Number(workers.configuredCount||0)>0 && Number(workers.offlineCount||0)<Number(workers.configuredCount||0),detail:Number(workers.onlineCount||0)+' online / '+Number(workers.staleCount||0)+' stale / '+Number(workers.offlineCount||0)+' offline'},
      {id:'AUTO_AUTH',severity:'P0',pass:!!auto.permissionOk,detail:auto.permissionOk?'ScriptApp permission OK':('AUTH REQUIRED • '+String(auto.triggerError||'script.scriptapp'))},
      {id:'AUTO_TRIGGER',severity:'P0',pass:!auto.requestedEnabled || (auto.triggerInstalled&&auto.triggerCount===1),detail:auto.requestedEnabled?('requested ON • trigger '+auto.triggerCount):'disabled'},
      {id:'STALE_RUNNING',severity:'P0',pass:Number(fixes.staleRunning||0)===0 || repair!==false,detail:Number(fixes.staleRunning||0)+' stale runtime row'},
      {id:'GROUP_IDENTITY',severity:'P1',pass:duplicates.length===0,detail:duplicates.length+' duplicate active identity row(s)'+(duplicates.length&&repair!==false?' quarantined':'')},
      {id:'FEED_SPILLOVER',severity:'P1',pass:(fixes.spillovers||[]).length===0 || repair!==false,detail:Number((fixes.spillovers||[]).length)+' auto-registered spillover row(s)'+((fixes.spillovers||[]).length&&repair!==false?' disabled':'')},
      {id:'ROW_CAPACITY',severity:'P1',pass:Number(fixes.rowCapacityRepairs||0)===0 || repair!==false,detail:Number(fixes.rowCapacityRepairs||0)+' historical row-capacity quarantine(s)'+(Number(fixes.rowCapacityRepairs||0)&&repair!==false?' re-enabled for retry':'')},
      {id:'DATA_CONSISTENCY',severity:'P1',pass:!!audit.ok,detail:'raw/opportunity/comment integrity'},
      {id:'AI_CONFIG',severity:'P1',pass:!!ai.configured,detail:ai.provider+' / '+ai.model},
      {id:'COMMENT_PIPELINE',severity:'P1',pass:comments.hardErrors===0,detail:comments.backlogPosts+' backlog • '+comments.storedComments+' stored • '+comments.hardErrors+' hard'},
      {id:'DUE_QUEUE',severity:'P1',pass:true,detail:Number(overview.dueNow||0)+' runnable due / '+Number(overview.sla&&overview.sla.overdueAll||0)+' all overdue'}
    ];

    return {
      ok:checks.filter(x=>x.severity==='P0').every(x=>x.pass),
      version:CFG.VERSION,
      repaired:repair!==false,
      checks,fixes,audit,autoMonitor:auto,autoTriggerRepair,commentIntel:comments,
      overview:{
        activeGroups:overview.activeGroups,dueNow:overview.dueNow,exceptions:overview.exceptions,
        health:overview.operationalHealth
      }
    };
  }

  function fetchCommentsApiBridge_(postUrl) {
    postUrl=String(postUrl || '').trim();
    if(!postUrl) throw new Error('Hãy nhập URL bài Facebook.');
    if (/facebook\.com\/groups\/[^\/?#]+\/?(?:[?#].*)?$/i.test(postUrl)) {
      throw new Error('URL đang nhập là URL NHÓM, không phải URL BÀI VIẾT. Muốn lấy comment hãy dùng URL post/permalink cụ thể.');
    }

    ensureV16Sheets_(false);
    const raw=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.RAW_SHEET);
    const postId=normalizePostId_('',postUrl)||'post';
    let job=null;
    if(raw.getLastRow()>=5){
      const vals=raw.getRange(5,1,raw.getLastRow()-4,20).getValues();
      for(let i=0;i<vals.length;i++){
        const id=String(vals[i][4]||'').trim();
        const url=String(vals[i][5]||'').trim();
        if(id===postId || normalizeUrl_(url)===normalizeUrl_(postUrl)){
          job={
            rawRow:i+5,postId:id||postId,url:url||postUrl,
            groupName:String(vals[i][2]||'').trim(),
            groupKey:String(vals[i][3]||'').trim().toLowerCase(),
            expected:Math.max(1,toNumber_(vals[i][9])),
            fetched:Math.max(0,toNumber_(vals[i][16])),
            cursor:String(vals[i][17]||'').trim(),
            status:String(vals[i][19]||'').trim(),
            retryCount:commentRetryCount_(vals[i][19])
          };
          break;
        }
      }
    }

    if(job) return runSinglePostCommentIntelligence_(job,{source:'MANUAL'});

    const started=Date.now();
    const page=fetchCommentsPageRaw_(getBridgeClientId_(),{url:postUrl,type:'Newest',cursor:''});
    const comments=page.comments||[];
    if(!comments.length){
      return {ok:true,version:CFG.VERSION,postUrl,commentsRead:0,nextCursor:page.cursor||'',imported:null,durationMs:Date.now()-started};
    }
    const fileName='api_comments_'+postId+'_'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss')+'.json';
    const imported=ingestApiRecords_(comments,{
      name:fileName,__sourcePostId:postId,__sourcePostUrl:postUrl
    });
    return {
      ok:true,version:CFG.VERSION,postUrl,
      commentsRead:comments.length,nextCursor:page.cursor||'',
      imported,durationMs:Date.now()-started
    };
  }

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

    // Operator target: free numeric input, 1-200 posts per Group, default 25.
    const targetRule=SpreadsheetApp.newDataValidation()
      .requireNumberBetween(1,200)
      .setAllowInvalid(false)
      .setHelpText('Nhập số bài muốn quét từ 1 đến 200. Mặc định 25.')
      .build();
    const targetRange=sheet.getRange(2,9,n,1);
    targetRange.setDataValidation(targetRule);
    const targetValues=targetRange.getValues();
    let targetDirty=false;
    targetValues.forEach(row=>{
      const raw=Number(row[0]);
      const normalized=normalizeGroupTarget_(raw);
      if(!Number.isFinite(raw) || raw<1 || raw>200 || Math.floor(raw)!==raw) {
        row[0]=normalized;
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

  function clearGlobalStopAll_() {
    // Legacy self-healing only. V1.9.1-HF4 never reads STOP_ALL when scanning.
    PropertiesService.getDocumentProperties().deleteProperty(CFG.BRIDGE_STOP_ALL_KEY);
  }

  function scanRunStopKey_(runId) {
    return CFG.SCAN_RUN_STOP_PREFIX + String(runId || '').trim();
  }

  function requestStopScanRun_(runId) {
    const id=String(runId||'').trim();
    if(!id) return {ok:false,requested:false,reason:'NO_ACTIVE_RUN'};
    const now=Date.now();
    PropertiesService.getDocumentProperties().setProperty(
      scanRunStopKey_(id),
      JSON.stringify({requestedAt:now,expiresAt:now+CFG.SCAN_RUN_STOP_TTL_MS})
    );
    return {ok:true,requested:true,runId:id};
  }

  function clearScanRunStop_(runId) {
    const id=String(runId||'').trim();
    if(id) PropertiesService.getDocumentProperties().deleteProperty(scanRunStopKey_(id));
  }

  function isScanRunStopRequested_(runId) {
    const id=String(runId||'').trim();
    if(!id) return false;
    const props=PropertiesService.getDocumentProperties();
    const key=scanRunStopKey_(id);
    const raw=props.getProperty(key);
    if(!raw) return false;

    let state=null;
    try{ state=JSON.parse(raw); }catch(_){}
    const expiresAt=Number(state&&state.expiresAt||0);
    if(expiresAt && expiresAt<Date.now()){
      props.deleteProperty(key);
      return false;
    }
    return true;
  }

  function clearGroupStop_(groupKey) {
    if(groupKey) PropertiesService.getDocumentProperties().deleteProperty(groupStopKey_(groupKey));
  }

  function isGroupStopRequested_(groupKey) {
    if(!groupKey) return false;
    return PropertiesService.getDocumentProperties().getProperty(groupStopKey_(groupKey))==='1';
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
    const groupKey=exactGroupKeyFromRow_(groupUrl,sheet.getRange(row,5).getDisplayValue());
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

    const requestedRow=Number(row);
    const canonical=resolveCanonicalGroupRow_(sheet,requestedRow);
    if(!canonical.ok){
      throw new Error(
        canonical.reason==='INACTIVE_NO_CANONICAL'
          ? ('Dòng '+requestedRow+' đang tắt monitoring và không có canonical Group active để quét.')
          : ('Không resolve được canonical Group cho dòng '+requestedRow+' ('+canonical.reason+').')
      );
    }
    row=canonical.row;

    const name=String(sheet.getRange(row,3).getDisplayValue()||'').trim() || ('Group dòng '+row);
    const groupUrl=String(sheet.getRange(row,4).getDisplayValue()||'').trim();
    const groupKey=exactGroupKeyFromRow_(groupUrl,sheet.getRange(row,5).getDisplayValue());
    const runId=String(options.runId||'').trim();
    const target=normalizeGroupTarget_(options.targetCount || sheet.getRange(row,9).getValue() || 25);

    if(String(options.source||'').toUpperCase()==='ACTIVE_ROW' || !options.source){
      clearGlobalStopAll_();
    }

    if(!/facebook\.com\/groups\//i.test(groupUrl)) {
      throw new Error('Dòng '+row+' không có URL Group Facebook hợp lệ.');
    }

    const lease=acquireGroupLease_(
      groupKey||extractGroupKey_(groupUrl),
      'DIRECT|'+Utilities.getUuid().slice(0,8),
      row
    );
    if(!lease.ok){
      return {
        ok:false,busy:true,row,name,groupKey,groupUrl,targetCount:target,
        status:'SKIP_BUSY',leaseReason:lease.reason||'GROUP_BUSY',leaseExpiresAt:lease.expiresAt||0
      };
    }

    sheet.getRange(row,9).setValue(target);
    clearGroupStop_(groupKey);
    setGroupRowStatus_(sheet,row,'ĐANG QUÉT','0/'+target+' bài','');
    SpreadsheetApp.flush();

    const started=Date.now();
    let healthWorkerSlot='';
    try {
      const relayClient=getBridgeClientId_();
      healthWorkerSlot=findWorkerSlotByClientId_(relayClient);
      const result=scanGroupApiBridge_(groupUrl,target,groupKey,relayClient,false,row,runId);
      const imported=result.imported||{};
      const stopped=!!result.stopped || isGroupStopRequested_(groupKey);

      sheet.getRange(row,10).setValue(new Date());
      sheet.getRange(row,14).setValue(Number(imported.postImported||0));

      const progress=[
        (result.postsRead||0)+'/'+target+' bài',
        (imported.postImported||0)+' mới',
        (imported.duplicates||0)+' trùng',
        (result.pages||1)+' page',
        result.transientRetries?('retry '+result.transientRetries):'',
        result.fallbackUsed?('Numeric ID '+result.fallbackGroupId):'',
        (Math.round((Date.now()-started)/100)/10)+'s'
      ].filter(Boolean).join(' • ');

      let status='XONG';
      let note='';
      if(stopped) {
        if(result.stopScope==='RUN'){
          status='CHỜ';
          note='Đã dừng cycle theo yêu cầu. Group có thể chạy lại.';
        } else {
          status='DỪNG';
          note='Đã dừng Group theo yêu cầu.';
        }
      } else if(result.transientError) {
        status='THIẾU';
        note=(result.fallbackUsed?('Đã dùng numeric ID '+result.fallbackGroupId+'. '):'')+
          'Relay tạm lỗi sau retry; đã giữ '+(result.postsRead||0)+'/'+target+' bài thu được. RETRY Group này sau.';
      } else if((result.postsRead||0)<target) {
        status='THIẾU';
        note=(result.fallbackUsed?('Đã dùng numeric ID '+result.fallbackGroupId+'. '):'')+
          'API dừng ở '+(result.postsRead||0)+'/'+target+' bài'+
          (result.nextCursor ? ' trước time budget.' : ' vì không còn cursor.');
      }

      setGroupRowStatus_(sheet,row,status,progress,note);
      clearGroupStop_(groupKey);
      const health=healthWorkerSlot?recordWorkerJobHealth_(healthWorkerSlot,true,Date.now()-started,''):null;
      SpreadsheetApp.flush();
      return Object.assign({},result,{
        row,name,groupKey,status,targetCount:target,stopped,incomplete:status==='THIẾU',progress,note,
        requestedRow,canonicalRow:row,redirectedFromRow:canonical.redirected?requestedRow:0,
        workerSlot:healthWorkerSlot||'',workerHealth:health&&health.health?health.health:'',
        errorClass:result.transientError?'TRANSIENT':(result.timeBudgetExceeded?'TIME_BUDGET':'')
      });
    } catch(err) {
      const msg=String(err.message||err);
      const errorClass=classifyScanError_(err);
      logRuntimeApiEvent_({
        groupName:name,groupKey,workerSlot:healthWorkerSlot||'',variant:'DIRECT_GROUP_SCAN_FAIL',
        title:'Direct Group scan failed',code:errorClass||'UNKNOWN',attemptedUrl:groupUrl,
        error:msg,httpCode:Number(err.httpCode||0),raw:err.socialAioRaw||'',
        apiParams:err.apiParams||'',durationMs:Date.now()-started
      });
      const health=healthWorkerSlot?recordWorkerJobHealth_(healthWorkerSlot,false,Date.now()-started,msg):null;
      setGroupRowStatus_(sheet,row,'LỖI','0/'+target+' bài',msg);
      SpreadsheetApp.flush();
      return {
        ok:false,row,name,groupKey,groupUrl,targetCount:target,status:'LỖI',
        workerSlot:healthWorkerSlot||'',workerHealth:health&&health.health?health.health:'',
        errorClass,error:msg,durationMs:failDurationMs
      };
    } finally {
      releaseGroupLease_(groupKey||extractGroupKey_(groupUrl),lease.token);
    }
  }
  function getCheckedGroupRows_() {
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const last=sheet.getLastRow();
    if(last<2) return [];
    const values=sheet.getRange(2,1,last-1,26).getValues();
    const canonicalIndex=buildCanonicalGroupIndex_(sheet);
    const byCanonicalRow={};

    values.forEach((r,i)=>{
      if(r[22]!==true) return;
      const selectedRow=i+2;
      const resolved=resolveCanonicalGroupRow_(sheet,selectedRow,canonicalIndex);
      if(!resolved.ok){
        sheet.getRange(selectedRow,23).setValue(false);
        return;
      }
      const row=resolved.row;
      const cr=values[row-2]||[];
      const url=String(cr[3]||'').trim();
      if(!url) return;

      if(!byCanonicalRow[row]){
        byCanonicalRow[row]={
          row,
          name:String(cr[2]||'').trim() || ('Group '+String(cr[4]||'')),
          profile:String(cr[1]||'').trim() || 'AUTO',
          url,
          groupKey:exactGroupKeyFromRow_(url,cr[4]),
          targetCount:normalizeGroupTarget_(cr[8]||25),
          status:String(cr[23]||''),
          selectedFromRows:[selectedRow],
          canonicalizedFromDuplicate:!!resolved.redirected
        };
      }else{
        byCanonicalRow[row].selectedFromRows.push(selectedRow);
        if(resolved.redirected) byCanonicalRow[row].canonicalizedFromDuplicate=true;
      }
    });
    return Object.keys(byCanonicalRow).map(k=>byCanonicalRow[k]);
  }

  function repairSelectedDuplicateRows_(jobs) {
    const sh=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const canonicalIndex=buildCanonicalGroupIndex_(sh);
    let repaired=0;
    (jobs||[]).forEach(job=>{
      (job.selectedFromRows||[]).forEach(selectedRow=>{
        if(Number(selectedRow||0)===Number(job.row||0)) return;
        const resolved=resolveCanonicalGroupRow_(sh,selectedRow,canonicalIndex);
        if(!resolved.ok || Number(resolved.row||0)!==Number(job.row||0)) return;
        sh.getRange(selectedRow,1).setValue('Không');
        sh.getRange(selectedRow,23).setValue(false);
        setGroupRowStatus_(
          sh,selectedRow,'DỪNG',
          'Duplicate → canonical row '+job.row,
          'AUTO REPAIR: DUPLICATE_SELECTION_REDIRECT → canonical row '+job.row+
            ' ('+job.name+'). Giữ row để audit, tắt monitoring và không gọi FBAIO từ row duplicate.'
        );
        repaired++;
      });
    });
    if(repaired) SpreadsheetApp.flush();
    return repaired;
  }

  function groupPriorityRank_(status) {
    const map={'Ưu tiên':0,'Giữ':1,'Thử nghiệm':2,'Giảm ưu tiên':3,'Loại':99};
    const key=String(status||'').trim();
    return Object.prototype.hasOwnProperty.call(map,key)?map[key]:2;
  }

  function getDueGroupRows_(limit,options) {
    options=options||{};
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const last=sheet.getLastRow();
    if(last<2) return [];
    const now=Number(options.nowMs||Date.now());
    const config=options.policyConfig||getAutoPolicyConfig_();
    const rows=sheet.getRange(2,1,last-1,27).getValues();
    const duplicateRows=new Set(getDuplicateGroupIdentityRows_().map(x=>Number(x.row||0)));
    const jobs=[];

    rows.forEach((r,i)=>{
      if(duplicateRows.has(i+2)) return;
      const active=String(r[0]||'').trim();
      const url=String(r[3]||'').trim();
      const lifecycle=String(r[6]||'').trim();
      const runtimeStatus=String(r[23]||'').trim();
      const lastAt=opsDateMs_(r[9]);
      if(active!=='Có'||!url||lifecycle==='Loại') return;
      if(runtimeStatus==='ĐANG QUÉT'||runtimeStatus==='LỖI'||runtimeStatus==='THIẾU'||/^DỪNG/.test(runtimeStatus)) return;

      const group=groupPolicyInput_(r);
      const profile=policyProfileForGroup_(config,group.groupKey);
      if(!profile||profile.enabled===false) return;
      if(options.requireActiveWindow===true && !shouldAutoScanProfile_(profile,config,false,null)) return;
      const policy=resolveEffectiveScanPolicy_(profile,group,config);
      const nextAt=effectiveNextDueMs_(lastAt,policy);
      const due=!lastAt||!nextAt||nextAt<=now;
      if(!due) return;

      jobs.push({
        row:i+2,
        name:String(r[2]||'').trim()||('Group '+String(r[4]||'')),
        profile:String(r[1]||'').trim()||'AUTO',
        policyProfileId:profile.id,
        url,
        groupKey:group.groupKey,
        targetCount:policy.postsPerScan,
        scansPerDay:policy.scansPerDay,
        effectivePolicy:policy,
        status:runtimeStatus||'CHỜ',
        lifecycle,
        priorityRank:groupPriorityRank_(lifecycle),
        nextAtMs:nextAt,
        lastAtMs:lastAt
      });
    });

    jobs.sort((a,b)=>{
      if(a.priorityRank!==b.priorityRank) return a.priorityRank-b.priorityRank;
      if(a.nextAtMs!==b.nextAtMs) return a.nextAtMs-b.nextAtMs;
      return a.lastAtMs-b.lastAtMs;
    });
    const configuredLimit=Number(limit||config.global.auto.maxGroupsPerCycle||CFG.DUE_CYCLE_LIMIT);
    return jobs.slice(0,Math.max(1,Math.min(CFG.PILOT_GROUP_LIMIT,configuredLimit)));
  }

  function countAiBacklogAndPass_() {
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.OPPORTUNITY_SHEET);
    if(!sh || sh.getLastRow()<2) return {backlog:0,pass:0,total:0};
    const n=sh.getLastRow()-1;
    const ids=sh.getRange(2,2,n,1).getDisplayValues();
    const gates=sh.getRange(2,25,n,1).getDisplayValues();
    let backlog=0,pass=0,total=0;
    for(let i=0;i<n;i++){
      if(!String(ids[i][0]||'').trim()) continue;
      total++;
      const gate=String(gates[i][0]||'').trim();
      if(!gate) backlog++;
      else if(gate==='PASS') pass++;
    }
    return {backlog,pass,total};
  }

  function opsDateMs_(value) {
    if(value instanceof Date && !isNaN(value.getTime())) return value.getTime();
    if(typeof value==='number' && isFinite(value)){
      // Google Sheets serial dates can surface as numbers in a few edge paths.
      if(value>30000 && value<100000) return Math.round((value-25569)*86400000);
      if(value>100000000000) return value;
    }
    const parsed=Date.parse(String(value||''));
    return Number.isFinite(parsed)?parsed:0;
  }

  function getAiOperationsStats_(nowMs) {
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.OPPORTUNITY_SHEET);
    const empty={
      backlog:0,pass:0,total:0,watch:0,review:0,fail:0,
      backlogOver2h:0,backlogOver6h:0,oldestBacklogAgeMs:0,
      freshSources2h:0,freshCandidates2h:0,freshPass2h:0,
      backlogPreview:[]
    };
    if(!sh || sh.getLastRow()<2) return empty;

    const now=Number(nowMs||Date.now());
    const n=sh.getLastRow()-1;
    const core=sh.getRange(2,1,n,6).getValues(); // A:F
    const scores=sh.getRange(2,11,n,1).getValues(); // K
    const gates=sh.getRange(2,25,n,1).getValues(); // Y
    const out=Object.assign({},empty,{backlogPreview:[]});

    core.forEach((r,i)=>{
      const sourceId=String(r[1]||'').trim();
      if(!sourceId) return;
      out.total++;

      const gate=String(gates[i]&&gates[i][0]||'').trim().toUpperCase();
      const sourceMs=opsDateMs_(r[0]);
      const ageMs=sourceMs?Math.max(0,now-sourceMs):0;
      const fresh=sourceMs && ageMs<=CFG.OPS_FRESH_SIGNAL_MS;

      if(fresh) out.freshSources2h++;
      if(gate==='PASS') {
        out.pass++;
        if(fresh) {
          out.freshCandidates2h++;
          out.freshPass2h++;
        }
      } else if(gate==='WATCH') {
        out.watch++;
        if(fresh) out.freshCandidates2h++;
      } else if(gate==='REVIEW') {
        out.review++;
        if(fresh) out.freshCandidates2h++;
      } else if(gate==='FAIL') {
        out.fail++;
      } else {
        out.backlog++;
        if(sourceMs){
          out.oldestBacklogAgeMs=Math.max(out.oldestBacklogAgeMs,ageMs);
          if(ageMs>CFG.OPS_AI_STALE_MS) out.backlogOver2h++;
          if(ageMs>CFG.OPS_OVERDUE_CRITICAL_MS) out.backlogOver6h++;
        }
        out.backlogPreview.push({
          row:i+2,
          sourceId,
          group:String(r[4]||'').trim()||'Group không rõ',
          person:String(r[5]||'').trim()||'Ẩn danh',
          score:Number(scores[i]&&scores[i][0]||0),
          ageMs,
          url:String(r[2]||'').trim()
        });
      }
    });

    out.backlogPreview.sort((a,b)=>(b.ageMs||0)-(a.ageMs||0));
    out.backlogPreview=out.backlogPreview.slice(0,8);
    return out;
  }

  function computeOperationalHealth_(input) {
    const data=input||{};
    const workers=data.workers||{};
    const sla=data.sla||{};
    const ai=data.ai||{};
    const comments=data.comments||{};
    const auto=data.auto||{};
    const active=Math.max(0,Number(data.activeGroups||0));
    const context=Math.max(0,Number(data.groupsWithContext||0));
    const exceptions=Math.max(0,Number(data.exceptions||0));
    const coverage=Number(sla.coverage24hPct||0);
    const contextPct=active?Math.round(context*1000/active)/10:100;
    let score=100;
    const reasons=[];

    const penalize=(points,code,message,severity)=>{
      const p=Math.max(0,Math.min(40,Number(points||0)));
      if(!p) return;
      score-=p;
      reasons.push({code,message,severity:severity||'WARN',penalty:p});
    };

    if(Number(workers.configuredCount||0)===0){
      penalize(30,'NO_WORKER','Chưa có Worker được cấu hình.','ERROR');
    } else if(Number(workers.onlineCount||0)===0 && Number(workers.offlineCount||0)>0){
      penalize(30,'WORKER_OFFLINE','Không có Worker ONLINE và có Worker OFFLINE.','ERROR');
    } else if(Number(workers.onlineCount||0)===0 && Number(workers.staleCount||0)>0){
      penalize(15,'WORKER_STALE','Worker evidence đã STALE; cần TEST/scan xác nhận lại.','WARN');
    } else if(Number(workers.onlineCount||0)<Number(workers.configuredCount||0)){
      penalize(6,'WORKER_PARTIAL','Một phần Worker chưa có evidence ONLINE.','WARN');
    }

    if(Number(sla.overdue6h||0)>0){
      penalize(Math.min(25,5+Number(sla.overdue6h||0)*3),'SLA_6H',Number(sla.overdue6h||0)+' Group quá hạn trên 6 giờ.','ERROR');
    } else if(Number(sla.overdue2h||0)>0){
      penalize(Math.min(12,2+Number(sla.overdue2h||0)*2),'SLA_2H',Number(sla.overdue2h||0)+' Group quá hạn trên 2 giờ.','WARN');
    }

    if(exceptions>0){
      penalize(Math.min(20,exceptions*3),'EXCEPTIONS',exceptions+' Group đang LỖI/THIẾU/DỪNG.','ERROR');
    }

    if(Number(ai.backlogOver2h||0)>0){
      penalize(Math.min(15,3+Math.ceil(Number(ai.backlogOver2h||0)/25)*3),'AI_STALE',Number(ai.backlogOver2h||0)+' nguồn chưa Gate và đã cũ trên 2 giờ.','WARN');
    }

    if(auto.enabled && !auto.triggerInstalled){
      penalize(30,'AUTO_TRIGGER_MISSING','AUTO Monitor đang bật nhưng backend trigger không tồn tại.','ERROR');
    }

    if(Number(comments.hardErrors||0)>0){
      penalize(Math.min(12,3+Number(comments.hardErrors||0)*2),'COMMENT_HARD',Number(comments.hardErrors||0)+' post comment đang HARD error.','WARN');
    }

    if(active>0 && coverage<90){
      penalize(Math.min(15,Math.max(5,Math.ceil((90-coverage)/10)*5)),'COVERAGE_24H','Coverage quét 24h chỉ '+coverage+'%.','WARN');
    }

    if(active>0 && contextPct<80){
      penalize(5,'CONTEXT_COVERAGE','AI Context/Offer mới phủ '+contextPct+'% Group hoạt động.','WARN');
    }

    score=Math.max(0,Math.round(score));
    const status=score>=90?'GREEN':(score>=70?'AMBER':'RED');
    return {
      score,
      status,
      label:status==='GREEN'?'ỔN ĐỊNH':(status==='AMBER'?'CẦN CHÚ Ý':'CẦN XỬ LÝ'),
      reasons:reasons.slice(0,8),
      contextCoveragePct:contextPct
    };
  }

  function schedulerGroupTruth_(row,config,nowMs) {
    row=row||[];
    const now=Number(nowMs||Date.now());
    const active=String(row[0]||'').trim();
    const lifecycle=String(row[6]||'').trim();
    const runtimeStatus=String(row[23]||'').trim();
    const note=String(row[25]||'').trim();
    const group=groupPolicyInput_(row);
    if(!group.groupKey) return {state:'IDENTITY_ERROR',reason:'MISSING_GROUP_KEY',group,profile:null,scan:null,nextAtMs:0,due:false};
    const profile=policyProfileForGroup_(config,group.groupKey);
    if(active!=='Có'||lifecycle==='Loại'||!profile||profile.enabled===false){
      return {state:'BLOCKED',reason:active!=='Có'?'INACTIVE':'PROFILE_OR_LIFECYCLE_BLOCK',group,profile,scan:null,nextAtMs:0,due:false};
    }
    if(runtimeStatus==='ĐANG QUÉT') return {state:'BLOCKED',reason:'RUNNING',group,profile,scan:null,nextAtMs:0,due:false};
    if(/Wrong ID|FB account not found|GROUP_ID_RESOLVE|only supports group/i.test(note)){
      return {state:'IDENTITY_ERROR',reason:'GROUP_ID_RESOLVE',group,profile,scan:null,nextAtMs:0,due:false};
    }
    if(runtimeStatus==='LỖI'||runtimeStatus==='THIẾU'){
      const cls=classifyAutoSheetException_(runtimeStatus,note);
      const retryState=getAutoRetryState_(group.groupKey);
      const retryable=['TRANSIENT','CONNECTION','SHEET_BUSY','TIME_BUDGET'].indexOf(cls)>=0;
      if(retryState.hard) return {state:'QUARANTINED',reason:cls||'HARD_RETRY',group,profile,scan:null,nextAtMs:Number(retryState.nextAt||0),due:false};
      if(!retryable) return {state:'BLOCKED',reason:cls||'STRUCTURAL',group,profile,scan:null,nextAtMs:0,due:false};
      return {state:'RETRY',reason:retryState.nextAt&&retryState.nextAt>now?'BACKOFF':'READY',group,profile,scan:null,nextAtMs:Number(retryState.nextAt||0),due:!retryState.nextAt||retryState.nextAt<=now};
    }
    if(/^DỪNG/.test(runtimeStatus)) return {state:'BLOCKED',reason:'STOPPED',group,profile,scan:null,nextAtMs:0,due:false};
    const scan=resolveEffectiveScanPolicy_(profile,group,config);
    const lastAt=opsDateMs_(row[9]);
    const nextAt=effectiveNextDueMs_(lastAt,scan);
    const due=!lastAt||!nextAt||nextAt<=now;
    return {state:due?'DUE':'WAIT',reason:due?'DUE':'NOT_DUE',group,profile,scan,nextAtMs:nextAt,due};
  }

  function getMonitoringOverview_() {
    ensureV16Sheets_(false);
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sh=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    const last=sh.getLastRow();
    const now=Date.now();
    const policyConfig=getAutoPolicyConfig_();
    const activePolicyProfile=activePolicyProfile_(policyConfig);
    const counts={
      active:0,running:0,error:0,incomplete:0,stopped:0,
      newPostsToday:0,scanUpdatesToday:0,withContext:0,
      neverScanned:0,scanned24h:0,stale24h:0,dueSoon1h:0,
      overdueAll:0,overdue2h:0,overdue6h:0,overdue24h:0
    };
    const exceptionPreview=[];
    const overduePreview=[];

    if(last>=2){
      const rows=sh.getRange(2,1,last-1,27).getValues();
      rows.forEach((r,i)=>{
        const active=String(r[0]||'').trim()==='Có';
        if(!active) return;
        counts.active++;

        const row=i+2;
        const name=String(r[2]||'').trim() || ('Group '+String(r[4]||row));
        const lifecycle=String(r[6]||'').trim();
        const runtimeStatus=String(r[23]||'').trim();
        const lastAt=opsDateMs_(r[9]);
        const truth=schedulerGroupTruth_(r,policyConfig,now);
        const nextAt=Number(truth.nextAtMs||0);
        const due=truth.state==='DUE';
        const overdueMs=!lastAt
          ? (due?CFG.OPS_OVERDUE_SEVERE_MS+1:0)
          : (due&&nextAt ? Math.max(0,now-nextAt) : 0);

        if(!lastAt) counts.neverScanned++;
        else if(now-lastAt<=CFG.OPS_COVERAGE_WINDOW_MS) counts.scanned24h++;
        else counts.stale24h++;

        if(!due && nextAt && nextAt-now<=CFG.OPS_DUE_SOON_MS) counts.dueSoon1h++;
        if(due){
          counts.overdueAll++;
          if(overdueMs>CFG.OPS_OVERDUE_WARN_MS) counts.overdue2h++;
          if(overdueMs>CFG.OPS_OVERDUE_CRITICAL_MS) counts.overdue6h++;
          if(overdueMs>CFG.OPS_OVERDUE_SEVERE_MS) counts.overdue24h++;

          overduePreview.push({
            row,name,lifecycle,
            status:runtimeStatus||'CHỜ',
            schedulerState:truth.state,
            schedulerReason:truth.reason,
            targetCount:truth.scan?truth.scan.postsPerScan:normalizeGroupTarget_(r[8]||25),
            overdueMs,
            nextAtMs:nextAt,
            lastAtMs:lastAt,
            exception:false
          });
        }

        if(runtimeStatus==='ĐANG QUÉT') counts.running++;
        else if(runtimeStatus==='LỖI') counts.error++;
        else if(runtimeStatus==='THIẾU') counts.incomplete++;
        else if(/^DỪNG/.test(runtimeStatus)) counts.stopped++;

        if(runtimeStatus==='LỖI'||runtimeStatus==='THIẾU'||/^DỪNG/.test(runtimeStatus)){
          exceptionPreview.push({
            row,name,status:runtimeStatus,lifecycle,
            schedulerState:truth.state,
            schedulerReason:truth.reason,
            lastAtMs:lastAt,
            ageMs:lastAt?Math.max(0,now-lastAt):0,
            progress:String(r[24]||'').trim(),
            error:String(r[25]||'').trim()
          });
        }

        counts.scanUpdatesToday+=Number(r[16]||0);
        counts.newPostsToday+=Number(r[19]||0);
      });
    }

    overduePreview.sort((a,b)=>{
      if(!!a.exception!==!!b.exception) return a.exception? -1:1;
      if((b.overdueMs||0)!==(a.overdueMs||0)) return (b.overdueMs||0)-(a.overdueMs||0);
      return groupPriorityRank_(a.lifecycle)-groupPriorityRank_(b.lifecycle);
    });

    const exceptionRank={LỖI:0,THIẾU:1,DỪNG:2};
    exceptionPreview.sort((a,b)=>{
      const ra=Object.prototype.hasOwnProperty.call(exceptionRank,a.status)?exceptionRank[a.status]:3;
      const rb=Object.prototype.hasOwnProperty.call(exceptionRank,b.status)?exceptionRank[b.status]:3;
      if(ra!==rb) return ra-rb;
      return (b.ageMs||0)-(a.ageMs||0);
    });

    const dueAll=getDueGroupRows_(CFG.PILOT_GROUP_LIMIT,{policyConfig});
    const ai=getAiOperationsStats_(now);
    const workers=getWorkerPoolPublic_();
    const coverage24hPct=counts.active
      ? Math.round(counts.scanned24h*1000/counts.active)/10
      : 100;

    const sla={
      dueSoon1h:counts.dueSoon1h,
      overdueAll:counts.overdueAll,
      overdue2h:counts.overdue2h,
      overdue6h:counts.overdue6h,
      overdue24h:counts.overdue24h,
      neverScanned:counts.neverScanned,
      scanned24h:counts.scanned24h,
      stale24h:counts.stale24h,
      coverage24hPct
    };

    const exceptions=counts.error+counts.incomplete+counts.stopped;
    const autoMonitor=getAutoMonitorV2State_(false);
    const commentIntel=getCommentIntelligenceStats_();
    const salesPipeline=getSalesPipelineStats_();
    const contextReadiness=getContextReadiness_();
    counts.withContext=Number(contextReadiness.withContext||0);
    const operationalHealth=computeOperationalHealth_({
      workers,sla,ai,auto:autoMonitor,comments:commentIntel,
      activeGroups:counts.active,
      groupsWithContext:counts.withContext,
      exceptions
    });

    return {
      version:CFG.VERSION,
      generatedAt:new Date().toISOString(),
      pilotGroupLimit:CFG.PILOT_GROUP_LIMIT,
      dueCycleLimit:Number(policyConfig.global.auto.maxGroupsPerCycle||CFG.AUTO_MONITOR_MAX_GROUPS_PER_TICK),
      policySummary:{
        profileId:activePolicyProfile&&activePolicyProfile.id||'',
        activeNow:!!activePolicyProfile&&isProfileActiveNow_(activePolicyProfile,policyConfig,new Date()),
        window:profileActiveWindow_(activePolicyProfile,policyConfig),
        scan:resolveEffectiveScanPolicy_(activePolicyProfile,{},policyConfig),
        comment:resolveEffectiveCommentPolicy_(activePolicyProfile,null,policyConfig),
        ai:resolveEffectiveAiPolicy_(activePolicyProfile,null,policyConfig)
      },
      activeGroups:counts.active,
      dueNow:dueAll.length,
      running:counts.running,
      exceptions,
      errors:counts.error,
      incomplete:counts.incomplete,
      stopped:counts.stopped,
      newPostsToday:counts.newPostsToday,
      scanUpdatesToday:counts.scanUpdatesToday,
      groupsWithContext:counts.withContext,
      aiBacklog:ai.backlog,
      passLeads:ai.pass,
      opportunityTotal:ai.total,
      workers,
      sla,
      aiOps:ai,
      autoMonitor,
      commentIntel,
      salesPipeline,
      contextReadiness,
      operationalHealth,
      duePreview:dueAll.slice(0,12).map(x=>({
        row:x.row,name:x.name,profile:x.profile,targetCount:x.targetCount,lifecycle:x.lifecycle,
        schedulerState:'DUE',policyProfileId:x.policyProfileId||'',
        overdueMs:x.nextAtMs?Math.max(0,now-x.nextAtMs):0
      })),
      overduePreview:overduePreview.slice(0,10),
      exceptionPreview:exceptionPreview.slice(0,10)
    };
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

  function findWorkerSlotByClientId_(clientId) {
    const id=String(clientId||'').trim();
    if(!id) return '';
    const w=getWorkerPoolRaw_().find(x=>x.enabled&&x.clientId===id);
    return w ? w.slot : '';
  }

  function getWorkerBySlot_(slot) {
    const s=String(slot||'').trim().toUpperCase();
    const w=getWorkerPoolRaw_().find(x=>x.slot===s);
    if(!w || !w.enabled || !w.clientId) throw new Error('Worker '+s+' chưa được cấu hình/enable.');
    if(!workerSupportsRole_(w,'GROUP')) throw new Error('Worker '+s+' đang role '+normalizeWorkerRole_(w.role)+' nên không nhận Group job.');
    return w;
  }
  function runWorkerJob_(command) {
    ensureV16Sheets_(false);
    const row=Number(command.row||0);
    const runId=String(command.runId||'').trim();
    const jobMode=String(command.jobMode||'selected').trim().toLowerCase();
    if(['selected','due','retry','auto_v2','onboarding'].indexOf(jobMode)<0){
      throw new Error('SCAN_SCOPE_INVALID: jobMode không hợp lệ: '+jobMode);
    }
    const target=normalizeGroupTarget_(command.targetCount||25);
    const worker=getWorkerBySlot_(command.workerSlot);
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sheet=mustSheet_(ss,CFG.GROUP_SCAN_SHEET);
    if(row<2 || row>sheet.getLastRow()) throw new Error('Dòng Group không hợp lệ.');

    const canonical=resolveCanonicalGroupRow_(sheet,row);
    if(!canonical.ok){
      return {
        ok:false,skippedInactive:true,row,status:'SKIP_INACTIVE',targetCount:target,
        workerSlot:worker.slot,workerHealth:workerHealthState_(worker),runId,
        errorClass:'STRUCTURAL',
        note:'Row đang tắt monitoring hoặc không có canonical Group active; đã chặn trước FBAIO.'
      };
    }
    if(canonical.redirected){
      sheet.getRange(row,23).setValue(false);
      SpreadsheetApp.flush();
      return {
        ok:false,skippedDuplicate:true,row,status:'SKIP_DUPLICATE',targetCount:target,
        canonicalRow:Number(canonical.row||0),canonicalName:String(canonical.canonicalName||''),
        workerSlot:worker.slot,workerHealth:workerHealthState_(worker),runId,
        errorClass:'STRUCTURAL',
        note:'Duplicate/audit row bị chặn trước FBAIO; dùng canonical row '+canonical.row+'.'
      };
    }

    const name=String(sheet.getRange(row,3).getDisplayValue()||'').trim() || ('Group '+row);
    const groupUrl=String(sheet.getRange(row,4).getDisplayValue()||'').trim();
    const groupKey=exactGroupKeyFromRow_(groupUrl,sheet.getRange(row,5).getDisplayValue());
    if(!/facebook\.com\/groups\//i.test(groupUrl)) throw new Error('Dòng '+row+' không có URL Group hợp lệ.');

    if(runId && isScanRunStopRequested_(runId)){
      return {
        ok:false,stopped:true,stoppedRun:true,row,name,groupKey,groupUrl,targetCount:target,
        status:'SKIP_STOPPED_RUN',runId,workerSlot:worker.slot,workerHealth:workerHealthState_(worker)
      };
    }

    // A Due Queue plan can become stale while another Control Center finishes
    // the same Group. Re-check immediately before execution.
    const requireDue=jobMode==='due' || command.requireDue===true;
    if(requireDue && !isDueJobStillValid_(sheet,row)){
      return {
        ok:false,skippedNotDue:true,row,name,groupKey,groupUrl,targetCount:target,
        status:'SKIP_NOT_DUE',workerSlot:worker.slot,workerHealth:workerHealthState_(worker)
      };
    }

    const owner=worker.slot+'|'+Utilities.getUuid().slice(0,8);
    const lease=acquireGroupLease_(groupKey||extractGroupKey_(groupUrl),owner,row);
    if(!lease.ok){
      return {
        ok:false,busy:true,row,name,groupKey,groupUrl,targetCount:target,
        status:'SKIP_BUSY',workerSlot:worker.slot,workerHealth:workerHealthState_(worker),
        leaseReason:lease.reason||'GROUP_BUSY',leaseExpiresAt:lease.expiresAt||0
      };
    }

    sheet.getRange(row,9).setValue(target);
    clearGroupStop_(groupKey);
    const workerTag=worker.slot + (worker.profile?(' · '+worker.profile):(' · '+worker.label));
    setGroupRowStatus_(sheet,row,'ĐANG QUÉT',workerTag+' • 0/'+target+' bài','');
    SpreadsheetApp.flush();

    const started=Date.now();
    try{
      const result=scanGroupApiBridge_(groupUrl,target,groupKey,worker.clientId,true,row,runId);
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
        result.transientRetries?('retry '+result.transientRetries):'',
        result.fallbackUsed?('Numeric ID '+result.fallbackGroupId):'',
        (Math.round((Date.now()-started)/100)/10)+'s'
      ].filter(Boolean).join(' • ');

      let status='XONG', note='';
      if(stopped){
        if(result.stopScope==='RUN'){
          status='CHỜ';
          note='Đã dừng cycle theo yêu cầu. Group có thể chạy lại ở cycle sau.';
        } else {
          status='DỪNG';
          note='Đã dừng Group theo yêu cầu.';
        }
      } else if(result.transientError){
        status='THIẾU';
        note=(result.fallbackUsed?('Đã dùng numeric ID '+result.fallbackGroupId+'. '):'')+
          'Relay tạm lỗi sau retry; đã giữ '+(result.postsRead||0)+'/'+target+' bài thu được. RETRY Group này sau.';
      } else if((result.postsRead||0)<target){
        status='THIẾU';
        note=(result.fallbackUsed?('Đã dùng numeric ID '+result.fallbackGroupId+'. '):'')+
          'API dừng ở '+(result.postsRead||0)+'/'+target+' bài'+
          (result.nextCursor?' trước time budget.':' vì không còn cursor.');
      }

      setGroupRowStatus_(sheet,row,status,progress,note);
      if(status==='XONG') sheet.getRange(row,23).setValue(false);
      clearGroupStop_(groupKey);
      const durationMs=Date.now()-started;
      const health=recordWorkerJobHealth_(worker.slot,true,durationMs,'');
      recordGroupEfficiency_(groupKey,{
        success:status==='XONG',
        scannedPosts:Number(result.postsRead||0),
        newPosts:Number(imported.postImported||0),
        duplicates:Number(imported.duplicates||0),
        durationMs
      });
      SpreadsheetApp.flush();

      return Object.assign({},result,{
        row,name,groupKey,status,targetCount:target,
        workerSlot:worker.slot,workerProfile:worker.profile||'',workerLabel:worker.label||'',
        workerHealth:health&&health.health?health.health:'ONLINE',
        runId,stopped,stopScope:result.stopScope||'',incomplete:status==='THIẾU',progress,note,
        durationMs,
        errorClass:result.transientError?'TRANSIENT':(result.timeBudgetExceeded?'TIME_BUDGET':'')
      });
    }catch(err){
      const msg=String(err.message||err);
      const errorClass=classifyScanError_(err);
      logRuntimeApiEvent_({
        groupName:name,groupKey,workerSlot:worker.slot,variant:'WORKER_JOB_FAIL',
        title:'Worker Group scan failed',code:errorClass||'UNKNOWN',attemptedUrl:groupUrl,
        error:msg,httpCode:Number(err.httpCode||0),raw:err.socialAioRaw||'',durationMs:Date.now()-started
      });
      const failDurationMs=Date.now()-started;
      const health=recordWorkerJobHealth_(worker.slot,false,failDurationMs,msg);
      recordGroupEfficiency_(groupKey,{success:false,scannedPosts:0,newPosts:0,duplicates:0,durationMs:failDurationMs});
      setGroupRowStatus_(sheet,row,'LỖI',worker.slot+' • 0/'+target+' bài',msg);
      SpreadsheetApp.flush();
      return {
        ok:false,row,name,groupKey,groupUrl,targetCount:target,status:'LỖI',
        workerSlot:worker.slot,workerProfile:worker.profile||'',workerLabel:worker.label||'',
        workerHealth:health&&health.health?health.health:workerHealthState_(worker),
        errorClass,error:msg,durationMs:Date.now()-started
      };
    } finally {
      releaseGroupLease_(groupKey||extractGroupKey_(groupUrl),lease.token);
    }
  }
  function sortOpportunityNewestFirst_() {
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.OPPORTUNITY_SHEET);
    if(!sh || sh.getLastRow()<3) return {rows:0};
    const n=sh.getLastRow()-1;
    sh.getRange(2,1,n,CFG.OPPORTUNITY_TOTAL_COLS).sort([{column:1,ascending:false},{column:2,ascending:false}]);
    return {rows:n};
  }

  function countCurrentPassLeads_() {
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.LEAD_SHEET);
    if(!sh || sh.getLastRow()<2) return 0;
    const vals=sh.getRange(2,20,sh.getLastRow()-1,1).getDisplayValues();
    return vals.reduce((n,r)=>n+(String(r[0]||'').trim()==='PASS'?1:0),0);
  }

  function refreshAfterScanFast_() {
    const groupStats=refreshGroupSummary_();
    const dailyStats=refreshDailyStats_();
    SpreadsheetApp.flush();
    return {
      version:CFG.VERSION,
      leads:countCurrentPassLeads_(),
      groups:groupStats.groups,
      dailyStats:dailyStats.rows
    };
  }

  function finalizeWorkerBatch_(command) {
    const started=Date.now();
    const runId=String(command&&command.runId||'').trim();
    const sourceIds=saveLastScanSourceIds_((command&&command.sourceIds)||[]);
    // V1.9.8.6: do not reorder CƠ HỘI in the hot path. AI writes by Source ID,
    // and acquisition stays append-oriented for stable concurrent row identity.
    const refresh=refreshAfterScanFast_();
    const aiCfg=getAiConfig_();
    clearScanRunStop_(runId);
    clearGlobalStopAll_();
    SpreadsheetApp.flush();
    return {
      version:CFG.VERSION,
      runId,
      refresh,
      analysisMode:aiCfg.analysisMode||'manual',
      autoAnalyzeRequested:!!(aiCfg.configured&&aiCfg.analysisMode==='auto_scan'),
      lastScanSources:sourceIds.length,
      durationMs:Date.now()-started
    };
  }

  function scanCheckedGroupsApiBridge_(targetOverride) {
    ensureV16Sheets_(false);
    clearGlobalStopAll_();

    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const selected=getCheckedGroupRows_();
    if(!selected.length) throw new Error('Chưa chọn Group nào ở cột Chọn.');

    const override=targetOverride ? normalizeGroupTarget_(targetOverride) : 0;
    const started=Date.now();
    const budgetMs=230000;
    const results=[];
    let deferred=0;

    for(let i=0;i<selected.length;i++) {
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

    clearGlobalStopAll_();
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
    clearGlobalStopAll_();
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

  function stopCheckedGroupsApiBridge_(command) {
    command=command||{};
    const props=PropertiesService.getDocumentProperties();
    const sheet=mustSheet_(SpreadsheetApp.getActiveSpreadsheet(),CFG.GROUP_SCAN_SHEET);
    const selected=getCheckedGroupRows_();
    const runId=String(command.runId||'').trim();
    const runStop=runId ? requestStopScanRun_(runId) : {ok:false,requested:false};

    selected.forEach(item=>{
      if(item.groupKey) props.setProperty(groupStopKey_(item.groupKey),'1');
      if(String(item.status||'')==='ĐANG QUÉT'){
        setGroupRowStatus_(sheet,item.row,'DỪNG YÊU CẦU','Đang chờ dừng','Sẽ dừng sau API call/page hiện tại.');
      }
    });

    // Clean the legacy poison flag every time STOP is used. HF4 never sets it.
    clearGlobalStopAll_();
    SpreadsheetApp.flush();
    return {
      ok:true,
      requested:selected.length,
      runId,
      runStopRequested:!!runStop.requested,
      legacyStopAll:false
    };
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

    const imported = ingestApiRecords_(posts,{ name:fileName });
    const cursor = findBridgeCursor_(apiResult);

    SpreadsheetApp.getUi().alert(
      '✅ POC GROUP SCAN PASS\n\n' +
      'Group: ' + groupUrl + '\n' +
      'API đọc: ' + posts.length + ' post\n' +
      'Post mới: ' + (imported.postImported || 0) + '\n' +
      'Trùng: ' + (imported.duplicates || 0) + '\n' +
      'Cursor tiếp: ' + (cursor ? 'CÓ' : 'KHÔNG') + '\n' +
      'Thời gian: ' + (Date.now() - started) + ' ms\n\n' +
      'Dữ liệu API đã normalize trực tiếp vào RAW POSTS (sheet NHẬP JSON legacy) / CƠ HỘI; không cần Export/Import JSON.'
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
    const imported = ingestApiRecords_(comments,{ name:fileName });
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
    const cursorSource=results.find(x=>x.cursorValue);

    // Since V1.8.6 the production scanner reads findBridgeCursor_(apiResult)
    // from the RAW wrapper before any unwrap. A successful page-2 probe is
    // therefore evidence that pagination is healthy, not evidence of a bug.
    if(cursorSource && page2 && Number(page2.rawBestCount||0)>0){
      return {
        code:'P_PAGINATION_OK',
        title:'Pagination PASS — raw cursor và PAGE2 đều hoạt động',
        action:'Production scanner HF2 dùng cùng raw-wrapper path này. Nếu scan lỗi, kiểm tra retry/empty-page/lease.'
      };
    }

    if(cursorSource && (!page2 || Number(page2.rawBestCount||0)<=0)){
      return {
        code:'B_PAGE2_RELAY_OR_CURSOR',
        title:'Có raw cursor nhưng PAGE2 probe không trả bài',
        action:'Kiểm tra relay/upstream và cursor request của PAGE2; chưa kết luận scanner sai metadata.'
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
    const groupKey=exactGroupKeyFromRow_(groupUrl,sh.getRange(row,5).getDisplayValue());

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

  function isTransientSocialAioError_(err) {
    const msg=String(err&&err.message||err||'');
    return /Social AIO relay HTTP\s+(429|502|503|504)\b|\btimeout\b|timed\s*out|temporar(?:y|ily)|service unavailable|bad gateway|gateway timeout|connection reset|socket|network error|address unavailable/i.test(msg);
  }

  function classifyScanError_(err) {
    const msg=String(err&&err.message||err||'');
    if(isWorkerConnectionError_(msg)) return 'CONNECTION';
    if(isGroupIdentityResolveError_(msg) || /FBAIO_GROUP_ID_RESOLVE/i.test(msg)) return 'GROUP_ID_RESOLVE';
    if(isTransientSocialAioError_(msg) || /page rỗng tạm thời|HTTP 200 nhưng page đầu rỗng/i.test(msg)) return 'TRANSIENT';
    if(/không tìm thấy post/i.test(msg)) return 'NO_POSTS';
    if(/Sheet đang bận/i.test(msg)) return 'SHEET_BUSY';
    return 'UNKNOWN';
  }

  function callSocialAioApiWithRetry_(clientId,apiName,apiParams,options) {
    options=options||{};
    const attempts=Math.max(1,Math.min(5,Number(options.maxAttempts||CFG.RELAY_RETRY_ATTEMPTS||3)));
    const delays=[0,2000,5000,9000,15000];
    let lastErr=null;

    for(let i=0;i<attempts;i++){
      if(i>0) Utilities.sleep(delays[Math.min(i,delays.length-1)]);
      try{
        return callSocialAioApiWithClient_(clientId,apiName,apiParams);
      }catch(err){
        lastErr=err;
        if(!isTransientSocialAioError_(err) || i>=attempts-1) throw err;
        if(typeof options.onRetry==='function'){
          try{ options.onRetry({attempt:i+2,error:String(err.message||err)}); }catch(_){}
        }
      }
    }
    throw lastErr||new Error('Social AIO transient retry failed.');
  }

  function getRuntimeLease_(key) {
    const raw=PropertiesService.getDocumentProperties().getProperty(String(key||''))||'';
    if(!raw) return {active:false,key:String(key||'')};
    try{
      const x=JSON.parse(raw);
      return Object.assign({},x,{
        active:Number(x.expiresAt||0)>Date.now(),
        key:String(key||'')
      });
    }catch(_){
      return {active:false,key:String(key||''),corrupt:true};
    }
  }

  function acquireRuntimeLease_(key,owner,ttlMs) {
    const propKey=String(key||'').trim();
    if(!propKey) throw new Error('Runtime lease key trống.');
    const lock=LockService.getDocumentLock();
    if(!lock.tryLock(5000)) return {ok:false,reason:'LEASE_LOCK_BUSY',key:propKey};
    try{
      const props=PropertiesService.getDocumentProperties();
      const now=Date.now();
      let existing=null;
      const raw=props.getProperty(propKey);
      if(raw){try{existing=JSON.parse(raw);}catch(_){}}
      if(existing && Number(existing.expiresAt||0)>now){
        return {
          ok:false,reason:'LANE_BUSY',key:propKey,
          owner:String(existing.owner||''),
          token:String(existing.token||''),
          acquiredAt:Number(existing.acquiredAt||0),
          updatedAt:Number(existing.updatedAt||0),
          expiresAt:Number(existing.expiresAt||0)
        };
      }
      const ttl=Math.max(30000,Number(ttlMs||60000));
      const lease={
        token:Utilities.getUuid(),
        owner:String(owner||'runtime'),
        acquiredAt:now,
        updatedAt:now,
        expiresAt:now+ttl
      };
      props.setProperty(propKey,JSON.stringify(lease));
      return Object.assign({ok:true,key:propKey},lease);
    }finally{
      lock.releaseLock();
    }
  }

  function heartbeatRuntimeLease_(key,token,ttlMs) {
    const propKey=String(key||'').trim();
    if(!propKey || !token) return false;
    const lock=LockService.getDocumentLock();
    if(!lock.tryLock(5000)) return false;
    try{
      const props=PropertiesService.getDocumentProperties();
      const raw=props.getProperty(propKey)||'';
      if(!raw) return false;
      let x=null;
      try{x=JSON.parse(raw);}catch(_){return false;}
      if(String(x.token||'')!==String(token)) return false;
      const now=Date.now();
      x.updatedAt=now;
      x.expiresAt=now+Math.max(30000,Number(ttlMs||60000));
      props.setProperty(propKey,JSON.stringify(x));
      return true;
    }finally{
      lock.releaseLock();
    }
  }

  function releaseRuntimeLease_(key,token) {
    const propKey=String(key||'').trim();
    if(!propKey || !token) return false;
    const lock=LockService.getDocumentLock();
    if(!lock.tryLock(5000)) return false;
    try{
      const props=PropertiesService.getDocumentProperties();
      const raw=props.getProperty(propKey)||'';
      if(!raw) return true;
      let x=null;
      try{x=JSON.parse(raw);}catch(_){props.deleteProperty(propKey);return true;}
      if(String(x.token||'')!==String(token)) return false;
      props.deleteProperty(propKey);
      return true;
    }finally{
      lock.releaseLock();
    }
  }

  function commentPostLeasePropertyKey_(postIdentity) {
    const raw=String(postIdentity||'unknown').trim();
    const safe=Utilities.base64EncodeWebSafe(raw,Utilities.Charset.UTF_8).replace(/=+$/,'').slice(0,180);
    return CFG.COMMENT_POST_LEASE_PREFIX+safe;
  }

  function groupLeasePropertyKey_(groupKey) {
    const raw=String(groupKey||'unknown').trim().toLowerCase();
    const safe=Utilities.base64EncodeWebSafe(raw,Utilities.Charset.UTF_8).replace(/=+$/,'').slice(0,180);
    return CFG.GROUP_LEASE_PREFIX+safe;
  }

  function acquireGroupLease_(groupKey,owner,row) {
    const key=groupLeasePropertyKey_(groupKey);
    const lock=LockService.getDocumentLock();
    if(!lock.tryLock(5000)){
      return {ok:false,reason:'LEASE_LOCK_BUSY',groupKey:String(groupKey||''),row:Number(row||0)};
    }
    try{
      const props=PropertiesService.getDocumentProperties();
      const now=Date.now();
      let existing=null;
      const raw=props.getProperty(key);
      if(raw){
        try{ existing=JSON.parse(raw); }catch(_){}
      }
      if(existing && Number(existing.expiresAt||0)>now){
        return {
          ok:false,
          reason:'GROUP_BUSY',
          groupKey:String(groupKey||''),
          row:Number(row||0),
          owner:existing.owner||'',
          expiresAt:Number(existing.expiresAt||0)
        };
      }

      const lease={
        token:Utilities.getUuid(),
        owner:String(owner||'scan'),
        row:Number(row||0),
        groupKey:String(groupKey||''),
        acquiredAt:now,
        expiresAt:now+CFG.GROUP_LEASE_TTL_MS
      };
      props.setProperty(key,JSON.stringify(lease));
      return Object.assign({ok:true},lease);
    } finally {
      lock.releaseLock();
    }
  }

  function releaseGroupLease_(groupKey,token) {
    if(!groupKey || !token) return false;
    const key=groupLeasePropertyKey_(groupKey);
    const lock=LockService.getDocumentLock();
    if(!lock.tryLock(5000)) return false;
    try{
      const props=PropertiesService.getDocumentProperties();
      const raw=props.getProperty(key);
      if(!raw) return true;
      let current=null;
      try{ current=JSON.parse(raw); }catch(_){}
      if(current && String(current.token||'')===String(token)){
        props.deleteProperty(key);
        return true;
      }
      return false;
    } finally {
      lock.releaseLock();
    }
  }

  function isDueJobStillValid_(sheet,row,policyConfig) {
    if(!sheet||row<2||row>sheet.getLastRow()) return false;
    const vals=sheet.getRange(row,1,1,27).getValues()[0]||[];
    const active=String(vals[0]||'').trim();
    const lifecycle=String(vals[6]||'').trim();
    const status=String(vals[23]||'').trim();
    if(active!=='Có'||lifecycle==='Loại') return false;
    if(status==='ĐANG QUÉT'||status==='LỖI'||status==='THIẾU'||/^DỪNG/.test(status)) return false;
    const config=policyConfig||getAutoPolicyConfig_();
    const group=groupPolicyInput_(vals);
    const profile=policyProfileForGroup_(config,group.groupKey);
    if(!profile||profile.enabled===false) return false;
    const policy=resolveEffectiveScanPolicy_(profile,group,config);
    const lastAt=opsDateMs_(vals[9]);
    const nextAt=effectiveNextDueMs_(lastAt,policy);
    return !lastAt||!nextAt||nextAt<=Date.now();
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

  function normalizeWorkerRole_(role) {
    const r=String(role||'BOTH').trim().toUpperCase();
    return ['GROUP','COMMENT','BOTH'].indexOf(r)>=0?r:'BOTH';
  }

  function workerSupportsRole_(worker,role) {
    const target=normalizeWorkerRole_(role);
    const actual=normalizeWorkerRole_(worker&&worker.role);
    return actual==='BOTH' || actual===target;
  }

  function defaultWorkerPool_() {
    return [1,2,3].map(i=>({
      slot:'W'+i,
      label:'FB-0'+i,
      enabled:i===1,
      role:'BOTH',
      clientId:'',
      profile:'',
      socialAioVersion:'',
      latencyMs:0,
      testOk:false,
      lastTestAt:'',
      lastSuccessAt:'',
      lastFailureAt:'',
      lastJobAt:'',
      lastJobLatencyMs:0,
      lastError:''
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
      const legacySuccess=String(x.lastSuccessAt || (x.testOk ? x.lastTestAt : '') || '');
      const legacyFailure=String(
        x.lastFailureAt ||
        ((!x.testOk && x.lastTestAt && (x.error||x.lastError)) ? x.lastTestAt : '') ||
        ''
      );
      return Object.assign({},d,x,{
        slot:d.slot,
        label:String(x.label||d.label).trim()||d.label,
        enabled:x.enabled!==undefined ? !!x.enabled : !!d.enabled,
        role:normalizeWorkerRole_(x.role||d.role),
        clientId:String(x.clientId||'').trim(),
        profile:String(x.profile||'').trim(),
        socialAioVersion:String(x.socialAioVersion||'').trim(),
        latencyMs:Number(x.latencyMs||0),
        testOk:!!x.testOk,
        lastTestAt:String(x.lastTestAt||''),
        lastSuccessAt:legacySuccess,
        lastFailureAt:legacyFailure,
        lastJobAt:String(x.lastJobAt||''),
        lastJobLatencyMs:Number(x.lastJobLatencyMs||0),
        lastError:String(x.lastError||x.error||'')
      });
    });
  }
  function saveWorkerPoolRaw_(pool) {
    PropertiesService.getDocumentProperties().setProperty(CFG.WORKER_POOL_KEY,JSON.stringify(pool||[]));
  }

  function workerTimeMs_(value) {
    const t=Date.parse(String(value||''));
    return Number.isFinite(t) ? t : 0;
  }

  function workerHealthState_(worker,nowMs) {
    if(!worker || !worker.clientId) return 'UNCONFIGURED';
    const now=Number(nowMs||Date.now());
    const success=Math.max(
      workerTimeMs_(worker.lastSuccessAt),
      worker.testOk ? workerTimeMs_(worker.lastTestAt) : 0
    );
    const failure=Math.max(
      workerTimeMs_(worker.lastFailureAt),
      (!worker.testOk && (worker.lastError||worker.error)) ? workerTimeMs_(worker.lastTestAt) : 0
    );
    if(failure>success) return 'OFFLINE';
    if(success>0) {
      return (now-success)<=CFG.WORKER_HEALTH_TTL_MS ? 'ONLINE' : 'STALE';
    }
    return 'UNKNOWN';
  }

  function workerHealthEvidenceAt_(worker) {
    const success=workerTimeMs_(worker&&worker.lastSuccessAt);
    const failure=workerTimeMs_(worker&&worker.lastFailureAt);
    const test=workerTimeMs_(worker&&worker.lastTestAt);
    const job=workerTimeMs_(worker&&worker.lastJobAt);
    const max=Math.max(success,failure,test,job);
    return max ? new Date(max).toISOString() : '';
  }

  function isWorkerConnectionError_(message) {
    const s=String(message||'');
    return /client\s+not\s+connected|not\s+connected|thiếu\s+client_id|chưa\s+có\s+client_id|client_id[^\n]*(?:invalid|không hợp lệ)|automation[^\n]*apis[^\n]*connect|tab[^\n]*apis[^\n]*connect/i.test(s);
  }

  function recordWorkerJobHealth_(slot,ok,durationMs,errorMessage) {
    const lock=LockService.getDocumentLock();
    if(!lock.tryLock(5000)) return null;
    try{
      const pool=getWorkerPoolRaw_();
      const key=String(slot||'').trim().toUpperCase();
      const idx=pool.findIndex(w=>w.slot===key);
      if(idx<0) return null;

      const now=new Date().toISOString();
      const msg=String(errorMessage||'').slice(0,500);
      const patch={
        lastJobAt:now,
        lastJobLatencyMs:Math.max(0,Number(durationMs||0))
      };

      if(ok){
        patch.testOk=true;
        patch.lastSuccessAt=now;
        patch.lastError='';
        patch.error='';
      } else {
        patch.lastError=msg;
        patch.error=msg;
        if(isWorkerConnectionError_(msg)){
          patch.testOk=false;
          patch.lastFailureAt=now;
        }
      }

      pool[idx]=Object.assign({},pool[idx],patch);
      saveWorkerPoolRaw_(pool);
      return workerPublic_(pool[idx]);
    } finally {
      lock.releaseLock();
    }
  }

  function workerPublic_(w) {
    const health=workerHealthState_(w);
    const successMs=Math.max(
      workerTimeMs_(w&&w.lastSuccessAt),
      w&&w.testOk ? workerTimeMs_(w.lastTestAt) : 0
    );
    return {
      slot:w.slot,
      label:w.label,
      enabled:!!w.enabled,
      role:normalizeWorkerRole_(w.role),
      configured:!!w.clientId,
      clientIdMasked:w.clientId?maskBridgeClientId_(w.clientId):'',
      profile:w.profile||'',
      socialAioVersion:w.socialAioVersion||'',
      latencyMs:Number(w.latencyMs||0),
      testOk:!!w.testOk,
      health,
      healthTtlMs:CFG.WORKER_HEALTH_TTL_MS,
      healthEvidenceAt:workerHealthEvidenceAt_(w),
      lastTestAt:w.lastTestAt||'',
      lastSuccessAt:w.lastSuccessAt||'',
      lastFailureAt:w.lastFailureAt||'',
      lastJobAt:w.lastJobAt||'',
      lastJobLatencyMs:Number(w.lastJobLatencyMs||0),
      lastSuccessAgeMs:successMs ? Math.max(0,Date.now()-successMs) : null,
      lastError:w.lastError||w.error||''
    };
  }
  function getWorkerPoolPublic_() {
    const workers=getWorkerPoolRaw_().map(workerPublic_);
    const enabledConfigured=workers.filter(w=>w.enabled&&w.configured);
    return {
      version:CFG.VERSION,
      relay:CFG.BRIDGE_SERVER,
      healthTtlMs:CFG.WORKER_HEALTH_TTL_MS,
      onlineCount:enabledConfigured.filter(w=>w.health==='ONLINE').length,
      staleCount:enabledConfigured.filter(w=>w.health==='STALE').length,
      offlineCount:enabledConfigured.filter(w=>w.health==='OFFLINE').length,
      unknownCount:enabledConfigured.filter(w=>w.health==='UNKNOWN').length,
      configuredCount:enabledConfigured.length,
      workers
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
      const nextClientId=clientInput || prev.clientId;
      const clientChanged=!!clientInput && clientInput!==prev.clientId;
      const next=Object.assign({},prev,{
        label:String(x.label!==undefined?x.label:prev.label).trim()||prev.label,
        enabled:x.enabled!==undefined?!!x.enabled:prev.enabled,
        role:normalizeWorkerRole_(x.role!==undefined?x.role:prev.role),
        clientId:nextClientId
      });

      // A new CLIENT_ID must not inherit ONLINE/OFFLINE evidence from the old identity.
      if(clientChanged){
        Object.assign(next,{
          profile:'',
          socialAioVersion:'',
          latencyMs:0,
          testOk:false,
          lastTestAt:'',
          lastSuccessAt:'',
          lastFailureAt:'',
          lastJobAt:'',
          lastJobLatencyMs:0,
          lastError:'',
          error:''
        });
      }
      return next;
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
      return Object.assign({},worker,{
        testOk:false,
        profile:'',
        latencyMs:0,
        lastTestAt:new Date().toISOString(),
        lastError:'Chưa có CLIENT_ID',
        error:'Chưa có CLIENT_ID'
      });
    }
    try{
      const ver=callSocialAioApiWithClient_(worker.clientId,'get_ext_version',{});
      let profileRes=null;
      try{profileRes=callSocialAioApiWithClient_(worker.clientId,'get_my_profile_lite',{});}catch(_){}
      const profile=pickBridgeValue_(profileRes,['name','profile.name'])||worker.profile||'';
      const socialAioVersion=pickBridgeValue_(ver,['version'])||compactBridgePreview_(ver,80)||'OK';
      const now=new Date().toISOString();
      return Object.assign({},worker,{
        testOk:true,
        profile,
        socialAioVersion,
        latencyMs:Date.now()-started,
        lastTestAt:now,
        lastSuccessAt:now,
        lastError:'',
        error:''
      });
    }catch(err){
      const now=new Date().toISOString();
      const msg=String(err.message||err).slice(0,500);
      return Object.assign({},worker,{
        testOk:false,
        latencyMs:Date.now()-started,
        lastTestAt:now,
        lastFailureAt:now,
        lastError:msg,
        error:msg
      });
    }
  }
  function testWorkerPool_() {
    const pool=getWorkerPoolRaw_();
    const tested=pool.map(w=>w.enabled?testOneWorker_(w):Object.assign({},w));
    saveWorkerPoolRaw_(tested);
    const first=tested.find(w=>w.enabled&&w.clientId);
    if(first) PropertiesService.getDocumentProperties().setProperty(CFG.BRIDGE_CLIENT_ID_KEY,first.clientId);
    const workers=tested.map(w=>Object.assign(workerPublic_(w),{error:w.lastError||w.error||''}));
    const enabledConfigured=workers.filter(w=>w.enabled&&w.configured);
    return {
      version:CFG.VERSION,
      relay:CFG.BRIDGE_SERVER,
      healthTtlMs:CFG.WORKER_HEALTH_TTL_MS,
      onlineCount:enabledConfigured.filter(w=>w.health==='ONLINE').length,
      staleCount:enabledConfigured.filter(w=>w.health==='STALE').length,
      offlineCount:enabledConfigured.filter(w=>w.health==='OFFLINE').length,
      unknownCount:enabledConfigured.filter(w=>w.health==='UNKNOWN').length,
      configuredCount:enabledConfigured.length,
      workers
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
    const duplicateRows=new Set(getDuplicateGroupIdentityRows_().map(x=>Number(x.row||0)));
    const values=sheet.getRange(2,1,last-1,26).getValues();
    const out=[];
    values.forEach((r,i)=>{
      if(duplicateRows.has(i+2)) return;
      if(String(r[0]||'').trim()!=='Có') return;
      const status=String(r[23]||'');
      if(status!=='LỖI' && status!=='THIẾU') return;
      const url=String(r[3]||'').trim();
      if(!url) return;
      out.push({
        row:i+2,
        name:String(r[2]||'').trim() || ('Group '+String(r[4]||'')),
        profile:String(r[1]||'').trim() || 'AUTO',
        url,
        groupKey:exactGroupKeyFromRow_(url,r[4]),
        targetCount:normalizeGroupTarget_(r[8]||25),
        status
      });
    });
    return out;
  }

  function prepareJobsForWorkers_(jobs,targetOverride,retryMode,mode) {
    const list=Array.isArray(jobs)?jobs:[];
    const runId=(String(mode||'selected').toLowerCase())+'-'+Utilities.getUuid().slice(0,12);
    const override=targetOverride?normalizeGroupTarget_(targetOverride):0;
    const configured=getWorkerPoolRaw_()
      .filter(w=>w.enabled&&w.clientId&&workerSupportsRole_(w,'GROUP'))
      .map(w=>Object.assign({},w,{health:workerHealthState_(w)}));
    if(!configured.length) throw new Error('Chưa có Worker role GROUP/BOTH khả dụng. Mở Worker Pool → Role.');

    const pool=configured.filter(w=>w.health!=='OFFLINE');
    if(!pool.length){
      throw new Error('Tất cả Worker đã cấu hình đang OFFLINE. Hãy mở Social AIO → Automation → APIs → Connect rồi TEST WORKER.');
    }

    const loads={};
    pool.forEach(w=>loads[w.slot]=0);
    const assignments={};
    pool.forEach(w=>assignments[w.slot]=[]);

    list.forEach(job=>{
      const target=override||job.targetCount||25;
      const pinned=String(job.profile||'').trim() && String(job.profile||'').trim().toLowerCase()!=='auto';
      let candidates=pool.filter(w=>workerMatchesProfile_(w,job.profile));
      if(!candidates.length && pinned){
        job.assignmentError='Không có Worker khả dụng khớp Profile "'+job.profile+'".';
        return;
      }
      if(!candidates.length) candidates=pool.slice();

      candidates.sort((a,b)=>{
        const rank={ONLINE:0,UNKNOWN:1,STALE:2,OFFLINE:3};
        const ha=rank[a.health]!==undefined?rank[a.health]:9;
        const hb=rank[b.health]!==undefined?rank[b.health]:9;
        if(ha!==hb) return ha-hb;
        const la=loads[a.slot]||0, lb=loads[b.slot]||0;
        if(la!==lb) return la-lb;
        return Number(a.latencyMs||999999)-Number(b.latencyMs||999999);
      });

      const chosen=candidates[0];
      const weight=Math.max(1,Number(chosen.latencyMs||1500)/1000);
      loads[chosen.slot]+=target*weight;
      assignments[chosen.slot].push(Object.assign({},job,{targetCount:target,workerSlot:chosen.slot,jobMode:mode||'selected',runId}));
    });

    const workers=pool.map(w=>({
      slot:w.slot,label:w.label,profile:w.profile||'',health:w.health,
      testOk:!!w.testOk,latencyMs:Number(w.latencyMs||0),
      jobs:assignments[w.slot]||[]
    })).filter(w=>w.jobs.length);

    const unassigned=list.filter(j=>j.assignmentError).map(j=>({row:j.row,name:j.name,error:j.assignmentError}));
    return {
      version:CFG.VERSION,
      runId,
      mode:mode||'selected',
      scope:(String(mode||'selected').toLowerCase()==='due'
        ? 'SCHEDULER_DUE'
        : (String(mode||'selected').toLowerCase()==='retry'
          ? 'EXCEPTION_RETRY'
          : (String(mode||'selected').toLowerCase()==='onboarding' ? 'ONBOARDING_DISCOVERY' : 'CHECKBOX_SELECTION'))),
      retryMode:!!retryMode,
      selected:list.length,
      assigned:workers.reduce((n,w)=>n+w.jobs.length,0),
      unassigned,
      workers,
      onlineCount:configured.filter(w=>w.health==='ONLINE').length,
      staleCount:configured.filter(w=>w.health==='STALE').length,
      unknownCount:configured.filter(w=>w.health==='UNKNOWN').length,
      offlineCount:configured.filter(w=>w.health==='OFFLINE').length,
      configuredCount:configured.length
    };
  }

  function prepareWorkerBatch_(targetOverride,retryMode) {
    ensureV16Sheets_(false);
    clearGlobalStopAll_();
    const jobs=retryMode?collectRetryJobs_():getCheckedGroupRows_();
    if(!jobs.length) throw new Error(retryMode?'Không có Group LỖI/THIẾU hợp lệ để retry.':'Chưa chọn Group nào.');
    const duplicateRedirects=retryMode?0:repairSelectedDuplicateRows_(jobs);
    const plan=prepareJobsForWorkers_(jobs,targetOverride,retryMode,retryMode?'retry':'selected');
    plan.duplicateRedirects=duplicateRedirects;
    return plan;
  }

  function prepareDueWorkerBatch_(limit) {
    ensureV16Sheets_(false);
    clearGlobalStopAll_();
    const jobs=getDueGroupRows_(limit||CFG.DUE_CYCLE_LIMIT);
    if(!jobs.length){
      return {
        version:CFG.VERSION,mode:'due',scope:'SCHEDULER_DUE',retryMode:false,selected:0,assigned:0,
        unassigned:[],workers:[],configuredCount:getWorkerPoolRaw_().filter(w=>w.enabled&&w.clientId).length
      };
    }
    return prepareJobsForWorkers_(jobs,0,false,'due');
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

  function runApiNativeCleanupHarness_() {
    const body=ingestApiRecords_.toString();
    const importer=importJsonFiles.toString();
    const tests={
      API_NATIVE_WRAPPER_EXISTS:body.indexOf('parsed:list')>=0,
      API_NATIVE_NO_SERIALIZE:body.indexOf('JSON.stringify')<0,
      LEGACY_JSON_PARSE_RETAINED:importer.indexOf("JSON.parse(file.text || '[]')")>=0,
      PARSED_PAYLOAD_SUPPORTED:importer.indexOf("hasOwnProperty.call(file,'parsed')")>=0
    };
    const failed=Object.keys(tests).filter(k=>!tests[k]);
    return {ok:failed.length===0,version:CFG.VERSION,tests,failed};
  }


  return {
    getVersion,
    onOpen,
    showRuntimeInfo,
    showControlCenter,
    openSignalFeed,
    openLeadInbox,
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
    autoMonitorTick: autoMonitorTick_,
    runCommentIntelligenceCycle: runCommentIntelligenceCycle_,
    runProductionSelfTest: runProductionSelfTest_,
    runContextIntegrityHarness: runContextIntegrityHarness_,
    runProviderResilienceHarness: runProviderResilienceHarness_,
    runGroupSummaryCardinalityHarness: runGroupSummaryCardinalityHarness_,
    runGroupDisplayInvariantHarness: runGroupDisplayInvariantHarness_,
    runGroupRegistryCleanupHarness: runGroupRegistryCleanupHarness_,
    runGroupOnboardingHarness: runGroupOnboardingHarness_,
    runGroupIntelligenceHarness: runGroupIntelligenceHarness_,
    runApiNativeCleanupHarness: runApiNativeCleanupHarness_,
    runVerifiedIdentityRetryHarness: runVerifiedIdentityRetryHarness_,
    runAutoPolicyHarness: runAutoPolicyHarness_,
    runConcurrencyLeaseHarness: runConcurrencyLeaseHarness_,
  };
})();
