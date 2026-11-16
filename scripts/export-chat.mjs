// Turns a Claude Code session file (.jsonl) into a readable Markdown transcript.
// Usage: npm run export-chat -- <path-to-session.jsonl>
// Default path: the session this project was built in.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SESSION = 'ac5c3b2f-8690-4b90-b52f-d281b0a6a72b';
const src = process.argv[2] || path.join(os.homedir(), '.claude', 'projects', `C--Users-${path.basename(os.homedir())}`, `${SESSION}.jsonl`);
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'chat-session');

const lines = fs.readFileSync(src, 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const clean = (t) => t
  .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
  .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email removed]')
  .trim();

const md = ['# Chat session: building Tailor\'s Workbench', '', `Session \`${SESSION}\`. Exported ${new Date().toISOString().slice(0, 10)}.`, '', 'Only the conversation is kept: what was said, and a one-line note for each tool the assistant used. Hidden reasoning and system text are left out.', ''];
for (const o of lines) {
  if (o.type !== 'user' && o.type !== 'assistant') continue;
  const content = typeof o.message?.content === 'string' ? [{ type: 'text', text: o.message.content }] : (o.message?.content || []);
  const texts = content.filter((c) => c.type === 'text').map((c) => clean(c.text)).filter(Boolean);
  const tools = content.filter((c) => c.type === 'tool_use').map((c) => {
    const i = c.input || {};
    const what = i.description || i.file_path || i.action || i.query || '';
    return `> 🔧 *${c.name}*${what ? ` · ${String(what).slice(0, 140)}` : ''}`;
  });
  if (!texts.length && !tools.length) continue;
  if (o.type === 'user' && texts.length) md.push('---', '', '## 🧑 User', '', ...texts.map((t) => t + '\n'));
  if (o.type === 'assistant') { if (texts.length) md.push('### 🤖 Claude', '', ...texts.map((t) => t + '\n')); md.push(...tools.map((t) => t + '\n')); }
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'transcript.md'), md.join('\n'));
fs.copyFileSync(src, path.join(outDir, `${SESSION}.raw.jsonl`));
console.log('Wrote', path.join(outDir, 'transcript.md'));
