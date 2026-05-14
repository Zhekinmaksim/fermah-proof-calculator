import { useEffect, useMemo, useState } from 'react';
import {
  CHAINS,
  DATA_SOURCES,
  DEFAULT_MARKET_EFFICIENCY,
  PROOF_SYSTEMS,
  type ChainId,
  type ProofSystemId,
  calculateCost,
  formatTime,
} from './data/proofData';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const preciseMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 5,
});

const integer = new Intl.NumberFormat('en-US');

export default function App() {
  useEffect(() => {
    document.body.classList.add('grain');
    return () => document.body.classList.remove('grain');
  }, []);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <BenchmarkStrip />
        <Methodology />
        <ProofSystems />
        <UseCases />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-5 py-4 md:px-8">
        <a href="#" className="flex items-center gap-3 text-ink no-underline" aria-label="Fermah proof calculator home">
          <LogoMark />
          <span className="font-display text-[28px] tracking-tight">Fermah</span>
        </a>
        <div className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.14em] text-muted md:flex">
          <a href="#calculator" className="text-inherit no-underline hover:text-ink">Calculator</a>
          <a href="#methodology" className="text-inherit no-underline hover:text-ink">Methodology</a>
          <a href="#proof-systems" className="text-inherit no-underline hover:text-ink">Proof systems</a>
          <a href="#sources" className="text-inherit no-underline hover:text-ink">Sources</a>
        </div>
        <a
          href="#calculator"
          className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink no-underline transition-colors hover:bg-ink hover:text-canvas"
        >
          Open calculator
        </a>
      </div>
    </nav>
  );
}

function LogoMark() {
  return (
    <span
      className="relative inline-flex h-[30px] w-[30px] rounded-full border-[1.5px] border-ink"
      style={{
        background:
          'radial-gradient(circle at 32% 32%, var(--canvas) 0 14%, transparent 15%), conic-gradient(from 0deg, var(--accent), #00000000 50%, var(--accent))',
      }}
    >
      <span
        className="absolute inset-[5px] rounded-full"
        style={{ border: '1px solid var(--ink)', borderTopColor: 'transparent', borderLeftColor: 'transparent' }}
      />
    </span>
  );
}

function Hero() {
  return (
    <section id="calculator" className="border-b border-line bg-canvas">
      <div className="mx-auto max-w-[1180px] px-5 py-3 md:px-8 lg:py-4">
        <div className="mb-3 grid grid-cols-1 items-end gap-4 lg:grid-cols-[0.9fr_1fr]">
          <div>
            <div className="mb-1.5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.13em] text-muted">
              <span className="h-px w-9 bg-line" />
              Public benchmark model
            </div>
            <h1 className="max-w-[680px] font-display text-[34px] font-normal leading-[0.98] text-ink md:text-[40px]">
              Proof cost calculator.
            </h1>
          </div>
          <div>
            <p className="max-w-[560px] text-[13px] leading-5 text-muted">
              Estimate monthly proving costs from public benchmarks, compare a self-hosted baseline with a market-efficiency scenario, and see the assumptions behind every number.
            </p>
          </div>
        </div>

        <CalculatorPanel />
      </div>
    </section>
  );
}

function TrustMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border border-line bg-panel px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">{label}</div>
      <div className="mt-1 font-display text-[34px] leading-none text-ink">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{detail}</div>
    </div>
  );
}

function CalculatorPanel() {
  const [chainId, setChainId] = useState<ChainId>('zksync');
  const [proofSystemId, setProofSystemId] = useState<ProofSystemId>('groth16');
  const [batchesPerDay, setBatchesPerDay] = useState(100);
  const [useMarketEfficiency, setUseMarketEfficiency] = useState(true);

  const chain = CHAINS.find((item) => item.id === chainId) ?? CHAINS[0];
  const proofSystem = PROOF_SYSTEMS.find((item) => item.id === proofSystemId) ?? PROOF_SYSTEMS[0];
  const availableProofSystems = useMemo(
    () => PROOF_SYSTEMS.filter((item) => chain.proofSystems.includes(item.id)),
    [chain],
  );

  useEffect(() => {
    if (!chain.proofSystems.includes(proofSystemId)) {
      setProofSystemId(chain.proofSystems[0]);
    }
  }, [chain, proofSystemId]);

  const estimate = calculateCost(proofSystemId, chainId, batchesPerDay, useMarketEfficiency);
  const efficiencyLabel = Math.round((1 - DEFAULT_MARKET_EFFICIENCY) * 100);

  return (
    <section className="bg-canvas" aria-label="Proof cost calculator">
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="border-b border-line pb-7 lg:border-b-0 lg:border-r-[3px] lg:border-ink lg:pb-0 lg:pr-10">
          <Fieldset legend="Target chain">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CHAINS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setChainId(item.id)}
                  aria-pressed={chainId === item.id}
                  className={`min-h-[52px] rounded-lg border px-5 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust ${
                    chainId === item.id
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-canvas text-ink hover:border-ink'
                  }`}
                >
                  <span className="block font-body text-[17px] font-semibold leading-none">{item.shortName}</span>
                  <span className="mt-1 block font-mono text-[11px] leading-4 opacity-70">{item.batchLabel}</span>
                </button>
              ))}
            </div>
            <p className="mt-1.5 max-w-[560px] truncate font-mono text-[10px] leading-4 text-muted">{chain.note}</p>
          </Fieldset>

          <Fieldset legend="Proof system">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {availableProofSystems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setProofSystemId(item.id)}
                  aria-pressed={proofSystemId === item.id}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg border px-4 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust ${
                    proofSystemId === item.id
                      ? 'border-rust bg-rust/5'
                      : 'border-line bg-canvas hover:border-ink'
                  }`}
                >
                  <span className={`h-3 w-3 shrink-0 border-2 ${proofSystemId === item.id ? 'border-rust bg-rust' : 'border-soft'}`} />
                  <span className="min-w-0">
                    <span className="block truncate font-body text-[16px] font-semibold leading-none text-ink">{item.fullName}</span>
                  </span>
                </button>
              ))}
            </div>
          </Fieldset>

          <Fieldset legend="Workload">
            <div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={Math.min(batchesPerDay, 500)}
                  onChange={(event) => setBatchesPerDay(Number(event.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none bg-line accent-rust [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-line [&::-webkit-slider-thumb]:bg-canvas"
                  aria-label="Batches per day"
                />
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={batchesPerDay}
                  onChange={(event) => setBatchesPerDay(normalizeBatches(event.target.value))}
                  className="h-12 w-32 rounded-lg border border-line bg-canvas px-5 text-right font-mono text-[22px] text-ink outline-none focus:border-rust"
                  aria-label="Batches per day value"
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[12px] text-muted">
                <span>1</span>
                <span>Light</span>
                <span>Medium</span>
                <span>Heavy</span>
                <span>500</span>
              </div>
            </div>
          </Fieldset>

          <button
            type="button"
            onClick={() => setUseMarketEfficiency((value) => !value)}
            aria-pressed={useMarketEfficiency}
            className="mt-3 flex w-full items-center justify-center gap-7 rounded-lg border border-line bg-canvas px-5 py-2.5 text-center transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
          >
            <span className={`relative h-7 w-16 shrink-0 bg-ink transition-colors ${useMarketEfficiency ? 'bg-ink' : 'bg-line'}`}>
              <span className={`absolute top-1 h-5 w-5 bg-canvas transition-transform ${useMarketEfficiency ? 'translate-x-9' : 'translate-x-1'}`} />
            </span>
            <span className="max-w-[210px] font-body text-[18px] font-semibold leading-5 text-ink">
              Use Fermah Proof Market
            </span>
            <span className="font-mono text-[13px] leading-4 text-muted">
              (~{efficiencyLabel}%<br />savings)
            </span>
          </button>
        </div>

        <div className="flex flex-col pt-7 lg:pl-10 lg:pt-1">
          <div className="font-mono text-[13px] uppercase tracking-[0.18em] text-soft">Estimate</div>
          <div className="mt-2 font-display text-[58px] leading-none text-ink md:text-[64px]">
            {money.format(estimate.monthlyCost)}
          </div>
          <div className="mt-1 font-mono text-[14px] text-muted">
            per month
          </div>

          {useMarketEfficiency && (
            <div className="mt-1 font-mono text-[13px] text-rust">
              saving {money.format(estimate.savingsMonthly)}/mo vs self-hosted
            </div>
          )}

          <div className="my-4 h-[3px] bg-ink" />

          <ResultRow label="Cost per batch" value={preciseMoney.format(estimate.costPerBatch)} />
          <ResultRow label="Cost per tx" value={preciseMoney.format(estimate.costPerTx)} />
          <ResultRow label="Proving time" value={formatTime(estimate.provingTimeSeconds)} />
          <ResultRow label="GPU type" value={estimate.gpuType} />
          <ResultRow label="Operators needed" value={String(estimate.operatorsNeeded)} />
          <ResultRow label="Monthly batches" value={integer.format(estimate.monthlyVolumeBatches)} />

          <div className="mt-3 border border-rust/35 bg-rust/5 p-3.5">
            <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-rust">Fermah vs self-hosted</div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <SmallNumber label="Self-hosted" value={money.format(estimate.baselineMonthlyCost)} />
              <div className="font-display text-[34px] text-line">vs</div>
              <SmallNumber label="Market scenario" value={money.format(estimate.monthlyCost)} accent />
            </div>
          </div>

          <p className="mt-3 max-w-[440px] font-mono text-[11px] leading-4 text-muted">
            Based on public benchmark data and scenario multipliers. Current model: {estimate.confidence}.
          </p>
        </div>
      </div>
    </section>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-3 first:mt-0">
      <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{legend}</legend>
      {children}
    </fieldset>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-1.5 font-mono text-[14px]">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}

function SmallNumber({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? 'text-right' : ''}>
      <div className={`font-mono text-[12px] ${accent ? 'text-rust' : 'text-muted'}`}>{accent ? 'Fermah Market' : label}</div>
      <div className={`mt-1 font-display text-[28px] leading-none ${accent ? 'text-rust' : 'text-ink'}`}>{value}</div>
    </div>
  );
}

function BenchmarkStrip() {
  const items = [
    ['Data mode', 'Public benchmark'],
    ['Baseline cost', '$17.97 / batch'],
    ['Baseline time', '9.5h / L4 GPU'],
    ['Market factor', 'Scenario, not quote'],
    ['Live pricing', 'API required'],
  ];

  return (
    <div className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-[1320px] overflow-x-auto px-5 md:px-8">
        {items.map(([label, value]) => (
          <div key={label} className="min-w-[220px] border-r border-line px-5 py-4 first:border-l">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-soft">{label}</div>
            <div className="mt-1 font-body text-[18px] font-semibold text-ink">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Methodology() {
  return (
    <section id="methodology" className="border-b border-line bg-canvas py-20">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          eyebrow="Methodology"
          title="Real public benchmarks, explicit assumptions."
          lede="The model starts with a published zkSync proving benchmark and applies transparent multipliers for chain complexity, proof-system choice, workload, and market efficiency."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <MethodCard step="01" title="Start with public data" body="The baseline is the Chorus One zkSync estimate: about 3,985 transactions, $17.97 per batch, and 9.5 hours on a single Nvidia L4 GPU." />
          <MethodCard step="02" title="Select the workload" body="Batches per day scales the monthly volume. Operator count is derived from proving time and the number of seconds in a day." />
          <MethodCard step="03" title="Apply scenario multipliers" body="Other chains and proof systems are estimates, clearly marked as derived or scenario data instead of live market quotes." />
          <MethodCard step="04" title="Compare market efficiency" body="The Fermah option is modeled as a configurable efficiency scenario, not an official price feed." />
        </div>
      </div>
    </section>
  );
}

function MethodCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <article className="border border-line bg-panel p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-rust">{step}</div>
      <h3 className="mt-4 font-display text-[32px] font-normal leading-none text-ink">{title}</h3>
      <p className="mt-4 text-[16px] leading-7 text-muted">{body}</p>
    </article>
  );
}

function ProofSystems() {
  return (
    <section id="proof-systems" className="border-b border-line bg-panel py-20">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <SectionHeading
          eyebrow="Proof systems"
          title="Choose a backend, see the cost sensitivity."
          lede="Only the zkSync-style baseline is a direct public benchmark. The rest are deliberately shown as derived scenarios so the calculator stays honest."
        />
        <div className="mt-10 grid grid-cols-1 border border-line md:grid-cols-5">
          {PROOF_SYSTEMS.map((item, index) => (
            <article key={item.id} className="border-b border-line bg-canvas p-5 md:border-b-0 md:border-r last:border-r-0" style={{ borderRightWidth: index === PROOF_SYSTEMS.length - 1 ? 0 : undefined }}>
              <div className="font-display text-[30px] leading-none text-ink">{item.name}</div>
              <p className="mt-4 min-h-[96px] text-[15px] leading-6 text-muted">{item.description}</p>
              <div className="mt-5 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-soft">
                Cost x{item.relativeCost} / Time x{item.relativeTime}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section className="border-b border-line bg-canvas py-20">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 md:px-8 lg:grid-cols-3">
        <SectionHeading
          eyebrow="Product focus"
          title="What I would improve next."
          lede="The current version is now useful as a calculator. The next step is to connect authenticated or public feeds when Fermah exposes stable pricing data."
        />
        <div className="grid gap-3 lg:col-span-2">
          <PriorityItem title="Add official pricing API integration" body="If Fermah publishes market prices, replace the scenario multiplier with fetched operator bids and cache the last known value." />
          <PriorityItem title="Persist shareable estimates" body="Encode chain, proof system, volume, and efficiency mode into URL params so users can share a quote-like scenario." />
          <PriorityItem title="Add sensitivity charts" body="Show how monthly cost changes as batches/day, proof system, and market efficiency move." />
        </div>
      </div>
    </section>
  );
}

function PriorityItem({ title, body }: { title: string; body: string }) {
  return (
    <article className="grid grid-cols-1 gap-4 border border-line bg-panel p-5 md:grid-cols-[220px_1fr]">
      <h3 className="font-display text-[30px] font-normal leading-none text-ink">{title}</h3>
      <p className="text-[16px] leading-7 text-muted">{body}</p>
    </article>
  );
}

function FinalCTA() {
  return (
    <section id="sources" className="bg-panel py-20">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <SectionHeading
          eyebrow="Sources"
          title="Every number should have a trail."
          lede="These are the public references used by the model. The calculator avoids presenting scenario assumptions as live Fermah prices."
        />
        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          {DATA_SOURCES.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="border border-line bg-canvas p-5 text-ink no-underline transition-colors hover:border-steel"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-rust">Source</div>
              <h3 className="mt-4 font-display text-[30px] font-normal leading-none">{source.label}</h3>
              <p className="mt-4 text-[15px] leading-6 text-muted">{source.note}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-ink py-8 text-canvas">
      <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-4 px-5 md:flex-row md:items-center md:px-8">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <div className="font-display text-[28px] leading-none">Fermah Proof Cost Calculator</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-canvas/60">Community tool. Not official Fermah pricing.</div>
          </div>
        </div>
        <a
          href="https://github.com/Zhekinmaksim/fermah-proof-calculator"
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-canvas no-underline hover:text-cyan"
        >
          View on GitHub
        </a>
      </div>
    </footer>
  );
}

function SectionHeading({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-rust">{eyebrow}</div>
      <h2 className="mt-4 max-w-[720px] font-display text-[48px] font-normal leading-[0.98] tracking-tight text-ink md:text-[72px]">{title}</h2>
      <p className="mt-6 max-w-[620px] text-[18px] leading-8 text-muted">{lede}</p>
    </div>
  );
}

function normalizeBatches(value: string) {
  const next = Number(value);
  if (!Number.isFinite(next)) return 1;
  return Math.min(10000, Math.max(1, Math.round(next)));
}
