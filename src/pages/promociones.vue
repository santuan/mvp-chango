<script setup lang="ts">
// Promotions route. Shares the same shell layout as /buscar and /carrito:
// main section + side actions + bottom summary bar + shared modals.
// File-based routing maps this file to `/promociones`.
import { useCart } from '../composables/useCart'
import { useCartModals } from '../composables/useCartModals'
import BankPromotionsCard from '../components/BankPromotionsCard.vue'

const { subtotal, saving, cartTotal, totalItems, totalProducts } = useCart()
const { openScan, checkoutModalOpen } = useCartModals()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-black">
    <div class="flex flex-1 flex-col lg:flex-row">
      <!-- Main -->
      <section class="flex-1 p-6">
        <div class="mx-auto w-full max-w-3xl">
          <BankPromotionsCard />
        </div>
      </section>

      <!-- Side actions -->
      <aside class="flex w-full flex-col gap-4 bg-neutral-100 p-6 lg:w-72">
        <h2 class="text-xl font-bold tracking-wide">
          ChanGo!
        </h2>
        <UButton
          to="/carrito"
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
          label="Buscar producto"
        />
        <UButton
          block
          to="/promociones"
          variant="outline"
          color="neutral"
          size="xl"
          active-class="opacity-50!"
          class="h-18 rounded-2xl font-bold"
          icon="i-lucide-badge-percent"
          label="Promociones bancos"
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
      :disable-eliminar="totalItems === 0"
      :disable-finalizar="totalItems === 0"
      @eliminar="openScan('remove')"
      @finalizar="checkoutModalOpen = true"
    />

    <!-- Shared modals -->
    <CartModals />
  </div>
</template>
