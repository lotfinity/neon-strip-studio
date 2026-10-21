const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),core=require('../web/core.js');
function harness(){let frames=[],strokes=0,paths=0,webglAttempts=0;const elements=new Map(),context2d={setTransform(){},clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){strokes++},createLinearGradient(){return{addColorStop(){}}}};
function element(id){return {id,value:id==='section'?'0':'',checked:false,style:{},classList:{contains(){return false},toggle(){}},addEventListener(){},replaceChildren(){},append(){},before(){},click(){}}}
const fallback={...element('lights'),clientWidth:1200,clientHeight:600,width:300,height:150,getContext(){return context2d}};
context2d.canvas=fallback;
const canvas={...fallback,getContext(){webglAttempts++;return null},cloneNode(){return fallback},replaceWith(next){elements.set('lights',next)}};elements.set('lights',canvas);
const document={hidden:false,body:element('body'),activeElement:{tagName:'BODY'},getElementById(id){if(!elements.has(id))elements.set(id,element(id));return elements.get(id)},addEventListener(){}};
const window={neonNative:{lowPower:true},addEventListener(){}};
const sandbox={StripCore:core,document,window,devicePixelRatio:2,URLSearchParams,location:{search:''},performance:{now:()=>0},localStorage:{getItem(){return null},setItem(){throw Error('Playback should not overwrite the saved design')}},requestAnimationFrame(fn){frames.push(fn)},Path2D:class{constructor(){paths++}moveTo(){}lineTo(){}},setTimeout(){},clearTimeout(){},console,Uint8Array};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../web/app.js'),'utf8'),sandbox);
return {render(time){const fn=frames.shift();assert.ok(fn);fn(time)},get strokes(){return strokes},get paths(){return paths},get webglAttempts(){return webglAttempts},fallback};}
test('low-power playback skips unsupported WebGL and caches one path per LED group',()=>{const h=harness();h.render(100);assert.equal(h.webglAttempts,0);assert.equal(h.paths,150);assert.equal(h.strokes,300);h.render(150);assert.equal(h.paths,150);assert.equal(h.strokes,600)});
test('compatibility playback caps its frame rate without changing the saved 60 fps profile',()=>{const h=harness();h.render(100);const before=h.strokes;h.render(116);h.render(133);assert.equal(h.strokes,before);h.render(150);assert.equal(h.strokes,before+300);assert.equal(core.defaults().fps,60)});
test('compatibility playback avoids high-DPI software pixel multiplication',()=>{const h=harness();h.render(100);assert.equal(h.fallback.width,1200);assert.equal(h.fallback.height,600)});
