<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NumberFlow from '@number-flow/vue'
import { useCartModals } from '../composables/useCartModals'
import { finalPrice, findProduct, products } from '../data/catalog'

interface GuideStep {
  instruction: string
  meters: number
  degrees: number
}

// Mocked in-store route: arrow + remaining meters per leg.
const steps: GuideStep[] = [
  { instruction: 'Camine derecho', meters: 9, degrees: 0 },
  { instruction: 'Gire a la derecha', meters: 6, degrees: 90 },
  { instruction: 'Siga derecho', meters: 4, degrees: 0 },
  { instruction: 'Fila de arriba, a su izquierda', meters: 2, degrees: -90 }
]

const route = useRoute()
const router = useRouter()
const { openGuidedScan, addModalOpen, justAddedId } = useCartModals()
const awaitingAdd = ref(false)

const target = computed(() => {
  const id = Number(route.query.id ?? 1)
  return findProduct(id) ?? products[0]
})

const meters = ref(5)
const arrived = ref(false)

// The arrow leg follows the remaining distance.
const stepIndex = computed(() => {
  if (meters.value > 6)
    return 0
  if (meters.value > 4)
    return 1
  if (meters.value > 2)
    return 2
  return 3
})

const current = computed<GuideStep>(() => steps[stepIndex.value] ?? steps[0]!)

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

// Countdown from 5 to 1 while the user walks; arrival ends it.
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => {
    if (meters.value > 1) {
      meters.value -= 1
      return
    }
    arrived.value = true
    window.clearInterval(timer)
  }, 1500)
})

onUnmounted(() => {
  window.clearInterval(timer)
})

function handleAdd(): void {
  window.clearInterval(timer)
  justAddedId.value = null
  awaitingAdd.value = true
  openGuidedScan(target.value)
}

// Cuando el modal confirma el agregado, redirigir a mi carrito.
// Solo navega si el agregado vino de este flujo (awaitingAdd) y el
// modal de agregar ya se cerró, así cancelar no redirige.
watch([addModalOpen, justAddedId], ([isOpen, addedId]) => {
  if (awaitingAdd.value && !isOpen && addedId !== null) {
    awaitingAdd.value = false
    router.push('/carrito')
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-neutral-200 p-6 text-black">
    <!-- Guide loop -->
    <section
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 text-center"
    >
      <p class="px-6 py-2 text-xl font-bold text-black">
        {{ target.name }} · {{ formatPrice(finalPrice(target)) }}
      </p>

      <div class="flex size-44 items-center justify-center rounded-full bg-green-500 text-white">
        <UIcon
          name="i-lucide-arrow-up"
          class="size-32 transition-transform duration-700 ease-in-out"
          :style="{ transform: `rotate(${current.degrees}deg)` }"
        />
      </div>
      <p class="text-3xl font-bold">
        {{ current.instruction }}
      </p>
      <p
        v-if="arrived"
        class="text-6xl font-bold text-green-600"
      >
        Llegaste
      </p>
      <p
        v-else
        class="flex items-baseline justify-center gap-2 text-6xl font-bold"
      >
        <NumberFlow :value="meters" />
        <span>m</span>
      </p>

      <div class="flex flex-col gap-4 sm:flex-row">
        <UButton
          size="xl"
          class="bg-black px-14 py-5 text-xl font-bold text-white"
          label="Cancelar"
          to="/buscar"
        />
        <UButton
          v-if="arrived"
          size="xl"
          color="success"
          class="px-14 py-5 text-xl font-bold"
          label="Escanear producto"
          icon="i-lucide-scan-line"
          @click="handleAdd"
        />
      </div>
    </section>

    <!-- Shared modals: scan -> add to cart -->
    <CartModals />
  </div>
</template>
