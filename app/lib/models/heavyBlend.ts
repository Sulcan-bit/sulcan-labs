// app/lib/models/heavyBlend.ts

export async function myHeavyBlendModel(streams: string[], volumes: number[]) {
  // Placeholder logic — replace with your real blend model
  const total = volumes.reduce((a, b) => a + b, 0);

  return {
    streams,
    volumes,
    totalVolume: total,
    blendedDensity: 930 - total * 0.01,
    blendedSulphur: 3.5 + total * 0.0001
  };
}
