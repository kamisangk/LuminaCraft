import { NextRequest, NextResponse } from 'next/server';
import { resolveAICopilotRuntimeConfig, toChatCompletionsUrl } from '@/app/api/config/route';

interface CopilotPayload {
  task: 'generate_layout' | 'html_block';
  prompt: string;
  currentContext?: unknown;
}

export async function POST(req: NextRequest) {
  // 鉴权由 middleware.ts 处理
  let body: CopilotPayload;
  try {
    body = (await req.json()) as CopilotPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.task || !body.prompt) {
    return NextResponse.json({ error: 'Missing task or prompt' }, { status: 400 });
  }

  const { baseUrl, apiKey, model } = resolveAICopilotRuntimeConfig();

  if (!baseUrl) {
    return NextResponse.json({ error: 'AI Base URL 未配置' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'AI API Key 未配置' }, { status: 400 });
  }

  if (!model) {
    return NextResponse.json({ error: 'AI 模型未配置' }, { status: 400 });
  }

  const systemPrompt =
    body.task === 'generate_layout'
      ? `You are a layout assistant for LuminaCraft, a personal homepage builder using react-grid-layout.
Generate a valid JSON object matching the type: Record<"xl"|"lg"|"md"|"sm"|"xs", Array<{i:string,x:number,y:number,w:number,h:number}>>
The grid has 12 columns. Respond ONLY with valid JSON, no markdown, no explanation.`
      : `You are a frontend code assistant for LuminaCraft.
Generate clean, self-contained HTML+CSS+JS code for an HTML block widget.
Respond ONLY with the raw HTML code, no markdown fences.`;

  const userMessage =
    body.task === 'generate_layout'
      ? `Current modules and context: ${JSON.stringify(body.currentContext ?? {})}

User request: ${body.prompt}`
      : body.prompt;

  try {
    const upstream = await fetch(toChatCompletionsUrl(baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('[POST /api/ai/copilot] upstream error:', errText);
      return NextResponse.json({ error: 'AI API error' }, { status: 502 });
    }

    const result = await upstream.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = result.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ result: content });
  } catch (err) {
    console.error('[POST /api/ai/copilot] fetch error:', err);
    return NextResponse.json({ error: 'Failed to call AI API' }, { status: 502 });
  }
}
