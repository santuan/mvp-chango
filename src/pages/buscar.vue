<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCart } from '../composables/useCart'
import { useCartModals } from '../composables/useCartModals'
import { categories, finalPrice, findProduct, products, productsOf } from '../data/catalog'
import type { Category, Product } from '../data/catalog'

const { subtotal, saving, cartTotal, totalItems, totalProducts } = useCart()
const { openScan, checkoutModalOpen } = useCartModals()

const searchQuery = ref('')
const page = ref(1)
const perPage = 12
const view = ref<'categories' | 'products' | 'product' | 'mapa'>('categories')
const selectedCategory = ref<Category | null>(null)
const selectedProduct = ref<Product | null>(null)

// Search mode: as soon as the user types, category grid hides and
// the CommandPalette (Fuse.js + Listbox) shows live product results.
const isSearching = computed(() => searchQuery.value.trim().length > 0)

function categoryName(id: number): string {
  return categories.find(c => c.id === id)?.name ?? ''
}

// CommandPalette group: every product as a fuzzy-searchable item.
// UCommandPalette filters these with Fuse.js (via @vueuse useFuse)
// and renders them in an accessible Listbox.
const paletteGroups = computed(() => [
  {
    id: 'products',
    label: 'Productos',
    items: products.map(p => ({
      productId: p.id,
      label: p.name,
      category: categoryName(p.categoryId),
      description: `En ${categoryName(p.categoryId)}`,
      suffix: formatPrice(finalPrice(p)),
      icon: 'i-lucide-shopping-bag',
    })),
  },
])

const paletteFuse = {
  fuseOptions: {
    keys: ['label', 'category', 'description'],
    threshold: 0.35,
    ignoreLocation: true,
  },
  resultLimit: 30,
  matchAllWhenSearchEmpty: false,
}

function onSelectPaletteItem(value: { productId?: number; [key: string]: unknown } | null | undefined): void {
  const id = value?.productId as number | undefined
  if (!id)
    return
  const product = findProduct(id)
  if (!product)
    return
  selectedCategory.value = categories.find(c => c.id === product.categoryId) ?? null
  openProduct(product)
}

const productsInCategory = computed(() => {
  if (!selectedCategory.value) return []
  return productsOf(selectedCategory.value)
})

const selectedProductData = computed(() => selectedProduct.value)

const relatedProducts = computed(() => {
  if (!selectedProduct.value) return []
  return products
    .filter(p => p.categoryId === selectedProduct.value!.categoryId && p.id !== selectedProduct.value!.id)
    .slice(0, 3)
})

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q)
    return categories
  return categories.filter(c => c.name.toLowerCase().includes(q))
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
  view.value = 'products'
}

function openProduct(product: Product): void {
  selectedProduct.value = product
  view.value = 'product'
}

function openMap(): void {
  view.value = 'mapa'
}

function backToProduct(): void {
  view.value = 'product'
}

function backToProducts(): void {
  view.value = 'products'
  selectedProduct.value = null
}

function backToCategories(): void {
  view.value = 'categories'
  selectedCategory.value = null
  selectedProduct.value = null
}

function resetSearch(): void {
  searchQuery.value = ''
  page.value = 1
  view.value = 'categories'
  selectedCategory.value = null
  selectedProduct.value = null
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
            placeholder="Buscar producto..."
            icon="i-lucide-search"
            size="xl"
            @input="onSearch"
          />
        </div> -->


        <!-- Categories view -->
        <div v-if="view === 'categories'">
          <div class="flex justify-start hover:bg-gray-200 rounded-full w-full outline-4 outline-offset-2! focus-within:outline-blue-600 outline-neutral-950 h-10 mb-6 items-center">
            <div class="w-10 flex justify-center items-center">
              <UIcon name="i-lucide-search" />
            </div>
            <input
              v-model="searchQuery"
              placeholder="Buscar en todos los productos..."
              aria-label="Buscar en todos los productos"
              class="w-full outline-0 "
            >
            <!-- <UButton
              v-if="searchQuery"
              type="button"
              size="lg"
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              class="shrink-0 rounded-full"
              variant="outline"
              color="neutral"
              icon="i-lucide-x"
              @click="searchQuery = ''"
            /> -->
          </div>
        
          <UCommandPalette
            v-if="isSearching"
            v-model:search-term="searchQuery"
            :groups="paletteGroups"
            class="flex-1 max-h-[calc(100vh-15rem)] "
            :fuse="paletteFuse"
            :input="false"
            :ui="{
              item: 'data-highlighted:not-data-disabled:before:bg-gray-300',
              label: 'text-foreground'
            }"
            @update:model-value="onSelectPaletteItem"
          >
            <template #empty>
              <div class="flex flex-col items-center gap-3 py-6 text-neutral-500">
                <UIcon
                  name="i-lucide-search-x"
                  class="size-24"
                />
                <p class="text-xl">
                  Sin resultados para <b>{{ searchQuery }}</b>
                </p>
                <UButton
                  type="button"
                  aria-label="Limpiar búsqueda"
                  title="Limpiar búsqueda"
                  variant="outline"
                  size="xl"
                  class="h-18 rounded-2xl font-bold px-6"
                  color="neutral"
                  @click="searchQuery = ''"
                >
                  Limpiar búsqueda
                </UButton>
              </div>
            </template>
            <template #item="{ item }">
              <div class="flex w-full items-center gap-4 h-24 py-1">
                <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-neutral-700">
                  <UIcon
                    name="i-lucide-shopping-bag"
                    class="size-5 text-neutral-400"
                  />
                </div>
                <div class="flex min-w-0 flex-1 flex-col text-neutral-900 items-start text-left">
                  <span class="truncate text-base font-bold">{{ item.label }}</span>
                  <span class="text-xs ">{{ item.description }}</span>
                </div>
                <span class="shrink-0 text-sm font-bold text-neutral-900">{{ item.suffix }}</span>
              </div>
            </template>
          </UCommandPalette>
          <div
            v-if="!isSearching"
            class="max-h-[calc(100vh-20rem)] p-2 min-h-[calc(100vh-20rem)] overflow-y-auto mt-6"
          >
            <div class="grid grid-cols-2  gap-2 md:grid-cols-4 place-content-start">
              <UButton
                v-for="category in paged"
                :key="category.id"
                variant="outline"
                color="neutral"
                size="xl"
                block
                active-class="opacity-50!"
                class="h-30 px-6 rounded-2xl font-bold"
                @click="openCategory(category)"
              >
                <!-- <UIcon
                  name="i-lucide-shopping-bag"
                  class="size-6 "
                /> -->
                <span class="text-xl">{{ category.name }}</span>
              </UButton>
            </div>
          </div>

          <div
            v-if="!isSearching && paged.length === 0"
            class="flex flex-col items-center gap-2 py-6 text-neutral-500"
          >
            <UIcon
              name="i-lucide-search-x"
              class="size-10"
            />
            <p>Sin resultados para "{{ searchQuery }}"</p>
          </div>

          <div
            v-if="!isSearching"
            class="flex flex-col items-center px-2  justify-between mt-2 gap-4 sm:flex-row"
          >
            <UButton
              variant="outline"
              color="neutral"
              size="xl"
              class="h-18 px-6 rounded-2xl font-bold disabled:opacity-40"
              label="Página anterior"
              icon="i-lucide-arrow-left"
              :disabled="page <= 1"
              @click="prevPage"
            />
            <span class="text-sm">{{ page }} de {{ totalPages }}</span>
            <UButton
              variant="outline"
              color="neutral"
              size="xl"
              class="h-18 px-6 rounded-2xl font-bold disabled:opacity-40"
              label="Siguiente página"
              trailing-icon="i-lucide-arrow-right"
              :disabled="page >= totalPages"
              @click="nextPage"
            />
          </div>
        </div>

        <!-- Products list view -->
        <div v-if="view === 'products'">
          <div class="grid grid-cols-3">
            <div>
              <UButton
                variant="outline"
                color="neutral"
                size="xl"
                active-class="opacity-50!"
                class="h-18 rounded-2xl px-6 font-bold"
                icon="i-lucide-arrow-left"
                label="Volver a categorías"
                @click="backToCategories"
              />
            </div>
            <div class="flex justify-center items-center">
              <h1 class="flex-1 text-center text-2xl font-bold">
                {{ selectedCategory?.name }}
              </h1>
            </div>
          </div>
          
          <div class="max-h-[calc(100vh-17rem)] p-2 min-h-[calc(100vh-17rem)] overflow-y-auto mt-4">
            <div class="grid grid-cols-2 gap-2 md:grid-cols-2 xl:grid-cols-3 place-content-start">
              <UButton
                v-for="product in productsInCategory"
                :key="product.id"
                variant="outline"
                color="neutral"
                size="xl"
                active-class="opacity-50!"
                class="p-0 w-full rounded-2xl overflow-hidden font-bold"
                @click="openProduct(product)"
              >
                <div class="flex gap-4 w-full">
                  <div class="flex justify-center items-center shrink-0 h-24 w-24 xl:h-40 bg-neutral-700 xl:w-40">
                    <UIcon
                      name="i-lucide-shopping-bag"
                      class="size-6 text-neutral-400"
                    />
                  </div>

                  <div class="flex text-left w-full flex-col items-start justify-center ">
                    <span class="text-lg">{{ product.name }}</span>
                    <span
                      class="text-xl font-bold"
                      :class="product.discountPercent ? 'text-green-600' : ''"
                    >
                      {{ formatPrice(finalPrice(product)) }}
                    </span> 
                  </div>
                </div>
              </UButton>
            </div>
          </div>

          <div
            v-if="productsInCategory.length === 0"
            class="flex flex-col items-center gap-2 py-6 text-neutral-500"
          >
            <UIcon
              name="i-lucide-search-x"
              class="size-10"
            />
            <p>No hay productos en esta categoría</p>
          </div>
        </div>

        <!-- Product detail view -->
        <div v-if="view === 'product'">
          <UButton
            variant="outline"
            color="neutral"
            size="xl"
            active-class="opacity-50!"
            class="h-18 rounded-2xl px-6 font-bold"
            icon="i-lucide-arrow-left"
            :label="`Volver a ${selectedCategory?.name || 'productos'}`"
            @click="backToProducts"
          />
          <div class="flex flex-col gap-6 pt-4 md:flex-row">
            <div class="flex h-72 w-full items-center justify-center bg-neutral-200 md:w-72">
              <UIcon
                name="i-lucide-image"
                class="size-10 text-neutral-400"
              />
            </div>
            <div
              v-if="selectedProductData"
              class="flex flex-1 flex-col gap-2"
            >
              <p
                class="text-4xl font-bold"
                :class="selectedProductData.discountPercent ? 'text-green-600' : ''"
              >
                {{ formatPrice(finalPrice(selectedProductData)) }}
              </p>
              <p
                v-if="selectedProductData.discountPercent"
                class="text-lg font-semibold "
              >
                <span class="line-through">
                  {{ formatPrice(selectedProductData.price) }}</span>
                <span
                  class="text-xl ml-3 font-semibold text-green-600"
                >
                  Aplica descuento {{ selectedProductData.discountPercent }}%
                </span>
              </p>
              <p class="pt-2 text-xl font-bold">
                {{ selectedProductData.name }}
              </p>
              
              <!-- <p
                v-if="selectedCategory"
                class="text-xl text-neutral-500"
              >
                En {{ selectedCategory.name }}
              </p> -->
              <div class="flex flex-wrap gap-3">
                <UButton
                  label="Ver en mapa"
                  icon="i-lucide-map"
                  variant="outline"
                  color="neutral"
                  size="xl"
                  class="h-18 px-6 rounded-2xl font-bold"
                  @click="openMap"
                />
                <UButton
                  label="Guiarme al producto en la gondola"
                  icon="i-lucide-navigation"
                  variant="outline"
                  color="neutral"
                  size="xl"
                  class="h-18 px-6 rounded-2xl font-bold"
                  :to="`/guiar?id=${selectedProduct?.id}`"
                />
              </div>
            </div>
          </div>

          <h2 class="pt-3 text-lg font-bold">
            Productos relacionados
          </h2>
          <div class="grid grid-cols-2 gap-4 pt-3 md:grid-cols-3">
            <UButton
              v-for="related in relatedProducts"
              :key="related.id"
              variant="outline"
              color="neutral"
              class="p-0 overflow-hidden rounded-2xl"
              size="xl"
              @click="openProduct(related)"
            >
              <div class="flex gap-4 w-full">
                <div class="flex justify-center items-center shrink-0 h-20 bg-neutral-700 w-20">
                  <UIcon
                    name="i-lucide-shopping-bag"
                    class="size-6 text-neutral-400"
                  />
                </div>

                <div class="flex text-left w-full flex-col items-start justify-center ">
                  <span class="text-base">{{ related.name }}</span>
                  <span
                    class="text-xs font-bold"
                    :class="related.discountPercent ? 'text-green-600' : ''"
                  >
                    {{ formatPrice(finalPrice(related)) }}
                  </span> 
                </div>
              </div>
            </UButton>
            <!-- <button
              v-for="related in relatedProducts"
              :key="related.id"
              type="button"
              class="flex cursor-pointer flex-col items-center gap-2 bg-neutral-200 p-8 transition hover:bg-neutral-300"
              @click="openProduct(related)"
            >
              <UIcon
                name="i-lucide-shopping-bag"
                class="size-14 text-neutral-400"
              />
              <span class="text-sm">{{ related.name }}</span>
            </button> -->
          </div>
        </div>

        <!-- Map view -->
        <div v-if="view === 'mapa'">
          <UButton
            variant="outline"
            color="neutral"
            size="xl"
            active-class="opacity-50!"
            class="h-18 rounded-2xl px-6 font-bold"
            icon="i-lucide-arrow-left"
            label="Cerrar mapa"
            @click="backToProduct"
          />
          <div class="flex flex-col gap-4 pt-4">
            <div>
              <h1 class="text-2xl text-center font-bold">
                Ubicación {{ selectedProduct?.name }}
              </h1>
              <!-- <p
                v-if="selectedCategory"
                class="text-lg text-neutral-500"
              >
                En {{ selectedCategory.name }}
              </p> -->
            </div>
            <img
              src="/mapa.jpg"
              alt="Mapa del local con ubicación del producto"
              class="w-full max-w-3xl mx-auto rounded-2xl border border-neutral-200"
            >
            <!-- <p class="text-sm text-center text-neutral-500">
              Ubicación orientativa del producto en el plano.
            </p> -->
          </div>
        </div>
      </section>

      <!-- Side actions -->
      <aside class="flex w-full flex-col gap-4 bg-neutral-100 p-6 lg:w-72">
        <h2 class="text-xl font-bold tracking-wide">
          ChanGo!
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
          @click="resetSearch"
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
