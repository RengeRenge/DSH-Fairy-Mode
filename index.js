/**
 * Host half of the HDD skin: it owns the two numbers the sidebar card shows.
 *
 *   balance — asked of the account service per request, never cached here, and
 *             never returned together with any credential
 *   today   — accumulated from the durable session feed (`session/event`), where
 *             every `assistant/message` carries a TokenUsage; priced with the
 *             published deepseek-flash rates and kept in
 *             `$DSH_HOME/hdd-meter-daily.json`
 *
 * Two routes are added. `/hdd-meter` serves the card's numbers; `/hdd-boot.mp4`
 * streams the launch animation from disk, because 74 MB must never be inlined
 * into a browser module. The account service is optional: the card still reports
 * today's usage when the host has no account platform.
 */
import { createReadStream, existsSync, readFileSync, unlinkSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

/* The global `fetch` inside this host process could not open a socket to the
   local voice service — every call through the proxy route answered 503 while
   curl on the same machine succeeded — so the localhost call uses node:http,
   which nothing in the shell replaces. */
function postLocalJson(url, payload, timeoutMs = 300000) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const body = Buffer.from(JSON.stringify(payload), 'utf8');
    const req = httpRequest(
      {
        hostname: target.hostname,
        port: target.port,
        path: target.pathname + target.search,
        method: 'POST',
        headers: { 'content-type': 'application/json', 'content-length': body.length },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (res.statusCode !== 200) {
            reject(new Error(`tts ${res.statusCode}: ${buffer.toString('utf8').slice(0, 300)}`));
            return;
          }
          resolve(buffer);
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('tts timeout')));
    req.end(body);
  });
}

/* Resolves true when something answers on the port at all. */
function probeLocal(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const target = new URL(url);
    const req = httpRequest(
      { hostname: target.hostname, port: target.port, path: '/', method: 'GET' },
      (res) => {
        res.resume();
        resolve(true);
      },
    );
    req.on('error', () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(true);
    });
    req.end();
  });
}

const ROUTE = '/hdd-meter';
const FILE = 'hdd-meter-daily.json';
const VOICE_ROUTE = '/hdd-voice';
/* The launch animation lives beside this module; it is streamed, never inlined. */
const BOOT_VIDEO = fileURLToPath(new URL('./boot.mp4', import.meta.url));
const BOOT_ROUTE = '/hdd-boot.mp4';
/* The launch backdrop the user drew, streamed the same way and for the same
   reason: a megabyte-scale image must not be inlined into the browser module. */
const BOOT_FIELD = fileURLToPath(new URL('./boot-field.png', import.meta.url));
const BOOT_FIELD_ROUTE = '/hdd-boot-field';
/* Read-aloud through the fine-tuned Fairy voice, served by a local GPT-SoVITS
   process that keeps the model resident in VRAM. The reference clip ships with
   this bundle so the prompt does not depend on the repository layout; the
   launcher path is machine-specific by nature and is only used to start the
   service when it is not already listening. */
const SPEAK_ROUTE = '/hdd-speak';
const ENGINE_ROUTE = '/hdd-engine';
/* The skin, the preset and the launch art travel with this package; the voice
   stack does not. GPT-SoVITS plus a fine-tuned voice is a separate install of
   hundreds of megabytes (and the weights are not ours to redistribute), so the
   package only *finds* it. Point FAIRYKIT_HOME at that install, or leave the
   default; without it the skin and persona still work and the pill simply reads
   未配置. */
const FAIRYKIT_HOME = process.env.FAIRYKIT_HOME || 'E:\\FairyKit';
const TTS_PORT = Number(process.env.FAIRY_TTS_PORT || 9880);
const TTS_API = 'http://127.0.0.1:' + TTS_PORT + '/tts';
const TTS_PROBE = 'http://127.0.0.1:' + TTS_PORT + '/';
const TTS_LAUNCHER = process.env.FAIRY_TTS_LAUNCHER || join(FAIRYKIT_HOME, 'run-api.ps1');
/* The launcher records the interpreter it started here, so the engine can be
   stopped even when the port was opened by an instance this process did not
   start. The port owner is the authoritative kill target. */
const TTS_PID = join(FAIRYKIT_HOME, 'logs', 'tts.pid');
const TTS_CONFIG = process.env.FAIRY_TTS_CONFIG || join(FAIRYKIT_HOME, 'voice', 'tts_infer_fairy.yaml');
const TTS_BOOT_TIMEOUT_MS = 180000;
const TTS_POWERSHELL = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
/* Launched through cmd.exe on purpose. `spawn(powershell, …, { detached: true,
   windowsHide: true })` — DETACHED_PROCESS together with CREATE_NO_WINDOW — makes
   PowerShell 5.1 exit 0 immediately without running the script, so the service
   silently never started while "spawned launcher pid …" was logged. cmd.exe gets
   a new process group and keeps powershell's own console hidden. */
const TTS_CMD = 'C:\\Windows\\System32\\cmd.exe';
const TTS_REFERENCE = fileURLToPath(new URL('./fairy_ref.wav', import.meta.url));
const TTS_PROMPT = '了解我会如同主人使唤我一般使唤它，并且让它不敢有怨言。';

/* USD per million tokens. Estimates, not an invoice. */
const RATE = { input: 0.3, output: 1.2, cacheRead: 0.006, cacheWrite: 0 };
const USD_TO_CNY = 7.2;
const FLUSH_DELAY_MS = 1500;

export const inject = ['webServer'];

/* Latest finalized assistant reply, for the read-aloud feature in the browser. */
let lastReply = null;

function messageText(message) {
  const blocks = message && Array.isArray(message.content) ? message.content : [];
  const parts = [];
  for (const block of blocks) {
    if (block && block.type === 'text' && typeof block.text === 'string') parts.push(block.text);
  }
  return parts.join('\n').trim();
}

function stateFile() {
  const home = process.env.DSH_HOME || join(process.env.USERPROFILE || homedir(), '.dsh');
  return join(home, FILE);
}

/* Voice-service lifecycle notes, readable from outside the app. */
function noteVoice(message) {
  const home = process.env.DSH_HOME || join(process.env.USERPROFILE || homedir(), '.dsh');
  const line = `${new Date().toISOString()} ${message}\n`;
  mkdir(home, { recursive: true })
    .then(() => writeFile(join(home, 'hdd-voice.log'), line, { flag: 'a' }))
    .catch(() => {});
}

function dayKey(time) {
  const d = new Date(typeof time === 'number' ? time : Date.now());
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function count(value) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function price(state) {
  const usd =
    (state.inputTokens * RATE.input +
      state.outputTokens * RATE.output +
      state.cacheReadTokens * RATE.cacheRead +
      state.cacheWriteTokens * RATE.cacheWrite) /
    1e6;
  return { costUsd: usd, costCny: usd * USD_TO_CNY };
}

function emptyState(date) {
  return { date, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
}

export function apply(ctx) {
  let state = emptyState(dayKey(Date.now()));
  let flushTimer;

  const flush = () => {
    flushTimer = undefined;
    const path = stateFile();
    const payload = JSON.stringify({ ...state, ...price(state), updatedAt: Date.now() });
    mkdir(dirname(path), { recursive: true })
      .then(() => writeFile(path, payload, { encoding: 'utf8', mode: 0o600 }))
      .catch((error) => ctx.logger?.warn?.(`hdd-skin: could not persist ${path}: ${String(error)}`));
  };

  const scheduleFlush = () => {
    if (flushTimer !== undefined) return;
    flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
  };

  /* Restore today's counters so a restart inside the same day keeps counting. */
  ctx.effect(() => {
    let live = true;
    readFile(stateFile(), 'utf8')
      .then((text) => {
        if (!live) return;
        const stored = JSON.parse(text);
        const today = dayKey(Date.now());
        if (stored && stored.date === today) {
          state = {
            date: today,
            inputTokens: count(stored.inputTokens),
            outputTokens: count(stored.outputTokens),
            cacheReadTokens: count(stored.cacheReadTokens),
            cacheWriteTokens: count(stored.cacheWriteTokens),
          };
          ctx.logger?.info?.(`hdd-skin: restored ${today} usage`);
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, 'hdd-meter-restore');

  /* Every committed assistant message carries the usage that produced it, and
     its text. The text is kept here so the browser never has to reconstruct a
     reply from the rendered DOM — an earlier attempt did that and ended up
     reading the whole transcript, because the action row and the body do not
     share the ancestor the extractor assumed. */
  ctx.on('session/event', (session, event) => {
    if (!event || event.type !== 'assistant/message') return;
    const text = messageText(event.data?.message);
    if (text) {
      lastReply = {
        sessionId: session && session.id !== undefined ? String(session.id) : '',
        messageId: String(event.data?.message?.id || event.id || event.time),
        text,
        at: event.time || Date.now(),
      };
    }
    const usage = event.data?.usage;
    if (!usage) return;
    const day = dayKey(event.time);
    if (day !== state.date) state = emptyState(day);
    state.inputTokens += count(usage.inputTokens);
    state.outputTokens += count(usage.outputTokens);
    state.cacheReadTokens += count(usage.cacheReadTokens);
    state.cacheWriteTokens += count(usage.cacheWriteTokens);
    scheduleFlush();
  });

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE,
        handler: async (req, res) => {
          const body = { today: { ...state, ...price(state) }, balance: null, fetchedAt: Date.now() };
          const account = ctx.get('deepseekAccount');
          if (account !== undefined && typeof account.getBalance === 'function') {
            try {
              const result = await account.getBalance({
                version: '1',
                locale: 'zh-CN',
                timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
              });
              if (result && result.status === 'ready') {
                body.balance = result.value.map((wallet) => ({
                  currency: wallet.currency,
                  balance: wallet.balance,
                }));
              }
            } catch (error) {
              body.balanceError = String(error?.message ?? error);
            }
          }
          res.writeHead(200, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          });
          res.end(JSON.stringify(body));
        },
      }),
    'hdd-meter-route',
  );

  /* The read-aloud feed: tiny, local, and separate from the meter route so the
     browser can poll it often without triggering a platform balance query. */
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: VOICE_ROUTE,
        handler: (req, res) => {
          res.writeHead(200, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          });
          res.end(JSON.stringify({ last: lastReply }));
        },
      }),
    'hdd-voice-route',
  );

  /* Speech synthesis through the local GPT-SoVITS service. The browser asks for
     text and gets wav bytes; it never talks to the service directly, so the
     reference clip and prompt stay on this side. */
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: SPEAK_ROUTE,
        handler: async (req, res) => {
          const url = new URL(req.url || '/', 'http://127.0.0.1');
          const text = (url.searchParams.get('text') || '').trim();
          if (!text) {
            res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
            res.end('text is required');
            return;
          }
          const speed = Number(url.searchParams.get('speed'));
          try {
            const buffer = await postLocalJson(TTS_API, {
              text,
              text_lang: 'zh',
              ref_audio_path: TTS_REFERENCE,
              prompt_text: TTS_PROMPT,
              prompt_lang: 'zh',
              text_split_method: 'cut0',
              batch_size: 1,
              speed_factor: Number.isFinite(speed) && speed > 0 ? speed : 1.0,
              media_type: 'wav',
              streaming_mode: false,
            });
            res.writeHead(200, {
              'content-type': 'audio/wav',
              'content-length': buffer.length,
              'cache-control': 'no-store',
            });
            res.end(buffer);
          } catch (error) {
            /* The browser falls back to the OS voice on a non-200. */
            res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' });
            res.end(String(error && error.message ? error.message : error));
          }
        },
      }),
    'hdd-speak-route',
  );

  /* ---- voice engine lifecycle ----
     The model holds a couple of gigabytes of memory and VRAM, so it is loaded
     only while the reader is switched on. The client drives this: enabling the
     toggle calls POST /hdd-engine?action=start, disabling it calls
     POST /hdd-engine?action=stop, and a GET is the status read the chip polls.
     There is deliberately no background watchdog any more — a service that
     keeps coming back by itself can never be "released when reading is off". */
  const engine = { state: 'stopped', since: 0, error: null };
  let engineWork = Promise.resolve();

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* What the engine will load, read from the TTS config rather than duplicated
     here: the tooltip is the only place a user can see which weights are behind
     "就绪", and a hard-coded copy would drift the moment the yaml changes. */
  function describeModel() {
    const model = {
      name: 'Fairy',
      version: 'v2',
      sovits: '',
      gpt: '',
      device: 'cuda',
      half: true,
      reference: 'fairy_ref.wav',
    };
    try {
      const text = readFileSync(TTS_CONFIG, 'utf8');
      const field = (key) => {
        const match = text.match(new RegExp('^\\s*' + key + ':\\s*(.+)$', 'm'));
        return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
      };
      const base = (value) => String(value || '').replace(/\\/g, '/').split('/').pop();
      const version = field('version');
      if (version) model.version = version;
      const sovits = base(field('vits_weights_path'));
      const gpt = base(field('t2s_weights_path'));
      if (sovits) model.sovits = sovits;
      if (gpt) model.gpt = gpt;
      const device = field('device');
      if (device) model.device = device;
      const half = field('is_half');
      if (half) model.half = !/^false$/i.test(half);
    } catch (error) {
      /* Unreadable config: the defaults above still describe the shipped voice. */
    }
    return model;
  }

  const MODEL_INFO = describeModel();

  /* Who is listening on the port. A PID file can go stale; the socket cannot. */
  function pidOnPort(port) {
    try {
      const out = execFileSync('C:\\Windows\\System32\\netstat.exe', ['-ano'], {
        encoding: 'utf8',
        timeout: 8000,
        windowsHide: true,
      });
      for (const line of out.split(/\r?\n/)) {
        if (!line.includes(':' + port)) continue;
        if (!/LISTENING/i.test(line)) continue;
        const parts = line.trim().split(/\s+/);
        const pid = Number(parts[parts.length - 1]);
        if (Number.isFinite(pid) && pid > 0) return pid;
      }
    } catch (error) {
      /* netstat unavailable: treat the port as closed */
    }
    return null;
  }

  function engineSnapshot() {
    return {
      state: engine.state,
      since: engine.since,
      elapsedMs: engine.since ? Date.now() - engine.since : 0,
      error: engine.error,
      port: pidOnPort(TTS_PORT) !== null,
      model: MODEL_INFO,
    };
  }

  function setEngine(state, patch = {}) {
    engine.state = state;
    if (patch.since !== undefined) engine.since = patch.since;
    if (patch.error !== undefined) engine.error = patch.error;
    noteVoice(`engine -> ${state}${patch.error ? ' (' + patch.error + ')' : ''}`);
  }

  function killTree(pid) {
    if (!pid) return;
    try {
      execFileSync('C:\\Windows\\System32\\taskkill.exe', ['/F', '/T', '/PID', String(pid)], {
        stdio: 'ignore',
        timeout: 15000,
        windowsHide: true,
      });
      noteVoice('killed voice process tree ' + pid);
    } catch (error) {
      noteVoice('taskkill failed for ' + pid + ': ' + String(error && error.message ? error.message : error));
    }
  }

  async function startEngine(reason) {
    if (await probeLocal(TTS_PROBE, 1200)) {
      if (engine.state !== 'ready') setEngine('ready', { since: engine.since || Date.now() });
      return engineSnapshot();
    }
    if (!existsSync(TTS_LAUNCHER)) {
      setEngine('unconfigured', { error: 'voice stack not found at ' + FAIRYKIT_HOME });
      return engineSnapshot();
    }
    if (engine.state !== 'starting') {
      setEngine('starting', { since: Date.now(), error: null });
      engineWork = engineWork.then(async () => {
        try {
          /* cmd.exe is the outer process because the direct PowerShell spawn with
             `detached` and `windowsHide` together exits 0 without running anything
             (DETACHED_PROCESS + CREATE_NO_WINDOW). */
          const child = spawn(
            TTS_CMD,
            ['/c', TTS_POWERSHELL, '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', TTS_LAUNCHER],
            { detached: true, stdio: 'ignore', windowsHide: true },
          );
          child.on('error', (error) => noteVoice('spawn error: ' + String(error)));
          child.unref();
          noteVoice('engine start (' + reason + '), launcher pid ' + child.pid);
        } catch (error) {
          setEngine('error', { error: String(error) });
          return;
        }
        const deadline = Date.now() + TTS_BOOT_TIMEOUT_MS;
        while (Date.now() < deadline) {
          await sleep(2000);
          if (await probeLocal(TTS_PROBE, 1200)) {
            setEngine('ready', { since: Date.now() });
            return;
          }
        }
        setEngine('error', { error: 'timeout waiting for the model' });
      });
    }
    await engineWork;
    return engineSnapshot();
  }

  async function stopEngine(reason) {
    if (engine.state === 'stopped' && !pidOnPort(TTS_PORT)) return engineSnapshot();
    setEngine('stopping');
    killTree(pidOnPort(TTS_PORT));
    for (let i = 0; i < 20; i += 1) {
      await sleep(500);
      if (!pidOnPort(TTS_PORT)) break;
    }
    try { unlinkSync(TTS_PID); } catch (error) { /* already gone */ }
    setEngine('stopped', { since: 0, error: null });
    noteVoice('engine stopped (' + reason + ')');
    return engineSnapshot();
  }

  ctx.effect(
    () => ctx.webServer.register({
      kind: 'exact',
      path: ENGINE_ROUTE,
      handler: async (req, res) => {
        const url = new URL(req.url || '/', 'http://127.0.0.1');
        const method = (req.method || 'GET').toUpperCase();
        const action = url.searchParams.get('action') || 'status';
        let payload;
        try {
          if (method === 'POST' && action === 'stop') {
            payload = await stopEngine('client');
          } else if (method === 'POST') {
            payload = await startEngine('client');
          } else {
            /* A status read also reconciles a service that was started outside
               this process before the plugin loaded. */
            if (engine.state === 'stopped' && pidOnPort(TTS_PORT)) setEngine('ready', { since: Date.now() });
            payload = engineSnapshot();
          }
        } catch (error) {
          payload = { state: 'error', error: String(error && error.message ? error.message : error) };
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        res.end(JSON.stringify(payload));
      },
    }),
    'hdd-engine-route',
  );

  /* Best effort on shutdown: the plugin is disposed when the app quits, and a
     resident model must not outlive the reader being switched off. */
  ctx.effect(() => () => {
    if (engine.state === 'ready' || engine.state === 'starting') killTree(pidOnPort(TTS_PORT));
  }, 'hdd-engine-dispose');

  /* The launch animation, streamed from disk with byte-range support so the
     player can seek and so the first frames arrive without the whole 74 MB. */
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: BOOT_ROUTE,
        handler: async (req, res) => {
          const info = await stat(BOOT_VIDEO).catch(() => null);
          if (!info || !info.isFile()) {
            res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
            res.end('boot.mp4 is missing from the plugin directory');
            return;
          }
          const base = {
            'content-type': 'video/mp4',
            'accept-ranges': 'bytes',
            'cache-control': 'no-store',
          };
          const match = req.headers.range ? /bytes=(\d*)-(\d*)/.exec(req.headers.range) : null;
          if (match) {
            const start = match[1] ? Number(match[1]) : 0;
            const end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
            if (!Number.isFinite(start) || start > end || start >= info.size) {
              res.writeHead(416, { 'content-range': `bytes */${info.size}` });
              res.end();
              return;
            }
            res.writeHead(206, {
              ...base,
              'content-length': end - start + 1,
              'content-range': `bytes ${start}-${end}/${info.size}`,
            });
            createReadStream(BOOT_VIDEO, { start, end }).pipe(res);
            return;
          }
          res.writeHead(200, { ...base, 'content-length': info.size });
          createReadStream(BOOT_VIDEO).pipe(res);
        },
      }),
    'hdd-boot-video-route',
  );

  /* The launch backdrop is the image the user drew. It is streamed from disk for
     the same reason as the clip: it is a megabyte-scale binary, and inlining it
     into the browser module would bloat every client load to carry one screen. */
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: BOOT_FIELD_ROUTE,
        handler: async (req, res) => {
          const info = await stat(BOOT_FIELD).catch(() => null);
          if (!info || !info.isFile()) {
            res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
            res.end('boot-field.png is missing from the plugin directory');
            return;
          }
          res.writeHead(200, {
            'content-type': 'image/png',
            'content-length': String(info.size),
            'cache-control': 'no-store',
          });
          createReadStream(BOOT_FIELD).pipe(res);
        },
      }),
    'hdd-boot-field-route',
  );

  ctx.effect(
    () => () => {
      if (flushTimer !== undefined) {
        clearTimeout(flushTimer);
        flush();
      }
    },
    'hdd-meter-flush',
  );
}
