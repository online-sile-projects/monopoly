# monopoly

## 專案簡介

這是一個純前端實作的大富翁遊戲，支援 2-4 人本地遊玩，具備經典大富翁的所有基本功能與互動體驗。專案設計完全無需 server 端，適合部署於 GitHub Pages，玩家可直接於瀏覽器體驗遊戲。

## 技術棧
- React（建議，或 Vue 亦可）
- CSS/SCSS 或 styled-components
- 狀態管理：React Context（避免 Redux，減少相依套件）
- 動畫：CSS Animation 或 Framer Motion
- 僅使用前端函式庫，無需任何 server 端程式碼

## 元件架構

```
App
├── Header（標題、設定、規則）
├── GameSetting（遊戲設定畫面）
├── GameBoard（棋盤區域）
│   ├── BoardCell（單一格子）
│   └── Piece（玩家棋子）
├── PlayerPanel（玩家資訊面板）
├── Dice（骰子元件）
├── ActionPanel（操作提示、回合控制）
├── Modal（彈出視窗：購買、交易、事件等）
└── Footer（版權、說明）
```

## 主要元件說明
- GameBoard：顯示棋盤與所有格子、玩家棋子動畫移動
- PlayerPanel：顯示所有玩家的現金、資產、地產
- Dice：擲骰子動畫與結果顯示
- Modal：購買地產、支付租金、抽卡等互動彈窗
- GameSetting：遊戲開始前的設定（玩家數、名稱、角色）

## 狀態管理
- 使用 React Context 管理全域遊戲狀態（玩家資料、棋盤狀態、回合、事件）
- 各元件透過 props/context 取得所需資訊

## 資料流說明
- 玩家操作（擲骰子、購買、交易）→ 觸發 action → 更新全域狀態 → 重新渲染相關元件
- 動畫與互動效果由元件內部 state 控制

## 部署與執行
1. 安裝相依套件：`npm install`
2. 本地預覽：`npm start`
3. 建構靜態檔案：`npm run build`
4. 部署到 GitHub Pages：
   - 建議建立新 branch：`git checkout -b feature/gh-pages`
   - 安裝 gh-pages 套件：`npm install gh-pages --save-dev`
   - 在 package.json 設定 homepage 與 scripts
   - 執行：`npm run deploy`

## 注意事項
- 所有遊戲資料皆儲存在瀏覽器記憶體，重新整理即重置
- 無需任何 server 端 API 或資料庫
- 適合 GitHub Pages、Netlify、Vercel 等靜態網站部署

## 專案資料夾結構建議

```
monopoly/
├── public/                # 靜態資源（favicon、index.html）
├── src/                   # 前端主要程式碼
│   ├── components/        # React 元件
│   ├── context/           # 全域狀態管理
│   ├── assets/            # 圖片、音效等資源
│   ├── utils/             # 工具函式
│   ├── App.jsx            # 主要 App 入口
│   └── index.js           # React 進入點
├── package.json           # 相依套件與指令
└── README.md              # 專案說明
```

## 開發建議流程
1. 建議每新增一個主要功能，建立新 branch，例如：
   ```sh
   git checkout -b feature/board-ui
   ```
2. 完成功能後再合併回主分支，確保專案品質與可維護性。

## 進階建議
- 可加入 PWA 支援，讓玩家可安裝到手機桌面
- 支援多語系（如繁體中文、英文）
- 可考慮加入本地儲存（localStorage）保存遊戲進度

## 參考資源
- [React 官方文件](https://react.dev/)
- [GitHub Pages 部署指南](https://docs.github.com/zh/pages/getting-started-with-github-pages)
- [Framer Motion 動畫函式庫](https://www.framer.com/motion/)

---

如需原理圖、程式碼片段或有其他想法，歡迎隨時提出！
