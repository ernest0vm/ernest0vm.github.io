/**
 * Builds the print-only CV route (src/pages/cv/print-[lang].astro) and prints it to
 * PDF, one file per locale, into cv-pdf/. Run by .github/workflows/cv-pdf.yml,
 * which publishes the files as assets of the `cv` GitHub release.
 *
 *   yarn cv:pdf
 *
 * Uses the Chrome already installed on the machine (GitHub's ubuntu runners
 * ship one), so no browser download is needed. Set CHROME_PATH to use a
 * different binary.
 */
import console from 'node:console';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { URL } from 'node:url';
import { build, preview } from 'astro';
import { chromium } from 'playwright-core';

const BUILD_DIR = './dist-cv/';
const PDF_DIR = 'cv-pdf';
const PORT = 4330;

/** Chrome writes one `/Type /Page` object per page (`/Pages` is the tree). */
const countPages = (pdf) =>
  pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;

const data = JSON.parse(
  await readFile(new URL('../src/data/resumeData.json', import.meta.url)),
);

// The file names come from the download links in resumeData.json, so the PDF
// and the button that points at it cannot drift apart.
const targets = ['es', 'en'].map((lang) => ({
  lang,
  file: new URL(data.main.resumedownload[lang]).pathname.split('/').pop(),
}));

// Turns on the route's getStaticPaths. A separate outDir keeps this build from
// clobbering the site's dist/.
process.env.CV_PDF = '1';
await rm(BUILD_DIR, { recursive: true, force: true });
await build({ outDir: BUILD_DIR, logLevel: 'warn' });

const server = await preview({
  outDir: BUILD_DIR,
  server: { port: PORT },
  logLevel: 'warn',
});
const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: 'chrome' },
);

try {
  await mkdir(PDF_DIR, { recursive: true });
  const page = await browser.newPage();

  for (const { lang, file } of targets) {
    const url = `http://localhost:${PORT}/resume/cv/print-${lang}/`;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    // goto() does not throw on 404, and an error page prints just fine.
    if (!response?.ok()) {
      throw new Error(`${url} answered ${response?.status()}`);
    }
    // Runs in the page; passed as a string because it is browser code.
    await page.evaluate('document.fonts.ready');

    const options = {
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      // Header/footer templates render outside the page and cannot see its
      // fonts or styles, hence the inline system font.
      footerTemplate: `<div style="width:100%;padding:0 14mm;font:7pt Helvetica,Arial,sans-serif;color:#8a8f99;display:flex;justify-content:space-between">
          <span>${data.main.name}</span>
          <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>`,
    };

    // CSS cannot target "the last page", so print twice: the first pass only
    // counts pages, then the layout pins the closing quote to the bottom of
    // the last one (see .pinned in the CV page).
    const pages = countPages(await page.pdf(options));
    await page.evaluate(`(() => {
      const quote = document.querySelector('.closing-quote');
      if (!quote) return;
      const root = document.documentElement;
      const space = quote.offsetHeight + parseFloat(getComputedStyle(quote).marginTop);
      root.style.setProperty('--pages', ${pages});
      root.style.setProperty('--quote-space', space + 'px');
      root.classList.add('pinned');
    })()`);
    const pdf = await page.pdf(options);
    if (countPages(pdf) !== pages) {
      throw new Error(`${file}: pinning the quote changed the page count`);
    }

    const path = `${PDF_DIR}/${file}`;
    await writeFile(path, pdf);
    console.log(`✓ ${path}`);
  }
} finally {
  await browser.close();
  await server.stop();
}
