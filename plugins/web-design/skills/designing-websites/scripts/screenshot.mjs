#!/usr/bin/env node
/**
 * 方向稿與設計稿截圖：每個網址或本機 HTML 檔各截桌機與手機整頁圖。
 * 這是看設計用的輕量截圖；專案功能的畫面驗收仍照 verifying-ui skill 用專案自己的 Playwright 測試。
 *
 * 用法：
 *   node screenshot.mjs <輸出資料夾> <網址或 HTML 檔>... [--tablet]
 * 例：
 *   node screenshot.mjs shots design-explore/a/index.html design-explore/b/index.html
 *   node screenshot.mjs shots http://localhost:3000/ --tablet
 *
 * 輸出：<輸出資料夾>/<名稱>-desktop.png、-mobile.png（加 --tablet 多一張 -tablet.png），
 * 並列出每張圖的 console 錯誤數與是否有橫向捲軸。結束碼 0 成功、2 用法或環境錯誤、3 有頁面開不起來。
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { launchChromium } from './browser.mjs'

// 與 verifying-ui 相同的尺寸：桌機 1440、手機 390；平板 768 在改到版面時加看
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 }, tablet: { width: 768, height: 1024 } }

const args = process.argv.slice(2)
const withTablet = args.includes('--tablet')
const [outDir, ...targets] = args.filter(a => a !== '--tablet')
if (!outDir || targets.length === 0) {
  console.error('用法：node screenshot.mjs <輸出資料夾> <網址或 HTML 檔>... [--tablet]')
  process.exit(2)
}

const toUrl = (target) => {
  if (/^https?:\/\//.test(target)) return target
  if (!fs.existsSync(target)) { console.error(`找不到檔案：${target}`); process.exit(2) }
  return pathToFileURL(path.resolve(target)).href
}
// 檔名取路徑最後幾段；多個方向都叫 index.html 時逐步多取一段，直到彼此不重複
const segments = target => target.replace(/^https?:\/\//, '').replace(/\.html?$/, '').split(/[\/\\]+/).filter(Boolean)
const nameWith = (target, depth) => segments(target).slice(-depth).join('-').replace(/[^\w.\-一-鿿]+/g, '_') || 'page'
let depth = 1
const maxDepth = Math.max(...targets.map(target => segments(target).length))
while (depth < maxDepth && new Set(targets.map(target => nameWith(target, depth))).size < new Set(targets).size) depth++

const pages = [...new Set(targets)].map(target => ({ target, url: toUrl(target), name: nameWith(target, depth) }))
fs.mkdirSync(outDir, { recursive: true })
const browser = await launchChromium()
const sizes = Object.entries(VIEWPORTS).filter(([device]) => device !== 'tablet' || withTablet)
let broken = 0

for (const { target, url, name } of pages) {
  for (const [device, viewport] of sizes) {
    const context = await browser.newContext({ viewport, locale: 'zh-TW' })
    const page = await context.newPage()
    let errors = 0
    page.on('console', (message) => { if (message.type() === 'error') errors++ })
    page.on('pageerror', () => { errors++ })
    const file = path.join(outDir, `${name}-${device}.png`)
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
      if (response && response.status() >= 400) throw new Error(`HTTP ${response.status()}`)
      await page.evaluate(() => document.fonts.ready) // 字型載入後再截，避免截到備援字型
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      await page.screenshot({ path: file, fullPage: true })
      console.log(`${file}  console 錯誤 ${errors}  ${overflow > 0 ? `橫向捲軸（多 ${overflow}px）` : '無橫向捲軸'}`)
    } catch (error) {
      broken++
      console.error(`${target}（${device}）截圖失敗：${String(error).slice(0, 200)}`)
    }
    await context.close()
  }
}
await browser.close()
process.exit(broken ? 3 : 0)
