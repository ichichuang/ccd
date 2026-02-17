<script setup lang="ts">
import type { TableSizeConfig } from '@/components/DataTable/utils/types'

export interface TableStyleConfig {
  bordered: boolean
  showGridlines: boolean
  stripedRows: boolean
  rowHover: boolean
}

export interface TableColumnConfig {
  reorderableColumns: boolean
  resizableColumns: boolean
  columnResizeMode: 'fit' | 'expand'
  contentAlign?: 'left' | 'center' | 'right'
}

const props = defineProps<{
  sizeConfig: TableSizeConfig
  styleConfig: TableStyleConfig
  size?: 'small' | 'normal' | 'large'
  paginatorPosition?: 'left' | 'center' | 'right'
  columnConfig?: TableColumnConfig
  showPaginatorPosition?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:sizeConfig', value: TableSizeConfig): void
  (e: 'update:styleConfig', value: TableStyleConfig): void
  (e: 'update:size', value: 'small' | 'normal' | 'large'): void
  (e: 'update:paginatorPosition', value: 'left' | 'center' | 'right'): void
  (e: 'update:columnConfig', value: TableColumnConfig): void
}>()

const updateConfig = (key: keyof TableSizeConfig, value: unknown) => {
  emit('update:sizeConfig', { ...props.sizeConfig, [key]: value })
}

const updateStyle = (key: keyof TableStyleConfig, value: boolean) => {
  emit('update:styleConfig', { ...props.styleConfig, [key]: value })
}

const updateColumnConfig = (key: keyof TableColumnConfig, value: unknown) => {
  const cfg = props.columnConfig ?? {
    reorderableColumns: false,
    resizableColumns: false,
    columnResizeMode: 'fit' as const,
    contentAlign: 'left' as const,
  }
  emit('update:columnConfig', { ...cfg, [key]: value })
}
</script>

<template>
  <div class="flex flex-col gap-md">
    <!-- Size Controls -->
    <div class="flex flex-col gap-sm">
      <label class="text-sm font-medium">高度模式 (Height Mode)</label>
      <div class="flex gap-sm">
        <Button
          label="自动 (Auto)"
          size="small"
          :severity="sizeConfig.heightMode === 'auto' ? 'primary' : 'secondary'"
          @click="updateConfig('heightMode', 'auto')"
        />
        <Button
          label="固定 (Fixed)"
          size="small"
          :severity="sizeConfig.heightMode === 'fixed' ? 'primary' : 'secondary'"
          @click="updateConfig('heightMode', 'fixed')"
        />
        <Button
          label="撑满 (Fill)"
          size="small"
          :severity="sizeConfig.heightMode === 'fill' ? 'primary' : 'secondary'"
          @click="updateConfig('heightMode', 'fill')"
        />
      </div>
    </div>

    <div
      v-if="sizeConfig.heightMode === 'fixed'"
      class="flex flex-col gap-sm"
    >
      <label class="text-sm font-medium">固定高度 (Height)</label>
      <InputText
        :model-value="String(sizeConfig.height ?? '')"
        placeholder="e.g. 400px"
        size="small"
        @update:model-value="updateConfig('height', $event)"
      />
    </div>

    <div class="flex flex-col gap-sm">
      <label class="text-sm font-medium">宽度模式 (Width Mode)</label>
      <div class="flex gap-sm">
        <Button
          label="自动 (Auto)"
          size="small"
          :severity="sizeConfig.widthMode === 'auto' ? 'primary' : 'secondary'"
          @click="updateConfig('widthMode', 'auto')"
        />
        <Button
          label="固定 (Fixed)"
          size="small"
          :severity="sizeConfig.widthMode === 'fixed' ? 'primary' : 'secondary'"
          @click="updateConfig('widthMode', 'fixed')"
        />
      </div>
    </div>

    <div
      v-if="sizeConfig.widthMode === 'fixed'"
      class="flex flex-col gap-sm"
    >
      <label class="text-sm font-medium">固定宽度 (Width)</label>
      <InputText
        :model-value="String(sizeConfig.width ?? '')"
        placeholder="e.g. 800px"
        size="small"
        @update:model-value="updateConfig('width', $event)"
      />
    </div>

    <div class="border-t-default my-sm" />

    <!-- Style Controls -->
    <div class="flex flex-col gap-sm">
      <label class="text-sm font-medium">样式 (Style)</label>
      <div class="flex items-center justify-between">
        <label class="text-sm text-muted-foreground">边框 (Bordered)</label>
        <ToggleSwitch
          :model-value="styleConfig.bordered"
          @update:model-value="updateStyle('bordered', $event)"
        />
      </div>
      <div class="flex items-center justify-between">
        <label class="text-sm text-muted-foreground">网格线 (Gridlines)</label>
        <ToggleSwitch
          :model-value="styleConfig.showGridlines"
          @update:model-value="updateStyle('showGridlines', $event)"
        />
      </div>
      <div class="flex items-center justify-between">
        <label class="text-sm text-muted-foreground">斑马纹 (Striped)</label>
        <ToggleSwitch
          :model-value="styleConfig.stripedRows"
          @update:model-value="updateStyle('stripedRows', $event)"
        />
      </div>
      <div class="flex items-center justify-between">
        <label class="text-sm text-muted-foreground">行悬停 (RowHover)</label>
        <ToggleSwitch
          :model-value="styleConfig.rowHover"
          @update:model-value="updateStyle('rowHover', $event)"
        />
      </div>
    </div>

    <div class="border-t-default my-sm" />

    <!-- Size & Paginator -->
    <div class="flex flex-col gap-sm">
      <label class="text-sm font-medium">表格尺寸 (Size)</label>
      <div class="flex gap-sm">
        <Button
          label="小 (Small)"
          size="small"
          :severity="(size ?? 'normal') === 'small' ? 'primary' : 'secondary'"
          @click="emit('update:size', 'small')"
        />
        <Button
          label="中 (Normal)"
          size="small"
          :severity="(size ?? 'normal') === 'normal' ? 'primary' : 'secondary'"
          @click="emit('update:size', 'normal')"
        />
        <Button
          label="大 (Large)"
          size="small"
          :severity="(size ?? 'normal') === 'large' ? 'primary' : 'secondary'"
          @click="emit('update:size', 'large')"
        />
      </div>
    </div>

    <div
      v-if="showPaginatorPosition"
      class="flex flex-col gap-sm"
    >
      <label class="text-sm font-medium">分页器位置 (Paginator Position)</label>
      <div class="flex gap-sm">
        <Button
          label="左"
          size="small"
          :severity="(paginatorPosition ?? 'center') === 'left' ? 'primary' : 'secondary'"
          @click="emit('update:paginatorPosition', 'left')"
        />
        <Button
          label="中"
          size="small"
          :severity="(paginatorPosition ?? 'center') === 'center' ? 'primary' : 'secondary'"
          @click="emit('update:paginatorPosition', 'center')"
        />
        <Button
          label="右"
          size="small"
          :severity="(paginatorPosition ?? 'center') === 'right' ? 'primary' : 'secondary'"
          @click="emit('update:paginatorPosition', 'right')"
        />
      </div>
    </div>

    <div
      v-if="columnConfig"
      class="border-t-default my-sm"
    >
      <label class="text-sm font-medium mb-margin-sm block">列交互 (Column)</label>
      <div class="flex flex-col gap-sm mt-margin-sm">
        <div class="flex items-center justify-between">
          <label class="text-sm text-muted-foreground">列拖拽排序 (Reorderable)</label>
          <ToggleSwitch
            :model-value="columnConfig.reorderableColumns"
            @update:model-value="updateColumnConfig('reorderableColumns', $event)"
          />
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm text-muted-foreground">列宽可调 (Resizable)</label>
          <ToggleSwitch
            :model-value="columnConfig.resizableColumns"
            @update:model-value="updateColumnConfig('resizableColumns', $event)"
          />
        </div>
        <div
          v-if="columnConfig.resizableColumns"
          class="flex flex-col gap-sm"
        >
          <label class="text-sm text-muted-foreground">列宽模式</label>
          <div class="flex gap-sm">
            <Button
              label="Fit"
              size="small"
              :severity="columnConfig.columnResizeMode === 'fit' ? 'primary' : 'secondary'"
              @click="updateColumnConfig('columnResizeMode', 'fit')"
            />
            <Button
              label="Expand"
              size="small"
              :severity="columnConfig.columnResizeMode === 'expand' ? 'primary' : 'secondary'"
              @click="updateColumnConfig('columnResizeMode', 'expand')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Content Alignment -->
    <div
      v-if="columnConfig"
      class="border-t-default my-sm"
    >
      <label class="text-sm font-medium mb-margin-sm block">内容对齐 (Content Alignment)</label>
      <div class="flex gap-sm mt-margin-sm">
        <Button
          icon="i-lucide-align-left"
          size="small"
          :severity="columnConfig.contentAlign === 'left' ? 'primary' : 'secondary'"
          @click="updateColumnConfig('contentAlign', 'left')"
        />
        <Button
          icon="i-lucide-align-center"
          size="small"
          :severity="columnConfig.contentAlign === 'center' ? 'primary' : 'secondary'"
          @click="updateColumnConfig('contentAlign', 'center')"
        />
        <Button
          icon="i-lucide-align-right"
          size="small"
          :severity="columnConfig.contentAlign === 'right' ? 'primary' : 'secondary'"
          @click="updateColumnConfig('contentAlign', 'right')"
        />
      </div>
    </div>
  </div>
</template>
