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

// 15 total, 12 per page mock
const allCategories = ref<Category[]>([
  { id: 1, name: 'Lácteos' },
  { id: 2, name: 'Panadería' },
  { id: 3, name: 'Huevos' },
  { id: 4, name: 'Aceites y Vinagres' },
  { id: 5, name: 'Arroz y Legumbres' },
  { id: 6, name: 'Pastas' },
  { id: 7, name: 'Azúcar y Endulzantes' },
  { id: 8, name: 'Yerba y Café' },
  { id: 9, name: 'Gaseosas' },
  { id: 10, name: 'Aguas' },
  { id: 11, name: 'Cervezas y Vinos' },
  { id: 12, name: 'Limpieza' },
  { id: 13, name: 'Higiene Personal' },
  { id: 14, name: 'Carnes' },
  { id: 15, name: 'Frutas y Verduras' },
])

interface Product {
  id: number
  name: string
  categoryId: number
  price: number
  originalPrice: number
  discount?: number
}

const allProducts = ref<Product[]>([
  // Lácteos
  { id: 1, name: 'Leche entera 1L', categoryId: 1, price: 1200, originalPrice: 1200 },
  { id: 2, name: 'Leche descremada 1L', categoryId: 1, price: 1300, originalPrice: 1300 },
  { id: 3, name: 'Manteca 200g', categoryId: 1, price: 2400, originalPrice: 2400 },
  { id: 4, name: 'Queso cremoso 500g', categoryId: 1, price: 6800, originalPrice: 6800 },
  { id: 5, name: 'YogurNatural x4', categoryId: 1, price: 3200, originalPrice: 3200 },
  { id: 6, name: 'Queso rallado 250g', categoryId: 1, price: 4500, originalPrice: 4500 },
  // Panadería
  { id: 7, name: 'Pan lactal', categoryId: 2, price: 2800, originalPrice: 2800 },
  { id: 8, name: 'Pan francés x12', categoryId: 2, price: 2400, originalPrice: 2400 },
  { id: 9, name: 'Medialunas x6', categoryId: 2, price: 5200, originalPrice: 5200 },
  { id: 10, name: 'Facturas x6', categoryId: 2, price: 5800, originalPrice: 5800 },
  // Huevos
  { id: 11, name: 'Huevos x12', categoryId: 3, price: 2800, originalPrice: 3500, discount: 20 },
  { id: 12, name: 'Huevos x6', categoryId: 3, price: 1600, originalPrice: 1600 },
  { id: 13, name: 'Huevos blancos x12', categoryId: 3, price: 3000, originalPrice: 3000 },
  // Aceites y Vinagres
  { id: 14, name: 'Aceite de oliva 500ml', categoryId: 4, price: 8500, originalPrice: 8500 },
  { id: 15, name: 'Aceite de girasol 1L', categoryId: 4, price: 5200, originalPrice: 5200 },
  { id: 16, name: 'Vinagre de manzana 500ml', categoryId: 4, price: 3800, originalPrice: 3800 },
  { id: 17, name: 'Aceite de maíz 1L', categoryId: 4, price: 5600, originalPrice: 5600 },
  // Arroz y Legumbres
  { id: 18, name: 'Arroz 1kg', categoryId: 5, price: 1600, originalPrice: 1600 },
  { id: 19, name: 'Frijoles 500g', categoryId: 5, price: 2200, originalPrice: 2200 },
  { id: 20, name: 'Lentejas 500g', categoryId: 5, price: 2100, originalPrice: 2100 },
  { id: 21, name: 'Garbanzos 500g', categoryId: 5, price: 3400, originalPrice: 3400 },
  // Pastas
  { id: 22, name: 'Fideos 500g', categoryId: 6, price: 1400, originalPrice: 1400 },
  { id: 23, name: 'Spaghetti 500g', categoryId: 6, price: 1500, originalPrice: 1500 },
  { id: 24, name: 'Ñoquis 500g', categoryId: 6, price: 2800, originalPrice: 2800 },
  { id: 25, name: 'Ravioles 500g', categoryId: 6, price: 4200, originalPrice: 4200 },
  // Azúcar y Endulzantes
  { id: 26, name: 'Azúcar 1kg', categoryId: 7, price: 1800, originalPrice: 1800 },
  { id: 27, name: 'Endulzante x100', categoryId: 7, price: 1200, originalPrice: 1200 },
  { id: 28, name: 'Miel 500g', categoryId: 7, price: 12500, originalPrice: 12500 },
  // Yerba y Café
  { id: 29, name: 'Yerba mate 500g', categoryId: 8, price: 3360, originalPrice: 4200, discount: 20 },
  { id: 30, name: 'Café molido 250g', categoryId: 8, price: 7500, originalPrice: 7500 },
  { id: 31, name: 'Café instantáneo 100g', categoryId: 8, price: 8200, originalPrice: 8200 },
  { id: 32, name: 'Té negro x24', categoryId: 8, price: 2100, originalPrice: 2100 },
  // Gaseosas
  { id: 33, name: 'Gaseosa 2.25L', categoryId: 9, price: 3200, originalPrice: 3200 },
  { id: 34, name: 'Gaseosa 500ml', categoryId: 9, price: 1600, originalPrice: 1600 },
  { id: 35, name: 'Jugo en polvo x10', categoryId: 9, price: 1800, originalPrice: 1800 },
  { id: 36, name: 'Agua saborizada 500ml', categoryId: 9, price: 1400, originalPrice: 1400 },
  // Aguas
  { id: 37, name: 'Agua mineral 2L', categoryId: 10, price: 1100, originalPrice: 1100 },
  { id: 38, name: 'Agua mineral 500ml', categoryId: 10, price: 800, originalPrice: 800 },
  { id: 39, name: 'Agua saborizada 1L', categoryId: 10, price: 1900, originalPrice: 1900 },
  // Cervezas y Vinos
  { id: 40, name: 'Cerveza x6', categoryId: 11, price: 4640, originalPrice: 5800, discount: 20 },
  { id: 41, name: 'Cerveza artesanal x3', categoryId: 11, price: 4200, originalPrice: 4200 },
  { id: 42, name: 'Vino tinto 750ml', categoryId: 11, price: 6500, originalPrice: 6500 },
  { id: 43, name: 'Vino blanco 750ml', categoryId: 11, price: 5800, originalPrice: 5800 },
  // Limpieza
  { id: 44, name: 'Detergente 1L', categoryId: 12, price: 3800, originalPrice: 3800 },
  { id: 45, name: 'Lavandina 1L', categoryId: 12, price: 1200, originalPrice: 1200 },
  { id: 46, name: 'Jabón en polvo 800g', categoryId: 12, price: 4200, originalPrice: 4200 },
  { id: 47, name: 'Esponjas x3', categoryId: 12, price: 1500, originalPrice: 1500 },
  // Higiene Personal
  { id: 48, name: 'Jabón en barra', categoryId: 13, price: 900, originalPrice: 900 },
  { id: 49, name: 'Shampoo 400ml', categoryId: 13, price: 5200, originalPrice: 5200 },
  { id: 50, name: 'Pasta dental 90g', categoryId: 13, price: 3400, originalPrice: 3400 },
  { id: 51, name: 'Papel higiene x4', categoryId: 13, price: 4500, originalPrice: 4500 },
  // Carnes
  { id: 52, name: 'Bondiola 1kg', categoryId: 14, price: 9600, originalPrice: 12000, discount: 20 },
  { id: 53, name: 'Pechuga de pollo 1kg', categoryId: 14, price: 7200, originalPrice: 7200 },
  { id: 54, name: 'Carne picada 1kg', categoryId: 14, price: 8400, originalPrice: 8400 },
  { id: 55, name: 'Chorizo x6', categoryId: 14, price: 5600, originalPrice: 5600 },
  // Frutas y Verduras
  { id: 56, name: 'Banana 1kg', categoryId: 15, price: 1500, originalPrice: 1500 },
  { id: 57, name: 'Manzana 1kg', categoryId: 15, price: 2200, originalPrice: 2200 },
  { id: 58, name: 'Tomate 1kg', categoryId: 15, price: 1800, originalPrice: 1800 },
  { id: 59, name: 'Cebolla 1kg', categoryId: 15, price: 1200, originalPrice: 1200 },
  { id: 60, name: 'Papa 1kg', categoryId: 15, price: 1600, originalPrice: 1600 },
])

const searchQuery = ref('')
const page = ref(1)
const perPage = 12
const view = ref<'categories' | 'products' | 'product'>('categories')
const selectedCategory = ref<Category | null>(null)
const selectedProduct = ref<Product | null>(null)

// Search mode: as soon as the user types, category grid hides and
// the CommandPalette (Fuse.js + Listbox) shows live product results.
const isSearching = computed(() => searchQuery.value.trim().length > 0)

function categoryName(id: number): string {
  return allCategories.value.find(c => c.id === id)?.name ?? ''
}

// CommandPalette group: every product as a fuzzy-searchable item.
// UCommandPalette filters these with Fuse.js (via @vueuse useFuse)
// and renders them in an accessible Listbox.
const paletteGroups = computed(() => [
  {
    id: 'products',
    label: 'Productos',
    items: allProducts.value.map(p => ({
      productId: p.id,
      label: p.name,
      category: categoryName(p.categoryId),
      description: `En ${categoryName(p.categoryId)}`,
      suffix: formatPrice(p.price),
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
  const product = allProducts.value.find(p => p.id === id)
  if (!product)
    return
  selectedCategory.value = allCategories.value.find(c => c.id === product.categoryId) ?? null
  openProduct(product)
}

const productsInCategory = computed(() => {
  if (!selectedCategory.value) return []
  return allProducts.value.filter(p => p.categoryId === selectedCategory.value!.id)
})

const selectedProductData = computed(() => selectedProduct.value)

const relatedProducts = computed(() => {
  if (!selectedProduct.value) return []
  return allProducts.value
    .filter(p => p.categoryId === selectedProduct.value!.categoryId && p.id !== selectedProduct.value!.id)
    .slice(0, 3)
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
  view.value = 'products'
}

function openProduct(product: Product): void {
  selectedProduct.value = product
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
          <div class="flex justify-start hover:bg-gray-200 rounded-full w-full focus-within:border-green-600 border-4 h-10 items-center">
            <div class="w-10 flex justify-center items-center">
              <UIcon name="i-lucide-search" />
            </div>
            <input
              v-model="searchQuery"
              placeholder="Buscar en todos los productos..."
              aria-label="Buscar en todos los productos"
              class="w-full outline-0 "
            >
            <UButton
              v-if="searchQuery"
              type="button"
              size="lg"
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              class="shrink-0 rounded-full"
              variant="outline"
              color="neutral"
              @click="searchQuery = ''"
            >
              Limpiar búsqueda
            </UButton>
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
              <div class="flex flex-col items-center gap-2 py-6 text-neutral-500">
                <UIcon
                  name="i-lucide-search-x"
                  class="size-10"
                />
                <p>Sin resultados para "{{ searchQuery }}"</p>
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
            class="max-h-[calc(100vh-20rem)] min-h-[calc(100vh-20rem)] overflow-y-auto mt-6"
          >
            <div class="grid grid-cols-2 gap-2 md:grid-cols-4 place-content-start">
              <UButton
                v-for="category in paged"
                :key="category.id"
                variant="outline"
                color="neutral"
                size="xl"
                block
                active-class="opacity-50!"
                class="h-32 px-6 rounded-2xl font-bold"
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
            class="flex flex-col items-center justify-between mt-2 gap-4 sm:flex-row"
          >
            <UButton
              variant="outline"
              color="neutral"
              size="xl"
              class="h-18 px-6 rounded-2xl font-bold disabled:opacity-40"
              label="Pagina anterior"
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
              label="Siguiente pagina"
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
                class="h-18 rounded-2xl px-6 mt-2 font-bold"
                icon="i-lucide-arrow-left"
                label="Volver a categorías"
                @click="backToCategories"
              />
            </div>
            <div class="flex justify-center items-center">
              <h1 class="flex-1 text-center text-xl font-bold">
                {{ selectedCategory?.name }}
              </h1>
            </div>
          </div>
          
          <div class="max-h-[calc(100vh-20rem)] min-h-[calc(100vh-20rem)] overflow-y-auto mt-4">
            <div class="grid grid-cols-2 gap-2 md:grid-cols-3 place-content-start">
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
                  <div class="flex justify-center items-center shrink-0 h-40 bg-neutral-700 w-40">
                    <UIcon
                      name="i-lucide-shopping-bag"
                      class="size-6 text-neutral-400"
                    />
                  </div>

                  <div class="flex text-left w-full flex-col items-start justify-center ">
                    <span class="text-lg">{{ product.name }}</span>
                    <span
                      class="text-xs font-bold"
                      :class="product.discount ? 'text-green-600' : ''"
                    >
                      {{ formatPrice(product.price) }}
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
                :class="selectedProductData.discount ? 'text-green-600' : ''"
              >
                {{ formatPrice(selectedProductData.price) }}
              </p>
              <p
                v-if="selectedProductData.discount"
                class="text-lg font-semibold "
              >
                <span class="line-through">
                  {{ formatPrice(selectedProductData.originalPrice) }}</span>
                <span
                  class="text-xl ml-3 font-semibold text-green-600"
                >
                  Aplica descuento {{ selectedProductData.discount }}%
                </span>
              </p>
              <p class="pt-2 text-xl font-bold">
                {{ selectedProductData.name }}
              </p>
              
              <p
                v-if="selectedCategory"
                class="text-xl text-neutral-500"
              >
                En {{ selectedCategory.name }}
              </p>
              <div>
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
              size="xl"
              @click="openProduct(related)"
            >
              <div class="flex gap-4 w-full">
                <div class="flex justify-center items-center shrink-0 h-24 bg-neutral-700 w-24">
                  <UIcon
                    name="i-lucide-shopping-bag"
                    class="size-6 text-neutral-400"
                  />
                </div>

                <div class="flex text-left w-full flex-col items-start justify-center ">
                  <span class="text-lg">{{ related.name }}</span>
                  <span
                    class="text-xs font-bold"
                    :class="related.discount ? 'text-green-600' : ''"
                  >
                    {{ formatPrice(related.price) }}
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
