<script setup lang="ts">
// Welcome / landing screen. Entry point to the smart cart flow.
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center text-black">
    <div class="flex max-w-xl flex-col items-center gap-6">
      <h1 class="text-4xl font-bold text-balance sm:text-5xl">
        Bienvenido a CHANGO
      </h1>
      <p class="max-w-md text-2xl text-neutral-600">
        Escaneá productos, buscá en la góndola y pagá sin filas.
      </p>
      <UButton
        to="/carrito"
        size="xl"
        color="neutral"
        variant="outline"
        class="h-18 rounded-2xl px-8 font-bold"
        icon="i-lucide-shopping-cart"
        label="Empezar a comprar"
      />
    </div>
  </div>
</template>
