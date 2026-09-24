// Công cụ chụp toàn bộ giao diện để gửi feedback (không phải một phần của app).
// Cách dùng: npm run shots -- <nhan>        (vd. v27)
//            BASE_URL=https://…vercel.app/ npm run shots -- <nhan>
// Không có BASE_URL: tự chạy npm run build rồi vite preview ở cổng 4173.
// Kết quả: docs/shots/<nhan>/png/*.png, bao-cao.json, contact-sheet.pdf.
import { chromium } from 'playwright'
import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import CANH from './shots.scenes.js'

const W = 1366
const H = 768
const DOAN = 1100 // chiều cao mỗi đoạn ảnh trong PDF
const PDF_MAX = 25 * 1024 * 1024

const nhan = process.argv[2]
if (!nhan || !/^[\w.-]+$/.test(nhan)) {
  console.error('Cách dùng: npm run shots -- <nhan>   (vd. v27)')
  process.exit(1)
}
const OUT = path.join('docs', 'shots', nhan)
const PNG = path.join(OUT, 'png')
await fs.mkdir(PNG, { recursive: true })

let base = process.env.BASE_URL
let server
if (!base) {
  execSync('npm run build', { stdio: 'inherit' })
  // Gọi thẳng vite bằng node (không qua shell) để kill() tắt được cả trên Windows
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore' })
  base = 'http://localhost:4173/'
  await choServer(base)
}
base = base.split('#')[0]

let browser
const baoCao = []
try {
  browser = await chromium.launch()
  for (const canh of CANH) {
    baoCao.push(await chupCanh(canh))
    const r = baoCao.at(-1)
    console.log(`${r.id}  ${r.loi.length ? '✗' : '✓'}  ${r.tieuDe}${r.loi.length ? ` — ${r.loi[0]}` : ''}`)
  }
  await fs.writeFile(path.join(OUT, 'bao-cao.json'), JSON.stringify({ base, ngay: new Date().toISOString(), canh: baoCao }, null, 2))
  await taoContactSheet()
} finally {
  await browser?.close()
  server?.kill()
}
const hong = baoCao.filter((r) => r.loi.length)
console.log(`\nXong ${baoCao.length} cảnh, ${hong.length} cảnh có lỗi. Xem ${path.join(OUT, 'bao-cao.json')}`)

// ─── Một cảnh ────────────────────────────────────────────────────────────────
async function chupCanh(canh) {
  const context = await browser.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const console_ = []
  page.on('console', (m) => m.type() === 'error' && console_.push(m.text()))
  page.on('pageerror', (e) => console_.push(String(e)))
  const loi = []
  const files = []
  try {
    // Trạng thái sạch: xóa localStorage + tải lại
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    for (const [i, buoc] of canh.buoc.entries()) {
      try {
        await lamBuoc(page, buoc)
      } catch (e) {
        loi.push(`Bước ${i + 1} ${JSON.stringify(buoc)}: ${e.message.split('\n')[0]}`)
        break // các bước sau phụ thuộc bước này — chụp hiện trạng
      }
    }
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)
    if (!(await page.evaluate(() => document.body.innerText.trim()))) loi.push('Trang trắng')

    const f1366 = `${canh.id}-1366.png`
    const cao = await nhoiKhungNhin(page)
    await vachGap(page, true)
    await page.screenshot({ path: path.join(PNG, f1366), fullPage: true })
    await vachGap(page, false)
    files.push(f1366)

    if (canh.man1920) {
      const f1920 = `${canh.id}-1920.png`
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.waitForTimeout(300)
      await page.screenshot({ path: path.join(PNG, f1920) })
      files.push(f1920)
    }
    return { id: canh.id, tieuDe: canh.tieuDe, ghiChu: canh.ghiChu ?? '', files, cao1366: cao, loi, console: console_ }
  } catch (e) {
    loi.push(`Lỗi chụp: ${e.message.split('\n')[0]}`)
    return { id: canh.id, tieuDe: canh.tieuDe, ghiChu: canh.ghiChu ?? '', files, loi, console: console_ }
  } finally {
    await context.close()
  }
}

async function lamBuoc(page, b) {
  if (b.goto) await page.evaluate((h) => (window.location.hash = h), b.goto)
  else if (b.press) {
    // Bỏ focus khỏi nút: Space trên nút là bấm nút, không phải phím tắt Tua
    await page.evaluate(() => document.activeElement?.blur())
    await page.keyboard.press(b.press)
  } else if (b.click) await (await timPhanTu(page, b)).click()
  else if (b.wait) await page.waitForTimeout(b.wait)
  else throw new Error('Bước không hợp lệ')
  await page.waitForTimeout(150)
}

// Theo tên (khớp đúng trước, rồi khớp một phần), chỉ phần tử đang hiện; chờ tối đa 5 giây
async function timPhanTu(page, { click: ten, role, css }) {
  const roles = role ? [role] : ['button', 'link', 'checkbox', 'switch']
  const cachTim = css
    ? [page.locator(ten)]
    : [true, false].flatMap((exact) => roles.map((r) => page.getByRole(r, { name: ten, exact })))
  const het = Date.now() + 5000
  do {
    for (const loc of cachTim) {
      const hien = loc.filter({ visible: true })
      if (await hien.count()) return hien.first()
    }
    await page.waitForTimeout(200)
  } while (Date.now() < het)
  throw new Error(`Không tìm thấy phần tử "${ten}"`)
}

// App cao đúng một màn (h-screen) và cuộn bên trong. Để ảnh fullPage có cả phần dưới màn đầu,
// nới chiều cao khung nhìn cho tới khi không vùng nào còn phải cuộn. Có lớp phủ (hộp thoại,
// ngăn kéo) thì giữ 1366×768 — lớp phủ căn theo khung nhìn, nới ra sẽ sai vị trí.
async function nhoiKhungNhin(page) {
  let cao = H
  const coLopPhu = await page.evaluate(
    () =>
      Boolean(document.querySelector('dialog[open]')) ||
      [...document.querySelectorAll('body *')].some((el) => {
        if (getComputedStyle(el).position !== 'fixed') return false
        const r = el.getBoundingClientRect()
        return r.width >= innerWidth && r.height >= innerHeight
      })
  )
  if (coLopPhu) return cao
  for (let i = 0; i < 4; i++) {
    const du = await page.evaluate(() =>
      Math.max(
        document.documentElement.scrollHeight - innerHeight,
        ...[...document.querySelectorAll('body *')].map((el) =>
          /(auto|scroll)/.test(getComputedStyle(el).overflowY) ? el.scrollHeight - el.clientHeight : 0
        )
      )
    )
    if (du <= 0) break
    cao += du
    await page.setViewportSize({ width: W, height: cao })
    await page.waitForTimeout(150)
  }
  return cao
}

// Vạch đứt đỏ tại y = 768 — chèn bằng CSS lúc chụp, không sửa code app
async function vachGap(page, bat) {
  await page.evaluate(
    ({ bat, y }) => {
      document.getElementById('__vach-gap')?.remove()
      if (!bat) return
      const d = document.createElement('div')
      d.id = '__vach-gap'
      d.textContent = 'Hết màn hình đầu (1366×768)'
      d.style.cssText = `position:absolute;left:0;right:0;top:${y}px;border-top:3px dashed #e00;z-index:2147483647;pointer-events:none;font:bold 14px sans-serif;color:#e00;text-align:right;padding-right:8px;background:transparent`
      document.body.appendChild(d)
    },
    { bat, y: H }
  )
}

async function choServer(url) {
  const het = Date.now() + 30000
  while (Date.now() < het) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // chưa lên
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`vite preview không chạy ở ${url}`)
}

// ─── contact-sheet.pdf ───────────────────────────────────────────────────────
// Mỗi trang PDF một ảnh (co về rộng 1366); ảnh cao hơn 1100px cắt thành các đoạn liên tiếp.
// Cắt + nén JPEG bằng canvas trong Chromium (không thêm thư viện ảnh).
async function taoContactSheet() {
  for (const q of [0.8, 0.65, 0.5]) {
    const page = await browser.newPage()
    const trang = []
    for (const r of baoCao) {
      for (const f of r.files) {
        const png = (await fs.readFile(path.join(PNG, f))).toString('base64')
        const doan = await page.evaluate(
          async ({ png, w, doan, q }) => {
            const img = new Image()
            img.src = `data:image/png;base64,${png}`
            await img.decode()
            const scale = w / img.width
            const cao = Math.round(img.height * scale)
            const out = []
            for (let y = 0; y < cao; y += doan) {
              const c = document.createElement('canvas')
              c.width = w
              c.height = Math.min(doan, cao - y)
              c.getContext('2d').drawImage(img, 0, -y, w, cao)
              out.push(c.toDataURL('image/jpeg', q))
            }
            return out
          },
          { png, w: W, doan: DOAN, q }
        )
        doan.forEach((src, i) => {
          const phan = doan.length > 1 ? ` — phần ${i + 1}/${doan.length}` : ''
          trang.push(`<section><h1>${r.id} · ${esc(r.tieuDe)} <small>${f}${phan}</small></h1><img src="${src}"></section>`)
        })
      }
    }
    await page.setContent(
      `<!doctype html><meta charset="utf-8"><style>
        @page { size: ${W + 40}px ${DOAN + 90}px; margin: 0 }
        body { margin: 0; font-family: sans-serif }
        section { padding: 20px; page-break-after: always; break-after: page }
        h1 { font-size: 22px; margin: 0 0 12px } small { font-weight: normal; color: #555 }
        img { display: block; width: ${W}px; outline: 1px solid #ccc }
      </style>${trang.join('')}`
    )
    const file = path.join(OUT, 'contact-sheet.pdf')
    await page.pdf({ path: file, width: `${W + 40}px`, height: `${DOAN + 90}px`, printBackground: true })
    await page.close()
    const size = (await fs.stat(file)).size
    console.log(`contact-sheet.pdf: ${trang.length} trang, ${(size / 1048576).toFixed(1)} MB (JPEG q=${q})`)
    if (size < PDF_MAX) return
  }
  console.warn('contact-sheet.pdf vẫn trên 25MB ở chất lượng thấp nhất')
}

function esc(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}
