# 素材搜尋與授權

## 目錄
- 來源與授權
- 圖示的打包方式
- 下載與使用規則
- 禁區
- 紀錄

## 來源與授權

用之前打開該素材的頁面確認授權，以官方授權頁為準；下表是常用來源的預設條件。

| 類型 | 來源 | 授權重點 |
|---|---|---|
| 照片 | Unsplash | [Unsplash License](https://unsplash.com/license)：免費商用、可修改、不必署名；不可未經大幅修改就販售，不可彙整成競爭服務。**用 API 在網站上即時嵌入時，API 條款要求標示攝影師與 Unsplash** |
| 照片／影片 | Pexels | [Pexels License](https://www.pexels.com/license/)：免費商用、可修改、不必署名；不可放進商標或品牌名稱，可辨識人物不可負面呈現或暗示代言，不可原樣販售或轉放其他圖庫 |
| 照片／插圖 | Openverse、Wikimedia Commons | 彙整多種 CC 與公眾領域授權，**逐張看**：CC BY 要署名、NC 不可商用、ND 不可修改 |
| 字型 | Google Fonts | 多數為 SIL OFL，可商用、可自架；個別字型以該字型頁的授權為準。中文常用：Noto Sans TC、Noto Serif TC、jf open 粉圓（OFL，偏可愛，適合親民內容） |
| 圖示 | Lucide | [ISC](https://lucide.dev/license)，可商用；其中源自 Feather 的圖示為 MIT。兩者都要求授權聲明隨副本保留：把授權全文放進專案並記在 `ASSETS-LICENSES.md` |
| 圖示（其他） | Iconify（彙整多套圖示集） | 授權以圖示集為單位，[每一套不同](https://iconify.design/docs/icons/icon-set-basics.html)，逐套確認；全站只用其中一套 |

不使用來源不明的圖（搜尋引擎圖片、Pinterest、別人網站上的圖）。

## 圖示的打包方式

圖示放在哪裡、要不要文字標籤，見 ux-patterns.md〈圖示〉；這裡只講檔案怎麼進專案。

- **預設：內嵌 SVG 或建置時打包**，執行時不連外。Lucide 用框架對應的套件，或 [`lucide-static`](https://lucide.dev/guide/static)（提供個別 SVG 檔）；Iconify 的圖示集用 `@iconify-json/<圖示集代號>`（[一套一個套件](https://iconify.design/docs/icons/json.html)），由建置工具取出用到的圖示。純靜態頁直接把用到的 SVG 貼進 HTML。
- **Iconify 的 `iconify-icon` 網頁元件預設在執行時向 Iconify API 取圖示資料**（[官方文件](https://iconify.design/docs/iconify-icon/)），要連網並依賴第三方服務。政府機關、內網、離線環境不要這樣用；真的要用這個元件，改成[自架 API](https://iconify.design/docs/api/hosting.html) 或事先把圖示資料載入。
- 只打包用到的圖示；套件鎖精確版本，新增圖示時用同一套、同一版。
- 套件名稱與用法會變，用之前到上面的官方頁面確認現況。

## 下載與使用規則

- **直接下載後自架**（放專案的 `public/` 或資產目錄），不在正式站熱連結圖庫；這樣也不受 API 的署名條款限制。字型同樣自架（Nuxt 用 `@nuxt/fonts` 建置時下載），政府內網或不能外連的環境尤其必要。
- 照片要壓縮與裁切到實際使用尺寸，提供 `srcset`；格式優先 AVIF／WebP。
- 照片上放文字要加遮罩或確保對比（見 accessibility.md）。
- 插圖優先自己畫 SVG（單色 `currentColor` 線稿，題材取自專案），比圖庫插圖更有辨識度。

## 禁區

- 圖庫照片不放進 logo、商標、品牌名稱。
- 可辨識的人物：不用於敏感題材（疾病、犯罪、負面情境），不暗示他們代言產品；需要特定人物時請客戶提供自有照片或取得肖像授權。
- 照片中出現他人商標或建築物、藝術品時，避免當主視覺。
- 不使用 AI 產生「看起來像真人」的照片冒充真實人物或案例。

## 紀錄

每個素材記進專案的 `ASSETS-LICENSES.md`（範本：templates/ASSETS-LICENSES.md）：檔名、來源網址、作者、授權、下載日期、用在哪裡、是否修改。交付時連同素材一起給客戶。
