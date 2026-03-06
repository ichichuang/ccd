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
    <!-- Height Mode -->
    <div class="flex flex-col gap-sm">
      <label class="fs-sm font-medium">高度模式 (Height Mode)</label>
      <div class="flex flex-wrap gap-sm">
        <Button
          label="自动 (Auto)"
          size="small"
          :severity="sizeConfig.heightMode === 'auto' ? 'primary' : 'secondary'"
          :outlined="sizeConfig.heightMode !== 'auto'"
          @click="updateConfig('heightMode', 'auto')"
        />
        <Button
          label="固定 (Fixed)"
          size="small"
          :severity="sizeConfig.heightMode === 'fixed' ? 'primary' : 'secondary'"
          :outlined="sizeConfig.heightMode !== 'fixed'"
          @click="updateConfig('heightMode', 'fixed')"
        />
        <Button
          label="撑满 (Fill)"
          size="small"
          :severity="sizeConfig.heightMode === 'fill' ? 'primary' : 'secondary'"
          :outlined="sizeConfig.heightMode !== 'fill'"
          @click="updateConfig('heightMode', 'fill')"
        />
      </div>
    </div>

    <div
      v-if="sizeConfig.heightMode === 'fixed'"
      class="flex flex-col gap-sm"
    >
      <label class="fs-sm font-medium">固定高度 (Height)</label>
      <InputText
        :model-value="String(sizeConfig.height ?? '')"
        placeholder="e.g. 400px"
        size="small"
        @update:model-value="updateConfig('height', $event)"
      />
    </div>

    <div class="flex flex-col gap-sm">
      <label class="fs-sm font-medium">宽度模式 (Width Mode)</label>
      <div class="flex flex-wrap gap-sm">
        <Button
          label="自动 (Auto)"
          size="small"
          :severity="sizeConfig.widthMode === 'auto' ? 'primary' : 'secondary'"
          :outlined="sizeConfig.widthMode !== 'auto'"
          @click="updateConfig('widthMode', 'auto')"
        />
        <Button
          label="固定 (Fixed)"
          size="small"
          :severity="sizeConfig.widthMode === 'fixed' ? 'primary' : 'secondary'"
          :outlined="sizeConfig.widthMode !== 'fixed'"
          @click="updateConfig('widthMode', 'fixed')"
        />
      </div>
    </div>

    <div
      v-if="sizeConfig.widthMode === 'fixed'"
      class="flex flex-col gap-sm"
    >
      <label class="fs-sm font-medium">固定宽度 (Width)</label>
      <InputText
        :model-value="String(sizeConfig.width ?? '')"
        placeholder="e.g. 800px"
        size="small"
        @update:model-value="updateConfig('width', $event)"
      />
    </div>

    <!-- Style Controls -->
    <div class="flex flex-col gap-sm">
      <label class="fs-sm font-medium mb-margin-xs">样式 (Style)</label>
      <div class="flex flex-col gap-sm">
        <div class="flex items-center justify-between">
          <label class="fs-sm">边框</label>
          <ToggleSwitch
            :model-value="styleConfig.bordered"
            @update:model-value="updateStyle('bordered', $event)"
          />
        </div>
        <div class="flex items-center justify-between">
          <label class="fs-sm">网格线</label>
          <ToggleSwitch
            :model-value="styleConfig.showGridlines"
            @update:model-value="updateStyle('showGridlines', $event)"
          />
        </div>
        <div class="flex items-center justify-between">
          <label class="fs-sm">斑马纹</label>
          <ToggleSwitch
            :model-value="styleConfig.stripedRows"
            @update:model-value="updateStyle('stripedRows', $event)"
          />
        </div>
        <div class="flex items-center justify-between">
          <label class="fs-sm">行悬停</label>
          <ToggleSwitch
            :model-value="styleConfig.rowHover"
            @update:model-value="updateStyle('rowHover', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Size -->
    <div class="flex flex-col gap-sm">
      <label class="fs-sm font-medium">表格尺寸 (Size)</label>
      <div class="flex flex-wrap gap-sm">
        <Button
          label="小 (Small)"
          size="small"
          :severity="(size ?? 'normal') === 'small' ? 'primary' : 'secondary'"
          :outlined="(size ?? 'normal') !== 'small'"
          @click="emit('update:size', 'small')"
        />
        <Button
          label="中 (Normal)"
          size="small"
          :severity="(size ?? 'normal') === 'normal' ? 'primary' : 'secondary'"
          :outlined="(size ?? 'normal') !== 'normal'"
          @click="emit('update:size', 'normal')"
        />
        <Button
          label="大 (Large)"
          size="small"
          :severity="(size ?? 'normal') === 'large' ? 'primary' : 'secondary'"
          :outlined="(size ?? 'normal') !== 'large'"
          @click="emit('update:size', 'large')"
        />
      </div>
    </div>

    <!-- Paginator -->
    <div
      v-if="showPaginatorPosition"
      class="flex flex-col gap-sm"
    >
      <label class="fs-sm font-medium">分页器位置 (Paginator Position)</label>
      <div class="flex flex-wrap gap-sm">
        <Button
          label="左 (Left)"
          size="small"
          :severity="(paginatorPosition ?? 'center') === 'left' ? 'primary' : 'secondary'"
          :outlined="(paginatorPosition ?? 'center') !== 'left'"
          @click="emit('update:paginatorPosition', 'left')"
        />
        <Button
          label="中 (Center)"
          size="small"
          :severity="(paginatorPosition ?? 'center') === 'center' ? 'primary' : 'secondary'"
          :outlined="(paginatorPosition ?? 'center') !== 'center'"
          @click="emit('update:paginatorPosition', 'center')"
        />
        <Button
          label="右 (Right)"
          size="small"
          :severity="(paginatorPosition ?? 'center') === 'right' ? 'primary' : 'secondary'"
          :outlined="(paginatorPosition ?? 'center') !== 'right'"
          @click="emit('update:paginatorPosition', 'right')"
        />
      </div>
    </div>

    <!-- Column Interactivity -->
    <div
      v-if="columnConfig"
      class="flex flex-col gap-md"
    >
      <div class="flex flex-col gap-sm">
        <div class="flex items-center justify-between">
          <label class="fs-sm text-muted-foreground mr-margin-md">列拖拽排序 (Reorderable)</label>
          <ToggleSwitch
            :model-value="columnConfig.reorderableColumns"
            @update:model-value="updateColumnConfig('reorderableColumns', $event)"
          />
        </div>
        <div class="flex items-center justify-between">
          <label class="fs-sm text-muted-foreground mr-margin-md">列宽可调 (Resizable)</label>
          <ToggleSwitch
            :model-value="columnConfig.resizableColumns"
            @update:model-value="updateColumnConfig('resizableColumns', $event)"
          />
        </div>
        <div
          v-if="columnConfig.resizableColumns"
          class="flex flex-col gap-sm mt-margin-xs"
        >
          <label class="fs-xs text-muted-foreground font-medium">列宽模式 (Resize Mode)</label>
          <div class="flex flex-wrap gap-sm">
            <Button
              label="内容贴合 (Fit)"
              size="small"
              :severity="columnConfig.columnResizeMode === 'fit' ? 'primary' : 'secondary'"
              :outlined="columnConfig.columnResizeMode !== 'fit'"
              @click="updateColumnConfig('columnResizeMode', 'fit')"
            />
            <Button
              label="等比展开 (Expand)"
              size="small"
              :severity="columnConfig.columnResizeMode === 'expand' ? 'primary' : 'secondary'"
              :outlined="columnConfig.columnResizeMode !== 'expand'"
              @click="updateColumnConfig('columnResizeMode', 'expand')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Content Alignment -->
    <div
      v-if="columnConfig"
      class="flex flex-col gap-sm mt-margin-xs"
    >
      <label class="fs-sm font-medium block">内容对齐 (Content Alignment)</label>
      <div class="flex gap-sm">
        <Button
          icon="i-lucide-align-left"
          size="small"
          :severity="columnConfig.contentAlign === 'left' ? 'primary' : 'secondary'"
          text
          @click="updateColumnConfig('contentAlign', 'left')"
        />
        <Button
          icon="i-lucide-align-center"
          size="small"
          :severity="columnConfig.contentAlign === 'center' ? 'primary' : 'secondary'"
          text
          @click="updateColumnConfig('contentAlign', 'center')"
        />
        <Button
          icon="i-lucide-align-right"
          size="small"
          :severity="columnConfig.contentAlign === 'right' ? 'primary' : 'secondary'"
          text
          @click="updateColumnConfig('contentAlign', 'right')"
        />
      </div>
    </div>
  </div>
</template>
