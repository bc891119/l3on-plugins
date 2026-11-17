---
name: designing-websites
description: 網站與網頁介面的設計流程：向使用者收素材、調研、資訊分層、提 2～3 個方向稿供挑選與退件、定案寫 DESIGN-SYSTEM.md，含 WCAG 2.2 AA 檢查、主流 UI/UX 規範、圖示用法、素材搜尋與授權紀錄、SVG logo 與 favicon 產出。做新網站、landing page、改版、新介面視覺、配色字型、找圖片素材、設計 logo 時載入；專案已有 DESIGN-SYSTEM.md 時用來照規範擴充。只要求先說明做法、還不動手時也先載入。
argument-hint: "[要設計的網站或頁面｜logo｜素材]"
---

# 網站設計流程

好看的設計靠「人挑、AI 做」：AI 負責調研、提案、實作與驗證，使用者負責素材、挑方向、退件。不要一次產出完整站當最終設計。

## 先判斷情境

- **專案已有 `DESIGN-SYSTEM.md`**（或同等的設計規範檔）：只照它做，不重新提方向、不改定案的色彩字型。規範沒涵蓋的新元件，先照既有 token 與寫法延伸，做完補進規範並告訴使用者；牽涉定案項目的改動先問。仍要跑第 8 步的檢查。
- **只要 logo**：直接讀 [reference/logo.md](reference/logo.md)。
- **只要找素材**：直接讀 [reference/assets.md](reference/assets.md)。
- **新網站、新產品介面、大改版**：照下面完整流程。
- **使用者說「全部你決定、不要問我」**：流程照走，檢查點改用 [reference/direction-review.md](reference/direction-review.md) 的「使用者全權委託時」，不能直接跳過。

## 完整流程

複製這份清單追蹤進度：

```
設計進度：
- [ ] 1. 收素材（人工檢查點①）
- [ ] 2. 調研
- [ ] 3. 資訊分層（人工檢查點②）
- [ ] 4. 方向稿 2～3 個（人工檢查點③）
- [ ] 5. 退件迭代（人工檢查點④）
- [ ] 6. 定案寫 DESIGN-SYSTEM.md（人工檢查點⑤）
- [ ] 7. 素材與 logo
- [ ] 8. 展開與驗證
```

### 1. 收素材（人工檢查點①）

用 AskUserQuestion 問（已知的跳過，一次 1～2 題）：

- **參考**：3～5 個喜歡的網站、產品或截圖，以及喜歡它的哪一點。沒有的話，提 3～4 種風格方向各附一個真實網站讓使用者選。使用者提到的網站、獎項、別人的 prompt 是舉例：寫出借什麼、不借什麼，不當成搜尋範圍或規格。
- **品牌意涵**：機關或品牌的故事、既有標誌與色彩的意義、不能碰的東西。
- **使用者與情境**：誰用、多久用一次、桌機或手機為主、是行銷頁還是每天用的工具。
- **必備內容**：頁面、功能、文案素材；有原型或 PM 文件就以它為**功能**來源。原型的樣式與版面結構（幾欄、什麼東西同時攤開）都不是需求，除非使用者說是。

使用者對某一題說「你決定」時，自己定並寫進方向稿說明，讓使用者在檢查點③推翻。

### 2. 調研

- **專案現況**：看專案有沒有已選定的元件庫（例 Nuxt UI、MUI），第 4 步的方向稿要用它做。
- **一手品牌資料**：官網的標誌設計說明、色彩意義、歷史（例：機關標誌說明裡寫明每個顏色代表什麼，就能直接當配色依據）。
- **同類產品**：Mobbin／Refero 看真實產品的頁型與流程，Land-book／Recent 看視覺方向。行銷站得獎作品對工具型產品參考價值低。
- **規範**：讀 [reference/ux-patterns.md](reference/ux-patterns.md)（資訊分層、圖示、頁型與中文排版）與 [reference/accessibility.md](reference/accessibility.md)。
- 載入官方 frontend-design skill（`frontend-design:frontend-design`，本外掛的相依外掛，安裝時會一併裝好）取得美感原則，方向稿要符合它。

### 3. 資訊分層（人工檢查點②）

先決定「什麼時候看得到什麼」，再談長相。照 ux-patterns.md 的〈資訊分層〉做：

- 從原型或需求列出功能清單，每一項分到四層：**一直在／就在旁邊／一行收著／按了才有**。
- 產出一張分層表給使用者確認。之後每個方向稿都以它為上限：可以收得更深，不能把項目往上提。
- 行銷頁、單頁內容站不必列四層，寫出「首屏的一句話與一個主要行動、區塊順序」，併進方向稿說明即可，不另設檢查點。

### 4. 方向稿 2～3 個（人工檢查點③）

讀 [reference/distinctive-design.md](reference/distinctive-design.md) 再發想。

- 特色先從資訊安排與排版來，再色彩，最後才是圖形；借實物只取原則與功能，不取外觀。
- 每個方向只做**一個關鍵畫面**（首頁首屏，或工具型產品最常用的畫面），用真實內容，不用佔位文字。圖示在這一步就決定並畫上去，主要操作配看得到的文字標籤（ux-patterns.md〈圖示〉），不留到第 7 步。
- 方向之間的**資訊安排**要不同，不只換顏色字型；至少一個方向是「第一屏只留主要任務」的版本。
- 方向稿放專案內不進版控的目錄（例 `design-explore/<方向名>/`，是 git repo 時加進 `.gitignore`），靜態 HTML 即可。專案已選定元件庫（例 Nuxt UI、MUI）時改用元件庫做，元件的預設長相與行為才會出現在畫面上。
- 截圖用內附的 `screenshot.mjs`（見〈腳本〉，不需要專案安裝任何東西）：桌機 1440 與手機 390 各一張，自己逐張用 Read 看過。結束碼不是 0 就先修，不拿壞掉的頁面去截圖與檢查。
- 每個方向先跑 `python3 ${CLAUDE_SKILL_DIR}/scripts/contrast.py <色票檔>` 檢查色票，不合格的先修。
- 給使用者看之前，每個方向先過 [reference/direction-review.md](reference/direction-review.md) 的「通過條件」（第一眼測試、第一屏可操作元素數、使用情境、換題測試、圖示、UX 四項），結果寫進方向稿說明。不過的先改，不拿去給人挑。
- 用 AskUserQuestion 請使用者選一個方向（附截圖路徑與使用者開得到的預覽網址），也可以要求混合。

### 5. 退件迭代（人工檢查點④）

- 只改選定的那個畫面，每輪附截圖，並重做通過條件裡的第一眼測試與元素數。
- 使用者說「不好看」「很亂」但說不出原因時，用 distinctive-design.md 的「退件追問」問出具體方向，不要自己猜一輪又一輪。
- 使用者有具體意見時照意見改；沒有意見、要自己迭代時照 direction-review.md 的〈自我退件規則〉。
- 通常 2～3 輪。使用者明確說「可以」才進下一步。

### 6. 定案寫 DESIGN-SYSTEM.md（人工檢查點⑤）

- 用 [templates/DESIGN-SYSTEM.md](templates/DESIGN-SYSTEM.md) 寫到專案根目錄（前台 repo 內），所有 token 有單一來源；「資訊分層」與「圖示」兩節必填（行銷頁的資訊分層寫首屏一句話、主要行動與區塊順序）。
- 給使用者看過、同意後才展開到其他頁面（全權委託時照 direction-review.md 的替代做法繼續）。

### 7. 素材與 logo

- 照片、插圖、字型、圖示檔：照 [reference/assets.md](reference/assets.md) 找與下載，每個都記進 `ASSETS-LICENSES.md`（範本 [templates/ASSETS-LICENSES.md](templates/ASSETS-LICENSES.md)）。圖示放哪裡在第 4 步已定，這裡處理的是檔案來源、打包方式與授權。
- 需要 logo：照 [reference/logo.md](reference/logo.md)。

### 8. 展開與驗證

每完成一批頁面跑一次，照順序：

1. **頁面真的畫出來了**：沒有腳本錯誤（`screenshot.mjs` 結束碼 0，或測試裡 assert 沒有 console error 與 pageerror），頂列、主要內容、主要按鈕等關鍵元素都在。這一項沒過，後面的「違規 0」沒有意義：元素沒畫出來，掃描反而全過。
2. **色彩對比**：`python3 ${CLAUDE_SKILL_DIR}/scripts/contrast.py <色票檔>`，有不合格就改 token 再跑，直到全過。
3. **畫面**：正式頁面照 verifying-ui skill（本外掛內，`web-design:verifying-ui`）用專案自己鎖版的 Playwright 寫測試：截桌機與手機圖並逐張看、跑 axe（含 `wcag22aa` 標籤）。專案沒有 Node 或使用者不想裝時（靜態頁、方向稿），改用內附的 `screenshot.mjs` 截圖逐張看、`axe.mjs` 掃描；抽屜、對話框、選單打開後的畫面用 `--click` 各截、各掃一次，沒掃到的在回報中註明。
4. **人工檢查**：[reference/accessibility.md](reference/accessibility.md) 的「工具抓不到」清單（焦點順序、焦點不被固定列遮住、點擊目標 24px、拖曳替代、縮放 200%／寬 320px 不破版、減少動態）。用了元件庫時，看得見的元件預設（頭像位置、hover 底色和背景同色、絕對定位的操作列）逐一確認是刻意的。
5. **UX 審查**：用 ux-patterns.md 的 NN/g 啟發式逐項過一次關鍵流程（其中四項在方向稿階段已先看過，這裡看完整流程）；每頁對照分層表，確認展開後沒有把收起來的東西又攤回第一屏。

## 腳本

腳本在 `${CLAUDE_SKILL_DIR}/scripts/`。前兩支只需要 Python 3；後三支用 Node 與外掛自帶、鎖版的 Playwright，任何目錄都能執行。第一次執行若提示缺套件或缺 Chromium，照訊息裡的指令跑一次即可（下載 Chromium 約 150MB，先告訴使用者）。

- `contrast.py`：算 WCAG 對比。輸入檔每行一組 `前景 背景 [類型]`，類型 `text`（4.5:1，預設）、`large`（3:1，24px 或 18.66px 粗體以上）、`ui`（3:1，圖示、輸入框框線、焦點環；裝飾線與有文字的按鈕外框不必列）。色值支援 `#rgb`、`#rrggbb`、`rgb()`、`oklch()`；半透明色要先換成疊在背景上之後的實色。也可直接給兩個色值：`contrast.py "#767676" "#ffffff"`。有不合格時結束碼為 1。
- `export_logo.py <logo.svg> <輸出資料夾> [--favicon favicon.svg]`：產出 PNG 512/256/128/64/32/16、`apple-touch-icon.png`（180）、`favicon.ico`（16/32/48）。需要一個 SVG 轉檔工具（cairosvg、rsvg-convert、ImageMagick 或 Inkscape 任一）；都沒有時腳本會印出安裝方式。

- `tipo_search.mjs text|image <文字或圖檔> <輸出資料夾> [--class 030,043]`：查智慧局商標檢索系統的文字近似或以圖找圖，輸出 `result.json` 與 `result.png`。結束碼 3 是查詢失敗，不可當成查無。用法見 reference/logo.md。
- `screenshot.mjs <輸出資料夾> <網址或 HTML 檔>... [--tablet] [--click <選擇器>]...`：每頁截桌機 1440 與手機 390 的整頁圖與第一屏圖（檔名加 `-fold`；`--tablet` 加 768；`--click` 先點開抽屜、選單再截，每種狀態用各自的輸出資料夾），並回報第一屏可操作元素數、有無橫向捲軸、console 錯誤與未捕捉例外的內容。有腳本錯誤時結束碼為 1（圖照截，但不算通過）。給方向稿與設計檢視用，不取代 verifying-ui 的專案驗收測試。
- `axe.mjs <網址或 HTML 檔>... [--open-details] [--click <選擇器>]...`：每頁在桌機與手機尺寸各跑一次 axe-core（WCAG 2.0～2.2 的 A 與 AA），列出違規的規則與元素、需人工判斷的項目。有違規或頁面有腳本錯誤時結束碼為 1（有腳本錯誤的頁面不掃描）。只掃載入後的狀態；`--open-details` 先展開所有 `<details>`，`--click` 先點開抽屜、對話框再掃。

## 不要做

- 不要跳過檢查點①直接做；不要一次做完整站當作設計提案。
- 不要用「全部同時可見」來滿足「功能不能少」。
- 不要套現成風格或題材扮裝（判斷方法在 distinctive-design.md 的「換題測試」，不是比對清單）。
- 不要自己審自己就算過了檢查點：使用者不在時用獨立審查，並在報告寫明。
- 不要把圖庫照片放進 logo；不要用來源與授權不明的素材。
- 不要只靠顏色傳達狀態；不要用低於 14px 的文字（行內上標等例外要撐足點擊範圍）。
