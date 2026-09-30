import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomEditor } from '../web/room-editor.js';
import { freshSave, parseSave, SAVE_KEY } from '../web/save.js';
import { findPosition, itemFor, placementFeedback } from '../web/room-model.js';
import { roomDOM } from './room-dom.js';
const fixture=(width=360,height=420)=>{const dom=roomDOM(width,height),s=freshSave();s.shards=2000;s.best=3000;s.settings.aimDeadZone=7;const settings=s.settings;const memory=new Map();let fail=false;const storage={setItem(k,v){if(fail)throw Error('quota');memory.set(k,v);}};const editor=new RoomEditor(dom.root,s,storage,'ion',{onStorage(){},onExit(){}});return {...dom,s,settings,memory,editor,fail:()=>{fail=true;},el:id=>dom.elements.get(id)};};

test('previews never charge; explicit purchase confirms atomically and undo retains ownership',()=>{
  const f=fixture(),e=f.editor,before=JSON.stringify(f.s);e.beginPreview('orb_cushion');assert.ok(e.preview);assert.equal(JSON.stringify(f.s),before);
  f.el('previewCancel').onclick();assert.equal(JSON.stringify(f.s),before);
  e.beginPreview('orb_cushion');const confirm=f.el('previewConfirm').onclick;confirm();confirm();assert.equal(f.s.shards,1800);assert.deepEqual(f.s.decorOwned,['orb_cushion']);assert.equal(e.room.placements.filter(p=>p.item==='orb_cushion').length,1);
  assert.strictEqual(f.s.settings,f.settings,'sound settings reference remains stable');
  f.el('roomUndo').onclick();assert.equal(e.room.placements.filter(p=>p.item==='orb_cushion').length,0);assert.equal(f.s.shards,1800);assert.deepEqual(f.s.decorOwned,['orb_cushion']);
  e.beginPreview('orb_cushion');f.el('previewConfirm').onclick();assert.equal(f.s.shards,1800);const p=e.room.placements.find(p=>p.item==='orb_cushion');e.selected=p.id;e.update();f.el('roomStore').onclick();assert.equal(f.s.shards,1800);assert.ok(f.s.decorOwned.includes('orb_cushion'));
  assert.deepEqual(parseSave(f.memory.get(SAVE_KEY)).rooms.ion,e.room);
});
test('failed storage leaves purchase, ownership and room untouched',()=>{
  const f=fixture(),e=f.editor,before=JSON.stringify(f.s);e.beginPreview('holo_table');assert.ok(e.preview);f.fail();f.el('previewConfirm').onclick();assert.equal(JSON.stringify(f.s),before);assert.ok(e.preview);assert.match(f.el('roomStatus').textContent,/Could not save/);
});
test('insufficient funds and invalid placement never charge even if handler invoked',()=>{
  const f=fixture();f.s.shards=1;f.editor.beginPreview('orb_cushion');assert.equal(f.el('previewConfirm').disabled,true);f.el('previewConfirm').onclick();assert.equal(f.s.shards,1);assert.deepEqual(f.s.decorOwned,[]);
  f.s.shards=2000;f.editor.preview.x=-10;f.el('previewConfirm').onclick();assert.equal(f.s.shards,2000);assert.deepEqual(f.s.decorOwned,[]);
});
test('touch input at three phone widths honors owner pointer, valid movement, cancellation and undo',()=>{
  for(const [width,height] of [[320,350],[360,420],[412,700]]){
    const f=fixture(width,height),e=f.editor;e.decorate=true;e.update();const p=e.room.placements.find(p=>p.item==='base-seat'),target=f.el(`placed-${p.id}`),down={pointerId:1,clientX:p.x*width,clientY:(p.y-.1)*height,target,preventDefault(){}};
    const point=findPosition(e.ship,e.room,p.item,{x:.52,y:.90},p.id);assert.ok(point);assert.notDeepEqual(point,{x:p.x,y:p.y});
    e.pointerDown(down);assert.equal(e.drag.pointer,1);e.pointerDown({...down,pointerId:2});e.pointerMove({...down,pointerId:2,clientX:0});assert.equal(e.drag.proposed.x,p.x);e.pointerUp({...down,pointerId:2});assert.ok(e.drag);
    e.pointerMove({...down,clientX:down.clientX+(point.x-p.x)*width,clientY:down.clientY+(point.y-p.y)*height});e.pointerUp(down);const moved=e.room.placements.find(q=>q.id===p.id);assert.equal(moved.x,point.x);assert.equal(moved.y,point.y);assert.equal(f.s.shards,2000);assert.equal(e.undo.length,1);
    e.pointerDown({...down,target:f.el(`placed-${p.id}`),clientX:moved.x*width,clientY:(moved.y-.1)*height});e.pointerMove({...down,clientX:-100,clientY:0});e.cancelDrag();assert.deepEqual(e.room.placements.find(q=>q.id===p.id),moved);
    e.pointerDown({...down,target:f.el(`placed-${p.id}`)});document.hidden=true;f.listeners.get('visibilitychange')();assert.equal(e.drag,null);document.hidden=false;
    f.el('roomUndo').onclick();assert.deepEqual(e.room.placements.find(q=>q.id===p.id),p);assert.equal(f.s.shards,2000);e.destroy();
  }
});
test('separate finishes, lighting, lamp toggles, records and windows persist only cosmetics',()=>{
  const f=fixture(),e=f.editor;e.tab='surfaces';e.update();for(const [part,color] of [['wall','#123456'],['ceiling','#abcdef'],['floor','#405060']]){f.el(`finish-${part}`).value=color;f.el(`finish-${part}`).oninput();f.el(`finish-${part}`).onchange();}
  e.tab='lighting';e.update();f.el('lightBrightness').value='30';f.el('lightBrightness').oninput();f.el('lightBrightness').onchange();f.el('lightColor').value='#ee88aa';f.el('lightColor').onchange();
  const lamp=e.room.placements.find(p=>itemFor(e.ship,p.item).slot==='lamp');e.interact(lamp);assert.equal(e.room.placements.find(p=>p.id===lamp.id).on,false);
  e.interact(e.room.placements.find(p=>itemFor(e.ship,p.item).slot==='console'));assert.equal(e.tab,'records');assert.match(f.el('roomDrawer').innerHTML,/3000/);
  e.tab='views';e.update();f.el('view-rings').onclick();const restored=parseSave(f.memory.get(SAVE_KEY));assert.equal(restored.rooms.ion.view,'rings');assert.equal(restored.rooms.ion.lighting.brightness,30);assert.equal(restored.rooms.ion.lighting.color,'#ee88aa');assert.equal(restored.rooms.ion.finishes.floor.color,'#405060');assert.equal(f.s.settings.aimDeadZone,7);assert.equal(f.s.best,3000);assert.equal(f.s.shards,2000);
  for(const p of restored.rooms.ion.placements)assert.equal(placementFeedback(e.ship,restored.rooms.ion,p.item,p,p.id),'');
});
