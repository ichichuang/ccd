export type LocaleMessageValue = string | LocaleRecord
export interface LocaleRecord {
  [key: string]: LocaleMessageValue
}

const isPlainObject = (value: unknown): value is LocaleRecord => {
  return Object.prototype.toString.call(value) === '[object Object]'
}

const cloneValue = (value: LocaleMessageValue): LocaleMessageValue => {
  if (isPlainObject(value)) {
    const result: LocaleRecord = {}

    for (const key of Object.keys(value)) {
      result[key] = cloneValue(value[key])
    }

    return result
  }

  return value
}

const mergeInto = (target: LocaleRecord, source: LocaleRecord) => {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      mergeInto(targetValue, sourceValue)
      continue
    }

    target[key] = cloneValue(sourceValue)
  }
}

export const mergeLocale = (...sources: LocaleRecord[]): LocaleRecord => {
  const result: LocaleRecord = {}

  for (const source of sources) {
    mergeInto(result, source)
  }

  return result
}
