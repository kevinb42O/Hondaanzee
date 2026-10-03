// Runs the production bundle with every network request intercepted. No real traffic.
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  puppeteer = require("puppeteer");
const dist = path.resolve(__dirname, "../dist");
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage(),
      events = [],
      errors = [];
    await page.setBypassServiceWorker(true);
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "serviceWorker", { value: undefined });
    });
    await page.setRequestInterception(true);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.endsWith("/site-analytics")) {
        if (request.method() === "POST")
          events.push(JSON.parse(request.postData()));
        return request.respond({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "https://hondaanzee.be",
            "Access-Control-Allow-Headers": "content-type",
          },
        });
      }
      if (url.hostname !== "hondaanzee.be")
        return request.respond({ status: 204 });
      let file = path.join(dist, url.pathname);
      if (fs.existsSync(file) && fs.statSync(file).isDirectory())
        file = path.join(file, "index.html");
      if (!fs.existsSync(file)) return request.respond({ status: 204 });
      return request.respond({
        status: 200,
        contentType:
          {
            ".js": "application/javascript",
            ".css": "text/css",
            ".html": "text/html",
            ".webp": "image/webp",
            ".json": "application/json",
          }[path.extname(file)] || "application/octet-stream",
        body: fs.readFileSync(file),
      });
    });
    await page.goto("https://hondaanzee.be/agenda/fotoshoot-de-haan-2026");
    await page.waitForSelector(".event-detail-content");
    await page.waitForFunction(() => document.title.includes("De Haan"));
    await page.waitForFunction(() =>
      document.querySelector('.event-detail-content a[href^="https://"]'),
    );
    const click = async (text) => {
      await page.evaluate((text) => {
        const a = [
          ...document.querySelectorAll(".event-detail-content a"),
        ].find((a) => a.textContent.includes(text));
        if (!a) throw Error("Missing link: " + text);
        a.addEventListener("click", (e) => e.preventDefault(), { once: true });
        a.click();
      }, text);
    };
    const before = events.length;
    await click("Tickets / inschrijven");
    await page.waitForFunction(() => true);
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(events.length, before + 1);
    assert.equal(events.at(-1).event, "ticket");
    await click("Route naar de locatie");
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(events.at(-1).event, "route");
    assert.equal(events.length, before + 2);
    assert.deepEqual(errors, []);
    console.log(
      "Public event actions: one ticket event and one route event; one per click. Every request intercepted; no production counters written.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
