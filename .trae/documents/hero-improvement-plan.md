# Hero 区域改进计划

## 问题诊断

### 1. "Scroll down to reveal" 不是一页屏
- 当前 `min-h-[60vh]` 只有 60% 视口高度
- 需要改为 `min-h-screen`（100vh），让提示区域占满整屏

### 2. 动画卡顿原因
- **GSAP ScrollTrigger scrub**：`scrub: 1.5` 在滚动时持续触发 GSAP 计算，消耗主线程
- **Particles 组件**：30 个 DOM 粒子 + 独立 CSS 动画，频繁触发重排
- **鼠标跟随极光**：`mousemove` 事件触发 `setState`，导致 React 组件频繁重渲染
- **backdrop-filter: blur(20px)**：大面积固定定位元素上的高 blur 值消耗 GPU
- **color-mix(oklch)**：多个 CSS 变量使用 oklch 颜色空间计算，增加样式计算开销

### 3. 风格不统一原因
- Hero 使用 GSAP + Plus Jakarta Sans 字体 + 玻璃态 + 全屏沉浸式
- 项目部分使用 Framer Motion + 默认字体 + 标准卡片网格
- 两者之间没有过渡元素，切换生硬

---

## 改进步骤

### Step 1: 修复 "Scroll down to reveal" 为一页屏
**涉及文件：** `src/App.tsx`

- 将 `min-h-[60vh]` 改为 `min-h-screen`
- 添加滚动指示箭头动画，引导用户向下滚动
- 底部添加渐变淡出效果，自然过渡到 Hero

### Step 2: 优化动画性能
**涉及文件：** `src/components/ui/motion-footer.tsx`

- **粒子优化**：从 30 个减少到 12 个，使用 CSS `@keyframes` 替代 JS 控制
- **鼠标跟随节流**：使用 `requestAnimationFrame` 节流 mousemove 事件，避免频繁 setState
- **降低 blur 值**：`blur(100px)` → `blur(60px)`，`blur(80px)` → `blur(40px)`
- **简化 GSAP 动画**：
  - 移除 `scrub` 实时跟随，改用 `onEnter` 一次性触发 + CSS transition
  - 保留磁性按钮的 GSAP 动画（交互必需），移除滚动驱动的 GSAP scrub
- **添加 `will-change`**：对固定定位元素添加 `will-change: transform` 提示浏览器优化

### Step 3: 统一风格过渡
**涉及文件：** `src/App.tsx`、`src/components/ui/motion-footer.tsx`

- **添加过渡桥接区**：在 Hero 底部和项目部分之间添加一个渐变过渡区域
  - 从 Hero 的暗色/沉浸式渐变到项目部分的亮色/卡片式
  - 使用渐变遮罩 + 玻璃态分隔条
- **统一项目部分标题样式**：
  - 将项目部分的 "精选项目" 标签改为 Hero 同款玻璃态 pill 样式
  - 项目卡片添加微光效（subtle glow），与 Hero 的极光风格呼应
- **Hero 底部添加进入提示**：在 Hero 底部添加 "↓ 探索我的项目" 文字提示

### Step 4: 构建验证
- 运行 `npm run build` 确保无类型错误
- 启动 dev server 预览效果

---

## 文件修改清单

| 文件 | 修改内容 |
|------|---------|
| `src/App.tsx` | ① Scroll down 区域改为 `min-h-screen` ② 添加过渡桥接区 ③ 统一项目部分标题样式 |
| `src/components/ui/motion-footer.tsx` | ① 粒子从 30→12 ② 鼠标跟随 RAF 节流 ③ 降低 blur 值 ④ 简化 GSAP 动画 ⑤ 添加 will-change |