// app/lib/models/condensate.ts

export async function myCondensateModel(density: number, sulphur?: number, c5?: number) {
  // Placeholder logic — replace with your real model
  return {
    eq: density * 0.001,
    shrinkage: density * 0.0005,
    sulphurPenalty: sulphur ? sulphur * 0.1 : 0,
    c5Plus: c5 ?? null
  };
}
