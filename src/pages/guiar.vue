<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import NumberFlow from '@number-flow/vue'
import { useToast } from '@nuxt/ui/composables'
import { useCart } from '../composables/useCart'

interface GuideStep {
  instruction: string
  meters: number
  degrees: number
}

interface Product {
  id: number
  name: string
  categoryId: number
  price: number
  originalPrice: number
  discount?: number
}

// Mismo catálogue que buscar.vue
const allProducts: Product[] = [
  // Lácteos
  { id: 1, name: 'Leche entera 1L', categoryId: 1, price: 1200, originalPrice: 1200 },
  { id: 2, name: 'Leche descremada 1L', categoryId: 1, price: 1300, originalPrice: 1300 },
  { id: 3, name: 'Manteca 200g', categoryId: 1, price: 2400, originalPrice: 2400 },
  { id: 4, name: 'Queso cremoso 500g', categoryId: 1, price: 6800, originalPrice: 6800 },
  { id: 5, name: 'YogurNatural x4', categoryId: 1, price: 3200, originalPrice: 3200 },
  { id: 6, name: 'Queso rallado 250g', categoryId: 1, price: 4500, originalPrice: 4500 },
  // Panadería
  { id: 7, name: 'Pan lactal', categoryId: 2, price: 2800, originalPrice: 2800 },
  { id: 8, name: 'Pan francés x12', categoryId: 2, price: 2400, originalPrice: 2400 },
  { id: 9, name: 'Medialunas x6', categoryId: 2, price: 5200, originalPrice: 5200 },
  { id: 10, name: 'Facturas x6', categoryId: 2, price: 5800, originalPrice: 5800 },
  // Huevos
  { id: 11, name: 'Huevos x12', categoryId: 3, price: 2800, originalPrice: 3500, discount: 20 },
  { id: 12, name: 'Huevos x6', categoryId: 3, price: 1600, originalPrice: 1600 },
  { id: 13, name: 'Huevos blancos x12', categoryId: 3, price: 3000, originalPrice: 3000 },
  // Aceites y Vinagres
  { id: 14, name: 'Aceite de oliva 500ml', categoryId: 4, price: 8500, originalPrice: 8500 },
  { id: 15, name: 'Aceite de girasol 1L', categoryId: 4, price: 5200, originalPrice: 5200 },
  { id: 16, name: 'Vinagre de manzana 500ml', categoryId: 4, price: 3800, originalPrice: 3800 },
  { id: 17, name: 'Aceite de maíz 1L', categoryId: 4, price: 5600, originalPrice: 5600 },
  // Arroz y Legumbres
  { id: 18, name: 'Arroz 1kg', categoryId: 5, price: 1600, originalPrice: 1600 },
  { id: 19, name: 'Frijoles 500g', categoryId: 5, price: 2200, originalPrice: 2200 },
  { id: 20, name: 'Lentejas 500g', categoryId: 5, price: 2100, originalPrice: 2100 },
  { id: 21, name: 'Garbanzos 500g', categoryId: 5, price: 3400, originalPrice: 3400 },
  // Pastas
  { id: 22, name: 'Fideos 500g', categoryId: 6, price: 1400, originalPrice: 1400 },
  { id: 23, name: 'Spaghetti 500g', categoryId: 6, price: 1500, originalPrice: 1500 },
  { id: 24, name: 'Ñoquis 500g', categoryId: 6, price: 2800, originalPrice: 2800 },
  { id: 25, name: 'Ravioles 500g', categoryId: 6, price: 4200, originalPrice: 4200 },
  // Azúcar y Endulzantes
  { id: 26, name: 'Azúcar 1kg', categoryId: 7, price: 1800, originalPrice: 1800 },
  { id: 27, name: 'Endulzante x100', categoryId: 7, price: 1200, originalPrice: 1200 },
  { id: 28, name: 'Miel 500g', categoryId: 7, price: 12500, originalPrice: 12500 },
  // Yerba y Café
  { id: 29, name: 'Yerba mate 500g', categoryId: 8, price: 3360, originalPrice: 4200, discount: 20 },
  { id: 30, name: 'Café molido 250g', categoryId: 8, price: 7500, originalPrice: 7500 },
  { id: 31, name: 'Café instantáneo 100g', categoryId: 8, price: 8200, originalPrice: 8200 },
  { id: 32, name: 'Té negro x24', categoryId: 8, price: 2100, originalPrice: 2100 },
  // Gaseosas
  { id: 33, name: 'Gaseosa 2.25L', categoryId: 9, price: 3200, originalPrice: 3200 },
  { id: 34, name: 'Gaseosa 500ml', categoryId: 9, price: 1600, originalPrice: 1600 },
  { id: 35, name: 'Jugo en polvo x10', categoryId: 9, price: 1800, originalPrice: 1800 },
  { id: 36, name: 'Agua saborizada 500ml', categoryId: 9, price: 1400, originalPrice: 1400 },
  // Aguas
  { id: 37, name: 'Agua mineral 2L', categoryId: 10, price: 1100, originalPrice: 1100 },
  { id: 38, name: 'Agua mineral 500ml', categoryId: 10, price: 800, originalPrice: 800 },
  { id: 39, name: 'Agua saborizada 1L', categoryId: 10, price: 1900, originalPrice: 1900 },
  // Cervezas y Vinos
  { id: 40, name: 'Cerveza x6', categoryId: 11, price: 4640, originalPrice: 5800, discount: 20 },
  { id: 41, name: 'Cerveza artesanal x3', categoryId: 11, price: 4200, originalPrice: 4200 },
  { id: 42, name: 'Vino tinto 750ml', categoryId: 11, price: 6500, originalPrice: 6500 },
  { id: 43, name: 'Vino blanco 750ml', categoryId: 11, price: 5800, originalPrice: 5800 },
  // Limpieza
  { id: 44, name: 'Detergente 1L', categoryId: 12, price: 3800, originalPrice: 3800 },
  { id: 45, name: 'Lavandina 1L', categoryId: 12, price: 1200, originalPrice: 1200 },
  { id: 46, name: 'Jabón en polvo 800g', categoryId: 12, price: 4200, originalPrice: 4200 },
  { id: 47, name: 'Esponjas x3', categoryId: 12, price: 1500, originalPrice: 1500 },
  // Higiene Personal
  { id: 48, name: 'Jabón en barra', categoryId: 13, price: 900, originalPrice: 900 },
  { id: 49, name: 'Shampoo 400ml', categoryId: 13, price: 5200, originalPrice: 5200 },
  { id: 50, name: 'Pasta dental 90g', categoryId: 13, price: 3400, originalPrice: 3400 },
  { id: 51, name: 'Papel higiene x4', categoryId: 13, price: 4500, originalPrice: 4500 },
  // Carnes
  { id: 52, name: 'Bondiola 1kg', categoryId: 14, price: 9600, originalPrice: 12000, discount: 20 },
  { id: 53, name: 'Pechuga de pollo 1kg', categoryId: 14, price: 7200, originalPrice: 7200 },
  { id: 54, name: 'Carne picada 1kg', categoryId: 14, price: 8400, originalPrice: 8400 },
  { id: 55, name: 'Chorizo x6', categoryId: 14, price: 5600, originalPrice: 5600 },
  // Frutas y Verduras
  { id: 56, name: 'Banana 1kg', categoryId: 15, price: 1500, originalPrice: 1500 },
  { id: 57, name: 'Manzana 1kg', categoryId: 15, price: 2200, originalPrice: 2200 },
  { id: 58, name: 'Tomate 1kg', categoryId: 15, price: 1800, originalPrice: 1800 },
  { id: 59, name: 'Cebolla 1kg', categoryId: 15, price: 1200, originalPrice: 1200 },
  { id: 60, name: 'Papa 1kg', categoryId: 15, price: 1600, originalPrice: 1600 },
]

// Mocked in-store route: arrow + remaining meters per leg.
const steps: GuideStep[] = [
  { instruction: 'Camine derecho', meters: 9, degrees: 0 },
  { instruction: 'Gire a la derecha', meters: 6, degrees: 90 },
  { instruction: 'Siga derecho', meters: 4, degrees: 0 },
  { instruction: 'Fila de arriba, a su izquierda', meters: 2, degrees: -90 }
]

const route = useRoute()
const { products } = useCart()
const toast = useToast()

const target = computed(() => {
  const id = Number(route.query.id ?? 1)
  return allProducts.find(p => p.id === id) ?? allProducts[0]
})

const meters = ref(9)
const finished = ref(false)
const arrived = ref(false)
const confirming = ref(false)
const quantity = ref(1)

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

// Countdown from 9 to 1 while the user walks; arrival ends it.
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
    products.value.push({
      id: target.value.id,
      name: target.value.name,
      unitPrice: target.value.price,
      quantity: quantity.value,
      discountPercent: target.value.discount
    })
  toast.add({
    title: 'Producto agregado al carrito',
    description: `${target.value.name} · x${quantity.value}`,
    color: 'success',
    icon: 'i-lucide-shopping-cart'
  })
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
      <p class="px-6 py-2 text-xl font-bold text-black">
        {{ target.name }} · {{ formatPrice(target.price) }}
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
          label="Agregar al carrito"
          icon="i-lucide-check"
          @click="answerYes"
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
        {{ target.name }} · {{ formatPrice(target.price) }}
      </p>

      <div class="flex items-center gap-6">
        <UButton
          icon="i-lucide-minus"
          size="xl"
          color="neutral"
          variant="outline"
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
          @click="quantity++"
        />
      </div>

      <p class="text-2xl font-bold">
        Total: {{ formatPrice(target.price * quantity) }}
      </p>

      <div class="flex flex-col gap-4 sm:flex-row">
        <UButton
          size="xl"
          class="bg-black px-14 py-5 text-xl font-bold text-white"
          label="Cancelar"
          to="/buscar"
        />
        <UButton
          size="xl"
          color="success"
          class="px-14 py-5 text-xl font-bold"
          label="Confirmar"
          icon="i-lucide-check"
          @click="confirmAdd"
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
        {{ target.name }} · {{ formatPrice(target.price) }}
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
