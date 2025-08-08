import { buildChartData, buildConsistencyData } from '@/utils/analytics'

describe('analytics utils', () => {
  const measurements = [
    { date: '2024-01-01T00:00:00.000Z', length: 10, girth: 8 },
    { date: '2024-01-02T00:00:00.000Z', length: 10.5, girth: 8.1 },
    { date: '2024-01-03T00:00:00.000Z', length: 10.7, girth: 8.0 },
  ]

  it('buildChartData maps to display format', () => {
    const result = buildChartData(measurements)
    expect(result).toHaveLength(3)
    expect(result[0]).toHaveProperty('date')
    expect(result[0].length).toBe(10)
    expect(result[0].girth).toBe(8)
  })

  it('buildConsistencyData computes absolute deltas', () => {
    const result = buildConsistencyData(measurements)
    expect(result).toHaveLength(2)
    // Between 1 and 2: delta = |10.5-10| + |8.1-8| = 0.5 + 0.1 = 0.6
    expect(result[0].delta).toBeCloseTo(0.6, 3)
    // Between 2 and 3: 0.2 + 0.1 = 0.3
    expect(result[1].delta).toBeCloseTo(0.3, 3)
  })
})