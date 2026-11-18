# Changelog

本檔格式依 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/)，版本號依 [Semantic Versioning](https://semver.org/lang/zh-TW/)。
各外掛獨立編號，git tag 為 `<外掛名>--v<版本>`。

## web-design 2.0.0 - 2026-11-18

### Removed

- 商標檢索：刪除 `tipo_search.mjs` 與 `logo.md` 的〈商標檢索〉一節，logo 流程從 6 步變 5 步。名稱多半由使用者自己決定，查到相近的也很少改；腳本操作的是外部網站的畫面，對方改版就壞。**破壞性變更**：呼叫 `tipo_search.mjs` 的流程要改成自行到智慧財產局商標檢索系統查詢。
- Evals：`logo` 情境刪除商標檢索的評分條件。
- repo 首頁 README：需求與對外連線說明拿掉商標檢索，對外連線從三種變兩種。

### Added

- `designing-websites`：`reference/assets.md` 新增〈AI 生成圖〉。對話裡有使用者自己接上的生圖工具（MCP）時才用，沒有就畫 SVG；外掛不內建生圖、不需要金鑰。內容：風格先生 2～3 種給使用者挑、顯示尺寸與工具輸出上限先算、圖上的字以最差位置算對比、模型授權逐次確認、生完存進專案、logo 與 favicon 的成品不用生成圖。
- `templates/ASSETS-LICENSES.md`：新增〈AI 生成素材〉表（服務、模型與授權、提示詞、日期、用途、狀態）。
- 外掛 README：新增〈Optional: image generation〉，列出 Hugging Face 與 fal 的接法。

### Changed

- `designing-websites` 第 4 步：方向稿的示意圖在有生圖工具時可以用生成圖。
- 規則只管好不好用，不規定長相。逐條對照 NN/g、Baymard、GOV.UK、Apple HIG、WCAG 與 DADS 後改寫：
  - 表單：必填欄位都標出來（原本寫只標少的那一種，與 NN/g、Baymard 相反）；標籤位置與驗證時機補上例外。
  - 動效：改為「有目的、約 100～500ms」，不再限定只回應操作。
  - 首頁：拿掉「一句話價值主張、社會證明、只有一個主要行動」；刪除定價頁一條（查無一手依據）；流程第 3 步與 `new-site` 的評分條件同步把「一個主要行動」改成「主要行動」。
  - 按鈕、儀表板分組、深色模式、閱讀欄寬、中文字型分工、圖示尺寸：拿掉指定做法，留下有依據的部分。
  - 「唯一亮點」改為「亮點要少」（NN/g：大元素最多兩個、對比手法不超過三種）。
  - Logo：不再限制色數、漸層、陰影與筆畫，改由黑白與小尺寸測試把關。
  - 長時間使用的工具出現大面積高彩度色塊，由禁止改為寫出理由讓使用者決定。
  - 使用者指定的風格與質感、同類產品普遍有的主視覺與插圖不算題材扮裝。
- Evals：`logo` 的評分條件不再把漸層算失敗。
- Evals：`missing-playwright` 的評審寫明「參考已下載的瀏覽器版本來選版本」不算借用現成的 Playwright，原本同樣的回答時過時不過。

## web-design 1.3.0 - 2026-11-17

### Added

- `screenshot.mjs`、`axe.mjs`：新增 `--dark`，模擬深色系統再截圖或掃描。不加時是淺色，跟著系統切深色的頁面只截淺色會漏掉深字疊深底。

### Changed

- `designing-websites` 第 2 步：調研同類產品時也記下普遍有的視覺元素（主視覺、插圖、照片）；使用者說樣式不要參考，是不照抄，不是不記。
- `designing-websites` 第 3 步：第一屏的主要任務若是自己提議、使用者只是同意，再列一個候選，標在分層表上一起確認，並各做成方向稿。
- `designing-websites` 第 4 步：同類產品普遍有主視覺或插圖時，方向稿就放上自己畫的示意圖；頁面會跟著系統切深色時，先決定鎖淺色或兩種都截。
- `designing-websites` 第 5 步：定案前把主要的「按了才有」畫面（搜尋、選單、對話框）做出來給使用者看。
- `designing-websites` 第 8 步：浮層和頁面用同一套標準逐張看（桌機與手機、空的與有內容的狀態）；自己加的全站樣式要排除元件庫已有同類樣式的元件。
- `verifying-ui`：間距量測加上輸入框裡的圖示、按鈕與輸入框的垂直中心；網站支援深色模式時加一個深色的 project。

### Fixed

- `screenshot.mjs`、`axe.mjs`：`--click` 點完後等進場動畫跑完，原本會截到、掃到淡入一半的浮層。

## web-design 1.2.1 - 2026-11-17

### Changed

- 兩個 skill 的 description 加上「只要求先說明做法、還不動手時也先載入」：Sonnet 與 Haiku 收到「先不要動手」時常不載入外掛。
- `designing-websites` 第 4 步：圖示那句補上「主要操作配看得到的文字標籤」。
- README：模型建議用 Sonnet 或 Opus，Haiku 在全權委託的長流程會漏掉步驟。
- Evals：`cross-repo-plan` 的評審改為一個檔案判一項；`new-site` 的收素材一項，開始前唯讀查看專案不算違反。

### Added

- Evals：新增 `brand-color` 情境，確認品牌色撞到現成風格清單時保留品牌色。

## web-design 1.2.0 - 2026-11-16

### Changed

- `distinctive-design.md`：題材扮裝改看借來的元素有沒有功能，刪掉「整個介面是一張○○就重寫」的字面判準；換題測試改為診斷，必須跟著改的決定分「版面」與「身份」兩類，工具型產品的版面可以跟著慣例走；品牌一手資料的顏色與字型優先於現成風格清單。
- `direction-review.md`：換題一題不再單獨判不通過；審查者提示第 4 題改問版面與身份兩類；UX 四項加上「每個有顏色的記號要說得出意思、紅色只用在錯誤與破壞性操作」。
- `designing-websites`：專案已選定元件庫時方向稿改用元件庫做，展開時逐一確認元件預設值，元件庫在第 2 步調研時確認；使用者提到的網站與 prompt 當舉例；刪掉「不要把原型的版面結構原封不動帶過來」（第 1 步已寫明版面結構不是需求）。
- `verifying-ui`：版面檢查加一項間距量測（面板內容左右距離、hover 底色與相鄰元素、卡片等寬）。
- `reference/assets.md`：掃描式打包只抓得到寫成完整字串的圖示名稱，離線驗證漏掉的圖示。
- `direction-review.md`：審查者提示第 4 題寫明「顏色有指定的意思算身份」；自我退件規則寫明加強亮點的做法是讓它取代更多原本的元素。
- `reference/accessibility.md`、`contrast.py` 說明：1.4.11 的 3:1 只管辨識元件或狀態所需的圖形，有文字的按鈕外框與裝飾分隔線不在範圍內。

### Added

- `screenshot.mjs`、`axe.mjs`：新增 `--click <選擇器>`（可重複），先點開抽屜、選單、對話框再截圖或掃描，頁面不必為了截圖加網址參數。

### Fixed

- `screenshot.mjs`：外殼固定在視窗內、由內層面板捲動的版面，整頁圖原本只拍到一個視窗高，現在會先把視窗拉高再截。

## web-design 1.1.0 - 2026-11-13

### Added

- `designing-websites`：調研與方向稿之間新增「資訊分層」步驟（人工檢查點），功能分成一直在／就在旁邊／一行收著／按了才有四層；判斷準則在 `reference/ux-patterns.md`。
- `designing-websites`：新增 `reference/direction-review.md`，含方向稿的通過條件（第一眼測試、第一屏可操作元素數、使用情境、換題測試、圖示、UX 四項）、自我退件規則，以及使用者全權委託時改由全新 context 的 subagent 做獨立審查（最多三次，沒通過時交給使用者決定；審查者也看抽屜與選單打開後的截圖，換題一題要逐條列出不適用的版面決定；只有方向層級的問題算不通過，細節意見列成修改清單）。
- `reference/ux-patterns.md` 新增「圖示」一節；`reference/assets.md` 新增圖示的打包方式與授權注意事項。
- `templates/DESIGN-SYSTEM.md` 新增「資訊分層」與「圖示」兩節。
- `screenshot.mjs` 另存第一屏圖（檔名加 `-fold`），回報第一屏可操作元素數，並列出 console 錯誤與未捕捉例外的內容。
- 腳本 `axe.mjs`：用外掛自帶、鎖版的 Playwright 與 axe-core 掃描靜態頁（WCAG 2.0～2.2 A／AA），不需要專案安裝任何東西；頁面有腳本錯誤時不掃描、算失敗。
- Evals：新增 `full-delegation` 情境。

### Changed

- `designing-websites` 流程由 7 步改為 8 步，後面的步驟編號順延；原型的版面結構不再視為需求。
- `reference/distinctive-design.md` 改寫：特色先從資訊安排與排版來；意象取原則不取外觀（題材扮裝），示範用與機關題目無關的例子；新增換題測試；現成風格清單改為舉例並補充項目；退件追問增加選項。
- **`screenshot.mjs`：頁面有 console 錯誤或未捕捉例外（含圖片、字型等資源載入失敗）時結束碼為 1**，原本為 0。
- `verifying-ui`：掃描前先確認沒有腳本錯誤、關鍵元素都在，「違規 0」才算數；範例 `fixtures.ts` 的 `visitAndCheck` 在掃描前 assert `problems` 為空，函式多一個 `problems` 參數。看方向稿或靜態頁時指向內附的 `screenshot.mjs` 與 `axe.mjs`。安裝 `@axe-core/playwright` 後要確認 `playwright-core` 只有一個版本。
- `reference/accessibility.md`：有文字標籤的按鈕，裡面的圖示加 `aria-hidden="true"`。
- `templates/DESIGN-SYSTEM.md` 節次重新編號（Token 由第 3 節改為第 4 節，以此類推）。
- Evals：`logo` 與 `new-site` 的評審改為一個檔案判一項，兩者都改成跑 3 次；`new-site` 的題目延伸到給使用者挑方向為止，並新增「首屏一句話與主要行動」一項。

## web-design 1.0.0 - 2026-11-13

### Added

- `designing-websites` skill：收素材 → 調研 → 方向稿 → 退件 → 定案 `DESIGN-SYSTEM.md` → 素材與 logo → 驗證。含 WCAG 2.2 AA 檢查表、UI/UX 規範、素材授權紀錄範本。
- `verifying-ui` skill：專案鎖版的 Playwright 畫面驗證（通過條件、桌機／手機截圖、版面與 axe 檢查、視覺回歸、ARIA snapshot），內附 `fixtures.ts` 與 `playwright.config.ts` 範例。
- 腳本：`contrast.py`（WCAG 對比）、`export_logo.py`（logo 與 favicon 匯出）、`screenshot.mjs`（桌機／手機整頁截圖）、`tipo_search.mjs`（智慧財產局商標文字近似與以圖找圖）。
- 外掛自帶鎖版的 Playwright（`package-lock.json`），截圖與商標檢索不依賴專案環境。
- 相依官方外掛 `frontend-design@claude-plugins-official`，安裝時自動帶入。
- Evals：5 個情境，供 `claude plugin eval` 做有／無外掛對照。
