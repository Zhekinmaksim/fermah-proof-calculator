# Fermah Proof Cost Calculator

Community-built tool to estimate ZK proof generation costs across proof systems and chains from public benchmarks.

## What it does

Select a target chain, proof system, and daily batch volume. The calculator estimates:
- Monthly proving cost (self-hosted baseline vs market-efficiency scenario)
- Cost per batch and per transaction
- Proving time per batch
- GPU requirements and operator count
- Scenario savings from a configurable market-efficiency model

## Data sources

Cost estimates are based on:
- [Chorus One ZK proving economics](https://chorus.one/crypto-research?a23247d1_page=5) - public zkSync batch benchmark: ~3,985 transactions, $17.97 per batch, 9.5h on one Nvidia L4 GPU
- [Fermah marketplace description](https://s24.q4cdn.com/538403808/files/doc_news/Fermah-Closes-5.2M-Seed-Round-to-Abstract-Away-the-Complexity-of-ZK-Proof-Generation-2024.pdf) - public description of Fermah as a proof-generation marketplace
- [EthProofs API](https://ethproofs.org/api) - public documentation for Ethereum block proof workflows and proving-time fields
- Derived scenario multipliers for non-zkSync chains and proof-system sensitivity

## Not official pricing

This is a community educational tool. Actual Fermah pricing depends on operator availability, proof complexity, and market conditions. The app does not use live Fermah pricing because no public official pricing API is currently wired into the project.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
# dist/ ready for Vercel/Netlify
```

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS
- Editorial design: Instrument Serif + Crimson Pro + JetBrains Mono

## Built for

Fermah Creator Spotlight Program

MIT License
