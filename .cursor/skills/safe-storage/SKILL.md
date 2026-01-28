# 安全存储系统 (Safe Storage / Encryption & Compression) — 任务指引

当用户要求**加密存储/读取数据**、**对数据进行压缩 + 加密/解压 + 解密**、**实现 Pinia 持久化加密**、或你判断需要“安全存储/安全传输流水线”时，使用本技能。

本项目已在 `src/utils/safeStorage/` 中实现统一的「JSON ↔ 压缩 ↔ 加密」流水线，上层业务应优先复用这些方法，而不是自己组合 `crypto-es` / `lz-string` / `JSON.stringify`。

## 文件角色

| 文件                                       | 职责                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/safeStorage/crypto.ts`          | 基于 `crypto-es` 的 AES-CBC 加解密封装。提供 `encrypt` / `decrypt`（异步，输出格式 `IV_BASE64:CIPHER_BASE64`）与 `encryptSync` / `decryptSync`（同步）。只处理**字符串级别**的加解密，不关心 JSON 或压缩。                                                                                                                                                 |
| `src/utils/safeStorage/lzstring.ts`        | 基于 `lz-string` 的字符串压缩/解压封装。提供 `compress(str)` → Base64 压缩字符串，`decompress(str)` → 原始字符串或 `null`。只关心字符串体积压缩，不关心加密或业务语义。                                                                                                                                                                                    |
| `src/utils/safeStorage/core.ts`            | **编解码流水线 SSOT**：统一编排「Object → JSON.stringify → LZ-String(Base64) 压缩 → AES 加密」与反向流程。提供 `packDataSync` / `unpackDataSync`（同步）与 `packData` / `unpackData`（异步），内部处理默认密钥 (`VITE_APP_SECRET`)、异常捕获与开发环境日志，是所有上层能力的**唯一编解码入口**。                                                           |
| `src/utils/safeStorage/safeStorage.ts`     | 业务入口别名层：将 core 的函数以语义化命名导出，方便业务使用：`encryptAndCompress` / `decompressAndDecrypt`（异步）、`encryptAndCompressSync` / `decompressAndDecryptSync`（同步）。用于“一步搞定 JSON + 压缩 + 加密 / 解压 + 解密”。                                                                                                                      |
| `src/utils/safeStorage/piniaSerializer.ts` | Pinia 持久化插件的加密序列化器适配层。提供 `createPiniaEncryptedSerializer(secret?)`：`serialize` 使用 `packDataSync`（可选自定义密钥）；`deserialize` 先用 `unpackDataSync` 尝试解密解压 + JSON.parse，失败后降级为直接 `JSON.parse`，全部失败时返回 `undefined` 让 Pinia 使用初始状态。默认导出 `createPiniaEncryptedSerializer()` 便于 store 直接复用。 |
| `src/utils/safeStorage/index.ts`           | safeStorage 模块统一出口：汇总导出 crypto 层（`encrypt*` / `decrypt*`）、lzstring 层（`compress` / `decompress`）、core 层（`packData*` / `unpackData*`）、业务入口（`encryptAndCompress*` / `decompressAndDecrypt*`）、以及 Pinia 适配（`createPiniaEncryptedSerializer` 与默认实例）。                                                                   |

> 业务代码若需要加密/压缩能力，应始终从 `@/utils/safeStorage` 导入现有导出，而不是直接依赖 `crypto-es` 或 `lz-string`。

## 场景一：通用“压缩 + 加密 / 解压 + 解密”存储或传输

### 推荐使用：`encryptAndCompress*` / `decompressAndDecrypt*`

适用于：

- 将任意 JS 对象安全写入 localStorage / sessionStorage / IndexedDB 等。
- 对 HTTP 请求中的敏感字段进行加密压缩（例如请求体中的某个字段）。

示例（同步版，适合 localStorage 等同步 API）：

```ts
import { encryptAndCompressSync, decompressAndDecryptSync } from '@/utils/safeStorage'

const key = 'SECURE_DATA'

// 写入：Object -> JSON -> Compress(Base64) -> AES
const packed = encryptAndCompressSync({ foo: 'bar' })
localStorage.setItem(key, packed)

// 读取：AES -> Decompress(Base64) -> JSON -> Object
const stored = localStorage.getItem(key) || ''
const data = decompressAndDecryptSync<{ foo: string }>(stored)
```

如需异步（大数据量、避免阻塞 UI），使用 `encryptAndCompress` / `decompressAndDecrypt`。

> 通常无需直接调用 `packData*` / `unpackData*`，除非你在实现更底层的适配器（如自定义 serializer）。

## 场景二：Pinia 持久化加密

### 推荐使用：`createPiniaEncryptedSerializer()` 或默认导出

在使用 `pinia-plugin-persistedstate` 时，为某个 store 启用加密持久化：

```ts
import { defineStore } from 'pinia'
import createPiniaEncryptedSerializer from '@/utils/safeStorage/piniaSerializer'

export const useSecureStore = defineStore('secure', {
  state: () => ({
    token: '' as string,
    profile: null as Record<string, any> | null,
  }),
  persist: {
    key: 'secure-store',
    storage: localStorage,
    serializer: createPiniaEncryptedSerializer(), // 使用默认密钥 VITE_APP_SECRET
  },
})
```

要使用自定义密钥：

```ts
persist: {
  key: 'secure-store',
  storage: localStorage,
  serializer: createPiniaEncryptedSerializer('MY_CUSTOM_SECRET'),
}
```

- `serialize`：调用 `packDataSync`（Object → JSON → Compress(Base64) → AES），返回字符串。
- `deserialize`：
  - 先尝试 `unpackDataSync`（AES → Decompress(Base64) → JSON.parse）。
  - 若解包失败，尝试 `JSON.parse(value)`（兼容未加密/旧数据）。
  - 全部失败返回 `undefined`，Pinia 会使用初始状态。

## 场景三：仅需压缩或仅需加密

如果场景只需要其中一层（不建议重造轮子）：

- **仅压缩/解压**：使用 `compress(str)` / `decompress(str)`。
- **仅加密/解密**：使用 `encrypt` / `decrypt`（异步）或 `encryptSync` / `decryptSync`（同步）。

> 仍然应从 `@/utils/safeStorage` 导入，而不是直接使用第三方库，保证后续调整集中在 safeStorage 层即可。

## 何时优先使用 safeStorage？

- 适合：
  - 任何需要“**安全持久化**”或“**安全传输**”的数据（尤其是包含用户隐私、token、配置快照等）。
  - 需要兼顾**体积控制（压缩）**与**机密性（加密）**的场景。
  - 需要对旧数据保持一定兼容性（比如 Pinia 的持久化）。
- 不适合：
  - 仅做临时内存态处理、无持久化或传输需求时；这类场景直接使用普通对象/变量即可。

## 排错：解密/解压失败、数据恢复异常

1. **密钥是否一致**：确认使用的密钥（默认 `VITE_APP_SECRET` 或自定义）与写入时一致；更换密钥会导致旧数据无法解密。
2. **数据是否为空或被截断**：`value` 为空字符串或被部分覆盖时，`unpackData*` 会返回 `null`。
3. **兼容旧数据**：对于 Pinia：
   - 若 `unpackDataSync` 返回 `null`，serializer 会继续尝试 `JSON.parse(value)`，用于兼容未加密/旧格式数据。
   - 若仍失败，则返回 `undefined`，由 Pinia 使用 store 初始状态。
4. **误用底层库**：若在业务代码中直接使用 `crypto-es` 或 `lz-string`，可能与 safeStorage 的格式不兼容（例如 IV 拼接格式不同）。应统一改为从 `@/utils/safeStorage` 导入方法。
