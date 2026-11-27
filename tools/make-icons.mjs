// Generates the HomeBase PWA icons at build time (pure Node, no dependencies).
// Mark: the "Meridian Dial" (brass ring and roof-needle, teal hub) on the app's blue-black ground.
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

// Geometry of the "Meridian Dial" mark on its 256-unit design grid (masters in docs/brand/):
// a brass ring with three brass ticks (E, S, W), a brass roof chevron as the needle,
// and a teal hub dot plus teal north tick.
const ROOF = [[62.34, 114.34], [128, 48.69], [193.66, 114.34], [182.34, 125.66], [128, 71.31], [73.66, 125.66]];
const TICKS = [[212, 122, 224, 134], [122, 212, 134, 224], [32, 122, 44, 134]];
const NTICK = [122, 32, 134, 48];

function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const inRect = (x, y, r) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];

// Colour of one point of the mark in design units, or null for the background.
function markAt(u, v) {
  const d = Math.hypot(u - 128, v - 128);
  if (d <= 12 || inRect(u, v, NTICK)) return TEAL;
  if ((d >= 96 && d <= 112) || inPoly(u, v, ROOF) || TICKS.some((r) => inRect(u, v, r))) return BRASS;
  return null;
}

function drawIcon(size, glyphScale) {
  const px = Buffer.alloc(size * size * 3);
  const k = (size * glyphScale) / 256; // pixels per design unit
  const off = (size - 256 * k) / 2;
  const SS = 4; // 4x4 supersampling for smooth edges
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = markAt((x + (sx + 0.5) / SS - off) / k, (y + (sy + 0.5) / SS - off) / k) || BG;
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const i = (y * size + x) * 3;
      const n = SS * SS;
      px[i] = Math.round(r / n); px[i + 1] = Math.round(g / n); px[i + 2] = Math.round(b / n);
    }
  }
  return encodePNG(size, px);
}

const out = [
  ['public/icons/icon-192.png', 192, 0.72],
  ['public/icons/icon-512.png', 512, 0.72],
  ['public/icons/icon-512-maskable.png', 512, 0.58],
];
for (const [path, size, scale] of out) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, drawIcon(size, scale));
  console.log('icon:', path, `${size}x${size}`);
}
