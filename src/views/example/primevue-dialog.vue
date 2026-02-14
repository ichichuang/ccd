<script setup lang="tsx">
import type { DialogPosition } from '@/components/prime-dialog/utils/types'
import Button from 'primevue/button'
import { useDialog } from '@/hooks/modules/useDialog'
import { ref } from 'vue'
import Icons from '@/components/Icons/Icons.vue'

const {
  info,
  success,
  warning,
  error,
  confirm,
  confirmDelete,
  openDialog,
  update,
  closeDialog,
  closeLastDialog,
  closeAll,
  getDialogCount,
} = useDialog()

// --- 1. 基础反馈弹窗 (Basic Feedback) ---
const handleInfo = () => info('这是一条普通的信息提示', '信息提示')
const handleSuccess = () => success('操作成功！数据已保存', '成功')
const handleWarn = () => warning('请注意，此操作不可逆', '警告')
const handleError = () => error('发生错误，请稍后重试', '错误')

// --- 2. 确认类弹窗 (Confirmation) ---
const handleConfirm = () => {
  confirm('您确定要提交当前更改吗？', '确认操作', {
    onConfirm: () => success('您点击了确认'),
    onCancel: () => info('您点击了取消'),
  })
}

const handleConfirmDelete = () => {
  confirmDelete('删除后无法恢复，确定要继续吗？', '删除确认', {
    onConfirm: () => success('已删除'),
    onCancel: () => info('已取消删除'),
  })
}

// --- 3. 交互控制 (Interaction Control) ---

// 3.1 遮罩层控制 (Modal / Mask)
const handleModalTrue = () => {
  openDialog({
    header: '模态弹窗 (Modal: True)',
    modal: true,
    contentRenderer: () => <div class="p-padding-lg">背面内容不可点击，有遮罩层。</div>,
  })
}

const handleModalFalse = () => {
  openDialog({
    header: '非模态弹窗 (Modal: False)',
    modal: false,
    position: 'topleft',
    contentRenderer: () => <div class="p-padding-lg">你可以点击背面的按钮！</div>,
  })
}

// 3.2 点击遮罩关闭 (Dismissable Mask)
const handleCloseOnMask = () => {
  openDialog({
    header: '点击遮罩关闭',
    modal: true,
    closeOnMask: true,
    contentRenderer: () => <div class="p-padding-lg">点击弹窗外部的遮罩层可以直接关闭此弹窗。</div>,
  })
}

// 3.3 ESC 关闭控制
const handleEscControl = (enabled: boolean) => {
  openDialog({
    header: `ESC 关闭: ${enabled}`,
    closeOnEscape: enabled,
    contentRenderer: () => (
      <div class="p-padding-lg">
        {enabled ? '按下 ESC 键可以关闭此弹窗。' : '按下 ESC 键无法关闭此弹窗 (请点击按钮关闭)。'}
      </div>
    ),
  })
}

// 3.4 拖拽控制 (Draggable)
const handleDraggable = (enabled: boolean) => {
  openDialog({
    header: `拖拽: ${enabled}`,
    draggable: enabled,
    contentRenderer: () => (
      <div class="p-padding-lg">
        {enabled ? '按住标题栏可以拖动我。' : '我是固定的，无法拖动。'}
      </div>
    ),
  })
}

// 3.5 最小化/最大化 (Maximizable)
const handleMaximizable = () => {
  openDialog({
    header: '最大化演示',
    maximizable: true,
    contentRenderer: () => <div class="p-padding-lg h-32">点击右上角的最大化图标看看。</div>,
  })
}

// --- 4. 界面元素可见性 (UI Visibility) ---

// 4.1 隐藏头部 (No Header)
const handleNoHeader = () => {
  openDialog({
    hideHeader: true,
    contentRenderer: ({ index }) => (
      <div class="p-padding-xl text-center flex flex-col items-center gap-md">
        <span class="fs-lg font-bold">没有标题栏</span>
        <p>适合用于自定义程度很高的弹窗。</p>
        <Button
          label="关闭"
          onClick={() => closeDialog(index)}
        />
      </div>
    ),
  })
}

// 4.2 隐藏关闭按钮 (No Close Icon)
const handleNoCloseIcon = () => {
  openDialog({
    header: '无关闭图标',
    closable: false,
    contentRenderer: () => (
      <div class="p-padding-lg">
        <p>右上角没有 X 按钮。</p>
        <p>你必须通过底部按钮或 ESC (如果开启) 关闭。</p>
      </div>
    ),
    footerButtons: [{ label: '我知道了', btnClick: ({ dialog }) => closeDialog(dialog.index) }],
  })
}

// 4.3 隐藏底部 (No Footer) - 只有内容
const handleNoFooter = () => {
  openDialog({
    header: '无底部按钮',
    hideFooter: true,
    contentRenderer: () => <div class="p-padding-lg">这个弹窗没有底部按钮区。</div>,
  })
}

// 4.4 自定义头部 (headerRenderer)
const handleHeaderRenderer = () => {
  openDialog({
    header: '自定义头部',
    maximizable: true,
    headerRenderer: ({ close, maximize }) => (
      <div class="flex items-center justify-between w-full gap-md">
        <span class="fs-lg font-semibold text-primary flex items-center gap-xs">
          <Icons
            name="i-lucide-sparkles"
            size="sm"
          />
          自定义 Header
        </span>
        <div class="flex gap-xs">
          <Button
            icon="i-lucide-maximize-2"
            text
            rounded
            size="small"
            onClick={maximize}
          />
          <Button
            icon="i-lucide-x"
            text
            rounded
            size="small"
            onClick={close}
          />
        </div>
      </div>
    ),
    contentRenderer: () => (
      <div class="p-padding-lg">使用 headerRenderer 完全自定义标题栏，可接入 close/maximize。</div>
    ),
  })
}

// 4.5 自定义底部 (footerRenderer)
const handleFooterRenderer = () => {
  openDialog({
    header: '自定义底部',
    footerRenderer: ({ index }) => (
      <div class="flex items-center justify-between w-full gap-md">
        <span class="text-muted-foreground fs-sm">自定义 Footer 布局</span>
        <div class="flex gap-sm">
          <Button
            label="稍后"
            text
            severity="secondary"
            onClick={() => closeDialog(index)}
          />
          <Button
            label="立即处理"
            severity="primary"
            onClick={() => closeDialog(index)}
          />
        </div>
      </div>
    ),
    contentRenderer: () => (
      <div class="p-padding-lg">使用 footerRenderer 完全自定义底部，替代默认 footerButtons。</div>
    ),
  })
}

// --- 5. 生命周期与拦截 (Interceptors) ---

// 5.1 拦截取消 (beforeCancel)
const handleBeforeCancel = () => {
  openDialog({
    header: '取消前二次确认',
    contentRenderer: () => (
      <div class="p-padding-lg">点击取消按钮时会二次确认，确认后才会关闭。</div>
    ),
    beforeCancel: done => {
      const ok = window.confirm('确定要放弃当前操作吗？')
      if (ok) done()
    },
  })
}

// 5.2 拦截确认 (beforeSure)
const handleIntercept = () => {
  openDialog({
    header: '输入验证拦截',
    contentRenderer: () => <div class="p-padding-lg">点击确定时会模拟验证，2秒后通过。</div>,
    beforeSure: (done, { closeLoading }) => {
      setTimeout(() => {
        const pass = Math.random() > 0.5
        if (pass) {
          success('验证通过')
          done()
        } else {
          error('验证失败，请重试')
          closeLoading()
        }
      }, 1500)
    },
  })
}

// --- 6. 生命周期回调 (Lifecycle Callbacks) ---

// 6.1 open / close 回调
const handleOpenCloseCallbacks = () => {
  openDialog({
    header: '生命周期回调',
    contentRenderer: () => (
      <div class="p-padding-lg">打开和关闭时会在控制台输出日志，可在 DevTools Console 查看。</div>
    ),
    open: () => console.log('[Dialog] opened'),
    close: () => console.log('[Dialog] closed'),
  })
}

// 6.2 动态更新 (update)
const handleUpdateHeader = () => {
  const idx = openDialog({
    header: '初始标题',
    contentRenderer: () => (
      <div class="p-padding-lg">
        <p>点击下方按钮可动态更新标题。</p>
        <Button
          label="改为新标题"
          size="small"
          class="mt-scale-sm"
          onClick={() => update('已更新的标题', 'header', idx)}
        />
      </div>
    ),
  })
}

// 6.3 延迟打开 (openDelay)
const handleOpenDelay = () => {
  openDialog({
    header: '延迟打开',
    openDelay: 800,
    contentRenderer: () => (
      <div class="p-padding-lg">此弹窗在 800ms 后才显示，可用于配合动画。</div>
    ),
  })
}

// --- 7. 多弹窗管理 (Multi-Dialog Management) ---

// 7.1 批量打开与关闭
const handleOpenMultiple = () => {
  openDialog({
    header: 'Dialog 1',
    contentRenderer: () => <div class="p-padding-lg">第一个弹窗</div>,
  })
  openDialog({
    header: 'Dialog 2',
    contentRenderer: () => <div class="p-padding-lg">第二个弹窗</div>,
  })
  openDialog({
    header: 'Dialog 3',
    contentRenderer: () => <div class="p-padding-lg">第三个弹窗</div>,
  })
}

// --- 8. 异步与自定义 (Async & Custom) ---
const handleAsyncConfirm = () => {
  openDialog({
    header: '手动异步 Loading',
    sureBtnLoading: true,
    contentRenderer: () => <div class="p-padding-lg">点击确定按钮触发 Loading，1.5 秒后完成。</div>,
    beforeSure: done => {
      setTimeout(() => {
        done()
        success('操作完成')
      }, 1500)
    },
  })
}

const handleCustomContent = () => {
  const count = ref(0)
  openDialog({
    header: '自定义 TSX 内容',
    contentRenderer: () => (
      <div class="p-padding-lg gap-md flex flex-col">
        <div class="flex items-center gap-md bg-card p-padding-md rounded-scale-md">
          <Icons
            name="i-lucide-box"
            class="text-primary fs-xl"
          />
          <span>完全自定义的内容区域</span>
        </div>
        <div class="flex items-center gap-md">
          <span>Counter: {count.value}</span>
          <Button
            size="small"
            label="+"
            onClick={() => count.value++}
          />
        </div>
      </div>
    ),
  })
}

const handleNested = () => {
  openDialog({
    header: 'Level 1',
    contentRenderer: () => (
      <div class="p-padding-lg text-center">
        <Button
          label="Open Level 2"
          onClick={() => {
            openDialog({
              header: 'Level 2',
              modal: true,
              contentRenderer: () => <div class="p-padding-lg">最上层弹窗</div>,
            })
          }}
        />
      </div>
    ),
  })
}

// 位置演示
const handlePosition = (pos: DialogPosition) => {
  openDialog({
    header: `Position: ${pos}`,
    position: pos,
    modal: false,
    contentRenderer: () => <div class="p-padding-lg">Located at {pos}</div>,
  })
}
</script>

<template>
  <CScrollbar class="h-full p-padding-lg bg-background">
    <div class="w-full max-w-[80vw] mx-auto flex flex-col gap-xl">
      <div class="flex flex-col gap-xs">
        <h1 class="fs-2xl font-bold text-foreground">Dialog Component Full Demo</h1>
        <p class="text-muted-foreground">
          全功能演示：基于 useDialog 的二次封装，涵盖所有 Props 控制与交互模式。
        </p>
      </div>

      <!-- 1. 常用预设 -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          1. 常用预设 (Presets)
        </h2>
        <div class="flex flex-wrap gap-md">
          <Button
            label="Info"
            severity="info"
            @click="handleInfo"
          />
          <Button
            label="Success"
            severity="success"
            @click="handleSuccess"
          />
          <Button
            label="Warn"
            severity="warn"
            @click="handleWarn"
          />
          <Button
            label="Error"
            severity="danger"
            @click="handleError"
          />
          <Button
            label="Confirm"
            severity="help"
            @click="handleConfirm"
          />
          <Button
            label="Delete"
            severity="danger"
            outlined
            @click="handleConfirmDelete"
          />
        </div>
      </section>

      <!-- 2. 交互控制 -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          2. 交互控制 (Behaviors)
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          <!-- Mask -->
          <div
            class="p-padding-md border border-border rounded-scale-md bg-card flex flex-col gap-sm"
          >
            <h3 class="font-medium text-foreground">遮罩层 (Mask/Modal)</h3>
            <div class="flex flex-wrap gap-sm">
              <Button
                label="Modal (Default)"
                size="small"
                @click="handleModalTrue"
              />
              <Button
                label="No Modal"
                size="small"
                severity="secondary"
                @click="handleModalFalse"
              />
              <Button
                label="Click Mask to Close"
                size="small"
                severity="contrast"
                @click="handleCloseOnMask"
              />
            </div>
          </div>

          <!-- ESC & Close Icon -->
          <div
            class="p-padding-md border border-border rounded-scale-md bg-card flex flex-col gap-sm"
          >
            <h3 class="font-medium text-foreground">关闭方式 (Closing)</h3>
            <div class="flex flex-wrap gap-sm">
              <Button
                label="Enable ESC"
                size="small"
                @click="handleEscControl(true)"
              />
              <Button
                label="Disable ESC"
                size="small"
                severity="secondary"
                @click="handleEscControl(false)"
              />
              <Button
                label="No Close Icon"
                size="small"
                severity="danger"
                @click="handleNoCloseIcon"
              />
            </div>
          </div>

          <!-- Drag & Resize -->
          <div
            class="p-padding-md border border-border rounded-scale-md bg-card flex flex-col gap-sm"
          >
            <h3 class="font-medium text-foreground">拖拽与缩放 (Drag & Resize)</h3>
            <div class="flex flex-wrap gap-sm">
              <Button
                label="Draggable"
                size="small"
                @click="handleDraggable(true)"
              />
              <Button
                label="Not Draggable"
                size="small"
                severity="secondary"
                @click="handleDraggable(false)"
              />
              <Button
                label="Maximizable"
                size="small"
                severity="info"
                @click="handleMaximizable"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 界面显示 -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          3. 界面显示 (Visibility)
        </h2>
        <div class="flex flex-wrap gap-md">
          <Button
            label="Hide Header"
            severity="secondary"
            @click="handleNoHeader"
          />
          <Button
            label="Hide Footer"
            severity="secondary"
            @click="handleNoFooter"
          />
          <Button
            label="Custom Content (TSX)"
            severity="primary"
            @click="handleCustomContent"
          />
          <Button
            label="Custom Header (headerRenderer)"
            severity="secondary"
            outlined
            @click="handleHeaderRenderer"
          />
          <Button
            label="Custom Footer (footerRenderer)"
            severity="secondary"
            outlined
            @click="handleFooterRenderer"
          />
        </div>
      </section>

      <!-- 4. 逻辑控制 -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          4. 逻辑控制 (Logic)
        </h2>
        <div class="flex flex-wrap gap-md">
          <Button
            label="Async Button Loading"
            outlined
            @click="handleAsyncConfirm"
          />
          <Button
            label="Interceptor (beforeSure)"
            outlined
            severity="warn"
            @click="handleIntercept"
          />
          <Button
            label="Interceptor (beforeCancel)"
            outlined
            severity="secondary"
            @click="handleBeforeCancel"
          />
          <Button
            label="Nested Dialogs"
            outlined
            severity="info"
            @click="handleNested"
          />
        </div>
      </section>

      <!-- 5. 生命周期回调 -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          5. 生命周期回调 (Lifecycle)
        </h2>
        <div class="flex flex-wrap gap-md">
          <Button
            label="open/close 回调"
            severity="secondary"
            outlined
            @click="handleOpenCloseCallbacks"
          />
          <Button
            label="动态更新 (update)"
            severity="secondary"
            outlined
            @click="handleUpdateHeader"
          />
          <Button
            label="延迟打开 (openDelay)"
            severity="secondary"
            outlined
            @click="handleOpenDelay"
          />
        </div>
      </section>

      <!-- 6. 多弹窗管理 -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          6. 多弹窗管理 (Multi-Dialog)
        </h2>
        <div class="flex flex-wrap gap-md items-center">
          <Button
            label="Open 3 Dialogs"
            severity="info"
            outlined
            @click="handleOpenMultiple"
          />
          <Button
            label="Close Last"
            severity="secondary"
            outlined
            @click="() => closeLastDialog()"
          />
          <Button
            label="Close All"
            severity="danger"
            outlined
            @click="() => closeAll()"
          />
          <span class="text-muted-foreground fs-sm"> 当前弹窗数: {{ getDialogCount() }} </span>
        </div>
      </section>

      <!-- 7. 位置控制 -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          7. 位置控制 (Position)
        </h2>
        <div class="flex flex-wrap gap-sm">
          <Button
            label="Top"
            size="small"
            severity="secondary"
            @click="handlePosition('top')"
          />
          <Button
            label="Center"
            size="small"
            severity="secondary"
            @click="handlePosition('center')"
          />
          <Button
            label="Bottom"
            size="small"
            severity="secondary"
            @click="handlePosition('bottom')"
          />
          <Button
            label="Left"
            size="small"
            severity="secondary"
            @click="handlePosition('left')"
          />
          <Button
            label="Right"
            size="small"
            severity="secondary"
            @click="handlePosition('right')"
          />
          <Button
            label="Top Right"
            size="small"
            severity="secondary"
            @click="handlePosition('topright')"
          />
          <Button
            label="Bottom Right"
            size="small"
            severity="secondary"
            @click="handlePosition('bottomright')"
          />
          <Button
            label="Top Left"
            size="small"
            severity="secondary"
            @click="handlePosition('topleft')"
          />
          <Button
            label="Bottom Left"
            size="small"
            severity="secondary"
            @click="handlePosition('bottomleft')"
          />
        </div>
      </section>
    </div>
  </CScrollbar>
</template>
