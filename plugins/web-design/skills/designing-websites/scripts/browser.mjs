/**
 * 內附腳本共用：載入外掛自帶的 Playwright 並啟動 Chromium。
 * 套件由外掛根目錄的 package.json／package-lock.json 鎖版，安裝外掛時 Claude Code 會自動裝好；
 * 從本機路徑載入外掛（開發中）時要自己在外掛根目錄跑一次 npm ci --ignore-scripts。
 * 瀏覽器本體不隨套件安裝，第一次使用要下載一次（約 150MB）。
 */
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// scripts → designing-websites → skills → 外掛根目錄
export const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

/** 取出 --click <選擇器>（可重複），回傳其餘參數與選擇器清單。 */
export function takeClicks(args) {
  const rest = []
  const clicks = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== '--click') { rest.push(args[i]); continue }
    if (!args[i + 1]) { console.error('--click 後面要接 CSS 選擇器'); process.exit(2) }
    clicks.push(args[++i])
  }
  return { rest, clicks }
}

/** 依序點擊；找不到元素會丟錯，由呼叫端記成失敗。 */
export async function clickAll(page, clicks) {
  for (const selector of clicks) await page.locator(selector).first().click({ timeout: 5_000 })
}

export async function launchChromium() {
  let chromium
  try {
    ({ chromium } = createRequire(path.join(PLUGIN_ROOT, 'package.json'))('playwright'))
  } catch {
    console.error(`外掛的 Playwright 套件還沒安裝。在外掛根目錄執行一次：\n  cd "${PLUGIN_ROOT}" && npm ci --ignore-scripts`)
    process.exit(2)
  }
  try {
    return await chromium.launch()
  } catch (error) {
    const message = String(error)
    if (/Executable doesn't exist|playwright install/.test(message)) {
      console.error(`這一版 Playwright 對應的 Chromium 還沒下載。執行一次（約 150MB，下載到使用者的瀏覽器快取）：\n  cd "${PLUGIN_ROOT}" && npx playwright install chromium\nLinux 若提示缺系統函式庫，改用 npx playwright install --with-deps chromium（需要 sudo）。`)
    } else {
      console.error(`Chromium 啟動失敗：${message.slice(0, 400)}`)
    }
    process.exit(2)
  }
}
