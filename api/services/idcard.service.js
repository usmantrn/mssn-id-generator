import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import fs from 'fs';
import fsAsync from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import prisma from '../prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARD_ASSETS = path.join(__dirname, '../../card-assets');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function loadAssetBase64(filename) {
  const fp = path.join(CARD_ASSETS, filename);
  if (!fs.existsSync(fp)) return '';
  const ext = path.extname(fp).replace('.', '').replace('jpg', 'jpeg');
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(fp).toString('base64')}`;
}

function loadPhotoBase64(photoUrl) {
  if (!photoUrl) return '';
  const filename = path.basename(photoUrl);
  const fp = path.join(UPLOADS_DIR, 'photos', filename);
  if (!fs.existsSync(fp)) return '';
  const ext = path.extname(fp).replace('.', '').replace('jpg', 'jpeg');
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(fp).toString('base64')}`;
}

async function generateQR(data) {
  return await QRCode.toDataURL(data, { width: 200, margin: 1, errorCorrectionLevel: 'M' });
}

function formatDate(d) {
  if (!d) return 'N/A';
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

// ─────────────────────────────────────────────────
// OFFICIAL CARD HTML (Portrait 85.6mm × 135mm)
// ─────────────────────────────────────────────────
async function generatePortraitCardHtml(member) {
  const mssnLogo = loadAssetBase64('mssn-logo.jpeg');
  const futbLogo = loadAssetBase64('futb-logo.jpeg');
  const amirSig = loadAssetBase64('amir-sig.png');
  const photo = loadPhotoBase64(member.photoUrl);
  const qr = await generateQR(`https://mssn-futb.com/verify/${member.memberId}`);
  const name = `${member.firstName} ${member.middleName || ''} ${member.lastName}`.replace(/\s+/g, ' ').toUpperCase();
  const position = member.role === 'official' ? (member.position || 'OFFICIAL').toUpperCase() : 'MEMBER';
  const expiry = member.expiryDate ? formatDate(member.expiryDate) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MSSN Member ID Card</title>
<style>
  @page { size: 85.6mm 135mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 85.6mm; height: 135mm; overflow: hidden; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* ── FRONT ── */
  .card-front { width: 85.6mm; height: 135mm; background: #fff; position: relative; overflow: hidden; page-break-after: always; }

  .lanyard {
    position: absolute; top: 4mm; left: 50%; transform: translateX(-50%);
    width: 16mm; height: 5.5mm; background: #e4e4e4; border-radius: 2.75mm;
    border: 0.5mm solid #c8c8c8;
  }

  .card-top {
    position: absolute; top: 0; left: 0; right: 0;
    display: flex; flex-direction: column; align-items: center;
    padding-top: 11mm;
  }

  .mssn-logo { width: 19mm; height: 19mm; object-fit: contain; margin-bottom: 1.5mm; }

  .org-title { font-size: 15pt; font-weight: 900; color: #165a32; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1; }
  .org-chapter { font-size: 7.5pt; font-weight: 700; color: #222; letter-spacing: 3px; text-transform: uppercase; margin-top: 0.5mm; }

  .role-row { display: flex; align-items: center; gap: 2mm; margin: 2.5mm 5mm 0; width: calc(100% - 10mm); }
  .role-line { flex: 1; height: 1.5px; background: #165a32; }
  .role-text { font-size: 7pt; font-weight: 900; color: #165a32; letter-spacing: 2.5px; white-space: nowrap; }

  .photo-wrap { margin-top: 2.5mm; width: 30mm; height: 36mm; border: 2px solid #165a32; border-radius: 2mm; overflow: hidden; background: #e8e8e8; display: flex; align-items: center; justify-content: center; }
  .photo-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .photo-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
  .photo-placeholder svg { opacity: 0.4; }

  /* Green bottom wave */
  .card-bottom {
    position: absolute; bottom: 0; left: 0; right: 0; height: 52mm;
    background: #165a32; overflow: hidden;
  }
  .card-bottom::before {
    content: ''; position: absolute; top: -12mm; left: -10%; width: 120%; height: 24mm;
    background: #fff; border-radius: 50%;
  }

  /* Diagonal arrow pattern */
  .arrow-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.12; }

  .bottom-content {
    position: absolute; bottom: 0; left: 0; right: 0; top: 12mm;
    display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 7mm;
  }

  .member-name {
    font-size: 10pt; font-weight: 900; color: #fff; text-transform: uppercase;
    text-align: center; letter-spacing: 0.3px; line-height: 1.2; padding: 0 3mm;
  }
  .member-pos {
    font-size: 6.5pt; font-weight: 400; color: rgba(255,255,255,0.88);
    text-transform: uppercase; letter-spacing: 1.5px; margin-top: 1mm;
    text-align: center;
  }
  .member-id {
    position: absolute; bottom: 3mm; left: 4mm;
    font-size: 6pt; color: rgba(255,255,255,0.65); font-family: 'Courier New', monospace;
  }
  .member-expiry {
    position: absolute; bottom: 3mm; right: 4mm;
    font-size: 5.5pt; color: rgba(255,255,255,0.65);
  }

  /* ── BACK ── */
  .card-back { width: 85.6mm; height: 135mm; background: #fff; position: relative; overflow: hidden; }

  .back-lanyard {
    position: absolute; top: 4mm; left: 50%; transform: translateX(-50%);
    width: 16mm; height: 5.5mm; background: #e4e4e4; border-radius: 2.75mm;
    border: 0.5mm solid #c8c8c8;
  }

  .back-top {
    position: absolute; top: 12mm; left: 0; right: 0;
    display: flex; flex-direction: column; align-items: center;
  }

  .logos-row { display: flex; align-items: center; gap: 4mm; margin-bottom: 2.5mm; }
  .back-logo { width: 16mm; height: 16mm; object-fit: contain; }
  .logo-divider { width: 0.5mm; height: 18mm; background: #165a32; }

  .back-title { font-size: 14pt; font-weight: 900; color: #165a32; letter-spacing: 0.5px; text-align: center; line-height: 1; }
  .back-chapter { font-size: 7pt; font-weight: 700; color: #333; letter-spacing: 2.5px; text-align: center; margin-top: 0.8mm; }

  .back-divider { width: 70%; height: 1px; background: #ddd; margin: 4mm auto; }

  .back-notice {
    font-size: 8pt; color: #333; text-align: center; line-height: 1.5;
    padding: 0 6mm;
  }
  .back-notice strong { color: #165a32; }

  .sig-area { margin: 6mm auto 0; width: 55mm; border-top: 1px solid #333; text-align: center; padding-top: 1.5mm; position: relative; }
  .sig-img { position: absolute; bottom: 2mm; left: 50%; transform: translateX(-50%); max-width: 40mm; max-height: 15mm; object-fit: contain; }
  .sig-label { font-style: italic; font-size: 7pt; color: #666; position: relative; z-index: 10; }

  .back-bottom {
    position: absolute; bottom: 0; left: 0; right: 0; height: 11mm;
    background: #165a32; display: flex; align-items: center; justify-content: center;
  }
  .bottom-motto { font-size: 7pt; font-weight: 700; color: #fff; letter-spacing: 3px; text-transform: uppercase; }
</style>
</head>
<body>

<!-- ═══ FRONT ═══ -->
<div class="card-front">
  <div class="lanyard"></div>

  <div class="card-top">
    ${mssnLogo ? `<img src="${mssnLogo}" class="mssn-logo" />` : ''}
    <div class="org-title">MSSN SOCIETY</div>
    <div class="org-chapter">FUTB CHAPTER</div>
    <div class="role-row">
      <div class="role-line"></div>
      <div class="role-text">${member.role === 'official' ? 'OFFICIAL' : 'MEMBER'}</div>
      <div class="role-line"></div>
    </div>
    <div class="photo-wrap">
      ${photo
        ? `<img src="${photo}" />`
        : `<div class="photo-placeholder"><svg width="60" height="72" viewBox="0 0 60 72"><circle cx="30" cy="22" r="16" fill="#aaa"/><ellipse cx="30" cy="60" rx="26" ry="18" fill="#aaa"/></svg></div>`
      }
    </div>
  </div>

  <div class="card-bottom">
    <svg class="arrow-svg" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice">
      <polygon points="-5,0 15,70 -5,140 5,140 25,70 5,0" fill="white"/>
      <polygon points="20,0 40,70 20,140 30,140 50,70 30,0" fill="white"/>
      <polygon points="45,0 65,70 45,140 55,140 75,70 55,0" fill="white"/>
      <polygon points="70,0 90,70 70,140 80,140 100,70 80,0" fill="white"/>
    </svg>
    <div class="bottom-content">
      <div class="member-name">${name}</div>
      <div class="member-pos">${position}</div>
    </div>
    <div class="member-id">ID: ${member.memberId}</div>
    ${expiry ? `<div class="member-expiry">EXP: ${expiry}</div>` : ''}
  </div>
</div>

<!-- ═══ BACK ═══ -->
<div class="card-back">
  <div class="back-lanyard"></div>

  <div class="back-top">
    <div class="logos-row">
      ${mssnLogo ? `<img src="${mssnLogo}" class="back-logo" />` : ''}
      <div class="logo-divider"></div>
      ${futbLogo ? `<img src="${futbLogo}" class="back-logo" />` : ''}
    </div>
    <div class="back-title">MSSN SOCIETY</div>
    <div class="back-chapter">FUTB CHAPTER</div>
    <div class="back-divider"></div>
    <div class="back-notice">
      This ID card is the property of<br/>
      MSSN Society FUTB Chapter.<br/>
      If found, please return to the<br/>
      <strong>FUTB OFFICE.</strong>
    </div>
    <div class="sig-area">
      ${amirSig ? `<img src="${amirSig}" class="sig-img" />` : ''}
      <div class="sig-label">Amir's Signature</div>
    </div>
  </div>

  <div class="back-bottom">
    <div class="bottom-motto">UNITY &bull; FAITH &bull; KNOWLEDGE &bull; SERVICE</div>
  </div>
</div>

</body>
</html>`;
}

// ─────────────────────────────────────────────────
// MEMBER CARD HTML (Landscape 85.6mm × 54mm)
// ─────────────────────────────────────────────────
async function generateLandscapeCardHtml(member) {
  const mssnLogo = loadAssetBase64('mssn-logo.jpeg');
  const futbLogo = loadAssetBase64('futb-logo.jpeg');
  const amirSig = loadAssetBase64('amir-sig.png');
  const photo = loadPhotoBase64(member.photoUrl);
  const qr = await generateQR(`https://mssn-futb.com/verify/${member.memberId}`);
  const name = `${member.firstName} ${member.middleName || ''} ${member.lastName}`.replace(/\s+/g, ' ').trim().toUpperCase();
  const post = (member.role === 'official' ? (member.position || 'Official') : 'Member').toUpperCase();
  const issueDate = formatDate(member.issueDate || new Date()).toUpperCase();
  const expiryDate = (member.expiryDate ? formatDate(member.expiryDate) : 'N/A').toUpperCase();

  function field(label, value) {
    return `<tr>
      <td class="fl" style="padding-right: 2mm;">${label.toUpperCase()}:</td>
      <td class="fv"><strong>${value}</strong></td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MSSN Official ID Card</title>
<style>
  @page { size: 85.6mm 54mm landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 85.6mm; height: 54mm; font-family: 'Inter', system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; overflow: hidden; }

  /* ── FRONT ── */
  .card-front { width: 85.6mm; height: 54mm; background: #fff; position: relative; overflow: hidden; page-break-after: always; }
  .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; width: 35mm; height: 35mm; pointer-events: none; z-index: 0; }

  .hdr { display: flex; align-items: center; justify-content: space-between; padding: 1.5mm 2mm 1mm; border-bottom: 0.5px solid #ccc; position: relative; z-index: 1; }
  .hdr-logo { width: 10mm; height: 10mm; object-fit: contain; flex-shrink: 0; }
  .hdr-logo-placeholder { width: 10mm; height: 10mm; flex-shrink: 0; }
  .hdr-text { flex: 1; text-align: center; padding: 0 1mm; }
  .hdr-org { font-size: 6.5pt; font-weight: 900; color: #165a32; line-height: 1.2; letter-spacing: 0.3px; }
  .hdr-sub { font-size: 5pt; color: #1a3a7a; font-weight: 700; line-height: 1.3; }
  .hdr-addr { font-size: 4pt; color: #555; font-weight: 600; font-style: italic; margin-top: 0.5mm; }

  .badge-row { display: flex; align-items: center; justify-content: space-between; padding: 1.5mm 2mm; border-bottom: 0.5px solid #eaeaea; background: #fdfdfd; position: relative; z-index: 1; }
  .badge { background: #b22222; color: #fff; font-size: 4.8pt; font-weight: 800; padding: 1mm 2.5mm; letter-spacing: 0.5px; border-radius: 1mm; box-shadow: 0 1px 2px rgba(178,34,34,0.2); }
  .session { font-size: 4.8pt; color: #555; font-weight: 600; }

  .body-row { display: flex; height: 32mm; position: relative; z-index: 1; }

  .photo-col { width: 24mm; background: #f8fafc; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-right: 0.5px solid #eaeaea; }
  .photo-col img { width: 100%; height: 100%; object-fit: cover; }
  .photo-ph { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
  .photo-ph svg { opacity: 0.6; }

  .fields-col { flex: 1; padding: 1.5mm 2mm; display: flex; flex-direction: column; justify-content: center; }
  .ftable { font-size: 5pt; line-height: 2; width: 100%; margin-left: 2mm; }
  .fl { color: #555; white-space: nowrap; font-size: 4.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2px; }
  .fd { color: #888; font-family: monospace; font-size: 4pt; padding: 0 0.5mm; }
  .fv { color: #111; font-size: 5pt; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 1mm; }

  .qr-col { width: 25mm; display: flex; align-items: flex-end; justify-content: center; padding: 0 10mm 3.5mm 0; flex-shrink: 0; }
  .qr-col img { width: 14mm; height: 14mm; border-radius: 1mm; border: 0.5px solid #eaeaea; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

  .card-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 4mm; display: flex; z-index: 2; }
  .bar-green { flex: 1; background: #165a32; }
  .bar-blue { flex: 1; background: #1a3a7a; }
  .bar-lblue { flex: 1; background: #4a90c4; }

  /* ── BACK ── */
  .card-back { width: 85.6mm; height: 54mm; background: #fff; position: relative; overflow: hidden; }

  .back-hdr { display: flex; justify-content: center; align-items: center; gap: 3mm; padding: 2.5mm 2mm 1mm; }
  .back-logo { width: 11mm; height: 11mm; object-fit: contain; }

  .back-notice { font-size: 5.5pt; font-weight: 700; color: #333; text-align: center; padding: 0 5mm 1mm; line-height: 1.5; letter-spacing: 0.2px; }

  .amir-sig-wrap { position: relative; text-align: center; margin-top: 3mm; height: 14mm; display: flex; flex-direction: column; justify-content: flex-end; }
  .amir-sig-img { position: absolute; bottom: 3mm; left: 50%; transform: translateX(-50%); max-width: 40mm; max-height: 12mm; object-fit: contain; }
  .amir-sig { font-size: 5.5pt; font-weight: 700; color: #333; position: relative; z-index: 10; }

  .back-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 4mm; display: flex; }
</style>
</head>
<body>

<!-- ═══ FRONT ═══ -->
<div class="card-front">
  ${mssnLogo ? `<img src="${mssnLogo}" class="watermark" />` : ''}
  <div class="hdr">
    ${futbLogo ? `<img src="${futbLogo}" class="hdr-logo" />` : '<div class="hdr-logo-placeholder"></div>'}
    <div class="hdr-text">
      <div class="hdr-org">MUSLIM STUDENTS' SOCIETY OF NIGERIA</div>
      <div class="hdr-sub">FEDERAL UNIVERSITY OF TECHNOLOGY BABURA CHAPTER</div>
      <div class="hdr-addr">P.M.B. 2022, Babura, Nigeria.</div>
    </div>
    ${mssnLogo ? `<img src="${mssnLogo}" class="hdr-logo" />` : '<div class="hdr-logo-placeholder"></div>'}
  </div>

  <div class="badge-row">
    <div class="badge">${member.role === 'official' ? 'OFFICIAL ID CARD' : 'MEMBERSHIP ID CARD'}</div>
    <div class="session">Academic Session: ${member.session || '2025/2026'}</div>
  </div>

  <div class="body-row">
    <div class="photo-col">
      ${photo
        ? `<img src="${photo}" />`
        : `<div class="photo-ph"><svg width="50" height="60" viewBox="0 0 60 72"><circle cx="30" cy="20" r="14" fill="rgba(255,255,255,0.7)"/><ellipse cx="30" cy="58" rx="24" ry="18" fill="rgba(255,255,255,0.7)"/></svg></div>`
      }
    </div>

    <div class="fields-col">
      <table class="ftable">
        ${field('Name', name)}
        ${field('Post', post)}
        ${field('Date Issue', issueDate)}
        ${field('Date Expiry', expiryDate)}
      </table>
    </div>

    <div class="qr-col">
      <img src="${qr}" />
    </div>
  </div>

  <div class="card-bar">
    <div class="bar-green"></div>
    <div class="bar-blue"></div>
    <div class="bar-lblue"></div>
  </div>
</div>

<!-- ═══ BACK ═══ -->
<div class="card-back">
  <div class="back-hdr">
    ${futbLogo ? `<img src="${futbLogo}" class="back-logo" />` : ''}
    ${mssnLogo ? `<img src="${mssnLogo}" class="back-logo" />` : ''}
  </div>

  <div class="back-notice">
    THIS ID CARD IS THE PROPERTY OF MSSN SOCIETY FUTB CHAPTER.<br/>
    IF FOUND PLEASE RETURN TO THE FUTB MSSN OFFICE.
  </div>

  <div class="amir-sig-wrap">
    ${amirSig ? `<img src="${amirSig}" class="amir-sig-img" />` : ''}
    <div class="amir-sig">Amir's Signature / توقيع الأمير</div>
  </div>

  <div class="back-bar">
    <div class="bar-green"></div>
    <div class="bar-blue"></div>
    <div class="bar-lblue"></div>
  </div>
</div>

</body>
</html>`;
}

// ─────────────────────────────────────────────────
// PDF Generation via Puppeteer
// ─────────────────────────────────────────────────
export async function generateCardPdf(member) {
  const isOfficial = member.role === 'official';
  
  // SWAPPED: Official -> Landscape, Member -> Portrait
  const html = isOfficial
    ? await generateLandscapeCardHtml(member)
    : await generatePortraitCardHtml(member);

  const cardsDir = path.join(UPLOADS_DIR, 'cards');
  await fsAsync.mkdir(cardsDir, { recursive: true });

  const filename = `${crypto.randomUUID()}.pdf`;
  const safePath = path.join(cardsDir, filename);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: 'new'
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // SWAPPED: Official -> Landscape, Member -> Portrait
    const pdfOptions = isOfficial
      ? { width: '85.6mm', height: '54mm', landscape: false, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } }
      : { width: '85.6mm', height: '135mm', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } };

    const pdfBuffer = await page.pdf(pdfOptions);
    await fsAsync.writeFile(safePath, pdfBuffer);
  } finally {
    if (browser) await browser.close();
  }

  return `/api/cards/${filename}`;
}

// ─────────────────────────────────────────────────
// Public verification lookup
// ─────────────────────────────────────────────────
export async function verifyMember(memberId) {
  const member = await prisma.member.findUnique({
    where: { memberId },
    select: {
      memberId: true, firstName: true, middleName: true, lastName: true,
      role: true, position: true, session: true,
      photoUrl: true, expiryDate: true, issueDate: true, status: true
    }
  });
  return member;
}
