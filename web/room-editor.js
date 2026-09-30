import { SKINS, roomFor, buyDecor, writeSave } from './save.js';
import { art, icon } from './ui-art.js';
import { ROOM_DESIGNS, VIEWS, FINISHES, roomCatalog, itemFor, availableItem, spriteBox, footprint, placementFeedback, anchorsFor, findPosition, placeItem, syncLegacySlots } from './room-model.js';

const clone = value => JSON.parse(JSON.stringify(value));
let nextId = 0;
export class RoomEditor {
  constructor(root, save, storage, shipId, callbacks) {
    this.root=root;this.save=save;this.storage=storage;this.ship=SKINS.find(s=>s.id===shipId)||SKINS[0];this.callbacks=callbacks;
    this.room=clone(roomFor(save,this.ship.id));this.undo=[];this.decorate=false;this.selected=null;this.preview=null;this.tab=null;this.inventory='owned';this.filter='all';this.drag=null;this.moving=false;this.destroyed=false;
    this.render();
    this.visibility=()=>{if(document.hidden)this.cancelDrag();};document.addEventListener('visibilitychange',this.visibility);
    this.observer=new ResizeObserver(()=>{this.cancelDrag();if(!this.destroyed)this.paintRoom();});this.observer.observe(this.el('roomStage'));
  }
  el(id){return this.root.querySelector(`#${id}`);}
  destroy(){this.destroyed=true;this.cancelDrag();this.observer?.disconnect();document.removeEventListener('visibilitychange',this.visibility);}
  status(text){this.el('roomStatus').textContent=text;}
  commit(next, {purchase, remember=true}={}) {
    const candidate=clone(this.save);candidate.rooms[this.ship.id]=syncLegacySlots(this.ship,next);
    if(purchase&&!buyDecor(candidate,this.ship.id,purchase)){this.status('Not enough stardust. Your room and balance are unchanged.');return false;}
    if(!writeSave(this.storage,candidate)){this.callbacks.onStorage(false);this.status('Could not save. Your room and balance are unchanged.');return false;}
    if(remember)this.undo.push(clone(this.room));this.undo=this.undo.slice(-30);
    this.save.rooms=candidate.rooms; this.save.shards=candidate.shards; this.save.decorOwned=candidate.decorOwned;this.room=clone(next);this.callbacks.onStorage(true);return true;
  }
  render(){
    const design=ROOM_DESIGNS[this.ship.shape];
    this.root.innerHTML=`<div class="cabin-editor"><header class="cabin-header"><button id="roomBack" aria-label="Back to hangar">${icon('icon_back')}</button><div><strong>${this.ship.name}</strong><small>${design.name}</small></div><button id="roomDecorate" aria-pressed="false">Decorate</button></header><div id="roomStage" class="cabin-stage ship-${this.ship.shape}" aria-label="${this.ship.name} cosmetic room"><div class="cabin-shell"><div class="cabin-surface cabin-ceiling" id="ceilingSurface"></div><div class="cabin-surface cabin-wall" id="wallSurface"></div><div class="cabin-surface cabin-floor" id="floorSurface"></div><div class="cabin-ribs"></div></div><button id="roomWindow" class="cabin-window" aria-label="Choose the space view"><span class="space-view" id="spaceView"><span class="view-planet"></span></span><img src="${art(`interiors/${this.ship.shape}/window_frame`)}" alt=""></button><div id="roomObjects"></div><div id="roomGuides" aria-hidden="true"></div><div id="roomGhost"></div><div class="cabin-light" id="cabinLight"></div><span class="cabin-name">${design.name.toUpperCase()}</span></div><div class="cabin-dock"><p id="roomStatus" role="status" aria-live="polite">Tap a lamp, console or window. Decorate to rearrange.</p><div id="roomSelection" class="cabin-selection"></div><div id="roomActions" class="cabin-actions" hidden><button id="roomMove">Move</button><button id="roomStore">Store</button><button id="roomUndo">Undo</button><button id="roomDone">Done</button></div><div id="roomPurchase" class="cabin-purchase" hidden></div><div id="roomDrawer" class="cabin-drawer" hidden></div><nav class="cabin-toolbar" aria-label="Room customization"><button id="roomFurniture" aria-expanded="false">${icon('icon_bag')}<span>Furniture</span></button><button id="roomSurfaces" aria-expanded="false">${icon('icon_paint')}<span>Surfaces</span></button><button id="roomLighting" aria-expanded="false">${icon('icon_sparkle')}<span>Lighting</span></button></nav></div></div>`;
    this.el('roomBack').onclick=()=>this.callbacks.onExit();
    this.el('roomDecorate').onclick=()=>{this.decorate=!this.decorate;this.selected=null;this.preview=null;this.moving=false;this.tab=null;this.update();};
    for(const [id,tab] of [['roomFurniture','furniture'],['roomSurfaces','surfaces'],['roomLighting','lighting']])this.el(id).onclick=()=>{this.cancelDrag();this.preview=null;this.tab=this.tab===tab?null:tab;this.update();};
    this.el('roomWindow').onclick=()=>{if(this.decorate){this.status('Windows stay fixed. Tap Done to choose a view.');return;}this.tab=this.tab==='views'?null:'views';this.update();};
    this.el('roomDone').onclick=()=>{this.cancelDrag();this.decorate=false;this.preview=null;this.selected=null;this.tab=null;this.moving=false;this.update();};
    this.el('roomMove').onclick=()=>{this.tab=null;this.moving=!this.moving;this.update();this.status(this.moving?'Tap a green anchor or drag the selected item.':'Select and drag an item.');};
    this.el('roomStore').onclick=()=>{const next=clone(this.room);next.placements=next.placements.filter(p=>p.id!==this.selected);if(this.commit(next)){this.selected=null;this.moving=false;this.update();this.status('Stored in Owned inventory. No stardust charged.');}};
    this.el('roomUndo').onclick=()=>{const previous=this.undo.at(-1);if(previous&&this.commit(clone(previous),{remember:false})){this.undo.pop();this.selected=null;this.preview=null;this.update();this.status('Room edit undone. Purchased items stay owned.');}};
    const stage=this.el('roomStage');stage.onpointerdown=e=>this.pointerDown(e);stage.onpointermove=e=>this.pointerMove(e);stage.onpointerup=e=>this.pointerUp(e);stage.onpointercancel=e=>{if(this.drag?.pointer===e.pointerId)this.cancelDrag();};stage.onlostpointercapture=e=>{if(this.drag?.pointer===e.pointerId)this.cancelDrag();};
    stage.onkeydown=e=>this.keyMove(e);
    this.update();
  }
  update(){
    if(this.destroyed)return;
    const stage=this.el('roomStage');stage.classList.toggle('is-decorating',this.decorate);this.el('roomDecorate').setAttribute('aria-pressed',String(this.decorate));
    this.el('roomActions').hidden=!this.decorate||!!this.preview;
    this.el('roomStore').disabled=!this.selected;this.el('roomMove').disabled=!this.selected;this.el('roomMove').setAttribute('aria-pressed',String(this.moving));this.el('roomUndo').disabled=!this.undo.length;
    this.el('roomDone').disabled=false;
    for(const [id,tab] of [['roomFurniture','furniture'],['roomSurfaces','surfaces'],['roomLighting','lighting']])this.el(id).setAttribute('aria-expanded',String(this.tab===tab));
    this.paintRoom();this.drawObjects();this.drawPreview();this.drawDrawer();
    const p=this.room.placements.find(p=>p.id===this.selected), item=itemFor(this.ship,this.preview?.item||p?.item);
    this.el('roomSelection').textContent=item?`${item.name} · ${item.mount === 'floor'?'floor footprint':`${item.mount} anchor`}`:'';
    this.el('roomSelection').hidden=false; // Reserve its height so selection never resizes a drag.
    if(!this.preview)this.status(this.decorate?(p?'Drag to move, or tap Move for placement anchors.':'Select furniture or open Owned inventory.'):'Tap a lamp, console or window. Decorate to rearrange.');
  }
  paintRoom(){
    const design=ROOM_DESIGNS[this.ship.shape];
    for(const part of ['wall','ceiling','floor']){
      const surface=this.el(`${part}Surface`),finish=this.room.finishes[part];surface.style.setProperty('--finish-color',finish.color);surface.dataset.finish=finish.style;
      surface.style.backgroundImage=`url("${art(`interiors/${this.ship.shape}/${part}_base`)}")`;
    }
    const window=this.el('roomWindow'),[x,y,w,h]=design.window,rect=this.el('roomStage').getBoundingClientRect();
    const aspect={scout:1,arrow:1.5,manta:3,needle:.5,starling:1}[this.ship.shape],frameWidth=Math.min(w*rect.width,h*rect.height*aspect),frameHeight=frameWidth/aspect;
    Object.assign(window.style,{left:`${x*rect.width-frameWidth/2}px`,top:`${y*rect.height-frameHeight/2}px`,width:`${frameWidth}px`,height:`${frameHeight}px`});
    const view=this.el('spaceView');view.dataset.view=this.room.view;view.style.backgroundImage=this.room.view==='home'?`url("${art(`interiors/${this.ship.shape}/window_view`)}")`:'none';
    const light=this.el('cabinLight');light.style.setProperty('--light-color',this.room.lighting.color);light.style.opacity=String(this.room.lighting.brightness/100*.24);
    this.el('roomStage').style.setProperty('--room-dim',String((100-this.room.lighting.brightness)/100*.30));
  }
  itemMarkup(item,variant=0){
    if(item.id==='base-stars')return icon('icon_sparkle');
    if(item.slot==='decal')return `<span class="single-decal" data-decal="${item.id}" data-variant="${variant}"></span>`;
    return `<img src="${art(item.file)}" alt="" draggable="false">`;
  }
  positionElement(el,item,p){
    Object.assign(el.style,{left:`${p.x*100}%`,top:`${(p.y-item.h)*100}%`,width:`${item.w*100}%`,height:`${item.h*100}%`,zIndex:String(item.mount==='floor'?100+Math.round(p.y*100):30+Math.round(p.y*50))});
    const decal=el.querySelector('.single-decal');if(decal){const cols=item.id==='planets'?3:4,rows=item.id==='bolts'?2:3,v=p.variant%(cols*rows);decal.style.backgroundImage=`url("${art(item.file)}")`;decal.style.backgroundSize=`${cols*100}% ${rows*100}%`;decal.style.backgroundPosition=`${(v%cols)/(cols-1)*100}% ${Math.floor(v/cols)/(rows-1)*100}%`;}
  }
  drawObjects(){
    const objects=this.el('roomObjects');
    objects.innerHTML=this.room.placements.map(p=>{const item=itemFor(this.ship,p.item);return `<button id="placed-${p.id}" class="cabin-item ${item.slot} ${p.on===false?'lamp-off':''} ${this.selected===p.id?'is-selected':''}" data-placement="${p.id}" aria-label="${item.name}${item.slot==='lamp'?`, ${p.on===false?'off':'on'}`:''}${this.decorate?', select and move':''}">${this.itemMarkup(item,p.variant)}</button>`;}).join('');
    for(const p of this.room.placements){const item=itemFor(this.ship,p.item),el=this.el(`placed-${p.id}`);this.positionElement(el,item,p);el.onclick=()=>{if(this.suppressClick)return;if(this.decorate){this.selected=p.id;this.preview=null;this.update();this.el(`placed-${p.id}`)?.focus?.({preventScroll:true});}else this.interact(p);};}
    this.drawGuides();
  }
  interact(p){
    const item=itemFor(this.ship,p.item);
    if(item.slot==='lamp'){const next=clone(this.room);next.placements.find(q=>q.id===p.id).on=p.on===false;if(this.commit(next)){this.update();this.status(`${item.name} ${p.on===false?'on':'off'}.`);}}
    else if(item.slot==='console'){this.tab='records';this.update();}
    else {this.status('Tap Decorate to move or store this item.');}
  }
  drawGuides(){
    const p=this.preview||this.room.placements.find(q=>q.id===this.selected),item=itemFor(this.ship,p?.item),guides=this.el('roomGuides');
    guides.innerHTML='';if(!this.decorate||!item)return;
    guides.innerHTML=anchorsFor(item).map((point,i)=>`<span id="anchor-${i}" class="placement-anchor ${placementFeedback(this.ship,this.room,item.id,point,p.id)?'invalid':'valid'}"></span>`).join('');
    anchorsFor(item).forEach((point,i)=>{Object.assign(this.el(`anchor-${i}`).style,{left:`${point.x*100}%`,top:`${point.y*100}%`});});
    if(item.mount==='floor'){
      const box=footprint(item,p),foot=document.createElement('span');foot.className='selected-footprint';Object.assign(foot.style,{left:`${box.left*100}%`,top:`${box.top*100}%`,width:`${(box.right-box.left)*100}%`,height:`${(box.bottom-box.top)*100}%`});guides.append(foot);
    }
  }
  drawPreview(){
    this.el('roomGhost').innerHTML='';this.el('roomPurchase').hidden=!this.preview;
    if(!this.preview)return;
    const item=itemFor(this.ship,this.preview.item),owned=availableItem(this.ship,this.save.decorOwned,item.id),cost=owned?0:item.price;
    this.el('roomGhost').innerHTML=`<button id="previewGhost" class="cabin-item preview-item" aria-label="Preview ${item.name}. Drag to choose a position.">${this.itemMarkup(item,this.preview.variant)}</button>`;
    this.positionElement(this.el('previewGhost'),item,this.preview);
    const feedback=placementFeedback(this.ship,this.room,item.id,this.preview,this.preview.id);this.el('previewGhost').classList.toggle('invalid-placement',!!feedback);
    this.el('roomPurchase').innerHTML=`<p>${owned?'Owned · placement is free':`${item.price} stardust · balance ${this.save.shards}`}<small>Preview only until you confirm.</small></p>${item.slot==='decal'?`<button id="decalVariant" aria-label="Next decal motif">Motif ${this.preview.variant+1}</button>`:''}<div><button id="previewCancel">Cancel</button><button id="previewConfirm" ${feedback||this.save.shards<cost?'disabled':''}>${owned?'Place item':`Buy · ${item.price}`}</button></div>`;
    this.el('previewCancel').onclick=()=>{this.cancelDrag();this.preview=null;this.update();};
    if(item.slot==='decal')this.el('decalVariant').onclick=()=>{this.preview.variant=(this.preview.variant+1)%(item.id==='base-stars'?1:item.id==='bolts'?8:item.id==='planets'?9:12);this.update();};
    this.el('previewConfirm').onclick=()=>{
      if(!this.preview || this.preview.item!==item.id)return; // Ignore a queued second tap after confirmation.
      const next=clone(this.room),ownership=owned?this.save.decorOwned:[...this.save.decorOwned,item.id];
      if(!placeItem(this.ship,next,ownership,item.id,this.preview,this.preview.id,this.preview.variant)){this.status('Choose a free position before confirming.');return;}
      if(this.commit(next,{purchase:owned?undefined:item.id})){this.selected=this.preview.id;this.preview=null;this.update();this.status(cost?`Purchased once for ${cost} stardust. It is now in Owned inventory.`:'Placed from Owned inventory. No stardust charged.');}
    };
    this.status(feedback||'Green placement. Drag the preview or tap an anchor, then confirm.');
  }
  drawDrawer(){
    const drawer=this.el('roomDrawer');drawer.hidden=!this.tab;if(!this.tab){drawer.innerHTML='';return;}
    const heading=title=>`<div class="drawer-heading"><strong>${title}</strong><button id="drawerClose" aria-label="Close customization panel">✕</button></div>`;
    if(this.tab==='furniture'){
      const catalog=roomCatalog(this.ship).filter(item=>(this.inventory==='owned'?availableItem(this.ship,this.save.decorOwned,item.id):!item.builtin)&&(this.filter==='all'||(this.filter==='decal'?item.slot==='decal':item.slot!=='decal')));
      drawer.innerHTML=`${heading('Furniture & decals')}<div class="inventory-tabs"><button id="inventoryOwned" aria-pressed="${this.inventory==='owned'}">Owned</button><button id="inventoryShop" aria-pressed="${this.inventory==='shop'}">Shop</button><button id="inventoryFilter">${this.filter==='all'?'All items':this.filter==='decal'?'Decals':'Furniture'} ▾</button></div><p class="inventory-note">${this.inventory==='owned'?'Use in any owned ship. Moving and storing are always free.':'One-time unlocks. Preview in your room before confirming a purchase.'}</p><div class="inventory-grid">${catalog.map(item=>{const placed=this.room.placements.some(p=>p.item===item.id),owned=availableItem(this.ship,this.save.decorOwned,item.id);return `<button id="inventory-${item.id}" class="inventory-tile"><span class="inventory-art">${item.slot==='decal'?this.itemMarkup(item):`<img src="${art(item.file)}" alt="">`}</span><span><strong>${item.name}</strong><small>${owned?(placed?'In room':'Stored'):`${item.price} stardust`}</small></span></button>`;}).join('')}</div>`;
      for(const item of catalog){const tile=this.el(`inventory-${item.id}`),decal=tile.querySelector('.single-decal');if(decal)decal.style.backgroundImage=`url("${art(item.file)}")`;tile.onclick=()=>this.beginPreview(item.id);}
      this.el('inventoryOwned').onclick=()=>{this.inventory='owned';this.update();};this.el('inventoryShop').onclick=()=>{this.inventory='shop';this.update();};this.el('inventoryFilter').onclick=()=>{this.filter=this.filter==='all'?'decal':this.filter==='decal'?'furniture':'all';this.update();};
    }else if(this.tab==='surfaces'){
      drawer.innerHTML=`${heading('Separate surface finishes')}<p class="inventory-note">Included finishes · no stardust cost</p>${['wall','ceiling','floor'].map(part=>`<div class="surface-control"><label for="finish-${part}">${part[0].toUpperCase()+part.slice(1)}<input id="finish-${part}" type="color" value="${this.room.finishes[part].color}" aria-label="${part} color"></label><select id="style-${part}" aria-label="${part} finish">${FINISHES.map(style=>`<option value="${style}" ${this.room.finishes[part].style===style?'selected':''}>${style[0].toUpperCase()+style.slice(1)}</option>`).join('')}</select></div>`).join('')}`;
      for(const part of ['wall','ceiling','floor']){
        this.el(`finish-${part}`).oninput=()=>{this.paintRoomPreview(part,this.el(`finish-${part}`).value);};
        this.el(`finish-${part}`).onchange=()=>{const next=clone(this.room);next.finishes[part].color=this.el(`finish-${part}`).value;if(this.commit(next))this.paintRoom();else this.paintRoom();};
        this.el(`style-${part}`).onchange=()=>{const next=clone(this.room);next.finishes[part].style=this.el(`style-${part}`).value;if(this.commit(next))this.paintRoom();};
      }
    }else if(this.tab==='lighting'){
      drawer.innerHTML=`${heading('Cabin lighting')}<p class="inventory-note">Lighting changes are cosmetic and free.</p><label class="light-color">Light color<input id="lightColor" type="color" value="${this.room.lighting.color}"></label><label class="light-range">Brightness <output id="lightValue">${this.room.lighting.brightness}%</output><input id="lightBrightness" type="range" min="0" max="100" value="${this.room.lighting.brightness}"></label>`;
      this.el('lightColor').oninput=()=>this.el('cabinLight').style.setProperty('--light-color',this.el('lightColor').value);
      this.el('lightColor').onchange=()=>{const next=clone(this.room);next.lighting.color=this.el('lightColor').value;this.commit(next);this.paintRoom();};
      this.el('lightBrightness').oninput=()=>{const value=Number(this.el('lightBrightness').value);this.el('lightValue').textContent=`${value}%`;this.el('cabinLight').style.opacity=String(value/100*.24);this.el('roomStage').style.setProperty('--room-dim',String((100-value)/100*.30));};
      this.el('lightBrightness').onchange=()=>{const next=clone(this.room);next.lighting.brightness=Number(this.el('lightBrightness').value);this.commit(next);this.paintRoom();};
    }else if(this.tab==='views'){
      drawer.innerHTML=`${heading('Through the window')}<div class="view-options">${VIEWS.map(view=>`<button id="view-${view}" aria-pressed="${this.room.view===view}">${{home:'Home orbit',nebula:'Violet nebula',rings:'Ringed world',deep:'Deep space'}[view]}</button>`).join('')}</div>`;
      for(const view of VIEWS)this.el(`view-${view}`).onclick=()=>{const next=clone(this.room);next.view=view;if(this.commit(next))this.update();};
    }else{
      drawer.innerHTML=`${heading('Flight records')}<div class="cabin-records"><span>Personal best <b>${this.save.best}</b></span><span>Runs <b>${this.save.runs}</b></span><span>Gates <b>${this.save.gates}</b></span><span>Voyages completed <b>${this.save.victories}</b></span></div>`;
    }
    this.el('drawerClose').onclick=()=>{this.tab=null;this.paintRoom();this.update();};
  }
  paintRoomPreview(part,color){this.el(`${part}Surface`).style.setProperty('--finish-color',color);}
  beginPreview(itemId){
    const item=itemFor(this.ship,itemId),placed=this.room.placements.find(p=>p.item===itemId);
    this.decorate=true;this.tab=null;this.moving=false;
    if(placed&&item.slot!=='decal'){this.selected=placed.id;this.preview=null;this.update();return;}
    const pos=findPosition(this.ship,this.room,itemId);
    if(!pos){this.update();this.status('No clear position yet. Store or move an item to make room; ownership is unchanged.');return;}
    this.preview={id:`placed-${Date.now().toString(36)}-${++nextId}`,item:itemId,...pos,variant:0,on:true};this.selected=null;this.update();
  }
  point(event){const r=this.el('roomStage').getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};}
  pointerDown(event){
    if(!this.decorate||this.drag||event.button>0)return;
    if(this.preview && !event.target.closest?.('#previewGhost')) { event.preventDefault(); this.tapMove(this.point(event)); return; }
    const target=event.target.closest?.('[data-placement]'),p=this.preview||this.room.placements.find(q=>q.id===target?.dataset.placement);
    if(!p){if(this.moving&&this.selected)this.tapMove(this.point(event));return;}
    event.preventDefault();if(!this.preview)this.selected=p.id;
    const point=this.point(event);this.drag={pointer:event.pointerId,start:clone(p),point,proposed:clone(p),moved:false};this.suppressClick=true;this.tab=null;
    this.el('roomStage').setPointerCapture(event.pointerId);this.update();
  }
  pointerMove(event){
    if(this.drag?.pointer!==event.pointerId)return;event.preventDefault();const point=this.point(event),start=this.drag.start;
    this.drag.proposed={...start,x:Math.round((start.x+point.x-this.drag.point.x)*200)/200,y:Math.round((start.y+point.y-this.drag.point.y)*200)/200};
    this.drag.moved||=Math.hypot(point.x-this.drag.point.x,point.y-this.drag.point.y)>.012;
    const proposed=this.drag.proposed,item=itemFor(this.ship,proposed.item),feedback=placementFeedback(this.ship,this.room,item.id,proposed,proposed.id),el=this.preview?this.el('previewGhost'):this.el(`placed-${proposed.id}`);
    this.positionElement(el,item,proposed);el.classList.toggle('invalid-placement',!!feedback);this.status(feedback||'Valid position · release to place.');
  }
  pointerUp(event){
    if(this.drag?.pointer!==event.pointerId)return;
    const drag=this.drag;this.drag=null;const p=drag.proposed,feedback=placementFeedback(this.ship,this.room,p.item,p,p.id);
    if(drag.moved&&!feedback){if(this.preview)this.preview=clone(p);else{const next=clone(this.room);if(placeItem(this.ship,next,this.save.decorOwned,p.item,p,p.id))this.commit(next);}}
    this.update();if(feedback&&drag.moved)this.status(`${feedback} Returned to the last valid position.`);
    setTimeout(()=>{this.suppressClick=false;},0);
  }
  cancelDrag(){if(!this.drag)return;this.drag=null;if(!this.destroyed)this.update();this.suppressClick=false;}
  tapMove(point){
    const p=this.preview||this.room.placements.find(q=>q.id===this.selected);if(!p)return;
    const item=itemFor(this.ship,p.item),closest=anchorsFor(item).sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y))[0];
    const feedback=placementFeedback(this.ship,this.room,p.item,closest,p.id);if(feedback){this.status(feedback);return;}
    if(this.preview)this.preview={...p,...closest};else{const next=clone(this.room);if(placeItem(this.ship,next,this.save.decorOwned,p.item,closest,p.id))this.commit(next);}
    this.update();
  }
  keyMove(event){
    if(!this.decorate||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Escape'].includes(event.key))return;
    if(event.key==='Escape'){this.cancelDrag();this.preview=null;this.selected=null;this.update();return;}
    const p=this.preview||this.room.placements.find(q=>q.id===this.selected);if(!p)return;event.preventDefault();
    const point={x:p.x+(event.key==='ArrowRight'?.025:event.key==='ArrowLeft'?-.025:0),y:p.y+(event.key==='ArrowDown'?.025:event.key==='ArrowUp'?-.025:0)};
    const feedback=placementFeedback(this.ship,this.room,p.item,point,p.id);if(feedback){this.status(feedback);return;}
    if(this.preview)this.preview={...p,...point};else{const next=clone(this.room);if(placeItem(this.ship,next,this.save.decorOwned,p.item,point,p.id))this.commit(next);}this.update();
    this.el(this.preview?'previewGhost':`placed-${p.id}`)?.focus?.({preventScroll:true});
  }
  back(){if(this.preview||this.tab||this.decorate){this.cancelDrag();this.preview=null;this.tab=null;this.decorate=false;this.selected=null;this.update();return true;}return false;}
}
