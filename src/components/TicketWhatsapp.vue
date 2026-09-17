<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  /** Full amount that was charged. */
  total: number
  /** Split count (2-4) when the payment was split, `null` for a single payment. */
  parts: number | null
  /** Amount charged per part when the payment was split. */
  amountPerPart: number
  /** Digits to prefill when the customer comes back to resend the ticket. */
  initialPhone?: string
}>()

const emit = defineEmits<{
  /** Carries the digits the ticket went to, or '' when the ticket was skipped. */
  finish: [phone: string]
}>()

const MAX_DIGITS = 10
const SENT_FEEDBACK_MS = 1400

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

const digits = ref((props.initialPhone ?? '').slice(0, MAX_DIGITS))
const sentTo = ref('')
const sent = ref(false)
let sentTimeout: number | undefined

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

const headerText = computed(() =>
  sent.value
    ? `Ticket enviado a ${sentTo.value}`
    : `Pago completado con éxito (${formatPrice(props.total)})`
)

const title = computed(() =>
  props.parts
    ? 'Ingresa tu telefono para recibir el ticket dividido'
    : 'Ingresa tu telefono para recibir el ticket'
)

const subtitle = computed(() =>
  props.parts
    ? `Recibirás el comprobante con las ${props.parts} partes de ${formatPrice(props.amountPerPart)} listo para reenviar.`
    : `Recibirás el comprobante de ${formatPrice(props.total)} listo para reenviar.`
)

function pressKey(key: KeypadKey): void {
  if (sent.value)
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
  if (sent.value)
    return
  digits.value = ''
}

function skipTicket(): void {
  emit('finish', '')
}

function sendTicket(): void {
  if (!isComplete.value || sent.value)
    return

  const phone = digits.value
  sentTo.value = displayPhone.value
  sent.value = true
  sentTimeout = window.setTimeout(() => emit('finish', phone), SENT_FEEDBACK_MS)
}

onBeforeUnmount(() => {
  window.clearTimeout(sentTimeout)
})
</script>

<template>
  <section class="flex w-full flex-1 flex-col justify-between gap-8 p-8">
    <!-- Confirmation pill -->
    <header class="flex justify-center pt-2">
      <div class="inline-flex items-center gap-2 rounded-full border border-[#D4D4D4] bg-white/70 px-5 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.05)] backdrop-blur-[2px]">
        <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3EB881]">
          <UIcon
            name="i-lucide-check"
            class="size-2 text-white"
          />
        </span>
        <p class="text-center text-base leading-6 text-[#404040]">
          {{ headerText }}
        </p>
      </div>
    </header>

    <!-- Phone entry -->
    <main class="flex w-full flex-1 flex-col items-center justify-center">
      <div class="flex w-full max-w-[672px] flex-col items-center gap-2 pb-6 text-center">
        <h1 class="text-3xl leading-9 font-bold tracking-[-0.9px] text-[#171717] sm:text-2xl sm:leading-10">
          {{ title }}
        </h1>
        <p class="text-lg leading-7 text-[#525252]">
          {{ subtitle }}
        </p>
      </div>

      <div class="mb-5 flex w-full max-w-[448px] items-center justify-between gap-4 rounded-2xl border border-[#D4D4D4]/80 bg-white px-6 py-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div class="flex min-w-0 items-center gap-3">
          <UIcon
            name="i-simple-icons-whatsapp"
            class="size-7 shrink-0 text-[#3EB881]"
          />
          <p
            class="truncate text-2xl leading-8 font-bold tracking-[1.2px]"
            :class="digits ? 'text-[#171717]' : 'text-[#737373]'"
            aria-live="polite"
          >
            {{ displayPhone }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-md bg-[#F5F5F5] px-2.5 py-1.5 text-xs leading-4 font-bold text-[#737373]"
          aria-label="Borrar número ingresado"
          @click="clearDigits"
        >
          Limpiar
        </button>
      </div>

      <div class="grid w-full max-w-[384px] grid-cols-3 grid-rows-[repeat(4,64px)] gap-3">
        <button
          v-for="key in KEYPAD_KEYS"
          :key="key.id"
          type="button"
          class="flex items-center justify-center rounded-xl border transition-transform active:scale-[0.97]"
          :class="key.kind === 'digit'
            ? 'border-[#D4D4D4] bg-white'
            : 'border-[#D4D4D4]/80 bg-[#E5E5E5]/80'"
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
    </main>

    <!-- Footer actions -->
    <footer class="mx-auto flex w-full max-w-[704px] flex-col gap-3 px-2 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
      <button
        type="button"
        class="min-h-16 w-full rounded-2xl bg-[#16171A] px-10 py-5 text-lg leading-7 font-bold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:w-auto sm:min-w-[170px]"
        @click="skipTicket"
      >
        Omitir ticket
      </button>
      <div class="rounded-2xl border-2 border-[#2B82F6] p-1 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          class="w-full rounded-xl bg-[#3EB881] px-12 py-4 text-lg leading-7 font-bold text-[#171717] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          :disabled="!isComplete || sent"
          @click="sendTicket"
        >
          Enviar ticket
        </button>
      </div>
    </footer>
  </section>
</template>
