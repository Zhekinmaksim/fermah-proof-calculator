export interface ProofSystem {
  id: string;
  name: string;
  fullName: string;
  description: string;
}

export interface Chain {
  id: string;
  name: string;
  proofSystems: string[];
  avgBatchSize: number;
  note: string;
}

export interface CostEstimate {
  provingTimeSeconds: number;
  costPerBatch: number;
  costPerProof: number;
  costPerTx: number;
  operatorsNeeded: number;
  gpuType: string;
  monthlyVolumeBatches: number;
  monthlyCost: number;
}

export const PROOF_SYSTEMS: ProofSystem[] = [
  {
    id: 'groth16',
    name: 'Groth16',
    fullName: 'Groth16 (SNARK)',
    description: 'Most gas-efficient on-chain verification. Trusted setup required. Used for final compression in most rollups.',
  },
  {
    id: 'stark',
    name: 'STARK',
    fullName: 'STARK (FRI-based)',
    description: 'No trusted setup. Larger proof size but faster proving. Used by Starknet and as intermediate layer.',
  },
  {
    id: 'risczero',
    name: 'RISC Zero',
    fullName: 'RISC Zero zkVM',
    description: 'General-purpose zkVM. Write in Rust, prove execution. Fermah integrated for EthProofs.',
  },
  {
    id: 'sp1',
    name: 'SP1',
    fullName: 'Succinct SP1',
    description: 'High-performance zkVM. Optimized for speed. Used in various L2 and bridge applications.',
  },
  {
    id: 'plonk',
    name: 'Plonk',
    fullName: 'Plonk (Universal)',
    description: 'Universal setup. Good balance of proof size and verification cost. Base for many ZK systems.',
  },
];

export const CHAINS: Chain[] = [
  {
    id: 'zksync',
    name: 'ZKsync Era',
    proofSystems: ['groth16', 'stark', 'plonk'],
    avgBatchSize: 4000,
    note: 'Largest ZK rollup by proof volume. Fermah integration live.',
  },
  {
    id: 'scroll',
    name: 'Scroll',
    proofSystems: ['groth16', 'plonk', 'stark'],
    avgBatchSize: 2500,
    note: 'EVM-equivalent zkRollup. Fermah collaboration for high-load proving.',
  },
  {
    id: 'ethereum',
    name: 'Ethereum (EthProofs)',
    proofSystems: ['risczero', 'sp1', 'stark'],
    avgBatchSize: 1,
    note: 'Full block proving via EthProofs. Fermah generates proofs with RISC Zero and Airbender.',
  },
  {
    id: 'linea',
    name: 'Linea',
    proofSystems: ['groth16', 'plonk'],
    avgBatchSize: 3000,
    note: 'Consensys zkEVM rollup. Similar proving architecture to ZKsync.',
  },
  {
    id: 'custom',
    name: 'Custom / Other',
    proofSystems: ['groth16', 'stark', 'risczero', 'sp1', 'plonk'],
    avgBatchSize: 1000,
    note: 'Estimate for custom ZK applications, bridges, coprocessors.',
  },
];

// Cost model based on:
// - Chorus.one "Economics of ZK-Proving" (ZKsync benchmark)
// - $17.97 per batch of ~4000 txs on Nvidia L4
// - ~38 min proving time per batch
// - Fermah matchmaker reduces cost ~30-50% vs self-hosted
const BASE_COSTS: Record<string, { timePerBatch: number; costPerBatch: number; gpu: string }> = {
  groth16:  { timePerBatch: 2280, costPerBatch: 17.97, gpu: 'Nvidia L4' },
  stark:    { timePerBatch: 1800, costPerBatch: 14.50, gpu: 'Nvidia L4' },
  risczero: { timePerBatch: 3600, costPerBatch: 28.00, gpu: 'Nvidia A100' },
  sp1:      { timePerBatch: 2400, costPerBatch: 22.00, gpu: 'Nvidia A100' },
  plonk:    { timePerBatch: 2100, costPerBatch: 16.50, gpu: 'Nvidia L4' },
};

const CHAIN_MULTIPLIERS: Record<string, number> = {
  zksync: 1.0,
  scroll: 1.1,
  ethereum: 8.5,  // Full block proving is much more expensive
  linea: 1.05,
  custom: 1.2,
};

export function calculateCost(
  proofSystemId: string,
  chainId: string,
  batchesPerDay: number,
  fermahDiscount: boolean
): CostEstimate {
  const base = BASE_COSTS[proofSystemId] || BASE_COSTS.groth16;
  const chain = CHAINS.find(c => c.id === chainId)!;
  const multiplier = CHAIN_MULTIPLIERS[chainId] || 1.0;
  const discount = fermahDiscount ? 0.65 : 1.0; // Fermah ~35% cheaper than self-hosted

  const costPerBatch = base.costPerBatch * multiplier * discount;
  const provingTime = base.timePerBatch * multiplier;
  const batchSize = chain.avgBatchSize;

  const costPerProof = costPerBatch; // 1 proof per batch
  const costPerTx = batchSize > 0 ? costPerBatch / batchSize : costPerBatch;
  const operatorsNeeded = Math.max(1, Math.ceil(batchesPerDay * provingTime / 86400));
  const monthlyBatches = batchesPerDay * 30;
  const monthlyCost = monthlyBatches * costPerBatch;

  return {
    provingTimeSeconds: Math.round(provingTime),
    costPerBatch: Math.round(costPerBatch * 100) / 100,
    costPerProof: Math.round(costPerProof * 100) / 100,
    costPerTx: Math.round(costPerTx * 10000) / 10000,
    operatorsNeeded,
    gpuType: base.gpu,
    monthlyVolumeBatches: monthlyBatches,
    monthlyCost: Math.round(monthlyCost * 100) / 100,
  };
}
