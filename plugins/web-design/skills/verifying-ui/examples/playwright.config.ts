/**
 * 範例設定：桌機與手機兩個 project、登入狀態重複使用、失敗時留 trace。
 * 複製到專案根目錄後依專案調整（網址、登入方式、要不要 setup project）。
 */
import { defineConfig } from '@playwright/test'
import type { Options } from './e2e/fixtures'

// 測試網址由環境變數提供，不寫死在 repo
const BASE_URL = process.env.E2E_BASE_URL
if (!BASE_URL) throw new Error('缺環境變數 E2E_BASE_URL（要測的網站網址）')

/** 登入狀態檔含 session cookie，路徑要加進 .gitignore。 */
export const AUTH_STATE = 'playwright/.auth/user.json'

const desktop = { viewport: { width: 1440, height: 900 }, device: 'desktop' as const }
const mobile = { viewport: { width: 390, height: 844 }, device: 'mobile' as const }

export default defineConfig<Options>({
  testDir: './e2e',
  // 測試會改同一份後端資料時固定單一 worker；純靜態頁可拿掉
  workers: 1,
  // 擋住遺留的 test.only（否則只跑一個就顯示全綠）
  forbidOnly: true,
  reporter: 'line',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    // 語系與時區固定，版面才不會隨執行的機器改變
    locale: 'zh-TW',
    timezoneId: 'Asia/Taipei',
  },
  // 只在一種尺寸成立的測試標 @desktop／@mobile，另一種尺寸的 project 用 grepInvert 排除
  projects: [
    // 需要登入時啟用：auth.setup.ts 登入後存 AUTH_STATE；trace 會留下密碼，setup 不錄
    // { name: 'setup', testMatch: /auth\.setup\.ts/, use: { trace: 'off' } },
    {
      name: 'desktop',
      grepInvert: /@mobile/,
      use: { ...desktop /* , storageState: AUTH_STATE */ },
      // dependencies: ['setup'],
    },
    {
      name: 'mobile',
      grepInvert: /@desktop/,
      use: { ...mobile /* , storageState: AUTH_STATE */ },
      // dependencies: ['setup'],
    },
  ],
})
