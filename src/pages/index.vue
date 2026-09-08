<script setup lang="ts">
// Welcome / landing screen. Entry point to the smart cart flow.
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16 text-center sm:py-24">
    <div class="flex max-w-xl flex-col items-center">
      <h1 class="text-balance text-4xl font-medium leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl">
        <span class="font-bold">ChanGo!</span>
      </h1>
      <p class="mt-4 max-w-md text-balance text-xl leading-snug text-neutral-600">
        Pago sin filas con pago dividido. Promociones transparentes y control de gasto en tiempo real.
      </p>
      <UButton
        to="/carrito"
        size="xl"
        color="neutral"
        variant="outline"
        class="mt-10 h-18 rounded-2xl px-8 font-bold"
        icon="i-lucide-shopping-cart"
        label="Empezar a comprar"
      />
    </div>
  </div>
</template>
