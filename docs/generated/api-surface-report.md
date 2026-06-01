# API Surface Report

## @ccd/contracts

- Path: `packages/contracts`
- Export subpaths: `.`
- Root symbols: `CryptoProvider`, `EnvironmentProvider`, `FileSystemAdapter`, `HttpAuthCredentialPlacement`, `HttpAuthPolicy`, `HttpAuthRefreshMode`, `HttpAuthScheme`, `HttpErrorKind`, `HttpHeaders`, `HttpHeaderValue`, `HttpQuery`, `HttpQueryPrimitive`, `HttpQueryValue`, `HttpRequestBody`, `HttpRequestConfig`, `HttpRequestErrorShape`, `HttpRequestMethod`, `HttpResponseEnvelope`, `HttpResponseMetadata`, `HttpRetryBackoffStrategy`, `HttpRetryJitterStrategy`, `HttpRetryPolicy`, `HttpRetryTrigger`, `HttpTimeoutPhase`, `HttpTimeoutPolicy`, `HttpTransportClient`, `HttpTransportRequest`, `HttpTransportResponse`, `Logger`, `NetworkClient`, `NetworkRequest`, `NetworkResponse`, `SafeStorageAdapter`, `SafeStorageObfuscation`, `SafeStoragePolicy`, `ScheduledTask`, `Scheduler`, `StorageAdapter`, `StorageCodec`, `StorageScope`, `SyncStorageCodec`

## @ccd/core

- Path: `packages/core`
- Export subpaths: `.`
- Root symbols: `CoreAdapters`, `CoreRuntime`, `createCoreRuntime`, `CryptoProvider`, `EnvironmentProvider`, `FileSystemAdapter`, `Logger`, `NetworkClient`, `NetworkRequest`, `NetworkResponse`, `ScheduledTask`, `Scheduler`, `StorageAdapter`

## @ccd/design-tokens

- Path: `packages/design-tokens`
- Export subpaths: `.`, `./theme-engine`
- Root symbols: `adjustBrightness`, `applyOpacityToColor`, `BreakpointKey`, `BreakpointResolverSource`, `BreakpointThresholdMap`, `ColorTokenState`, `CompleteColorTokenState`, `CompleteThemeModeConfig`, `CompleteThemePreset`, `createSortedBreakpoints`, `decideLayoutDimensions`, `decideRootFontSize`, `deriveRuntimeFontSizeVars`, `deriveSidebarCollapsedWidth`, `DeviceResolverDeviceType`, `DeviceResolverOrientation`, `DeviceResolverOsType`, `DeviceTypeResolverInput`, `FontSizeCssVarName`, `generateSizeVars`, `getPresetPrimaryColor`, `getScopedContentSizeVars`, `hexToRgb`, `isDarkColor`, `mixHex`, `normalizeHex`, `RadiusCssVarName`, `resolveBreakpointFromWidth`, `resolveDeviceTypeFromInputs`, `resolveOrientationFromViewport`, `resolveOsTypeFromUserAgent`, `resolveSizePreset`, `resolveViewportMetrics`, `rgbToHex`, `RootFontSizeContext`, `RootFontSizeDecision`, `shiftHue`, `SIZE_FONT_VAR_PREFIX`, `SizeCssVarName`, `SizeCssVars`, `SizeMode`, `SizePreset`, `SizeResolverDeviceType`, `SizeScaleKey`, `SizeScaleMatrixEntry`, `SORTED_BREAKPOINTS`, `SortedBreakpointEntry`, `SpacingCssVarName`, `StaticSizeCssVarName`, `ThemeCssVars`, `ThemeMode`, `ThemeModeConfig`, `ThemePreset`, `ThemeTransitionDuration`, `ThemeTransitionMode`, `TransitionCssVarName`, `ViewportMetrics`, `ViewportMetricsInput`

## @ccd/unocss-preset

- Path: `packages/unocss-preset`
- Export subpaths: `.`, `./browser`, `./safelist`, `./theme`
- Root symbols: `CcdUnoConfigOptions`, `configureCcdUnoPresetProject`, `createCcdUnoConfig`, `createCcdUnoEngineConfig`, `getCustomIconClasses`, `getEngineSafelist`, `getPresetIconsCollections`, `invalidateIconCaches`, `semanticShortcuts`, `theme`

## @ccd/shared-utils

- Path: `packages/shared-utils`
- Export subpaths: `.`
- Root symbols: `applyUniqueRoot`, `areExpandedKeyRecordsEqual`, `CapabilityBridge`, `CapabilityBridgeOptions`, `castArray`, `castRecord`, `castValue`, `createCapabilityBridge`, `debounceFn`, `deepClone`, `deepEqual`, `deepMerge`, `fnv1a`, `formatSerialId`, `generateIdFromKey`, `generateUniqueId`, `isRecord`, `JsonStorageParseResult`, `JsonStorageStringifyResult`, `objectGet`, `parseJsonStorageValue`, `stableSerializeRecord`, `stringifyJsonStorageValue`, `throttleFn`, `toKebabCase`, `toRecord`

## @ccd/vue-hooks

- Path: `packages/vue-hooks`
- Export subpaths: `.`
- Root symbols: `createAutoMittHook`, `installInteractionDirectives`, `InteractionDirectiveInstallOptions`, `InteractionTarget`, `SwipeDirection`, `useAppElementSize`, `UseAppElementSizeReturn`, `useDragAction`, `UseDragActionOptions`, `UseDragActionReturn`, `UseElementSizeOptions`, `useInteraction`, `UseInteractionReturn`, `useLongPressAction`, `UseLongPressActionOptions`, `UseLongPressActionReturn`, `useSwipeAction`, `UseSwipeActionOptions`, `UseSwipeActionReturn`, `useTap`, `UseTapOptions`, `UseTapReturn`, `vLongPress`, `vSwipe`, `vTap`

## @ccd/vue-app-platform

- Path: `packages/vue-app-platform`
- Export subpaths: `.`
- Root symbols: `AdminLayoutMode`, `applyThemeVars`, `ApplyThemeVarsOptions`, `DeviceType`, `enforceLayoutModeVisibilityConstraints`, `enforceLayoutVisibilityParentRequirements`, `fadeOutNativePreloader`, `FadeOutNativePreloaderOptions`, `isNarrowLayoutBreakpoint`, `LAYOUT_DRAWER_ROOT_STYLE`, `LAYOUT_DRAWER_SAFE_AREA_STYLE`, `LAYOUT_MODE_HIDDEN_MODULES`, `LAYOUT_MODULE_DEPENDENCIES`, `LAYOUT_MODULE_PARENT_REQUIREMENTS`, `LAYOUT_MODULE_VISIBILITY_KEYS`, `LAYOUT_SAFE_AREA_INSETS`, `LAYOUT_SHELL_SAFE_AREA_STYLE`, `LayoutModuleRestoreCache`, `LayoutModuleVisibilityChangeInput`, `LayoutModuleVisibilityChangeResult`, `LayoutModuleVisibilityKey`, `LayoutRuntimeDeviceFlags`, `LayoutRuntimeDeviceInput`, `LayoutRuntimeEffectiveModeInput`, `LayoutRuntimeInput`, `LayoutRuntimeSafeAreaInsets`, `LayoutRuntimeState`, `LayoutSidebarMode`, `LayoutVisibilitySetting`, `markAppBootstrapping`, `markAppReady`, `Orientation`, `resolveLayoutDeviceFlags`, `resolveLayoutEffectiveMode`, `resolveLayoutModuleVisibilityChange`, `resolveLayoutRuntime`, `resolveLayoutUseDrawer`, `setupVitePreloadErrorRecovery`, `SidebarAnimationPhase`, `SidebarState`, `ThemeRuntimeStorage`, `ThemeRuntimeStorageKeys`, `ThemeRuntimeTarget`, `VitePreloadErrorRecoveryOptions`, `waitForStablePaint`

## @ccd/vue-ui

- Path: `packages/vue-ui`
- Export subpaths: `.`, `./style.css`
- Root symbols: `AnimateWrapper`, `ArgsType`, `ButtonProps`, `CcdButton`, `CcdDrawer`, `CcdPanelMenu`, `CcdPopover`, `CcdSelect`, `CcdSelectButton`, `CcdTag`, `CcdTieredMenu`, `CcdToggleSwitch`, `ColumnRenderParams`, `ColumnSettingsState`, `configureProFormDraftStorage`, `CScrollbar`, `DEFAULT_BACK_TO_TOP_OFFSET_PX`, `DEFAULT_BACK_TO_TOP_THRESHOLD`, `DEFAULT_SCROLLBAR_AUTO_HIDE_DELAY_MS`, `DEFAULT_SCROLLBAR_MEMORY_THROTTLE_MS`, `defaultScrollbarProps`, `DialogOptions`, `DialogOptionsBase`, `DialogPosition`, `DraftStorage`, `EmptyState`, `EventType`, `FetchState`, `FieldArrayItem`, `FieldArrayReturn`, `FieldReaction`, `FieldRegistryItem`, `FieldSchema`, `FieldState`, `FilterState`, `FormContext`, `FormSchema`, `FormSchemaNode`, `FormState`, `HeightMode`, `Icons`, `PaginationConfig`, `PaginationState`, `PRIME_DIALOG_RUNTIME_CONFIG_KEY`, `PrimeDialog`, `PrimeDialogMessageContent`, `PrimeDialogRuntimeConfig`, `PRO_FORM_DATE_FORMATTER_KEY`, `PRO_TABLE_URL_SYNC_ADAPTER_KEY`, `ProForm`, `ProFormDateFormatter`, `ProFormDraftStorageAdapter`, `ProFormExpose`, `ProFormPlugin`, `ProFormPluginContext`, `ProFormPlugins`, `ProFormProps`, `ProTable`, `ProTableApiConfig`, `ProTableApiExecutor`, `ProTableApiExecutorContext`, `ProTableApiFn`, `ProTableApiMethod`, `ProTableApiQueryParams`, `ProTableColumn`, `ProTableCrudFormModalBody`, `ProTableCrudViewModalBody`, `ProTableExposed`, `ProTableLoadParams`, `ProTableProps`, `ProTableRequestResult`, `ProTableSearchParams`, `ProTableUrlSyncAdapter`, `ProTableUrlSyncOptions`, `ProTableValueEnum`, `ProTableValueEnumItem`, `ReactionAction`, `ReactionContext`, `registerBuiltinFields`, `RequestConfig`, `RequestFn`, `resetProFormDraftStorage`, `resolveScrollbarAutoHide`, `scrollbarMemoryProviderKey`, `SearchPathResolver`, `SelectionState`, `SelectOption`, `SortState`, `StandardTableParams`, `TableState`, `useDialogCore`, `useField`, `useFieldArray`, `UseFieldReturn`, `useForm`, `useFormContext`, `UseFormOptions`, `UseFormReturn`, `useProTable`, `UseProTableUrlSyncOptions`, `UseProTableUrlSyncReturn`, `ValidationResolver`, `ValidationResult`

## @ccd/vue-primevue-adapter

- Path: `packages/vue-primevue-adapter`
- Export subpaths: `.`
- Root symbols: `applyPrimeVueLocale`, `clearPrimeVueGlobalMessageApis`, `clearPrimeVueToastGroups`, `createCustomPreset`, `createPrimeVueAdapterConfig`, `CreatePrimeVueAdapterConfigOptions`, `createPrimeVueGlobalMessageApis`, `createPrimeVueMessageApi`, `createPrimeVueToastApi`, `DEFAULT_PRIMEVUE_TOAST_LIFE_MS`, `formControlsPt`, `installPrimeVueRuntime`, `installPrimeVueServices`, `menuPt`, `mountPrimeVueGlobalMessageApis`, `PRIMEVUE_TOAST_FALLBACK_ICON`, `PRIMEVUE_TOAST_GROUP_BY_POSITION`, `PRIMEVUE_TOAST_SEVERITY_ICONS`, `PrimeVueGlobalConfirmPopup`, `PrimeVueGlobalDynamicDialog`, `PrimeVueGlobalMessageApis`, `PrimeVueGlobalMessageTarget`, `PrimeVueGlobalToast`, `PrimeVueMenuItem`, `PrimeVueMessageApi`, `PrimeVuePopoverInstance`, `PrimeVueRuntimeConfig`, `PrimeVueRuntimeInstallOptions`, `PrimeVueServiceInstallOptions`, `PrimeVueSizeSource`, `PrimeVueTieredMenuInstance`, `PrimeVueToastApi`, `PrimeVueToastMessageOptions`, `PrimeVueToastPosition`, `PrimeVueToastServiceLike`, `PrimeVueToastSeverity`, `primeVueTooltipDirective`, `resolvePrimeVueLocale`, `usePrimeVueRuntimeConfig`, `usePrimeVueToastService`

## @ccd/vue-charts

- Path: `packages/vue-charts`
- Export subpaths: `.`
- Root symbols: `ChartThemeRuntimeState`, `UseEcharts`
