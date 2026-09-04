<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import NumberFlow from '@number-flow/vue'
import { useCart } from '../composables/useCart'
import type { CartProduct } from '../composables/useCart'

interface GuideStep {
  instruction: string
  meters: number
  degrees: number
}

const catalog: CartProduct[] = [
  { id: 1, name: 'Producto 1', unitPrice: 30000, quantity: 0, discountPercent: 20 },
  { id: 2, name: 'Producto 2', unitPrice: 2000, quantity: 0 },
  { id: 4, name: 'Producto 4', unitPrice: 1200, quantity: 0 },
  { id: 5, name: 'Producto 5', unitPrice: 3500, quantity: 0 }
]

// Mocked in-store route: arrow + remaining meters per leg.
const steps: GuideStep[] = [
  { instruction: 'Camine derecho', meters: 13, degrees: 0 },
  { instruction: 'Gire a la derecha', meters: 10, degrees: 90 },
  { instruction: 'Siga derecho', meters: 5, degrees: 0 },
  { instruction: 'Fila de arriba, a su izquierda', meters: 2, degrees: -90 }
]

const route = useRoute()
const { products } = useCart()

const target = computed<CartProduct>(() => {
  const id = Number(route.query.id ?? 1)
  return catalog.find(p => p.id === id) ?? { id: 1, name: 'Producto 1', unitPrice: 30000, quantity: 0, discountPercent: 20 }
})

const meters = ref(13)
const finished = ref(false)
const arrived = ref(false)
const confirming = ref(false)
const quantity = ref(1)

// The arrow leg follows the remaining distance.
const stepIndex = computed(() => {
  if (meters.value > 10)
    return 0
  if (meters.value > 5)
    return 1
  if (meters.value > 2)
    return 2
  return 3
})

const current = computed<GuideStep>(() => steps[stepIndex.value] ?? steps[0]!)

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

// Countdown from 20 to 1 while the user walks; arrival ends it.
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

function answerYes(): void {
  window.clearInterval(timer)
  confirming.value = true
}

function confirmAdd(): void {
  const existing = products.value.find(p => p.id === target.value.id)
  if (existing)
    existing.quantity += quantity.value
  else
    products.value.push({ ...target.value, quantity: quantity.value })
  finished.value = true
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-neutral-200 p-6 text-black">
    <!-- Guide loop -->
    <section
      v-if="!finished && !confirming"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 text-center"
    >
      <p class="px-6 py-2 font-bold text-black">
        {{ target.name }} · {{ formatPrice(target.unitPrice) }}
      </p>

      <div class="flex size-64 items-center justify-center rounded-full bg-black text-white">
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

      <h1
        v-if="arrived"
        class="pt-4 text-2xl font-bold"
      >
        ¿Encontró el producto?
      </h1>
      <div class="flex flex-col gap-4 sm:flex-row">
        <UButton
          v-if="arrived"
          size="xl"
          color="success"
          class="px-14 py-5 text-xl font-bold"
          label="Sí, lo encontré"
          icon="i-lucide-check"
          @click="answerYes"
        />
        <UButton
          size="xl"
          class="bg-black px-14 py-5 text-xl font-bold text-white"
          label="Cancelar"
          to="/buscar"
        />
      </div>
    </section>

    <!-- Confirm add to cart -->
    <section
      v-else-if="confirming && !finished"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 text-center"
    >
      <UIcon
        name="i-lucide-shopping-cart"
        class="size-20 text-black"
      />
      <h1 class="text-3xl font-bold">
        Agregar al carrito
      </h1>
      <p class="text-xl font-semibold">
        {{ target.name }} · {{ formatPrice(target.unitPrice) }}
      </p>

      <div class="flex items-center gap-6">
        <UButton
          icon="i-lucide-minus"
          size="xl"
          color="neutral"
          variant="outline"
          class="size-14"
          :disabled="quantity <= 1"
          @click="quantity--"
        />
        <span class="w-16 text-center text-5xl font-bold">
          {{ quantity }}
        </span>
        <UButton
          icon="i-lucide-plus"
          size="xl"
          color="neutral"
          variant="outline"
          class="size-14"
          @click="quantity++"
        />
      </div>

      <p class="text-2xl font-bold">
        Total: {{ formatPrice(target.unitPrice * quantity) }}
      </p>

      <div class="flex flex-col gap-4 sm:flex-row">
        <UButton
          size="xl"
          color="success"
          class="px-14 py-5 text-xl font-bold"
          label="Confirmar"
          icon="i-lucide-check"
          @click="confirmAdd"
        />
        <UButton
          size="xl"
          class="bg-black px-14 py-5 text-xl font-bold text-white"
          label="Cancelar"
          to="/buscar"
        />
      </div>
    </section>

    <!-- End: added to cart -->
    <section
      v-else
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 text-center"
    >
      <UIcon
        name="i-lucide-check-circle-2"
        class="size-24 text-green-600"
      />
      <h1 class="text-3xl font-bold">
        Producto agregado al carrito
      </h1>
      <p class="font-semibold">
        {{ target.name }} · {{ formatPrice(target.unitPrice) }}
      </p>
      <div class="flex flex-col gap-4 sm:flex-row">
        <UButton
          to="/"
          size="xl"
          class="bg-black px-12 py-4 font-bold text-white"
          label="Ver Carrito"
        />
        <UButton
          to="/buscar"
          size="xl"
          color="neutral"
          variant="outline"
          class="px-12 py-4 font-bold"
          label="Seguir buscando"
        />
      </div>
    </section>
  </div>
</template>
