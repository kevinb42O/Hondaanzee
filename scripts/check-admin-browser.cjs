const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const puppeteer = require('puppeteer');
const { HOTSPOTS, SERVICES, OFF_LEASH_AREAS } = require('./place-data.cjs');

const dist = path.resolve(__dirname, '../dist');
const mime = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  let file = path.join(dist, pathname);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file = path.join(dist, 'index.html');
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});

(async () => {
  let browser;
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.on('dialog', dialog => dialog.accept());
    const errors = [];
    const analyticsRequests = [];
    const fakePlaces = [...HOTSPOTS.map(content => ({ kind: 'hotspot', content })), ...SERVICES.map(content => ({ kind: 'service', content }))].map(({kind, content}, index) => ({ id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, kind, legacy_id: content.id, slug: content.slug, city_slug: content.city, version: 1, draft_revision_id: 'initial', published_revision_id: 'initial', draft: {content}, published: {content}, archived_at: null }));
    const fakeZones = OFF_LEASH_AREAS.map((content,index)=>({id:`10000000-0000-4000-8000-${String(index+1).padStart(12,'0')}`,kind:'offleash',legacy_id:index+1,slug:content.slug,city_slug:content.city,version:1,draft_revision_id:'original',published_revision_id:'original',draft:{content:{...content}},published:{content},archived_at:null}));
    const zoneRequests=[], moderationRequests=[];
    const fakeReviews=[{id:'20000000-0000-4000-8000-000000000001',zone_id:fakeZones[0].id,area_slug:fakeZones[0].slug,rating:2,user_name:'Bezoeker',comment:'Originele ervaring',public_name:'Bezoeker',public_comment:'Originele ervaring',status:'published',needs_review:true,version:1,created_at:'2026-09-20T12:00:00Z',with_account:false,zone_name:fakeZones[0].draft.content.name,city_slug:fakeZones[0].city_slug,flags:0}];
    const reviewOverview=()=>({counts:{all:1,pending:0,published:fakeReviews[0].status==='published'?1:0,hidden:fakeReviews[0].status==='hidden'?1:0,rejected:0,attention:fakeReviews[0].needs_review?1:0,flagged:0},zones:{[fakeZones[0].id]:{published:fakeReviews[0].status==='published'?1:0,pending:0,attention:fakeReviews[0].needs_review?1:0,average:fakeReviews[0].status==='published'?2:null}}});
    const reportRequests=[], pushRequests=[];
    const fakeReports = [
      {id:'r1',public_id:'melding-pending',category:'afval',city_slug:'oostende',location_text:'Duinenpad',description:'Oorspronkelijke melding over afval op het pad.',observed_at:'2026-10-02T10:00:00Z',created_at:'2026-10-02T11:00:00Z',status:'published',is_hidden:false,report_count:0,confirm_count:2,city_intervention_status:'pending',city_intervention_note:'',resolved_at:null},
      {id:'r2',public_id:'melding-hidden',category:'gif',city_slug:'blankenberge',location_text:'Verborgen strandmelding',description:'Gemarkeerde melding',observed_at:'2026-10-01T10:00:00Z',created_at:'2026-10-01T11:00:00Z',status:'published',is_hidden:true,report_count:3,confirm_count:0,city_intervention_status:'not_applicable',city_intervention_note:'',resolved_at:null},
      {id:'r3',public_id:'melding-archived',category:'andere_overlast',city_slug:'oostende',location_text:'Eerdere melding',description:'Deze oorspronkelijke tekst moet bewaard blijven.',observed_at:'2026-09-30T10:00:00Z',created_at:'2026-09-30T11:00:00Z',status:'removed',is_hidden:true,report_count:0,confirm_count:1,city_intervention_status:'resolved',city_intervention_note:'Opgeruimd.',resolved_at:'2026-10-01T12:00:00Z'},
    ];
    const fakePushLog=[{id:'p1',title:'Eerdere strandupdate',body:'Oorspronkelijk bericht',url:'/updates',sent_count:2,failed_count:1,total_count:3,sent_by:null,created_at:'2026-10-01T12:00:00Z'}];
    let failPush=false, failReport=false;
    const savedRequests = [];
    const publicationRequests=[];
    const history={capturedAt:"2026-10-02T18:00:00Z",timezone:"UTC",lifetime:{query:{since:"2026-01-26",until:"2026-10-03"},data:{pageviews:100,visitors:15}},datasets:Object.fromEntries(["daily","pages","referrers","devices"].map(name=>[name,{query:{since:"2026-10-01",until:"2026-10-03"},data:[{timestamp:"2026-10-01T00:00:00Z",pageviews:10,visitors:10,requestPath:"/",referrerHostname:"",deviceType:"mobile"},{timestamp:"2026-10-02T00:00:00Z",pageviews:10,visitors:10,requestPath:"/",referrerHostname:"",deviceType:"mobile"}]}]))};
    let conflict = false;
    const cors = { 'Access-Control-Allow-Origin': base, 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-supabase-api-version, x-admin-access-token', 'Access-Control-Allow-Methods': 'OPTIONS, POST' };
    page.on('pageerror', error => errors.push(error.message));
    await page.setBypassServiceWorker(true);
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/_vercel/insights')||request.url().includes('/functions/v1/site-analytics')) analyticsRequests.push(request.url());
      // Test all admin pages without credentials or requests to real services.
      if (request.url().includes('/auth/v1/logout')) return request.respond({ status: 204, headers: cors });
      if(request.url().includes('/functions/v1/admin-zones')){if(request.method()==='OPTIONS')return request.respond({status:204,headers:cors});const input=JSON.parse(request.postData());let body;
        if(input.action==='list')body={zones:fakeZones};
        else if(input.action==='detail')body={zone:fakeZones.find(z=>z.id===input.id),history:[]};
        else {zoneRequests.push(input);const z=fakeZones.find(z=>z.id===input.id);if(input.action==='save'){if(input.version!==z.version)return request.respond({status:409,headers:cors,contentType:'application/json',body:JSON.stringify({error:'De zone is intussen gewijzigd. Laad de laatste versie.'})});z.draft={content:{...z.draft.content,...input.patch}};z.version++;z.draft_revision_id='saved';body={version:z.version};}}
        return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify(body)});
      }
      if(request.url().includes('/functions/v1/admin-reviews')){if(request.method()==='OPTIONS')return request.respond({status:204,headers:cors});const input=JSON.parse(request.postData());let body;
        if(input.action==='overview')body=reviewOverview();
        else if(input.action==='list')body={reviews:fakeReviews.filter(r=>input.filter==='all'||input.filter==='attention'&&r.needs_review||input.filter===r.status)};
        else if(input.action==='detail')body={review:fakeReviews[0],history:moderationRequests.map((a,i)=>({...a,id:String(i),action:a.decision,from_status:'published',to_status:fakeReviews[0].status,created_at:'2026-10-02T12:00:00Z',actor_label:'admin@hondaanzee.be'})),revisions:[{id:'original',public_name:'Bezoeker',public_comment:'Originele ervaring',created_at:'2026-09-20T12:00:00Z'}],flags:[]};
        else{moderationRequests.push(input);fakeReviews[0].version++;fakeReviews[0].needs_review=false;if(input.decision==='hide')fakeReviews[0].status='hidden';if(input.decision==='redact'){fakeReviews[0].public_name=input.publicName;fakeReviews[0].public_comment=input.publicComment;}body={version:fakeReviews[0].version};}
        return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify(body)});
      }
      if (request.url().includes('/functions/v1/admin-favorites')) {
        if (request.method() === 'OPTIONS') return request.respond({status:204,headers:cors});
        const counts = Object.fromEntries([...fakePlaces.map((p,i)=>[p.id,i===0?3:0]),...fakeZones.map((z,i)=>[z.id,i===0?2:0])]);
        return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({generated_at:'2026-10-02T18:00:00Z',counts})});
      }
      if (request.url().includes('/functions/v1/admin-members')) return request.respond({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ allowed: true, members: [], total: 0, stats: { total: 0, new30: 0, active30: 0, saved: 0 } }) });
      if(request.url().includes('/functions/v1/admin-media'))return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({ready:false,message:'Mediadomein in voorbereiding',assets:[]})});
      if(request.url().includes('/functions/v1/admin-analytics')){if(request.method()==='OPTIONS')return request.respond({status:204,headers:cors});const hourly=JSON.parse(request.postData()).hours===24;return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({today:'2026-10-02',history,rows:[{day:'2026-10-02',...(hourly?{hour:'2026-10-02T18:00:00Z'}:{}),path:'/',event:'pageview',referrer:'direct',device:'desktop',count:7},{day:'2026-10-02',...(hourly?{hour:'2026-10-02T18:00:00Z'}:{}),path:'/blankenberge/hotspots/lakaiann',event:'website',referrer:'google',device:'mobile',count:2}],...(hourly?{window:{start:'2026-10-01T20:00:00Z',end:'2026-10-02T19:00:00Z',now:'2026-10-02T19:15:00Z',startedAt:'2026-10-02T18:30:00Z'}}:{})})});}
      if(request.url().includes('/functions/v1/admin-publication')){if(request.method()==='OPTIONS')return request.respond({status:204,headers:cors});const input=JSON.parse(request.postData());if(input.action==='publish')publicationRequests.push(input);return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({configured:true,jobs:[]})});}
      if (request.url().includes('/functions/v1/admin-content')) {
        if (request.method() === 'OPTIONS') return request.respond({ status: 204, headers: cors });
        const input = JSON.parse(request.postData());
        if (input.action === 'list') return request.respond({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({places: fakePlaces}) });
        if (input.action === 'detail') return request.respond({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({place: fakePlaces.find(place => place.id === input.id)}) });
        savedRequests.push(input);
        if (input.action === 'save') return request.respond({ status: conflict ? 409 : 200, headers: cors, contentType: 'application/json', body: JSON.stringify(conflict ? {error: 'Deze zaak is intussen gewijzigd. Herlaad de laatste versie voordat je opnieuw opslaat.'} : {version: 2, revision_id: 'saved'}) });
        if (input.action === 'create') {
          const place = { ...fakePlaces[0], id: '00000000-0000-4000-8000-000000000999', slug: input.slug, city_slug: input.city, kind: input.kind, published_revision_id: null, published: null, draft: {content: {...input.patch, id: 999, slug: input.slug, city: input.city, tags: [], image: ''}} };
          fakePlaces.push(place);
          return request.respond({ status: 201, headers: cors, contentType: 'application/json', body: JSON.stringify({id: place.id}) });
        }
      }
      if(request.url().includes('/functions/v1/list-admin-reports')) return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({reports:fakeReports})});
      if(request.url().includes('/functions/v1/update-report-status')||request.url().includes('/functions/v1/remove-report')) {
        if(request.method()==='OPTIONS')return request.respond({status:204,headers:cors});
        const input=JSON.parse(request.postData());reportRequests.push(input);
        if(failReport)return request.respond({status:500,headers:cors,contentType:'application/json',body:JSON.stringify({error:'Test: bewaren tijdelijk niet beschikbaar'})});
        const report=fakeReports.find(r=>r.public_id===input.public_id);
        if(request.url().includes('remove-report')){report.status='removed';report.is_hidden=true;}
        else{report.city_intervention_status=input.city_intervention_status;report.city_intervention_note=input.city_intervention_note;report.resolved_at=input.city_intervention_status==='resolved'?'2026-10-02T12:00:00Z':null;}
        return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({report})});
      }
      if(request.url().includes('/functions/v1/list-push-stats'))return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({subscriber_count:3,log:fakePushLog})});
      if(request.url().includes('/functions/v1/send-push')){
        if(request.method()==='OPTIONS')return request.respond({status:204,headers:cors});
        const input=JSON.parse(request.postData());pushRequests.push(input);
        const result={ok:true,sent:failPush?0:2,failed:failPush?3:1,total:3,expired:0};
        fakePushLog.unshift({...input,id:'p'+(pushRequests.length+1),sent_count:result.sent,failed_count:result.failed,total_count:result.total,sent_by:null,created_at:'2026-10-02T12:00:00Z'});
        return request.respond({status:200,headers:cors,contentType:'application/json',body:JSON.stringify(result)});
      }
      if (request.url().includes('/functions/v1/')) return request.respond({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ reports: [], subscriber_count: 0, logs: [] }) });
      if (!request.url().startsWith(base)) return request.abort();
      return request.continue();
    });
    await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, 'serviceWorker', { value: undefined }));
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(base + '/admin/zaken');
    await page.waitForSelector('input[autocomplete="username"]');
    assert.equal(await page.$('.workspace-table'), null, 'Catalog is gated behind sign in');
    assert.match(await page.$eval('meta[name="robots"]', el => el.content), /noindex/);

    // This synthetic session tests UI navigation only. It has no valid signature
    // and must never be accepted by a real server or used for authorization tests.
    const user = { id: '00000000-0000-4000-8000-000000000001', email: 'admin@hondaanzee.be', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, exp, aud: 'authenticated', role: 'authenticated' })).toString('base64url'), 'test-only-invalid-signature'].join('.');
    await page.evaluate(session => localStorage.setItem('sb-zpllibfxaizavcvztnut-auth-token', JSON.stringify(session)), { access_token: token, refresh_token: 'test-only', token_type: 'bearer', expires_at: exp, expires_in: 3600, user });
    await page.goto(base + '/admin');
    await page.waitForSelector('.workspace-stats');
    assert.deepEqual(await page.$$eval('.workspace-stat strong', els => els.map(el => Number(el.textContent))), [HOTSPOTS.length + SERVICES.length, HOTSPOTS.length, SERVICES.length, OFF_LEASH_AREAS.length]);
    assert.equal(await page.$('header:not(.workspace-topbar)'), null, 'Public header is absent');
    await page.waitForSelector('[aria-label="1 reviews te beoordelen"]');
    await page.screenshot({ path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-admin-desktop.png'), fullPage: true });
    await page.click('nav a[href="/admin/zaken"]');
    await page.waitForSelector('.workspace-table');
    assert.equal(await page.$$eval('.workspace-table tbody tr', els => els.length), 157);
    await page.type('input[type="search"]', 'Lakaiann');
    await page.waitForFunction(() => document.querySelectorAll('.workspace-table tbody tr').length === 1);
    const expected = HOTSPOTS.find(place => place.name === 'Lakaiann');
    assert.equal(await page.$eval('.workspace-table img', el => el.getAttribute('src')), expected.image);
    await page.waitForFunction(() => document.querySelector('.workspace-favorite-count')?.textContent.trim() === '3');
    assert.equal(await page.$eval('.workspace-favorite-count',el=>el.textContent.trim()),'3','Place counters show current member saves');
    assert.equal(await page.$eval('.workspace-table a[aria-label]', el => el.getAttribute('href')), '/blankenberge/hotspots/lakaiann');
    await page.$eval('input[type="search"]', input => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'Onbestaandezaak'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForSelector('.workspace-empty button');
    await page.click('.workspace-empty button');
    await page.waitForFunction(() => document.querySelectorAll('.workspace-table tbody tr').length === 157);
    await page.select('.workspace-filters label:nth-child(3) select', 'service');
    await page.waitForFunction(() => document.querySelectorAll('.workspace-table tbody tr').length === 24);
    const lakaiann = fakePlaces.find(place => place.draft.content.name === 'Lakaiann');
    await page.goto(base + '/admin/zaken/' + lakaiann.id);
    await page.waitForSelector('input[name="name"]');
    assert.equal(await page.$eval('.workspace-media-grid img', el => el.getAttribute('src')), expected.images[0]);
    await page.type('input[name="name"]', ' concept');
    await page.click('.workspace-savebar button');
    await page.waitForSelector('.workspace-success');
    assert.deepEqual(savedRequests.at(-1).patch, {name: 'Lakaiann concept'});
    assert.equal(savedRequests.at(-1).version, 1);
    conflict = true;
    await page.type('input[name="name"]', ' gewijzigd');
    await page.waitForFunction(() => !document.querySelector('.workspace-savebar button')?.disabled);
    await page.click('.workspace-savebar button');
    await page.waitForSelector('.workspace-error');
    assert.match(await page.$eval('.workspace-error', el => el.textContent), /Herlaad/);
    assert.equal(await page.$eval('input[name="name"]', el => el.value), 'Lakaiann concept gewijzigd');
    conflict = false;
    await page.goto(base + '/admin/zaken/nieuw');
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', 'Nieuwe zaak');
    await page.type('textarea[name="description"]', 'Een hondvriendelijk adres aan zee.');
    await page.type('input[name="address"]', 'Kerkstraat 1');
    await page.type('input[placeholder="naam-van-de-zaak"]', 'nieuwe-zaak');
    await page.click('.workspace-savebar button');
    await page.waitForFunction(() => location.pathname.endsWith('000000000999') && document.querySelector('input[name="name"]')?.value === 'Nieuwe zaak');
    assert.equal(savedRequests.at(-1).action, 'create');
    assert.equal(savedRequests.at(-1).slug, 'nieuwe-zaak');
    assert.equal(savedRequests.at(-1).patch.type, 'Café');
    await page.setViewport({width:390,height:844});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile editor has no horizontal overflow');
    await page.screenshot({path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-admin-editor-mobile.png'), fullPage: true});
    await page.setViewport({width:1440,height:1000});
    await page.goto(base + '/admin/zaken/' + lakaiann.id);
    await page.waitForSelector('input[name="name"]');
    await page.screenshot({path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-admin-editor-desktop.png'), fullPage: true});
    await page.click('nav a[href="/admin/analytics"]');
    await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Analytics');
    await page.waitForSelector('.workspace-chart');
    assert.deepEqual(await page.$$eval('.workspace-stat strong',els=>els.map(el=>Number(el.textContent))),[7,0,2]);
    assert.match(await page.$eval('.workspace-analytics-list',el=>el.textContent), /7/);
    await page.click('[aria-label="Meetperiode"] button:first-child');await page.waitForFunction(()=>document.querySelector('.workspace-chart-interactive')?.getAttribute('aria-label')?.includes('cijfers per uur.'));
    assert.match(await page.$eval('.workspace-panel .workspace-muted',el=>el.textContent),/Per uur/);
    const hourLabels = await page.$$eval('.workspace-chart-time-label', els => els.map(el => el.textContent));
    assert.deepEqual(hourLabels, Array.from({length:24}, (_, i) => `${String((22+i)%24).padStart(2,'0')}:00`), 'Every hourly bucket has its own Brussels time label, including midnight');
    assert.ok(await page.$$eval('.workspace-chart-time-label', els => els.every((el,i) => !i || els[i-1].getBoundingClientRect().right < el.getBoundingClientRect().left)), 'All 24 hour labels remain separate and readable');
    await page.$eval('.workspace-chart-interactive',el=>el.focus());await page.keyboard.press('Home');await page.waitForSelector('[role=tooltip]');assert.match(await page.$eval('[role=tooltip]',el=>el.textContent),/Nog niet gemeten/);
    await page.keyboard.press('End');await page.waitForFunction(()=>document.querySelector('[role=tooltip]')?.textContent.includes('lopend uur'));assert.match(await page.$eval('[role=tooltip]',el=>el.textContent),/lopend uur/);await page.keyboard.press('ArrowLeft');await page.waitForFunction(()=>document.querySelector('[role=tooltip]')?.textContent.includes('Paginaweergaven7'));assert.match(await page.$eval('[role=tooltip]',el=>el.textContent),/Paginaweergaven7/);assert.match(await page.$eval('[role=tooltip]',el=>el.textContent),/Contactkliks2/);await page.keyboard.press('Escape');
    await page.setViewport({width:390,height:844});
    await page.$eval('.workspace-chart-interactive', el => { el.scrollIntoView({block:'center',behavior:'instant'}); el.focus({preventScroll:true}); });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Hourly chart scroll stays inside its panel on mobile');
    assert.ok(await page.$eval('.workspace-chart-scroll-hourly', el => el.scrollWidth > el.clientWidth), 'Small screens scroll the hourly plot instead of shrinking labels');
    await page.keyboard.press('End');
    await page.waitForFunction(() => document.querySelector('.workspace-chart-scroll-hourly').scrollLeft > 0 && document.querySelector('[role=tooltip]')?.textContent.includes('lopend uur'));
    assert.ok(await page.$$eval('.workspace-chart-time-label', els => {const r=els.at(-1).getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}), 'Keyboard navigation brings the last hour into view');
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(() => document.querySelector('[role=tooltip]')?.textContent.includes('Paginaweergaven7'));
    assert.ok(await page.$eval('[role=tooltip]', el => {const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}), 'Hourly tooltip stays inside the mobile viewport');
    const hourlyMobilePoint = await page.$eval('.workspace-chart-hourly', el => {const p=new DOMPoint(48+22*904/23,140).matrixTransform(el.getScreenCTM());return{x:p.x,y:p.y};});
    await page.mouse.move(hourlyMobilePoint.x,hourlyMobilePoint.y);
    await page.waitForFunction(() => document.querySelector('[role=tooltip]')?.textContent.includes('Paginaweergaven7'));
    await page.keyboard.press('Home');
    await page.waitForFunction(() => document.querySelector('.workspace-chart-scroll-hourly').scrollLeft===0 && document.querySelector('[role=tooltip]')?.textContent.includes('Nog niet gemeten'));
    await page.keyboard.press('Escape');
    await page.screenshot({path:path.join(process.env.TMPDIR||'/tmp','hondaanzee-hourly-analytics-mobile.png'),fullPage:true});
    await page.setViewport({width:1440,height:1000});
    await page.click('[aria-label="Gegevensbron"] button:nth-child(2)');
    await page.waitForFunction(()=>document.querySelector('.workspace-stat strong')?.textContent==='100');
    assert.deepEqual(await page.$$eval('.workspace-stat strong',els=>els.map(el=>Number(el.textContent))),[100,15,20], 'Historical daily visitors must never be summed into unique period visitors');
    const chart=await page.$('.workspace-chart-interactive'), chartBox=await chart.boundingBox();
    await page.mouse.move(chartBox.x+chartBox.width*.25,chartBox.y+chartBox.height*.5);
    await page.waitForSelector('[role=tooltip]');
    assert.match(await page.$eval('[role=tooltip]',el=>el.textContent),/Paginaweergaven10/);
    const firstTip=await page.$eval('[role=tooltip]',el=>el.getBoundingClientRect().x);
    await page.mouse.move(chartBox.x+chartBox.width*.65,chartBox.y+chartBox.height*.5);
    await page.waitForFunction(x=>document.querySelector('[role=tooltip]')?.getBoundingClientRect().x!==x,{},firstTip);
    assert.match(await page.$eval('[role=tooltip]',el=>el.textContent),/bezoekers.*10/i);
    await page.$eval('.workspace-chart-interactive',el=>el.focus());await page.keyboard.press('Home');await page.keyboard.press('End');
    assert.match(await page.$eval('[role=tooltip]',el=>el.textContent),/gedeeltelijke dag/);
    await page.keyboard.press('Escape');assert.equal(await page.$('[role=tooltip]'),null);
    await page.setViewport({width:390,height:844});
    await page.$eval('.workspace-chart-interactive',el=>el.scrollIntoView({block:'center',behavior:'instant'}));
    const mobilePoint=await page.$eval('.workspace-chart-interactive',el=>{const m=el.getScreenCTM();const p=new DOMPoint(900,140).matrixTransform(m);return{x:p.x,y:p.y};});await page.mouse.move(mobilePoint.x-5,mobilePoint.y);await page.mouse.move(mobilePoint.x,mobilePoint.y);
    await page.waitForSelector('[role=tooltip]');assert.ok(await page.$eval('[role=tooltip]',el=>el.getBoundingClientRect().right<=innerWidth&&el.getBoundingClientRect().left>=0),'Tooltip stays inside mobile viewport');
    await page.setViewport({width:1440,height:1000});
    await page.click('nav a[href="/admin/publiceren"]');
    await page.waitForSelector('.workspace-publication-list input[type=checkbox]');
    assert.equal(await page.$$eval('.workspace-publication-list input',els=>els.length),1,'Only unpublished drafts are selected for publication');
    await page.click('.workspace-publication-list input[type=checkbox]');
    await page.click('.workspace-savebar button');
    await page.waitForSelector('.workspace-success');
    assert.deepEqual(publicationRequests[0].places,{[fakePlaces.at(-1).id]:1});
    await page.goto(base+'/admin/losloopzones');await page.waitForSelector('.workspace-table');
    assert.equal(await page.$$eval('.workspace-table tbody tr',els=>els.length),27);
    await page.type('input[type=search]',fakeZones[0].draft.content.name);
    await page.waitForFunction(()=>document.querySelectorAll('.workspace-table tbody tr').length===1);
    await page.goto(base+'/admin/losloopzones/'+fakeZones[0].id);await page.waitForSelector('input[name=name]');
    const oldImage=fakeZones[0].draft.content.image;await page.type('input[name=name]',' concept');await page.click('.workspace-savebar button');await page.waitForSelector('.workspace-success');
    assert.deepEqual(zoneRequests.at(-1).patch,{name:OFF_LEASH_AREAS[0].name+' concept'});assert.equal(fakeZones[0].draft.content.image,oldImage);
    assert.equal(await page.$eval('.workspace-savebar button',el=>el.disabled),true);
    await page.type('input[name=name]',' tweede');assert.equal(await page.$eval('.workspace-savebar button',el=>el.disabled),false,'Editor exits saving state after reload');
    await page.goto(base+'/admin/reviews?filter=all');await page.waitForSelector('.workspace-review-row');
    await page.click('.workspace-review-row a');await page.waitForSelector('.workspace-review-detail');
    assert.match(await page.$eval('.workspace-review-detail',el=>el.textContent),/Originele ervaring/);
    assert.equal(await page.$eval('.workspace-review-decisions button:nth-child(2)',el=>el.disabled),true,'Hide requires a reason');
    await page.select('.workspace-review-detail select','privacy');await page.click('.workspace-review-decisions button:nth-child(2)');
    await page.waitForSelector('.workspace-success');await page.waitForFunction(()=>document.querySelector('.workspace-review-detail .workspace-review-status')?.textContent==='Verborgen');
    assert.equal(moderationRequests.at(-1).version,1);assert.equal(moderationRequests.at(-1).decision,'hide');assert.equal(fakeReviews[0].comment,'Originele ervaring');
    await page.setViewport({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Review panel has no mobile overflow');
    await page.screenshot({path:path.join(process.env.TMPDIR||'/tmp','hondaanzee-reviews-mobile.png'),fullPage:true});await page.setViewport({width:1440,height:1000});
    // Workbench UX: one selected report, retained originals, failure recovery and archive.
    await page.goto(base+'/admin/meldpunt');await page.waitForSelector('.workspace-report-row');
    assert.equal(await page.$$eval('.workspace-report-row',els=>els.length),2);
    assert.equal(await page.$('.admin-shell'),null,'No nested legacy shell');
    assert.equal(await page.$$eval('button',els=>els.filter(el=>el.textContent==='Uitloggen').length),1,'One shared sign-out action');
    await page.click('[aria-label="Bekijk melding: Duinenpad"]');await page.waitForSelector('.workspace-report-followup');
    await page.select('.workspace-report-followup select','forwarded');await page.type('.workspace-report-followup textarea','Doorgestuurd naar stadsdiensten.');
    await page.click('[aria-label="Bekijk melding: Verborgen strandmelding"]');await page.waitForSelector('dialog[open]');
    assert.equal(reportRequests.length,0,'Changing selection must not save a public update');
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
    assert.equal(await page.$eval('.workspace-report-followup textarea',el=>el.value),'Doorgestuurd naar stadsdiensten.');
    failReport=true;await page.click('.workspace-report-save button[type=submit]');await page.waitForSelector('.workspace-error');
    assert.equal(await page.$eval('.workspace-report-followup textarea',el=>el.value),'Doorgestuurd naar stadsdiensten.','Failed save preserves draft');
    failReport=false;await page.click('.workspace-report-save button[type=submit]');await page.waitForSelector('.workspace-success');
    assert.equal(reportRequests.at(-1).city_intervention_status,'forwarded');assert.equal(fakeReports[0].description,'Oorspronkelijke melding over afval op het pad.');
    await page.click('.workspace-report-archive button');await page.waitForSelector('dialog[open]');await page.click('dialog[open] .workspace-dialog-actions button:last-child');
    await page.waitForFunction(()=>document.querySelector('.workspace-report-detail')?.textContent.includes('Bewaard in logboek'));
    assert.equal(fakeReports[0].status,'removed');assert.equal(fakeReports[0].city_intervention_note,'Doorgestuurd naar stadsdiensten.');
    await page.goto(base+'/admin/log?report=melding-pending');await page.waitForSelector('.workspace-report-record');
    assert.equal(await page.$('.workspace-report-followup'),null,'Log is read-only');assert.match(await page.$eval('.workspace-report-detail',el=>el.textContent),/Oorspronkelijke melding/);
    await page.click('[aria-label="Meldingdetails sluiten"]');await page.waitForFunction(()=>document.activeElement?.classList.contains('workspace-report-row'));
    await page.click('[aria-label="Bekijk melding: Duinenpad"]');await page.waitForSelector('.workspace-report-record');
    await page.screenshot({path:path.join(process.env.TMPDIR||'/tmp','hondaanzee-report-workbench-desktop.png'),fullPage:true});
    await page.setViewport({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Report workbench has no mobile overflow');
    await page.screenshot({path:path.join(process.env.TMPDIR||'/tmp','hondaanzee-report-workbench-mobile.png'),fullPage:true});
    await page.setViewport({width:1440,height:1000});

    // Notifications: real sending happens only after explicit review; all recipients here are mocked.
    await page.goto(base+'/admin/notificaties');await page.waitForSelector('[name=push-title]');
    await page.waitForFunction(()=>document.querySelector('.workspace-stat strong')?.textContent==='3');
    await page.type('[name=push-title]','Nieuwe kustupdate');await page.type('[name=push-body]','Controleer het nieuwe wandelpad.');
    await page.select('[aria-label="Kies een bestemmingspagina"]','custom');await page.waitForFunction(()=>document.querySelector('.workspace-push-submit button').disabled);
    assert.match(await page.$eval('#push-url-help',el=>el.textContent),/Vul een bestemmingslink/);
    await page.$eval('[name=push-url]',el=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(el,'javascript:alert(1)');el.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.waitForFunction(()=>document.querySelector('.workspace-push-submit button').disabled);
    assert.equal(await page.$('.workspace-push-destination a'),null,'Unsafe preview link is unavailable');
    await page.$eval('[name=push-url]',el=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(el,'/updates');el.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.waitForFunction(()=>!document.querySelector('.workspace-push-submit button').disabled);
    await page.click('.workspace-push-submit button');await page.waitForSelector('dialog[open]');
    assert.equal(pushRequests.length,0,'Opening review never sends a notification');
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
    assert.equal(await page.$eval('[name=push-title]',el=>el.value),'Nieuwe kustupdate','Cancel retains the message');
    await page.reload();await page.waitForFunction(()=>document.querySelector('[name=push-title]')?.value==='Nieuwe kustupdate');
    failPush=true;await page.waitForFunction(()=>!document.querySelector('.workspace-push-submit button').disabled);await page.click('.workspace-push-submit button');await page.waitForSelector('dialog[open]');
    await page.click('dialog[open] .workspace-dialog-actions button:last-child');await page.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Geen notificaties afgeleverd'));
    assert.equal(await page.$eval('[name=push-title]',el=>el.value),'Nieuwe kustupdate','Zero delivery keeps draft and reports the failure honestly');
    failPush=false;await page.waitForFunction(()=>!document.querySelector('.workspace-push-submit button').disabled);await page.click('.workspace-push-submit button');await page.waitForSelector('dialog[open]');
    await page.click('dialog[open] .workspace-dialog-actions button:last-child');await page.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Gedeeltelijk afgeleverd'));
    assert.deepEqual(pushRequests.at(-1),{title:'Nieuwe kustupdate',body:'Controleer het nieuwe wandelpad.',url:'/updates'});
    assert.equal(await page.$eval('[name=push-title]',el=>el.value),'','A sent message clears the local draft but retains its delivery result');
    await page.click('[aria-label="Notificatieweergave"] button:last-child');await page.waitForSelector('.workspace-dispatch-row');
    await page.click('.workspace-dispatch-row');await page.waitForSelector('.workspace-operation-detail');
    await page.click('.workspace-operation-detail>button');await page.waitForSelector('[name=push-title]');
    assert.equal(await page.$eval('[name=push-title]',el=>el.value),'Nieuwe kustupdate');assert.equal(pushRequests.length,2,'Reusing a message never sends it');
    await page.select('[aria-label="Begin met een sjabloon"]','0');await page.waitForSelector('dialog[open]');await page.keyboard.press('Escape');
    assert.equal(await page.$eval('[name=push-title]',el=>el.value),'Nieuwe kustupdate','Replacing a draft requires explicit choice');
    await page.screenshot({path:path.join(process.env.TMPDIR||'/tmp','hondaanzee-notifications-desktop.png'),fullPage:true});
    await page.setViewport({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Notifications have no mobile overflow');
    await page.screenshot({path:path.join(process.env.TMPDIR||'/tmp','hondaanzee-notifications-mobile.png'),fullPage:true});
    await page.setViewport({width:1440,height:1000});
    await page.goto(base + '/_meldpunt-admin');
    await page.waitForFunction(() => location.pathname === '/admin/meldpunt' && document.querySelector('.workspace-report-list'));
    for (const route of ['/admin/meldpunt', '/admin/log', '/admin/notificaties']) {
      await page.goto(base + route); await page.waitForSelector('.workspace-page-heading h1');
      assert.match(await page.$eval('meta[name="robots"]', el => el.content), /noindex/);
    }
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(base + '/admin');
    await page.waitForSelector('.workspace-stats');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile layout has no horizontal overflow');
    await page.screenshot({ path: path.join(process.env.TMPDIR || '/tmp', 'hondaanzee-admin-mobile.png'), fullPage: true });
    await page.click('.workspace-sidebar-footer button');
    await page.waitForFunction(() => document.querySelector('input[autocomplete="username"]') || document.querySelector('.workspace-error'), { timeout: 10000 });
    assert.equal(await page.$('.workspace-error'), null, await page.$eval('body', el => el.textContent));
    assert.equal(await page.$('.workspace-stats'), null, 'Sign out removes the dashboard');
    assert.deepEqual(analyticsRequests, [], 'Admin navigation sends no analytics requests');
    assert.deepEqual(errors, []);
    console.log('Admin browser checks passed: sign-in gate, database catalog/filtering, draft save, conflict handling, new draft, original images and URLs, zone management, immutable review moderation, cursor tooltip, report workbench, preserved originals, save failure recovery, archive, notification preview and confirmation, draft recovery, partial/failed delivery, legacy routes, noindex, mobile, sign out, no analytics requests.');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
