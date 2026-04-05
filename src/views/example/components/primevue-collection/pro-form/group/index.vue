<script setup lang="ts">
defineOptions({ name: 'ExampleProFormLayoutGroupPage' })

import type { FormSchema } from '@/components/ProForm'

// ── Card 分组 Schema ──────────────────────────────────────────────
const cardSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'card',
      name: 'group_personal',
      label: '个人信息',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        { name: 'firstName', component: 'input', label: '名', props: { placeholder: '名字' } },
        { name: 'lastName', component: 'input', label: '姓', props: { placeholder: '姓氏' } },
        {
          name: 'birthday',
          component: 'date',
          label: '出生日期',
          span: { xs: 12 },
          props: { placeholder: '选择日期' },
        },
      ],
    },
    {
      type: 'card',
      name: 'group_contact',
      label: '联系方式',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'email',
          component: 'input',
          label: '邮箱',
          props: { placeholder: 'user@example.com' },
        },
        { name: 'phone', component: 'input', label: '手机', props: { placeholder: '+86 138...' } },
        {
          name: 'address',
          component: 'textarea',
          label: '地址',
          span: { xs: 12 },
          props: { placeholder: '详细地址', rows: 2 },
        },
      ],
    },
  ],
})

// ── Collapse 分组 Schema ──────────────────────────────────────────
const collapseSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'collapse',
      name: 'collapse_basic',
      label: '基础设置',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'siteName',
          component: 'input',
          label: '站点名称',
          props: { placeholder: '我的站点' },
        },
        {
          name: 'siteDesc',
          component: 'textarea',
          label: '站点描述',
          span: { xs: 12 },
          props: { placeholder: '简短描述...', rows: 2 },
        },
      ],
    },
    {
      type: 'collapse',
      name: 'collapse_advanced',
      label: '高级设置（默认折叠）',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'maxConnections',
          component: 'number',
          label: '最大连接数',
          defaultValue: 100,
          props: { min: 1, max: 1000 },
        },
        {
          name: 'enableCache',
          component: 'switch',
          label: '启用缓存',
          defaultValue: true,
        },
        {
          name: 'cacheTimeout',
          component: 'number',
          label: '缓存超时（秒）',
          defaultValue: 300,
          visibleIf: ({ form }) => form['enableCache'] === true,
          deps: ['enableCache'],
          props: { min: 10, max: 86400 },
          span: { xs: 12 },
        },
      ],
    },
  ],
})

// ── Tabs 分组 Schema ──────────────────────────────────────────────
const tabsSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'tabs',
      name: 'tabs_root',
      layout: { type: 'grid', gap: 'var(--spacing-md)' },
      children: [
        {
          type: 'card',
          name: 'tab_basic',
          label: '基础',
          layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
          children: [
            {
              name: 'tabUsername',
              component: 'input',
              label: '用户名',
              props: { placeholder: '用户名' },
            },
            {
              name: 'tabRole',
              component: 'select',
              label: '角色',
              props: { placeholder: '选择角色' },
              options: [
                { label: '管理员', value: 'admin' },
                { label: '编辑', value: 'editor' },
                { label: '访客', value: 'viewer' },
              ],
            },
          ],
        },
        {
          type: 'card',
          name: 'tab_security',
          label: '安全',
          layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12 } },
          children: [
            {
              name: 'tabOldPwd',
              component: 'input',
              label: '旧密码',
              props: { type: 'password', placeholder: '当前密码' },
            },
            {
              name: 'tabNewPwd',
              component: 'input',
              label: '新密码',
              props: { type: 'password', placeholder: '新密码' },
            },
            { name: 'tabMfa', component: 'switch', label: '启用双因素认证', defaultValue: false },
          ],
        },
        {
          type: 'card',
          name: 'tab_notifications',
          label: '通知',
          layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
          children: [
            { name: 'notifyEmail', component: 'switch', label: '邮件通知', defaultValue: true },
            { name: 'notifySms', component: 'switch', label: '短信通知', defaultValue: false },
            {
              name: 'notifyFrequency',
              component: 'select',
              label: '通知频率',
              defaultValue: 'daily',
              options: [
                { label: '实时', value: 'realtime' },
                { label: '每日汇总', value: 'daily' },
                { label: '每周汇总', value: 'weekly' },
              ],
              span: { xs: 12 },
            },
          ],
        },
      ],
    },
  ],
})

// ── Step 向导 Schema ──────────────────────────────────────────────
const stepSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'step',
      name: 'wizard_root',
      layout: { type: 'grid', gap: 'var(--spacing-md)' },
      children: [
        {
          type: 'card',
          name: 'step_account',
          label: '账号信息',
          layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
          children: [
            {
              name: 'wizardUsername',
              component: 'input',
              label: '用户名',
              required: true,
              props: { placeholder: '3-20 个字符' },
            },
            {
              name: 'wizardEmail',
              component: 'input',
              label: '邮箱',
              required: true,
              props: { placeholder: 'user@example.com' },
            },
            {
              name: 'wizardPassword',
              component: 'input',
              label: '密码',
              required: true,
              span: { xs: 12 },
              props: { type: 'password', placeholder: '至少8位' },
            },
          ],
        },
        {
          type: 'card',
          name: 'step_profile',
          label: '个人资料',
          layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
          children: [
            {
              name: 'wizardFirstName',
              component: 'input',
              label: '名',
              props: { placeholder: '名字' },
            },
            {
              name: 'wizardLastName',
              component: 'input',
              label: '姓',
              props: { placeholder: '姓氏' },
            },
            {
              name: 'wizardBio',
              component: 'textarea',
              label: '个人简介',
              span: { xs: 12 },
              props: { placeholder: '简单介绍自己...', rows: 3 },
            },
          ],
        },
        {
          type: 'card',
          name: 'step_confirm',
          label: '确认提交',
          layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12 } },
          children: [
            {
              name: 'wizardAgreeTerms',
              component: 'checkbox',
              label: '我已阅读并同意服务条款与隐私政策',
              required: true,
            },
            {
              name: 'wizardSubscribe',
              component: 'switch',
              label: '订阅产品更新邮件',
              defaultValue: true,
            },
          ],
        },
      ],
    },
  ],
})

// ── type: 'group' 分组 Schema（无卡片边框，仅标签 + 栅格）────────────────
const groupSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'group',
      name: 'group_plain',
      label: 'type: group — 纯分组',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'groupNickname',
          component: 'input',
          label: '昵称',
          props: { placeholder: '昵称' },
        },
        {
          name: 'groupLang',
          component: 'select',
          label: '语言',
          props: { placeholder: '选择' },
          options: [
            { label: '中文', value: 'zh' },
            { label: 'English', value: 'en' },
          ],
        },
        {
          name: 'groupTz',
          component: 'input',
          label: '时区',
          span: { xs: 12 },
          props: { placeholder: '如 Asia/Shanghai' },
        },
      ],
    },
  ],
})

// ── type: 'section' 分组 Schema（与 group 同渲染层，语义为「区块」）────────
const sectionSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'section',
      name: 'section_audit',
      label: 'type: section — 审计信息',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'sectionOperator',
          component: 'input',
          label: '操作人',
          props: { placeholder: '操作人' },
        },
        {
          name: 'sectionRemark',
          component: 'textarea',
          label: '备注',
          span: { xs: 12 },
          props: { placeholder: '可选备注', rows: 2 },
        },
      ],
    },
  ],
})

// ── Refs & Handlers ───────────────────────────────────────────────

async function onSubmit(label: string, values: Record<string, unknown>): Promise<void> {
  console.log(`[${label}] Submit:`, values)
  window.$toast?.successIn('top-right', `${label} 提交成功`, '已在控制台输出 values')
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col"
  >
    <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
      <div class="row-between gap-md min-w-0">
        <div class="row-start gap-sm min-w-0 flex-wrap">
          <div class="glass-icon-box shrink-0">
            <Icons
              name="i-lucide-group"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">ProForm 分组布局</span>
              <span class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PRO-FORM
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              演示六种分组容器：Card 卡片、Collapse 折叠、Tabs 标签页、Step 向导、Group 纯分组与
              Section 区块。覆盖能力：card/collapse/tabs/step/group/section
              六类容器、向导式组织与响应式布局。
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Scrollable content -->
    <CScrollbar class="col-fill">
      <div class="layout-container py-md col-stretch gap-xl pb-xl">
        <!-- Card 分组 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-center gap-sm pb-sm mb-sm">
            <Icons
              name="i-lucide-layout-panel-top"
              class="text-primary"
            />
            <span class="font-semibold text-foreground uppercase tracking-wider">
              type: 'card' — 卡片分组
            </span>
          </div>
          <div class="col-stretch gap-md">
            <p class="text-muted-foreground text-sm m-0 border-border/40 pb-sm mb-xs italic">
              视觉分区清晰，通过 Card 容器对字段进行物理隔离。
            </p>
            <ProForm
              ref="cardFormRef"
              :schema="cardSchema"
              @submit="v => onSubmit('Card', v)"
            >
              <template #footer="{ submit, formState }">
                <div class="row-end pt-md mt-md border-t-default border-border/15">
                  <Button
                    label="保存个人资料"
                    icon="i-lucide-save"
                    :loading="formState.submitting"
                    @click="submit"
                  />
                </div>
              </template>
            </ProForm>
          </div>
        </section>

        <!-- Collapse 分组 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-center gap-sm pb-sm mb-sm">
            <Icons
              name="i-lucide-panel-top-close"
              class="text-primary"
            />
            <span class="font-semibold text-foreground uppercase tracking-wider">
              type: 'collapse' — 可折叠分组
            </span>
          </div>
          <div class="col-stretch gap-md">
            <p class="text-muted-foreground text-sm m-0 border-border/40 pb-sm mb-xs italic">
              适合将高级或非必要设置项默认收起。
            </p>
            <ProForm
              ref="collapseFormRef"
              :schema="collapseSchema"
              @submit="v => onSubmit('Collapse', v)"
            >
              <template #footer="{ submit, formState }">
                <div class="row-end pt-md mt-md border-t-default border-border/15">
                  <Button
                    label="更新站点配置"
                    icon="i-lucide-refresh-cw"
                    :loading="formState.submitting"
                    @click="submit"
                  />
                </div>
              </template>
            </ProForm>
          </div>
        </section>

        <!-- Tabs 分组 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-center gap-sm pb-sm mb-sm">
            <Icons
              name="i-lucide-panel-top"
              class="text-primary"
            />
            <span class="font-semibold text-foreground uppercase tracking-wider">
              type: 'tabs' — 标签页布局
            </span>
          </div>
          <div class="col-stretch gap-md">
            <p class="text-muted-foreground text-sm m-0 border-border/40 pb-sm mb-xs italic">
              水平轴分区，适合信息维度较广的大型表单。
            </p>
            <ProForm
              ref="tabsFormRef"
              :schema="tabsSchema"
              @submit="v => onSubmit('Tabs', v)"
            >
              <template #footer="{ submit, formState }">
                <div class="row-end pt-md mt-md border-t-default border-border/15">
                  <Button
                    label="同步账号设置"
                    icon="i-lucide-user-cog"
                    :loading="formState.submitting"
                    @click="submit"
                  />
                </div>
              </template>
            </ProForm>
          </div>
        </section>

        <!-- Step 向导 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-center gap-sm pb-sm mb-sm">
            <Icons
              name="i-lucide-footprints"
              class="text-primary"
            />
            <span class="font-semibold text-foreground uppercase tracking-wider">
              type: 'step' — 分步向导
            </span>
          </div>
          <div class="col-stretch gap-md">
            <p class="text-muted-foreground text-sm m-0 border-border/40 pb-sm mb-xs italic">
              线性引导式交互，自动驱动 PrimeVue Stepper。
            </p>
            <ProForm
              ref="stepFormRef"
              :schema="stepSchema"
              @submit="v => onSubmit('Step', v)"
            >
              <template #footer="{ submit, formState }">
                <div class="row-end pt-md mt-md border-t-default border-border/15">
                  <Button
                    label="完成注册流程"
                    icon="i-lucide-user-plus"
                    :loading="formState.submitting"
                    @click="submit"
                  />
                </div>
              </template>
            </ProForm>
          </div>
        </section>

        <!-- type: group 纯分组 & section 区块 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-xl">
          <section class="material-elevated col-stretch gap-lg">
            <div class="row-center gap-sm pb-sm mb-sm">
              <Icons
                name="i-lucide-braces"
                class="text-primary"
              />
              <span class="font-semibold text-foreground uppercase tracking-wider">
                type: 'group' — 纯分组
              </span>
            </div>
            <div class="col-stretch gap-md">
              <p class="text-muted-foreground text-sm m-0 mb-sm italic">
                无卡片边框，适合轻量级内部布局。
              </p>
              <ProForm
                ref="groupFormRef"
                :schema="groupSchema"
                @submit="v => onSubmit('Group', v)"
              >
                <template #footer="{ submit, formState }">
                  <div class="row-end pt-md mt-md border-t-default border-border/15">
                    <Button
                      label="提交保存"
                      icon="i-lucide-send"
                      :loading="formState.submitting"
                      @click="submit"
                    />
                  </div>
                </template>
              </ProForm>
            </div>
          </section>

          <section class="material-elevated col-stretch gap-lg">
            <div class="row-center gap-sm pb-sm mb-sm">
              <Icons
                name="i-lucide-section"
                class="text-primary"
              />
              <span class="font-semibold text-foreground uppercase tracking-wider">
                type: 'section' — 区块
              </span>
            </div>
            <div class="col-stretch gap-md">
              <p class="text-muted-foreground text-sm m-0 mb-sm italic">
                常用于表单末尾的辅助信息区块。
              </p>
              <ProForm
                ref="sectionFormRef"
                :schema="sectionSchema"
                @submit="v => onSubmit('Section', v)"
              >
                <template #footer="{ submit, formState }">
                  <div class="row-end pt-md mt-md border-t-default border-border/15">
                    <Button
                      label="保存审计备注"
                      icon="i-lucide-file-check"
                      :loading="formState.submitting"
                      @click="submit"
                    />
                  </div>
                </template>
              </ProForm>
            </div>
          </section>
        </div>
      </div>
    </CScrollbar>
  </div>
</template>
