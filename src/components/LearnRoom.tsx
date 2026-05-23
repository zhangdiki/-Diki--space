import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Lightbulb, Brain, Sparkles, RotateCcw,
  User, ChevronDown, Zap, Telescope,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──
type Message = { role: "user" | "assistant"; content: string };
type Mode = "socratic" | "feynman" | null;
type ModelId = "deepseek-chat" | "deepseek-reasoner" | "deepseek-v4-flash" | "deepseek-v4-pro";

interface ModelOption {
  id: ModelId;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

const MODELS: ModelOption[] = [
  { id: "deepseek-chat", label: "V3 快速", desc: "响应最快，通用对话", icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "deepseek-reasoner", label: "R1 推理", desc: "深度思考，苏格拉底式更佳", icon: <Brain className="h-3.5 w-3.5" /> },
  { id: "deepseek-v4-flash", label: "V4 极速", desc: "最新模型，百万上下文", icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "deepseek-v4-pro", label: "V4 Pro", desc: "旗舰模型，最强质量", icon: <Telescope className="h-3.5 w-3.5" /> },
];

const MAX_ROUNDS = 15;
const SUGGESTIONS = [
  "什么是边际效用？",
  "解释一下机会成本",
  "第一性原理是什么意思？",
  "熵增定律怎么理解？",
  "什么是幸存者偏差？",
];

// ── Helpers ──
function trimMessages(msgs: Message[]): Message[] {
  if (msgs.length <= MAX_ROUNDS * 2 + 2) return msgs;
  const first = msgs[0];
  const rest = msgs.slice(-(MAX_ROUNDS * 2));
  return first.role === "user" && first.content.includes("学习内容：")
    ? [first, ...rest]
    : rest;
}

function getModelLabel(id: ModelId): string {
  return MODELS.find((m) => m.id === id)?.label ?? id;
}

// ── Model Selector Dropdown ──
function ModelSelector({
  model,
  onSelect,
}: {
  model: ModelId;
  onSelect: (m: ModelId) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = MODELS.find((m) => m.id === model) ?? MODELS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        {current.icon}
        <span className="font-medium">{current.label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/50 bg-card p-1.5 shadow-xl z-50 backdrop-blur-md"
          >
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onSelect(m.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  m.id === model
                    ? "bg-primary/8 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    m.id === model ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {m.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.desc}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ──
export default function LearnRoom() {
  const [material, setMaterial] = useState("");
  const [mode, setMode] = useState<Mode>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelId>("deepseek-chat");

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-focus input
  useEffect(() => {
    if (mode && !isLoading) inputRef.current?.focus();
  }, [mode, isLoading]);

  // ── API call ──
  const callAI = useCallback(
    async (baseMessages: Message[], userMessage: string) => {
      const updated: Message[] = [
        ...baseMessages,
        { role: "user", content: userMessage },
      ];
      setMessages(updated);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/.netlify/functions/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: trimMessages(updated),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `请求失败 (${res.status})`);
        }

        const aiText =
          data.choices?.[0]?.message?.content || JSON.stringify(data);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiText },
        ]);
      } catch (err: any) {
        const msg = err.message || "未知错误";
        setError(
          msg.includes("超时")
            ? "DeepSeek 响应超时，请稍后重试"
            : msg.includes("fetch")
              ? "网络连接失败，请检查网络"
              : msg,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [model],
  );

  // ── Start mode ──
  const startMode = useCallback(
    (m: "socratic" | "feynman") => {
      const text = material.trim();
      if (!text) return;

      const instruction =
        m === "socratic"
          ? "请用苏格拉底式提问引导我深入理解以上内容。直接问我第一个问题，不要说额外的话。"
          : '现在我用费曼技巧向你解释我学到的内容。请扮演一个充满好奇的10岁小孩，不断追问「为什么」和「这是什么意思」，直到我把概念解释得无比简单清晰。如果我讲错了或模糊，直接指出来。现在对我说：好了，可以开始讲给我听了。';

      const systemMsg: Message = {
        role: "user",
        content: instruction + "\n\n学习内容：" + text,
      };
      const baseMessages = [systemMsg];
      setMode(m);
      setMessages(baseMessages);
      setError(null);
      callAI(baseMessages, systemMsg.content);
    },
    [material, callAI],
  );

  // ── Handlers ──
  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    callAI(messages, text);
  };

  const handleReset = () => {
    setMode(null);
    setMessages([]);
    setInput("");
    setError(null);
    setMaterial("");
  };

  const handleSuggestion = (suggestion: string) => {
    setMaterial(suggestion);
  };

  // ── Render ──
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* ═══════ HEADER ═══════ */}
      <header className="shrink-0 border-b border-border/30 bg-background/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">返回首页</span>
          </a>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              AI 学习室
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ModelSelector model={model} onSelect={setModel} />
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-full border border-border/50 bg-card/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">重新开始</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ MAIN ═══════ */}
      <div className="flex-1 overflow-hidden mx-auto w-full max-w-3xl px-4 flex flex-col">
        {!mode ? (
          /* ───── WELCOME SCREEN ───── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-1 flex-col items-center justify-center gap-8 py-12"
          >
            {/* Icon + Title */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-purple-500/15 ring-1 ring-primary/10"
              >
                <Brain className="h-9 w-9 text-primary" />
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight">
                AI 苏格拉底教练
              </h1>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                粘贴任意正在学的文本、概念或笔记，AI
                不会直接给你答案，而是通过层层提问引导你自己找到答案。
              </p>
            </div>

            {/* Textarea */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-full max-w-lg"
            >
              <textarea
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="例如：今天读了《原子习惯》第三章，核心理念是..."
                className="w-full h-32 rounded-2xl border border-border/60 bg-card/80 px-5 py-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (material.trim()) startMode("socratic");
                  }
                }}
              />
            </motion.div>

            {/* Mode Cards */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 w-full max-w-lg"
            >
              <button
                onClick={() => startMode("socratic")}
                disabled={!material.trim()}
                className="flex-1 flex items-start gap-3 rounded-2xl border border-border/50 bg-card/60 p-4 text-left hover:border-primary/40 hover:bg-card transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">苏格拉底提问</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    AI 用问题引导你深入思考
                  </div>
                </div>
              </button>

              <button
                onClick={() => startMode("feynman")}
                disabled={!material.trim()}
                className="flex-1 flex items-start gap-3 rounded-2xl border border-border/50 bg-card/60 p-4 text-left hover:border-primary/40 hover:bg-card transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/15 transition-colors">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">费曼技巧</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    向"10岁小孩"解释，检验真懂
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="w-full max-w-lg"
            >
              <p className="text-xs text-muted-foreground/60 mb-2.5 text-center">
                不知道学什么？试试这些话题：
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="rounded-full border border-border/40 bg-card/40 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* ───── CHAT SCREEN ───── */
          <div className="flex flex-1 flex-col min-h-0">
            {/* Mode bar */}
            <div className="shrink-0 flex items-center gap-2.5 py-3 border-b border-border/20">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  mode === "socratic"
                    ? "bg-primary/10 text-primary"
                    : "bg-purple-500/10 text-purple-500",
                )}
              >
                {mode === "socratic" ? "苏格拉底提问" : "费曼技巧"}
              </span>
              <span className="text-xs text-muted-foreground/60 truncate">
                {material.slice(0, 50)}
                {material.length > 50 ? "…" : ""}
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground/40">
                {getModelLabel(model)}
              </span>
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto py-5 space-y-5 scroll-smooth"
            >
              {messages
                .filter((_, i) => i > 0)
                .map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {/* AI avatar */}
                    {msg.role === "assistant" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/10 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary/8 text-foreground rounded-br-md border border-primary/10"
                          : "bg-muted/60 text-foreground rounded-bl-md border border-border/30",
                      )}
                    >
                      {msg.content}
                    </div>

                    {/* User avatar */}
                    {msg.role === "user" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border/30 mt-0.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}

              {/* Loading shimmer */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-muted/60 border border-border/30 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-16 rounded-full bg-primary/10 animate-pulse" />
                      <div className="h-2 w-10 rounded-full bg-primary/8 animate-pulse" style={{ animationDelay: "200ms" }} />
                      <div className="h-2 w-12 rounded-full bg-primary/6 animate-pulse" style={{ animationDelay: "400ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error toast */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="mx-auto max-w-sm rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-3.5 text-sm text-destructive/90 text-center"
                  >
                    <p>{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-1.5 text-xs underline underline-offset-2 text-destructive/60 hover:text-destructive"
                    >
                      关闭
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-1" />
            </div>

            {/* Input bar */}
            <div className="shrink-0 py-3 border-t border-border/20">
              <div className="flex items-end gap-2">
                <button
                  onClick={() =>
                    callAI(messages, "请给我一个微小的提示，不要直接给答案。")
                  }
                  disabled={isLoading}
                  className="shrink-0 rounded-full border border-border/50 bg-card/60 p-2.5 text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 transition-all"
                  title="获取提示"
                >
                  <Lightbulb className="h-4 w-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    placeholder="输入你的回答..."
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 placeholder:text-muted-foreground/40 disabled:opacity-30 transition-all"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 transition-all"
                  title="发送"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
