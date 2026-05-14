import { useState, useEffect, useMemo } from 'react';

// ── DATA ────────────────────────────────────────────

const CHAINS = [
  { id: 'zksync', n: 'ZKsync Era', v: '~4,000 tx/batch', batch: 4000, note: 'Largest ZK rollup by proof volume. Fermah integration live.' },
  { id: 'scroll', n: 'Scroll', v: '~2,500 tx/batch', batch: 2500, note: 'EVM-equivalent zkRollup. Fermah collaboration for high-load proving.' },
  { id: 'ethereum', n: 'Ethereum', v: '~1 block', batch: 1, note: 'Full block proving via EthProofs. Fermah generates with RISC Zero.' },
  { id: 'linea', n: 'Linea', v: '~3,000 tx/batch', batch: 3000, note: 'Consensys zkEVM rollup.' },
  { id: 'custom', n: 'Custom', v: '~1,000 tx/batch', batch: 1000, note: 'Estimate for custom ZK apps, bridges, coprocessors.' },
];
const PROOFS = [
  { id: 'groth16', n: 'Groth16 (SNARK)', d: 'Most gas-efficient verification. Trusted setup required.', systems: ['zksync','scroll','linea','custom'] },
  { id: 'stark', n: 'STARK (FRI-based)', d: 'No trusted setup. Larger proofs, faster proving.', systems: ['zksync','scroll','ethereum','custom'] },
  { id: 'risczero', n: 'RISC Zero zkVM', d: 'General-purpose zkVM. Write Rust, prove execution.', systems: ['ethereum','custom'] },
  { id: 'sp1', n: 'SP1 (Succinct)', d: 'High-performance zkVM. Optimized for speed.', systems: ['ethereum','custom'] },
  { id: 'plonk', n: 'Plonk (Universal)', d: 'Universal setup. Good balance of size and cost.', systems: ['zksync','scroll','linea','custom'] },
];
const COSTS: Record<string, { t: number; c: number; g: string }> = {
  groth16: { t: 2280, c: 17.97, g: 'Nvidia L4' },
  stark: { t: 1800, c: 14.50, g: 'Nvidia L4' },
  risczero: { t: 3600, c: 28.00, g: 'Nvidia A100' },
  sp1: { t: 2400, c: 22.00, g: 'Nvidia A100' },
  plonk: { t: 2100, c: 16.50, g: 'Nvidia L4' },
};
const MULT: Record<string, number> = { zksync: 1, scroll: 1.1, ethereum: 8.5, linea: 1.05, custom: 1.2 };

const PROOF_SYSTEMS_LANDING = [
  { n: 'RISC Zero', s: 'live', d: 'General-purpose zkVM. RV32IM.', k: '1.4 MGHz / op' },
  { n: 'SP1', s: 'live', d: "Succinct's open-source zkVM.", k: '2.1 MGHz / op' },
  { n: 'Boojum', s: 'live', d: 'Powers ZKsync Era batches.', k: 'Batch · 38s p50' },
  { n: 'Plonky3', s: 'live', d: "Polygon's modular STARK kit.", k: '0.9 MGHz / op' },
  { n: 'Jolt', s: 'beta', d: 'Lookup-heavy lasso prover.', k: 'Q3 mainnet' },
  { n: 'Halo2', s: 'live', d: 'Plonkish backend, KZG / IPA.', k: '1.1 MGHz / op' },
  { n: 'Nexus', s: 'beta', d: 'Recursive folding zkVM.', k: 'Q4 mainnet' },
  { n: 'Stwo', s: 'beta', d: "Starkware's Circle STARK.", k: 'Soon' },
];

function fmtTime(s: number) { if (s < 60) return s + 's'; const m = Math.floor(s / 60); const r = s % 60; return r > 0 ? m + 'm ' + r + 's' : m + 'm'; }

function useTickingValue(seed: number, fn: (x: number) => number, ms = 1800) {
  const [v, setV] = useState(seed);
  useEffect(() => { const id = setInterval(() => setV(x => fn(x)), ms); return () => clearInterval(id); }, []);
  return v;
}

// ── COMPONENTS ──────────────────────────────────────

function Nav() {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ background: 'color-mix(in oklab, var(--cream) 86%, transparent)', borderColor: 'var(--hairline)' }}>
      <div className="max-w-[1320px] mx-auto px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="font-display text-[28px] tracking-tight">Ferm<em className="italic text-rust not-italic" style={{ fontStyle: 'italic', color: 'var(--accent)' }}>a</em>h</span>
        </div>
        <div className="hidden md:flex gap-8 font-mono text-[12px] tracking-wide uppercase text-warm-500">
          <a href="#how" className="hover:text-ink no-underline text-inherit">How it works</a>
          <a href="#proof" className="hover:text-ink no-underline text-inherit">Proof systems</a>
          <a href="#metrics" className="hover:text-ink no-underline text-inherit">Performance</a>
          <a href="#calculator" className="hover:text-ink no-underline text-inherit">Calculator</a>
          <a href="#operators" className="hover:text-ink no-underline text-inherit">Operators</a>
        </div>
        <a href="#calculator" className="font-mono text-[12px] uppercase tracking-wider px-4 py-2.5 border border-ink rounded-full text-ink no-underline flex items-center gap-2 hover:bg-ink hover:text-cream transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-rust" style={{ boxShadow: '0 0 0 3px rgba(196,81,26,0.3)' }} />
          Open calculator
        </a>
      </div>
    </nav>
  );
}

function LogoMark() {
  return (
    <div className="w-[30px] h-[30px] rounded-full border-[1.5px] border-ink relative" style={{
      background: 'radial-gradient(circle at 32% 32%, var(--cream) 0 14%, transparent 15%), conic-gradient(from 0deg, var(--accent), #00000000 50%, var(--accent))'
    }}>
      <div className="absolute inset-[5px] rounded-full" style={{ border: '1px solid var(--ink)', borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-28 pb-16 relative">
      <div className="max-w-[1320px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-warm-500 flex items-center gap-3 mb-7">
            <span className="w-9 h-px bg-warm-400" />
            Community tool · Fermah ecosystem
          </div>
          <h1 className="font-display text-[clamp(56px,8vw,128px)] leading-[0.92] tracking-tight font-normal">
            <span className="block">A marketplace</span>
            <span className="block">for <em className="italic text-rust">zero-knowledge</em></span>
            <span className="block">compute.</span>
          </h1>
        </div>
        <div className="flex flex-col gap-7 items-start pb-4">
          <div className="font-mono text-[11px] text-warm-400 tracking-wider">FERMAH / PROVING NETWORK / EST. 2024</div>
          <p className="text-[22px] leading-relaxed max-w-[460px]">
            A decentralized marketplace where rollups, bridges and ZK apps
            buy proofs from the cheapest <em className="italic text-rust">available</em> operator -
            in seconds, not hours.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="#calculator" className="font-mono text-[12px] uppercase tracking-wider px-6 py-4 rounded-full border border-ink bg-ink text-cream no-underline hover:bg-rust hover:border-rust hover:text-white transition-colors">
              Open the calculator →
            </a>
            <a href="#how" className="font-mono text-[12px] uppercase tracking-wider px-6 py-4 rounded-full border border-ink text-ink no-underline hover:bg-ink hover:text-cream transition-colors">
              How it works
            </a>
          </div>
          <div className="border rounded p-5 w-full max-w-[460px]" style={{ borderColor: 'var(--hairline)', background: 'color-mix(in oklab, var(--cream) 90%, var(--ink) 4%)' }}>
            <h4 className="font-mono text-[11px] tracking-[0.14em] uppercase text-warm-400 mb-3 font-medium">Field report · ZKsync integration</h4>
            <div className="font-display italic text-[22px] leading-snug">
              "We dropped batch proving latency by <em className="not-italic text-rust">3.4x</em> and cut per-batch cost roughly a third - without provisioning a single GPU."
            </div>
            <div className="font-mono text-[11px] text-warm-400 mt-3">- Infrastructure team, ZKsync · 2025</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const proofs = useTickingValue(184293, x => x + Math.floor(Math.random() * 9 + 2));
  const gpus = useTickingValue(2184, x => x + Math.floor(Math.random() * 5 - 2));
  const avg = useTickingValue(0.041, x => Math.max(0.028, Math.min(0.058, x + (Math.random() - 0.5) * 0.004)));
  const latency = useTickingValue(11.4, x => Math.max(8.2, Math.min(14.8, x + (Math.random() - 0.5) * 0.4)));

  const items = [
    { l: 'PROOFS / 24H', v: proofs.toLocaleString(), live: true },
    { l: 'ACTIVE OPERATORS', v: gpus.toLocaleString() },
    { l: 'AVG $/PROOF', v: '$' + avg.toFixed(3), live: true },
    { l: 'MEDIAN LATENCY', v: latency.toFixed(1) + ' s' },
    { l: 'CHAINS LIVE', v: '11' },
    { l: 'PROOF SYSTEMS', v: 'RISC0 · SP1 · Boojum · Plonky3 · Jolt' },
    { l: 'UPTIME', v: '99.982%' },
  ];
  const doubled = [...items, ...items];

  return (
    <div className="border-y overflow-hidden relative" style={{ borderColor: 'var(--hairline)', background: 'color-mix(in oklab, var(--cream) 90%, var(--ink) 3%)' }}>
      <div className="flex gap-0 whitespace-nowrap py-4 animate-[scroll_60s_linear_infinite]">
        {doubled.map((it, i) => (
          <div key={i} className="inline-flex items-center gap-3.5 px-9 font-mono text-[13px] text-ink" style={{ borderRight: '1px solid var(--hairline)' }}>
            {it.live && <span className="w-2 h-2 rounded-full bg-rust animate-pulse" />}
            <span className="text-warm-400 uppercase tracking-wider text-[11px]">{it.l}</span>
            <span className="font-medium">{it.v}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function ValueProps() {
  const items = [
    { g: 'f', h: 'Pay for proofs, not hardware.', p: 'Submit a job, get a proof back. No GPU contracts, no idle racks, no on-call rotations.', t: '01 / DEVELOPERS' },
    { g: '\u03A9', h: 'One API, every proof system.', p: 'RISC0, SP1, Boojum, Plonky3, Jolt - and whatever ships next. Compile once, route by price.', t: '02 / INTEGRATION' },
    { g: '\u2211', h: 'A real open market.', p: 'Operators bid on every job. Buyers see the receipt. No middlemen, no take-rate hidden in latency.', t: '03 / ECONOMICS' },
  ];
  return (
    <section id="why" className="py-28">
      <div className="max-w-[1320px] mx-auto px-10">
        <SectionHeader num="01" title={<>Built for <em className="text-rust">builders</em>, priced like infrastructure.</>} lede="Zero-knowledge has gotten faster every quarter. Procuring the hardware to run it hasn't. Fermah turns proof generation into a spot market - competitive, observable, and on-demand." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t" style={{ borderColor: 'var(--hairline)' }}>
          {items.map((it, i) => (
            <div key={i} className="p-10 flex flex-col gap-4" style={{ borderRight: i < 2 ? '1px solid var(--hairline)' : 'none' }}>
              <div className="w-16 h-16 flex items-center justify-center font-display italic text-[44px] text-rust rounded-full border" style={{ borderColor: 'var(--hairline)' }}>{it.g}</div>
              <h3 className="font-display text-[36px] leading-tight font-normal">{it.h}</h3>
              <p className="text-warm-500 text-[17px]">{it.p}</p>
              <div className="mt-auto pt-5 font-mono text-[11px] text-warm-400 uppercase tracking-wider border-t" style={{ borderColor: 'var(--hairline)' }}>{it.t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 'i.', h: 'You submit a job.', p: "POST your witness, circuit hash, and a max bid. Fermah's matchmaker hashes the request and broadcasts it.", s: 'POST /v1/jobs' },
    { n: 'ii.', h: 'Operators race.', p: 'Independent provers stake on outcome, compete on cost-per-cycle, and stream partial proofs.', s: 'Dutch auction · 200ms ticks' },
    { n: 'iii.', h: 'You get a receipt.', p: 'Verified proof + on-chain settlement + a public ledger entry showing who proved it, how fast, and at what price.', s: 'Settles in ≤ 1 block' },
  ];
  return (
    <section id="how" className="py-28 border-t" style={{ borderColor: 'var(--hairline)' }}>
      <div className="max-w-[1320px] mx-auto px-10">
        <SectionHeader num="02" title={<>How a <em className="text-rust">proof</em> moves through the network.</>} lede="Three actors, one round-trip. The matchmaker negotiates, the operator computes, the settlement contract pays out." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border" style={{ borderColor: 'var(--hairline)', background: 'color-mix(in oklab, var(--cream) 94%, var(--ink) 3%)' }}>
          {steps.map((s, i) => (
            <div key={i} className="p-9 flex flex-col gap-4 relative min-h-[320px]" style={{ borderRight: i < 2 ? '1px solid var(--hairline)' : 'none' }}>
              <div className="font-display italic text-[80px] leading-none text-rust">{s.n}</div>
              <h4 className="font-display text-[28px] font-normal">{s.h}</h4>
              <p className="text-warm-500 text-[16px]">{s.p}</p>
              <div className="mt-auto font-mono text-[10px] tracking-wider uppercase text-warm-400 px-2.5 py-1.5 border rounded-full self-start" style={{ borderColor: 'var(--hairline)' }}>{s.s}</div>
              {i < 2 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cream border items-center justify-center font-mono text-[12px] z-10" style={{ borderColor: 'var(--hairline)' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofSystems() {
  return (
    <section id="proof" className="py-28 border-t" style={{ borderColor: 'var(--hairline)' }}>
      <div className="max-w-[1320px] mx-auto px-10">
        <SectionHeader num="03" title={<>Compile <em className="text-rust">once</em>. Route by price.</>} lede="Fermah speaks every major proof system natively. Switch backends without rewriting your circuit." />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-y" style={{ borderColor: 'var(--hairline)' }}>
        {PROOF_SYSTEMS_LANDING.map((s, i) => (
          <div key={i} className="p-7 flex flex-col gap-2.5 cursor-pointer hover:bg-warm-100/50 transition-colors" style={{ borderRight: (i + 1) % 4 !== 0 ? '1px solid var(--hairline)' : 'none' }}>
            <div className="flex items-center justify-between">
              <div className="font-display text-[26px]">{s.n}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-warm-400 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${s.s === 'live' ? 'bg-rust' : 'bg-amber'}`} />
                {s.s}
              </div>
            </div>
            <div className="text-warm-400 text-[14px]">{s.d}</div>
            <div className="mt-auto font-mono text-[11px] text-ink tracking-wide">{s.k}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metrics() {
  const rows = [
    { n: 'Self-hosted cluster', w: 100, v: '$1.00 / batch' },
    { n: 'Spot GPU rentals', w: 78, v: '$0.78' },
    { n: 'Closed prover SaaS', w: 84, v: '$0.84' },
    { n: 'Fermah marketplace', w: 36, v: '$0.36', us: true },
  ];
  return (
    <section id="metrics" className="py-28 border-t" style={{ borderColor: 'var(--hairline)' }}>
      <div className="max-w-[1320px] mx-auto px-10">
        <SectionHeader num="04" title={<>The <em className="text-rust">cheapest</em> proof wins.</>} lede="Pricing observed across ZKsync batch jobs, normalized to a self-hosted baseline. Live operators keep underbidding each other." />
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-0 border" style={{ borderColor: 'var(--hairline)' }}>
          <div className="p-12 flex flex-col gap-2" style={{ borderRight: '1px solid var(--hairline)' }}>
            <div className="font-mono text-[11px] uppercase tracking-wider text-warm-400">Avg. savings vs. self-host</div>
            <div className="font-display text-[84px] leading-none tracking-tight"><em className="italic text-rust">64</em><sup className="text-[26px] text-warm-400">%</sup></div>
            <div className="text-[15px] text-warm-400 max-w-[280px]">Median across 1.2M jobs in the last 30 days.</div>
            <div className="mt-3 flex flex-col gap-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[110px_1fr_60px] gap-3 items-center font-mono text-[11px]">
                  <span className="text-warm-400 uppercase tracking-wide">{r.n}</span>
                  <div className="h-2.5 bg-warm-200 rounded-sm overflow-hidden relative"><div className={`h-full ${r.us ? 'bg-ink' : 'bg-rust'} rounded-sm`} style={{ width: r.w + '%' }} /></div>
                  <span className="text-ink text-right">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-12 flex flex-col gap-2" style={{ borderRight: '1px solid var(--hairline)' }}>
            <div className="font-mono text-[11px] uppercase tracking-wider text-warm-400">Median proof latency</div>
            <div className="font-display text-[84px] leading-none tracking-tight"><em className="italic text-rust">11.4</em><sup className="text-[26px] text-warm-400">s</sup></div>
            <div className="text-[15px] text-warm-400">From submission to verified receipt for a ZKsync batch (p50).</div>
            <div className="font-mono text-[11px] text-warm-400 mt-2">p99 · 19.8 s · p999 · 42.1 s</div>
          </div>
          <div className="p-12 flex flex-col gap-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-warm-400">Throughput · live</div>
            <div className="font-display text-[84px] leading-none tracking-tight"><em className="italic text-rust">184k</em></div>
            <div className="text-[15px] text-warm-400">Proofs settled per day across the network, averaged over the past week.</div>
            <div className="font-mono text-[11px] text-warm-400 mt-2">+18% week-over-week</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Operators() {
  const [util, setUtil] = useState(78);
  useEffect(() => { const id = setInterval(() => setUtil(60 + Math.floor(Math.random() * 35)), 1400); return () => clearInterval(id); }, []);

  return (
    <section id="operators" className="py-28 border-t" style={{ borderColor: 'var(--hairline)' }}>
      <div className="max-w-[1320px] mx-auto px-10">
        <SectionHeader num="05" title={<>Have <em className="text-rust">silicon</em>? Earn from it.</>} lede="Plug your GPUs, FPGAs or specialized provers into the marketplace. Set your minimum price, pick which proof systems you support, and let the matchmaker keep you saturated." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <h3 className="font-display text-[56px] leading-none font-normal mb-5">Operate a <em className="text-rust italic">prover</em>. Get paid per cycle.</h3>
            <p className="text-[19px] max-w-[480px]">Stake-weighted job routing. Per-second settlement. No proprietary scheduler - Fermah is open source from the matchmaker on down.</p>
            <ul className="list-none p-0 mt-6 flex flex-col gap-3.5">
              {['Bring your own hardware: H100s, MI300s, custom ASICs', 'Onboard with a single binary & a Wasm runtime', 'Receipts are public - your reputation is portable', "Slashing is bounded to a single job's bond"].map((li, i) => (
                <li key={i} className="flex gap-3.5 items-baseline text-[17px]">
                  <span className="text-rust font-mono text-[14px]">→</span>{li}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <a href="https://docs.fermah.xyz" target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] uppercase tracking-wider px-6 py-4 rounded-full border border-ink bg-ink text-cream no-underline hover:bg-rust hover:border-rust transition-colors inline-flex items-center gap-2">
                Run a prover →
              </a>
            </div>
          </div>
          {/* Console mock */}
          <div className="border rounded-md overflow-hidden font-mono text-[12px]" style={{ borderColor: 'var(--hairline)', background: 'color-mix(in oklab, var(--cream) 92%, var(--ink) 4%)' }}>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b text-[10px] uppercase tracking-wider text-warm-400" style={{ borderColor: 'var(--hairline)' }}>
              <span className="w-2 h-2 rounded-full bg-rust animate-pulse" />
              <span>operator · node-7f3a · sf-bay</span>
              <span className="ml-auto">{new Date().toISOString().slice(11, 19)} UTC</span>
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              <Row3 k="JOB" v="zksync-batch-#1,284,910" r="RISC0" />
              <Row3 k="CYCLES" v="2.14 × 10¹²" r="+0.04" />
              <Row3 k="BID" v={<><em className="not-italic text-rust">$0.034</em> / proof</>} r="won" />
              <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                <span className="text-warm-400">PROGRESS</span>
                <div className="h-1.5 bg-warm-200 rounded-sm overflow-hidden"><div className="h-full bg-rust rounded-sm transition-all" style={{ width: util + '%' }} /></div>
                <span className="text-warm-400">{util}%</span>
              </div>
              <Row3 k="EARNED · 24H" v="$1,284.92" r="↑ 9%" />
              <Row3 k="UTIL · 7D" v="88.4%" r="healthy" />
            </div>
            <div className="border-t px-3.5 py-2.5 flex justify-between text-[10px] uppercase tracking-wider text-warm-400" style={{ borderColor: 'var(--hairline)' }}>
              <span>stake · 12.0 ETH</span>
              <span>queue · 4 jobs</span>
              <span>slash · 0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row3({ k, v, r }: { k: string; v: React.ReactNode; r: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr_auto] gap-3">
      <span className="text-warm-400">{k}</span>
      <span className="text-ink">{v}</span>
      <span className="text-warm-400">{r}</span>
    </div>
  );
}

// ── CALCULATOR (full interactive) ───────────────────

function Calculator() {
  const [chain, setChain] = useState('zksync');
  const [proof, setProof] = useState('groth16');
  const [batches, setBatches] = useState(100);
  const [useFermah, setUseFermah] = useState(true);

  const ch = CHAINS.find(c => c.id === chain)!;
  const avail = PROOFS.filter(p => p.systems.includes(chain));

  useMemo(() => {
    if (!avail.find(p => p.id === proof)) setProof(avail[0]?.id || 'groth16');
  }, [chain]);

  const base = COSTS[proof] || COSTS.groth16;
  const m = MULT[chain] || 1;
  const d = useFermah ? 0.65 : 1;
  const cpb = Math.round(base.c * m * d * 100) / 100;
  const cpt = ch.batch > 0 ? Math.round(cpb / ch.batch * 10000) / 10000 : cpb;
  const pt = Math.round(base.t * m);
  const ops = Math.max(1, Math.ceil(batches * pt / 86400));
  const mo = Math.round(batches * 30 * cpb * 100) / 100;
  const selfMo = Math.round(batches * 30 * Math.round(base.c * m * 100) / 100 * 100) / 100;
  const sav = Math.round(selfMo - mo);

  return (
    <section id="calculator" className="py-28 border-t" style={{ borderColor: 'var(--hairline)' }}>
      <div className="max-w-[1320px] mx-auto px-10">
        <SectionHeader num="06" title={<>Know the <em className="text-rust">price</em> before you bid.</>} lede="The Fermah Proof Cost Calculator estimates monthly proving cost across chains and proof systems - with side-by-side numbers for self-hosted vs the Fermah marketplace." />

        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--hairline)', boxShadow: '0 30px 60px -40px rgba(26,26,24,0.35)' }}>
          {/* Browser bar */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 border-b font-mono text-[11px] uppercase tracking-wider text-warm-400" style={{ borderColor: 'var(--hairline)' }}>
            <span className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2.5 h-2.5 rounded-full bg-warm-300" />)}</span>
            <span className="flex-1 text-center">fermah proof calculator</span>
            <span>v0.4</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left - inputs */}
            <div className="p-6 flex flex-col gap-5 border-r" style={{ borderColor: 'var(--hairline)' }}>
              {/* Chain */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-warm-400 mb-2">Target chain</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CHAINS.map(c => (
                    <button key={c.id} onClick={() => setChain(c.id)}
                      className={`text-left px-3 py-2 border rounded text-sm transition-all ${chain === c.id ? 'bg-ink border-ink text-cream' : 'border-warm-200 hover:border-warm-300'}`}>
                      <div className="font-body font-semibold">{c.n}</div>
                      <div className="font-mono text-[10px] opacity-60 mt-0.5">{c.v}</div>
                    </button>
                  ))}
                </div>
                <div className="font-mono text-[10px] text-warm-400 mt-2">{ch.note}</div>
              </div>

              {/* Proof system */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-warm-400 mb-2">Proof system</label>
                <div className="flex flex-col gap-1.5">
                  {avail.map(p => (
                    <button key={p.id} onClick={() => setProof(p.id)}
                      className={`flex items-start gap-2.5 px-3 py-2.5 border rounded text-left transition-all ${proof === p.id ? 'border-rust bg-rust/5' : 'border-warm-200 hover:border-warm-300'}`}>
                      <span className={`w-3 h-3 mt-1 border-[1.5px] shrink-0 ${proof === p.id ? 'border-rust bg-rust' : 'border-warm-300'}`} />
                      <span>
                        <div className="font-body text-[15px] font-semibold text-ink">{p.n}</div>
                        <div className="font-mono text-[10px] text-warm-400 mt-0.5">{p.d}</div>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Batches slider */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-warm-400 mb-2">Batches per day</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="500" value={batches} onChange={e => setBatches(Number(e.target.value))}
                    className="flex-1 h-1 bg-warm-200 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-none" />
                  <input type="number" min="1" max="10000" value={batches} onChange={e => setBatches(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-transparent border-b-2 border-ink font-mono text-lg text-ink text-right outline-none" />
                </div>
              </div>

              {/* Toggle */}
              <button onClick={() => setUseFermah(!useFermah)} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
                <div className={`w-10 h-5 border-[1.5px] border-ink relative ${useFermah ? 'bg-ink' : 'bg-cream'}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 transition-all ${useFermah ? 'left-[18px] bg-cream' : 'left-0.5 bg-ink'}`} />
                </div>
                <span className="font-body text-[15px] text-ink">Use Fermah Proof Market</span>
                <span className="font-mono text-[10px] text-warm-400">(~35% savings)</span>
              </button>
            </div>

            {/* Right - results */}
            <div className="p-6 flex flex-col gap-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-warm-400">Estimate</div>
              <div className="font-display text-[64px] leading-none tracking-tight text-ink">${mo.toLocaleString()}</div>
              <div className="font-mono text-[11px] text-warm-400">per month</div>
              {useFermah && sav > 0 && <div className="font-mono text-[11px] text-rust">saving ${sav.toLocaleString()}/mo vs self-hosted</div>}

              <div className="h-px bg-ink/10 my-1" />
              <CalcRow k="Cost per batch" v={'$' + cpb} />
              <CalcRow k="Cost per tx" v={'$' + cpt} />
              <CalcRow k="Proving time" v={fmtTime(pt)} />
              <CalcRow k="GPU type" v={base.g} />
              <CalcRow k="Operators needed" v={String(ops)} />
              <CalcRow k="Monthly batches" v={(batches * 30).toLocaleString()} />

              {useFermah && (
                <div className="mt-auto border rounded p-3.5" style={{ borderColor: 'var(--hairline)', background: 'color-mix(in oklab, var(--accent) 8%, var(--cream) 92%)' }}>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-warm-400 mb-2">Fermah vs Self-hosted</div>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
                    <div>
                      <div className="font-mono text-[10px] text-warm-400 uppercase">Self-hosted</div>
                      <div className="font-display text-[28px] leading-none">${selfMo.toLocaleString()}</div>
                    </div>
                    <div className="font-mono text-[11px] text-warm-300 tracking-wider">VS</div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] text-rust uppercase">Fermah Market</div>
                      <div className="font-display text-[28px] leading-none text-rust">${mo.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 font-mono text-[11px] text-warm-400 text-center">
          Community tool · Built for the Fermah Creator Spotlight · Based on public benchmarks · Not official Fermah pricing
        </div>
      </div>
    </section>
  );
}

function CalcRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-baseline font-mono text-[12px]">
      <span className="text-warm-400">{k}</span>
      <span className="text-ink">{v}</span>
    </div>
  );
}

function Ecosystem() {
  const names = ['ZKsync', 'RISC Zero', 'Succinct', 'Polygon Labs', 'Scroll', 'Linea', 'Starkware', 'Aztec', 'Nexus', 'Lagrange', 'ZeroGravity'];
  const doubled = [...names, ...names];
  return (
    <div className="border-y overflow-hidden py-6" style={{ borderColor: 'var(--hairline)' }}>
      <div className="flex gap-20 animate-[scroll_50s_linear_infinite] whitespace-nowrap">
        {doubled.map((n, i) => (
          <span key={i} className="font-display italic text-[36px] text-warm-400 opacity-80 inline-flex items-center gap-4">
            {n} <span className="text-rust font-mono text-[14px] not-italic">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function FinalCTA() {
  return (
    <section className="py-36 text-center">
      <div className="max-w-[1320px] mx-auto px-10">
        <h2 className="font-display text-[clamp(64px,10vw,168px)] leading-[0.9] tracking-tight font-normal">
          Price a proof<br />before you <em className="italic text-rust">buy</em> one.
        </h2>
        <p className="mt-7 text-[22px] text-warm-500 max-w-[580px] mx-auto">
          Pick your chain, your proof system, your daily volume - get a real cost estimate in seconds.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap mt-10">
          <a href="#calculator" className="font-mono text-[12px] uppercase tracking-wider px-6 py-4 rounded-full border border-ink bg-ink text-cream no-underline hover:bg-rust hover:border-rust hover:text-white transition-colors">
            Open the calculator →
          </a>
          <a href="#proof" className="font-mono text-[12px] uppercase tracking-wider px-6 py-4 rounded-full border border-ink text-ink no-underline hover:bg-ink hover:text-cream transition-colors">
            Compare proof systems
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-11 font-mono text-[12px] text-warm-400" style={{ borderColor: 'var(--hairline)' }}>
      <div className="max-w-[1320px] mx-auto px-10 flex justify-between items-center gap-10 flex-wrap">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="font-display text-[28px] text-ink tracking-tight">Ferm<em className="italic text-rust" style={{ fontStyle: 'italic' }}>a</em>h</span>
          </div>
          <p className="font-mono text-[11px] tracking-wide text-warm-400">Community design study & cost calculator. Not an official Fermah product.</p>
        </div>
        <a href="https://github.com/Zhekinmaksim/fermah-proof-calculator" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-ink no-underline px-4 py-3 border rounded-full hover:bg-ink hover:text-cream transition-colors" style={{ borderColor: 'var(--hairline)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.6 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z"/></svg>
          <span>View on GitHub</span>
          <span className="text-[13px] opacity-60">↗</span>
        </a>
      </div>
    </footer>
  );
}

// ── SHARED ──────────────────────────────────────────

function SectionHeader({ num, title, lede }: { num: string; title: React.ReactNode; lede: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 mb-16 items-end">
      <div>
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-warm-400">- Section {num}</div>
        <h2 className="font-display text-[clamp(48px,7vw,96px)] leading-[0.95] tracking-tight font-normal mt-3.5">{title}</h2>
      </div>
      <p className="text-[21px] leading-relaxed max-w-[560px]">{lede}</p>
    </div>
  );
}

// ── APP ─────────────────────────────────────────────

export default function App() {
  useEffect(() => { document.body.classList.add('grain'); }, []);

  return (
    <>
      <Nav />
      <Hero />
      <Ticker />
      <ValueProps />
      <HowItWorks />
      <ProofSystems />
      <Metrics />
      <Calculator />
      <Ecosystem />
      <Operators />
      <FinalCTA />
      <Footer />
    </>
  );
}
