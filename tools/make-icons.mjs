// Generates the HomeBase PWA icons at build time (pure Node, no dependencies).
// Mark: a brass "H" with a teal meridian bar on the app's blue-black ground.
// Runs automatically before `vite build` via the package.json `prebuild` script,
// so the PNGs exist in dist/ without binary files living in the repo.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const BG = [0x0a, 0x0e, 0x13];
const BRASS = [0xc9, 0xa8, 0x6a];
const TEAL = [0x3e, 0xc6, 0xb8];

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(size, pixels) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filter: none
    pixels.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size, glyphScale) {
  const px = Buffer.alloc(size * size * 3);
  const set = (x, y, rgb) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 3;
    px[i] = rgb[0]; px[i + 1] = rgb[1]; px[i + 2] = rgb[2];
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) set(x, y, BG);

  const gw = Math.round(size * glyphScale);
  const gh = Math.round(size * glyphScale);
  const gx = Math.round((size - gw) / 2);
  const gy = Math.round((size - gh) / 2) - Math.round(size * 0.03);
  const barW = Math.max(2, Math.round(gw * 0.17));
  const crossH = Math.max(2, Math.round(gh * 0.15));
  const crossY = gy + Math.round((gh - crossH) / 2);
  for (let y = gy; y < gy + gh; y++) {
    for (let x = gx; x < gx + barW; x++) set(x, y, BRASS);
    for (let x = gx + gw - barW; x < gx + gw; x++) set(x, y, BRASS);
  }
  for (let y = crossY; y < crossY + crossH; y++)
    for (let x = gx; x < gx + gw; x++) set(x, y, BRASS);

  const tealH = Math.max(2, Math.round(size * 0.035));
  const tealY = gy + gh + Math.round(size * 0.055);
  for (let y = tealY; y < tealY + tealH; y++)
    for (let x = gx; x < gx + gw; x++) set(x, y, TEAL);

  return encodePNG(size, px);
}

const out = [
  ['public/icons/icon-192.png', 192, 0.58],
  ['public/icons/icon-512.png', 512, 0.58],
  ['public/icons/icon-512-maskable.png', 512, 0.44],
];
for (const [path, size, scale] of out) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, drawIcon(size, scale));
  console.log('icon:', path, `${size}x${size}`);
}
