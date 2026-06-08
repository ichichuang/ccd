import type { Method } from 'alova'

export function isBlobHttpResponse(response: Response, method: Method): boolean {
  const contentType = response.headers.get('content-type')
  return (
    method.config?.responseType === 'blob' ||
    contentType?.includes('application/octet-stream') ||
    contentType?.includes('application/force-download') ||
    (method.config as Record<string, unknown>)?.['responseType'] === 'blob'
  )
}

export async function readResponseTextAndJson(
  response: Response
): Promise<{ json: Record<string, unknown> | null; text: string }> {
  const text = await response.text()
  let json: Record<string, unknown> | null

  try {
    json = JSON.parse(text) as Record<string, unknown>
  } catch {
    json = null
  }

  return { json, text }
}

export async function readHttpErrorData(response: Response): Promise<{ message?: string }> {
  try {
    const text = await response.text()
    try {
      return JSON.parse(text) as { message?: string }
    } catch {
      return { message: text || response.statusText }
    }
  } catch {
    return { message: response.statusText }
  }
}
