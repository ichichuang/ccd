export interface CryptoProvider {
  randomId(): string
  digest(input: string): Promise<string>
}
