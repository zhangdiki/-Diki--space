# Spiral Animation 替换计划

## 目标
将当前网站的 Hero 区域（Scroll down to reveal + CinematicFooter）替换为 Spiral Animation 全屏 Canvas 动画。

## 效果参考
桌面上已有完整实现：
- 纯 JS 版本：`C:\Users\HASEE\Desktop\index.html` (localhost:3000)
- React 组件版本：`C:\Users\HASEE\Desktop\components\ui\spiral-animation.tsx`
- 使用方式：`C:\Users\HASEE\Desktop\components\ui\demo.tsx`

## 实现步骤

### Step 1: 创建 SpiralAnimation 组件
**位置**: `src/components/SpiralAnimation.tsx`

基于桌面 `spiral-animation.tsx` 创建，但做以下改进：
- **修复 Bug**：`setupRandomGenerator()` 中重复调用 `createStars()` 的问题
- **替换 GSAP**：用 `requestAnimationFrame` 替代 GSAP timeline（更轻量、更流畅）
- **保留完整参数**：5000 星星、螺旋路径、拖尾效果、弹性动画等
- **Enter 按钮**：2 秒后淡入，垂直居中

### Step 2: 更新 App.tsx
改动：
1. 删除 `import { CinematicFooter } from "@/components/ui/motion-footer"`
2. 删除 Scroll down to reveal 全屏区块 (L182-198)
3. 删除 `<CinematicFooter />` (L201)
4. 删除过渡分隔线 (L203-206)
5. 在导航栏下方添加 `<SpiralAnimation />`

### Step 3: 页面交互逻辑
- **初始加载**：SpiralAnimation 全屏播放，body `overflow: hidden`
- **2 秒后**："Enter" 按钮淡入（带 pulse 动画）
- **点击 Enter**：恢复滚动，平滑滚动到 `#features`（项目部分）
- **滚动离开后**：SpiralAnimation 固定在背景中或保持动画（与 demo 一致）

### Step 4: 清理
- 删除 `src/components/ui/motion-footer.tsx`（不再使用）
- 删除所有相关 CSS 样式

## 文件清单
| 文件 | 操作 |
|------|------|
| `src/components/SpiralAnimation.tsx` | 新建 |
| `src/App.tsx` | 修改 |
| `src/components/ui/motion-footer.tsx` | 删除 |

## 验证
- `npm run build` 通过
- http://localhost:5173/ 正常显示