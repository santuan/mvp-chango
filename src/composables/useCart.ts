import { computed, ref } from 'vue'

export interface CartProduct {
  id: number
  name: string
  unitPrice: number
  quantity: number
  discountPercent?: number
}

// Module-level singleton: every page shares the same cart.
const products = ref<CartProduct[]>([])

export function lineTotal(product: CartProduct): number {
  const gross = product.unitPrice * product.quantity
  if (!product.discountPercent)
    return gross
  return Math.round(gross * (1 - product.discountPercent / 100))
}

const subtotal = computed(() =>
  products.value.reduce((acc, p) => acc + p.unitPrice * p.quantity, 0)
)

const cartTotal = computed(() =>
  products.value.reduce((acc, p) => acc + lineTotal(p), 0)
)

const saving = computed(() => subtotal.value - cartTotal.value)

const totalItems = computed(() =>
  products.value.reduce((acc, p) => acc + p.quantity, 0)
)

const totalProducts = computed(() => products.value.length)

export function useCart() {
  return { products, subtotal, cartTotal, saving, totalItems, totalProducts, clearCart }
}

export function clearCart(): void {
  products.value = []
}
