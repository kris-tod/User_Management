import puppeteer from 'puppeteer';
import Mustache from 'mustache';
import fs from 'fs';
import { staticDirPath, domain } from '../config/index.js';

const exportWebsiteAsPdf = async (html, fileName) => {
  const browser = await puppeteer.launch({
    headless: 'new'
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  await page.emulateMediaType('screen');

  const PDF = await page.pdf({
    path: `${staticDirPath}/${fileName}`,
    margin: {
      top: '100px',
      right: '50px',
      bottom: '100px',
      left: '50px'
    },
    printBackground: true,
    format: 'A4'
  });

  await browser.close();
  return PDF;
};

export class PdfService {
  static async generatePdfForProtocol(data) {
    const html = fs.readFileSync(`${staticDirPath}/protocolTemplate.html`, { encoding: 'utf8' });
    const filledTemplate = Mustache.render(html, data);

    await exportWebsiteAsPdf(filledTemplate, `protocol-${data.id}.pdf`);
    return {
      path: `${domain}/protocol-${data.id}.pdf`
    };
  }
}
