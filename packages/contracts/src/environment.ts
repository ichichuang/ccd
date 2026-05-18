export interface EnvironmentProvider {
  get(name: string): string | undefined
  getMode(): string
  isProduction(): boolean
}
