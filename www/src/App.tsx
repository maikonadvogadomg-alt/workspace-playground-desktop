/**
 * SK Playground v3 — HTML · JS · Python · React · SQL
 * Maikon Caldeira OAB/MG 183712
 * v3 — libs embutidas no APK (100% offline), aba SQL adicionada
 */
import { useState, useCallback, useRef, useEffect } from "react";
import {
  Play, Download, Save, Trash2, Maximize2, Minimize2,
  Copy, CheckCheck, Plus, X, FolderOpen, ChevronRight, Database,
} from "lucide-react";

declare global {
  interface Window {
    Sk?: {
      configure: (cfg: object) => void;
      builtinFiles?: { files: Record<string, string> };
      misceval: { asyncToPromise: (fn: () => unknown) => Promise<unknown> };
      importMainWithBody: (name: string, dumpJS: boolean, body: string, canSuspend: boolean) => unknown;
    };
    Babel?: { transform: (code: string, opts: object) => { code: string } };
    initSqlJs?: (cfg: { locateFile: (f: string) => string }) => Promise<SqlJsStatic>;
  }
}
interface SqlJsStatic {
  Database: new (data?: ArrayBuffer | null) => SqlDatabase;
}
interface SqlDatabase {
  run(sql: string): SqlDatabase;
  exec(sql: string): { columns: string[]; values: unknown[][] }[];
  close(): void;
}

/* ── Paleta ─────────────────────────────────────────────────────────────── */
const C = {
  bg:  "#0d1117", bg2: "#161b22", bg3: "#1c2128", bg4: "#21262d",
  brd: "#30363d",
  grn: "#238636", grn2:"#3fb950", grn3:"#7ee787",
  blu: "#1f6feb", blu2:"#388bfd", blu3:"#79c0ff",
  pur: "#6e40c9", pur2:"#a371f7",
  red2:"#da3633", red: "#f85149",
  org: "#e3b341", org2:"#d29922",
  cyn: "#39d353", cyn2:"#56d364",
  txt: "#e6edf3", txt2:"#8b949e", txt3:"#484f58",
  rad: 6,
} as const;

const ED: React.CSSProperties = {
  flex: 1, resize: "none", background: C.bg, color: C.blu3,
  border: "none", outline: "none", padding: 16,
  fontFamily: "'JetBrains Mono','Cascadia Code','Fira Code',Consolas,monospace",
  fontSize: 13, lineHeight: 1.7, tabSize: 2,
};
const BTN = (bg: string, fg: string = C.txt): React.CSSProperties => ({
  background: bg, color: fg, border: "none", borderRadius: C.rad,
  padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
});
const INP: React.CSSProperties = {
  background: C.bg3, border: `1px solid ${C.brd}`, borderRadius: C.rad,
  padding: "6px 10px", color: C.txt, fontSize: 12, outline: "none",
};

/* ── Defaults ───────────────────────────────────────────────────────────── */
type Lang = "html" | "js" | "python" | "react" | "sql" | "neon";

const DEFAULTS: Record<Lang, string> = {
  neon: `-- Neon PostgreSQL — conecte acima e escreva SQL real aqui\nSELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`,
  html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; background: #f0f4f8; }
    h1   { color: #1a73e8; }
    .box { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px #0002; }
    button { background: #1a73e8; color: white; border: none; border-radius: 6px;
             padding: 10px 20px; cursor: pointer; font-size: 14px; }
    button:hover { background: #1558b0; }
    #out { margin-top: 12px; font-weight: bold; color: #333; }
  </style>
</head>
<body>
  <div class="box">
    <h1>HTML Playground</h1>
    <p>Edite o codigo ao lado e veja o resultado aqui em tempo real.</p>
    <input id="nome" placeholder="Seu nome" style="padding:8px;border:1px solid #ccc;border-radius:6px;margin-right:8px"/>
    <button onclick="saudar()">Saudar</button>
    <p id="out"></p>
  </div>
  <script>
    function saudar() {
      const nome = document.getElementById('nome').value || 'Mundo';
      document.getElementById('out').textContent = 'Ola, ' + nome + '!';
    }
  </script>
</body>
</html>`,

  js: `// JavaScript Playground — roda direto no navegador, sem CDN

// Exemplos de JS puro
const dados = [
  { nome: "Ana",   valor: 5000 },
  { nome: "Bruno", valor: 8500 },
  { nome: "Carla", valor: 3200 },
];

console.log("=== Relatorio ===");
dados.forEach(d => {
  const imposto = d.valor * 0.275;
  console.log(d.nome + ": R$ " + d.valor.toFixed(2) + "  |  Imposto: R$ " + imposto.toFixed(2));
});

const total = dados.reduce((s, d) => s + d.valor, 0);
console.log("Total: R$ " + total.toFixed(2));

// Funcoes uteis
function calcJuros(principal, taxa, meses) {
  return principal * Math.pow(1 + taxa / 100, meses);
}
const montante = calcJuros(10000, 1.5, 12);
console.log("Juros compostos (12 meses, 1.5%): R$ " + montante.toFixed(2));

// Array / string
const palavras = ["juridico", "contrato", "prazo", "recurso"];
console.log("Maiusculas: " + palavras.map(p => p.toUpperCase()).join(", "));
`,

  python: `# Python Playground (Skulpt — roda no dispositivo)

import math

def calcular_juros(principal, taxa, meses):
    """Calcula juros compostos"""
    return principal * ((1 + taxa/100) ** meses)

print("=" * 40)
print("CALCULADORA DE JUROS COMPOSTOS")
print("=" * 40)

principal = 10000
taxa = 1.5
meses = 12

resultado = calcular_juros(principal, taxa, meses)
print("Principal: R$ {:,.2f}".format(principal))
print("Taxa: {}% ao mes".format(taxa))
print("Periodo: {} meses".format(meses))
print("Montante: R$ {:,.2f}".format(resultado))
print("Juros: R$ {:,.2f}".format(resultado - principal))

print("\\nFibonacci ate 100:")
a, b = 0, 1
seq = []
while a <= 100:
    seq.append(a)
    a, b = b, a + b
print(", ".join(str(x) for x in seq))
print("\\nPronto!")
`,

  react: `// React Playground (Babel transpila JSX — funciona no dispositivo)

function App() {
  const [contador, setContador] = React.useState(0);
  const [texto, setTexto]       = React.useState("");
  const [itens, setItens]       = React.useState(["Item 1", "Item 2"]);

  const adicionar = () => {
    if (texto.trim()) {
      setItens(prev => [...prev, texto.trim()]);
      setTexto("");
    }
  };

  return (
    <div style={{ fontFamily:"Arial,sans-serif", padding:24, maxWidth:480 }}>
      <h2 style={{ color:"#1a73e8" }}>React Playground</h2>

      <div style={{ background:"#f8f9fa", borderRadius:12, padding:16, marginBottom:16 }}>
        <h3>Contador: {contador}</h3>
        <button onClick={() => setContador(c => c - 1)}
          style={{ margin:4, padding:"6px 14px", background:"#dc3545", color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>
          -1
        </button>
        <button onClick={() => setContador(c => c + 1)}
          style={{ margin:4, padding:"6px 14px", background:"#28a745", color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>
          +1
        </button>
        <button onClick={() => setContador(0)}
          style={{ margin:4, padding:"6px 14px", background:"#6c757d", color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>
          Zerar
        </button>
      </div>

      <div style={{ background:"#f8f9fa", borderRadius:12, padding:16 }}>
        <h3>Lista</h3>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={texto} onChange={e => setTexto(e.target.value)}
            onKeyDown={e => e.key === "Enter" && adicionar()}
            placeholder="Digite e pressione Enter"
            style={{ flex:1, padding:8, borderRadius:6, border:"1px solid #ccc" }}/>
          <button onClick={adicionar}
            style={{ padding:"8px 16px", background:"#1a73e8", color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>
            Add
          </button>
        </div>
        <ul style={{ paddingLeft:20 }}>
          {itens.map((item, i) => (
            <li key={i} style={{ padding:"4px 0" }}>
              {item}
              <button onClick={() => setItens(its => its.filter((_, j) => j !== i))}
                style={{ marginLeft:8, background:"none", border:"none", color:"#dc3545", cursor:"pointer" }}>
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

ReactDOM.render(<App/>, document.getElementById("root"));
`,

  sql: `-- SQL Playground (SQLite via sql.js — roda no dispositivo)

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  nome    TEXT    NOT NULL,
  cpf     TEXT    UNIQUE,
  cidade  TEXT,
  saldo   REAL    DEFAULT 0
);

-- Inserir dados
INSERT INTO clientes (nome, cpf, cidade, saldo) VALUES
  ('Ana Souza',    '111.111.111-11', 'Belo Horizonte', 15000.00),
  ('Bruno Lima',   '222.222.222-22', 'Contagem',        8500.50),
  ('Carla Mendes', '333.333.333-33', 'Betim',          22000.00),
  ('Diego Alves',  '444.444.444-44', 'Belo Horizonte',  3200.75),
  ('Eva Castro',   '555.555.555-55', 'Uberlandia',     41000.00);

-- Consultar todos
SELECT * FROM clientes ORDER BY saldo DESC;

-- Agrupar por cidade
SELECT cidade, COUNT(*) AS total, SUM(saldo) AS soma_saldos
FROM clientes
GROUP BY cidade
ORDER BY soma_saldos DESC;
`,
};

const EXTS: Record<Lang, string>  = { html:".html", js:".js", python:".py", react:".jsx", sql:".sql", neon:".sql" };
const MIMES: Record<Lang, string> = {
  html:"text/html", js:"text/javascript", python:"text/x-python",
  react:"text/javascript", sql:"text/plain", neon:"text/plain",
};

/* ── Neon HTTP helper ────────────────────────────────────────────────────── */
function parseNeon(cs: string): { host: string; pass: string } | null {
  try {
    const u = new URL(cs.replace(/^postgres:\/\//, "postgresql://"));
    return { host: u.hostname, pass: u.password };
  } catch { return null; }
}
async function neonExec(connStr: string, sql: string): Promise<{ cols: string[]; rows: unknown[][] }> {
  const p = parseNeon(connStr);
  if (!p) throw new Error("String inválida. Use: postgresql://user:pass@ep-xxx.neon.tech/dbname");
  const res = await fetch(`https://${p.host}/sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.pass}` },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(e.message ?? `HTTP ${res.status}`);
  }
  const d = await res.json() as { fields?: { name: string }[]; rows?: Record<string, unknown>[] };
  const cols = (d.fields ?? []).map(f => f.name);
  const rows = (d.rows ?? []).map(r => cols.map(c => r[c]));
  return { cols, rows };
}

/* ── Salvar / carregar ───────────────────────────────────────────────────── */
interface SavedFile { id: string; name: string; lang: string; code: string; date: string }
function loadSaved(): SavedFile[] {
  try { return JSON.parse(localStorage.getItem("sk_pg_v3_files") || "[]"); } catch { return []; }
}
function writeSaved(files: SavedFile[]) {
  try { localStorage.setItem("sk_pg_v3_files", JSON.stringify(files)); } catch { /* quota */ }
}

/* ── Copiar ─────────────────────────────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => {
      try { navigator.clipboard?.writeText(text); } catch { /* ignore */ }
      setOk(true); setTimeout(() => setOk(false), 1800);
    }} style={BTN(C.bg4)}>
      {ok ? <><CheckCheck size={12} color={C.grn3}/> Copiado</> : <><Copy size={12}/> Copiar</>}
    </button>
  );
}

/* ── Carregar script local-first ──────────────────────────────────────────
   Tenta ./local.js (embutido no APK) antes de qualquer CDN.              */
async function loadScript(src: string, timeoutMs = 25000): Promise<void> {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src;
    const t = setTimeout(() => { s.remove(); rej(new Error("timeout: " + src)); }, timeoutMs);
    s.onload  = () => { clearTimeout(t); res(); };
    s.onerror = () => { clearTimeout(t); s.remove(); rej(new Error("onerror: " + src)); };
    document.head.appendChild(s);
  });
}

/* ordem: local APK → CDN1 → CDN2 */
async function loadAny(candidates: string[], timeoutMs = 25000): Promise<void> {
  let last: Error = new Error("no candidates");
  for (const src of candidates) {
    try { await loadScript(src, timeoutMs); return; } catch(e) { last = e as Error; }
  }
  throw last;
}

/* ── Runner Python (Skulpt) ──────────────────────────────────────────────── */
async function runPython(
  code: string,
  onOut: (s: string) => void,
  onErr: (s: string) => void,
): Promise<void> {
  if (!window.Sk) {
    onOut("⏳ Carregando Python…\n");
    try {
      await loadAny([
        "./skulpt.min.js",
        "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/skulpt/1.2.0/skulpt.min.js",
      ]);
    } catch {
      onErr("❌ Python nao carregou. Verifique a conexao com a internet.");
      return;
    }
    try {
      await loadAny([
        "./skulpt-stdlib.js",
        "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js",
        "https://cdnjs.cloudflare.com/ajax/libs/skulpt/1.2.0/skulpt-stdlib.js",
      ]);
    } catch { /* stdlib opcional — continua */ }
  }
  if (!window.Sk) { onErr("❌ Python (Skulpt) nao disponivel."); return; }

  const lines: string[] = [];
  window.Sk.configure({
    output: (text: string) => { lines.push(text); onOut(lines.join("")); },
    read: (x: string) => {
      if (window.Sk!.builtinFiles?.files[x] !== undefined) return window.Sk!.builtinFiles.files[x];
      throw new Error("File not found: " + x);
    },
    execLimit: 30000,
  });
  try {
    await window.Sk.misceval.asyncToPromise(() =>
      window.Sk!.importMainWithBody("<stdin>", false, code, true)
    );
  } catch (e: unknown) {
    onErr("❌ Erro Python: " + (e as { toString(): string })?.toString?.());
  }
}

/* ── Runner JavaScript (nativo) ──────────────────────────────────────────── */
function runJavaScript(code: string): { output: string; error: string } {
  const lines: string[] = [];
  const origLog = console.log;
  const origWarn = console.warn;
  const origErr = console.error;
  try {
    const proxy = (...args: unknown[]) =>
      lines.push(args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "));
    console.log   = proxy;
    console.warn  = (...a) => { proxy("⚠️", ...a); };
    console.error = (...a) => { proxy("❌", ...a); };
    // eslint-disable-next-line no-new-func
    new Function(code)();
    return { output: lines.join("\n"), error: "" };
  } catch (e: unknown) {
    return { output: lines.join("\n"), error: "❌ " + (e as Error)?.message };
  } finally {
    console.log   = origLog;
    console.warn  = origWarn;
    console.error = origErr;
  }
}

/* ── Runner React/JSX (Babel) ──────────────────────────────────────────── */
async function buildReactHtml(code: string, setStatus: (s: string) => void): Promise<string> {
  if (!window.Babel) {
    setStatus("Carregando Babel…");
    // Babel é grande (2.8MB) — carrega só via internet, não embutido no APK
    setStatus("React precisa de internet (carregando Babel)…");
    try {
      await loadAny([
        "https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.0/babel.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.10/babel.min.js",
      ], 30000);
    } catch {
      throw new Error("A aba React precisa de conexao com a internet. HTML, JS, Python e SQL funcionam offline.");
    }
  }
  if (!window.Babel) throw new Error("Babel nao disponivel.");
  let transpiled: string;
  try {
    transpiled = window.Babel.transform(code, { presets: ["react"] }).code;
  } catch (e: unknown) {
    throw new Error("Erro de sintaxe JSX: " + (e as Error)?.message);
  }
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>body{font-family:Arial,sans-serif;margin:0;padding:16px}</style>
  <script crossorigin src="https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.js"></script>
</head>
<body>
  <div id="root"></div>
  <script>
try { ${transpiled} }
catch(e){ document.body.innerHTML='<div style="color:red;padding:20px;font-family:monospace;white-space:pre-wrap">Erro: '+e.message+'</div>'; }
  </script>
</body>
</html>`;
}

/* ── Runner SQL (sql.js / WebAssembly SQLite) ─────────────────────────── */
interface SqlJsModule { Database: new () => SqlDatabase }
let sqlJsModule: SqlJsModule | null = null;

async function runSQL(
  sql: string,
  setStatus: (s: string) => void,
): Promise<{ tables: { columns: string[]; values: unknown[][] }[]; error: string }> {
  if (!sqlJsModule) {
    setStatus("Carregando SQLite…");
    try {
      await loadAny([
        "./sql-wasm.js",
        "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js",
      ], 30000);
    } catch {
      return { tables: [], error: "❌ SQLite nao carregou. Verifique a conexao." };
    }
    if (!window.initSqlJs) return { tables: [], error: "❌ initSqlJs nao disponivel." };
    try {
      const m = await window.initSqlJs({
        locateFile: (f: string) => {
          if (typeof f === "string" && f.endsWith(".wasm")) return "./" + f;
          return f;
        },
      });
      sqlJsModule = m as unknown as SqlJsModule;
    } catch (e: unknown) {
      return { tables: [], error: "❌ SQLite WASM falhou: " + (e as Error)?.message };
    }
  }

  const db = new sqlJsModule.Database();
  try {
    const results = db.exec(sql);
    return { tables: results, error: "" };
  } catch (e: unknown) {
    return { tables: [], error: "❌ Erro SQL: " + (e as Error)?.message };
  } finally {
    try { db.close(); } catch { /* ignore */ }
  }
}

/* ── Download (Web Share API no Android) ─────────────────────────────────── */
async function dlCode(content: string, name: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  if (typeof navigator.canShare === "function") {
    try {
      const file = new File([blob], name, { type: mime });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: name });
        return;
      }
    } catch(e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
    }
  }
  if (typeof navigator.share === "function" && content.length < 200_000) {
    try { await navigator.share({ title: name, text: content }); return; }
    catch(e: unknown) { if (e instanceof Error && e.name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════ */
function safeGet(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

type SqlResult = { columns: string[]; values: unknown[][] };

export default function App() {
  const [lang,       setLang]       = useState<Lang>("html");
  const [codes,      setCodes]      = useState<Record<Lang, string>>({
    html:   safeGet("sk_pg3_html",   DEFAULTS.html),
    js:     safeGet("sk_pg3_js",     DEFAULTS.js),
    python: safeGet("sk_pg3_python", DEFAULTS.python),
    react:  safeGet("sk_pg3_react",  DEFAULTS.react),
    sql:    safeGet("sk_pg3_sql",    DEFAULTS.sql),
    neon:   safeGet("sk_pg3_neon",   DEFAULTS.neon),
  });
  const [output,     setOutput]     = useState("");
  const [errMsg,     setErrMsg]     = useState("");
  const [status,     setStatus]     = useState("");
  const [running,    setRunning]    = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [split,      setSplit]      = useState(50);
  const [saveName,   setSaveName]   = useState("");
  const [saved,      setSaved]      = useState<SavedFile[]>(loadSaved);
  const [showSaved,  setShowSaved]  = useState(false);
  const [autoRun,    setAutoRun]    = useState(true);
  const [htmlSrc,    setHtmlSrc]    = useState("");
  const [sqlTables,  setSqlTables]  = useState<SqlResult[]>([]);

  /* ── Neon state ── */
  const [neonConn,    setNeonConn]    = useState(() => { try { return localStorage.getItem("sk_neon_conn") ?? ""; } catch { return ""; } });
  const [neonShowKey, setNeonShowKey] = useState(false);
  const [neonOk,      setNeonOk]      = useState(false);
  const [neonConnMsg, setNeonConnMsg] = useState("");
  const [neonTables,  setNeonTables]  = useState<{ name: string; cols: number }[]>([]);
  const [neonResult,  setNeonResult]  = useState<{ cols: string[]; rows: unknown[][] } | null>(null);
  const [neonErr,     setNeonErr]     = useState("");
  const [neonRunning, setNeonRunning] = useState(false);
  const [neonSel,     setNeonSel]     = useState<string | null>(null);
  const [neonTemplates] = useState([
    { label:"Usuários",    sql:"CREATE TABLE IF NOT EXISTS users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);" },
    { label:"Produtos",    sql:"CREATE TABLE IF NOT EXISTS products (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  price DECIMAL(10,2) NOT NULL,\n  stock INTEGER DEFAULT 0\n);" },
    { label:"Contratos",   sql:"CREATE TABLE IF NOT EXISTS contracts (\n  id SERIAL PRIMARY KEY,\n  title VARCHAR(500) NOT NULL,\n  status VARCHAR(50) DEFAULT 'draft',\n  party_a TEXT,\n  party_b TEXT,\n  created_at TIMESTAMP DEFAULT NOW()\n);" },
    { label:"Log eventos", sql:"CREATE TABLE IF NOT EXISTS events (\n  id SERIAL PRIMARY KEY,\n  type VARCHAR(100) NOT NULL,\n  payload JSONB,\n  created_at TIMESTAMP DEFAULT NOW()\n);" },
  ]);

  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const dragging   = useRef(false);
  const autoTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blobUrl    = useRef<string>("");

  const code = codes[lang];
  const setCode = (v: string) => {
    setCodes(c => ({ ...c, [lang]: v }));
    try { localStorage.setItem(`sk_pg3_${lang}`, v); } catch { /* quota */ }
  };

  /* ── Auto-run HTML ── */
  useEffect(() => {
    if (lang === "html" && autoRun) {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      autoTimer.current = setTimeout(() => { runCode(); }, 700);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, lang, autoRun]);

  useEffect(() => {
    setOutput(""); setErrMsg(""); setStatus(""); setSqlTables([]);
    if (lang !== "html" && lang !== "react") setHtmlSrc("");
    setAutoRun(lang === "html");
  }, [lang]);

  useEffect(() => {
    return () => {
      if (blobUrl.current) { URL.revokeObjectURL(blobUrl.current); blobUrl.current = ""; }
    };
  }, [htmlSrc]);

  /* ── Arrastar divisor ── */
  const startDrag = (e: React.MouseEvent) => {
    dragging.current = true; e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const el = dividerRef.current?.parentElement;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setSplit(Math.max(20, Math.min(80, ((ev.clientX - rect.left) / rect.width) * 100)));
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  /* ── Executar ── */
  const runCode = useCallback(async () => {
    if (running) return;
    setErrMsg(""); setStatus(""); setOutput(""); setSqlTables([]);

    if (lang === "html") {
      try {
        if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
        const blob = new Blob([code], { type: "text/html" });
        const url  = URL.createObjectURL(blob);
        blobUrl.current = url;
        setHtmlSrc(url);
      } catch (e: unknown) {
        setErrMsg("❌ Erro ao criar previa: " + (e as Error)?.message);
      }
      return;
    }

    if (lang === "js") {
      const { output: out, error } = runJavaScript(code);
      setOutput(out);
      if (error) setErrMsg(error);
      return;
    }

    if (lang === "python") {
      setRunning(true);
      try {
        await runPython(
          code,
          (t) => { setOutput(t); setStatus(""); },
          (e) => { setErrMsg(e); setStatus(""); },
        );
      } catch (e: unknown) {
        setErrMsg("❌ Erro inesperado: " + (e as Error)?.message);
      } finally {
        setRunning(false); setStatus("");
      }
      return;
    }

    if (lang === "react") {
      setRunning(true);
      try {
        const html = await buildReactHtml(code, setStatus);
        if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
        const blob = new Blob([html], { type: "text/html" });
        const url  = URL.createObjectURL(blob);
        blobUrl.current = url;
        setHtmlSrc(url);
      } catch (e: unknown) {
        setErrMsg("❌ " + (e as Error)?.message);
      } finally {
        setRunning(false); setStatus("");
      }
      return;
    }

    if (lang === "sql") {
      setRunning(true);
      try {
        const { tables, error } = await runSQL(code, setStatus);
        setSqlTables(tables);
        if (error) setErrMsg(error);
        else if (tables.length === 0) setOutput("✅ Comando executado sem retorno de linhas.");
      } catch (e: unknown) {
        setErrMsg("❌ Erro SQL: " + (e as Error)?.message);
      } finally {
        setRunning(false); setStatus("");
      }
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, lang, running]);

  /* ── Neon callbacks ── */
  const neonConnect = useCallback(async () => {
    if (!neonConn.trim()) return;
    try { localStorage.setItem("sk_neon_conn", neonConn); } catch { /* quota */ }
    setNeonRunning(true); setNeonErr(""); setNeonConnMsg("Conectando...");
    try {
      const r = await neonExec(neonConn, "SELECT t.table_name, COUNT(c.column_name)::int AS col_count FROM information_schema.tables t LEFT JOIN information_schema.columns c ON c.table_name=t.table_name AND c.table_schema='public' WHERE t.table_schema='public' GROUP BY t.table_name ORDER BY t.table_name");
      setNeonTables(r.rows.map(row => ({ name: String(row[0]), cols: Number(row[1]) })));
      setNeonOk(true); setNeonConnMsg("✅ Conectado");
    } catch (e) { setNeonErr(String(e)); setNeonOk(false); setNeonConnMsg(""); }
    setNeonRunning(false);
  }, [neonConn]);

  const neonRun = useCallback(async () => {
    const sql = codes.neon.trim();
    if (!sql || neonRunning) return;
    setNeonRunning(true); setNeonErr(""); setNeonResult(null);
    try {
      const r = await neonExec(neonConn, sql);
      setNeonResult(r);
      // Refresh tables list if DDL
      if (/create\s+table|drop\s+table|alter\s+table/i.test(sql)) await neonConnect();
    } catch (e) { setNeonErr(String(e)); }
    setNeonRunning(false);
  }, [codes, neonConn, neonRunning, neonConnect]);

  const neonShowTable = useCallback(async (name: string) => {
    setNeonSel(name);
    setCode(codes.neon); // keep code unchanged
    setCodes(c => ({ ...c, neon: `SELECT * FROM "${name}" LIMIT 50;` }));
    setNeonRunning(true); setNeonErr(""); setNeonResult(null);
    try { setNeonResult(await neonExec(neonConn, `SELECT * FROM "${name}" LIMIT 50`)); }
    catch (e) { setNeonErr(String(e)); }
    setNeonRunning(false);
  }, [neonConn, codes]);

  /* ── Salvar / carregar ── */
  const saveFile = () => {
    const name = saveName.trim() || `${lang}-${Date.now()}`;
    const file: SavedFile = { id: Date.now().toString(), name, lang, code, date: new Date().toLocaleString("pt-BR") };
    const updated = [file, ...saved.filter(f => f.name !== name)].slice(0, 50);
    setSaved(updated); writeSaved(updated); setSaveName("");
  };
  const loadFile = (f: SavedFile) => {
    setCodes(c => ({ ...c, [f.lang as Lang]: f.code }));
    setLang(f.lang as Lang);
    setShowSaved(false);
  };
  const deleteFile = (id: string) => {
    const u = saved.filter(f => f.id !== id);
    setSaved(u); writeSaved(u);
  };

  /* ── Render ── */
  const LANGS: { id: Lang; label: string; color: string; icon: string }[] = [
    { id:"html",   label:"HTML",   color:C.org,  icon:"🌐" },
    { id:"js",     label:"JS",     color:C.org2, icon:"⚡" },
    { id:"python", label:"Python", color:C.grn2, icon:"🐍" },
    { id:"react",  label:"React",  color:C.blu2, icon:"⚛️" },
    { id:"sql",    label:"SQL",    color:C.pur2, icon:"🗄️" },
    { id:"neon",   label:"Neon",   color:"#00e5bf", icon:"🐘" },
  ];

  const showPreview = lang === "html" || lang === "react";
  const showOutput  = lang === "python" || lang === "js";
  const showSQL     = lang === "sql";
  const accent = LANGS.find(l => l.id === lang)?.color ?? C.txt2;

  return (
    <div style={{ position:"fixed", inset:0, display:"flex", flexDirection:"column", background:C.bg, color:C.txt, fontFamily:"system-ui,sans-serif" }}>

      {/* ── Barra superior ── */}
      <div style={{ height:48, background:C.bg2, borderBottom:`1px solid ${C.brd}`, display:"flex", alignItems:"center", gap:5, padding:"0 8px", flexShrink:0, overflowX:"auto" }}>
        <span style={{ fontSize:13, fontWeight:800, color:C.grn3, marginRight:4, whiteSpace:"nowrap" }}>⬡ SK Playground</span>

        {LANGS.map(l => (
          <button key={l.id} onClick={() => setLang(l.id)}
            style={{ ...BTN(lang===l.id ? C.bg3 : "transparent", lang===l.id ? l.color : C.txt3),
              border: lang===l.id ? `1px solid ${l.color}60` : "1px solid transparent",
              padding:"5px 9px", fontSize:11 }}>
            {l.icon} {l.label}
          </button>
        ))}

        {lang === "html" && (
          <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:C.txt2, cursor:"pointer", marginLeft:2, whiteSpace:"nowrap" }}>
            <input type="checkbox" checked={autoRun} onChange={e => setAutoRun(e.target.checked)} style={{ cursor:"pointer" }}/>
            Auto
          </label>
        )}

        <div style={{ flex:1 }}/>

        <input value={saveName} onChange={e => setSaveName(e.target.value)}
          onKeyDown={e => e.key==="Enter" && saveFile()}
          placeholder="Nome…" style={{ ...INP, width:120, fontSize:11 }}/>
        <button onClick={saveFile} style={{ ...BTN(C.bg3), padding:"5px 9px", fontSize:11 }} title="Salvar"><Save size={12}/></button>
        <button onClick={() => dlCode(code, (saveName.trim()||`meu-${lang}`)+EXTS[lang], MIMES[lang])}
          style={{ ...BTN(C.bg3), padding:"5px 9px", fontSize:11 }} title="Baixar"><Download size={12}/></button>
        <button onClick={() => setShowSaved(s => !s)}
          style={{ ...BTN(showSaved ? C.blu : C.bg3), border:`1px solid ${showSaved ? C.blu2 : C.brd}`, padding:"5px 9px", fontSize:11 }}>
          <FolderOpen size={12}/> {saved.length}
        </button>
        <button onClick={() => setFullscreen(f => !f)} style={{ ...BTN(C.bg3), padding:"5px 9px" }}>
          {fullscreen ? <Minimize2 size={13}/> : <Maximize2 size={13}/>}
        </button>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Painel de arquivos salvos */}
        {showSaved && (
          <div style={{ width:210, background:C.bg2, borderRight:`1px solid ${C.brd}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
            <div style={{ padding:"8px 10px", borderBottom:`1px solid ${C.brd}`, fontSize:11, fontWeight:700, color:C.txt2, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              Arquivos salvos
              <button onClick={() => setShowSaved(false)} style={{ ...BTN(C.bg3,C.txt3), padding:"2px 5px" }}><X size={10}/></button>
            </div>
            <div style={{ flex:1, overflowY:"auto" }}>
              {saved.length === 0 && (
                <div style={{ textAlign:"center", padding:20, fontSize:11, color:C.txt3 }}>Nenhum salvo</div>
              )}
              {saved.map(f => (
                <div key={f.id} style={{ padding:"6px 10px", borderBottom:`1px solid ${C.brd}`, cursor:"pointer" }}
                  onClick={() => loadFile(f)}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:9, color:LANGS.find(l=>l.id===f.lang)?.color??C.txt2, fontWeight:700, background:C.bg3, padding:"1px 4px", borderRadius:3 }}>
                      {f.lang.toUpperCase()}
                    </span>
                    <span style={{ fontSize:11, color:C.txt, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</span>
                    <button onClick={e => { e.stopPropagation(); deleteFile(f.id); }}
                      style={{ ...BTN(C.bg4,C.red), padding:"1px 4px" }}><Trash2 size={9}/></button>
                  </div>
                  <div style={{ fontSize:9, color:C.txt3, marginTop:1 }}>{f.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Neon panel (full width, no editor split) ── */}
        {lang === "neon" && (
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

            {/* Left: connection + tables */}
            <div style={{ width:220, background:C.bg2, borderRight:`1px solid ${C.brd}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
              {/* Connection string */}
              <div style={{ padding:"8px 10px", borderBottom:`1px solid ${C.brd}` }}>
                <div style={{ fontSize:11, color:"#00e5bf", fontWeight:700, marginBottom:5 }}>🐘 Neon PostgreSQL</div>
                <div style={{ position:"relative" }}>
                  <input
                    type={neonShowKey ? "text" : "password"}
                    value={neonConn}
                    onChange={e => setNeonConn(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && neonConnect()}
                    placeholder="postgresql://user:pass@ep-xxx.neon.tech/db"
                    style={{ ...INP, width:"100%", fontSize:10, paddingRight:24 }}
                  />
                  <button
                    onClick={() => setNeonShowKey(v => !v)}
                    style={{ position:"absolute", right:4, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.txt3, fontSize:11 }}
                  >{neonShowKey ? "🙈" : "👁"}</button>
                </div>
                <button
                  onClick={neonConnect}
                  disabled={neonRunning || !neonConn.trim()}
                  style={{ ...BTN(neonOk ? "#004d3f" : "#00e5bf22","#00e5bf"), border:"1px solid #00e5bf44", width:"100%", marginTop:5, fontSize:11, justifyContent:"center" }}
                >
                  {neonRunning ? "⏳" : neonOk ? "🔌 Reconectar" : "🔌 Conectar"}
                </button>
                {neonConnMsg && <div style={{ fontSize:10, color:"#00e5bf", marginTop:4 }}>{neonConnMsg}</div>}
                <div style={{ fontSize:9, color:C.txt3, marginTop:4 }}>Banco gratuito: <a href="https://neon.tech" target="_blank" rel="noreferrer" style={{ color:"#00e5bf" }}>neon.tech</a></div>
              </div>

              {/* Tables */}
              <div style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
                <div style={{ fontSize:10, color:C.txt3, fontWeight:700, padding:"2px 10px 6px", textTransform:"uppercase", letterSpacing:1 }}>
                  Tabelas ({neonTables.length})
                </div>
                {neonTables.length === 0 && neonOk && (
                  <div style={{ fontSize:10, color:C.txt3, textAlign:"center", padding:10 }}>Banco vazio</div>
                )}
                {neonTables.map(t => (
                  <div
                    key={t.name}
                    onClick={() => neonShowTable(t.name)}
                    style={{ padding:"5px 10px", cursor:"pointer", background: neonSel===t.name ? "#00e5bf15" : "transparent", borderLeft: neonSel===t.name ? "2px solid #00e5bf" : "2px solid transparent" }}
                  >
                    <div style={{ fontSize:11, color: neonSel===t.name ? "#00e5bf" : C.txt, fontFamily:"monospace", fontWeight:600 }}>{t.name}</div>
                    <div style={{ fontSize:9, color:C.txt3 }}>{t.cols} colunas</div>
                  </div>
                ))}

                {/* Templates */}
                <div style={{ borderTop:`1px solid ${C.brd}`, marginTop:8, padding:"8px 10px 0" }}>
                  <div style={{ fontSize:10, color:C.txt3, fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Templates</div>
                  {neonTemplates.map(t => (
                    <button
                      key={t.label}
                      onClick={() => { setCodes(c => ({ ...c, neon: t.sql })); setNeonSel(null); }}
                      style={{ ...BTN(C.bg3,C.txt2), width:"100%", justifyContent:"flex-start", marginBottom:3, fontSize:10, padding:"4px 8px" }}
                    >
                      + {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: SQL editor + results */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
              {/* SQL editor bar */}
              <div style={{ height:34, background:C.bg3, borderBottom:`1px solid ${C.brd}`, display:"flex", alignItems:"center", gap:6, padding:"0 8px", flexShrink:0 }}>
                <Database size={12} color="#00e5bf"/>
                <span style={{ fontSize:11, color:"#00e5bf", fontWeight:700 }}>SQL Editor</span>
                <div style={{ flex:1 }}/>
                <CopyBtn text={codes.neon}/>
                <button
                  onClick={neonRun}
                  disabled={neonRunning || !codes.neon.trim()}
                  style={{ ...BTN(neonRunning ? C.bg4 : "#00a88a", neonRunning ? C.txt3 : "#fff"), padding:"3px 10px", fontSize:11 }}
                >
                  {neonRunning ? "⏳" : <><Play size={11}/> Executar</>}
                </button>
              </div>
              <textarea
                value={codes.neon}
                onChange={e => setCodes(c => ({ ...c, neon: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === "Tab") { e.preventDefault(); const s=e.currentTarget.selectionStart; setCodes(c=>({...c,neon:codes.neon.slice(0,s)+"  "+codes.neon.slice(e.currentTarget.selectionEnd)})); setTimeout(()=>{ e.currentTarget.selectionStart=e.currentTarget.selectionEnd=s+2; },0); }
                  if ((e.ctrlKey||e.metaKey) && e.key==="Enter") { e.preventDefault(); neonRun(); }
                }}
                spellCheck={false}
                style={{ ...ED, flex:"0 0 auto", height:160, borderBottom:`1px solid ${C.brd}` }}
              />

              {/* Results */}
              <div style={{ flex:1, overflowY:"auto", background:C.bg, padding:12 }}>
                {!neonOk && !neonErr && (
                  <div style={{ textAlign:"center", paddingTop:40, color:C.txt3, fontSize:13 }}>
                    <div style={{ fontSize:40, marginBottom:10 }}>🐘</div>
                    <div>Cole a connection string e clique <strong style={{ color:"#00e5bf" }}>Conectar</strong></div>
                    <div style={{ fontSize:11, marginTop:8 }}>Depois escreva SQL e pressione <strong style={{ color:"#00e5bf" }}>▶ Executar</strong> ou <strong>Ctrl+Enter</strong></div>
                  </div>
                )}
                {neonErr && (
                  <div style={{ background:"rgba(248,81,73,.1)", border:`1px solid ${C.red}`, borderRadius:C.rad, padding:"10px 14px", marginBottom:10, fontSize:12, color:C.red, fontFamily:"monospace", whiteSpace:"pre-wrap" }}>
                    {neonErr}
                  </div>
                )}
                {neonResult && (
                  neonResult.rows.length === 0
                    ? <div style={{ background:"rgba(0,229,191,.08)", border:"1px solid #00e5bf44", borderRadius:C.rad, padding:"10px 14px", fontSize:12, color:"#00e5bf" }}>✅ Comando executado · 0 linhas retornadas</div>
                    : <div style={{ overflowX:"auto" }}>
                        <div style={{ fontSize:10, color:C.txt3, marginBottom:6 }}>{neonResult.rows.length} linha{neonResult.rows.length!==1?"s":""}</div>
                        <table style={{ borderCollapse:"collapse", fontSize:12, fontFamily:"'JetBrains Mono',monospace", minWidth:"100%" }}>
                          <thead>
                            <tr>{neonResult.cols.map((c,i)=>(
                              <th key={i} style={{ background:C.bg3, color:"#00e5bf", padding:"6px 10px", textAlign:"left", border:`1px solid ${C.brd}`, whiteSpace:"nowrap" }}>{c}</th>
                            ))}</tr>
                          </thead>
                          <tbody>
                            {neonResult.rows.map((row,ri)=>(
                              <tr key={ri} style={{ background:ri%2===0?C.bg:C.bg2 }}>
                                {row.map((cell,ci)=>(
                                  <td key={ci} style={{ padding:"5px 10px", border:`1px solid ${C.brd}`, color:C.txt, whiteSpace:"nowrap", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis" }}>
                                    {cell===null?<span style={{ color:C.txt3 }}>NULL</span>:String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Editor + Preview */}
        {lang !== "neon" && <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* Editor */}
          <div style={{ width:fullscreen?"0%":`${split}%`, display:fullscreen?"none":"flex", flexDirection:"column", borderRight:`1px solid ${C.brd}`, flexShrink:0, minWidth:0 }}>
            <div style={{ height:34, background:C.bg3, borderBottom:`1px solid ${C.brd}`, display:"flex", alignItems:"center", gap:6, padding:"0 8px", flexShrink:0 }}>
              <span style={{ fontSize:11, color:accent, fontWeight:700 }}>
                {lang==="html"?"index.html":lang==="js"?"script.js":lang==="python"?"script.py":lang==="react"?"App.jsx":"query.sql"}
              </span>
              <div style={{ flex:1 }}/>
              <CopyBtn text={code}/>
              <button onClick={() => setCode(DEFAULTS[lang])}
                style={{ ...BTN(C.bg4,C.txt3), padding:"2px 6px", fontSize:10 }} title="Restaurar exemplo">↺</button>
              {(!autoRun || lang !== "html") && (
                <button onClick={runCode} disabled={running}
                  style={{ ...BTN(running ? C.bg4 : C.grn, running ? C.txt3 : "#fff"), padding:"3px 10px", fontSize:11 }}>
                  {running ? "⏳" : <><Play size={11}/> Executar</>}
                </button>
              )}
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const s = e.currentTarget.selectionStart;
                  setCode(code.slice(0, s) + "  " + code.slice(e.currentTarget.selectionEnd));
                  setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2; }, 0);
                }
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !autoRun) runCode();
              }}
              spellCheck={false}
              style={ED}
            />
          </div>

          {/* Divisor */}
          {!fullscreen && (
            <div ref={dividerRef} onMouseDown={startDrag}
              style={{ width:5, background:C.bg3, cursor:"col-resize", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", borderLeft:`1px solid ${C.brd}`, borderRight:`1px solid ${C.brd}` }}>
              <ChevronRight size={9} color={C.txt3}/>
            </div>
          )}

          {/* Preview / Output / SQL */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
            <div style={{ height:34, background:C.bg3, borderBottom:`1px solid ${C.brd}`, display:"flex", alignItems:"center", gap:6, padding:"0 10px", flexShrink:0 }}>
              <span style={{ fontSize:11, color:C.txt2, fontWeight:700 }}>
                {status
                  ? <span style={{ color:C.org }}>{status}</span>
                  : showPreview ? "👁 Previa"
                  : showSQL ? <><Database size={11}/> Resultado SQL</>
                  : "📟 Saida"}
              </span>
              {fullscreen && (
                <button onClick={runCode} disabled={running}
                  style={{ ...BTN(C.grn), padding:"3px 10px", fontSize:11 }}>
                  {running ? "⏳" : <><Play size={11}/> Executar</>}
                </button>
              )}
              <div style={{ flex:1 }}/>
              <button onClick={() => setFullscreen(f => !f)} style={{ ...BTN(C.bg4,C.txt3), padding:"2px 6px" }}>
                {fullscreen ? <Minimize2 size={11}/> : <Maximize2 size={11}/>}
              </button>
              {(showOutput || showSQL) && (output || sqlTables.length > 0) && (
                <button onClick={() => { setOutput(""); setSqlTables([]); setErrMsg(""); }} style={{ ...BTN(C.bg4,C.txt3), padding:"2px 6px" }}>
                  <Trash2 size={11}/>
                </button>
              )}
            </div>

            {/* Preview iframe — HTML / React */}
            {showPreview && (
              <iframe
                ref={iframeRef}
                src={htmlSrc || "about:blank"}
                title="preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                style={{ flex:1, border:"none", background:"#fff" }}
              />
            )}

            {/* JS / Python output */}
            {showOutput && (
              <div style={{ flex:1, overflowY:"auto", background:C.bg, padding:14 }}>
                {!output && !errMsg && !running && !status && (
                  <div style={{ textAlign:"center", paddingTop:40, color:C.txt3, fontSize:13 }}>
                    <Play size={32} color={C.txt3} style={{ display:"block", margin:"0 auto 10px" }}/>
                    Clique em <strong style={{ color:C.grn2 }}>▶ Executar</strong>
                  </div>
                )}
                {errMsg && (
                  <div style={{ background:"rgba(248,81,73,.1)", border:`1px solid ${C.red}`, borderRadius:C.rad, padding:"10px 14px", marginBottom:10, fontSize:12, color:C.red, fontFamily:"monospace", whiteSpace:"pre-wrap" }}>
                    {errMsg}
                  </div>
                )}
                <pre style={{ margin:0, fontSize:12, fontFamily:"'JetBrains Mono',Consolas,monospace", color:C.grn3, lineHeight:1.7, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                  {output}
                </pre>
              </div>
            )}

            {/* SQL output — tabelas */}
            {showSQL && (
              <div style={{ flex:1, overflowY:"auto", background:C.bg, padding:14 }}>
                {!sqlTables.length && !errMsg && !running && !status && !output && (
                  <div style={{ textAlign:"center", paddingTop:40, color:C.txt3, fontSize:13 }}>
                    <Database size={32} color={C.txt3} style={{ display:"block", margin:"0 auto 10px" }}/>
                    Clique em <strong style={{ color:C.pur2 }}>▶ Executar</strong> para rodar o SQL
                  </div>
                )}
                {errMsg && (
                  <div style={{ background:"rgba(248,81,73,.1)", border:`1px solid ${C.red}`, borderRadius:C.rad, padding:"10px 14px", marginBottom:10, fontSize:12, color:C.red, fontFamily:"monospace", whiteSpace:"pre-wrap" }}>
                    {errMsg}
                  </div>
                )}
                {output && !errMsg && (
                  <div style={{ background:"rgba(63,185,80,.1)", border:`1px solid ${C.grn}`, borderRadius:C.rad, padding:"10px 14px", marginBottom:10, fontSize:12, color:C.grn2 }}>
                    {output}
                  </div>
                )}
                {sqlTables.map((tbl, ti) => (
                  <div key={ti} style={{ marginBottom:20, overflowX:"auto" }}>
                    <div style={{ fontSize:11, color:C.txt3, marginBottom:6 }}>
                      Resultado {ti+1} — {tbl.values.length} linha{tbl.values.length!==1?"s":""}
                    </div>
                    <table style={{ borderCollapse:"collapse", fontSize:12, width:"100%", fontFamily:"'JetBrains Mono',monospace" }}>
                      <thead>
                        <tr>
                          {tbl.columns.map((col, ci) => (
                            <th key={ci} style={{ background:C.bg3, color:C.pur2, padding:"6px 10px", textAlign:"left", border:`1px solid ${C.brd}`, whiteSpace:"nowrap" }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tbl.values.map((row, ri) => (
                          <tr key={ri} style={{ background: ri%2===0 ? C.bg : C.bg2 }}>
                            {row.map((cell, ci) => (
                              <td key={ci} style={{ padding:"5px 10px", border:`1px solid ${C.brd}`, color:C.txt, whiteSpace:"nowrap" }}>
                                {cell === null ? <span style={{ color:C.txt3 }}>NULL</span> : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>}
      </div>

      {/* ── Barra inferior ── */}
      <div style={{ height:24, background:C.bg2, borderTop:`1px solid ${C.brd}`, display:"flex", alignItems:"center", padding:"0 10px", gap:10, fontSize:10, color:C.txt3, flexShrink:0 }}>
        <span style={{ color:accent }}>● {lang.toUpperCase()}</span>
        <span>{code.split("\n").length} linhas</span>
        <span>{code.length} chars</span>
        <div style={{ flex:1 }}/>
        <span>Ctrl+Enter — executar</span>
        <span>Tab — indentar</span>
      </div>

      {/* ── Botão novo arquivo ── */}
      <button
        onClick={() => {
          const opcoes = LANGS.map(l => l.id).join("/");
          const escolha = (prompt("Linguagem (" + opcoes + "):") ?? lang) as Lang;
          const nl: Lang = LANGS.some(l => l.id === escolha) ? escolha : "html";
          setLang(nl);
          setCode(DEFAULTS[nl]);
          setSaveName("");
        }}
        style={{ ...BTN(C.blu,"#fff"), position:"fixed", bottom:36, right:14, borderRadius:"50%", width:42, height:42, padding:0, justifyContent:"center", boxShadow:"0 4px 20px #0008" }}
        title="Novo arquivo">
        <Plus size={18}/>
      </button>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.brd}; border-radius: 3px; }
        textarea::selection { background: rgba(56,139,253,.3); }
        table { min-width: 100%; }
      `}</style>
    </div>
  );
}
