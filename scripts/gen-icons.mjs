import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SRC = "public/images/brand/logo.png";

// Pad the (near-square, transparent) logo onto a true square canvas with a
// small margin so it isn't cropped when browsers render it in a circle/rounded
// square favicon slot.
async function squarePadded(size, marginRatio = 0.12) {
  const inner = Math.round(size * (1 - marginRatio * 2));
  const resized = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toBuffer();
}

// ---- ICO container (PNG-compressed entries — valid since Windows Vista) ----
function buildIco(entries) {
  const count = entries.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const dirEntries = [];
  const imageBuffers = [];

  for (const { size, buffer } of entries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    dir.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
    dir.writeUInt8(0, 2); // color palette
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // color planes
    dir.writeUInt16LE(32, 6); // bits per pixel
    dir.writeUInt32LE(buffer.length, 8); // image data size
    dir.writeUInt32LE(offset, 12); // image data offset
    dirEntries.push(dir);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(count, 4); // image count

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

const [png16, png32, png48, iconPng, appleIconPng] = await Promise.all([
  squarePadded(16),
  squarePadded(32),
  squarePadded(48),
  squarePadded(512, 0.14),
  sharp(SRC)
    .resize(140, 140, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
    .then((resized) =>
      sharp({
        create: { width: 180, height: 180, channels: 4, background: "#f7f6f2" },
      })
        .composite([{ input: resized, gravity: "center" }])
        .png()
        .toBuffer(),
    ),
]);

const ico = buildIco([
  { size: 16, buffer: png16 },
  { size: 32, buffer: png32 },
  { size: 48, buffer: png48 },
]);

writeFileSync("app/favicon.ico", ico);
writeFileSync("app/icon.png", iconPng);
writeFileSync("app/apple-icon.png", appleIconPng);

console.log(
  "Wrote app/favicon.ico (",
  ico.length,
  "bytes ) app/icon.png (",
  iconPng.length,
  ") app/apple-icon.png (",
  appleIconPng.length,
  ")",
);
