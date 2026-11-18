#!/usr/bin/env node
/**
 * 方向稿與設計稿截圖：每個網址或本機 HTML 檔各截桌機與手機整頁圖。
 * 這是看設計用的輕量截圖；專案功能的畫面驗收仍照 verifying-ui skill 用專案自己的 Playwright 測試。
 *
 * 用法：
 *   node screenshot.mjs <輸出資料夾> <網址或 HTML 檔>... [--tablet] [--size <寬>x<高>]... [--dark] [--click <選擇器>]...
 * 例：
 *   node screenshot.mjs shots design-explore/a/index.html design-explore/b/index.html
 *   node screenshot.mjs shots http://localhost:3000/ --tablet
 *   node screenshot.mjs shots/history design-explore/a/index.html --click '#open-history'
 *
 * 輸出：<輸出資料夾>/<名稱>-desktop.png、-mobile.png（加 --tablet 多一張 -tablet.png）整頁圖，
 * 以及同名加 -fold 的第一屏圖（不捲動時看到的畫面；固定定位的元素在整頁圖上位置會失真，以第一屏圖為準），
 * --size：加截指定的視窗尺寸（例 --size 1920x1080，需求文件指定解析度時用），可重複；檔名用 <寬>x<高>。
 * --dark：模擬深色系統（prefers-color-scheme: dark）；不加時是淺色。頁面會跟著系統切換時兩種都要截。
 * --click：載入後先依序點這些元素再截（抽屜、選單、分頁打開後的畫面），頁面不必為了截圖加程式；每種狀態用各自的輸出資料夾。
 * 外殼固定在視窗內、由內層面板捲動的版面，整頁圖會先把視窗拉高到看得見被捲掉的內容再截。
 * 並列出每張圖第一屏的可操作元素數、是否有橫向捲軸，以及 console 錯誤與未捕捉例外的內容。
 *
 * 結束碼：0 成功、1 有頁面出現腳本錯誤（console error 或未捕捉例外；圖片、字型等資源載入失敗也會產生 console error）、2 用法或環境錯誤、3 有頁面開不起來。
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { launchChromium, takeClicks, clickAll } from './browser.mjs'

// 與 verifying-ui 相同的尺寸：桌機 1440、手機 390；平板 768 在改到版面時加看
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 }, tablet: { width: 768, height: 1024 } }

const USAGE = '用法：node screenshot.mjs <輸出資料夾> <網址或 HTML 檔>... [--tablet] [--size <寬>x<高>]... [--dark] [--click <選擇器>]...'
const { rest: allArgs, clicks } = takeClicks(process.argv.slice(2))
const args = []
for (let i = 0; i < allArgs.length; i++) {
  if (allArgs[i] !== '--size') { args.push(allArgs[i]); continue }
  const size = /^([1-9]\d*)x([1-9]\d*)$/.exec(allArgs[++i] ?? '')
  if (!size) { console.error(`--size 要寫成 <寬>x<高>（大於 0 的整數），例 --size 1920x1080\n${USAGE}`); process.exit(2) }
  VIEWPORTS[size[0]] = { width: Number(size[1]), height: Number(size[2]) }
}
const withTablet = args.includes('--tablet')
const colorScheme = args.includes('--dark') ? 'dark' : 'light'
const [outDir, ...targets] = args.filter(a => a !== '--tablet' && a !== '--dark')
if (!outDir || targets.length === 0) {
  console.error(USAGE)
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
let scriptErrors = 0

// 第一屏（不捲動）看得到的可操作元素數，供方向稿之間與原型比較
const countFirstScreenControls = () => {
  const selector = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"], [role="menuitem"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [tabindex]:not([tabindex="-1"])'
  return [...document.querySelectorAll(selector)].filter((el) => {
    if (el.disabled || !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false
    const box = el.getBoundingClientRect()
    return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth
  }).length
}

for (const { target, url, name } of pages) {
  for (const [device, viewport] of sizes) {
    const context = await browser.newContext({ viewport, locale: 'zh-TW', colorScheme })
    const page = await context.newPage()
    const errors = []
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`) })
    page.on('pageerror', (error) => { errors.push(`例外: ${error.message}`) })
    const file = path.join(outDir, `${name}-${device}.png`)
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
      if (response && response.status() >= 400) throw new Error(`HTTP ${response.status()}`)
      await page.evaluate(() => document.fonts.ready) // 字型載入後再截，避免截到備援字型
      await clickAll(page, clicks)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      const controls = await page.evaluate(countFirstScreenControls)
      await page.screenshot({ path: file.replace(/\.png$/, '-fold.png') })
      // 內層面板捲動的版面，fullPage 只拍得到一個視窗：把視窗拉高到最長的那個面板看得完
      const hidden = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll('body *')].map((el) => {
        if (!/auto|scroll/.test(getComputedStyle(el).overflowY) || !el.checkVisibility()) return 0
        const box = el.getBoundingClientRect()
        return box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth ? el.scrollHeight - el.clientHeight : 0
      })))
      if (hidden > 0) await page.setViewportSize({ width: viewport.width, height: viewport.height + hidden })
      await page.screenshot({ path: file, fullPage: true })
      console.log(`${file}  第一屏可操作元素 ${controls}  ${overflow > 0 ? `橫向捲軸（多 ${overflow}px）` : '無橫向捲軸'}  腳本錯誤 ${errors.length}`)
      for (const error of errors.slice(0, 5)) console.error(`  ${error.slice(0, 300)}`)
      if (errors.length > 5) console.error(`  …另有 ${errors.length - 5} 則`)
      scriptErrors += errors.length
    } catch (error) {
      broken++
      console.error(`${target}（${device}）截圖失敗：${String(error).slice(0, 200)}`)
    }
    await context.close()
  }
}
await browser.close()
if (broken) process.exit(3)
if (scriptErrors) {
  console.error(`共有 ${scriptErrors} 則腳本錯誤，修正後再檢視截圖與執行無障礙掃描。`)
  process.exit(1)
}
process.exit(0)
