import { PRO_FORM_LOGGER } from '../utils/logger'

export class DependencyNode {
  readonly field: string
  readonly dependencies: Set<string>
  readonly dependents: Set<string>

  constructor(field: string) {
    this.field = field
    this.dependencies = new Set<string>()
    this.dependents = new Set<string>()
  }
}

/**
 * 字段依赖图（DAG）
 *
 * - 节点：字段名
 * - 边：source → target，表示 target 依赖于 source
 */
export class DependencyGraph {
  private readonly nodes = new Map<string, DependencyNode>()

  reset(): void {
    this.nodes.clear()
  }

  addNode(field: string): DependencyNode {
    const existing = this.nodes.get(field)
    if (existing) {
      return existing
    }
    const node = new DependencyNode(field)
    this.nodes.set(field, node)
    return node
  }

  hasNode(field: string): boolean {
    return this.nodes.has(field)
  }

  getNode(field: string): DependencyNode | undefined {
    return this.nodes.get(field)
  }

  /**
   * source 变化会影响 target（source → target）
   */
  addDependency(source: string, target: string): void {
    if (source === target) {
      PRO_FORM_LOGGER.warn(
        `Self-dependency detected: field "${source}" depends on itself, skipping`
      )
      return
    }
    const sourceNode = this.addNode(source)
    const targetNode = this.addNode(target)

    sourceNode.dependents.add(target)
    targetNode.dependencies.add(source)
  }

  getDependents(field: string): string[] {
    const node = this.nodes.get(field)
    if (!node) return []
    return Array.from(node.dependents)
  }

  /**
   * 对整张依赖图执行拓扑排序。
   * 若存在环，则抛出错误。
   */
  topologicalSort(): string[] {
    const inDegree = new Map<string, number>()

    // 初始化入度
    this.nodes.forEach((node, field) => {
      inDegree.set(field, node.dependencies.size)
    })

    const queue: string[] = []

    inDegree.forEach((degree, field) => {
      if (degree === 0) {
        queue.push(field)
      }
    })

    const result: string[] = []

    while (queue.length > 0) {
      const current = queue.shift() as string
      result.push(current)

      const node = this.nodes.get(current)
      if (!node) continue

      node.dependents.forEach(dependentField => {
        const currentDegree = inDegree.get(dependentField)
        if (currentDegree === undefined) return
        const nextDegree = currentDegree - 1
        inDegree.set(dependentField, nextDegree)
        if (nextDegree === 0) {
          queue.push(dependentField)
        }
      })
    }

    if (result.length !== this.nodes.size) {
      // 未被 Kahn 算法处理的节点 = 环参与者（入度始终 > 0）
      const processed = new Set(result)
      const cycleFields: string[] = []
      this.nodes.forEach((_node, field) => {
        if (!processed.has(field)) {
          cycleFields.push(field)
        }
      })
      throw new Error(
        `Circular dependency detected in form schema. Fields involved: [${cycleFields.join(', ')}]`
      )
    }

    return result
  }
}
