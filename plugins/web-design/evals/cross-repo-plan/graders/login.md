---
type: llm
---

PASS：兩個身分（前台、後台）各存一份 storageState，跨系統流程用兩個 browser context。
FAIL：只存一份登入狀態，或跨系統流程共用同一個 context。
回答的格式、長短與其他內容不影響判定，只看上面這一項。
