<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
// import confetti from 'canvas-confetti'
import { lineTotal, useCart } from '../composables/useCart'
import type { CartProduct } from '../composables/useCart'
import BankPromotionsCard from '../components/BankPromotionsCard.vue'
import TicketWhatsapp from '../components/TicketWhatsapp.vue'

const { products, subtotal, saving, cartTotal, clearCart } = useCart()
const router = useRouter()

const allCategories = [
  { id: 1, name: 'Lácteos' },
  { id: 2, name: 'Panadería' },
  { id: 3, name: 'Huevos' },
  { id: 4, name: 'Aceites y Vinagres' },
  { id: 5, name: 'Arroz y Legumbres' },
  { id: 6, name: 'Pastas' },
  { id: 7, name: 'Azúcar y Endulzantes' },
  { id: 8, name: 'Yerba y Café' },
  { id: 9, name: 'Gaseosas' },
  { id: 10, name: 'Aguas' },
  { id: 11, name: 'Cervezas y Vinos' },
  { id: 12, name: 'Limpieza' },
  { id: 13, name: 'Higiene Personal' },
  { id: 14, name: 'Carnes' },
  { id: 15, name: 'Frutas y Verduras' },
]

const catalogCategoryByName = new Map<string, number>([
  ['Leche entera 1L', 1],
  ['Leche descremada 1L', 1],
  ['Manteca 200g', 1],
  ['Queso cremoso 500g', 1],
  ['YogurNatural x4', 1],
  ['Queso rallado 250g', 1],
  ['Pan lactal', 2],
  ['Pan francés x12', 2],
  ['Medialunas x6', 2],
  ['Facturas x6', 2],
  ['Huevos x12', 3],
  ['Huevos x6', 3],
  ['Huevos blancos x12', 3],
  ['Aceite de oliva 500ml', 4],
  ['Aceite de girasol 1L', 4],
  ['Vinagre de manzana 500ml', 4],
  ['Aceite de maíz 1L', 4],
  ['Arroz 1kg', 5],
  ['Frijoles 500g', 5],
  ['Lentejas 500g', 5],
  ['Garbanzos 500g', 5],
  ['Fideos 500g', 6],
  ['Spaghetti 500g', 6],
  ['Ñoquis 500g', 6],
  ['Ravioles 500g', 6],
  ['Azúcar 1kg', 7],
  ['Endulzante x100', 7],
  ['Miel 500g', 7],
  ['Yerba mate 500g', 8],
  ['Café molido 250g', 8],
  ['Café instantáneo 100g', 8],
  ['Té negro x24', 8],
  ['Gaseosa 2.25L', 9],
  ['Gaseosa 500ml', 9],
  ['Jugo en polvo x10', 9],
  ['Agua saborizada 500ml', 9],
  ['Agua mineral 2L', 10],
  ['Agua mineral 500ml', 10],
  ['Agua saborizada 1L', 10],
  ['Cerveza x6', 11],
  ['Cerveza artesanal x3', 11],
  ['Vino tinto 750ml', 11],
  ['Vino blanco 750ml', 11],
  ['Detergente 1L', 12],
  ['Lavandina 1L', 12],
  ['Jabón en polvo 800g', 12],
  ['Esponjas x3', 12],
  ['Jabón en barra', 13],
  ['Shampoo 400ml', 13],
  ['Pasta dental 90g', 13],
  ['Papel higiene x4', 13],
  ['Bondiola 1kg', 14],
  ['Pechuga de pollo 1kg', 14],
  ['Carne picada 1kg', 14],
  ['Chorizo x6', 14],
  ['Banana 1kg', 15],
  ['Manzana 1kg', 15],
  ['Tomate 1kg', 15],
  ['Cebolla 1kg', 15],
  ['Papa 1kg', 15],
])

interface CartGroup {
  categoryId: number
  categoryName: string
  items: CartProduct[]
}

const groupedCart = computed<CartGroup[]>(() => {
  const buckets = new Map<number, CartProduct[]>()
  for (const p of products.value) {
    const catId = catalogCategoryByName.get(p.name) ?? 0
    const list = buckets.get(catId) ?? []
    list.push(p)
    buckets.set(catId, list)
  }
  const groups: CartGroup[] = []
  for (const cat of allCategories) {
    const items = buckets.get(cat.id)
    if (items?.length)
      groups.push({ categoryId: cat.id, categoryName: cat.name, items })
  }
  const others = buckets.get(0)
  if (others?.length)
    groups.push({ categoryId: 0, categoryName: 'Otros', items: others })
  return groups
})

type PayStep =
  | 'total'
  | 'modality'
  | 'split'
  | 'qr-single'
  | 'qr-split'
  | 'generating'
  | 'verifying'
  | 'success'
  | 'error'
  | 'receipt'
  | 'thanks'

const step = ref<PayStep>('modality')
const splitCount = ref<2 | 3 | 4 | null>(null)
const splitCartA = ref<CartProduct[]>([])
const splitCartB = ref<CartProduct[]>([])
const currentQr = ref(1)
const paidCount = ref(0)
const errorTitle = ref('No se registro el pago')
// const rating = ref<number | null>(null)
const previousQrStep = ref<'qr-single' | 'qr-split'>('qr-single')

// The cart is cleared before the receipt screen renders, so the charged amounts
// must be snapshotted while the cart still holds the products.
const receiptTotal = ref(0)
const receiptParts = ref<2 | 3 | 4 | null>(null)
const receiptAmountPerPart = ref(0)
const receiptAmounts = ref<number[]>([])

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

function splitAmount(count: 2 | 3 | 4): number {
  return Math.round(cartTotal.value / count)
}

function splitListTotal(list: CartProduct[]): number {
  return list.reduce((acc, p) => acc + lineTotal(p), 0)
}

const splitTotalA = computed(() => splitListTotal(splitCartA.value))
const splitTotalB = computed(() => splitListTotal(splitCartB.value))
const splitAmounts = computed(() => [splitTotalA.value, splitTotalB.value])
const canStartSplit = computed(() => splitTotalA.value > 0 && splitTotalB.value > 0)

function initSplitCarts(): void {
  splitCartA.value = products.value.map(p => ({ ...p }))
  splitCartB.value = []
  splitCount.value = 2
}

function moveUnit(productId: number, from: 'A' | 'B'): void {
  const src = from === 'A' ? splitCartA.value : splitCartB.value
  const dst = from === 'A' ? splitCartB.value : splitCartA.value
  const idx = src.findIndex(p => p.id === productId)
  if (idx === -1)
    return
  const item = src[idx]!
  const existing = dst.find(p => p.id === productId)
  if (item.quantity > 1) {
    item.quantity -= 1
    if (existing)
      existing.quantity += 1
    else
      dst.push({ ...item, quantity: 1 })
  }
  else {
    src.splice(idx, 1)
    if (existing)
      existing.quantity += 1
    else
      dst.push({ ...item })
  }
}

function moveAll(from: 'A' | 'B'): void {
  const src = from === 'A' ? splitCartA.value : splitCartB.value
  const dst = from === 'A' ? splitCartB.value : splitCartA.value
  for (const item of src) {
    const existing = dst.find(p => p.id === item.id)
    if (existing)
      existing.quantity += item.quantity
    else
      dst.push({ ...item })
  }
  src.splice(0, src.length)
}

function snapshotReceipt(isSingle: boolean): void {
  const total = cartTotal.value
  if (isSingle) {
    receiptTotal.value = total
    receiptParts.value = null
    receiptAmountPerPart.value = total
    receiptAmounts.value = []
    return
  }
  // Item-based split for 2 people: each side pays its own cart total.
  const totalA = splitTotalA.value
  const totalB = splitTotalB.value
  const hasAssignment = splitCartA.value.length > 0 || splitCartB.value.length > 0
  receiptTotal.value = total
  receiptParts.value = 2
  if (hasAssignment && totalA + totalB > 0) {
    receiptAmounts.value = [totalA, totalB]
    receiptAmountPerPart.value = Math.round((totalA + totalB) / 2)
  }
  else {
    const parts = splitCount.value ?? 2
    receiptAmounts.value = []
    receiptAmountPerPart.value = splitAmount(parts)
  }
}

// Seconds the thank-you screen stays up before the terminal resets itself for
// the next customer.
const RESTART_SECONDS = 60
const restartSeconds = ref(RESTART_SECONDS)
let restartInterval: number | undefined

// Kept so "Reenviar ticket" can come back with the number already typed.
const lastTicketPhone = ref('')

function stopRestartCountdown(): void {
  window.clearInterval(restartInterval)
  restartInterval = undefined
}

function startRestartCountdown(): void {
  stopRestartCountdown()
  restartSeconds.value = RESTART_SECONDS
  restartInterval = window.setInterval(() => {
    restartSeconds.value -= 1
    if (restartSeconds.value <= 0) {
      stopRestartCountdown()
      router.push('/')
    }
  }, 1000)
}

function finishPurchase(phone: string): void {
  lastTicketPhone.value = phone
  step.value = 'thanks'
  startRestartCountdown()
}

// Going back stops the countdown: the customer is interacting again, so the
// terminal must not yank the screen away mid-flight. Coming back to the
// thank-you screen starts a fresh full countdown.
function resendTicket(): void {
  stopRestartCountdown()
  step.value = 'receipt'
}

onBeforeUnmount(stopRestartCountdown)

const currentAmount = computed(() => {
  if ((step.value === 'qr-split' || step.value === 'generating' || step.value === 'verifying' || step.value === 'error') && splitCount.value) {
    // Item-based split: each QR charges its own cart. Fallback to equal split
    // when there is no assignment (e.g. legacy state).
    if (splitAmounts.value.length === 2 && (splitCartA.value.length > 0 || splitCartB.value.length > 0))
      return splitAmounts.value[currentQr.value - 1] ?? cartTotal.value
    return splitAmount(splitCount.value)
  }
  return cartTotal.value
})

// const qrLabel = computed(() => {
//   if (step.value === 'qr-split' && splitCount.value)
//     return `Escanear QR ${currentQr.value} de ${splitCount.value} o pagar con NFC / débito / crédito`
//   return 'Escanear QR o pagar con NFC / débito / crédito'
// })

function goModality(): void {
  step.value = 'modality'
}

function goSingleQr(): void {
  previousQrStep.value = 'qr-single'
  currentQr.value = 1
  paidCount.value = 0
  step.value = 'qr-single'
}

function goSplitSelect(): void {
  initSplitCarts()
  step.value = 'split'
}

function startSplit(): void {
  if (!canStartSplit.value)
    return
  splitCount.value = 2
  previousQrStep.value = 'qr-split'
  currentQr.value = 1
  paidCount.value = 0
  step.value = 'qr-split'
}

function simulateQrPaid(): void {
  step.value = 'verifying'
  window.setTimeout(() => {
    paidCount.value += 1
    const isSingle = previousQrStep.value === 'qr-single'
    if (isSingle) {
      snapshotReceipt(true)
      clearCart()
      step.value = 'success'
      window.setTimeout(() => {
        step.value = 'receipt'
      }, 1600)
      return
    }
    step.value = 'generating'
    window.setTimeout(() => {
      if (previousQrStep.value === 'qr-split' && splitCount.value && currentQr.value < splitCount.value) {
        currentQr.value += 1
        step.value = 'qr-split'
      }
      else {
        snapshotReceipt(false)
        clearCart()
        step.value = 'success'
        window.setTimeout(() => {
          step.value = 'receipt'
        }, 1600)
      }
    }, 1400)
  }, 1400)
}

function simulateQrError(single: boolean): void {
  errorTitle.value = single ? 'No se registro el pago' : `QR ${currentQr.value} NO SE REGISTRO`
  step.value = 'verifying'
  window.setTimeout(() => {
    step.value = 'error'
  }, 1400)
}

function retryQr(): void {
  step.value = previousQrStep.value
}

// function backToTotal(): void {
//   step.value = 'total'
//   splitCount.value = null
//   splitCartA.value = []
//   splitCartB.value = []
// }

function backToModality(): void {
  step.value = 'modality'
}

// function selectRating(n: number): void {
//   rating.value = n
//   confetti({
//     particleCount: n >= 4 ? 150 : 80,
//     spread: n >= 4 ? 100 : 70,
//     origin: { y: 0.6 },
//     disableForReducedMotion: true,
//   })
// }

</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center text-black"
    :class="step === 'receipt' ? 'bg-[#E2E4E8]' : 'bg-neutral-200 p-6'"
  >
    <!-- Total -->
    <section
      v-if="step === 'total'"
      class="flex w-full max-w-6xl flex-1 flex-col justify-center gap-6"
    >
      <div class="grid items-center gap-20 md:grid-cols-2 ">
        <div class="overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left">
          <p class="border-b border-neutral-200 px-4 py-3 text-lg font-bold">
            Detalle de la compra ({{ products.length }})
          </p>
          <div class="max-h-120 overflow-y-auto">
            <template
              v-for="group in groupedCart"
              :key="group.categoryId"
            >
              <p class="bg-neutral-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-neutral-600">
                {{ group.categoryName }} ({{ group.items.length }})
              </p>
              <div
                v-for="product in group.items"
                :key="product.id"
                class="flex items-center gap-3 border-b border-neutral-100 p-3 last:border-b-0"
              >
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-200">
                  <UIcon
                    name="i-lucide-shopping-bag"
                    class="size-5 text-neutral-500"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-base font-bold">
                    {{ product.name }}
                  </p>
                  <p class="text-sm text-neutral-500">
                    {{ formatPrice(product.unitPrice) }} c/u · x{{ product.quantity }}
                  </p>
                  <p
                    v-if="product.discountPercent"
                    class="text-xs font-semibold text-green-600"
                  >
                    Descuento {{ product.discountPercent }}% aplicado
                  </p>
                </div>
                <span
                  class="shrink-0 text-base font-bold"
                  :class="product.discountPercent ? 'text-green-600' : ''"
                >{{ formatPrice(lineTotal(product)) }}</span>
              </div>
            </template>
            <p
              v-if="products.length === 0"
              class="p-6 text-center text-sm text-neutral-500"
            >
              No hay productos en el carrito
            </p>
          </div>
          <div class="flex items-center justify-between bg-neutral-50 px-4 py-3 text-sm font-semibold">
            <span>Subtotal: {{ formatPrice(subtotal) }}</span>
            <span class="text-green-600">Ahorro: {{ formatPrice(saving) }}</span>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center gap-4 text-center">
          <p class="text-xl font-bold">
            Total a pagar
          </p>
          <p class="text-7xl font-bold text-green-600">
            {{ formatPrice(cartTotal) }}
          </p>
          <p>Con descuentos aplicados</p>
          <p
            v-if="cartTotal === 0"
            class="font-semibold text-red-600"
          >
            El carrito está vacío, escaneá un producto para continuar
          </p>
          <div class="flex flex-col gap-4 pt-4 sm:flex-row md:flex-col lg:flex-row">
            <UButton
              to="/carrito"
              variant="outline"
              color="neutral"
              size="xl"
              block
              class="h-18 px-6 rounded-2xl font-bold w-64"
              label="Volver atras"
            />
            <UButton
              color="success"
              size="xl"
              block
              class="h-18 px-6 rounded-2xl font-bold w-64"
              label="Pagar"
              :disabled="cartTotal === 0"
              @click="goModality"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Modality -->
    <section
      v-if="step === 'modality'"
      class="flex w-full max-w-5xl flex-1 flex-col justify-center gap-10"
    >
      <h1 class="text-center text-3xl font-bold">
        Seleccionar como desea pagar
      </h1>

      <div class="grid items-start gap-8 md:grid-cols-[minmax(0,480px)_1fr]">
        <!-- Left: bank promotions of the day -->
        <BankPromotionsCard />

        <!-- Right: compact modality actions -->
        <div class="flex w-full max-w-xl flex-col gap-4 justify-self-end">
          <p class="text-xl font-bold">
            Total a pagar
          </p>
          <p class="text-7xl font-bold text-green-600">
            {{ formatPrice(cartTotal) }}
          </p>
          <p>Los descuentos se aplicarán luego del pago por su entidad bancaria</p>
          <UButton
            variant="outline"
            color="neutral"
            size="xl"
            block
            class="h-20 w-full rounded-2xl text-xl font-bold"
            @click="goSingleQr"
          >
            Pago individual
          </UButton>
          <UButton
            variant="solid"
            color="neutral"
            size="xl"
            block
            class="h-20 w-full flex-col rounded-2xl font-bold border-4"
            @click="goSplitSelect"
          >
            <span class="text-xl">Pago dividido (2 personas)</span>
          </UButton>
        </div>
      </div>
      <UButton
        variant="outline"
        color="neutral"
        size="xl"
        block
        class="h-18 w-64 rounded-2xl font-bold"
        label="Volver atras"
        to="/carrito"
      />
    </section>

    <!-- Split select: 2 people, 2 carts -->
    <section
      v-if="step === 'split'"
      class="flex w-full max-w-6xl flex-1 flex-col justify-center gap-2"
    >
      <h1 class="text-center text-lg font-bold">
        Pago dividido · 2 personas
      </h1>
      <h2 class="mx-auto mt-2 max-w-2xl text-center text-2xl font-bold">
        Pasá items de un lado al otro y después comenzá a pagar.
      </h2>
      <p
        
        class="text-center text-sm font-semibold text-red-600 h-9"
      >
        <span v-if="!canStartSplit">Cada persona tiene que tener al menos un item.</span>
      </p>
      <div class="grid items-start gap-4 md:grid-cols-2">
        <!-- Cart A -->
        <div class="overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left">
          <div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <p class="text-lg font-bold">
              Persona 1 ({{ splitCartA.length }})
            </p>
            <p class="text-lg font-bold text-green-600">
              {{ formatPrice(splitTotalA) }}
            </p>
          </div>
          <div class="max-h-72 min-h-72 overflow-y-auto">
            <div
              v-for="product in splitCartA"
              :key="product.id"
              class="flex items-center gap-3 border-b border-neutral-100 p-3 last:border-b-0"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-bold">
                  {{ product.name }}
                </p>
                <p class="text-sm text-neutral-500">
                  {{ formatPrice(product.unitPrice) }} c/u · x{{ product.quantity }} · {{ formatPrice(lineTotal(product)) }}
                </p>
              </div>
              <UButton
                color="neutral"
                variant="outline"
                size="md"
                class="shrink-0 rounded-xl font-bold"
                label="Pasar →"
                @click="moveUnit(product.id, 'A')"
              />
            </div>
            <p
              v-if="splitCartA.length === 0"
              class="p-6 text-center text-sm text-neutral-500"
            >
              Sin items — pasá algo desde el otro lado
            </p>
          </div>
          <!-- <div class="flex items-center justify-between bg-neutral-50 px-4 py-3">
            <span class="text-sm font-semibold">Total Persona 1</span>
            <span class="font-bold text-green-600">{{ formatPrice(splitTotalA) }}</span>
          </div> -->
        </div>
        <!-- Cart B -->
        <div class="overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left">
          <div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <p class="text-lg font-bold">
              Persona 2 ({{ splitCartB.length }})
            </p>
            <p class="text-lg font-bold text-green-600">
              {{ formatPrice(splitTotalB) }}
            </p>
          </div>
          <div class="max-h-72 min-h-72 overflow-y-auto">
            <div
              v-for="product in splitCartB"
              :key="product.id"
              class="flex items-center gap-3 border-b border-neutral-100 p-3 last:border-b-0"
            >
              <UButton
                color="neutral"
                variant="outline"
                size="md"
                class="shrink-0 rounded-xl font-bold"
                label="← Pasar"
                @click="moveUnit(product.id, 'B')"
              />
              <div class="min-w-0 flex-1 text-right">
                <p class="truncate text-base font-bold">
                  {{ product.name }}
                </p>
                <p class="text-sm text-neutral-500">
                  {{ formatPrice(product.unitPrice) }} c/u · x{{ product.quantity }} · {{ formatPrice(lineTotal(product)) }}
                </p>
              </div>
            </div>
            <p
              v-if="splitCartB.length === 0"
              class="p-6 text-center text-sm text-neutral-500"
            >
              Sin items — pasá algo desde el otro lado
            </p>
          </div>
          <!-- <div class="flex items-center justify-between bg-neutral-50 px-4 py-3">
            <span class="text-sm font-semibold">Total Persona 2</span>
            <span class="font-bold text-green-600">{{ formatPrice(splitTotalB) }}</span>
          </div> -->
        </div>
      </div>
      <div class="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <div class="flex justify-center items-center w-full gap-6">
          <UButton
            variant="outline"
            color="neutral"
            size="md"
            class="rounded-xl font-bold"
            label="← Pasar todo"
            :disabled="splitCartB.length === 0"
            @click="moveAll('B')"
          />
           <UButton
            variant="outline"
            color="neutral"
            size="md"
            class="rounded-xl font-bold"
            label="Pasar todo →"
            :disabled="splitCartA.length === 0"
            @click="moveAll('A')"
          />
        </div>
      </div>
      
      <div class="mt-2 flex flex-col gap-4 sm:flex-row sm:justify-between items-center">
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          block
          class="h-18 w-64 px-6 rounded-2xl font-bold"
          label="Volver atras"
          @click="backToModality"
        />
        <p class="text-2xl font-semibold text-emerald-600">
          Total a pagar: {{ formatPrice(cartTotal) }}
          <!-- · Persona 1: {{ formatPrice(splitTotalA) }} · Persona 2: {{ formatPrice(splitTotalB) }} -->
        </p>
        <UButton
          :color="canStartSplit ? 'success' : 'neutral'"
          size="xl"
          block
          class="h-18 w-64 px-6 rounded-2xl font-bold"
          label="Comenzar a pagar"
          :disabled="!canStartSplit"
          @click="startSplit"
        />
      </div>
    </section>

    <!-- QR single / split -->
    <section
      v-if="step === 'qr-single' || step === 'qr-split'"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 text-center"
    >
      <p class="text-3xl">
        {{ step === 'qr-split' ? `Persona ${currentQr} va a pagar ${formatPrice(currentAmount)}` : `Vas a pagar ${formatPrice(currentAmount)}` }}
      </p>
      <p
        v-if="step === 'qr-split'"
        class="text-sm font-semibold text-neutral-600"
      >
        Persona 1: {{ formatPrice(splitTotalA) }} · Persona 2: {{ formatPrice(splitTotalB) }}
      </p>
      <!-- <h1 class="text-3xl font-bold">
        {{ qrLabel }}
      </h1> -->
      <div
        v-if="step === 'qr-split' && splitCount"
        class="flex gap-2"
      >
        <span
          v-for="i in splitCount"
          :key="i"
          class="h-3 w-10"
          :class="i < currentQr || (i === currentQr && paidCount >= i) ? 'bg-green-600' : i === currentQr ? 'bg-black' : 'bg-neutral-400'"
        />
      </div>
      
      <div class="flex flex-col h-80 w-80 items-center justify-center bg-neutral-100">
        <UIcon
          name="i-lucide-qr-code"
          class="size-44 text-neutral-500"
        />
        <div class="grid grid-cols-2 gap-1">
          <UButton
            color="success"
            label="Simular pago"
            block
            @click="simulateQrPaid"
          />
          <UButton
            color="error"
            label="Simular error"
            block
            @click="simulateQrError(step === 'qr-single')"
          />
        </div>
      </div>
      <!-- <p class="text-sm text-neutral-600">
        Mock: acercá el lector o simulá el resultado
      </p> -->
      <!-- The terminal takes QR and contactless, so both instructions stay visible. -->
      <div class="flex w-full items-center gap-3 max-w-md rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-left">
        <UIcon
          name="i-lucide-nfc"
          class="size-8 shrink-0 text-neutral-700"
        />
        <p class="text-base font-semibold text-neutral-800">
          Acercá tu tarjeta de débito/crédito o tu celular para pagar por NFC
        </p>
      </div>

      <UButton
        v-if="step === 'qr-single' || (step === 'qr-split' && paidCount === 0 && currentQr === 1)"
        variant="outline"
        color="neutral"
        size="xl"
        block
        class="h-18 w-64 px-6 rounded-2xl font-bold"
        label="Cancelar"
        @click="step === 'qr-single' ? backToModality() : goSplitSelect()"
      />
      

      <!-- <UButton
        color="neutral"
        variant="ghost"
        label="Volver atras"
        @click="step === 'qr-single' ? backToModality() : goSplitSelect()"
      /> -->
    </section>

    <!-- Generating / paid -->
    <section
      v-if="step === 'generating'"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 text-center"
    >
      <UIcon
        name="i-lucide-check-circle-2"
        class="size-24 text-green-600"
      />
      <h1
        v-if="previousQrStep === 'qr-split' && splitCount"
        class="text-2xl font-bold"
      >
        QR {{ paidCount }} de {{ splitCount }} Pagado
      </h1>
      <h1
        v-else
        class="text-2xl font-bold"
      >
        Pago registrado
      </h1>
      <p
        v-if="previousQrStep === 'qr-split' && splitCount && paidCount < splitCount"
        class="flex items-center gap-2 font-semibold"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-5 animate-spin"
        />
        Generando QR {{ paidCount + 1 }}...
      </p>
    </section>

    <!-- Verifying / processing payment -->
    <section
      v-if="step === 'verifying'"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 text-center"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-24 animate-spin text-neutral-500"
      />
      <h1 class="text-2xl font-bold">
        Procesando pago...
      </h1>
    </section>

    <!-- Success -->
    <section
      v-if="step === 'success'"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 text-center"
    >
      <UIcon
        name="i-lucide-check-circle-2"
        class="size-24 text-green-600"
      />
      <h1 class="text-3xl font-bold">
        Compra finalizada con éxito
      </h1>
      <p class="flex items-center gap-2 font-semibold">
        <UIcon
          name="i-lucide-loader-2"
          class="size-5 animate-spin"
        />
        <!-- Generando comprobante -->
      </p>
    </section>

    <!-- Error -->
    <section
      v-if="step === 'error'"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 text-center"
    >
      <UIcon
        name="i-lucide-triangle-alert"
        class="size-24 text-red-600"
      />
      <h1 class="text-2xl font-bold">
        {{ errorTitle }}
      </h1>
      <div class="flex flex-col gap-3 sm:flex-row">
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          block
          class="h-18 px-6 rounded-2xl font-bold w-64"
          label="Generar nuevo QR"
          @click="retryQr"
        />
        <UButton
          v-if="previousQrStep === 'qr-split' && paidCount === 0 && currentQr === 1"
          variant="outline"
          color="neutral"
          size="xl"
          block
          class="h-18 px-6 rounded-2xl font-bold w-64"
          label="Cancelar"
          @click="goSplitSelect"
        />
      </div>
    </section>

    <!-- Thank you / self restart for the next customer -->
    <section
      v-if="step === 'thanks'"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 text-center"
    >
      <UIcon
        name="i-lucide-check-circle-2"
        class="size-24 text-green-600"
      />
      <div class="flex flex-col gap-2">
        <h1 class="text-4xl font-bold">
          ¡Gracias por tu compra!
        </h1>
        <p class="text-lg text-neutral-600">
          Te esperamos la próxima.
        </p>
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          block
          class="h-18 w-64 mx-auto rounded-2xl font-bold"
          label="Reenviar ticket"
          @click="resendTicket"
        />
      </div>
      <div class="flex items-center gap-4 rounded-2xl border border-neutral-300 bg-white px-6 py-4">
        <span class="text-4xl font-bold tabular-nums">{{ restartSeconds }}</span>
        <p class="max-w-56 text-left text-sm font-semibold text-neutral-700">
          El chango se va a reiniciar automáticamente
        </p>
        <UButton
          class="bg-black px-8 font-bold text-white"
          label="Cerrar sesión"
          to="/"
        />
      </div>
    </section>

    <!-- Ticket delivery -->
    <TicketWhatsapp
      v-if="step === 'receipt'"
      :total="receiptTotal"
      :parts="receiptParts"
      :amount-per-part="receiptAmountPerPart"
      :amounts="receiptAmounts"
      :initial-phone="lastTicketPhone"
      @finish="finishPurchase"
    />
  </div>
</template>
