---
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

專案前台是 Nuxt（已在 devDependencies 鎖定 @playwright/test，有 playwright.config.ts 與 e2e/，一次性測試目錄不進版控），後台是另一個 repo 的 Django（沒有 Node）。這次改了前台送出表單、後台審核後前台顯示通過。先不要執行，寫出畫面驗證計畫：測試放哪、怎麼登入兩邊、怎麼跑、怎麼處理截圖。
