<script setup lang="ts">
  import { lineTotal, useCart } from '../composables/useCart'
  import type { CartProduct } from '../composables/useCart'
  import { useCartModals } from '../composables/useCartModals'

  const { products, subtotal, saving, cartTotal, totalItems, totalProducts } = useCart()
  const { openScan, justAddedId, checkoutModalOpen } = useCartModals()

  function formatPrice(value: number): string {
    return `$${value.toLocaleString('es-AR')}`
  }

  function increaseRow(product: CartProduct): void {
    product.quantity += 1
  }

  function decreaseRow(product: CartProduct): void {
    if (product.quantity <= 1)
      return
    product.quantity -= 1
  }
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-black">
    <div class="flex flex-1 flex-col lg:flex-row">
      <!-- Product table -->
      <section class="flex-1  p-6">
        <div class="flex items-center gap-4 pb-4 mr-2 p-2" v-if="products.length !== 0">
          <h1 class="flex-1 text-lg font-bold">
            Productos en el carrito
          </h1>
          <span class="w-32 text-center text-xs font-semibold">Precio unidad</span>
          <span class="w-44 text-center text-xs font-semibold">Cantidad</span>
          <span class="w-32 text-center text-xs font-semibold">Total</span>
        </div>

        <div
          v-if="products.length === 0"
          class="flex flex-col items-center gap-4 border-t border-neutral-200 py-32 text-center"
        >
          <UIcon
            name="i-lucide-shopping-cart-plus"
            class="size-16 text-neutral-300"
          />
          <p class="text-xl font-bold">
            El carrito está vacío
          </p>
          <p class="text-sm text-neutral-500">
            Escaneá un producto para comenzar
          </p>
          <UButton
            size="xl"
            class="bg-black px-10 py-4 font-bold text-white"
            label="Escanear producto"
            icon="i-lucide-scan-line"
            @click="openScan('add')"
          />
        </div>
        <div class="max-h-130 overflow-y-auto">
          <div
            v-for="product in products"
            :key="product.id"
            class="flex items-center gap-4 border-t border-neutral-200 py-4 transition-all duration-300 p-2"
            :class="justAddedId === product.id ? 'ring-4 ring-green-500 ring-inset rounded-lg' : ''"
          >
            <div class="flex h-24 w-24 shrink-0 items-center justify-center bg-neutral-200">
              <UIcon
                name="i-lucide-image"
                class="size-8 text-neutral-400"
              />
            </div>
            <div class="flex-1">
              <p class="text-lg font-bold">
                {{ product.name }}
              </p>
              <p
                v-if="product.discountPercent"
                class="text-sm font-semibold text-green-600"
              >
                Aplica descuento {{ product.discountPercent }}%
              </p>
            </div>
            <span class="w-32 text-center text-sm font-semibold">{{ formatPrice(product.unitPrice) }}</span>
            <div class="flex w-44 items-center justify-center gap-2">
              <UButton
                size="xl"
                color="neutral"
                variant="outline"
                icon="i-lucide-minus"
                aria-label="Quitar uno"
                class="p-4 disabled:opacity-40"
                :disabled="product.quantity <= 1"
                @click="decreaseRow(product)"
              />
              <span class="min-w-10 text-center text-xl font-bold">{{ product.quantity }}</span>
              <UButton
                size="xl"
                color="neutral"
                variant="outline"
                icon="i-lucide-plus"
                aria-label="Agregar uno"
                class="p-4"
                @click="increaseRow(product)"
              />
            </div>
            <span
              class="w-32 text-center text-sm font-semibold"
              :class="product.discountPercent ? 'text-green-600' : ''"
            >{{ formatPrice(lineTotal(product)) }}</span>
          </div>
        </div>
      </section>

      <!-- Side actions -->
      <aside class="flex w-full flex-col gap-4 bg-neutral-100 p-6 lg:w-72">
        <h2 class="text-lg font-bold tracking-wide">
          CHANGO
        </h2>
        <UButton
          block
          size="xl"
          class="bg-black py-5 font-bold text-white"
          label="Escanear producto"
          @click="openScan('add')"
        />
        <UButton
          block
          size="xl"
          to="/buscar"
          class="bg-black py-5 font-bold text-white"
          label="Busca producto"
        />
        <UButton
          block
          size="xl"
          class="bg-gray-300 py-5 font-bold text-gray-500 pointer-events-none "
          label="Más opciones"
        />
        <UButton
          block
          size="xl"
          class="bg-gray-300 py-5 font-bold text-gray-500 pointer-events-none "
          label="Solicitar asistencia"
        />
      </aside>
    </div>

    <!-- Bottom summary bar -->
    <CartFooter
      :subtotal="subtotal"
      :saving="saving"
      :total-items="totalItems"
      :total-products="totalProducts"
      :cart-total="cartTotal"
      :disable-eliminar="products.length === 0"
      :disable-finalizar="products.length === 0"
      @eliminar="openScan('remove')"
      @finalizar="checkoutModalOpen = true"
    />

    <!-- Shared modals -->
    <CartModals />
  </div>
</template>
