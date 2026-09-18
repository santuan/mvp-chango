<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'

const props = defineProps<{
  /** Full amount that was charged. */
  total: number
  /** Split count (2-4) when the payment was split, `null` for a single payment. */
  parts: number | null
  /** Amount charged per part when the payment was split. */
  amountPerPart: number
  /** Per-person amounts for item-based splits. When present, takes precedence over amountPerPart. */
  amounts?: number[]
  /** Digits to prefill when the customer comes back to resend the ticket. */
  initialPhone?: string
}>()

const emit = defineEmits<{
  /** Carries the digits the ticket went to, or '' when the ticket was sent by mail. */
  finish: [phone: string]
}>()

const MAX_DIGITS = 10
const DEFAULT_AREA_DIGITS = '11'
const SENT_FEEDBACK_MS = 10

interface KeypadKey {
  id: string
  kind: 'digit' | 'plus' | 'backspace'
  label?: string
  ariaLabel: string
}

// Locked keypad order from the design: 1-9, then "+", "0" and backspace.
const KEYPAD_KEYS: KeypadKey[] = [
  ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => ({
    id: digit,
    kind: 'digit' as const,
    label: digit,
    ariaLabel: `Dígito ${digit}`,
  })),
  // The country code is fixed in the display, so "+" is part of the layout but inert.
  { id: 'plus', kind: 'plus', label: '+', ariaLabel: 'Signo más' },
  { id: 'zero', kind: 'digit', label: '0', ariaLabel: 'Dígito 0' },
  { id: 'backspace', kind: 'backspace', ariaLabel: 'Borrar último dígito' },
]

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

const digits = ref(((props.initialPhone ?? '') || DEFAULT_AREA_DIGITS).slice(0, MAX_DIGITS))
const sentTo = ref('')
const sent = ref(false)
const mode = ref<'phone' | 'mail'>('phone')
const email = ref('')
let sentTimeout: number | undefined

const toast = useToast()

const isComplete = computed(() => digits.value.length === MAX_DIGITS)

const displayPhone = computed(() => {
  const value = digits.value
  if (!value)
    return '+54 9'

  const area = value.slice(0, 2)
  const middle = value.slice(2, 6)
  const last = value.slice(6, 10)

  let formatted = `+54 9 ${area}`
  if (middle)
    formatted += ` ${middle}`
  if (last)
    formatted += `-${last}`
  return formatted
})

// const headerText = computed(() =>
//   sent.value
//     ? `Pago completado con éxito (${formatPrice(props.total)})`
//     : `Pago completado con éxito (${formatPrice(props.total)})`
// )

const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

const title = computed(() => {
  if (mode.value === 'mail')
    return 'Ingrese su mail para recibir el ticket'
  return 'Ingrese su teléfono para recibir el ticket por Whatsapp'
})

const subtitle = computed(() => {
    if (props.parts && props.amounts?.length)
    return `Recibirás el comprobante de ${formatPrice(props.total)}`
  if (props.parts)
    return `Recibirás el comprobante de ${formatPrice(props.total)}`
  return `Recibirás el comprobante de ${formatPrice(props.total)}.`
  // if (props.parts && props.amounts?.length)
  //   return `Recibirás el comprobante dividido (${props.amounts.map(a => formatPrice(a)).join(' + ')}) listo para reenviar.`
  // if (props.parts)
  //   return `Recibirás el comprobante con las ${props.parts} partes de ${formatPrice(props.amountPerPart)} listo para reenviar.`
  // return `Recibirás el comprobante de ${formatPrice(props.total)}.`
})

function pressKey(key: KeypadKey): void {
  if (sent.value || mode.value !== 'phone')
    return

  if (key.kind === 'backspace') {
    digits.value = digits.value.slice(0, -1)
    return
  }
  if (key.kind === 'plus')
    return
  if (digits.value.length < MAX_DIGITS)
    digits.value += key.label
}

function clearDigits(): void {
  if (sent.value || mode.value !== 'phone')
    return
  digits.value = DEFAULT_AREA_DIGITS
}

function goToMail(): void {
  if (sent.value)
    return
  mode.value = 'mail'
}

function backToPhone(): void {
  if (sent.value)
    return
  mode.value = 'phone'
}

function sendMail(): void {
  if (!isEmailValid.value || sent.value)
    return

  const address = email.value.trim()
  sentTo.value = address
  sent.value = true
  sentTimeout = window.setTimeout(() => emit('finish', ''), SENT_FEEDBACK_MS)
  toast.add({
    title: 'Ticket enviado',
    description: `El comprobante se envió por mail a ${sentTo.value}`,
    color: 'success',
    icon: 'i-lucide-check-circle-2',
    duration: 7200,
    progress: false
  })
}

function sendTicket(): void {
  if (!isComplete.value || sent.value)
    return

  const phone = digits.value
  sentTo.value = displayPhone.value
  sent.value = true
  sentTimeout = window.setTimeout(() => emit('finish', phone), SENT_FEEDBACK_MS)
  toast.add({
    title: 'Ticket enviado',
    description: `El comprobante se envió por whatsapp al número ${sentTo.value}`,
    color: 'success',
    icon: 'i-lucide-check-circle-2',
    duration: 7200,
    progress: false
  })
}

onBeforeUnmount(() => {
  window.clearTimeout(sentTimeout)
})
</script>

<template>
  <section class="flex w-full flex-1 flex-col justify-center gap-4 p-4">
    <!-- Confirmation pill -->
    <header class="flex justify-center pt-2">
      <div class="inline-flex items-center gap-2 rounded-full border border-[#D4D4D4] bg-white/70 px-5 py-2 ">
        <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3EB881]">
          <UIcon
            name="i-lucide-check"
            class="size-2 text-white"
          />
        </span>
        <p class="text-center text-base leading-6 text-[#404040]">
          Pago realizado
        </p>
      </div>
    </header>

    <!-- Phone entry -->
    <main class="flex w-full flex-col items-center justify-center">
      <div class="flex w-full max-w-[672px] flex-col items-center gap-2 pb-2 text-center">
        <h1 class="text-3xl leading-9 font-bold tracking-[-0.9px] text-[#171717] sm:text-2xl sm:leading-10">
          {{ title }}
        </h1>
        <p class="text-lg leading-7 text-[#525252]">
          {{ subtitle }}
        </p>
      </div>

      <div
        v-if="mode === 'phone'"
        class="mb-5 flex w-full max-w-[448px] items-center justify-between gap-4 rounded-2xl border border-[#D4D4D4]/80 bg-white px-6 py-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
      >
        <div class="flex min-w-0 items-center gap-3">
          <!-- <UIcon
            name="i-simple-icons-whatsapp"
            class="size-7 shrink-0 text-[#3EB881]"
          /> -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-7 shrink-0 text-[#3EB881]"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"
          /></svg>
          <p
            class="truncate text-2xl leading-8 font-bold tracking-[1.2px]"
            :class="digits ? 'text-gray-700' : 'text-gray-900'"
            aria-live="polite"
          >
            {{ displayPhone }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-md bg-black px-2.5 py-1.5 text-xs leading-4 font-bold text-white"
          aria-label="Borrar número ingresado"
          @click="clearDigits"
        >
          Limpiar
        </button>
      </div>

      <div
        v-if="mode === 'phone'"
        class="grid w-full max-w-[445px] grid-cols-3 grid-rows-[repeat(4,64px)] gap-3"
      >
        <button
          v-for="key in KEYPAD_KEYS"
          :key="key.id"
          type="button"
          class="flex items-center justify-center rounded-xl border transition-transform active:scale-[0.97]"
          :class="key.kind === 'digit'
            ? 'border-[#D4D4D4] bg-white'
            : 'border-[#D4D4D4]/80 bg-white/50'"
          :aria-label="key.ariaLabel"
          @click="pressKey(key)"
        >
          <UIcon
            v-if="key.kind === 'backspace'"
            name="i-lucide-delete"
            class="size-6 text-[#404040]"
          />
          <span
            v-else
            class="font-bold"
            :class="key.kind === 'digit'
              ? 'text-2xl leading-8 text-[#171717]'
              : 'text-xl leading-7 text-[#404040]'"
          >{{ key.label }}</span>
        </button>
      </div>

      <div
        v-else
        class="mb-5 flex w-full max-w-[448px] items-center gap-3 rounded-2xl border border-[#D4D4D4]/80 bg-white px-6 py-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
      >
        <UIcon
          name="i-lucide-mail"
          class="size-7 shrink-0 text-[#3EB881]"
        />
        <input
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="tu@mail.com"
          aria-label="Mail para recibir el ticket"
          class="min-w-0 flex-1 truncate bg-transparent text-xl leading-8 font-bold tracking-wide text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-400"
        >
      </div>
    </main>

    <!-- Footer actions -->
    <footer class="mx-auto flex w-full max-w-[704px] flex-col gap-3 px-2 pb-2 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
      <template v-if="mode === 'phone'">
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          class="h-18 w-72 justify-center rounded-2xl font-bold"
          type="button"
          @click="goToMail"
        >
          Enviar por mail
        </UButton>
        <UButton
          variant="solid"
          color="success"
          size="xl"
          class="h-18 w-72 justify-center rounded-2xl font-bold disabled:pointer-events-none disabled:opacity-50"
          type="button"
          :disabled="!isComplete || sent"
          @click="sendTicket"
        >
          Enviar ticket a Whatsapp
        </UButton>
      </template>
      <template v-else>
        <UButton
          variant="outline"
          color="neutral"
          size="xl"
          class="h-18 px-18 rounded-2xl font-bold"
          type="button"
          @click="backToPhone"
        >
          Volver
        </UButton>
        <UButton
          variant="solid"
          color="success"
          size="xl"
          class="h-18 px-18 rounded-2xl font-bold disabled:pointer-events-none disabled:opacity-50"
          type="button"
          :disabled="!isEmailValid || sent"
          @click="sendMail"
        >
          Enviar mail
        </UButton>
      </template>
    </footer>
  </section>
</template>
