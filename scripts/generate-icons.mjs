// PWAアイコン(PNG)を追加の依存パッケージなしで生成するスクリプト。
// Node標準の zlib のみを使用し、シンプルな月モチーフのアイコンをその場で描画・PNGエンコードします。
// `npm run icons` で単独実行、または `npm run build` 実行時に自動で(prebuildとして)実行されます。
// デザインを変更したい場合は README.md の「デザイン変更方法」を参照し、このファイルの
// drawIcon() 内の色・円の座標を編集してください。

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const NAVY = [0x13, 0x21, 0x3e];
const WHITE = [0xee, 0xf6, 0xff];

function drawIcon(size, { maskable = false } = {}) {
  const buf = new Uint8Array(size * size * 4);
  const set = (x, y, [r, g, b], a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  };

  // 背景（ナビー）
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      set(x, y, NAVY);
    }
  }

  // 月（三日月）: maskableはセーフゾーン内に収まるよう中央寄せ・やや小さめに
  const cx = maskable ? size * 0.5 : size * 0.44;
  const cy = maskable ? size * 0.5 : size * 0.46;
  const r = maskable ? size * 0.26 : size * 0.27;
  const ex = cx + r * 0.55;
  const ey = cy - r * 0.35;
  const er = r * 0.92;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d1 = Math.hypot(x - cx, y - cy);
      const d2 = Math.hypot(x - ex, y - ey);
      if (d1 <= r && d2 > er) {
        set(x, y, WHITE);
      }
    }
  }

  // 星（小さな点）
  const stars = maskable
    ? []
    : [
        [size * 0.74, size * 0.24, size * 0.028],
        [size * 0.82, size * 0.4, size * 0.02],
        [size * 0.66, size * 0.16, size * 0.018],
      ];
  for (const [sx, sy, sr] of stars) {
    for (let y = Math.floor(sy - sr); y <= sy + sr; y++) {
      for (let x = Math.floor(sx - sr); x <= sx + sr; x++) {
        if (Math.hypot(x - sx, y - sy) <= sr) set(x, y, WHITE);
      }
    }
  }

  return buf;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type: None
    Buffer.from(rgba.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-maskable-192.png", size: 192, maskable: true },
  { name: "icon-maskable-512.png", size: 512, maskable: true },
  { name: "favicon-32.png", size: 32 },
];

for (const t of targets) {
  const rgba = drawIcon(t.size, { maskable: t.maskable });
  const png = encodePNG(t.size, t.size, rgba);
  writeFileSync(join(outDir, t.name), png);
  console.log(`generated: public/icons/${t.name}`);
}
