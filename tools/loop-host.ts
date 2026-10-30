import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { LoopStore } from './agnostic-loop/store';
import { importArtifact, observeEvent } from './agnostic-loop/observed';
import { exportPacket, importResult } from './agnostic-loop/adapter';
import { runGate } from './agnostic-loop/runner';
import { digest } from './agnostic-loop/json';
import type { Worker, VerificationReport, FinalReport } from './agnostic-loop/types';

const workspace = process.cwd();
const runtime = path.join(workspace, '.agnostic-loop/throughline');
const store = new LoopStore(path.join(runtime, 'state'));
const actor = 'operator';
const criteria = ['C1','C2','C3','C4','C5','C6','C7','C8'];
const item = 'throughline';
const artifactNames = ['scope','criteria','design','plan','test-design','implementation','verification','whole-change','final-report'];
const rootPaths = ['package.json','package-lock.json','.gitignore','tsconfig.json','vitest.config.ts','index.html','src/App.tsx','src/model.ts','src/model.test.ts','src/styles.css','src/main.tsx','README.md','docs/DEPLOYMENT_STATUS.md','docs/INTERVIEW_GUIDE.md','public/favicon.svg'];
const artifactPath = (id: string) => `.agnostic-loop/throughline/artifacts/${id}.md`;
const requireText = (s: unknown, label: string): string => { if(typeof s !== 'string' || !s.trim()) throw new Error(`${label} is required`); return s; };
async function event(type: string, payload: Record<string, unknown>) {
  const s = await store.load();
  const e = {id:randomUUID(),expectedRevision:s.revision,actor,type,payload};
  return store.transact(e, await observeEvent(store,e));
}
async function result(assignment: string, type: string, payload: Record<string, unknown>) {
  const s=await store.load(), a=s.assignments[assignment]; if(!a) throw new Error('Unknown assignment');
  const value={schemaVersion:1,id:randomUUID(),expectedRevision:s.revision,assignment,worker:a.worker,publicationToken:a.publicationToken,event:{type,payload:{assignment,...payload}},usage:'unavailable'};
  const filename=path.join(runtime,'receipts',`${value.id}.json`);
  await writeFile(filename,JSON.stringify(value,null,2));
  return importResult(store,filename,actor);
}
async function start(spec: any) {
  const s=await store.load();
  const activity=requireText(spec.activity,'activity');
  if(!s.activities[activity]) await event('activity.create',{id:activity,item,kind:spec.kind??activity,requirements:criteria,dependencies:spec.dependencies??[]});
  const id=requireText(spec.assignment,'assignment');
  const worker: Worker=spec.worker;
  if(!worker || !worker.instance || !worker.context) throw new Error('Actual worker instance and context are required');
  const paths=spec.paths??[];
  await event('assignment.start',{id,item,activity,role:spec.role,worker,inputs:spec.inputs??{},writePaths:paths,affectedPaths:paths,resources:spec.resources??[],allowedActions:['read','write','review','run','import'],deadline:Math.min(Date.now()+3_600_000,s.policy.deadline),deliverables:spec.deliverables??[]});
  const packet=path.join(runtime,'packets',`${id}.json`);
  await exportPacket(store,id,packet);
  return {assignment:id,packet};
}
async function bootstrap() {
  for(const dir of ['artifacts','packets','receipts']) await mkdir(path.join(runtime,dir),{recursive:true});
  const policy={owner:actor,workspace,allowedActions:['read','write','review','run','import'],candidateExclusions:['.git','.agnostic-loop','node_modules','dist','docs/dev-loop'],environmentKeys:['PATH','Path','SystemRoot','SYSTEMROOT','TEMP','TMP'],externalFiles:[],gates:Object.fromEntries(['app-tests','loop-tests','build'].map(name=>[name,{executable:process.execPath,args:[path.join(workspace,'tools/repository-gate.mjs'),name],resources:['workspace']} ])),concurrency:1,deadline:Date.now()+6*3_600_000,maxAssignments:60,commandTimeout:300_000};
  await store.init(policy);
  await writeFile(path.join(runtime,'policy.json'),JSON.stringify(policy,null,2));
  await event('item.create',{id:item,objective:'Implement and independently verify the supplied Throughline React app for local Vercel handoff',owner:actor,affectedPaths:[...rootPaths,...artifactNames.map(artifactPath)],dependencies:[],criteria,requiredArtifacts:{'criteria-accepted':['criteria'],'design-accepted':['design'],'ready-to-build':['plan','test-design']},requiredGates:['app-tests','loop-tests','build'],triage:{accessibility:'Responsive keyboard and error recovery verification required',privacy:'Fictional data, no account or service integration',reliability:'Versioned local state, explicit approval invalidation and safe storage recovery',deployment:'User handles Vercel; local delivery only'}});
  return {state:store.directory,deadline:policy.deadline,limits:'Manual host, operator-attested identities; no automatic dispatch or live provider qualification'};
}
async function main() {
  const [command, filename]=process.argv.slice(2);
  if(command==='bootstrap') return bootstrap();
  if(command==='status') { const s=await store.load();return {revision:s.revision,item:s.items[item],activities:s.activities,assignments:Object.values(s.assignments).map(({id,status,role})=>({id,status,role})),evidence:Object.values(s.evidence).map(({id,gate,exitCode})=>({id,gate,exitCode})),candidate:(await store.context(s)).candidate.digest}; }
  const spec=JSON.parse(await readFile(requireText(filename,'JSON request path'),'utf8'));
  if(command==='start') return start(spec);
  if(command==='author') {
    if(!artifactNames.includes(spec.artifact)) throw new Error('Unknown artifact');
    const output=artifactPath(spec.artifact);
    await start({...spec,paths:[output],deliverables:[spec.id??spec.artifact]});
    await writeFile(path.join(workspace,output),await readFile(spec.source));
    const imported=await importArtifact(store,spec.assignment,spec.id??spec.artifact,path.join(workspace,output),actor);
    await result(spec.assignment,'assignment.finish',{});
    return imported;
  }
  if(command==='import') {
    const output=artifactPath(spec.artifact);
    await writeFile(path.join(workspace,output),await readFile(spec.source));
    return importArtifact(store,spec.assignment,spec.artifact,path.join(workspace,output),actor);
  }
  if(command==='finish') return result(spec.assignment,'assignment.finish',{});
  if(command==='review') {
    const s=await store.load(), artifact=s.artifacts[spec.artifact];
    if(!artifact || artifact.hash!==spec.hash) throw new Error('Review exact artifact/hash required');
    const bytes=await readFile(spec.reportPath);
    if(digest(bytes)!==spec.reportHash) throw new Error('Review report hash mismatch');
    if(!bytes.toString('utf8').trim()) throw new Error('Empty review report');
    const report=await store.blob(bytes);
    await start({...spec,activity:artifact.activity,role:'checker',paths:[],deliverables:[]});
    await result(spec.assignment,'review.record',{artifact:artifact.id,hash:artifact.hash,verdict:spec.verdict,findings:spec.findings??[]});
    await result(spec.assignment,'assignment.finish',{});
    await writeFile(path.join(runtime,'receipts',`${spec.assignment}-source.json`),JSON.stringify({reportPath:path.resolve(spec.reportPath),reportBlob:report,worker:spec.worker,artifact:artifact.id,artifactHash:artifact.hash},null,2));
    return {artifact:artifact.id,verdict:spec.verdict,reportBlob:report};
  }
  if(command==='advance') return event('item.advance',{item,status:spec.status,artifacts:spec.artifacts??[],evidence:spec.evidence??[]});
  if(command==='gates') { const results=[]; for(const gate of spec.gates) results.push(await runGate(store,spec.assignment,gate,actor));return results; }
  if(command==='verify-report') {
    const s=await store.load(), a=s.assignments[spec.assignment]; if(!a) throw new Error('Unknown verifier');
    const report:VerificationReport={candidate:(await store.context(s)).candidate,worker:a.worker,criteria:spec.criteria,limitations:spec.limitations};
    const output=artifactPath('verification');await writeFile(path.join(workspace,output),JSON.stringify(report,null,2));
    await importArtifact(store,a.id,'verification',path.join(workspace,output),actor);
    return result(a.id,'verification.record',{artifact:'verification',report});
  }
  if(command==='final-report') {
    const s=await store.load();
    const report:FinalReport={candidate:(await store.context(s)).candidate,verificationArtifact:'verification',regressionEvidence:spec.evidence,wholeChangeReviewArtifact:'whole-change',residuals:spec.residuals??[],delivery:'local'};
    const output=artifactPath('final-report');await writeFile(path.join(workspace,output),JSON.stringify(report,null,2));
    await importArtifact(store,spec.assignment,'final-report',path.join(workspace,output),actor);
    return result(spec.assignment,'final.record',{artifact:'final-report',report});
  }
  throw new Error('Use bootstrap, status, start, author, import, finish, review, advance, gates, verify-report, or final-report');
}
main().then(value=>console.log(JSON.stringify(value,null,2))).catch(error=>{console.error(error instanceof Error?error.message:String(error));process.exitCode=1;});

