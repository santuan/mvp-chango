<script setup lang="ts">
  import { computed } from 'vue'
  import { useHead } from '@unhead/vue'
  import { useColorMode } from '@vueuse/core'
  const toaster = { position: 'top-center' as const }

  const colorMode = useColorMode()
  const themeColor = computed(() => colorMode.value === 'dark' ? '#18181b' : '#ffffff')

  useHead({
    meta: [
      { name: 'theme-color', content: themeColor }
    ]
  })
</script>

<template>
  <Suspense>
    <UApp :toaster="toaster">
      <UMain>
        <RouterView />
      </UMain>
    </UApp>
  </Suspense>
</template>
