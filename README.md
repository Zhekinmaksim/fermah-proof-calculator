# Fermah Proof Cost Calculator

Community-built tool to estimate ZK proof generation costs across proof systems and chains.

## What it does

Select a target chain, proof system, and daily batch volume. The calculator estimates:
- Monthly proving cost (self-hosted vs Fermah proof market)
- Cost per batch and per transaction
- Proving time per batch
- GPU requirements and operator count
- Savings from using Fermah's competitive marketplace

## Data sources

Cost estimates are based on:
- [Chorus.one "Economics of ZK-Proving"](https://chorus.one/reports-research/the-economics-of-zk-proving-market-size-and-future-projections) - ZKsync batch benchmarks
- [Fermah x ZKsync integration](https://www.fermah.xyz/blog-posts/fermah-powers-zksync) - architecture and performance data
- [EthProofs](https://ethproofs.org) - Ethereum block proving benchmarks
- Fermah ~35% cost reduction estimate based on marketplace efficiency vs self-hosted

## Not official pricing

This is a community educational tool. Actual Fermah pricing depends on operator availability, proof complexity, and market conditions. Not an official Fermah product.

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
