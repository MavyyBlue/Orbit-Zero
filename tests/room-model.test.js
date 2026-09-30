import test from 'node:test';
import assert from 'node:assert/strict';
import { freshSave, parseSave, SKINS, buyDecor, roomFor } from '../web/save.js';
import { DECOR } from '../web/decor.js';
import { ROOM_DESIGNS, defaultRoom, itemFor, placementFeedback, anchorsFor, findPosition, placeItem, normalizeRoom } from '../web/room-model.js';
import { encounter, predict, launchVector } from '../web/simulation.js';

test('all five distinct defaults have four furniture pieces, individual stars and clear geometry',()=>{
  assert.equal(new Set(Object.values(ROOM_DESIGNS).map(r=>JSON.stringify(r))).size,5);
  for(const ship of SKINS){const room=defaultRoom(ship);assert.equal(room.placements.filter(p=>itemFor(ship,p.item).slot!=='decal').length,4,ship.shape);
    assert.equal(room.placements.filter(p=>p.item==='base-stars').length,2);
    for(const p of room.placements)assert.equal(placementFeedback(ship,room,p.item,p,p.id),'',`${ship.shape}/${p.item}`);
    assert.deepEqual(normalizeRoom(ship,room,[]),room);
  }
});
test('legacy room migration preserves every purchased license, progress, settings and independent finishes',()=>{
  const old={version:1,best:8024,runs:25,gates:91,near:123,victories:7,shards:421,skin:'ember',owned:SKINS.map(s=>s.id),decorOwned:DECOR.map(d=>d.id),settings:{aimDeadZone:8,sound:false},daily:{'2026-09-20':990},rooms:Object.fromEntries(SKINS.map(s=>[s.id,{color:'#4267af',slots:{seat:'hammock',console:'holo_table',plant:'glow_fern',lamp:'star_lantern',decal:'hearts'}}]))};
  const saved=JSON.stringify(old),s=parseSave(saved);assert.deepEqual(s.decorOwned,DECOR.map(d=>d.id));
  for(const k of ['best','runs','gates','near','victories','shards','skin','owned','daily'])assert.deepEqual(s[k],old[k]);
  assert.equal(s.settings.aimDeadZone,8);assert.equal(s.settings.sound,false);
  for(const ship of SKINS){const room=s.rooms[ship.id];assert.equal(room.roomVersion,2);assert.equal(room.finishes.wall.color,'#4267af');assert.notEqual(room.finishes.floor.color,room.finishes.wall.color);
    for(const p of room.placements)assert.equal(placementFeedback(ship,room,p.item,p,p.id),'');}
  assert.equal(JSON.stringify(old),saved,'does not mutate old input');assert.deepEqual(parseSave(JSON.stringify(s)),s,'repeated migration is stable');
});
test('buying grants inventory only, charges once, and leaves other rooms untouched',()=>{
  const s=freshSave();s.shards=1200;s.owned.push('ember');const before=JSON.stringify(roomFor(s,'ion'));
  assert.equal(buyDecor(s,'ion','holo_table'),true);assert.equal(s.shards,550);assert.equal(JSON.stringify(s.rooms.ion),before);
  assert.equal(buyDecor(s,'ember','holo_table'),true);assert.equal(s.shards,550);assert.equal(s.rooms.ember,undefined);
  assert.equal(buyDecor(s,'ion','neon_strip'),false);assert.equal(buyDecor(s,'flare','hearts'),false);assert.equal(s.shards,550);
});
test('floor footprints, wall and ceiling anchors, window clearance and bounds reject bad moves',()=>{
  for(const ship of SKINS){const room=defaultRoom(ship),seat=room.placements.find(p=>p.item==='base-seat');
    assert.match(placementFeedback(ship,room,'base-seat',{x:.5,y:.3},seat.id),/floor/);
    assert.match(placementFeedback(ship,room,'base-seat',{x:0,y:.8},seat.id),/inside/);
    assert.notEqual(placementFeedback(ship,room,'orb_cushion',seat),'');
    const window=ROOM_DESIGNS[ship.shape].window;assert.match(placementFeedback(ship,room,'base-stars',{x:window[0],y:window[1]+.035}),/window/);
    assert.match(placementFeedback(ship,room,'star_lantern',{x:.5,y:.9}),/ceiling/);
  }
});
test('multiple furniture of a category, repeated individual decals, store and rearrange never change stardust',()=>{
  const ship=SKINS[0],s=freshSave();s.decorOwned=['orb_cushion','hearts'];s.shards=941;const room=roomFor(s,ship.id);
  for(const [id,item] of [['cushion','orb_cushion'],['heart-a','hearts'],['heart-b','hearts']]){
    const point=findPosition(ship,room,item);assert.ok(point);assert.equal(placeItem(ship,room,s.decorOwned,item,point,id,id==='heart-b'?5:0),true);
  }
  assert.equal(room.placements.filter(p=>itemFor(ship,p.item).slot==='seat').length,2);
  assert.equal(room.placements.filter(p=>p.item==='hearts').length,2);
  const before=JSON.stringify(room);assert.equal(placeItem(ship,room,s.decorOwned,'orb_cushion',{x:.5,y:.5},'cushion'),false);assert.equal(JSON.stringify(room),before);
  room.placements=room.placements.filter(p=>p.id!=='cushion');assert.equal(s.shards,941);assert.ok(s.decorOwned.includes('orb_cushion'));
  const point=findPosition(ship,room,'orb_cushion');assert.equal(placeItem(ship,room,s.decorOwned,'orb_cushion',point,'cushion-again'),true);assert.equal(s.shards,941);
});
test('corrupt or crowded placements safely become stored items; licenses are never discarded',()=>{
  const ship=SKINS[0],room=defaultRoom(ship),owned=DECOR.map(d=>d.id);
  room.placements=[{id:'same',item:'hammock',x:-900,y:900,variant:999},{id:'same',item:'holo_table',x:.5,y:.9},{id:'unowned',item:'unknown',x:.2,y:.8},...Array.from({length:80},(_,i)=>({id:`h-${i}`,item:'hearts',x:.5,y:.3,variant:i}))];
  room.lighting={color:'url(evil)',brightness:999};room.view='external';room.finishes.floor={color:'red',style:'evil'};
  const result=normalizeRoom(ship,room,owned);assert.ok(result.placements.length<=48);assert.equal(new Set(result.placements.map(p=>p.id)).size,result.placements.length);
  for(const p of result.placements)assert.equal(placementFeedback(ship,result,p.item,p,p.id),'');
  assert.equal(result.lighting.brightness,100);assert.equal(result.lighting.color,'#ffe4b0');assert.equal(result.view,'home');assert.equal(result.finishes.floor.style,'original');assert.equal(owned.length,11);
});
test('room mutations have no path into authoritative prediction',()=>{
  const world=encounter(57,9),v=launchVector(40,100),before=predict(v,world);const s=freshSave();s.shards=50000;
  for(const ship of SKINS){s.owned.push(ship.id);for(const item of DECOR)buyDecor(s,ship.id,item.id);const r=roomFor(s,ship.id);r.lighting.brightness=0;r.view='rings';r.finishes.floor.color='#000000';r.placements=[];}
  assert.deepEqual(predict(v,world),before);
});
test('every supported item can be placed in an empty room in all five ships',()=>{
  for(const ship of SKINS)for(const item of DECOR){const room=defaultRoom(ship);room.placements=[];const p=findPosition(ship,room,item.id);assert.ok(p,`${ship.shape}/${item.id}`);assert.ok(anchorsFor(itemFor(ship,item.id)).length>20);}
});
