(function(root){
'use strict';
const DEFAULT_DESIGN={"version":1,"name":"CATA addressable strip — 150 LEDs","host":"192.168.1.164","glow":0.8,"brightness":0.65,"rotation":0,"fps":30,"autoConnect":true,"paths":[{"name":"CATA / GPIO25 / LEDs 0–149","count":150,"reverse":false,"offset":0,"points":[[0,17],[25,17],[50,17],[75,17],[100,17],[125,17],[150,17]]}],"recording":null};
function defaults(){return JSON.parse(JSON.stringify(DEFAULT_DESIGN))}
function curve(points,steps=48){let out=[];const lerp=(a,b,ta,tb,t)=>a.map((v,k)=>((tb-t)*v+(t-ta)*b[k])/(tb-ta||1));for(let i=0;i<points.length-1;i++){const b=points[i],c=points[i+1],a=i?points[i-1]:b.map((v,k)=>2*v-c[k]),d=i+2<points.length?points[i+2]:c.map((v,k)=>2*v-b[k]);const dt=(x,y)=>Math.max(.00001,Math.sqrt(Math.hypot(x[0]-y[0],x[1]-y[1]))),t0=0,t1=dt(a,b),t2=t1+dt(b,c),t3=t2+dt(c,d);for(let j=0;j<steps;j++){const t=t1+(t2-t1)*j/steps,A=lerp(a,b,t0,t1,t),B=lerp(b,c,t1,t2,t),D=lerp(c,d,t2,t3,t),E=lerp(A,B,t0,t2,t),F=lerp(B,D,t1,t3,t);out.push(lerp(E,F,t1,t2,t))}}out.push(points[points.length-1].slice());return out}
function sample(points,n){const raw=curve(points),lengths=[0];for(let i=1;i<raw.length;i++)lengths.push(lengths[i-1]+Math.hypot(raw[i][0]-raw[i-1][0],raw[i][1]-raw[i-1][1]));const total=lengths.at(-1);if(!total)throw Error('The path must have some length');let out=[],j=1;for(let i=0;i<=n;i++){let dist=i/n*total;while(j<lengths.length-1&&lengths[j]<dist)j++;let t=(dist-lengths[j-1])/(lengths[j]-lengths[j-1]||1);out.push(raw[j-1].map((v,k)=>v+(raw[j][k]-v)*t))}return out}
function validate(value){if(!value||value.version!==1||!Array.isArray(value.paths))throw Error('Not a Neon Strip Studio design');let v=JSON.parse(JSON.stringify(value));
// Existing saved mirror/infinity designs remain importable. Convert the two
// geometry sections into one continuous run of 150 LEDs without reordering
// any physical pixel. The second 90-LED GPIO16 output is never part of a design.
if(v.paths.length===2&&v.paths[0].count===120&&v.paths[1].count===30){
 let first=v.paths[0],second=v.paths[1];
 if(!Array.isArray(first.points)||!Array.isArray(second.points))throw Error('Invalid saved strip geometry');
 if(!first.reverse&&!second.reverse&&!first.offset&&!second.offset){
  v.paths=[{name:'CATA / GPIO25 / LEDs 0–149',count:150,reverse:false,offset:0,points:[...first.points,...second.points.slice(1)]}];
 } // Keep old custom mappings if their subpaths use independent offsets/reversal.
}
if(!((v.paths.length===1&&v.paths[0].count===150)||
    (v.paths.length===2&&v.paths[0].count===120&&v.paths[1].count===30)))
 throw Error('Expected 150 addressable LEDs on GPIO25');
for(let i=0;i<v.paths.length;i++){
 let p=v.paths[i];if(!Array.isArray(p.points)||p.points.length<2||p.points.length>200)throw Error('Invalid strip geometry');
 if(p.points.some(x=>!Array.isArray(x)||x.length!==2||x.some(n=>!Number.isFinite(n)||Math.abs(n)>10000)))throw Error('Invalid path coordinates');
 p.offset=Math.trunc(Number(p.offset)||0);p.reverse=!!p.reverse;p.name=String(p.name||'CATA / GPIO25').slice(0,100);
}
if(v.paths.length===2)v.paths[1].points[0]=v.paths[0].points.at(-1).slice();
v.host=String(v.host||'192.168.1.164').slice(0,200);v.glow=Math.max(0,Math.min(2,Number(v.glow)||0));v.brightness=Math.max(.1,Math.min(1,Number(v.brightness)||.8));v.fps=[20,30,60].includes(v.fps)?v.fps:30;v.rotation=[0,90].includes(v.rotation)?v.rotation:0;v.autoConnect=!!v.autoConnect;v.name=String(v.name||'My strip').slice(0,100);if(v.recording){const r=v.recording;if(!Array.isArray(r.frames)||!r.frames.length||r.frames.length>9000||!Number.isFinite(r.duration)||r.duration<=0||r.duration>3600000)throw Error('Invalid recording');let last=-1;for(const f of r.frames){if(!Number.isFinite(f.t)||f.t<0||f.t<last||f.t>r.duration||typeof f.rgb!=='string'||!/^[A-Za-z0-9+/]{600}$/.test(f.rgb))throw Error('Invalid recording frame');last=f.t}}return v}
function parseFrame(buffer){
 // WLED JSON /cfg shows output #1: GPIO25, start 0, len 150;
 // output #2: GPIO16, start 150, len 90. Peek sends the combined 240 pixels.
 // We VIEW only the first output; nothing can write to WLED from this parser.
 let a=new Uint8Array(buffer);if(a.length<452||a[0]!==76||![1,2].includes(a[1]))return null;
 let start=a[1]===2?4:2;
 let count=(a.length-start)/3;
 // WLED type 2 usually uses a width × height header. Also tolerate a
 // two-byte count when the unambiguous packet size matches that encoding.
 if(a[1]===2&&count!==a[2]*a[3]&&count!==(a[2]*256+a[3]))return null;
 if(!Number.isInteger(count)||count<150||count>2048)return null;
 return a.slice(start,start+450);
}
function indexAt(path,k,base){let c=path.count,k0=Math.max(0,Math.min(c-1,k));return base+((path.reverse?c-1-k0:k0)+(path.offset%c+c)%c)%c}
const api={defaults,curve,sample,validate,parseFrame,indexAt};if(typeof module!=='undefined')module.exports=api;else root.StripCore=api;
})(globalThis);
