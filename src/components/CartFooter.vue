<script setup lang="ts">
defineProps<{
  subtotal: number
  saving: number
  totalItems: number
  totalProducts: number
  cartTotal: number
  disableEliminar?: boolean
  disableFinalizar?: boolean
}>()

defineEmits<{
  eliminar: []
  finalizar: []
}>()

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}
</script>

<template>
  <footer class="flex flex-col items-stretch gap-0 border-t border-neutral-200 bg-neutral-100 lg:flex-row">
    <button
      class="flex flex-col items-center w-64 justify-center gap-1 border-2 border-red-600 p-4 font-bold text-red-600 disabled:opacity-40"
      :disabled="disableEliminar"
      @click="$emit('eliminar')"
    >
      <UIcon
        name="i-lucide-shopping-cart-minus"
        class="size-8"
      />
      <span class="text-sm">Eliminar item</span>
    </button>
    <div class=" flex-1 flex-col items-center justify-center gap-4 p-4 grid grid-cols-4 sm:gap-10">
      <div class="text-lg text-center">
        <p class=" text-neutral-600">
          Subtotal
        </p>
        <p class="font-bold">
          {{ formatPrice(subtotal) }}
        </p>
      </div>
      <div class="text-lg text-center">
        <p class=" text-neutral-600">
          Ahorro
        </p>
        <p class="font-bold text-green-600">
          {{ formatPrice(saving) }}
        </p>
      </div>
      <div class="text-lg text-center">
        <p class=" text-neutral-600">
          Productos
        </p>
        <p class="font-bold">
          {{ totalProducts }}
        </p>
      </div>
      <!-- <div class="text-lg text-center">
        <p class=" text-neutral-600">
          Items
        </p>
        <p class="font-bold">
          {{ totalItems }}
        </p>
      </div> -->
      <div>
        <UButton
          to="/"
          label="Ver Carrito"
          class="w-full h-24 text-2xl text-center justify-center bg-black text-white hover:bg-gray-700"
        />
      </div>
    </div>
    <button
      class="flex flex-col w-72 items-center justify-center gap-1 bg-green-600 p-6 text-white disabled:opacity-40"
      :disabled="disableFinalizar"
      @click="$emit('finalizar')"
    >
      <span class="flex items-center gap-2 text-2xl font-bold">
        <UIcon
          name="i-lucide-shopping-cart"
          class="size-7"
        />
        {{ formatPrice(cartTotal) }}
      </span>
      <span>Finalizar compra</span>
    </button>
  </footer>
</template>
