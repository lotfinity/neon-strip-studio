'use strict';
const {WebSocketServer,WebSocket}=require('ws');
function createRelay({host='127.0.0.1',port=0,target=null}={}){
 const channels=new Map(),server=new WebSocketServer({host,port,path:'/ws',maxPayload:2048});
 server.on('connection',(client,request)=>{let address;try{address=target||new URL(request.url,'http://localhost').searchParams.get('target');const url=new URL('ws://'+address+'/ws');if(!address||url.username||url.password||url.pathname!=='/ws'||url.search||url.hash)throw Error();address=url.host}catch{client.close(1008,'Invalid controller');return}
 let channel=channels.get(address);if(!channel){const upstream=new WebSocket('ws://'+address+'/ws',{handshakeTimeout:8000,maxPayload:65536});channel={upstream,clients:new Set()};channels.set(address,channel);upstream.on('open',()=>upstream.send('{"lv":true}'));upstream.on('message',(data,binary)=>{if(!binary||data[0]!==76)return;for(const c of channel.clients)if(c.readyState===WebSocket.OPEN&&c.bufferedAmount<1048576)c.send(data,{binary:true})});const end=()=>{if(channels.get(address)===channel)channels.delete(address);for(const c of channel.clients)c.close(1011,'Controller disconnected')};upstream.on('error',()=>{});upstream.on('close',end)}
 channel.clients.add(client);client.on('error',()=>{});client.on('close',()=>{channel.clients.delete(client);if(!channel.clients.size){if(channels.get(address)===channel)channels.delete(address);channel.upstream.terminate()}});
 // Never forward viewer commands to the controller: this relay is preview-only.
 });
 server.on('error',()=>{});
 return {server,channels,ready:new Promise((resolve,reject)=>{server.once('listening',()=>resolve(server.address()));server.once('error',reject)}),close:()=>{for(const ch of channels.values()){for(const c of ch.clients)c.terminate();ch.upstream.terminate()}server.close()}};
}
module.exports={createRelay};
if(require.main===module){const host=process.argv.includes('--lan')?'0.0.0.0':'127.0.0.1',target=process.argv[2]||'192.168.1.164',port=Number(process.env.NEON_RELAY_PORT)||8787;const relay=createRelay({host,port,target});relay.ready.then(()=>console.log(`Preview relay listening on ${host}:${port}; controller ${target}. Enter this computer's LAN address:${port} in every player. No lighting commands are forwarded.`)).catch(e=>{console.error(e.message);process.exit(1)});process.on('SIGINT',()=>{relay.close();process.exit()})}
