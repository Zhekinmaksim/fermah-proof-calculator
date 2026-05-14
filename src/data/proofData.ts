export type ChainId = 'zksync' | 'scroll' | 'ethereum' | 'linea' | 'custom';
export type ProofSystemId = 'groth16' | 'stark' | 'risczero' | 'sp1' | 'plonk';

export interface DataSource {
  label: string;
  url: string;
  note: string;
}

export interface ProofSystem {
  id: ProofSystemId;
  name: string;
  fullName: string;
  description: string;
  relativeCost: number;
  relativeTime: number;
  gpuType: string;
}

export interface Chain {
  id: ChainId;
  name: string;
  shortName: string;
  proofSystems: ProofSystemId[];
  avgBatchSize: number;
  batchLabel: string;
  complexityMultiplier: number;
  confidence: 'public benchmark' | 'derived estimate' | 'scenario';
  note: string;
}

export interface CostEstimate {
  provingTimeSeconds: number;
  costPerBatch: number;
  costPerTx: number;
  operatorsNeeded: number;
  gpuType: string;
  monthlyVolumeBatches: number;
  monthlyCost: number;
  baselineMonthlyCost: number;
  savingsMonthly: number;
  efficiencyMultiplier: number;
  confidence: Chain['confidence'];
}

export const DATA_SOURCES: DataSource[] = [
  {
    label: 'Chorus One zkSync proving benchmark',
    url: 'https://chorus.one/crypto-research?a23247d1_page=5',
    note: 'Public baseline: ~3,985 tx batch, Nvidia L4, 9.5h proving time, $17.97 per batch.',
  },
  {
    label: 'Fermah marketplace description',
    url: 'https://s24.q4cdn.com/538403808/files/doc_news/Fermah-Closes-5.2M-Seed-Round-to-Abstract-Away-the-Complexity-of-ZK-Proof-Generation-2024.pdf',
    note: 'Fermah describes a universal proof-generation marketplace that aggregates demand and supply.',
  },
  {
    label: 'EthProofs API',
    url: 'https://ethproofs.org/api',
    note: 'Public documentation for Ethereum block proof submissions and proving-time fields.',
  },
];

export const PROOF_SYSTEMS: ProofSystem[] = [
  {
    id: 'groth16',
    name: 'Groth16',
    fullName: 'Groth16 (SNARK)',
    description: 'Public zkSync-style benchmark baseline. Good for rollup batch cost estimates.',
    relativeCost: 1,
    relativeTime: 1,
    gpuType: 'Nvidia L4',
  },
  {
    id: 'stark',
    name: 'STARK',
    fullName: 'STARK (FRI-based)',
    description: 'Derived from the same public baseline; useful for sensitivity analysis, not quoted pricing.',
    relativeCost: 0.92,
    relativeTime: 0.9,
    gpuType: 'Nvidia L4',
  },
  {
    id: 'risczero',
    name: 'RISC Zero',
    fullName: 'RISC Zero zkVM',
    description: 'Ethereum block proving scenario based on public EthProofs-style workflows.',
    relativeCost: 1.65,
    relativeTime: 1.85,
    gpuType: 'Nvidia A100',
  },
  {
    id: 'sp1',
    name: 'SP1',
    fullName: 'SP1 (Succinct)',
    description: 'Ethereum block proving scenario for zkVM-style execution proofs.',
    relativeCost: 1.42,
    relativeTime: 1.45,
    gpuType: 'Nvidia A100',
  },
  {
    id: 'plonk',
    name: 'Plonk',
    fullName: 'Plonk (Universal)',
    description: 'Derived rollup estimate for universal-setup proving systems.',
    relativeCost: 0.96,
    relativeTime: 0.94,
    gpuType: 'Nvidia L4',
  },
];

export const CHAINS: Chain[] = [
  {
    id: 'zksync',
    name: 'ZKsync Era',
    shortName: 'ZKsync Era',
    proofSystems: ['groth16', 'stark', 'plonk'],
    avgBatchSize: 3985,
    batchLabel: '~4,000 tx/batch',
    complexityMultiplier: 1,
    confidence: 'public benchmark',
    note: 'Uses the public Chorus One zkSync proving-cost benchmark as the baseline.',
  },
  {
    id: 'scroll',
    name: 'Scroll',
    shortName: 'Scroll',
    proofSystems: ['groth16', 'plonk', 'stark'],
    avgBatchSize: 2500,
    batchLabel: '~2,500 tx/batch',
    complexityMultiplier: 1.4,
    confidence: 'derived estimate',
    note: 'Derived from the zkSync baseline with a smaller-batch premium.',
  },
  {
    id: 'ethereum',
    name: 'Ethereum block',
    shortName: 'Ethereum',
    proofSystems: ['risczero', 'sp1', 'stark'],
    avgBatchSize: 1,
    batchLabel: '1 block',
    complexityMultiplier: 8.5,
    confidence: 'scenario',
    note: 'Scenario for block proving; EthProofs exposes proving-time fields, but not a public pricing feed.',
  },
  {
    id: 'linea',
    name: 'Linea',
    shortName: 'Linea',
    proofSystems: ['groth16', 'plonk'],
    avgBatchSize: 3000,
    batchLabel: '~3,000 tx/batch',
    complexityMultiplier: 1.25,
    confidence: 'derived estimate',
    note: 'Derived from the zkSync baseline with a moderate complexity premium.',
  },
  {
    id: 'custom',
    name: 'Custom app',
    shortName: 'Custom',
    proofSystems: ['groth16', 'stark', 'risczero', 'sp1', 'plonk'],
    avgBatchSize: 1000,
    batchLabel: '~1,000 ops/job',
    complexityMultiplier: 1.2,
    confidence: 'scenario',
    note: 'Scenario mode for bridges, coprocessors, ZKML, and app-specific proving jobs.',
  },
];

const BASE_ZKSYNC_BATCH = {
  costPerBatch: 17.97,
  provingTimeSeconds: 9.5 * 60 * 60,
};

export const DEFAULT_MARKET_EFFICIENCY = 0.65;

export function formatTime(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function calculateCost(
  proofSystemId: ProofSystemId,
  chainId: ChainId,
  batchesPerDay: number,
  useMarketEfficiency: boolean,
): CostEstimate {
  const chain = CHAINS.find((item) => item.id === chainId) ?? CHAINS[0];
  const proofSystem = PROOF_SYSTEMS.find((item) => item.id === proofSystemId) ?? PROOF_SYSTEMS[0];
  const efficiencyMultiplier = useMarketEfficiency ? DEFAULT_MARKET_EFFICIENCY : 1;
  const normalizedBatches = Math.max(1, batchesPerDay);

  const baselineCostPerBatch =
    BASE_ZKSYNC_BATCH.costPerBatch * chain.complexityMultiplier * proofSystem.relativeCost;
  const costPerBatch = baselineCostPerBatch * efficiencyMultiplier;
  const provingTimeSeconds =
    BASE_ZKSYNC_BATCH.provingTimeSeconds * chain.complexityMultiplier * proofSystem.relativeTime;
  const monthlyVolumeBatches = normalizedBatches * 30;
  const monthlyCost = monthlyVolumeBatches * costPerBatch;
  const baselineMonthlyCost = monthlyVolumeBatches * baselineCostPerBatch;

  return {
    provingTimeSeconds: Math.round(provingTimeSeconds),
    costPerBatch: roundMoney(costPerBatch),
    costPerTx: roundSmallMoney(costPerBatch / chain.avgBatchSize),
    operatorsNeeded: Math.max(1, Math.ceil((normalizedBatches * provingTimeSeconds) / 86400)),
    gpuType: proofSystem.gpuType,
    monthlyVolumeBatches,
    monthlyCost: roundMoney(monthlyCost),
    baselineMonthlyCost: roundMoney(baselineMonthlyCost),
    savingsMonthly: roundMoney(baselineMonthlyCost - monthlyCost),
    efficiencyMultiplier,
    confidence: chain.confidence,
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundSmallMoney(value: number) {
  return Math.round(value * 100000) / 100000;
}
