<script setup lang="ts">
import { useCartModals } from '../composables/useCartModals'

const {
  scanModalOpen,
  addModalOpen,
  removeModalOpen,
  checkoutModalOpen,
  assistanceModalOpen,
  assistanceCalling,
  selectedProduct,
  modalQty,
  scanMode,
  openScan,
  simulateScan,
  confirmAdd,
  confirmRemove,
  increaseQty,
  decreaseQty,
  openAssistance,
  callAssistance,
  cancelAssistance
} = useCartModals()

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

defineExpose({ openScan, checkoutModalOpen, assistanceModalOpen, openAssistance })
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
            variant="outline"
            color="neutral"
            size="xl"
            class="h-18 px-6 rounded-2xl font-bold"
            label="Cancelar"
            @click="addModalOpen = false"
          />
          <UButton
            label="Agregar al carrito"
            variant="outline"
            color="neutral"
            size="xl"

            class="h-18 px-6 rounded-2xl font-bold"
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
            <p
              v-if="selectedProduct"
              class="text-lg font-semibold"
            >
              {{ selectedProduct.name }}
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-3 md:flex-row md:justify-between">
          <UButton
            color="neutral"
            variant="outline"
            class="h-18 px-6 rounded-2xl font-bold"
            label="Cancelar"
            @click="removeModalOpen = false"
          />
          <UButton
            size="xl"
            class="h-18 px-6 rounded-2xl font-bold"
            color="error"
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
    class="max-w-2xl "
  >
    <template #content>
      <div class="flex flex-col items-center gap-6 bg-white h-96 justify-center text-gray-900 p-10 ">
        <h3 class="text-3xl text-center font-bold">
          ¿Listo para pagar?
        </h3>
        <ol class=" gap-2 text-lg list-decimal font-semibold">
          <li>Diríjase a la zona de salida para pago sin fila.</li>
          <li>Haga click en la opción finalizar compra</li>
        </ol>
        <div class="flex flex-col gap-9 md:flex-row">
          <UButton
            variant="outline"
            color="neutral"
            size="xl"
            class="h-18 rounded-2xl font-bold px-6"
            label="Continuar Comprando"
            @click="checkoutModalOpen = false"
          />
          <UButton
            to="/pagar"
            color="success"
            size="xl"
            class="h-18 rounded-2xl font-bold px-6"
            label="Finalizar compra"
            @click="checkoutModalOpen = false"
          />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Assistance modal -->
  <UModal
    v-model:open="assistanceModalOpen"
    class="max-w-2xl"
  >
    <template #content>
      <div class="flex flex-col items-center gap-6 bg-white h-80 justify-center text-gray-900 p-10">
        <template v-if="!assistanceCalling">
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-circle-question-mark"
              class="size-10 text-neutral-600"
            />
            <h3 class="text-3xl text-center font-bold">
              Solicitar asistencia
            </h3>
          </div>
          <p class="text-center text-neutral-600">
            Un asistente te ayudará con tu compra
          </p>
          <div class="flex flex-col gap-4 md:flex-row">
            <UButton
              variant="outline"
              color="neutral"
              size="xl"
              class="h-18 rounded-2xl font-bold px-6"
              label="Cancelar"
              @click="assistanceModalOpen = false"
            />
            <UButton
              variant="outline"
              color="primary"
              size="xl"
              class="h-18 rounded-2xl font-bold px-6"
              label="Llamar asistente"
              icon="i-lucide-phone"
              @click="callAssistance"
            />
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-user"
              class="size-10 text-green-600"
            />
            <h3 class="text-3xl text-center font-bold">
              Llamando...
            </h3>
          </div>
          <p class="text-center text-neutral-600">
            Un asistente se encuentra en camino.
          </p>
          <UButton
            variant="outline"
            color="neutral"
            size="xl"
            class="h-18 rounded-2xl font-bold px-6"
            label="Cancelar llamada"
            @click="cancelAssistance"
          />
        </template>
      </div>
    </template>
  </UModal>
</template>
