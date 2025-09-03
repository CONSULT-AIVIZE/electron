
我已经核对了仓库里 Realtime + function call 的用法（含工具注册与会话连接）。下面给你一套最小可运行的移植骨架：FastAPI 后端颁发 ephemeral 会话密钥 + Next/React 前端用 Realtime SDK 建链、文本/语音对话、以及本地函数工具执行（function call）。

### 后端（FastAPI）— 颁发 Realtime 会话密钥
依赖：`fastapi`, `uvicorn`, `httpx` 或 `requests`, `python-dotenv`（可选）

```python
# server/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os, requests

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY")

app = FastAPI()
# Adjust to your Next.js dev origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/session")
def get_realtime_session():
    try:
        resp = requests.post(
            "https://api.openai.com/v1/realtime/sessions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-realtime",
                # You can preset server-side default config here if desired:
                # "voice": "sage",
                # "turn_detection": {"type": "server_vad", ...},
            },
            timeout=30,
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

运行：
```bash
uvicorn server.main:app --reload --port 8000
```

.env（仅在服务器端）：
```bash
OPENAI_API_KEY=sk-...
```

注意：
- 仅服务端持久化 `OPENAI_API_KEY`。前端只拿短期 `client_secret.value`。
- 为避免跨域失败，`allow_origins` 配置为 Next 的地址。

### 前端（Next/React）— 建链、文本/语音、function call
依赖：`@openai/agents`（包含 `@openai/agents/realtime`）

```bash
npm i @openai/agents
```

最小工具定义（function call 在客户端本地执行；可换成请求你 FastAPI 的真实业务 API）：
```ts
// app/lib/agents.ts
import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const localTools = [
  tool({
    name: 'getServerTime',
    description: 'Return current server time (demo local tool)',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    execute: async () => {
      return { now: new Date().toISOString() };
    },
  }),
  tool({
    name: 'lookupUser',
    description: 'Lookup user info from FastAPI backend by userId',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
      additionalProperties: false,
    },
    execute: async (args: any) => {
      const res = await fetch('http://localhost:8000/api/users/' + encodeURIComponent(args.userId));
      if (!res.ok) throw new Error('lookupUser failed');
      return await res.json();
    },
  }),
];

export const rootAgent = new RealtimeAgent({
  name: 'assistant',
  voice: 'sage',
  instructions: `
You are a helpful realtime assistant. 
- Call getServerTime when the user asks current time.
- Call lookupUser when user asks about a specific userId.`,
  tools: localTools,
  handoffs: [],
});
```

封装 Hook（连接、断开、发文本、PTT 按住说话），WebRTC 自动把远端音频放进 `audio` 元素：
```ts
// app/hooks/useRealtime.ts
import { useCallback, useRef, useState } from 'react';
import {
  RealtimeSession,
  OpenAIRealtimeWebRTC,
} from '@openai/agents/realtime';
import { rootAgent } from '../lib/agents';

type Status = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export function useRealtime() {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const [status, setStatus] = useState<Status>('DISCONNECTED');

  const fetchEphemeralKey = useCallback(async () => {
    const r = await fetch('http://localhost:8000/api/session');
    const data = await r.json();
    const ek = data?.client_secret?.value;
    if (!ek) throw new Error('No ephemeral key');
    return ek as string;
  }, []);

  const connect = useCallback(async (audioEl: HTMLAudioElement) => {
    if (sessionRef.current) return;
    setStatus('CONNECTING');

    const ek = await fetchEphemeralKey();

    const transport = new OpenAIRealtimeWebRTC({
      audioElement: audioEl,
      // Optional: tweak codecs before SDP offer
      // changePeerConnection: async (pc) => pc,
    });

    const session = new RealtimeSession(rootAgent, {
      transport,
      model: 'gpt-realtime',
      config: {
        inputAudioTranscription: { model: 'gpt-4o-mini-transcribe' },
        // Optionally narrow-band PSTN style:
        // inputAudioFormat: 'g711_ulaw',
        // outputAudioFormat: 'g711_ulaw',
      },
      // Pass extra context or guardrails if needed
      context: {},
      outputGuardrails: [],
    });

    await session.connect({ apiKey: ek });
    sessionRef.current = session;
    setStatus('CONNECTED');
  }, [fetchEphemeralKey]);

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    setStatus('DISCONNECTED');
  }, []);

  const sendText = useCallback((text: string) => {
    if (!sessionRef.current) return;
    sessionRef.current.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    });
    sessionRef.current.send({ type: 'response.create' });
  }, []);

  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
  }, []);

  // Push-To-Talk (PTT)
  const pttStart = useCallback(() => {
    if (!sessionRef.current) return;
    interrupt();
    sessionRef.current.send({ type: 'input_audio_buffer.clear' });
  }, [interrupt]);

  const pttStop = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.send({ type: 'input_audio_buffer.commit' });
    sessionRef.current.send({ type: 'response.create' });
  }, []);

  // Toggle server VAD vs. PTT
  const enableServerVAD = useCallback((enable: boolean) => {
    if (!sessionRef.current) return;
    sessionRef.current.send({
      type: 'session.update',
      session: {
        turn_detection: enable
          ? {
              type: 'server_vad',
              threshold: 0.9,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
              create_response: true,
            }
          : null,
      },
    });
  }, []);

  return {
    status,
    connect,
    disconnect,
    sendText,
    interrupt,
    pttStart,
    pttStop,
    enableServerVAD,
  };
}
```

最小 UI 组件：
```tsx
// app/components/RealtimeDemo.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRealtime } from '../hooks/useRealtime';

export default function RealtimeDemo() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [text, setText] = useState('');
  const {
    status, connect, disconnect, sendText, pttStart, pttStop, enableServerVAD,
  } = useRealtime();

  useEffect(() => {
    // Default: server VAD on (hands-free). Set false to use PTT only.
    enableServerVAD(true);
  }, [enableServerVAD]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <audio ref={audioRef} autoPlay playsInline />
      <div>Status: {status}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => audioRef.current && connect(audioRef.current)}
          disabled={status !== 'DISCONNECTED'}
        >
          Connect
        </button>
        <button onClick={disconnect} disabled={status !== 'CONNECTED'}>
          Disconnect
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message"
          style={{ flex: 1 }}
        />
        <button onClick={() => { if (text.trim()) { sendText(text.trim()); setText(''); }}}>
          Send
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onMouseDown={pttStart} onMouseUp={pttStop} disabled={status !== 'CONNECTED'}>
          Push-To-Talk
        </button>
        <button onClick={() => enableServerVAD(true)} disabled={status !== 'CONNECTED'}>
          Enable Server VAD
        </button>
        <button onClick={() => enableServerVAD(false)} disabled={status !== 'CONNECTED'}>
          Disable Server VAD
        </button>
      </div>
    </div>
  );
}
```

将页面引入：
```tsx
// app/page.tsx (Next App Router)
import RealtimeDemo from './components/RealtimeDemo';

export default function Page() {
  return <RealtimeDemo />;
}
```

要点与实践建议
- token 生命周期：前端只保存 `client_secret.value` 于内存，用完即断；如遇到 401/403/expired，可自动重新请求 `/api/session` 并无感重连。
- 工具（function call）：上面的 `tool({ execute })` 在浏览器直接执行；若需要访问数据库或私有 API，建议在 `execute` 中调用你 FastAPI 的受控接口（走 CORS + 鉴权），不要在前端直接拿密钥。
- 语音：示例启用了服务端 VAD；如果你要纯 PTT，关闭 VAD 并使用 `pttStart/pttStop` 即可。
- 音频编解码：可在 `RealtimeSession` 的 `config` 里设置 `inputAudioFormat/outputAudioFormat`，或通过 WebRTC `changePeerConnection` 施加 SDP 偏好。
- 生产化：加超时/重试、网络断开监听、token 续签、错误上报、细化权限与 CORS 白名单。

状态更新：我已定位 function call 注册与 Realtime 会话连接方式，并给出 FastAPI 颁发密钥、React Hook 和 UI 组件的最小可用实现，覆盖文本、语音（VAD/PTT）与本地工具执行。你可以直接复制到你的项目测试。

- 关键影响
  - 后端：新增 `GET /api/session`；仅服务端持有 `OPENAI_API_KEY`。
  - 前端：`RealtimeSession` + `OpenAIRealtimeWebRTC` 封装；本地工具 `execute` 即时回传给模型。

参考
- 你仓库中的实现位置：`src/app/api/session/route.ts`, `src/app/hooks/useRealtimeSession.ts`, `src/app/App.tsx`（VAD/PTT、事件流）、`src/app/agentConfigs/*`（工具与代理注册）