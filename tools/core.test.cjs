const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../web/core.js');

test('default addresses a single CATA strip with exactly 150 physical LEDs',()=>{
 const d=C.validate(C.defaults());
 assert.deepEqual(d.paths.map(p=>p.count),[150]);
 assert.equal(d.host,'192.168.1.164');
 assert.equal(d.paths[0].offset,0);
 assert.equal(d.paths[0].reverse,false);
 assert.match(d.paths[0].name,/GPIO25/);
});
test('curve sampling preserves endpoints and nearly equal LED spacing',()=>{
 const p=C.defaults().paths[0].points,s=C.sample(p,1200);
 assert.deepEqual(s[0],p[0]);assert.deepEqual(s.at(-1),p.at(-1));
 const lengths=s.slice(1).map((x,i)=>Math.hypot(x[0]-s[i][0],x[1]-s[i][1]));
 assert.ok(Math.max(...lengths)/Math.min(...lengths)<1.1);
});
function frame(count,version=1){
 const a=new Uint8Array((version===1?2:4)+count*3);a[0]=76;a[1]=version;
 if(version===2){a[2]=count>>8;a[3]=count&255;}
 for(let i=0;i<count;i++){const j=(version===1?2:4)+3*i;a[j]=i%256;a[j+1]=(i+3)%256;a[j+2]=(i+7)%256;}
 return a;
}
test('WLED Peek v1 240 LED stream crops output at index 149',()=>{
 const a=frame(240);let f=C.parseFrame(a.buffer);
 assert.equal(f.length,450);
 assert.deepEqual([...f.slice(0,3)],[0,3,7]);
 assert.deepEqual([...f.slice(-3)],[149,152,156]);
 a[2+150*3]=255;assert.equal(C.parseFrame(a.buffer).length,450);
 assert.deepEqual([...C.parseFrame(a.buffer).slice(-3)],[149,152,156]);
});
test('WLED Peek v2 240 LED stream and standalone 150 both work',()=>{
 for(const count of [150,240])for(const version of [1,2]){
  const f=C.parseFrame(frame(count,version).buffer);
  assert.equal(f.length,450);assert.equal(f[0],0);assert.equal(f[447],149);
 }
});
test('reject broken WLED headers, incomplete data and too-small outputs',()=>{
 assert.equal(C.parseFrame(frame(149).buffer),null);
 assert.equal(C.parseFrame(frame(240).slice(0,100).buffer),null);
 const bad=frame(240);bad[0]=0;assert.equal(C.parseFrame(bad.buffer),null);
 const malformed=frame(240,2);malformed[3]=241;assert.equal(C.parseFrame(malformed.buffer),null);
 const trailing=Uint8Array.from([...frame(150),0]);assert.equal(C.parseFrame(trailing.buffer),null);
});
test('legacy neutral 120+30 design imports as one 150-LED geometry',()=>{
 const old=require('../examples/mirror-infinity.json');
 const d=C.validate(old);
 assert.deepEqual(d.paths.map(p=>p.count),[150]);
 assert.deepEqual(d.paths[0].points[0],old.paths[0].points[0]);
 assert.deepEqual(d.paths[0].points.at(-1),old.paths[1].points.at(-1));
 assert.equal(d.paths[0].points.length,old.paths[0].points.length+old.paths[1].points.length-1);
 assert.equal(old.paths.length,2);
});
test('legacy separately offset/reversed designs keep their precise physical mapping',()=>{
 const old=structuredClone(require('../examples/mirror-infinity.json'));
 old.paths[0].reverse=true;old.paths[1].offset=17;
 const d=C.validate(old);assert.deepEqual(d.paths.map(p=>p.count),[120,30]);
 assert.equal(d.paths[0].reverse,true);assert.equal(d.paths[1].offset,17);
 assert.deepEqual(d.paths[1].points[0],d.paths[0].points.at(-1));
 for(const [base,path]of [[0,d.paths[0]],[120,d.paths[1]]])
  for(let k=0;k<path.count;k++){const i=C.indexAt(path,k,base);assert.ok(i>=base&&i<base+path.count)}
});
test('direction/offset cannot map CATA strip colors into the second GPIO16 output',()=>{
 for(const reverse of [false,true])for(const offset of [-3,0,5,149,151])
 for(let k=0;k<150;k++){let i=C.indexAt({count:150,offset,reverse},k,0);assert.ok(i>=0&&i<150)}
});
test('validation checks path, malformed coordinates and recording frames',()=>{
 const d=C.defaults();d.paths[0].points[1][0]=null;assert.throws(()=>C.validate(d));
 const e=C.defaults();e.recording={duration:100,frames:[{t:0,rgb:'bad'}]};assert.throws(()=>C.validate(e));
 const f=C.defaults();f.recording={duration:100,frames:[{t:0,rgb:Buffer.alloc(450).toString('base64')}]};assert.equal(C.validate(f).recording.frames.length,1);
 const g=C.defaults();g.paths[0].count=240;assert.throws(()=>C.validate(g));
});
test('factory default is the portable 150-addressable-LED file',()=>{
 assert.deepEqual(C.defaults(),require('../examples/cata-150-addressable.json'));
});
test('editing a default cannot mutate future defaults',()=>{
 let a=C.defaults(),b=C.defaults();a.paths[0].points[0][0]+=99;a.glow=0;assert.deepEqual(C.defaults(),b);
});
