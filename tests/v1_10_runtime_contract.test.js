const fs=require('fs');
const vm=require('vm');

function assert(cond,msg){ if(!cond) throw new Error(msg); }
function read(p){ return fs.readFileSync(p,'utf8'); }

const runtime=read('apps-script/Runtime.js');
const html=read('apps-script/ImportDialog.html');
const bootstrap=read('bootstrap/Code.gs');

// Syntax gates.
new Function(runtime);
const sm=html.match(/<script>([\s\S]*?)<\/script>/);
assert(sm,'ImportDialog script block missing');
new Function(sm[1]);
new Function(bootstrap);

assert(runtime.includes("VERSION: '1.10.0-pilot-200'"),'runtime version mismatch');
assert(bootstrap.includes("BOOTSTRAP_VERSION = '2.2-auto-monitor-v2'"),'bootstrap version mismatch');
assert(bootstrap.includes('function autoMonitorTick()'),'global autoMonitorTick trigger entrypoint missing');

const requiredRuntime=[
  'function autoMonitorTick_',
  'function setAutoMonitorV2Enabled_',
  'function runCommentIntelligenceCycle_',
  'function runProductionAcceptance_',
  'function repairDuplicateGroupRegistry_',
  'function getCommentFetchCandidates_',
  'function fetchPostCommentsRaw_'
];
for(const x of requiredRuntime) assert(runtime.includes(x),'missing '+x);

assert(runtime.includes('source-row identity is authoritative'),'source-group identity hardening missing');
assert(runtime.includes('A comment refresh is not a Group post scan'),'comment scan scheduling guard missing');
assert(runtime.includes("jobMode:String(job.jobMode||mode||'selected')"),'job mode preservation missing');
assert(runtime.includes("['due','auto_due'].includes"),'auto due stale-plan recheck missing');
assert(runtime.includes("'Comment count đã xử lý','Comment check gần nhất','Comment fetch trạng thái'"),'comment state schema missing');
assert(runtime.includes("'Comment backfill cursor','Comment total đã quan sát','Comment delta cursor','Comment delta target','Comment delta base','Comment delta fetched'"),'dual-watermark comment schema missing');
assert(runtime.includes('RAW_COMMENT_DELTA_FETCHED_COL: 25'),'comment delta state must extend through column 25');
assert(runtime.includes("mode='delta_resume'"),'delta cursor resume mode missing');
assert(runtime.includes('DELTA_PARTIAL'),'large fresh-delta continuation missing');
assert(runtime.includes('Fresh/new delta always wins over historical backfill.'),'fresh comment priority invariant missing');
assert(runtime.includes('importJsonFiles(pending.map(x=>x.file))'),'comment imports must be batched');
assert(runtime.includes('A comment refresh is not a Group post scan'),'comment refresh must not move Group scan SLA');
assert(runtime.includes("CONSUMER_OR_UNKNOWN"),'unknown Apps Script account class must use conservative runtime budget');
assert(runtime.includes('TRIGGER_RUNTIME_BUDGET_GUARD'),'trigger runtime quota guard missing');
assert(runtime.includes("id:'AUTO_RUNTIME_CAPACITY'"),'acceptance runtime-capacity gate missing');

assert(!html.includes('AUTO MONITOR chỉ chạy khi cửa sổ Control Center này đang mở'),'legacy window-only auto monitor copy remains');
for(const cmd of ['SET_AUTO_MONITOR_V2','RUN_AUTO_MONITOR_TICK','RUN_COMMENT_INTELLIGENCE','RUN_PRODUCTION_ACCEPTANCE']){
  assert(html.includes(cmd),'UI command missing '+cmd);
}
assert(html.includes('effectiveSourceIds'),'manual scan does not merge comment Source IDs into Auto AI');
assert(html.includes('AUTO MONITOR V2 chạy bằng backend trigger'),'UI must explain backend scheduler');
assert(html.includes('RUN AUTO NGAY'),'manual backend tick control missing');
assert(html.includes('QUÉT COMMENT NGAY'),'comment intelligence control missing');
assert(html.includes('NGHIỆM THU + AUTO REPAIR'),'production acceptance control missing');

// Pure-policy regression tests through RemoteApp.__test.
const context={};
vm.createContext(context);
vm.runInContext(runtime+'\n;globalThis.__RemoteApp=RemoteApp;',context,{timeout:3000});
const t=context.__RemoteApp && context.__RemoteApp.__test;
assert(t,'Runtime __test surface missing');
assert(t.getVersion()==='1.10.0-pilot-200','getVersion mismatch');
assert(t.classifyStoredScanError_('LỖI','Social AIO relay HTTP 504: gateway timeout')==='TRANSIENT','504 must be transient');
assert(t.classifyStoredScanError_('LỖI','IDENTITY_DUPLICATE -> row 4')==='STRUCTURAL','identity duplicate must be structural');
assert(t.classifyStoredScanError_('LỖI','API trả về nhưng không tìm thấy post cho Group này.')==='NO_POSTS','empty group must be NO_POSTS');
assert(t.classifyStoredScanError_('THIẾU','Relay tạm lỗi')==='TRANSIENT','THIẾU fallback must be transient');

let p=t.retryPolicyForClass_('TRANSIENT',0);
assert(p.retry===true && p.hard===false && p.delayMs===120000,'transient retry #1 policy mismatch');
p=t.retryPolicyForClass_('TRANSIENT',4);
assert(p.retry===false && p.hard===true,'transient retry must hard-quarantine after budget');
p=t.retryPolicyForClass_('NO_POSTS',0);
assert(p.retry===true && p.delayMs===600000,'NO_POSTS first retry mismatch');
p=t.retryPolicyForClass_('NO_POSTS',2);
assert(p.retry===false && p.hard===true,'NO_POSTS must stop after 2 retries');
p=t.retryPolicyForClass_('STRUCTURAL',0);
assert(p.retry===false && p.hard===true,'structural error must never auto retry');
p=t.retryPolicyForClass_('CONNECTION',50);
assert(p.retry===true && p.hard===false,'connection failure must wait/retry, not quarantine group');

console.log('V1.10.0 runtime contract PASS');
