<script setup lang="tsx">
import { useDialog } from '@/hooks/components/useDialog'
import { Button } from 'primevue'
import { useConfirm } from 'primevue/useconfirm'

const {
  openDialog,
  info,
  success,
  warning,
  error,

  confirm,

  confirmDelete,
  update,
  closeDialog,
  closeLastDialog,
  closeAll,
  getDialogCount,
} = useDialog()

// PrimeVue 的确认对话框
const confirmDialog = useConfirm()

// 确认操作统一走 Toast 提示，复用示例中的信息交互体验

const showConfirmSuccessToast = () => window.$toast.success('操作已确认', '已根据指示完成当前操作')

const showConfirmCancelToast = () => window.$toast.warn('操作已取消', '已取消本次操作请求')

// 打开标准对话框
const openStandardDialog = () => {
  const dialogIndex = openDialog({
    header: '标准对话框',
    contentRenderer: () => {
      return <div class="w-50vw h-50vh"> 标准对话框内容 </div>
    },
    footerButtons: [
      {
        label: '自定义取消按钮',
        severity: 'danger',
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
      {
        label: '自定义确定按钮',
        severity: 'primary',
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}

// 打开可最大化对话框
const openMaximizableDialog = () => {
  const dialogIndex = openDialog({
    header: '可最大化对话框',
    maximizable: true,
    contentRenderer: () => {
      return <div>这是一个可以最大化的对话框</div>
    },
    footerButtons: [
      {
        label: '关闭',
        severity: 'danger',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}

// 打开确认对话框
const openConfirmDialog = () => {
  confirmDialog.require({
    header: '确认操作',
    message: '确定要执行此操作吗？',
    acceptLabel: '确定',
    rejectLabel: '取消',
    accept: () => {
      success('操作已确认')
    },
    reject: () => {
      info('操作已取消')
    },
  })
}

// 打开删除确认对话框
const openDeleteConfirmDialog = () => {
  confirmDialog.require({
    header: '删除确认',
    message: '确定要删除这条记录吗？删除后无法恢复。',
    acceptLabel: '删除',
    rejectLabel: '取消',
    acceptClass: '',
    accept: () => {
      success('删除成功')
    },
    reject: () => {
      info('已取消删除')
    },
  })
}

// 打开动态对话框
const openDynamicDialog = () => {
  const dialogIndex = openDialog({
    header: '动态对话框',
    contentRenderer: () => {
      return (
        <div class="px-padding">
          <p class="fs-appFontSizel">动态对话框</p>
          <div class="text-text200">这是一个动态创建的对话框内容</div>
          <div class="mt-gap">
            <Button
              onClick={() => {
                success('动态对话框操作成功')
              }}
            >
              点击我
            </Button>
          </div>
        </div>
      )
    },
    footerButtons: [
      {
        label: '关闭',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}

// 打开自定义头部对话框
const openCustomHeaderDialog = () => {
  openDialog({
    header: '自定义头部对话框',
    contentRenderer: () => {
      return <div class="p-padding">这是一个带有自定义头部的对话框，并不显示底部按钮</div>
    },
    hideFooter: true,
  })
}

// 打开加载状态对话框
const openLoadingDialog = () => {
  const dialogIndex = openDialog({
    header: '加载中',
    hideHeader: true,
    contentRenderer: () => {
      return (
        <div class="between-col gap-gap">
          <div>正在处理中...</div>
          <div class="fs-appFontSizes color-text200">点击确定 2s 后关闭</div>
        </div>
      )
    },
    sureBtnLoading: true,
    footerButtons: [
      {
        label: '取消',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
      {
        label: '确定',
        severity: 'primary',
        text: true,
        btnClick: () => {
          // 模拟异步操作
          setTimeout(() => {
            closeDialog(dialogIndex)
          }, 2000)
        },
      },
    ],
  })
}

// 打开不可点击遮罩关闭的对话框
const openNonDismissableDialog = () => {
  const dialogIndex = openDialog({
    header: '不可点击遮罩关闭的对话框',
    closeOnMask: false,
    closeOnEscape: false,
    contentRenderer: () => {
      return <div>这个对话框不能通过点击遮罩或按ESC键关闭，只能通过按钮关闭</div>
    },
    footerButtons: [
      {
        label: '关闭',
        severity: 'primary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}

// 打开可拖拽对话框
const openDraggableDialog = () => {
  const dialogIndex = openDialog({
    header: '可拖拽对话框',
    draggable: true,
    contentRenderer: () => {
      return <div>这个对话框可以通过拖拽标题栏来移动位置</div>
    },
    footerButtons: [
      {
        label: '关闭',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}

// 打开无遮罩对话框
const openNoModalDialog = () => {
  const dialogIndex = openDialog({
    header: '无遮罩对话框',
    modal: false,
    contentRenderer: () => {
      return <div>这个对话框没有背景遮罩，后面的元素可以点击</div>
    },
    footerButtons: [
      {
        label: '关闭',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}

// 打开自定义位置对话框
const openCustomPositionDialog = () => {
  const dialogIndex = openDialog({
    header: '自定义位置对话框',
    hideClose: true,
    position: 'top',
    contentRenderer: () => {
      return <div>这个对话框显示在页面顶部，并隐藏关闭按钮</div>
    },
    footerButtons: [
      {
        label: '关闭',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}

// 打开可更新属性的对话框
const openUpdatableDialog = () => {
  const dialogIndex = openDialog({
    header: '可更新属性的对话框',
    contentRenderer: () => {
      return <div>这个对话框的属性可以被动态更新</div>
    },
    footerButtons: [
      {
        label: '更新标题',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          update('更新后的标题', 'header', dialogIndex)
        },
      },
      {
        label: '关闭',
        severity: 'primary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}

// 演示关闭最后一个对话框
const closeLastOpenedDialog = () => {
  const count = getDialogCount()
  if (count > 0) {
    closeLastDialog()
  } else {
    info('当前没有打开的对话框')
  }
}

// 演示关闭所有对话框
const closeAllDialogs = () => {
  const count = getDialogCount()
  if (count > 0) {
    closeAll()
  } else {
    info('当前没有打开的对话框')
  }
}

// 显示当前对话框状态
const showDialogStatus = () => {
  const count = getDialogCount()
  info(`当前打开的对话框数量: ${count}`, '对话框状态')
}

// 测试 ESC 关闭事件
const testEscClose = () => {
  const dialogIndex = openDialog({
    header: '测试 ESC 关闭',
    contentRenderer: () => {
      return (
        <div class="px-padding">
          <p>这个对话框可以通过 ESC 键关闭</p>
          <p class="fs-appFontSizes color-text200">对话框索引: {dialogIndex}</p>
          <p class="fs-appFontSizes color-text200">当前对话框数量: {getDialogCount()}</p>
          <p class="color-accent100 my-gap">
            请按 ESC 键关闭此对话框，然后点击"显示状态"查看索引是否正确清理
          </p>
          <div class="mt-4">
            <Button
              onClick={() => {
                // 在内容中打开另一个对话框来测试嵌套
                const nestedIndex = openDialog({
                  header: '嵌套测试对话框',
                  contentRenderer: () => {
                    return (
                      <div class="p-4">
                        <p>这是嵌套的测试对话框</p>
                        <p class="fs-appFontSizes color-text200">嵌套对话框索引: {nestedIndex}</p>
                        <p class="fs-appFontSizes color-text200">外层对话框索引: {dialogIndex}</p>
                        <p class="fs-appFontSizes color-text200">
                          当前对话框数量: {getDialogCount()}
                        </p>
                        <p class="color-accent100 my-gap">
                          请按 ESC 键关闭此嵌套对话框，然后检查索引是否正确清理
                        </p>
                      </div>
                    )
                  },
                  footerButtons: [
                    {
                      label: '关闭嵌套',
                      severity: 'secondary',
                      text: true,
                      btnClick: () => {
                        closeDialog(nestedIndex)
                      },
                    },
                  ],
                })
              }}
            >
              打开嵌套测试对话框
            </Button>
          </div>
        </div>
      )
    },
    footerButtons: [
      {
        label: '手动关闭',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}

// 测试3层嵌套对话框
const testThreeLayerNestedDialog = () => {
  // 第一层对话框
  const firstLayerIndex = openDialog({
    header: '第一层对话框',
    contentRenderer: () => {
      return (
        <div class="px-padding">
          <p>这是第一层对话框</p>
          <p class="fs-appFontSizes color-text200">第一层索引: {firstLayerIndex}</p>
          <p class="fs-appFontSizes color-text200">当前对话框数量: {getDialogCount()}</p>
          <p class="color-accent100 my-gap">点击下方按钮打开第二层对话框</p>
          <div class="my-gap">
            <Button
              onClick={() => {
                // 打开第二层对话框
                const secondLayerIndex = openDialog({
                  header: '第二层对话框',
                  contentRenderer: () => {
                    return (
                      <div class="px-padding">
                        <p>这是第二层对话框</p>
                        <p class="fs-appFontSizes color-text200 ">第二层索引: {secondLayerIndex}</p>
                        <p class="fs-appFontSizes color-text200">第一层索引: {firstLayerIndex}</p>
                        <p class="fs-appFontSizes color-text200">
                          当前对话框数量: {getDialogCount()}
                        </p>
                        <p class="color-accent100 my-gap">点击下方按钮打开第三层对话框</p>
                        <div class="my-gap">
                          <Button
                            onClick={() => {
                              // 打开第三层对话框
                              const thirdLayerIndex = openDialog({
                                header: '第三层对话框',
                                contentRenderer: () => {
                                  return (
                                    <div class="px-padding">
                                      <p>这是第三层对话框（最内层）</p>
                                      <p class="fs-appFontSizes color-text200">
                                        第三层索引: {thirdLayerIndex}
                                      </p>
                                      <p class="fs-appFontSizes color-text200">
                                        第二层索引: {secondLayerIndex}
                                      </p>
                                      <p class="fs-appFontSizes color-text200">
                                        第一层索引: {firstLayerIndex}
                                      </p>
                                      <p class="fs-appFontSizes color-text200">
                                        当前对话框数量: {getDialogCount()}
                                      </p>
                                      <p class="color-accent100 my-gap">
                                        现在你有3层嵌套对话框！请测试 ESC 键关闭：
                                      </p>
                                      <ul class="fs-appFontSizes color-text200 my-gap">
                                        <li class="color-text200">
                                          按一次 ESC：关闭第三层（最内层）
                                        </li>
                                        <li>再按一次 ESC：关闭第二层</li>
                                        <li>再按一次 ESC：关闭第一层</li>
                                      </ul>
                                      <p class="color-accent100 my-gap">
                                        或者使用按钮手动关闭任意一层
                                      </p>
                                    </div>
                                  )
                                },
                                footerButtons: [
                                  {
                                    label: '关闭第三层',
                                    severity: 'secondary',
                                    text: true,
                                    btnClick: () => {
                                      closeDialog(thirdLayerIndex)
                                    },
                                  },
                                  {
                                    label: '关闭第二层',
                                    severity: 'warning',
                                    text: true,
                                    btnClick: () => {
                                      closeDialog(secondLayerIndex)
                                    },
                                  },
                                  {
                                    label: '关闭第一层',
                                    severity: 'danger',
                                    text: true,
                                    btnClick: () => {
                                      closeDialog(firstLayerIndex)
                                    },
                                  },
                                ],
                              })
                            }}
                          >
                            打开第三层对话框
                          </Button>
                        </div>
                      </div>
                    )
                  },
                  footerButtons: [
                    {
                      label: '关闭第二层',
                      severity: 'secondary',
                      text: true,
                      btnClick: () => {
                        closeDialog(secondLayerIndex)
                      },
                    },
                    {
                      label: '关闭第一层',
                      severity: 'danger',
                      text: true,
                      btnClick: () => {
                        closeDialog(firstLayerIndex)
                      },
                    },
                  ],
                })
              }}
            >
              打开第二层对话框
            </Button>
          </div>
        </div>
      )
    },
    footerButtons: [
      {
        label: '关闭第一层',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          closeDialog(firstLayerIndex)
        },
      },
    ],
  })
}
</script>

<template lang="pug">
.grid.grid-cols-1.gap-gapl(class='sm:grid-cols-2 xl:grid-cols-3 xxl:grid-cols-4')
  // 基础对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 基础对话框
    p.color-text200 标准对话框，支持自定义内容和按钮
    Button(label='打开标准对话框', severity='primary', @click='openStandardDialog')

  // 可最大化对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 可最大化对话框
    p.color-text200 支持最大化、最小化操作的对话框
    Button(label='打开可最大化对话框', severity='secondary', @click='openMaximizableDialog')

  // 确认对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 确认对话框
    p.color-text200 基于 PrimeVue ConfirmDialog 的确认对话框
    Button(label='打开确认对话框', severity='info', @click='openConfirmDialog')

  // 删除确认对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 删除确认对话框
    p.color-text200 专门用于删除操作的确认对话框
    Button(label='打开删除确认对话框', severity='danger', @click='openDeleteConfirmDialog')

  // 动态对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 动态对话框
    p.color-text200 基于 PrimeVue DynamicDialog 的动态组件对话框
    Button(label='打开动态对话框', severity='success', @click='openDynamicDialog')

  // 自定义头部对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 自定义头部对话框
    p.color-text200 支持自定义头部渲染的对话框
    Button(label='打开自定义头部对话框', severity='warning', @click='openCustomHeaderDialog')

  // 加载状态对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 加载状态对话框
    p.color-text200 支持按钮加载状态的对话框
    Button(label='打开加载状态对话框', severity='help', @click='openLoadingDialog')

  // 不可点击遮罩关闭的对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 不可点击遮罩关闭的对话框
    p.color-text200 不能通过点击遮罩或按ESC键关闭的对话框
    Button(label='打开不可点击遮罩关闭的对话框', severity='warning', @click='openNonDismissableDialog')

  // 可拖拽对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 可拖拽对话框
    p.color-text200 可以通过拖拽标题栏移动位置的对话框
    Button(label='打开可拖拽对话框', severity='info', @click='openDraggableDialog')

  // 无遮罩对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 无遮罩对话框
    p.color-text200 没有背景遮罩，后面元素可点击的对话框
    Button(label='打开无遮罩对话框', severity='secondary', @click='openNoModalDialog')

  // 自定义位置对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 自定义位置对话框
    p.color-text200 显示在页面顶部的对话框
    Button(label='打开自定义位置对话框', severity='success', @click='openCustomPositionDialog')

  // 可更新属性对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 可更新属性对话框
    p.color-text200 支持动态更新对话框属性的对话框
    Button(label='打开可更新属性对话框', severity='help', @click='openUpdatableDialog')

  // 便捷方法
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 便捷方法
    p.color-text200 快速打开各种类型的对话框
    .between
      Button(label='信息提示', severity='info', text, @click='() => info("这是一条信息提示")')
      Button(label='成功提示', severity='success', text, @click='() => success("操作成功完成")')
      Button(label='警告提示', severity='warning', text, @click='() => warning("请注意这个警告")')
      Button(label='错误提示', severity='danger', text, @click='() => error("发生了一个错误")')

  // 高级便捷方法
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 高级便捷方法
    p.color-text200 快速打开各种类型的对话框并自定义
    .between
      Button(label='信息提示', severity='info', text, @click='() => info("这是一条信息提示")')
      Button(label='成功提示', severity='success', text, @click='() => success("操作成功完成")')
      Button(label='警告提示', severity='warning', text, @click='() => warning("请注意这个警告")')
      Button(label='错误提示', severity='danger', text, @click='() => error("发生了一个错误")')

  // 确认操作
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 确认操作
    p.color-text200 快速确认操作
    .between.gap-gap
      Button(
        label='确认操作',
        severity='primary',
        outlined,
        @click='() => confirm("确定要执行此操作吗？", "确认", { onConfirm: showConfirmSuccessToast, onCancel: showConfirmCancelToast })'
      )
      Button(
        label='删除确认操作',
        severity='danger',
        outlined,
        @click='() => confirmDelete("确定要执行此操作吗？", "确认", { onConfirm: showConfirmSuccessToast, onCancel: showConfirmCancelToast })'
      )

  // 对话框管理
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 对话框管理
    p.color-text200 管理已打开的对话框
    .between
      Button(label='显示状态', severity='info', text, @click='showDialogStatus')
      Button(label='关闭最后', severity='warning', text, @click='closeLastOpenedDialog')
      Button(label='关闭全部', severity='danger', text, @click='closeAllDialogs')

  // 测试 ESC 关闭
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 测试 ESC 关闭
    p.color-text200 测试 ESC 键关闭对话框时索引是否正确清理
    Button(label='测试 ESC 关闭', severity='info', @click='testEscClose')

  // 测试3层嵌套对话框
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center 测试3层嵌套对话框
    p.color-text200 测试多层嵌套对话框的独立关闭和索引管理
    Button(label='测试3层嵌套', severity='success', @click='testThreeLayerNestedDialog')
</template>
