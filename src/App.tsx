"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { OrbitalTimeline } from "@/components/OrbitalTimeline";
import { CinematicFooter } from "@/components/ui/motion-footer";


import {
  Menu, X, Mail, MapPin, Sparkles, Zap,
  Code, Palette, Rocket, Sun, Moon,
  AlertCircle, BookOpen, Brain,
  GraduationCap, Headphones, MessageSquare
} from "lucide-react";

// ========== 社交图标 ==========
const IconGitHub = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.92 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

// ========== Theme Hook ==========
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return { theme, toggleTheme: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) };
}

// ========== Animation Variants ==========
const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } } };

// ========== Project Data ==========
interface Project {
  id: number; icon: React.ReactNode; title: string; tagline: string;
  description: string; image: string; tags: string[]; details: string[];
  role: string; timeline: string; highlights: string[];
}
const projects: Project[] = [
  {
    id: 1, icon: <Palette className="h-10 w-10 text-primary" />,
    title: "个人网站", tagline: "从零到一的 React 全栈实践",
    description: "使用 React 19 + TypeScript + Framer Motion 从零构建的个人品牌网站。通过 Vibe Coding 方式与 AI 协作完成，涵盖暗色主题、动画系统、响应式设计等完整功能。",
    image: "/images/个人网站.png", tags: ["React 19", "TypeScript", "Tailwind CSS v4", "Framer Motion"],
    details: ["从零配置 Vite + React 19 开发环境", "实现暗色/亮色主题切换系统", "Framer Motion 动效与滚动驱动动画", "部署至 Netlify 自动 CI/CD"],
    role: "独立全栈开发", timeline: "2025.05", highlights: ["主题切换系统", "打字动画效果", "响应式布局"],
  },
  {
    id: 2, icon: <Code className="h-10 w-10 text-primary" />,
    title: "全自动求职助手（Demo）", tagline: "RPA 驱动的智能求职工具",
    description: "基于 RPA 技术开发的自动化求职系统，能够自动扫描多平台招聘信息、解析岗位 JD、匹配个人技能并完成简历优化与投递。探索 AI + Automation 在实际场景中的应用。",
    image: "/images/rpa.png", tags: ["RPA", "Python", "自动化", "Web Scraping"],
    details: ["多平台招聘信息聚合与解析", "基于 JD 的智能简历匹配优化", "定时批量自动投递", "求职进度可视化追踪"],
    role: "独立开发", timeline: "2025.04", highlights: ["RPA 自动流程", "JD 智能解析", "批量投递"],
  },
  {
    id: 3, icon: <Rocket className="h-10 w-10 text-primary" />,
    title: "水稻病虫害视觉识别", tagline: "深度学习驱动的农业 AI 应用",
    description: "基于 YOLOv8 和 Keras 的水稻病虫害检测系统，能够识别 5 种常见病害（白叶枯病、稻瘟病、稻曲病等）。从数据预处理到模型训练部署完整的深度学习 pipeline。",
    image: "/images/水稻病虫害视觉识别脚本.jpg", tags: ["YOLOv8", "Keras", "Python", "OpenCV"],
    details: ["5 类水稻病害的精准分类与检测", "YOLOv8 目标检测模型训练与优化", "完整的数据预处理与增强 pipeline", "端到端推理脚本与可视化输出"],
    role: "模型训练与系统开发", timeline: "2025.03", highlights: ["YOLOv8 检测", "多分类识别", "端到端 Pipeline"],
  },
  {
    id: 4, icon: <Headphones className="h-10 w-10 text-primary" />,
    title: "Voice AI 语音助手", tagline: "语音交互 + AI 对话的智能助手",
    description: "AI 语音助手应用，支持语音输入（STT）+ AI 对话 + 语音播报（TTS），提供类通话和文字对话两种交互模式。接入 DeepSeek API 做容错理解，PWA 可安装到桌面。",
    image: "/images/voice-ai.png", tags: ["React 19", "Web Speech API", "Fish Audio TTS", "DeepSeek API", "PWA"],
    details: ["语音输入实时转文字，显示中间识别结果", "接入 DeepSeek AI 对话，容错理解同音错字", "TTS 语音合成播报回复，可选静音", "移动端类通话界面 + 桌面聊天视图", "PWA 可添加到主屏幕独立运行"],
    role: "独立全栈开发", timeline: "2026.05", highlights: ["语音输入 STT", "AI 对话", "TTS 语音播报"],
  },
  {
    id: 5, icon: <MessageSquare className="h-10 w-10 text-primary" />,
    title: "CC Chat", tagline: "自定义 Claude Code 聊天前端",
    description: "自定义 Claude Code 聊天前端，接入 Anthropic API / DeepSeek 兼容端点。支持多会话管理、流式输出、本地 skill/command 生态集成，Express 5 后端驱动。",
    image: "/images/cc-chat.png", tags: ["React 19", "Express 5", "Anthropic SDK", "Tailwind CSS", "TypeScript"],
    details: ["多会话管理，新建/删除/重命名会话", "流式实时输出 AI 回复", "读取本地 .claude/ 下的 skill/command/agent 配置", "设置面板：API Key、Base URL、模型切换", "深色/浅色主题跟随系统"],
    role: "独立全栈开发", timeline: "2026.05", highlights: ["多会话管理", "流式输出", "Claude 生态集成"],
  },
];

// ========== Project Modal ==========
const ProjectModal = ({ p, onClose }: { p: Project; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border bg-background p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-1 hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20">{p.icon}</div>
        <div><h3 className="text-xl font-bold">{p.title}</h3><p className="text-sm text-muted-foreground">{p.tagline}</p></div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {p.tags.map((t, i) => <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">{t}</span>)}
      </div>
      <p className="text-sm mb-4 leading-relaxed">{p.description}</p>
      {p.image && (
        <div className="relative rounded-2xl overflow-hidden mb-4">
          <img src={p.image} alt={p.title} className="w-full h-48 object-cover" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="rounded-xl bg-muted/50 p-3"><span className="text-muted-foreground">角色</span><p className="font-medium">{p.role}</p></div>
        <div className="rounded-xl bg-muted/50 p-3"><span className="text-muted-foreground">时间</span><p className="font-medium">{p.timeline}</p></div>
      </div>
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium">核心功能</p>
        {p.highlights.map((h, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{h}</motion.div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// ========== Main Component ==========
function PersonalWebsite() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Image errors + modal
  const [imgErr, setImgErr] = useState<Record<number, boolean>>({});
  const [selProj, setSelProj] = useState<Project | null>(null);
  const toggleMenu = () => setIsMenuOpen(o => !o);

  const timelineData = [
    { id: 0, title: "核心价值", suffix: "内核驱动力", date: "Always", content: "自我成长、终身学习、第一性原理、长期主义、价值创造——这些信念贯穿我的每一个选择与行动。", category: "核心", icon: Zap, relatedIds: [1, 2, 3, 4, 5], status: "completed" as const, energy: 100 },
    { id: 1, title: "阅读与藏书", suffix: "思想基石", date: "2022", content: "从心智成长到经济学，从逻辑思维到哲学思辨——在阅读中构建认知框架，寻找行动的底层逻辑。", category: "books", icon: BookOpen, relatedIds: [2], status: "completed" as const, energy: 100 },
    { id: 2, title: "涉猎的领域", suffix: "技能版图", date: "2021", content: "从深度学习到RPA自动化，从视频剪辑到新媒体运营，在多个领域间自由穿梭，保持对世界的好奇与探索欲。", category: "Development", icon: Code, relatedIds: [1, 3], status: "completed" as const, energy: 95 },
    { id: 3, title: "实习与校园经历", suffix: "经验积累", date: "2024-2026", content: "三段实习横跨HR系统实施、短视频创作、新媒体运营；校园里担任军训教官、参与融媒体中心与青苗计划科研训练——在多元角色中构建能力矩阵。", category: "Career", icon: GraduationCap, relatedIds: [2, 4], status: "in-progress" as const, energy: 80 },
    { id: 4, title: "思维沉淀", suffix: "认知结晶", date: "2025", content: "在实习与项目中持续反思，将零散经验提炼为可迁移的思维框架与工作方法。", category: "Thinking", icon: Brain, relatedIds: [3, 5], status: "in-progress" as const, energy: 70 },
    { id: 5, title: "探索计划", suffix: "未来旅途", date: "2026", content: "聚焦HR数字化与AI应用方向，寻求长沙地区实习机会，探索技术与人结合创造价值的更多可能。", category: "Future", icon: Sparkles, relatedIds: [4], status: "pending" as const, energy: 50 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* ========== HEADER ========== */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-50 border-b border-transparent">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 5, scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="font-bold text-xl">万宏伟</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#hero" className="text-sm font-medium transition-colors hover:text-primary">首页</a>
            <a href="#features" className="text-sm font-medium transition-colors hover:text-primary">项目</a>
            <a href="#journey" className="text-sm font-medium transition-colors hover:text-primary">成长</a>
            <a href="#contact" className="text-sm font-medium transition-colors hover:text-primary">联系</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.05, rotate: theme === 'dark' ? -15 : 15 }} whileTap={{ scale: 0.9 }}
              onClick={toggleTheme} className="rounded-full border p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="切换主题">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.open('/万宏伟-人力资源.pdf', '_blank')}>下载简历</Button>
          </div>
          <button className="flex md:hidden" onClick={toggleMenu}><Menu className="h-6 w-6" /><span className="sr-only">Toggle menu</span></button>
        </div>
      </motion.header>

      {/* ========== MOBILE MENU ========== */}
      <AnimatePresence>{isMenuOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary-foreground" /></div><span className="font-bold text-xl">万宏伟</span></div>
            <button onClick={toggleMenu}><X className="h-6 w-6" /></button>
          </div>
          <motion.nav variants={stagger} initial="hidden" animate="visible" className="container grid gap-3 pb-8 pt-6">
            {[{ n: "首页", h: "#hero" }, { n: "项目", h: "#features" }, { n: "成长", h: "#journey" }, { n: "联系", h: "#contact" }].map((item, i) => (
              <motion.div key={i} variants={itemIn}><a href={item.h} className="flex items-center justify-between rounded-full px-4 py-3 text-lg font-medium hover:bg-accent" onClick={toggleMenu}>{item.n}</a></motion.div>
            ))}
            <motion.div variants={itemIn} className="px-4 pt-4">
              <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{theme === 'dark' ? '切换亮色' : '切换暗色'}
              </button>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}</AnimatePresence>

      <main className="flex-1">
        {/* ========== SCROLL DOWN COVER ========== */}
        <section className="relative z-20 w-full min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />
          
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-neutral-400 mb-8 uppercase text-center px-4">
            Scroll down to reveal
          </h1>
          
          <div className="w-[1px] h-32 bg-gradient-to-b from-neutral-400 to-transparent" />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.3em] text-neutral-500 uppercase">Scroll</span>
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* ========== CINEMATIC FOOTER ========== */}
        <CinematicFooter />

        {/* ========== 过渡分隔 ========== */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 via-secondary/30 to-transparent" />
        
        <section id="features" className="w-full py-16 md:py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-14">
              <motion.div variants={scaleIn} className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/60 backdrop-blur-md px-4 py-1.5 text-sm shadow-sm">
                <Rocket className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground font-medium">精选项目</span>
              </motion.div>
              <motion.h2 variants={itemIn} className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">项目作品</motion.h2>
              <motion.p variants={itemIn} className="text-muted-foreground/70 max-w-[500px]">点击卡片查看完整项目介绍</motion.p>
            </div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map(p => (
                <motion.div key={p.id} variants={itemIn} whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-3xl border p-6 shadow-sm hover:shadow-xl hover:border-primary/30 bg-background/80 cursor-pointer transition-all duration-300"
                  onClick={() => setSelProj(p)}>
                  {p.image && !imgErr[p.id] ? (
                    <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-3xl">
                      <img src={p.image} alt={p.title} className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgErr(prev => ({ ...prev, [p.id]: true }))} />
                    </div>
                  ) : (
                    <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-3xl"><div className="w-full h-44 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center"><AlertCircle className="h-8 w-8 text-muted-foreground/40" /></div></div>
                  )}
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-all duration-300" />
                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10">{p.icon}</div>
                      <span className="text-[10px] text-muted-foreground">{p.timeline}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{p.title}</h3>
                      <p className="text-xs text-muted-foreground">{p.tagline}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.tags.slice(0, 3).map((t, i) => <span key={i} className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">{t}</span>)}
                      {p.tags.length > 3 && <span className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">+{p.tags.length - 3}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ========== PROJECT MODAL ========== */}
        <AnimatePresence>{selProj && <ProjectModal p={selProj} onClose={() => setSelProj(null)} />}</AnimatePresence>

        {/* 渐变分隔线 */}
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

        {/* ========== STAR MAP ========== */}
        <section id="journey" className="w-full py-16 md:py-24 bg-black">
          <div className="container px-4 md:px-6 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center space-y-3">
              <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">人生如逆旅，我亦是行人</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">成长星图</h2>
              <p className="text-white/60 max-w-[600px]">点击轨道节点，探索我的知识领域、阅读足迹与成长历程</p>
            </motion.div>
          </div>
          <OrbitalTimeline timelineData={timelineData} />
        </section>

        {/* 渐变分隔线 */}
        {/* ========== CONTACT ========== */}
        <section id="contact" className="w-full py-16 md:py-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-sm"><Mail className="h-3 w-3" />联系方式</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">期待与你的对话</h2>
              <p className="text-muted-foreground md:text-lg">无论是实习机会、项目合作，还是单纯的技术交流，都欢迎联系我</p>
              <div className="mt-6 space-y-4">
                {[
                  { icon: <MapPin className="h-5 w-5 text-primary" />, title: "位置", val: "中国 · 湘潭" },
                  { icon: <Mail className="h-5 w-5 text-primary" />, title: "邮箱", val: "diki3153744382@163.com" },
                  { icon: <GraduationCap className="h-5 w-5 text-primary" />, title: "状态", val: "湘潭大学 · 人力资源管理 · 寻求 2026 暑期实习" },
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ x: 5 }} className="flex items-start gap-3">
                    <div className="rounded-full bg-muted p-2">{item.icon}</div>
                    <div><h3 className="font-medium text-sm">{item.title}</h3><p className="text-sm text-muted-foreground">{item.val}</p></div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <motion.a whileHover={{ y: -3, scale: 1.1 }} href="#" className="rounded-full border p-2.5 text-muted-foreground hover:text-foreground hover:border-primary transition-colors" aria-label="GitHub"><IconGitHub className="h-5 w-5" /></motion.a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="rounded-3xl border bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm flex flex-col items-center text-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 mb-4">
                <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">下载我的简历</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">了解更多关于我的教育背景、实习经历与项目经验</p>
              <Button className="rounded-full w-full mb-3" onClick={() => window.open('/万宏伟-人力资源.pdf', '_blank')}>
                查看简历 PDF
              </Button>
              <p className="text-xs text-muted-foreground">
                或直接发送邮件至 <a href="mailto:diki3153744382@163.com" className="text-primary hover:underline">diki3153744382@163.com</a>
              </p>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="w-full border-t py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} 万宏伟
      </footer>
    </div>
  );
}
export default PersonalWebsite;