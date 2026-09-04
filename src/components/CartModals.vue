<script setup lang="ts">
import { useCartModals } from '../composables/useCartModals'

const {
  scanModalOpen,
  addModalOpen,
  removeModalOpen,
  checkoutModalOpen,
  selectedProduct,
  modalQty,
  scanMode,
  openScan,
  simulateScan,
  confirmAdd,
  confirmRemove,
  increaseQty,
  decreaseQty
} = useCartModals()

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

defineExpose({ openScan, checkoutModalOpen })
</script>

<template>
  <!-- Scan modal -->
  <UModal v-model:open="scanModalOpen">
    <template #content>
      <div class="flex flex-col items-center gap-4 bg-white text-gray-950 p-6 text-center">
        <div class="flex w-full items-center justify-between">
          <h3 class="font-bold">
            Escanear un producto
          </h3>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            aria-label="Cerrar"
            @click="scanModalOpen = false"
          />
        </div>

        <div class="flex h-56 w-56 items-center justify-center bg-neutral-100">
          <UIcon
            name="i-lucide-scan-barcode"
            class="size-24 text-neutral-500"
          />
        </div>
        <p class="text-sm font-semibold">
          {{ scanMode === 'remove' ? 'Acerque el producto a eliminar al código de barras' : 'Acerque el producto al código de barras' }}
        </p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <UButton
            class="bg-black px-8 font-bold text-white"
            label="Simular escaneo"
            icon="i-lucide-scan-line"
            @click="simulateScan"
          />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Add modal -->
  <UModal
    v-model:open="addModalOpen"
    class="max-w-2xl"
  >
    <template #content>
      <div class="flex flex-col gap-4 bg-white text-gray-900 p-6">
        <div class="flex items-center justify-between">
          <h3 class="font-bold">
            Agregando al carrito
            <span v-if="selectedProduct">
              {{ selectedProduct.name }}
            </span>
          </h3>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            aria-label="Cerrar"
            @click="addModalOpen = false"
          />
        </div>
        <div class="flex flex-col gap-6 md:flex-row">
          <div class="flex h-64 w-full items-center justify-center bg-neutral-200 md:w-64">
            <UIcon
              name="i-lucide-image"
              class="size-10 text-neutral-400"
            />
          </div>
          <div class="flex flex-1 flex-col gap-3">
            <p class="text-3xl font-bold">
              {{ selectedProduct ? formatPrice(selectedProduct.unitPrice * modalQty) : '' }}
            </p>
            <div class="flex items-center gap-3">
              <UButton
                size="xl"
                color="neutral"
                variant="outline"
                icon="i-lucide-minus"
                aria-label="Quitar uno"
                @click="decreaseQty"
              />
              <span class="flex w-16 items-center justify-center bg-neutral-200 py-1 text-2xl font-bold">{{ modalQty }}</span>
              <UButton
                size="xl"
                color="neutral"
                variant="outline"
                icon="i-lucide-plus"
                aria-label="Agregar uno"
                @click="increaseQty"
              />
            </div>
            <p class="font-bold">
              {{ selectedProduct ? `${formatPrice(selectedProduct.unitPrice)} por unidad` : '' }}
            </p>
            <p
              v-if="selectedProduct?.discountPercent"
              class="border border-green-600 bg-green-50 p-3 text-center font-semibold text-green-700"
            >
              Aplica descuento {{ selectedProduct.discountPercent }}%
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-3 md:flex-row md:justify-between">
          <UButton
            class="bg-black px-10 font-bold text-white"
            label="Cancelar"
            @click="addModalOpen = false"
          />
          <UButton
            class="bg-black px-10 font-bold text-white"
            label="Agregar al carrito"
            @click="confirmAdd"
          />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Remove modal -->
  <UModal
    v-model:open="removeModalOpen"
    class="max-w-2xl"
  >
    <template #content>
      <div class="flex flex-col gap-4 bg-white text-gray-900 p-6">
        <div class="flex items-center justify-between">
          <span />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            aria-label="Cerrar"
            @click="removeModalOpen = false"
          />
        </div>
        <div class="flex flex-col gap-6 md:flex-row">
          <div class="flex h-64 w-full items-center justify-center bg-neutral-200 md:w-64">
            <UIcon
              name="i-lucide-image"
              class="size-10 text-neutral-400"
            />
          </div>
          <div class="flex flex-1 flex-col items-center justify-center gap-4">
            <div class="relative">
              <UIcon
                name="i-lucide-shopping-cart"
                class="size-16"
              />
              <span class="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-red-600 text-white">
                <UIcon
                  name="i-lucide-minus"
                  class="size-5"
                />
              </span>
            </div>
            <h3 class="font-bold">
              Eliminando del carrito
            </h3>
            <p v-if="selectedProduct" class="text-lg font-semibold">
              {{ selectedProduct.name }}
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-3 md:flex-row md:justify-between">
          <UButton
            class="bg-black px-10 font-bold text-white"
            label="Cancelar"
            @click="removeModalOpen = false"
          />
          <UButton
            color="error"
            class="px-10 font-bold"
            label="Eliminar del carrito"
            @click="confirmRemove"
          />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Checkout modal -->
  <UModal
    v-model:open="checkoutModalOpen"
    class="max-w-2xl"
  >
    <template #content>
      <div class="flex flex-col items-center gap-6 bg-white text-gray-900 p-10 text-center">
        <h3 class="text-3xl font-bold">
          ¿Listo para pagar?
        </h3>
        <div class="flex flex-col gap-2 text-sm font-semibold">
          <p>1&nbsp;&nbsp;Diríjase a la zona de salida para pago sin fila.</p>
          <p>2&nbsp;&nbsp;Haga click en la opción finalizar compra</p>
        </div>
        <div class="flex flex-col gap-3 md:flex-row">
          <UButton
            class="bg-black px-8 font-bold text-white"
            label="Continuar Comprando"
            @click="checkoutModalOpen = false"
          />
          <UButton
            to="/pagar"
            class="bg-black px-8 font-bold text-white"
            label="Finalizar compra"
            @click="checkoutModalOpen = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
