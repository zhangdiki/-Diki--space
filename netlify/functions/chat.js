const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const TIMEOUT_MS = 30_000;
const MAX_MESSAGES = 40;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "请求体格式无效，需要 JSON" }) };
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "messages 必须是非空数组" }) };
  }

  const trimmed = messages.slice(-MAX_MESSAGES);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `你是一位采用苏格拉底方法的全科导师。用户会提供他们正在学习的任何内容（文本、笔记、概念）。你的任务：
- 绝不直接讲解，而是通过层层递进的问题引导用户自己梳理出深层理解。
- 对用户的每一次回答，给出简短评价（准确性、深度、思维质量），并追问薄弱点。
- 如果用户表示困惑，给一个微小的提示，而不是直接给答案。
- 保持对话专注于让用户主动提取、解释和关联知识。`,
          },
          ...trimmed,
        ],
        temperature: 0.4,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `DeepSeek API 错误 (${response.status}): ${errText}` }),
      };
    }

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    clearTimeout(timer);
    if (error.name === "AbortError") {
      return { statusCode: 504, body: JSON.stringify({ error: "请求超时，请稍后重试" }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
