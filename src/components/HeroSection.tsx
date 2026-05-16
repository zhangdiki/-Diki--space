"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { ArrowRight, Download, ChevronDown, Heart } from "lucide-react";
import type { ElementType, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.hero-wrapper {
  -webkit-font-smoothing: antialiased;
  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes hero-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}
@keyframes hero-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes hero-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-hero-breathe {
  animation: hero-breathe 8s ease-in-out infinite alternate;
}
.animate-hero-scroll-marquee {
  animation: hero-scroll-marquee 40s linear infinite;
}
.animate-hero-heartbeat {
  animation: hero-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.hero-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.hero-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--primary) 15%, transparent) 0%,
    color-mix(in oklch, var(--secondary) 15%, transparent) 40%,
    transparent 70%
  );
}

.hero-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  border-radius: 50px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

.hero-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 2%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 4%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.hero-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}
`;

// ========== MagneticButton ==========
type MagneticButtonProps = {
  as?: ElementType;
  className?: string;
  children?: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>;

const MagneticButton: React.FC<MagneticButtonProps> = ({
  className,
  children,
  as: Component = "button" as ElementType,
  ...props
}) => {
  const localRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const element = localRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const h = rect.width / 2;
        const w = rect.height / 2;
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - w;

        gsap.to(element, {
          x: x * 0.4,
          y: y * 0.4,
          rotationX: -y * 0.15,
          rotationY: x * 0.15,
          scale: 1.05,
          ease: "power2.out",
          duration: 0.4,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          ease: "elastic.out(1, 0.3)",
          duration: 1.2,
        });
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, element);

    return () => ctx.revert();
  }, []);

  return (
    <Component
      ref={localRef as any}
      className={cn("cursor-pointer", className)}
      {...(props as any)}
    >
      {children}
    </Component>
  );
};

// ========== MarqueeItem ==========
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>终身学习</span> <span className="text-primary/60">✦</span>
    <span>自我成长</span> <span className="text-secondary/60">✦</span>
    <span>第一性原理</span> <span className="text-primary/60">✦</span>
    <span>长期主义</span> <span className="text-secondary/60">✦</span>
    <span>价值创造</span> <span className="text-primary/60">✦</span>
    <span>深度思考</span> <span className="text-secondary/60">✦</span>
    <span>保持好奇</span> <span className="text-primary/60">✦</span>
    <span>知行合一</span> <span className="text-secondary/60">✦</span>
  </div>
);

// ========== GitHub Icon ==========
const IconGitHub = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.92 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

// ========== HeroSection ==========
export function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // === ENTRANCE TIMELINE ===
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        giantTextRef.current,
        { y: "15vh", scale: 0.7, opacity: 0 },
        { y: "0vh", scale: 1, opacity: 1, duration: 1.4 }
      );
      tl.fromTo(
        marqueeRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1 },
        "-=0.8"
      );
      tl.fromTo(
        headingRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.4"
      );
      tl.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.3"
      );
      tl.fromTo(
        ctaRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.6 },
        "-=0.2"
      );
      tl.fromTo(
        linksRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
        "-=0.2"
      );
      tl.fromTo(
        bottomRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.1"
      );
      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        "+=0.3"
      );

      // === SCROLL OUT ===
      gsap.to(giantTextRef.current, {
        scale: 0.6,
        opacity: 0,
        y: "-15vh",
        ease: "power2.in",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(headingRef.current, {
        opacity: 0,
        y: -40,
        ease: "power2.in",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(ctaRef.current, {
        opacity: 0,
        y: -20,
        ease: "power1.in",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top 20%",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(scrollIndicatorRef.current, {
        opacity: 0,
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top 20%",
          end: "top 60%",
          scrub: 1,
        },
      });
    }, wrapperRef);

    ScrollTrigger.refresh();
    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={wrapperRef}
        id="hero"
        className="hero-wrapper relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background flex flex-col items-center justify-center"
      >
        {/* Aurora glow */}
        <div className="hero-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-hero-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
        {/* Grid pattern */}
        <div className="hero-bg-grid absolute inset-0 z-0 pointer-events-none" />

        {/* Giant name text */}
        <div
          ref={giantTextRef}
          className="hero-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
        >
          万宏伟
        </div>

        {/* Marquee */}
        <div
          ref={marqueeRef}
          className="absolute top-12 left-0 w-full overflow-hidden border-y border-border/50 bg-background/60 backdrop-blur-md py-4 z-10 -rotate-1 shadow-xl"
        >
          <div className="flex w-max animate-hero-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-muted-foreground uppercase">
            <MarqueeItem />
            <MarqueeItem />
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 px-6 text-center max-w-3xl">
          {/* Heading */}
          <h1
            ref={headingRef}
            className="hero-text-glow text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6"
          >
            你好，欢迎来到这里
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
          >
            我是万宏伟，终身学习，自我成长是我的信条
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap justify-center gap-4 mb-6">
            <MagneticButton
              as="a"
              href="#features"
              className="hero-glass-pill px-8 py-4 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-2 group"
            >
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              查看项目
            </MagneticButton>
            <MagneticButton
              as="a"
              href="/万宏伟-人力资源.pdf"
              target="_blank"
              className="hero-glass-pill px-8 py-4 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-2 group"
            >
              <Download className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              下载简历
            </MagneticButton>
            <MagneticButton
              as="a"
              href="https://github.com"
              target="_blank"
              className="hero-glass-pill px-8 py-4 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-2 group"
            >
              <IconGitHub className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              GitHub
            </MagneticButton>
          </div>

          {/* Secondary links */}
          <div ref={linksRef} className="flex flex-wrap justify-center gap-3">
            <MagneticButton
              as="a"
              href="#contact"
              className="hero-glass-pill px-5 py-2.5 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground"
            >
              联系我
            </MagneticButton>
            <MagneticButton
              as="a"
              href="#features"
              className="hero-glass-pill px-5 py-2.5 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground"
            >
              更多项目
            </MagneticButton>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground z-10"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
          <span className="text-xs tracking-widest font-medium">向下探索</span>
        </div>

        {/* Bottom bar */}
        <div
          ref={bottomRef}
          className="absolute bottom-8 w-full px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 z-10"
        >
          <div className="text-muted-foreground text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
            &copy; {new Date().getFullYear()} 万宏伟
          </div>
          <div className="hero-glass-pill px-5 py-2.5 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-border/50">
            <span className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest">
              Crafted with
            </span>
            <span className="animate-hero-heartbeat text-sm md:text-base text-destructive">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </span>
            <span className="text-foreground font-black text-xs md:text-sm ml-1">
              万宏伟
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
