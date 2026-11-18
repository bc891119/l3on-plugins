# web-design

A Claude Code plugin for designing websites with a human in the loop, and verifying the result with Playwright. Skill content is written in Traditional Chinese.

網站設計流程與畫面驗證。安裝、需求與對外連線說明見 [repo 首頁](https://github.com/bc891119/l3on-plugins#readme)。

## Skills

| Skill | 用途 |
|---|---|
| `web-design:designing-websites` | 收素材 → 調研 → 資訊分層 → 2～3 個方向稿 → 退件 → 定案 `DESIGN-SYSTEM.md` → 素材與 logo → 驗證。含方向稿通過條件與換題測試、使用者全權委託時的獨立審查、圖示用法、WCAG 2.2 AA 檢查、素材授權紀錄、SVG logo 匯出 |
| `web-design:verifying-ui` | 用專案鎖版的 Playwright 驗證畫面：通過條件、桌機／手機截圖、版面與 axe 檢查、視覺回歸 |

## Scripts

位於 `skills/designing-websites/scripts/`，由 skill 呼叫，也可以單獨執行：

| 腳本 | 用途 | 需要 |
|---|---|---|
| `contrast.py` | WCAG 色彩對比檢查 | Python 3 |
| `export_logo.py` | SVG logo 匯出 PNG、favicon.ico、apple-touch-icon | Python 3＋任一 SVG 轉檔工具 |
| `screenshot.mjs` | 桌機 1440／手機 390 整頁截圖，回報第一屏可操作元素數；頁面有腳本錯誤時結束碼 1 | Node.js（Playwright 隨外掛安裝） |
| `axe.mjs` | 桌機／手機尺寸的 axe-core 掃描（WCAG 2.0～2.2 A／AA），給沒有 Node 專案的靜態頁用 | 同上 |

## Dependencies

- 官方外掛 `frontend-design@claude-plugins-official`（自動安裝）
- npm：`playwright`（Apache-2.0）、`axe-core`（MPL-2.0）；版本鎖在 `package-lock.json`，自動安裝，不隨本 repo 散布；Chromium 第一次使用時下載

## Optional: image generation

外掛不內建生圖，也不需要任何金鑰；沒有生圖工具時，插圖示意由 Claude 畫 SVG。想讓方向稿用生成圖，自己接一個生圖服務的 MCP 伺服器，外掛偵測到就會用，並把服務、模型、授權與提示詞記進 `ASSETS-LICENSES.md`。

兩個用瀏覽器登入、不必填金鑰的例子（指令以各服務的官方文件為準）：

```bash
# Hugging Face：免費帳號每天有 GPU 額度；預設帶一個生圖 Space，要換在 https://huggingface.co/settings/mcp 調整
claude mcp add hf-mcp-server -t http "https://huggingface.co/mcp?login"
# fal：依用量計費
claude mcp add --transport http fal https://mcp.fal.ai/mcp-relay
```

加入後在 Claude Code 輸入 `/mcp` 登入（遠端主機上用 `claude mcp login <名稱> --no-browser`）。文件：[Hugging Face](https://huggingface.co/docs/hub/en/agents-overview)、[fal](https://fal.ai/docs/documentation/setting-up/mcp/claude-code.md)、[Claude Code MCP](https://code.claude.com/docs/en/mcp)。

連上第三方伺服器前請自行確認信任它；生成圖能不能商用依各模型的授權而定，由使用者自行確認。

## Evals

```bash
claude plugin eval . --judge-model sonnet --threshold 0.8
```

## License

[MIT](../../LICENSE)
