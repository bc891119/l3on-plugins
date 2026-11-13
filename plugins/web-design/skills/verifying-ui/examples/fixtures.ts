/**
 * 範例 fixture 與檢查工具：版面檢查、axe 掃描、console 與請求收集、整頁截圖。
 * 複製到專案的測試目錄（例 e2e/fixtures.ts），測試從這裡 import `test`、`expect`
 * （https://playwright.dev/docs/test-fixtures）。需要 @playwright/test 與 @axe-core/playwright。
 */

import AxeBuilder from '@axe-core/playwright'
import { test as base, expect, type Page, type TestInfo } from '@playwright/test'

/** 收集 console error、未捕捉的例外、失敗請求與 5xx。 */
export function watchPage(page: Page) {
  const problems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`)
  })
  page.on('pageerror', error => problems.push(`pageerror: ${error.message}`))
  page.on('requestfailed', (request) => {
    // 換頁時瀏覽器會取消進行中的請求，不算失敗
    if (request.failure()?.errorText !== 'net::ERR_ABORTED') problems.push(`failed: ${request.url()}`)
  })
  page.on('response', (response) => {
    if (response.status() >= 500) problems.push(`${response.status()}: ${response.url()}`)
  })
  return problems
}

/** 收集連到其他網域的請求（要能離線或不得依賴外部資源的專案用）。 */
export function externalRequests(page: Page, baseURL: string): string[] {
  const external: string[] = []
  const origin = new URL(baseURL).origin
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http') && url.origin !== origin) external.push(request.url())
  })
  return external
}

/** 橫向捲軸、文字溢出、中文被擠成一字一行、互動元素重疊。 */
export async function layoutProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const problems: string[] = []
    const label = (el: Element) => `<${el.tagName.toLowerCase()}> ${(el.textContent ?? '').trim().slice(0, 20)}`
    const visible = (el: Element) => {
      const box = el.getBoundingClientRect()
      // checkVisibility 才看得出收合的 <details>（內容仍有 box，只是 content-visibility: hidden）
      return box.width > 0 && box.height > 0 && el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
    }
    // 元素 box 扣掉被祖先裁切的部分（截斷的連結、捲動容器），只比實際畫出來的範圍
    const paintedBox = (el: Element) => {
      const box = el.getBoundingClientRect()
      let { left, top, right, bottom } = box
      for (let node = el.parentElement; node; node = node.parentElement) {
        if (getComputedStyle(node).overflowX === 'visible') continue
        const clip = node.getBoundingClientRect()
        left = Math.max(left, clip.left)
        top = Math.max(top, clip.top)
        right = Math.min(right, clip.right)
        bottom = Math.min(bottom, clip.bottom)
      }
      return { left, top, right, bottom }
    }

    type Box = ReturnType<typeof paintedBox>
    const isInsideField = (field: Element, fieldBox: Box, inner: Element, innerBox: Box) =>
      /^(INPUT|TEXTAREA|SELECT)$/.test(field.tagName) && inner.tagName === 'BUTTON'
      && innerBox.left >= fieldBox.left && innerBox.right <= fieldBox.right
      && innerBox.top >= fieldBox.top && innerBox.bottom <= fieldBox.bottom

    // 只量文字本身：外框寬度含內距，sr-only 的文字也不會真的畫出來折行
    const textLineCount = (el: Element) => {
      const tops = new Set<number>()
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const range = document.createRange()
        range.selectNodeContents(walker.currentNode)
        for (const rect of range.getClientRects()) tops.add(Math.round(rect.top))
      }
      return tops.size
    }

    if (document.documentElement.scrollWidth > innerWidth) {
      problems.push(`橫向捲軸：${document.documentElement.scrollWidth} > ${innerWidth}`)
    }

    // 外殼固定在視窗內、由面板捲動的版面，跑版時只有面板會變寬；寬表格、圖表與程式碼區塊本來就在自己的容器內捲動
    for (const el of document.querySelectorAll('body *')) {
      if (visible(el) && /(auto|scroll)/.test(getComputedStyle(el).overflowX) && el.scrollWidth > el.clientWidth + 1
        && !el.querySelector(':scope > table, :scope > pre, :scope > svg')) {
        problems.push(`內層橫向捲軸：<${el.tagName.toLowerCase()}> ${el.className} ${el.scrollWidth} > ${el.clientWidth}`)
      }
    }

    const controls = [...document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]')].filter(visible)
    for (const el of controls) {
      const style = getComputedStyle(el)
      if ((el.textContent ?? '').trim() && style.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
        problems.push(`文字溢出：${label(el)}`)
      }
      const text = (el.textContent ?? '').trim()
      if (/^[一-鿿]{2,}$/.test(text) && textLineCount(el) >= text.length) {
        problems.push(`一字一行：${label(el)}`)
      }
    }

    const hittable = controls
      .filter(el => getComputedStyle(el).pointerEvents !== 'none')
      .map(el => ({ el, box: paintedBox(el) }))
    for (const [index, { el: a, box: ra }] of hittable.entries()) {
      for (let next = index + 1; next < hittable.length; next++) {
        const { el: b, box: rb } = hittable[next]!
        if (a.contains(b) || b.contains(a)) continue
        // 輸入框內的按鈕（顯示密碼、清除）是刻意疊上去的
        if (isInsideField(a, ra, b, rb) || isInsideField(b, rb, a, ra)) continue
        const overlapX = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
        const overlapY = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
        if (overlapX > 1 && overlapY > 1) problems.push(`重疊：${label(a)} ／ ${label(b)}`)
      }
    }
    return problems
  })
}

/**
 * 掃 WCAG 2.2 A／AA，回傳「規則 id + selector 最後一段」：HTML 片段與前面的 nth-child 會隨資料與區塊順序改變，
 * 失敗訊息只留必要資訊。wcag22aa 要明列，否則不會掃 2.2 的目標尺寸（target-size）。
 * 既有違規要暫時排除時，傳入同格式的指紋清單，不要整條規則關掉。
 */
export async function a11yViolations(page: Page, known: string[] = []): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  return violations
    .flatMap(violation => violation.nodes.map(node => `${violation.id} ${node.target.join(' ').split(' > ').at(-1)}`))
    .filter(fingerprint => !known.includes(fingerprint))
}

/** 外殼固定在視窗內、由面板捲動時，fullPage 只拍得到一個視窗，所以先把視窗拉高到看得見被捲掉的內容再截。 */
async function screenshotAll(page: Page, path: string) {
  const viewport = page.viewportSize()!
  const hidden = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll('body *')].map(el => el.scrollHeight - el.clientHeight)))
  await page.setViewportSize({ width: viewport.width, height: viewport.height + hidden })
  await page.screenshot({ path, fullPage: true })
  await page.setViewportSize(viewport)
}

/** 截整頁圖，版面與無障礙問題記為 soft 失敗。 */
export async function checkPage(page: Page, testInfo: TestInfo, name: string) {
  await screenshotAll(page, testInfo.outputPath(`${name}.png`))
  expect.soft(await layoutProblems(page), `${name} 版面`).toEqual([])
  expect.soft(await a11yViolations(page), `${name} 無障礙`).toEqual([])
}

/**
 * 開啟頁面、確認真的到達（SPA 對任何路徑都回 200，也可能被導向其他頁）、沒有腳本錯誤，再做版面與無障礙檢查。
 * 腳本錯誤讓一塊畫面沒畫出來時，版面與 axe 都會少掃元素而回報通過，所以 problems 不為空就直接失敗、不往下掃。
 */
export async function visitAndCheck(page: Page, testInfo: TestInfo, path: string, name: string, problems: string[]) {
  const response = await page.goto(path, { waitUntil: 'networkidle' })
  expect.soft(response?.status(), `${path} 狀態碼`).toBeLessThan(400)
  expect(new URL(page.url()).pathname).toBe(path)
  expect(problems, `${path} console error、例外與失敗請求`).toEqual([])
  await checkPage(page, testInfo, name)
}

export type Device = 'desktop' | 'mobile'

/** 由 project 設定的選項（playwright.config.ts）。 */
export interface Options {
  /** 目前 project 的尺寸，截圖檔名與只在一種尺寸成立的斷言用。 */
  device: Device
}

interface Fixtures {
  /** page 的 console error、例外、失敗請求與 5xx（watchPage）。 */
  problems: string[]
  /** page 連到 baseURL 以外網域的請求。 */
  externalRequests: string[]
  /** 對指定頁面截圖並檢查版面與無障礙；截圖檔名自動加上 -desktop／-mobile。 */
  checkPage: (target: Page, name: string) => Promise<void>
  /** 用 page 開啟 path，先確認 problems 為空再檢查；截圖檔名同 checkPage。 */
  visitAndCheck: (path: string, name: string) => Promise<void>
}

export const test = base.extend<Options & Fixtures>({
  device: ['desktop', { option: true }],
  problems: async ({ page }, use) => {
    await use(watchPage(page))
  },
  externalRequests: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('externalRequests 要在有 baseURL 的 project 使用')
    await use(externalRequests(page, baseURL))
  },
  checkPage: async ({ device }, use, testInfo) => {
    await use((target, name) => checkPage(target, testInfo, `${name}-${device}`))
  },
  visitAndCheck: async ({ page, device, problems }, use, testInfo) => {
    await use((path, name) => visitAndCheck(page, testInfo, path, `${name}-${device}`, problems))
  },
})

export { expect }
export type { Locator, Page, Route, TestInfo } from '@playwright/test'
