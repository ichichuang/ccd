export interface FileSystemAdapter {
  readText(path: string): Promise<string>
  writeText(path: string, content: string): Promise<void>
}
