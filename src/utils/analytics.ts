export type Measurement = { date: string; length: number; girth: number }

export function buildChartData(measurements: Measurement[]): { date: string; length: number; girth: number }[] {
  return measurements.map((m) => ({
    date: new Date(m.date).toLocaleDateString(),
    length: m.length,
    girth: m.girth,
  }))
}

export function buildConsistencyData(measurements: Measurement[]): Array<{ date: string; delta: number }> {
  if (measurements.length < 2) return []
  const deltas: Array<{ date: string; delta: number }> = []
  for (let i = 1; i < measurements.length; i++) {
    const prev = measurements[i - 1]
    const curr = measurements[i]
    const delta = Math.abs(curr.length - prev.length) + Math.abs(curr.girth - prev.girth)
    deltas.push({ date: new Date(curr.date).toLocaleDateString(), delta: Number(delta.toFixed(3)) })
  }
  return deltas
}