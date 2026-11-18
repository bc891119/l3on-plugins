# Logo 與 favicon

## 目錄
- 流程
- 繪製規則
- 測試
- 交付清單

## 流程

```
Logo 進度：
- [ ] 1. Brief：用 AskUserQuestion 收名稱、一句話品牌概念、要傳達的 3 個形容詞（數量是慣例）、使用場合（網站、印刷、招牌、App）、不要的元素
- [ ] 2. 2～3 個概念，各一個 SVG（圖形＋字標組合）給使用者挑
- [ ] 3. 選定後迭代 1～2 輪
- [ ] 4. 黑白測試、16px 測試、深淺底測試
- [ ] 5. 匯出交付檔
```

概念發想同 distinctive-design.md：從品牌意涵與題材取意象，2～3 個概念走不同路線（例：具象圖形、抽象幾何、純字標）。概念數是慣例，和方向稿的 2～3 個一致。

## 繪製規則

- `viewBox` 用方形（例 `0 0 512 512`），圖形置中，四周留約 10% 安全邊距（慣例）；橫式組合版另做一個 `viewBox`。
- 文字轉成路徑（不依賴使用者電腦的字型），或在 SVG 內只用自架字型時註明。
- 顏色用 CSS 變數或 `currentColor` 方便出單色版。
- 風格不限。漸層、陰影、細線可以用，但要過下面的黑白與小尺寸測試；過不了就另做簡化版。
- 不使用圖庫照片或他人圖形。
- 中文字標：字數多時只用圖形或縮寫做 favicon。

## 測試

逐項做完並截圖給使用者：

1. **黑白**：純黑、純白（無灰階）各一版仍可辨識。只靠顏色辨識的設計要重做。
2. **小尺寸**：16×16、32×32 仍看得出輪廓。看不出就為 favicon 另做簡化版（保留核心圖形，拿掉字與細線）。
3. **深淺底**：白底、品牌深色底、照片底各放一次；需要時做反白版。
4. **對比**：logo 若兼作按鈕或連結的圖示，對背景至少 3:1（`contrast.py` 的 `ui` 類型）。

## 交付清單

用本 skill 的 `scripts/export_logo.py`（完整路徑見 SKILL.md〈腳本〉）產出點陣檔：`export_logo.py logo.svg <輸出資料夾> --favicon favicon.svg`；SVG 版本手動整理：

```
logo/
├── logo.svg                 母檔（全彩）
├── logo-horizontal.svg      橫式組合版（需要時）
├── logo-black.svg           單色黑
├── logo-white.svg           單色白（反白）
├── favicon.svg              簡化版；可內嵌 @media (prefers-color-scheme: dark) 跟隨深色模式
├── favicon.ico              16/32/48（腳本產出）
├── apple-touch-icon.png     180×180，不透明底（腳本產出）
├── logo-512.png … logo-16.png（腳本產出）
└── LOGO-GUIDE.md            最小尺寸、安全邊距、色值、錯誤用法（拉伸、改色、加特效）
```

HTML：

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```
