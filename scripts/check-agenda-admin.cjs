const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  { createServer } = require("node:http"),
  puppeteer = require("puppeteer");
const { EVENTS } = require("./place-data.cjs");
const dist = path.resolve(__dirname, "../dist");
const server = createServer((req, res) => {
  let file = path.join(dist, new URL(req.url, "http://localhost").pathname);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory())
    file = path.join(file, "index.html");
  if (!fs.existsSync(file)) file = path.join(dist, "private.html");
  res.setHeader(
    "Content-Type",
    {
      ".js": "application/javascript",
      ".css": "text/css",
      ".html": "text/html",
      ".webp": "image/webp",
      ".json": "application/json",
    }[path.extname(file)] || "application/octet-stream",
  );
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  let browser;
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage(),
      errors = [],
      requests = [],
      measurements = [];
    const clone = (v) => JSON.parse(JSON.stringify(v));
    const records = EVENTS.map((content, i) => ({
      id: `30000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      legacy_id: content.id,
      slug: content.slug,
      version: 1,
      draft_revision_id: `revision-${i + 1}`,
      published_revision_id: `revision-${i + 1}`,
      updated_at: "2026-10-03T15:00:00Z",
      draft: { content: clone(content) },
      published: { content: clone(content) },
    }));
    const revisions = new Map(
      records.map((e) => [
        e.id,
        [
          {
            id: e.draft_revision_id,
            revision_number: 1,
            content: clone(e.draft.content),
            created_at: "2026-10-03T15:00:00Z",
          },
        ],
      ]),
    );
    let conflict = false,
      failAnalytics = false;
    const cors = {
      "Access-Control-Allow-Origin": base,
      "Access-Control-Allow-Headers":
        "authorization,apikey,content-type,x-client-info,x-supabase-api-version,x-admin-access-token",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    };
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.setBypassServiceWorker(true);
    await page.setRequestInterception(true);
    await page.evaluateOnNewDocument(() =>
      Object.defineProperty(navigator, "serviceWorker", { value: undefined }),
    );
    page.on("request", async (req) => {
      const url = new URL(req.url());
      const reply = (body, status = 200) =>
        req.respond({
          status,
          headers: cors,
          contentType: "application/json",
          body: JSON.stringify(body),
        });
      if (
        url.pathname.includes("site-analytics") ||
        url.pathname.includes("/_vercel/insights")
      )
        measurements.push(req.url());
      if (url.hostname.endsWith("supabase.co")) {
        if (req.method() === "OPTIONS")
          return req.respond({ status: 204, headers: cors });
        const input = req.postData() ? JSON.parse(req.postData()) : {};
        if (url.pathname.endsWith("/admin-events")) {
          requests.push(input);
          if (input.action === "list") return reply({ events: records });
          const record = records.find((e) => e.id === input.id);
          if (input.action === "detail")
            return reply({ event: record, history: revisions.get(record.id) });
          if (input.action === "create") {
            const id = "30000000-0000-4000-8000-000000000999",
              content = { ...input.patch, id: 999, slug: input.slug };
            const e = {
              id,
              legacy_id: 999,
              slug: input.slug,
              version: 1,
              draft_revision_id: "new",
              published_revision_id: null,
              draft: { content },
              published: null,
            };
            records.push(e);
            revisions.set(id, [
              {
                id: "new",
                revision_number: 1,
                content: clone(content),
                created_at: new Date().toISOString(),
              },
            ]);
            return reply({ id, version: 1 }, 201);
          }
          if (conflict) {
            record.version++;
            record.draft.content.subtitle = "Andere sessie";
            return reply(
              {
                error:
                  "Dit evenement is intussen gewijzigd. Je invoer is behouden.",
              },
              409,
            );
          }
          if (input.action === "restore")
            record.draft.content = clone(
              revisions.get(record.id).find((r) => r.id === input.revisionId)
                .content,
            );
          else
            for (const [k, v] of Object.entries(input.patch)) {
              if (v === null) delete record.draft.content[k];
              else record.draft.content[k] = v;
            }
          record.version++;
          record.draft_revision_id = "saved-" + record.version;
          revisions.get(record.id).unshift({
            id: record.draft_revision_id,
            revision_number: record.version,
            content: clone(record.draft.content),
            created_at: new Date().toISOString(),
          });
          return reply({ version: record.version });
        }
        if (url.pathname.endsWith("/admin-members"))
          return reply({ allowed: true });
        if (url.pathname.endsWith("/admin-reviews"))
          return reply({ counts: { attention: 0 } });
        if (url.pathname.endsWith("/admin-media"))
          return reply({
            ready: false,
            message: "Test upload uitgeschakeld",
            assets: [],
          });
        if (url.pathname.endsWith("/admin-content"))
          return reply({ places: [] });
        if (url.pathname.endsWith("/admin-zones")) return reply({ zones: [] });
        if (url.pathname.endsWith("/admin-publication")) {
          requests.push(input);
          return reply({ configured: true, jobs: [] });
        }
        if (url.pathname.endsWith("/admin-analytics")) {
          requests.push(input);
          if (failAnalytics)
            return reply({ error: "Test: rapport niet beschikbaar" }, 500);
          const rows = [
            {
              day: "2026-10-03",
              hour: "2026-10-03T15:00:00Z",
              path: "/agenda",
              event: "pageview",
              referrer: "google",
              device: "mobile",
              count: 8,
            },
            {
              day: "2026-10-03",
              hour: "2026-10-03T15:00:00Z",
              path: `/agenda/${records[3].slug}`,
              event: "pageview",
              referrer: "google",
              device: "mobile",
              count: 5,
            },
            {
              day: "2026-10-03",
              hour: "2026-10-03T15:00:00Z",
              path: `/agenda/${records[3].slug}`,
              event: "ticket",
              referrer: "direct",
              device: "desktop",
              count: 2,
            },
          ].filter(
            (r) => !input.eventSlug || r.path === `/agenda/${input.eventSlug}`,
          );
          return reply({
            rows,
            today: "2026-10-03",
            eventCoverage: records.map((e) => ({
              event_slug: e.slug,
              started_at: "2026-10-03T14:00:00Z",
              actions_started_at: "2026-10-03T15:00:00Z",
            })),
            ...(input.hours
              ? {
                  window: {
                    start: "2026-10-02T16:00:00Z",
                    end: "2026-10-03T15:00:00Z",
                    now: "2026-10-03T15:25:00Z",
                    startedAt: "2026-10-02T18:00:00Z",
                  },
                }
              : {}),
          });
        }
        return reply({});
      }
      if (!req.url().startsWith(base)) return req.abort();
      return req.continue();
    });
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(base + "/admin/agenda");
    await page.waitForSelector('input[autocomplete="username"]');
    assert.equal(await page.$(".workspace-event-list"), null);
    const user = {
        id: "00000000-0000-4000-8000-000000000001",
        email: "admin@hondaanzee.be",
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {},
        created_at: "2026-01-01T00:00:00Z",
      },
      exp = Math.floor(Date.now() / 1000) + 3600,
      token = [
        Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
          "base64url",
        ),
        Buffer.from(
          JSON.stringify({
            sub: user.id,
            exp,
            aud: "authenticated",
            role: "authenticated",
          }),
        ).toString("base64url"),
        "test-only-invalid-signature",
      ].join(".");
    await page.evaluate(
      (session) =>
        localStorage.setItem(
          "sb-zpllibfxaizavcvztnut-auth-token",
          JSON.stringify(session),
        ),
      {
        access_token: token,
        refresh_token: "test-only",
        expires_at: exp,
        expires_in: 3600,
        token_type: "bearer",
        user,
      },
    );
    await page.reload();
    await page.waitForSelector(".workspace-event-row");
    assert.equal(
      await page.$$eval(".workspace-event-row", (xs) => xs.length),
      21,
    );
    const set = async (selector, value) => {
      await page.waitForSelector(selector);
      return page.$eval(
        selector,
        (el, v) => {
          const proto =
            el.tagName === "TEXTAREA"
              ? HTMLTextAreaElement.prototype
              : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        },
        value,
      );
    };
    const tab = async (label) => {
      await page.evaluate(
        (label) =>
          [...document.querySelectorAll(".workspace-period button")]
            .find((b) => b.textContent === label)
            .click(),
        label,
      );
    };
    const chosen = records.find((e) => e.slug === "dogs-friends-2027"),
      original = clone(chosen.draft.content);
    await page.goto(base + "/admin/agenda/" + chosen.id);
    await page.waitForSelector("input[name=title]");
    await set("[name=subtitle]", "Browsercontrole");
    await set("textarea[name=highlights]", "Eerste regel\nTweede regel\n");
    await page.click(".workspace-savebar button");
    await page.waitForSelector(".workspace-success");
    assert.equal(chosen.draft.content.subtitle, "Browsercontrole");
    assert.deepEqual(chosen.draft.content.highlights, [
      "Eerste regel",
      "Tweede regel",
    ]);
    assert.deepEqual(
      chosen.draft.content.detailGallery,
      original.detailGallery,
    );
    assert.deepEqual(chosen.published.content, original);
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent === "Concept bekijken")
        .click(),
    );
    await page.waitForSelector(".workspace-event-preview");
    assert.match(
      await page.$eval(".workspace-event-preview", (e) => e.textContent),
      /Browsercontrole/,
    );
    assert.equal(measurements.length, 0, "Admin preview emits no analytics");
    await tab("Geschiedenis");
    await page.click(".workspace-revision summary");
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent === "Vergelijken met concept")
        .click(),
    );
    await page.waitForSelector(".workspace-event-diff");
    await page.evaluate(
      () =>
        ([...document.querySelectorAll("details.workspace-revision")].at(
          -1,
        ).open = true),
    );
    await page.evaluate(() =>
      [...document.querySelectorAll("details.workspace-revision")]
        .at(-1)
        .querySelectorAll("button")[1]
        .click(),
    );
    await page.waitForFunction(() =>
      document
        .querySelector(".workspace-success")
        ?.textContent.includes("hersteld"),
    );
    assert.deepEqual(chosen.draft.content, original);
    await tab("Inhoud");
    conflict = true;
    await set("[name=subtitle]", "Lokale invoer blijft");
    await page.click(".workspace-savebar button");
    await page.waitForSelector(".workspace-error");
    assert.equal(
      await page.$eval("[name=subtitle]", (e) => e.value),
      "Lokale invoer blijft",
    );
    assert.match(
      await page.$eval(".workspace-content", (e) => e.textContent),
      /nieuwere versie/,
    );
    conflict = false;
    await page.goto(base + "/admin/agenda/nieuw?copy=" + chosen.id);
    await page.waitForSelector("input[name=title]");
    assert.equal(await page.$eval("[name=slug]", (e) => e.value), "");
    await tab("Organisator & prijs");
    assert.equal(await page.$eval("[name=entryPrice]", (e) => e.value), "");
    assert.equal(await page.$eval("[name=lastVerified]", (e) => e.value), "");
    await page.goto(base + "/admin/agenda/nieuw");
    await page.waitForSelector("input[name=title]");
    await set("input[name=title]", "Nieuwe testeditie");
    await set("textarea[name=description]", "Alleen lokale browsertest.");
    await set("[name=slug]", "browser-test-2027");
    await tab("Datum & plaats");
    await set("[name=city]", "testplaats");
    await set("[name=cityName]", "Testplaats");
    await set("[name=location]", "Testlocatie");
    await page.click(".workspace-savebar button");
    await page.waitForFunction(() =>
      location.pathname.endsWith("000000000999"),
    );
    await page.waitForSelector("input[name=title]");
    assert.equal(
      await page.$eval("input[name=title]", (e) => e.value),
      "Nieuwe testeditie",
    );
    await page.goto(base + "/admin/publiceren");
    await page.waitForSelector(".workspace-publication-list");
    await page.click(".workspace-publication-list input");
    await page.click(".workspace-savebar button");
    await page.waitForSelector(".workspace-success");
    assert.equal(
      requests.filter((r) => r.action === "publish").at(-1).events[chosen.id],
      chosen.version,
    );
    assert.deepEqual(
      requests.filter((r) => r.action === "publish").at(-1).places,
      {},
    );
    await page.goto(base + "/admin/agenda/analytics");
    await page.waitForSelector(".workspace-chart");
    assert.equal(new URL(page.url()).pathname, "/admin/analytics/agenda");
    assert.ok(await page.$('.workspace-nav-submenu a[href="/admin/analytics/agenda"].is-active'));
    assert.equal(await page.$('nav[aria-label="Adminnavigatie"] > a[href="/admin/agenda"].is-active'), null);
    await page.click('.workspace-analytics-navigation a[href="/admin/analytics"]');
    await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Analytics');
    await page.click('.workspace-nav-submenu a[href="/admin/analytics/agenda"]');
    await page.waitForSelector(".workspace-chart");
    assert.deepEqual(
      await page.$$eval(".workspace-stat strong", (xs) =>
        xs.map((x) => x.textContent),
      ),
      ["8", "5", "2", "0"],
    );
    await page.select(".workspace-form select", records[3].slug);
    await page.waitForFunction(
      () => document.querySelectorAll(".workspace-stat").length === 3,
    );
    assert.equal(
      requests.filter((r) => r.days).at(-1).eventSlug,
      records[3].slug,
    );
    await tab("24 uur");
    await page.waitForSelector(".workspace-chart");
    await page.waitForFunction(
      () =>
        document.querySelector("button[aria-pressed=true]")?.textContent ===
        "24 uur",
    );
    assert.equal(
      requests.filter((r) => r.hours).at(-1).eventSlug,
      records[3].slug,
    );
    failAnalytics = true;
    await page.click(".workspace-page-heading button");
    await page.waitForSelector(".workspace-error");
    assert.match(
      await page.$eval(".workspace-error", (e) => e.textContent),
      /niet beschikbaar/,
    );
    failAnalytics = false;
    await page.goto(base + "/admin/agenda/" + records[3].id + "/analytics");
    await page.waitForSelector(".workspace-chart");
    assert.equal(new URL(page.url()).pathname, "/admin/analytics/agenda/" + records[3].id);
    assert.ok(await page.$('.workspace-nav-submenu a[href="/admin/analytics/agenda"].is-active'));
    assert.equal(requests.filter(r => r.days).at(-1).eventSlug, records[3].slug);
    await page.goto(base + "/admin/agenda");
    await page.waitForSelector(".workspace-event-row");
    fs.mkdirSync(path.resolve(__dirname, "../.admin-local"), {
      recursive: true,
    });
    await page.screenshot({
      path: path.resolve(
        __dirname,
        "../.admin-local/agenda-admin-test-desktop.png",
      ),
      fullPage: true,
    });
    await page.setViewport({ width: 390, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Agenda mobile overflow",
    );
    await page.screenshot({
      path: path.resolve(
        __dirname,
        "../.admin-local/agenda-admin-test-mobile.png",
      ),
      fullPage: true,
    });
    await page.goto(base + "/admin/agenda/" + chosen.id);
    await page.waitForSelector("input[name=title]");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Editor mobile overflow",
    );
    assert.deepEqual(errors, []);
    assert.equal(measurements.length, 0);
    console.log(
      "Agenda admin browser passed: login gate, 21 fiches, full save, ordered gallery preservation, private preview, revision comparison/restore, conflict preservation, new edition reset, create, event-only publication, filtered day/hour analytics, errors, mobile and no admin tracking. All backend requests intercepted.",
    );
  } finally {
    if (browser) await browser.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
