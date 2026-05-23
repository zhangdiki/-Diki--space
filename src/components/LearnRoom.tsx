import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Lightbulb, Brain, Sparkles, RotateCcw } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
type Mode = "socratic" | "feynman" | null;

const MAX_ROUNDS = 15;

function trimMessages(msgs: Message[]): Message[] {
  if (msgs.length <= MAX_ROUNDS * 2 + 2) return msgs;
  const first = msgs[0];
  const rest = msgs.slice(-(MAX_ROUNDS * 2));
  return first.role === "user" && first.content.includes("学习内容：") ? [first, ...rest] : rest;
}

export default function LearnRoom() {
  const [material, setMaterial] = useState("");
  const [mode, setMode] = useState<Mode>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode, isLoading]);

  const callAI = useCallback(
    async (baseMessages: Message[], userMessage: string) => {
      const updated: Message[] = [...baseMessages, { role: "user", content: userMessage }];
      setMessages(updated);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/.netlify/functions/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: trimMessages(updated) }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `请求失败 (${res.status})`);
        }

        const aiText =
          data.choices?.[0]?.message?.content || JSON.stringify(data);

        setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);
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
    [],
  );

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

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </a>
          <span className="text-sm font-semibold tracking-wide">
            <Sparkles className="inline h-4 w-4 mr-1 text-primary" />
            AI 学习室
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            重新开始
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 overflow-hidden mx-auto w-full max-w-3xl px-4 flex flex-col">
        {!mode ? (
          /* ── 初始状态：输入学习材料 ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col items-center justify-center gap-6 py-12"
          >
            <div className="text-center space-y-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                AI 苏格拉底教练
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                粘贴任意正在学的文本、概念或笔记，AI
                会通过提问让你真正理解它，而不是直接给你答案。
              </p>
            </div>

            <textarea
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="例如：今天读了《原子习惯》第三章，核心理念是..."
              className="w-full max-w-md h-28 rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-muted-foreground/50 transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (material.trim()) startMode("socratic");
                }
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => startMode("socratic")}
                disabled={!material.trim()}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Sparkles className="h-4 w-4" />
                苏格拉底提问
              </button>
              <button
                onClick={() => startMode("feynman")}
                disabled={!material.trim()}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                费曼技巧
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── 学习模式：聊天界面 ── */
          <div className="flex flex-1 flex-col min-h-0">
            {/* 模式标签 */}
            <div className="shrink-0 flex items-center gap-2 py-3 border-b border-border/20">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {mode === "socratic" ? "苏格拉底提问" : "费曼技巧"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {material.slice(0, 40)}{material.length > 40 ? "…" : ""}
              </span>
            </div>

            {/* 聊天区 */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto py-4 space-y-4 scroll-smooth"
            >
              {/* 跳过第一条 system 消息 */}
              {messages
                .filter((_, i) => i > 0)
                .map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

              {/* 加载状态 */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl rounded-bl-md bg-muted px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 错误提示 */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive text-center"
                  >
                    {error}
                    <button
                      onClick={() => setError(null)}
                      className="ml-2 underline underline-offset-2"
                    >
                      关闭
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-2" />
            </div>

            {/* 输入栏 */}
            <div className="shrink-0 py-3 border-t border-border/20">
              <div className="flex gap-2">
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
                  className="flex-1 rounded-full border border-border/60 bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-muted-foreground/50 disabled:opacity-40 transition-all"
                />
                <button
                  onClick={() => callAI(messages, "请给我一个微小的提示，不要直接给答案。")}
                  disabled={isLoading}
                  className="shrink-0 rounded-full border border-border/60 bg-card px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                  title="获取提示"
                >
                  <Lightbulb className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
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
