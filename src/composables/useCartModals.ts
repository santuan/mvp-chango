import { ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useCart } from './useCart'
import type { CartProduct } from './useCart'
import { products as catalog } from '../data/catalog'
import type { Product } from '../data/catalog'

const scanModalOpen = ref(false)
const addModalOpen = ref(false)
const removeModalOpen = ref(false)
const checkoutModalOpen = ref(false)
const assistanceModalOpen = ref(false)
const assistanceCalling = ref(false)
const selectedProduct = ref<CartProduct | null>(null)
const modalQty = ref(1)
const scanMode = ref<'add' | 'remove'>('add')
const justAddedId = ref<number | null>(null)
const guidedProduct = ref<CartProduct | null>(null)

const scanRemoveIndex = ref(0)

// Scanning walks a shuffled copy of the catalog instead of going aisle by aisle.
// A full pass always drains before the next shuffle, so the sequence reads as
// random and no item repeats within a pass — a plain Math.random() pick would
// repeat constantly.
let scanBag: Product[] = []
let scanBagCursor = 0

function shuffledCatalog(): Product[] {
  const bag = [...catalog]
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const picked = bag[j]
    bag[j] = bag[i]
    bag[i] = picked
  }
  return bag
}

function nextScanProduct(): Product {
  if (scanBagCursor >= scanBag.length) {
    scanBag = shuffledCatalog()
    scanBagCursor = 0
  }
  const product = scanBag[scanBagCursor]
  scanBagCursor += 1
  return product
}

// The shared catalog stores the gross list price; the cart works with
// unitPrice + discountPercent. This is the single conversion point.
function toCartProduct(product: Product): CartProduct {
  return {
    id: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity: 0,
    discountPercent: product.discountPercent
  }
}

export function useCartModals() {
  const { products } = useCart()
  const toast = useToast()

  function openScan(mode: 'add' | 'remove'): void {
    scanMode.value = mode
    guidedProduct.value = null
    scanModalOpen.value = true
  }

  function openGuidedScan(product: Product): void {
    scanMode.value = 'add'
    guidedProduct.value = toCartProduct(product)
    scanModalOpen.value = true
  }

  function simulateScan(): void {
    scanModalOpen.value = false
    if (scanMode.value === 'remove') {
      if (products.value.length === 0)
        return
      const item = products.value[scanRemoveIndex.value % products.value.length]
      scanRemoveIndex.value += 1
      openRemove(item)
      return
    }
    // `??` short-circuits, so the shuffled bag only advances on a real scan.
    const item = guidedProduct.value ?? toCartProduct(nextScanProduct())
    selectedProduct.value = { ...item }
    modalQty.value = 1
    addModalOpen.value = true
  }

  function confirmAdd(): void {
    if (!selectedProduct.value) {
      addModalOpen.value = false
      return
    }
    const qty = Math.max(1, Math.floor(modalQty.value) || 1)
    const existing = products.value.find(p => p.id === selectedProduct.value?.id)
    if (existing)
      existing.quantity += qty
    else
      products.value.unshift({ ...selectedProduct.value, quantity: qty })
    addModalOpen.value = false
    justAddedId.value = selectedProduct.value.id
    toast.add({
      title: 'Producto agregado al carrito',
      description: `${selectedProduct.value.name} · x${qty}`,
      color: 'success',
      icon: 'i-lucide-shopping-cart',
      duration: 3000,
      progress: false
    })
    setTimeout(() => { justAddedId.value = null }, 1500)
  }

  function openRemove(product: CartProduct): void {
    selectedProduct.value = product
    modalQty.value = product.quantity
    removeModalOpen.value = true
  }

  function confirmRemove(): void {
    if (!selectedProduct.value)
      return
    const removedName = selectedProduct.value.name
    products.value = products.value.filter(p => p.id !== selectedProduct.value?.id)
    removeModalOpen.value = false
    toast.add({
      title: 'Producto eliminado del carrito',
      description: removedName,
      color: 'error',
      icon: 'i-lucide-trash-2',
      duration: 3000,
      progress: false
    })
  }

  function increaseQty(): void {
    modalQty.value += 1
  }

  function decreaseQty(): void {
    if (modalQty.value > 1)
      modalQty.value -= 1
  }

  function openAssistance(): void {
    assistanceCalling.value = false
    assistanceModalOpen.value = true
  }

  function callAssistance(): void {
    assistanceCalling.value = true
  }

  function cancelAssistance(): void {
    assistanceModalOpen.value = false
  }

  return {
    scanModalOpen,
    addModalOpen,
    removeModalOpen,
    checkoutModalOpen,
    assistanceModalOpen,
    assistanceCalling,
    selectedProduct,
    modalQty,
    scanMode,
    justAddedId,
    guidedProduct,
    openScan,
    openGuidedScan,
    simulateScan,
    confirmAdd,
    openRemove,
    confirmRemove,
    increaseQty,
    decreaseQty,
    openAssistance,
    callAssistance,
    cancelAssistance
  }
}
