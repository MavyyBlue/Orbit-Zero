import assert from 'node:assert/strict';

// Real Chromium checks. Included in the existing bootstrap browser-smoke entrypoint.
export async function roomSmoke(page, viewport) {
  const original=await page.evaluate(()=>({save:localStorage.getItem('orbit-zero.save.v1'),workshop:localStorage.getItem('orbit-zero.workshop.v1')}));
  await page.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem('orbit-zero.save.v1')||'{"version":1}');
    Object.assign(s,{owned:['ion','ember','violet','flare','orbit'],shards:3000,best:4321,runs:27,gates:80,victories:3,decorOwned:['hearts'],rooms:{ion:{color:'#4267af',slots:{decal:'hearts'}}}});
    localStorage.setItem('orbit-zero.save.v1',JSON.stringify(s));
  });
  await page.reload();
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('orbit-zero.save.v1')));
  const dimensions=async id=>{
    const box=await page.locator(`#${id}`).boundingBox();
    assert.ok(box&&box.width>=44&&box.height>=44&&box.y>=0&&box.y+box.height<=viewport.height+1,`${id} reachable at ${viewport.width}`);
  };
  const touch=async (id,dx,dy,cancel=false)=>{
    const box=await page.locator(`#${id}`).boundingBox(),session=await page.context().newCDPSession(page);
    const x=box.x+box.width/2,y=box.y+box.height/2;
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy,id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});await session.detach();
  };
  await page.locator('#hangar').click();
  for(const [id,shape] of [['ion','scout'],['ember','arrow'],['violet','manta'],['flare','needle'],['orbit','starling']]){
    await page.locator(`#interior-${id}`).click();await page.locator('#roomStage').waitFor();
    const stage=await page.locator('#roomStage').boundingBox();assert.ok(stage.height>=viewport.height*.5,'large idle room view');
    for(const control of ['roomBack','roomDecorate','roomFurniture','roomSurfaces','roomLighting'])await dimensions(control);
    assert.equal(await page.locator('.cabin-editor').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'no horizontal overflow');
    assert.ok(await page.locator('.cabin-item').count()>=4);
    await page.locator('img:visible').evaluateAll(async imgs=>Promise.all(imgs.map(im=>im.decode())));
    assert.equal(await page.locator('.cabin-stage').getAttribute('class'),`cabin-stage ship-${shape}`);
    await page.locator('#roomStage').screenshot({path:`build/screenshots/room-${shape}-${viewport.width}.png`});
    await page.locator('#roomBack').click();
  }
  await page.locator('#interior-ion').click();
  // Migration materializes on the first saved cosmetic edit, never charging.
  await page.locator('#roomSurfaces').click();
  for(const [part,color] of [['wall','#123456'],['ceiling','#abcdef'],['floor','#405060']]){
    await page.locator(`#finish-${part}`).evaluate((el,color)=>{el.value=color;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));},color);
  }
  assert.equal((await saved()).shards,3000);assert.ok((await saved()).decorOwned.includes('hearts'));
  await page.locator('#roomLighting').click();await dimensions('lightColor');
  await page.locator('#lightBrightness').evaluate(el=>{el.value='35';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.locator('#lightColor').evaluate(el=>{el.value='#ff88cc';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.locator('#drawerClose').click();
  const lamp=page.locator('.cabin-item.lamp').first();await lamp.click();assert.equal(await lamp.evaluate(el=>el.classList.contains('lamp-off')),true);
  await page.locator('.cabin-item.console').first().click();assert.match(await page.locator('.cabin-records').innerText(),/4321/);await page.locator('#drawerClose').click();
  await page.locator('#roomWindow').click();await page.locator('#view-rings').click();await page.locator('#drawerClose').click();
  await page.locator('#roomDecorate').click();
  for(const control of ['roomMove','roomStore','roomUndo','roomDone'])await dimensions(control);
  const seat=(await saved()).rooms.ion.placements.find(p=>p.item==='base-seat');
  // Invalid and cancelled drags return to their original persisted position.
  await touch(`placed-${seat.id}`,-250,-200);assert.deepEqual((await saved()).rooms.ion.placements.find(p=>p.id===seat.id),seat);
  await touch(`placed-${seat.id}`,20,0,true);assert.deepEqual((await saved()).rooms.ion.placements.find(p=>p.id===seat.id),seat);
  await page.locator(`#placed-${seat.id}`).click();await page.locator('#roomStore').click();assert.equal((await saved()).shards,3000);
  await page.locator('#roomUndo').click();assert.ok((await saved()).rooms.ion.placements.some(p=>p.id===seat.id));
  // Preview, cancel, confirm, undo, and re-place one purchased item.
  await page.locator('#roomFurniture').click();await page.locator('#inventoryShop').click();await page.locator('#inventory-orb_cushion').click();
  assert.equal((await saved()).shards,3000);await dimensions('previewCancel');await dimensions('previewConfirm');
  await page.screenshot({path:`build/screenshots/room-preview-${viewport.width}.png`});
  await page.locator('#previewCancel').click();assert.equal((await saved()).shards,3000);
  await page.locator('#roomFurniture').click();await page.locator('#inventoryShop').click();await page.locator('#inventory-orb_cushion').click();await page.locator('#previewConfirm').click();
  assert.equal((await saved()).shards,2800);assert.ok((await saved()).decorOwned.includes('orb_cushion'));
  await page.locator('#roomUndo').click();assert.equal((await saved()).shards,2800);assert.ok((await saved()).decorOwned.includes('orb_cushion'));
  await page.locator('#roomFurniture').click();await page.locator('#inventoryOwned').click();await page.locator('#inventory-orb_cushion').click();await page.locator('#previewConfirm').click();assert.equal((await saved()).shards,2800);
  await page.locator('#roomStore').click();assert.equal((await saved()).shards,2800);
  // Two separately placed motifs from one owned license.
  for(let i=0;i<2;i++){
    await page.locator('#roomFurniture').click();await page.locator('#inventoryOwned').click();await page.locator('#inventory-hearts').click();await page.locator('#decalVariant').click();await page.locator('#previewConfirm').click();
  }
  assert.ok((await saved()).rooms.ion.placements.filter(p=>p.item==='hearts').length>=2);assert.equal((await saved()).shards,2800);
  await page.locator('#roomDone').click();
  const roomBefore=(await saved()).rooms.ion;await page.reload();await page.locator('#hangar').click();await page.locator('#interior-ion').click();
  assert.deepEqual((await saved()).rooms.ion,roomBefore);assert.equal(await page.locator('#spaceView').getAttribute('data-view'),'rings');
  await page.screenshot({path:`build/screenshots/room-customized-${viewport.width}.png`});
  const final=await saved();assert.equal(final.best,4321);assert.equal(final.gates,80);assert.equal(final.runs,27);assert.equal(final.victories,3);
  assert.equal(await page.evaluate(()=>localStorage.getItem('orbit-zero.workshop.v1')),original.workshop);
  // Insufficient funds still allow inspection, but confirmation cannot spend.
  await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('orbit-zero.save.v1'));s.shards=0;localStorage.setItem('orbit-zero.save.v1',JSON.stringify(s));});
  await page.reload();await page.locator('#hangar').click();await page.locator('#interior-ion').click();await page.locator('#roomFurniture').click();await page.locator('#inventoryShop').click();await page.locator('#inventory-holo_table').click();
  assert.equal(await page.locator('#previewConfirm').isDisabled(),true);await page.locator('#previewCancel').click();assert.equal((await saved()).shards,0);
  await page.evaluate(original=>{for(const [key,value] of [['orbit-zero.save.v1',original.save],['orbit-zero.workshop.v1',original.workshop]])value===null?localStorage.removeItem(key):localStorage.setItem(key,value);},original);
  await page.reload();
}
