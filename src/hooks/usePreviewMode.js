import { useSyncExternalStore } from 'react'

import { previewStore } from '@/api/previewAdapter'

export function usePreviewMode() {
  return useSyncExternalStore(previewStore.subscribe, previewStore.getSnapshot)
}