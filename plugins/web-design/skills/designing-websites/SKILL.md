---
name: designing-websites
description: 網站與網頁介面的設計流程：向使用者收素材、調研、提 2～3 個方向稿供挑選與退件、定案寫 DESIGN-SYSTEM.md，含 WCAG 2.2 AA 檢查、主流 UI/UX 規範、素材搜尋與授權紀錄、SVG logo 與 favicon 產出。做新網站、landing page、改版、新介面視覺、配色字型、找圖片素材、設計 logo 時載入；專案已有 DESIGN-SYSTEM.md 時用來照規範擴充。
argument-hint: "[要設計的網站或頁面｜logo｜素材]"
---

# 網站設計流程

好看的設計靠「人挑、AI 做」：AI 負責調研、提案、實作與驗證，使用者負責素材、挑方向、退件。不要一次產出完整站當最終設計。

## 先判斷情境

- **專案已有 `DESIGN-SYSTEM.md`**（或同等的設計規範檔）：只照它做，不重新提方向、不改定案的色彩字型。規範沒涵蓋的新元件，先照既有 token 與寫法延伸，做完補進規範並告訴使用者；牽涉定案項目的改動先問。仍要跑第 7 步的檢查。
- **只要 logo**：直接讀 [reference/logo.md](reference/logo.md)。
- **只要找素材**：直接讀 [reference/assets.md](reference/assets.md)。
- **新網站、新產品介面、大改版**：照下面完整流程。

## 完整流程

複製這份清單追蹤進度：

```
設計進度：
- [ ] 1. 收素材（人工檢查點①）
- [ ] 2. 調研
- [ ] 3. 方向稿 2～3 個（人工檢查點②）
- [ ] 4. 退件迭代（人工檢查點③）
- [ ] 5. 定案寫 DESIGN-SYSTEM.md（人工檢查點④）
- [ ] 6. 素材與 logo
- [ ] 7. 展開與驗證
```

### 1. 收素材（人工檢查點①）

用 AskUserQuestion 問（已知的跳過，一次 1～2 題）：

- **參考**：3～5 個喜歡的網站、產品或截圖，以及喜歡它的哪一點。沒有的話，提 3～4 種風格方向各附一個真實網站讓使用者選。
- **品牌意涵**：機關或品牌的故事、既有標誌與色彩的意義、不能碰的東西。
- **使用者與情境**：誰用、多久用一次、桌機或手機為主、是行銷頁還是每天用的工具。
- **必備內容**：頁面、功能、文案素材；有原型或 PM 文件就以它為功能來源，樣式不照抄。

使用者說「你決定」時，自己定並寫進方向稿說明，讓使用者在檢查點②推翻。

### 2. 調研

- **一手品牌資料**：官網的標誌設計說明、色彩意義、歷史（例：機關標誌說明裡寫明每個顏色代表什麼，就能直接當配色依據）。
- **同類產品**：Mobbin／Refero 看真實產品的頁型與流程，Land-book／Recent 看視覺方向。行銷站得獎作品對工具型產品參考價值低。
- **規範**：讀 [reference/ux-patterns.md](reference/ux-patterns.md)（頁型與中文排版）與 [reference/accessibility.md](reference/accessibility.md)。
- 載入官方 frontend-design skill（`frontend-design:frontend-design`，本外掛的相依外掛，安裝時會一併裝好）取得美感原則，方向稿要符合它。

### 3. 方向稿 2～3 個（人工檢查點②）

讀 [reference/distinctive-design.md](reference/distinctive-design.md) 再發想。

- 每個方向：一句話概念、從題材長出來的理由、色彩與字型、**唯一的亮點**是什麼。
- 每個方向只做**一個關鍵畫面**（首頁首屏，或工具型產品最常用的畫面），用真實內容，不用佔位文字。
- 方向稿放專案內不進版控的目錄（例 `design-explore/<方向名>/`，加進 `.gitignore`），靜態 HTML 即可。
- 截圖用內附的 `screenshot.mjs`（見〈腳本〉，不需要專案安裝任何東西）：桌機 1440 與手機 390 各一張，自己逐張用 Read 看過再給使用者。
- 每個方向先跑 `python3 ${CLAUDE_SKILL_DIR}/scripts/contrast.py <色票檔>` 檢查色票，不合格的先修。
- 用 AskUserQuestion 請使用者選一個方向（附截圖路徑與使用者開得到的預覽網址），也可以要求混合。

### 4. 退件迭代（人工檢查點③）

- 只改選定的那個畫面，每輪附截圖。
- 使用者說「不好看」但說不出原因時，用 distinctive-design.md 的「退件追問」問出具體方向，不要自己猜一輪又一輪。
- 通常 2～3 輪。使用者明確說「可以」才進下一步。

### 5. 定案寫 DESIGN-SYSTEM.md（人工檢查點④）

- 用 [templates/DESIGN-SYSTEM.md](templates/DESIGN-SYSTEM.md) 寫到專案根目錄（前台 repo 內），所有 token 有單一來源。
- 給使用者看過、同意後才展開到其他頁面。

### 6. 素材與 logo

- 照片、插圖、字型、圖示：照 [reference/assets.md](reference/assets.md) 找與下載，每個都記進 `ASSETS-LICENSES.md`（範本 [templates/ASSETS-LICENSES.md](templates/ASSETS-LICENSES.md)）。
- 需要 logo：照 [reference/logo.md](reference/logo.md)。

### 7. 展開與驗證

每完成一批頁面跑一次：

1. **色彩對比**：`python3 ${CLAUDE_SKILL_DIR}/scripts/contrast.py <色票檔>`，有不合格就改 token 再跑，直到全過。
2. **畫面**：正式頁面照 verifying-ui skill（本外掛內，`web-design:verifying-ui`）用專案自己鎖版的 Playwright 寫測試：截桌機與手機圖並逐張看、跑 axe（含 `wcag22aa` 標籤）。專案沒有 Node 或使用者不想裝時，退而用 `screenshot.mjs` 截圖人工檢視，並在回報中註明沒有跑 axe。
3. **人工檢查**：[reference/accessibility.md](reference/accessibility.md) 的「工具抓不到」清單（焦點順序、焦點不被固定列遮住、點擊目標 24px、拖曳替代、縮放 200%／寬 320px 不破版、減少動態）。
4. **UX 審查**：用 ux-patterns.md 的 NN/g 啟發式逐項過一次關鍵流程。

## 腳本

腳本在 `${CLAUDE_SKILL_DIR}/scripts/`。前兩支只需要 Python 3；後兩支用 Node 與外掛自帶、鎖版的 Playwright，任何目錄都能執行。第一次執行若提示缺套件或缺 Chromium，照訊息裡的指令跑一次即可（下載 Chromium 約 150MB，先告訴使用者）。

- `contrast.py`：算 WCAG 對比。輸入檔每行一組 `前景 背景 [類型]`，類型 `text`（4.5:1，預設）、`large`（3:1，24px 或 18.66px 粗體以上）、`ui`（3:1，圖示、框線、焦點環）。色值支援 `#rgb`、`#rrggbb`、`rgb()`、`oklch()`；半透明色要先換成疊在背景上之後的實色。也可直接給兩個色值：`contrast.py "#767676" "#ffffff"`。有不合格時結束碼為 1。
- `export_logo.py <logo.svg> <輸出資料夾> [--favicon favicon.svg]`：產出 PNG 512/256/128/64/32/16、`apple-touch-icon.png`（180）、`favicon.ico`（16/32/48）。需要一個 SVG 轉檔工具（cairosvg、rsvg-convert、ImageMagick 或 Inkscape 任一）；都沒有時腳本會印出安裝方式。

- `tipo_search.mjs text|image <文字或圖檔> <輸出資料夾> [--class 030,043]`：查智慧局商標檢索系統的文字近似或以圖找圖，輸出 `result.json` 與 `result.png`。結束碼 3 是查詢失敗，不可當成查無。用法見 reference/logo.md。
- `screenshot.mjs <輸出資料夾> <網址或 HTML 檔>... [--tablet]`：每頁截桌機 1440 與手機 390 整頁圖（`--tablet` 加 768），並回報 console 錯誤數與有無橫向捲軸。給方向稿與設計檢視用，不取代 verifying-ui 的專案驗收測試。

## 不要做

- 不要跳過檢查點①直接做；不要一次做完整站當作設計提案。
- 不要用 AI 範本外觀（清單在 distinctive-design.md）。
- 不要把圖庫照片放進 logo；不要用來源與授權不明的素材。
- 不要只靠顏色傳達狀態；不要用低於 14px 的文字（行內上標等例外要撐足點擊範圍）。
