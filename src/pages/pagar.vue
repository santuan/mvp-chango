<script setup lang="ts">
import { computed, ref } from 'vue'
import confetti from 'canvas-confetti'
import { useCart } from '../composables/useCart'

const { cartTotal, clearCart } = useCart()

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
  | 'rating'

const step = ref<PayStep>('total')
const splitCount = ref<2 | 3 | 4 | null>(null)
const currentQr = ref(1)
const paidCount = ref(0)
const errorTitle = ref('No se registro el pago')
const rating = ref<number | null>(null)
const previousQrStep = ref<'qr-single' | 'qr-split'>('qr-single')

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

function splitAmount(count: 2 | 3 | 4): number {
  return Math.round(cartTotal.value / count)
}

const currentAmount = computed(() => {
  if ((step.value === 'qr-split' || step.value === 'generating' || step.value === 'verifying' || step.value === 'error') && splitCount.value)
    return splitAmount(splitCount.value)
  return cartTotal.value
})

const qrLabel = computed(() => {
  if (step.value === 'qr-split' && splitCount.value)
    return `Escanear QR ${currentQr.value} de ${splitCount.value}`
  return 'Escanear QR'
})

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
  splitCount.value = null
  step.value = 'split'
}

function startSplit(): void {
  if (!splitCount.value)
    return
  previousQrStep.value = 'qr-split'
  currentQr.value = 1
  paidCount.value = 0
  step.value = 'qr-split'
}

function simulateQrPaid(): void {
  paidCount.value += 1
  step.value = 'generating'
  window.setTimeout(() => {
    if (previousQrStep.value === 'qr-split' && splitCount.value && currentQr.value < splitCount.value) {
      currentQr.value += 1
      step.value = 'qr-split'
    }
    else {
      clearCart()
      step.value = 'success'
      window.setTimeout(() => {
        step.value = 'rating'
      }, 1600)
    }
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

function backToTotal(): void {
  step.value = 'total'
  splitCount.value = null
}

function backToModality(): void {
  step.value = 'modality'
}

function selectRating(n: number): void {
  rating.value = n
  confetti({
    particleCount: n >= 4 ? 150 : 80,
    spread: n >= 4 ? 100 : 70,
    origin: { y: 0.6 },
    disableForReducedMotion: true,
  })
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-neutral-200 p-6 text-black">
    <!-- Total -->
    <section
      v-if="step === 'total'"
      class="flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 text-center"
    >
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
     
      <div class="flex flex-col gap-4 pt-4 sm:flex-row">
        <UButton
          to="/"
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
    </section>

    <!-- Modality -->
    <section
      v-if="step === 'modality'"
      class="flex w-full max-w-5xl flex-1 flex-col justify-center gap-10"
    >
      <h1 class="text-center text-3xl font-bold">
        Seleccionar modalidad de pago
      </h1>
      <div class="flex flex-col gap-4 md:flex-row">
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          block
          class=" px-6 text-2xl flex-col flex flex-1 items-center justify-center  h-64 rounded-2xl font-bold w-64"
          @click="goSingleQr"
        >
          Pago con QR
        </UButton>
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          block
          class=" px-6 flex-col flex flex-1 items-center justify-center  h-64 rounded-2xl font-bold w-64"
          @click="goSplitSelect"
        >
          <span class="text-2xl">Pago dividido con QR</span>
          <span>Máximo 4 personas</span>
        </UButton>
      </div>
      <div>
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          block
          class="h-18 w-64 px-6 rounded-2xl font-bold"
          label="Volver atras"
          @click="backToTotal"
        />
      </div>
    </section>

    <!-- Split select -->
    <section
      v-if="step === 'split'"
      class="flex w-full max-w-5xl flex-1 flex-col justify-center gap-2"
    >
      <h1 class="text-center text-lg font-bold">
        Pago dividido. Máximo 4 personas.
      </h1>
      <h2 class="text-center text-3xl max-w-2xl my-6 mx-auto font-bold">
        Seleccione en cuando quiere dividir el pago y haga click en generar QR.
      </h2>
      <div class="flex flex-col gap-4 md:flex-row">
        <UButton
          v-for="n in ([2, 3, 4] as const)"
          :key="n"
          variant="outline"
          color="neutral"
          size="xl"
          block
          class=" px-6 flex-col flex flex-1 items-center justify-center  h-64 rounded-2xl font-bold w-64"
          :class="splitCount === n ? ' bg-green-500! text-green-900 ' : ''"
          @click="splitCount = n"
        >
          <span class="text-6xl">{{ n }}</span>
          <span>{{ formatPrice(splitAmount(n)) }}</span>
        </UButton>
      </div>
      <div class="flex flex-col gap-4 mt-6 sm:flex-row sm:justify-between">
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          block
          class="h-18 w-64 px-6 rounded-2xl font-bold"
          label="Volver atras"
          @click="backToModality"
        />
        <UButton
          :variant="splitCount ? 'solid' : 'solid'"
          :color="splitCount ? 'success' : 'neutral'"
          size="xl"
          block
          class="h-18 w-64 px-6 rounded-2xl font-bold"
          label="Generar QRs"
          :disabled="!splitCount"
          @click="startSplit"
        />
      </div>
    </section>

    <!-- QR single / split -->
    <section
      v-if="step === 'qr-single' || step === 'qr-split'"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 text-center"
    >
      <h1 class="text-3xl font-bold">
        {{ qrLabel }}
      </h1>
      <p class="text-3xl">
        {{ formatPrice(currentAmount) }}
      </p>
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
      <p class="text-sm text-neutral-600">
        Mock: acercá el lector o simulá el resultado
      </p>
      <UButton
        variant="outline"
        color="neutral"
        size="xl"
        block
        class="h-18 w-64 px-6 rounded-2xl font-bold"
        label="Cancelar"
        @click="backToModality"
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
      <p class="flex items-center gap-2 font-semibold">
        <UIcon
          name="i-lucide-loader-2"
          class="size-5 animate-spin"
        />
        Generando QR {{ previousQrStep === 'qr-split' && splitCount && paidCount < splitCount ? paidCount + 1 : '' }}...
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
        Generando comprobante
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
          label="Cancelar"
          @click="backToModality"
        />
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          block
          class="h-18 px-6 rounded-2xl font-bold w-64"
          label="Generar nuevo QR"
          @click="retryQr"
        />
      </div>
    </section>

    <!-- Rating -->
    <section
      v-if="step === 'rating'"
      class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 text-center"
    >
      <UIcon
        name="i-lucide-shopping-bag"
        class="size-20"
      />
      <h1 class="text-3xl font-bold">
        Gracias por su compra
      </h1>
      <p class="font-semibold">
        ¿Como calificarias esta experiencia de compra?
      </p>
      <div class="flex gap-3">
        <UButton
          v-for="n in 5"
          :key="n"
          class="size-12 text-center p-0 justify-center font-bold"
          :color="rating === n ?'success' : 'neutral'"
          :label="String(n)"
          @click="selectRating(n)"
        />
      </div>
      <UButton
        to="/"
        class="bg-black px-12 font-semibold text-white"
        label="Volver al inicio"
      />
    </section>
  </div>
</template>
