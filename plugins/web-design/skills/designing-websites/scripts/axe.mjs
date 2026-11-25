#!/usr/bin/env node
/**
 * 無障礙掃描：每個網址或本機 HTML 檔在桌機與手機尺寸各跑一次 axe-core（WCAG 2.0／2.1／2.2 的 A 與 AA）。
 * 給沒有 Node 專案的靜態頁與方向稿用；有 Node 的專案照 verifying-ui skill 寫進專案自己的 Playwright 測試。
 *
 * 用法：
 *   node axe.mjs <網址或 HTML 檔>... [--open-details] [--dark] [--click <選擇器>]...
 * 例：
 *   node axe.mjs final/index.html final/meeting.html
 *   node axe.mjs http://localhost:3000/ --open-details
 *
 * 掃描的是頁面載入後的狀態：關著的抽屜、對話框、選單不在範圍內，要掃就加 --click 先點開（依序點，每種狀態跑一次）。
 * --open-details：掃描前先展開所有 <details>。
 * --dark：模擬深色系統（prefers-color-scheme: dark）；不加時是淺色。
 *
 * 頁面有腳本錯誤（console error 或未捕捉例外；圖片、字型等資源載入失敗也會產生 console error）時不掃描，直接算失敗；
 * 載入後查一次，--click／--open-details 做完再查一次：
 * axe 只檢查畫面上有的元素，沒畫出來的部分不會產生違規。
 *
 * 結束碼：0 沒有違規、1 有違規或有頁面出現腳本錯誤、2 用法或環境錯誤、3 有頁面開不起來。
 * 自動掃描只涵蓋一部分準則，通過不代表符合 WCAG；人工項目見 reference/accessibility.md。
 */
import { createRequire } from 'node:module'
import path from 'node:path'
import { launchChromium, takeClicks, clickAll, toUrl, collectErrors, printErrors, NAV_TIMEOUT, VIEWPORTS, PLUGIN_ROOT } from './browser.mjs'

// wcag22aa 要明列，否則不會檢查 WCAG 2.2 的目標尺寸
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const { rest: args, clicks } = takeClicks(process.argv.slice(2))
const openDetails = args.includes('--open-details')
const colorScheme = args.includes('--dark') ? 'dark' : 'light'
const targets = [...new Set(args.filter(a => a !== '--open-details' && a !== '--dark'))]
if (targets.length === 0) {
  console.error('用法：node axe.mjs <網址或 HTML 檔>... [--open-details] [--dark] [--click <選擇器>]...')
  process.exit(2)
}

let axePath
try {
  axePath = createRequire(path.join(PLUGIN_ROOT, 'package.json')).resolve('axe-core/axe.min.js')
} catch {
  console.error(`外掛的 axe-core 套件還沒安裝。在外掛根目錄執行一次：\n  cd "${PLUGIN_ROOT}" && npm ci --ignore-scripts`)
  process.exit(2)
}

const pages = targets.map(target => ({ target, url: toUrl(target) }))

const browser = await launchChromium()
// 平板與 --size 是截圖用的；掃描只跑桌機與手機
const sizes = [['desktop', VIEWPORTS.desktop], ['mobile', VIEWPORTS.mobile]]
let broken = 0
let failed = 0

for (const { target, url } of pages) {
  for (const [device, viewport] of sizes) {
    // bypassCSP：頁面的 CSP 不允許注入腳本時仍能載入 axe
    const context = await browser.newContext({ viewport, locale: 'zh-TW', colorScheme, bypassCSP: true })
    const page = await context.newPage()
    const errors = collectErrors(page)
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT })
      if (response && response.status() >= 400) throw new Error(`HTTP ${response.status()}`)
      await page.evaluate(() => document.fonts.ready)
      // 載入後查一次；點開抽屜、展開 details 之後再查一次：點擊才觸發的錯誤也會讓浮層沒畫出來
      let stage = '腳本錯誤'
      if (!errors.length) {
        await clickAll(page, clicks)
        if (openDetails) {
          // toggle 事件在展開之後才觸發：等兩個畫面更新，它的錯誤才收得到
          await page.evaluate(async () => {
            for (const el of document.querySelectorAll('details')) el.open = true
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
          })
        }
        stage = '點開後腳本錯誤'
      }
      if (errors.length) {
        failed++
        console.log(`${target}（${device}）  ${stage} ${errors.length}，未掃描`)
        printErrors(errors)
      } else {
        await page.addScriptTag({ path: axePath })
        const result = await page.evaluate(tags => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS)
        const nodes = result.violations.reduce((sum, violation) => sum + violation.nodes.length, 0)
        console.log(`${target}（${device}）  違規 ${result.violations.length} 類 ${nodes} 處  需人工判斷 ${result.incomplete.length} 類  已檢查通過 ${result.passes.length} 類`)
        for (const violation of result.violations) {
          console.log(`  ${violation.id}（${violation.impact}）：${violation.help}`)
          for (const node of violation.nodes.slice(0, 5)) console.log(`    ${node.target.join(' ')}`)
          if (violation.nodes.length > 5) console.log(`    …另有 ${violation.nodes.length - 5} 處`)
        }
        for (const item of result.incomplete) console.log(`  需人工判斷 ${item.id}：${item.nodes.length} 處`)
        if (result.violations.length) failed++
      }
    } catch (error) {
      broken++
      console.error(`${target}（${device}）掃描失敗：${String(error).slice(0, 200)}`)
    }
    await context.close()
  }
}
await browser.close()
if (broken) process.exit(3)
process.exit(failed ? 1 : 0)
