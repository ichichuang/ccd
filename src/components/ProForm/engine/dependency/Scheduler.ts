import { DependencyGraph } from './DependencyGraph'

/**
 * 基于依赖图的更新调度器
 *
 * - 输入：发生变化的字段集合
 * - 输出：按依赖顺序排序后的需要更新的字段列表
 */
export class Scheduler {
  private readonly graph: DependencyGraph

  constructor(graph: DependencyGraph) {
    this.graph = graph
  }

  /**
   * 计算从若干起始字段出发，按拓扑顺序需要执行更新的字段列表。
   *
   * - 起点字段本身也会包含在返回结果中（如果存在于图中）
   * - 对于不在图中的字段，将按传入顺序直接出现在结果前部
   */
  getUpdateOrder(changedFields: string[]): string[] {
    const uniqueChanged = Array.from(new Set(changedFields))

    // 1. 计算整图的拓扑序，用于保证依赖顺序正确
    const topoOrder = this.graph.topologicalSort()
    const topoIndex = new Map<string, number>()
    topoOrder.forEach((field, index) => {
      topoIndex.set(field, index)
    })

    // 2. 从起始字段做 BFS，找出所有受影响字段（包含自身）
    const reachable = new Set<string>()
    const queue: string[] = []

    for (const field of uniqueChanged) {
      if (this.graph.hasNode(field)) {
        if (!reachable.has(field)) {
          reachable.add(field)
          queue.push(field)
        }
      }
    }

    while (queue.length > 0) {
      const current = queue.shift() as string
      const dependents = this.graph.getDependents(current)

      dependents.forEach(dep => {
        if (!reachable.has(dep)) {
          reachable.add(dep)
          queue.push(dep)
        }
      })
    }

    // 3. 未出现在图中的字段视为独立字段，按传入顺序放在结果前部
    const independent: string[] = []
    for (const field of uniqueChanged) {
      if (!this.graph.hasNode(field)) {
        independent.push(field)
      } else if (!reachable.has(field)) {
        // 图中存在但未被 BFS 访问到，说明没有依赖关系，仅更新自身
        reachable.add(field)
      }
    }

    // 4. 将可达字段按拓扑序过滤，确保依赖字段总是在依赖者之前
    const orderedReachable = topoOrder.filter(field => reachable.has(field))

    return [...independent, ...orderedReachable]
  }
}
