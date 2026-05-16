import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  suffix?: string;
}

export interface OrbitalTimelineProps {
  timelineData: TimelineItem[];
}

// ========== 作品数据（每个节点至少3-6个作品，确保星星数量） ==========
// 注意：id: 0 是核心节点，用于展示你的价值观
const worksData: Record<number, { name: string; detail?: string }[]> = {
  0: [
    { name: "自我成长" },
    { name: "终身学习" },
    { name: "第一性原理" },
    { name: "长期主义" },
    { name: "价值创造" },
    { name: "永远积极乐观" },
    { name: "保持好奇" },
  ],
  1: [
    { name: "《清醒地活》" },
    { name: "《臣服实验》" },
    { name: "《高效能人士的七个习惯》" },
    { name: "《薛兆丰经济学讲义》" },
    { name: "《开口之后》" },
    { name: "《金字塔原理》" },
    { name: "《刻意练习》" },
    { name: "《我与地坛》" },
    { name: "《毛泽东传》" },
    { name: "《红与黑》" },
    { name: "《古文观止》" },
    { name: "《贫穷的本质》" },
    { name: "《平凡的世界》" },
    { name: "《时间机器》" },
    { name: "《钢铁是怎样练成的》" },
    { name: "《乡土中国》" },
    { name: "《人生复本》" },
    { name: "《古文释义》" },
    { name: "《哲学家们都干了些什么》" },
    { name: "《远见》" },
    { name: "《圆圈正义》" },
    { name: "《原子习惯》" },
    { name: "《向上生长》" },
    { name: "《国富论》" },
    { name: "《拆掉思维里的墙》" },
    { name: "《李氏》" },
    
  ],
  2: [
    { name: "深度学习 · YOLOv8" },
    { name: "RPA流程自动化" },
    { name: "大模型本地部署" },
    { name: "模型RAG技术" },
    { name: "Vibe coding" },
    { name: "个人知识库搭建" },
    { name: "网站设计与开发" },
    { name: "API接口开发" },
    { name: "短视频剪辑" },
    { name: "新媒体运营" },
   
  ],
  3: [
    { name: "用友软件", detail: "人力实习生 | 2025.09-2026.01 · 长沙\n参与上市公司DHR系统从0到1实施，负责薪酬、绩效、招聘、培训4大模块流程梳理与系统配置，对接6部门30+职员，编写25页系统操作手册" },
    { name: "卫莎网络", detail: "剪辑实习生 | 2025.03-2025.06\n独立筛选80+素材，使用PR/剪映完成二创配音与字幕添加，周产4-8条成片，累计交付80+条零延期归档" },
    { name: "熙硅网络", detail: "小红书运营实习生 | 2024.12-2025.03\n从0到1搭建账号，完成20+竞品调研与差异化定位，利用AI工具月产56篇原创笔记，搭建粉丝社群并做到100%回复" },
    { name: "军训教官", detail: "军训教官 | 2024年\n担任2024年军训教官，组织训练与团队管理，荣获「优秀军训教官」称号" },
    { name: "三翼青媒", detail: "融媒体中心干事 | 2023-2024\n负责校园官方账号日常运营与内容策划，推动日浏览量提升18%，单篇点赞量增加30%" },
    { name: "青苗计划", detail: "深度学习课题研究 | 2023-2024\n在导师指导下系统学习深度学习与神经网络，参与课题研究，夯实数据分析与科研实践能力" },
  ],
  4: [
    { name: "能量管理", detail: "能量就是我最宝贵的资产，对一切耗散能量的事情 say no" },
    { name: "勇敢试错", detail: "只要失败的后果可以承担，就勇敢去做。失败就进步，成功就庆祝" },
    { name: "人际交往", detail: "看人之短，天下无一人可交；看人之长，天下人皆为我师。多说事实，少说评价；善意假设，你怎么对别人，别人就怎么对你。" },
    { name: "关于努力", detail: "不要高估一年的努力，也不要低估五年的努力。功夫没有白费，它只是积蓄起来了，很久以后才会显露全部价值" },
    { name: "人生选择", detail: "世之奇伟、瑰怪，非常之观，常在于险远，而人之所罕至焉。尽吾志也而不能至者，可以无悔矣。" },
  ],
  5: [
    { name: "个人工作流搭建" },
    { name: "暑期实习" },
    { name: "AI + HR 应用探索" },
    { name: "自媒体尝试" },
    { name: "vibe coding持续探索" },
    { name: "学习，成长，拓展能力边界" },
  ],
};

// 伪随机工具
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// ---- 星云背景 ----
const NebulaBackground = () => (
  <div className="absolute inset-0 overflow-hidden opacity-30">
    <motion.div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-800/20 via-transparent to-transparent"
      animate={{ x: ["-5%", "5%", "-5%"], y: ["-3%", "3%", "-3%"] }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }} />
    <motion.div className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent"
      animate={{ x: ["5%", "-5%", "5%"], y: ["3%", "-3%", "3%"] }}
      transition={{ repeat: Infinity, duration: 25, ease: "linear" }} />
    <motion.div className="absolute top-0 left-1/4 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-700/10 via-transparent to-transparent"
      animate={{ x: ["-3%", "3%", "-3%"], y: ["4%", "-4%", "4%"] }}
      transition={{ repeat: Infinity, duration: 18, ease: "linear" }} />
  </div>
);

// ---- 装饰小星星（纯氛围） ----
const DecorativeStar = ({ index }: { index: number }) => {
  const seed = index * 113;
  const left = seededRandom(seed + 1) * 100;
  const top = seededRandom(seed + 2) * 100;
  const size = 1 + seededRandom(seed + 3) * 1.5;
  const delay = seededRandom(seed + 4) * 5;

  return (
    <motion.div
      className="absolute rounded-full bg-white/30"
      style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
      animate={{ opacity: [0.2, 0.6, 0.2] }}
      transition={{
        repeat: Infinity,
        duration: 3 + seededRandom(seed + 5) * 4,
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
};

// ---- 作品星星（有名字，从中心爆发） ----
const WorkStar = ({
  work,
  index,
  total,
  active,
  onHoverEnter,
  onHoverLeave,
  angleRange,
}: {
  work: { name: string; detail?: string };
  index: number;
  total: number;
  active: boolean;
  onHoverEnter?: (w: { name: string; detail?: string }) => void;
  onHoverLeave?: () => void;
  angleRange?: { start: number; end: number };
}) => {
  const controls = useAnimation();

  const arcRange = angleRange || { start: 0, end: Math.PI * 2 };
  const arcSpan = arcRange.end - arcRange.start;
  const baseAngle = arcRange.start + (index / Math.max(total, 1)) * arcSpan;
  const angleJitter = seededRandom(index * 73) * 0.3 - 0.15;
  const angle = baseAngle + angleJitter;
  
  const maxRadius = 280;
  const radius = 80 + seededRandom(index * 91) * 200; // 80~280px
  const targetX = Math.cos(angle) * radius;
  const targetY = Math.sin(angle) * radius;

  const size = 3 + seededRandom(index * 53) * 5; // 3~8px

  // 太靠上的星星翻转提示方向，避免盖住顶部标题
  const isInTopHalf = targetY < 20;

  const floatRange = 15 + seededRandom(index * 67) * 25; // 15~40px
  const floatSpeed = 10 + seededRandom(index * 79) * 12;
  const pulseDuration = 2 + seededRandom(index * 59) * 2; // 2~4s

  const escapeDuration = 0.5 + (radius / maxRadius) * 0.7;
  const escapeDelay = (radius / 280) * 0.5 + seededRandom(index * 37) * 0.2;

  useEffect(() => {
    if (active) {
      const clusterJitter = seededRandom(index * 17) * 6 - 3;
      controls.set({ x: clusterJitter, y: clusterJitter, scale: 0, opacity: 0 });
      setTimeout(() => {
        controls.start({
          x: targetX,
          y: targetY,
          scale: [0, 1.5, 1],
          opacity: 1,
          transition: {
            duration: escapeDuration,
            ease: [0.25, 0, 0, 1],
          },
        }).then(() => {
          controls.start({
            x: [
              targetX,
              targetX + (Math.random() - 0.5) * floatRange,
              targetX,
            ],
            y: [
              targetY,
              targetY + (Math.random() - 0.5) * floatRange,
              targetY,
            ],
            transition: {
              x: { repeat: Infinity, duration: floatSpeed, ease: "easeInOut", delay: Math.random() * 3 },
              y: { repeat: Infinity, duration: floatSpeed, ease: "easeInOut", delay: Math.random() * 3 + 1 },
            },
          });
        });
      }, escapeDelay * 1000);
    } else {
      controls.set({ x: 0, y: 0, scale: 0, opacity: 0 });
    }
  }, [active, controls, index, targetX, targetY, floatRange, floatSpeed, escapeDelay, escapeDuration]);

  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{ left: "50%", top: "50%" }}
      animate={controls}
      whileHover={{ scale: 2.5, opacity: 1, transition: { duration: 0.2 } }}
      onMouseEnter={() => onHoverEnter?.(work)}
      onMouseLeave={() => onHoverLeave?.()}
    >
      {/* 光晕 */}
      <div
        className="absolute rounded-full blur-sm bg-white/15"
        style={{
          width: size * 5,
          height: size * 5,
          top: -size * 2,
          left: -size * 2,
        }}
      />
      {/* 核心 */}
      <motion.div
        className="rounded-full bg-white"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 ${size * 2}px rgba(255,255,255,0.9)`,
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{
          repeat: Infinity,
          duration: pulseDuration,
          ease: "easeInOut",
        }}
      />
      {/* 名称浮泡 — 靠上的星星翻转到底部，避免盖住顶部标题 */}
      <div className={`absolute left-1/2 -translate-x-1/2 ${isInTopHalf ? 'top-full mt-1.5' : 'bottom-full mb-1.5'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50`}>
        <span className="inline-block text-xs text-white whitespace-nowrap font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
          {work.name}
        </span>
      </div>
    </motion.div>
  );
};

// ========== 主组件 ==========
export function OrbitalTimeline({ timelineData }: OrbitalTimelineProps) {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredWork, setHoveredWork] = useState<{ name: string; detail?: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 找出核心节点（id: 0）和其他节点
  const coreItem = timelineData.find((item) => item.id === 0);
  const orbitItems = timelineData.filter((item) => item.id !== 0);

  const selectedItem = timelineData.find((item) => item.id === selectedItemId);
  const currentWorks = selectedItemId !== null ? worksData[selectedItemId] || [] : [];
  const isCoreSelected = selectedItemId === 0;

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (e.currentTarget === target || target.dataset.orbitBg === "true" || target.closest('[data-orbit-bg="true"]')) {
      setSelectedItemId(null);
      setAutoRotate(true);
      setHoveredWork(null);
    }
  }, []);

  const handleNodeClick = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItemId(id);
    setSelectionVersion(v => v + 1);
    setAutoRotate(false);
  }, []);

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => setRotationAngle((prev) => (prev + 0.3) % 360), 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const getNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 140;
    const radian = (angle * Math.PI) / 180;
    return { x: radius * Math.cos(radian), y: radius * Math.sin(radian) };
  };

  const DECORATIVE_COUNT = 60;

  return (
    <div ref={containerRef} onClick={handleContainerClick}
      className="w-full h-[480px] md:h-[540px] flex items-stretch bg-black overflow-hidden">

      {/* 左侧轨道 */}
      <div className="relative w-1/2 flex items-center justify-center overflow-hidden" data-orbit-bg="true">
        <div className="absolute w-72 h-72 rounded-full border border-white/10" data-orbit-bg="true"></div>

        {/* 核心节点（id: 0） */}
        {coreItem && (
          <motion.div
            className={`absolute w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 flex items-center justify-center z-10 cursor-pointer
              ${isCoreSelected ? "scale-110 shadow-xl shadow-blue-500/50 ring-2 ring-white" : "animate-pulse"}
            `}
            onClick={(e) => handleNodeClick(0, e)}
          >
            <div className={`absolute w-14 h-14 rounded-full border border-white/20 ${isCoreSelected ? "animate-ping" : ""} opacity-70`}></div>
            <div className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-md"></div>
          </motion.div>
        )}

        {/* 轨道节点（id > 0） */}
        <AnimatePresence>
          {orbitItems.map((item, index) => {
            const isSelected = selectedItemId === item.id;
            const position = getNodePosition(index, orbitItems.length);
            const Icon = item.icon;

            return (
              <motion.div key={item.id} className="absolute cursor-pointer"
                animate={{
                  x: isSelected ? 0 : position.x,
                  y: isSelected ? 0 : position.y,
                  scale: isSelected ? 2.5 : 1,
                  opacity: selectedItemId && !isSelected && selectedItemId !== 0 ? 0.2 : 1,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                onClick={(e) => handleNodeClick(item.id, e)}>
                <div className={`absolute rounded-full -inset-1 ${isSelected ? "animate-pulse" : ""}`}
                  style={{
                    background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                    width: `${item.energy * 0.3 + 30}px`,
                    height: `${item.energy * 0.3 + 30}px`,
                    left: `-${(item.energy * 0.3 + 30 - 40) / 2}px`,
                    top: `-${(item.energy * 0.3 + 30 - 40) / 2}px`,
                  }} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    isSelected ? "bg-white text-black border-white shadow-lg shadow-white/30" : "bg-black text-white border-white/40"
                  }`}>
                  <Icon size={16} />
                </div>
                <div className={`absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300 ${
                    isSelected ? "text-white scale-110" : "text-white/70"
                  }`}>
                  {item.title}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 右侧星海 */}
      <div className="relative w-1/2 bg-black overflow-hidden">
        <NebulaBackground />
        <div className="absolute inset-0">
          {Array.from({ length: DECORATIVE_COUNT }).map((_, i) => (
            <DecorativeStar key={`deco-${i}`} index={i} />
          ))}
        </div>

        <AnimatePresence>
          {selectedItem && (
            <motion.div key={`${selectedItem.id}-${selectionVersion}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
              className="absolute inset-0 z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-purple-900/20" />
              <div className="absolute inset-0">
                {selectedItemId === 3 ? (
                  <>
                    {/* 实习经历 — 左半区 */}
                    {currentWorks.slice(0, 3).map((work, idx) => (
                      <WorkStar key={`intern-${idx}`} work={work} index={idx} total={3} active={true}
                        angleRange={{ start: Math.PI * 0.75, end: Math.PI * 1.25 }}
                        onHoverEnter={(w) => setHoveredWork(w)}
                        onHoverLeave={() => setHoveredWork(null)} />
                    ))}
                    {/* 校内经历 — 右半区 */}
                    {currentWorks.slice(3).map((work, idx) => (
                      <WorkStar key={`campus-${idx}`} work={work} index={idx} total={currentWorks.length - 3} active={true}
                        angleRange={{ start: -Math.PI * 0.25, end: Math.PI * 0.25 }}
                        onHoverEnter={(w) => setHoveredWork(w)}
                        onHoverLeave={() => setHoveredWork(null)} />
                    ))}
                  </>
                ) : (
                  currentWorks.map((work, idx) => (
                    <WorkStar key={idx} work={work} index={idx} total={currentWorks.length} active={true}
                      onHoverEnter={(w) => setHoveredWork(w)}
                      onHoverLeave={() => setHoveredWork(null)} />
                  ))
                )}
              </div>
              <div className="absolute top-8 inset-x-0 text-center pointer-events-none">
                <motion.span initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-white/80 text-lg font-light tracking-[0.3em] uppercase">
                  {selectedItem.title} · {selectedItem.suffix || ""}
                </motion.span>
              </div>
              {/* id:3 分隔线 + 区域标签 */}
              {selectedItemId === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-24 bottom-24 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
                  <div className="absolute top-20 left-1/4 -translate-x-1/2 text-white/40 text-xs tracking-widest">实习</div>
                  <div className="absolute top-20 right-1/4 translate-x-1/2 text-white/40 text-xs tracking-widest">校内</div>
                </motion.div>
              )}
              {/* 底部信息坞 */}
              <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none px-6">
                <AnimatePresence mode="wait">
                  {hoveredWork?.detail ? (
                    <motion.div
                      key="detail-panel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="text-white/90 text-sm font-medium tracking-wide">{hoveredWork.name}</p>
                      <p className="text-white/60 text-xs mt-1.5 leading-relaxed max-w-[280px] mx-auto">{hoveredWork.detail}</p>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      className="text-white/40 text-xs"
                    >
                      悬停星星查看详情
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedItem && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <p className="text-white/30 text-lg">点击轨道上的节点探索星海</p>
          </div>
        )}
      </div>
    </div>
  );
}