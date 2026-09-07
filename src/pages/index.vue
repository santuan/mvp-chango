<script setup lang="ts">
  import { lineTotal, useCart } from '../composables/useCart'
  import type { CartProduct } from '../composables/useCart'
  import { useCartModals } from '../composables/useCartModals'

  const { products, subtotal, saving, cartTotal, totalItems, totalProducts } = useCart()
  const { openScan, openRemove, justAddedId, checkoutModalOpen, openAssistance } = useCartModals()

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
  <div class="flex h-screen flex-col bg-white text-black">
    <div class="flex flex-1 flex-collg:flex-row">
      <!-- Product table -->
      <section class="flex-1 p-6">
        <div
          v-if="products.length !== 0"
          class="flex items-center gap-4 pb-4 mr-2 p-2"
        >
          <h1 class="flex-1 text-lg font-bold">
            Productos en el carrito
          </h1>
          <span class="w-32 text-center text-sm font-semibold">Precio unidad</span>
          <span class="w-44 text-center text-sm font-semibold">Cantidad</span>
          <span class="w-32 text-center text-sm font-semibold">Total</span>
          <span class="w-16" />
        </div>

        <div
          v-if="products.length === 0"
          class="flex flex-col items-center gap-4 border-t border-neutral-200 py-32 text-center"
        >
          <UIcon
            name="i-lucide-shopping-cart"
            class="size-16 text-neutral-300"
          />
          <p class="text-xl font-bold">
            El carrito está vacío
          </p>
          <p class="text-sm text-neutral-500">
            Escaneá un producto para comenzar
          </p>
          <UButton
            label="Escanear producto"
            variant="outline"
            color="neutral"
            size="xl"
            class="h-18 rounded-2xl px-6 font-bold"
            icon="i-lucide-scan-line"
            @click="openScan('add')"
          />
        </div>
        <div class="max-h-[calc(100vh-15rem)] overflow-y-auto">
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
                class="p-4 disabled:opacity-50"
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
            <UButton
              color="error"
              variant="outline"
              icon="i-lucide-trash-2"
              aria-label="Eliminar del carrito"
              class="p-4"
              @click="openRemove(product)"
            />
          </div>
        </div>
      </section>

      <!-- Side actions -->
      <aside class="flex w-full flex-col gap-4 bg-neutral-100 p-6 lg:w-72">
        <h2 class="text-lg font-bold tracking-wide">
          CHANGO
        </h2>
        <!-- <UButton
          block
          variant="outline"
          color="neutral"
          size="xl"
          active-class="opacity-50!"
          class="h-18 rounded-2xl font-bold"
          label="Escanear producto"
          icon="i-lucide-scan-line"
          @click="openScan('add')"
        /> -->
        <UButton
          to="/"
          block
          variant="outline"
          color="neutral"
          size="xl"
          active-class="opacity-50!"
          class="h-18 rounded-2xl px-6 font-bold"
          :icon="totalProducts === 0 ? 'i-lucide-shopping-cart' : 'i-lucide-shopping-cart-plus'"
          label="Mi Carrito"
        />
        <UButton
          block
          to="/buscar"
          variant="outline"
          color="neutral"
          size="xl"
          active-class="opacity-50!"
          class="h-18 rounded-2xl font-bold"
          icon="i-lucide-search"
          label="Busca producto"
        />
        <!-- <UButton
          block
          variant="outline"
          color="neutral"
          size="xl"
          active-class="opacity-50!"
          class="h-18 rounded-2xl font-bold"
          icon="i-lucide-circle-question-mark"
          label="Solicitar asistencia"
          @click="openAssistance"
        />  -->
        <!-- <UButton
          block
          size="xl"
          class="bg-gray-300 py-5 font-bold text-gray-500 pointer-events-none "
          label="Más opciones"
        />
        -->
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
