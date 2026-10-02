const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createServer}=require('node:http');
const puppeteer=require('puppeteer');
const {HOTSPOTS,SERVICES}=require('./place-data.cjs');
const dist=path.resolve(process.env.COMMUNITY_DIST||'dist');
const screenshots=path.resolve('.admin-local/community-preview');fs.mkdirSync(screenshots,{recursive:true});
const mime={'.js':'application/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const server=createServer((req,res)=>{const url=new URL(req.url,'http://localhost');let file=path.join(dist,url.pathname);if(url.pathname.startsWith('/account')||url.pathname.startsWith('/admin'))file=path.join(dist,'private.html');if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file))file=path.join(dist,'spa.html');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
(async()=>{
 let browser;
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const spot=HOTSPOTS[0],ref={city:spot.city,slug:spot.slug},key=`${spot.city}/${spot.slug}`,route=`/${spot.city}/hotspots/${spot.slug}`;
 const id='f0000000-0000-4000-8000-000000000002',placeId='a0000000-0000-4000-8000-000000000001',reviewId='b0000000-0000-4000-8000-000000000001';
 const user={id,email:'community@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-10-02T18:00:00Z'};
 const exp=Math.floor(Date.now()/1000)+3600,token=[Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'),Buffer.from(JSON.stringify({sub:id,exp,aud:'authenticated',role:'authenticated'})).toString('base64url'),'invalid-test-signature'].join('.');
 const session={access_token:token,refresh_token:'invalid-test-refresh',expires_at:exp,expires_in:3600,token_type:'bearer',user};
 let own={liked:false,review:null},published=[{id:'b0000000-0000-4000-8000-000000000009',rating:4,user_name:'Lena',comment:'Onze hond was ook binnen welkom. Een heel fijne ontvangst.',visit_month:'2026-09-01',created_at:'2026-09-20T12:00:00Z',updated_at:'2026-09-20T12:00:00Z',edited:false}],failLike=false,failReview=false,failRead=false,admin=true,profileStatus='active',flagged=false;
 const requests=[],errors=[],external=[];
 const summary=()=>({place_id:placeId,likes:own.liked?1:0,count:published.length,average:published.length?Math.round(published.reduce((a,r)=>a+r.rating,0)/published.length*10)/10:null});
 const publicData=()=>({...summary(),available:true,reviews:published,distribution:published.reduce((a,r)=>({...a,[r.rating]:(a[r.rating]||0)+1}),{})});
 const adminReview=()=>({id:reviewId,kind:'hotspot',zone_id:placeId,place_id:placeId,area_slug:spot.slug,rating:own.review?.rating??5,public_name:'Kevin',public_comment:own.review?.comment??'Onze hond kreeg een fijne plek binnen en een waterbak.',user_name:'Kevin',comment:'Onze hond kreeg een fijne plek binnen en een waterbak.',status:own.review?.status??'pending',needs_review:own.review?.needs_review??true,version:own.review?.version??1,created_at:'2026-10-02T20:00:00Z',with_account:true,zone_name:spot.name,city_slug:spot.city,flags:flagged?1:0});
 try {
  browser=await puppeteer.launch({headless:true});const page=await browser.newPage();await page.setViewport({width:1440,height:1000});
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.setBypassServiceWorker(true);await page.setRequestInterception(true);
  const cors={'Access-Control-Allow-Origin':base,'Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'OPTIONS,GET,POST,PATCH,DELETE'};
  page.on('request',req=>{
   const url=new URL(req.url()),method=req.method();const send=(v,status=200)=>req.respond({status,headers:cors,contentType:'application/json',body:JSON.stringify(v)});
   if(url.pathname.startsWith('/_vercel/'))return send({});
   if(url.hostname.endsWith('supabase.co')){
    if(method==='OPTIONS')return req.respond({status:204,headers:cors});
    const input=method==='POST'||method==='PATCH'?JSON.parse(req.postData()||'{}'):{};
    if(url.pathname==='/auth/v1/signup'||url.pathname==='/auth/v1/token')return send(session);
    if(url.pathname==='/auth/v1/user')return send(user);
    if(url.pathname==='/auth/v1/logout')return req.respond({status:204,headers:cors});
    if(url.pathname==='/rest/v1/rpc/record_member_visit')return send(null);
    if(url.pathname==='/rest/v1/rpc/public_hotspot_summaries'){requests.push({rpc:'summaries',...input});return failRead?send({message:'Test: lezen mislukt'},500):send(Object.fromEntries(input.p_places.map(p=>[`${p.city}/${p.slug}`,`${p.city}/${p.slug}`===key?summary():{place_id:placeId,likes:0,count:0,average:null}])));}
    if(url.pathname==='/rest/v1/rpc/public_hotspot_reviews')return failRead?send({message:'Test: lezen mislukt'},500):send(publicData());
    if(url.pathname==='/functions/v1/site-analytics')return send({ok:true});
    if(url.pathname==='/functions/v1/site-community'){
     requests.push(input);assert.equal(input.member_id,undefined,'Identity never supplied by the UI');
     if(input.action==='state')return send(own);
     if(input.action==='export')return send({likes:own.liked?[ref]:[],reviews:own.review?[{...ref,...own.review,versions:[{rating:own.review.rating,comment:own.review.comment}]}]:[]});
     if(input.action==='like'){if(failLike)return send({error:'Test: liken tijdelijk niet beschikbaar'},500);own.liked=input.liked;return send({...own,summary:summary()});}
     if(input.action==='submit'){
      if(failReview)return send({error:'Test: bewaren tijdelijk niet beschikbaar'},500);
      assert.equal(input.ownExperience,true);assert.ok(req.headers()['x-user-access-token']);
      own.review={id:reviewId,version:(own.review?.version||0)+1,status:own.review?.has_published?'published':'pending',needs_review:true,has_published:own.review?.has_published||false,rating:input.rating,comment:input.comment,name:input.name,visit_month:input.visitMonth};return send(own);
     }
     if(input.action==='withdraw'){own.review.status='withdrawn';own.review.needs_review=false;own.review.version++;own.review.has_published=false;published=published.filter(r=>r.id!==reviewId);return send(own);}
     if(input.action==='flag'){flagged=true;return send({message:'Bedankt. We kijken je melding na.'});}
    }
    if(url.pathname==='/functions/v1/admin-members')return admin?send({allowed:true}):send({error:'Geen toegang'},403);
    if(url.pathname==='/functions/v1/admin-reviews'){
     requests.push(input);
     if(input.action==='places')return send({places:[{id:placeId,kind:'hotspot',city_slug:spot.city,slug:spot.slug,name:spot.name}]});
     if(input.action==='overview')return send({counts:{all:1,pending:own.review?.needs_review?1:0,published:own.review?.status==='published'?1:0,flagged:flagged?1:0,hidden:0,rejected:0,withdrawn:0,attention:1},zones:{},places:{[placeId]:{likes:summary().likes,published:summary().count,pending:1,attention:1,average:summary().average}}});
     if(input.action==='list')return send({reviews:[adminReview()]});
     if(input.action==='detail')return send({review:adminReview(),approved:published.find(r=>r.id===reviewId)?{rating:5,public_name:'Kevin',comment:'Onze hond kreeg een fijne plek binnen en een waterbak.'}:null,history:[],revisions:[{id:'old',public_name:'Kevin',public_comment:'Onze hond kreeg een fijne plek binnen en een waterbak.',rating:5,created_at:'2026-10-02T20:00:00Z'}],flags:[]});
     if(input.action==='moderate'){
      if(input.decision==='publish'){own.review.status='published';own.review.needs_review=false;own.review.has_published=true;own.review.version++;published=[...published.filter(r=>r.id!==reviewId),{id:reviewId,rating:own.review.rating,user_name:own.review.name,comment:own.review.comment,visit_month:own.review.visit_month,created_at:'2026-10-02T20:00:00Z',updated_at:'2026-10-02T20:10:00Z',edited:false}].sort((a,b)=>b.created_at.localeCompare(a.created_at));}return send({version:own.review.version,status:own.review.status});
     }
    }
    if(url.pathname.startsWith('/rest/v1/')){
     const table=url.pathname.split('/').pop();if(table==='member_profiles')return send({id,email:user.email,email_confirmed_at:null,display_name:'Kevin',home_city:null,status:profileStatus,created_at:user.created_at,last_active_at:null});return send([]);
    }
    return send({error:'Unexpected mocked API path'},500);
   }
   if(url.origin!==base){external.push(url.hostname);return req.respond({status:200,contentType:'text/plain',body:''});}req.continue();
  });
  const clickText=async(text,root='body')=>{const handle=await page.evaluateHandle((text,root)=>Array.from(document.querySelector(root).querySelectorAll('button,a')).find(e=>e.textContent.trim()===text),text,root);const element=handle.asElement();assert.ok(element,`Missing ${text}`);await element.click();await handle.dispose();};
  await page.goto(base+route,{waitUntil:'networkidle0'});await page.waitForSelector('.hotspot-social-summary strong');
  assert.match(await page.$eval('.hotspot-social-link',e=>e.textContent),/4,0.*1 review/);
  await page.click('.hotspot-like-button');await page.waitForSelector('dialog[open]');assert.match(await page.$eval('dialog',e=>e.textContent),/gratis account/);
  await page.screenshot({path:path.join(screenshots,'account-gate-desktop.png')});
  await clickText('Maak een gratis account','dialog');await page.waitForSelector('input[name="password-repeat"]');assert.match(await page.$eval('.member-auth-card',e=>e.textContent),new RegExp(spot.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  await page.type('input[name="email"]',user.email);await page.type('input[name="password"]','test-password-123');await page.type('input[name="password-repeat"]','test-password-123');await page.click('input[name="terms"]');await page.click('.member-auth-card button[type="submit"], .member-auth-card form>.member-button');
  await page.waitForFunction(route=>location.pathname===route,{},route);await page.waitForSelector('.hotspot-like-button[aria-pressed="true"]:not(:disabled)');
  assert.equal(requests.filter(r=>r.action==='like'&&r.liked).length,1,'Initial like resumes once after signup');
  assert.match(await page.$eval('.hotspot-social-link',e=>e.textContent),/1 like/);
  await page.click('.hotspot-like-button');await page.waitForSelector('.hotspot-like-button[aria-pressed="false"]:not(:disabled)');failLike=true;
  await page.click('.hotspot-like-button');await page.waitForFunction(()=>document.body.textContent.includes('Test: liken tijdelijk niet beschikbaar'));assert.equal(await page.$eval('.hotspot-like-button',e=>e.getAttribute('aria-pressed')),'false');failLike=false;
  await clickText('Schrijf een review','#reviews');await page.waitForSelector('.hotspot-review-editor');
  await page.click('input[aria-label="1 ster"]');await page.keyboard.press('ArrowRight');assert.equal(await page.$eval('input[aria-label="2 sterren"]',e=>e.checked),true,'Keyboard changes star rating');await page.click('input[aria-label="5 sterren"]');await page.type('textarea[name="review-comment"]','Onze hond kreeg een fijne plek binnen en een waterbak.');await page.click('.hotspot-review-editor input[type="checkbox"]');
  failReview=true;await page.click('.hotspot-review-editor button[type="submit"], .hotspot-review-editor .member-button-primary');await page.waitForFunction(()=>document.querySelector('.hotspot-review-editor')?.textContent.includes('Test: bewaren tijdelijk niet beschikbaar'));
  assert.match(await page.$eval('textarea[name="review-comment"]',e=>e.value),/waterbak/);failReview=false;
  await clickText('Later verder','.hotspot-review-editor');await page.reload({waitUntil:'networkidle0'});await clickText('Schrijf een review','#reviews');await page.waitForSelector('.hotspot-review-editor');assert.match(await page.$eval('textarea[name="review-comment"]',e=>e.value),/waterbak/);
  await page.click('.hotspot-review-editor input[type="checkbox"]');await page.click('.hotspot-review-editor .member-button-primary');await page.waitForSelector('.hotspot-own-review');assert.equal(await page.$('.hotspot-review-editor'),null);assert.equal(published.length,1,'Pending review not public');assert.match(await page.$eval('.hotspot-own-review',e=>e.textContent),/wacht op controle/);
  await page.goto(base+'/account?tab=settings',{waitUntil:'networkidle0'});await page.waitForSelector('.member-settings-grid');
  await page.evaluate(()=>{const original=URL.createObjectURL;URL.createObjectURL=blob=>{window.__communityExport=blob.text();return original(blob);};});
  await clickText('Mijn gegevens','.member-account-controls');await page.waitForFunction(()=>Boolean(window.__communityExport));
  const exported=await page.evaluate(async()=>JSON.parse(await window.__communityExport));assert.equal(exported.hotspot_contributions.reviews[0].versions[0].rating,5,'Account download includes private review versions');
  await page.goto(base+'/admin/reviews?kind=hotspot',{waitUntil:'networkidle0'});await page.waitForSelector('.workspace-review-row');await page.click('.workspace-review-row a');await page.waitForSelector('.workspace-review-detail .workspace-text-link');
  assert.match(await page.$eval('.workspace-review-detail a',e=>e.getAttribute('href')),/\/admin\/zaken\//);await clickText('Goedkeuren','.workspace-review-detail');await page.waitForSelector('.workspace-success');assert.equal(published.length,2);
  await page.goto(base+route,{waitUntil:'networkidle0'});await page.waitForSelector('.hotspot-review-score');assert.match(await page.$eval('.hotspot-review-score',e=>e.textContent),/4,5.*2 reviews/);
  await page.$eval('#reviews',e=>e.scrollIntoView({behavior:'instant',block:'start'}));await (await page.$('#reviews')).screenshot({path:path.join(screenshots,'reviews-desktop.png')});
  await clickText('Mijn review','#reviews');await page.waitForSelector('.hotspot-review-editor');await page.click('input[aria-label="2 sterren"]');await page.$eval('textarea[name="review-comment"]',e=>{e.value='';e.dispatchEvent(new Event('input',{bubbles:true}));});await page.type('textarea[name="review-comment"]','Bij ons tweede bezoek was de ontvangst helaas minder fijn.');await page.click('.hotspot-review-editor input[type="checkbox"]');await page.click('.hotspot-review-editor .member-button-primary');await page.waitForFunction(()=>document.querySelector('.hotspot-own-review')?.textContent.includes('vorige review blijft zichtbaar'));assert.equal(summary().average,4.5,'Pending edit leaves approved rating intact');
  await page.setViewport({width:390,height:844});await page.$eval('#reviews',e=>e.scrollIntoView({behavior:'instant',block:'start'}));await (await page.$('#reviews')).screenshot({path:path.join(screenshots,'reviews-mobile.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No mobile overflow');
  const starAccessibility=await page.$$eval('.hotspot-review header [role="img"]',els=>els.every(e=>/van 5 sterren/.test(e.getAttribute('aria-label'))));assert.equal(starAccessibility,true);
  await clickText('Melden','.hotspot-review-flag');await page.select('.hotspot-review-flag select','spam');await clickText('Melding versturen','.hotspot-review-flag');await page.waitForFunction(()=>document.querySelector('.hotspot-review-flag')?.textContent.includes('Bedankt'));assert.equal(flagged,true);
  await clickText('Intrekken','.hotspot-own-review');await page.waitForSelector('dialog[open]');await clickText('Trek mijn review in','dialog');await page.waitForFunction(()=>document.querySelector('.hotspot-own-review')?.textContent.includes('ingetrokken'));assert.equal(published.length,1);
  profileStatus='suspended';await page.reload({waitUntil:'networkidle0'});assert.equal(await page.$eval('.hotspot-like-button',e=>e.disabled),true);assert.equal(await page.$eval('.hotspot-review-primary',e=>e.disabled),true);
  profileStatus='active';failRead=true;await page.reload({waitUntil:'networkidle0'});await page.waitForSelector('#reviews [role="alert"]');assert.match(await page.$eval('#reviews',e=>e.textContent),/niet geladen/);assert.doesNotMatch(await page.$eval('#reviews',e=>e.textContent),/Nog geen reviews/);failRead=false;
  await page.goto(base+`/${SERVICES[0].city}/diensten/${SERVICES[0].slug}`,{waitUntil:'networkidle0'});assert.equal(await page.$('#reviews'),null,'Services do not receive hotspot scores');
  published=[];await page.goto(base+route,{waitUntil:'networkidle0'});await page.waitForSelector('.hotspot-review-empty');assert.equal(await page.$('.hotspot-review-score'),null,'No invented zero-star score');assert.match(await page.$eval('.hotspot-review-empty',e=>e.textContent),/Nog geen reviews/);
  await page.goto(base+'/hotspots',{waitUntil:'networkidle0'});assert.ok(requests.some(r=>r.rpc==='summaries'&&r.p_places.length>1),'Cards batch their summary requests');
  assert.deepEqual(errors,[],'No runtime errors');
  console.log('Hotspot browser checks passed: contextual signup, one resumed like, unlike, failed writes, draft recovery, pending privacy, account export, admin publication, versioned edits, mobile layout, accessible stars, flags, withdrawal, suspension, read failures, service isolation and batched cards. All remote writes intercepted.');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
