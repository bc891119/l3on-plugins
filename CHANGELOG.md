# Changelog

本檔格式依 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/)，版本號依 [Semantic Versioning](https://semver.org/lang/zh-TW/)。
各外掛獨立編號，git tag 為 `<外掛名>--v<版本>`。

## web-design 2.2.1 - 2026-11-18

### Fixed

- `axe.mjs`：`--click`、`--open-details` 之後沒有再檢查腳本錯誤，點開才出錯的頁面會回報「違規 0」、結束碼 0。現在點開後再查一次，有錯誤就印「點開後腳本錯誤」、不掃描、結束碼 1。
- `contrast.py`：檔案不存在時印 traceback；色票檔裡有格式、色值或類型錯誤時結束碼為 1，和「不合格」分不出來。現在這兩種情況都回 2，和直接給兩個色值時一致；有錯誤的行優先於不合格。
- `screenshot.mjs`：輸出資料夾建不了時印 Node 的 traceback、結束碼 1，和「有腳本錯誤」分不出來。現在印原因、結束碼 2。
- `verifying-ui` 範例 `screenshotAll`：原本把所有元素的 `scrollHeight - clientHeight` 都算進去，`overflow: hidden` 的裁切容器、看不見的元素會把視窗拉得過高。改成和 `screenshot.mjs` 相同的篩選（`overflow` 為 auto／scroll、看得見、在視窗內）。
- Chromium 大小由「約 150MB」改為實測的「下載約 330MB、解壓後約 680MB」（Playwright 1.64.1、Linux x64）。
- `SKILL.md`：
  - 「後三支用 Node」改為後兩支（`tipo_search.mjs` 在 2.0.0 已刪除）；
  - `export_logo.py` 補上 `logo-48.png` 與 `--touch-bg`；
  - 方向稿通過條件改成引用 direction-review.md 的 11 項，不再列一份不完整的名稱。
- `verifying-ui`：「前四項版面檢查」改為前五項。
- Evals：`logo` 的評分條件原本把「CMYK 印刷 PDF」判為失敗，和 `logo.md` 的 brief 收印刷、招牌用途矛盾。現在只判「宣稱腳本能直接產出 .ai／CMYK」為失敗，建議另外製作印刷檔不算。
- repo 首頁 README：拿掉 2.0.0 已刪除的商標檢索（5d55645，2.2.0 之後提交）。

### Changed

- 規則用詞對齊一手來源：
  - 焦點環完全被蓋住由「屬 2.4.7 不合格」改為「很可能不符合」（W3C 原文 "would likely fail"）；
  - 深色模式由「越上層越亮」改為「不一定是反轉；疊在前面的介面（popover、sheet）較亮」（Apple HIG）；
  - 表單標籤由「左側」改為「欄位旁邊」，選填欄位分別寫出 Baymard（should）與 NN/g（nice perk）的說法；
  - 40 字改引用 DADS 的 accessibility 子頁；
  - 字距由「小字、大標題」改成 DADS 標準文字樣式的逐級對應（45px `0`、28～36px `0.01em`、26px 以下 `0.02em`）；
  - 2.2.2 寫明 5 秒只適用移動、閃爍、捲動的內容，自動更新的內容沒有 5 秒門檻；
  - 14px 補上「原則上」；
  - 對比手法不超過三種限定在複雜的畫面（NN/g）；
  - 主要按鈕改照 GOV.UK 原文「一個頁面避免多個主要按鈕」；
  - Playwright 預設淺色與 `mask` 的連結改到記載它們的 API 頁。
- 規定做法但沒有可用性依據的規則，改成只寫要達到的結果：
  - 1.4.4 拿掉「字級用 rem」（瀏覽器縮放即可達成）；
  - 2.4.1 的「跳到主要內容」連結改為連結、地標或區塊標題擇一；
  - 「每頁一個 h1」與範本的「以 h1 開頭」統一成同一句，並標明是慣例、不是 WCAG 準則；
  - `assets.md` 拿掉「單色 currentColor 線稿」（與〈AI 生成圖〉的風格給使用者挑衝突）。
- 同一條規則只在有來源的那一處寫完整，其他地方改成一句引用：14px、主要按鈕數量、自動播放 5 秒、方向稿提一次生圖工具。
- repo 首頁 README〈更新〉補上 `claude plugin update web-design@l3on-plugins`，並說明只更新市集清單不會更新已安裝的外掛。
- `screenshot.mjs` 說明的「設計稿」改為「方向稿」。

### Added

- Evals：
  - `ai-imagery`：生成前報張數並先給風格選、模型授權與存檔、標語用 HTML 疊並以最差位置算對比；
  - `brief-conditions`：逐條對需求文件，並分辨螢幕解析度與瀏覽器可視範圍；
  - `dark-mode`：Nuxt UI 跟著系統切深色、截圖工具預設淺色時，先決定鎖淺色或兩種都截。
  - `brief-conditions`、`dark-mode` 用 Opus 跑時沒外掛也多半通過，分不出有沒有外掛，用途是防止規則被改壞。
- Evals：新增 `evals-exec/run-scripts`，在 sandbox 裡實際執行 `contrast.py`，從執行紀錄比對腳本輸出，並檢查回報的結束碼、不合格組與修法。要授權 Bash 與 sandbox，另用 `--eval-dir evals-exec --scaffold --allow-tools Bash` 執行。`axe.mjs`、`screenshot.mjs` 沒有放進這個案例：eval 的 sandbox 不讓工作目錄與暫存目錄寫入，Chromium 啟動不了。

## web-design 2.2.0 - 2026-11-18

### Added

- `screenshot.mjs`：新增 `--size <寬>x<高>`（可重複），加截指定的視窗尺寸。需求文件指定解析度（例 1920×1080）時，原本只能另寫腳本。
- 方向稿通過條件第 11 項〈需求文件的條件〉：文件寫明、看截圖就能判斷的條件列出來逐條對，桌機與手機都對；指定的解析度照扣掉瀏覽器工具列後的可視範圍截。
- 〈AI 生成圖〉新增兩條，並在「尺寸先算」補一句：
  - 張數先講：每個圖位各生一張，生成前報張數；要用裁切或重複使用省張數先問。
  - 人物：提示詞寫明受眾的地區與族群，不寫時模型照預設畫；寫了也不保證，生完逐張看。
  - 尺寸先算：桌機與手機構圖差很多時各生一張，用 `<picture>` 切換。
- 中文排版：標題、按鈕與短句不在詞中間斷行的做法（`<wbr>` 加 `word-break: keep-all`、`text-wrap: balance`）。
- 第 5 步：預覽網址給出去之後又改 CSS／JS 時，頁面引用這些檔案的網址加版本參數，避免瀏覽器沿用舊檔。
- 現成風格清單加一條：卡片或清單的選取狀態只靠側邊粗色條標示，字重、底色都沒變。

### Changed

- 〈AI 生成圖〉的「文字另外排」擴大成「文字與標記另外排」：提示詞寫明不要文字，生完檢查有沒有假字；地圖與示意圖上的地點、數值標記用程式疊，不畫進圖裡；位置先查證，疊完逐點看。
- `accessibility.md`：焦點環不能被會捲動的容器裁掉，也不能被相鄰的圖片蓋住；註明焦點環完全被蓋住屬 2.4.7，axe 不查這一項，要按 Tab 截圖看。

## web-design 2.1.0 - 2026-11-18

### Changed

- `designing-websites` 第 4 步：示意圖是自己畫的 SVG 時，方向稿說明寫正式素材來源的那一句提一次「也可以接生圖工具」。不點名服務、不要求安裝；原本完全不提，沒讀 README 的人不知道有這個選項。

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
