<script setup lang="ts">
import { useCartModals } from '../composables/useCartModals';

  defineProps<{
    subtotal: number
    saving: number
    totalItems: number
    totalProducts: number
    cartTotal: number
    disableEliminar?: boolean
    disableFinalizar?: boolean
  }>()

  const { openScan } = useCartModals()


  defineEmits<{
    eliminar: []
    finalizar: []
  }>()

  function formatPrice(value: number): string {
    return `$${value.toLocaleString('es-AR')}`
  }
</script>

<template>
  <footer class="flex flex-col items-stretch min-h-32 gap-0 border-t border-neutral-200 bg-neutral-100 lg:flex-row">
    <div class="shrink-0 flex justify-center items-center  p-3 w-64">
      <button
        class="flex  items-center w-64 justify-center rounded-2xl gap-3 bg-red-100  hover:bg-red-200 border-red-600 font-bold h-18 text-red-600 disabled:border-gray-400 disabled:text-gray-400 disabled:bg-gray-200"
        :disabled="disableEliminar"
        @click="$emit('eliminar')"
      >
        <UIcon
          name="i-lucide-shopping-cart-minus"
          class="size-8"
        />
        <span class="">Eliminar item</span>
      </button>
    </div>
    <div class=" flex-1 flex-col items-center justify-center gap-4 grid grid-cols-3 sm:gap-6">
      <div class="text-xl text-center">
        <p class=" text-neutral-600">
          Subtotal
        </p>
        <p class="font-bold">
          {{ formatPrice(subtotal) }}
        </p>
      </div>
      <div class="text-xl text-center">
        <p class=" text-neutral-600">
          Ahorro
        </p>
        <p class="font-bold text-green-600">
          {{ formatPrice(saving) }}
        </p>
      </div>
      <div class="text-xl text-center">
        <p class=" text-neutral-600">
          Productos
        </p>
        <p class="font-bold">
          {{ totalProducts }}
        </p>
      </div>
      <!-- <div class="text-xl text-center">
        <p class=" text-neutral-600">
          Items
        </p>
        <p class="font-bold">
          {{ totalItems }}
        </p>
      </div> -->
    </div>
    <div class="flex justify-center items-center p-3">
      <UButton
        block
        variant="outline"
        color="neutral"
        size="xl"
        active-class="opacity-50!"
        class="h-18 px-6 rounded-2xl font-bold"
        label="Escanear producto"
        icon="i-lucide-scan-line"
        @click="openScan('add')"
      />
    </div> 
    <div class="shrink-0 flex justify-center items-center p-3 w-72">
      <button
        class="flex flex-col w-full  items-center justify-center gap-1 rounded-2xl bg-green-600 hover:bg-green-500 h-full text-white disabled:opacity-40"
        :disabled="disableFinalizar"
        @click="$emit('finalizar')"
      >
        <span class="flex items-center gap-2 text-2xl font-bold">
          Total
          <!-- <UIcon
            name="i-lucide-shopping-cart"
            class="size-7"
          /> -->
          {{ formatPrice(cartTotal) }}
        </span>
        <span>Finalizar compra</span>
      </button>
    </div>
  </footer>
</template>
