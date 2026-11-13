#!/usr/bin/env node
/**
 * 查經濟部智慧財產局商標檢索系統（文字近似／以圖找圖），輸出結果摘要與截圖。
 *
 * 用法（使用外掛自帶的 Playwright，任何目錄都能執行）：
 *   node tipo_search.mjs text "山嵐" <輸出資料夾> [--class 030,043]
 *   node tipo_search.mjs image logo.png <輸出資料夾> [--class 030,043]
 *
 * 輸出：<輸出資料夾>/result.json（總筆數、各類別筆數、指定類別內最相近的前 100 筆案件明細）與 result.png。
 * 結束碼：0 查詢成功（含查無結果）；2 用法或環境錯誤；3 查詢失敗（網路或系統異常，不可當成「查無」）。
 * 系統公告的維護時段會暫停以圖找圖；失敗時訊息會附上頁面公告文字。
 */
import fs from 'node:fs'
import path from 'node:path'
import { launchChromium } from './browser.mjs'

const SITE = 'https://cloud.tipo.gov.tw/S282/S282WV1/'
// 查詢通常 5～30 秒；以圖找圖較慢，給到 120 秒
const QUERY_TIMEOUT_MS = 120_000
const MAX_CASES = 100 // 系統一頁回傳的筆數上限，足夠人工檢視最相近的案件

const fail = (code, message) => { console.error(message); process.exit(code) }

const [mode, input, outDir, ...rest] = process.argv.slice(2)
if (!['text', 'image'].includes(mode) || !input || !outDir) {
  fail(2, '用法：node tipo_search.mjs text "<商標文字>" <輸出資料夾> [--class 030,043]\n      node tipo_search.mjs image <logo.png> <輸出資料夾> [--class 030,043]')
}
const classIndex = rest.indexOf('--class')
const classes = classIndex >= 0 ? (rest[classIndex + 1] ?? '').split(',').map(s => s.trim().padStart(3, '0')).filter(Boolean) : []
if (mode === 'image' && !fs.existsSync(input)) fail(2, `找不到圖檔：${input}`)

fs.mkdirSync(outDir, { recursive: true })
const browser = await launchChromium()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'zh-TW' })

let search = null // 搜尋 API 的回應（docs＝全部命中的案件識別碼）
let failed = null
page.on('response', async (response) => {
  const url = response.url()
  if (/\/api\/search\/(wordSearch|similarImg)/.test(url)) {
    if (response.ok()) search = await response.json().catch(() => null)
    else failed = `搜尋 API 回應 ${response.status()}`
  }
})
page.on('requestfailed', (request) => {
  if (/\/api\/search\//.test(request.url())) failed = `搜尋請求失敗：${request.failure()?.errorText}`
})

let bulletin = ''
try {
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 60_000 })
  // 進站會跳公告視窗（維護時段等），先記下內容再關掉
  const close = page.getByRole('button', { name: '關閉' })
  if (await close.isVisible().catch(() => false)) {
    bulletin = (await page.getByText('公告').locator('..').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300)
    await close.click()
  }
  if (mode === 'text') {
    await page.getByPlaceholder('輸入商標文字').fill(input)
  } else {
    await page.getByRole('button', { name: /以圖找圖/ }).click()
    await page.locator('input[type=file]').first().setInputFiles(input)
    await page.getByRole('button', { name: '換圖' }).waitFor({ timeout: 30_000 }) // 圖片上傳並標準化完成才會出現
  }
  await page.getByRole('button', { name: '搜尋', exact: true }).click()
  const deadline = Date.now() + QUERY_TIMEOUT_MS
  while (!search && !failed && Date.now() < deadline) await page.waitForTimeout(500)
  if (!search && !failed) failed = `等待 ${QUERY_TIMEOUT_MS / 1000} 秒仍無回應`
  await page.getByText('查詢中').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {})
  await page.getByRole('button', { name: '關閉' }).click({ timeout: 1000 }).catch(() => {})
  await page.screenshot({ path: path.join(outDir, 'result.png'), fullPage: true })
} catch (error) {
  failed = failed ?? String(error).slice(0, 300)
}

if (failed) {
  await browser.close()
  fail(3, `查詢失敗（不可視為查無近似）：${failed}${bulletin ? `\n系統公告：${bulletin}` : ''}`)
}

const docs = search.docs ?? []
// feature_a 內 B 開頭是商品服務類別（B030＝第 30 類）
const inClass = doc => classes.length === 0 || classes.some(c => (doc.feature_a ?? []).includes(`B${c}`))
const hits = docs.filter(inClass)
const byClass = {}
for (const doc of docs) for (const f of doc.feature_a ?? []) if (/^B\d{3}$/.test(f)) byClass[f.slice(1)] = (byClass[f.slice(1)] ?? 0) + 1

// 明細 API 一次收 20 筆案件識別碼；結果依相近程度排序，取指定類別內最前面的 MAX_CASES 筆
const PAGE_SIZE = 20
const cases = []
let detailError = null
for (let start = 0; start < Math.min(hits.length, MAX_CASES); start += PAGE_SIZE) {
  const ids = hits.slice(start, start + PAGE_SIZE).map(d => d.docid)
  const rows = await page.evaluate(async (docs) => {
    const response = await fetch('/S282/S282BV1/api/result/list', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ docs }),
    })
    return response.ok ? response.json() : { error: response.status }
  }, ids).catch(error => ({ error: String(error).slice(0, 100) }))
  if (!Array.isArray(rows)) { detailError = `明細第 ${start + 1} 筆起取得失敗：${rows.error}`; break }
  for (const c of rows) {
    cases.push({
      name: c.tmark_name, applNo: c.appl_no, status: c.item_name, valid: c.idxvalid ?? null,
      applDate: (c.appl_date ?? '').slice(0, 10), type: c.tmark_class_text ?? null, classes: c.goods_class_text ?? null, applicant: c.name_c_text ?? null,
    })
  }
}
await browser.close()

const result = {
  mode, query: mode === 'text' ? input : path.basename(input), classes,
  searchedAt: new Date().toISOString(), source: SITE,
  total: docs.length, totalInClasses: hits.length, byClass,
  casesListed: cases.length, detailError, cases,
  note: '系統查詢結果僅供參考，不得作為申請准駁或侵權與否之依據（智慧局網站聲明）。',
}
fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(result, null, 2))
console.log(`查詢成功：共 ${docs.length} 筆${classes.length ? `，指定類別 ${classes.join('、')} 內 ${hits.length} 筆` : ''}；明細 ${cases.length} 筆`)
console.log(`結果：${path.join(outDir, 'result.json')}、${path.join(outDir, 'result.png')}`)
