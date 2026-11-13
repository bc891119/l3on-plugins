---
name: verifying-ui
description: 用專案鎖版的 Playwright 驗證網頁畫面：通過條件先定義、定位與等待寫法、桌機／手機截圖、版面與無障礙（axe，WCAG 2.2 AA）檢查、截圖逐張檢視。改了前端畫面要驗證、提交前做畫面驗收、設計方向稿要截圖時載入。
user-invocable: false
---

# Playwright 畫面驗證

呼叫方（專案流程或使用者）提供：測試網址、登入方式、要截的互動區塊、負向情境、額外檢查（離線、CSP 等）。沒給的先問。

## 先確認有裝，而且版本鎖定

依 lockfile 判斷套件管理工具（`pnpm-lock.yaml`／`package-lock.json`／`yarn.lock`／`bun.lock`），下面以 pnpm 為例，其他工具換成對應指令（`npm ls`、`npx`、`yarn`、`bunx`）。

在專案目錄跑 `pnpm ls --depth 0 @playwright/test`。只看 `playwright --version` 不夠：只裝了函式庫 `playwright` 也會印出版本，但沒有 `playwright test` 執行器、fixture 與 web-first assertion（[官方](https://playwright.dev/docs/library)）。

- **有**：用專案的設定與測試目錄。瀏覽器版本不符就跑 `pnpm exec playwright install chromium`，Linux 缺系統套件再加 `--with-deps`。
- **沒有**：停下來問使用者要不要裝，說明會動到 package.json 與 lockfile。用精確版本安裝：`pnpm add -D --save-exact @playwright/test@<版本>`，選發布滿兩週的版本；機器上已有下載好的瀏覽器時，優先選與它相符的版本（`node_modules/playwright-core/browsers.json` 的 revision 對照瀏覽器快取目錄）。
  - 前後台分開時裝在有 Node 的 repo，用 [projects](https://playwright.dev/docs/test-projects) 分別設 baseURL，一份設定就能測兩邊，也才寫得出跨前後台的流程。
  - 沒有任何 Node repo（例：只有 PHP 後台）時，在會部署的 repo 之外開獨立的測試套件，自帶 package.json。不要把 package.json 加進會部署的 repo：web root 常直接供應存在的靜態檔（例：Nginx `try_files $uri`），會露出相依套件清單。

為什麼要鎖精確版本：

1. 每版 Playwright 綁定特定瀏覽器版本，升級後要重跑 `playwright install`（[官方](https://playwright.dev/docs/browsers)）。版本浮動時不同人、不同時間會裝到不同版，瀏覽器對不上就跑不起來。
2. 截圖與版面檢查要可重現：同一份測試在每個人與 CI 上要用同一版瀏覽器引擎。
3. 供應鏈：剛發布的版本可能被撤回或遭植入，等兩週再採用。

所以不要從 npx 快取或其他專案的 node_modules 引用，也不要寫死 `executablePath`。

## 通過條件先定義

寫測試前先列每個情境的通過條件：URL、看得到的文字、API status、DB 或後台結果。沒有事先定義的條件不算驗證。

## 寫測試

用 `playwright test` 跑，不寫獨立腳本。設定範例：[examples/playwright.config.ts](examples/playwright.config.ts)。

- 長期有價值的放專案測試目錄；一次性的放不進版控的子目錄。截圖輸出用 `--output <暫存目錄>/<本次名稱>`：Playwright 開跑前會清空這個目錄，所以每次用各自的子目錄，不要指到放了其他東西的目錄。
- 登入用 setup project 存 storageState 重複使用，狀態檔不進版控（含 session cookie；[官方](https://playwright.dev/docs/auth)）；不同身分各存一份，跨系統流程開兩個 browser context。
- 定位用 getByRole / getByLabel / getByText，不用 CSS class；等待用 web-first assertion（`await expect(...).toBeVisible()`），不用固定 sleep（[官方](https://playwright.dev/docs/best-practices)）。
- 每個情境：桌機 1440 與手機 390 截整頁圖（fullPage），或逐一捲到每個互動區塊再截；只截首屏不算看過。改到版面時另跑 768。尺寸用兩個 project 的 `use.viewport` 設定，測試裡不寫尺寸迴圈（[官方](https://playwright.dev/docs/test-projects)）。外殼固定在視窗內、由內層面板捲動的版面，fullPage 只拍得到一個視窗，要先把視窗拉高再截（範例的 `screenshotAll`）。
- 收集 console error、failed request，記錄 /api status。
- trace 設 `retain-on-failure`，失敗時回報路徑（[官方](https://playwright.dev/docs/trace-viewer)）。trace 會留下填過的密碼，登入的 setup project 不錄。
- 流程不清楚時先用 `pnpm exec playwright cli --help` 列的指令探索，驗收依據仍是測試。

## 版面與無障礙檢查（測試內 assert）

版面四項是本 skill 自訂的輔助檢查，用來抓跑版；無障礙掃描照 Playwright 官方做法。

範例實作：[examples/fixtures.ts](examples/fixtures.ts)（`test.extend` 包成 fixture），複製到專案的測試目錄後依專案調整。

- 可見互動元素兩兩不重疊。要用 `checkVisibility()` 排除收合的 `<details>`，並扣掉祖先裁切的範圍，否則會大量誤報。
- 文字不溢出容器（scrollWidth ≤ clientWidth，刻意 truncate 的除外）。
- 中文按鈕與標籤不被擠成一字一行。
- 無橫向捲軸（documentElement.scrollWidth ≤ innerWidth）。
- 無障礙：裝 `@axe-core/playwright`（同樣鎖精確版本），標籤用 `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`。Playwright 官方範例只列到 2.1，要加 `wcag22aa` 才會掃 WCAG 2.2 的目標尺寸。既有違規用「規則 id＋selector」指紋清單排除，不快照整份結果（[官方](https://playwright.dev/docs/accessibility-testing)）。自動掃描只抓得到部分問題，不能取代人工看（W3C：沒有任何工具能單獨判定網站是否符合無障礙標準）；鍵盤操作、焦點順序、報讀軟體要另外人工檢查。
- 鍵盤流程可以寫成測試：`page.keyboard.press('Tab')` 逐步走主要流程，assert 焦點落在預期元素（`toBeFocused()`）且對話框關閉後焦點回到觸發按鈕。
- 頁面結構要防退步時，用 ARIA snapshot（`toMatchAriaSnapshot`）固定標題層級、地標與控制項名稱（[官方](https://playwright.dev/docs/aria-snapshots)）。

新寫的檢查要先用故意做壞的內容確認抓得到。

## 視覺回歸（選用）

已定案、不常改的頁面要防止樣式被意外改動時，用官方的 `await expect(page).toHaveScreenshot()`（[官方](https://playwright.dev/docs/test-snapshots)）：

- 第一次執行產生基準圖，要進版控並在 review 時看差異；刻意改版後用 `--update-snapshots` 更新。
- 基準圖依瀏覽器與作業系統分開，不同機器的字型與繪製會不同：比對要在產生基準圖的同一種環境跑（例如都在 CI 的同一個容器映像）。
- 會變動的內容（時間、輪播、隨機資料）用 `stylePath` 的 CSS 隱藏或 `mask` 遮住；截圖前把滑鼠移開避免 hover 樣式。
- 還在迭代的頁面不要加，基準圖會一直變；這時靠下面的人工檢視。

## 檢視截圖

- 逐張用 Read 開，描述看到什麼，對照專案設計規範（有 `DESIGN-SYSTEM.md` 就以它為準）指出版面、樣式或漏做的功能。
- 手機截圖必須逐張看，不可由桌機推論；不可只憑測試通過宣稱畫面正確。
- 每次修正後重跑檢查與截圖，不沿用修正前的圖。
