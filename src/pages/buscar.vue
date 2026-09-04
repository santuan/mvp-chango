<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCart } from '../composables/useCart'
import { useCartModals } from '../composables/useCartModals'

const { subtotal, saving, cartTotal, totalItems, totalProducts } = useCart()
const { openScan, checkoutModalOpen } = useCartModals()

interface Category {
  id: number
  name: string
}

// 4 pages x 9 per page mock
const allCategories = ref<Category[]>(
  Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `Categoria ${i + 1}` }))
)

const searchQuery = ref('')
const page = ref(1)
const perPage = 9
const view = ref<'categories' | 'product'>('categories')
const selectedCategory = ref<Category | null>(null)

const categoryProducts: Record<number, { name: string, price: number, originalPrice: number, discount?: number }> = {
  1: { name: 'Leche entera 1L', price: 1200, originalPrice: 1200 },
  2: { name: 'Pan lactal', price: 2800, originalPrice: 2800 },
  3: { name: 'Huevos x12', price: 2800, originalPrice: 3500, discount: 20 },
  4: { name: 'Aceite de oliva 500ml', price: 8500, originalPrice: 8500 },
  5: { name: 'Arroz 1kg', price: 1600, originalPrice: 1600 },
  6: { name: 'Fideos 500g', price: 1400, originalPrice: 1400 },
  7: { name: 'Azúcar 1kg', price: 1800, originalPrice: 1800 },
  8: { name: 'Yerba mate 500g', price: 3360, originalPrice: 4200, discount: 20 },
  9: { name: 'Café molido 250g', price: 7500, originalPrice: 7500 },
  10: { name: 'Gaseosa 2.25L', price: 3200, originalPrice: 3200 },
  11: { name: 'Agua mineral 2L', price: 1100, originalPrice: 1100 },
  12: { name: 'Cerveza x6', price: 4640, originalPrice: 5800, discount: 20 },
  13: { name: 'Jabón en barra', price: 900, originalPrice: 900 },
  14: { name: 'Papel higiene x4', price: 4500, originalPrice: 4500 },
  15: { name: 'Detergente 1L', price: 3800, originalPrice: 3800 },
  16: { name: 'Shampoo 400ml', price: 5200, originalPrice: 5200 },
  17: { name: 'Manteca 200g', price: 2400, originalPrice: 2400 },
  18: { name: 'Queso cremoso 500g', price: 6800, originalPrice: 6800 },
  19: { name: 'Bondiola 1kg', price: 9600, originalPrice: 12000, discount: 20 },
  20: { name: 'Banana 1kg', price: 1500, originalPrice: 1500 }
}

const selectedProductData = computed(() => {
  if (!selectedCategory.value) return null
  return categoryProducts[selectedCategory.value.id] || null
})

const relatedProducts = computed(() => {
  if (!selectedCategory.value) return []
  const ids = [selectedCategory.value.id + 1, selectedCategory.value.id + 2, selectedCategory.value.id + 3]
    .filter(id => id <= 20 && id !== selectedCategory.value?.id)
  return ids.map(id => ({ id, name: categoryProducts[id]?.name || `Producto ${id}` }))
})

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q)
    return allCategories.value
  return allCategories.value.filter(c => c.name.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))

const paged = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

function nextPage(): void {
  if (page.value < totalPages.value)
    page.value += 1
}

function prevPage(): void {
  if (page.value > 1)
    page.value -= 1
}

function openCategory(category: Category): void {
  selectedCategory.value = category
  view.value = 'product'
}

function backToCategories(): void {
  view.value = 'categories'
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-black">
    <div class="flex flex-1 flex-col lg:flex-row">
      <!-- Main -->
      <section class="flex-1 p-6">
        <!-- Search header -->
        <!-- <div class="flex flex-col gap-3 pb-6">
          <UInput
            v-model="searchQuery"
            placeholder="Busca producto..."
            icon="i-lucide-search"
            size="xl"
            @input="onSearch"
          />
        </div> -->


        <!-- Categories view -->
        <div v-if="view === 'categories'">
                  <h1 class="flex-1 text-lg font-bold">
          Buscar productos
        </h1>
          <div class="max-h-130 overflow-y-auto mt-6">
            <div class="grid grid-cols-2 gap-4 md:grid-cols-3 min-h-100 place-content-start">
              <button
                v-for="category in paged"
                :key="category.id"
                class="flex flex-col items-center gap-2 bg-neutral-200 p-8"
                @click="openCategory(category)"
              >
                <UIcon
                  name="i-lucide-shopping-bag"
                  class="size-12 text-neutral-400"
                />
                <span class="text-sm">{{ category.name }}</span>
              </button>
            </div>
          </div>

          <div
            v-if="paged.length === 0"
            class="flex flex-col items-center gap-2 py-10 text-neutral-500"
          >
            <UIcon
              name="i-lucide-search-x"
              class="size-10"
            />
            <p>Sin resultados para "{{ searchQuery }}"</p>
          </div>

          <div class="flex flex-col items-center justify-between pt-6 gap-4 sm:flex-row">
            <UButton
              class="bg-black px-8 font-semibold text-white"
              label="Pagina anterior"
              :disabled="page <= 1"
              @click="prevPage"
            />
            <span class="text-sm">{{ page }} de {{ totalPages }}</span>
            <UButton
              class="bg-black px-8 font-semibold text-white"
              label="Siguiente pagina"
              :disabled="page >= totalPages"
              @click="nextPage"
            />
          </div>
        </div>

        <!-- Product detail view -->
        <div v-else>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-arrow-left"
            label="Volver a categorias"
            @click="backToCategories"
          />
          <h1 class="pt-2 text-lg font-bold">
            Productos en la canasta
          </h1>
          <div class="flex flex-col gap-6 pt-4 md:flex-row">
            <div class="flex h-64 w-full items-center justify-center bg-neutral-200 md:w-64">
              <UIcon
                name="i-lucide-image"
                class="size-10 text-neutral-400"
              />
            </div>
            <div v-if="selectedProductData" class="flex flex-1 flex-col gap-2">
              <p
                class="text-4xl font-bold"
                :class="selectedProductData.discount ? 'text-green-600' : ''"
              >
                {{ formatPrice(selectedProductData.price) }}
              </p>
              <p
                v-if="selectedProductData.discount"
                class="text-lg font-semibold line-through"
              >
                {{ formatPrice(selectedProductData.originalPrice) }}
              </p>
              <p class="pt-2 text-sm font-bold">
                {{ selectedProductData.name }}
              </p>
              <p
                v-if="selectedProductData.discount"
                class="text-sm font-semibold text-green-600"
              >
                Aplica descuento {{ selectedProductData.discount }}%
              </p>
              <p
                v-if="selectedCategory"
                class="text-xs text-neutral-500"
              >
                En {{ selectedCategory.name }}
              </p>
              <div>
                <UButton
                  class="mt-4 bg-black py-4 font-bold text-white"
                  label="Guiarme al producto en la gondola"
                  icon="i-lucide-navigation"
                  :to="`/guiar?id=${selectedCategory?.id}`"
                />
              </div>
            </div>
          </div>

          <h2 class="pt-8 text-lg font-bold">
            Productos relacionados
          </h2>
          <div class="grid grid-cols-2 gap-4 pt-4 md:grid-cols-3">
            <div
              v-for="related in relatedProducts"
              :key="related.id"
              class="flex flex-col items-center gap-2 bg-neutral-200 p-8"
            >
              <UIcon
                name="i-lucide-shopping-bag"
                class="size-14 text-neutral-400"
              />
              <span class="text-sm">{{ related.name }}</span>
            </div>
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
          class="bg-primary py-5 font-bold text-white"
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
      :disable-eliminar="totalItems === 0"
      :disable-finalizar="totalItems === 0"
      @eliminar="openScan('remove')"
      @finalizar="checkoutModalOpen = true"
    />

    <!-- Shared modals -->
    <CartModals />
  </div>
</template>
