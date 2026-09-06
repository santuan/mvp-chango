import { ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useCart } from './useCart'
import type { CartProduct } from './useCart'

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

const scanCatalog: CartProduct[] = [
  { id: 1, name: 'Leche entera 1L', unitPrice: 1200, quantity: 0 },
  { id: 2, name: 'Pan lactal', unitPrice: 2800, quantity: 0 },
  { id: 3, name: 'Huevos x12', unitPrice: 3500, quantity: 0, discountPercent: 20 },
  { id: 4, name: 'Aceite de oliva 500ml', unitPrice: 8500, quantity: 0 },
  { id: 5, name: 'Arroz 1kg', unitPrice: 1600, quantity: 0 },
  { id: 6, name: 'Fideos 500g', unitPrice: 1400, quantity: 0 },
  { id: 7, name: 'Azúcar 1kg', unitPrice: 1800, quantity: 0 },
  { id: 8, name: 'Yerba mate 500g', unitPrice: 4200, quantity: 0, discountPercent: 20 },
  { id: 9, name: 'Café molido 250g', unitPrice: 7500, quantity: 0 },
  { id: 10, name: 'Gaseosa 2.25L', unitPrice: 3200, quantity: 0 },
  { id: 11, name: 'Agua mineral 2L', unitPrice: 1100, quantity: 0 },
  { id: 12, name: 'Cerveza x6', unitPrice: 5800, quantity: 0, discountPercent: 20 },
  { id: 13, name: 'Jabón en barra', unitPrice: 900, quantity: 0 },
  { id: 14, name: 'Papel higiene x4', unitPrice: 4500, quantity: 0 },
  { id: 15, name: 'Detergente 1L', unitPrice: 3800, quantity: 0 },
  { id: 16, name: 'Shampoo 400ml', unitPrice: 5200, quantity: 0 },
  { id: 17, name: 'Manteca 200g', unitPrice: 2400, quantity: 0 },
  { id: 18, name: 'Queso cremoso 500g', unitPrice: 6800, quantity: 0 },
  { id: 19, name: 'Bondiola 1kg', unitPrice: 12000, quantity: 0, discountPercent: 20 },
  { id: 20, name: 'Banana 1kg', unitPrice: 1500, quantity: 0 }
]

const scanIndex = ref(0)
const scanRemoveIndex = ref(0)

export function useCartModals() {
  const { products } = useCart()
  const toast = useToast()

  function openScan(mode: 'add' | 'remove'): void {
    scanMode.value = mode
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
    const item = scanCatalog[scanIndex.value % scanCatalog.length]
    scanIndex.value += 1
    selectedProduct.value = { ...item }
    modalQty.value = 1
    addModalOpen.value = true
  }

  function confirmAdd(): void {
    if (!selectedProduct.value) {
      addModalOpen.value = false
      return
    }
    const existing = products.value.find(p => p.id === selectedProduct.value?.id)
    if (existing)
      existing.quantity += modalQty.value
    else
      products.value.unshift({ ...selectedProduct.value, quantity: modalQty.value })
    addModalOpen.value = false
    justAddedId.value = selectedProduct.value.id
    toast.add({
      title: 'Producto agregado al carrito',
      description: `${selectedProduct.value.name} · x${modalQty.value}`,
      color: 'success',
      icon: 'i-lucide-shopping-cart'
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
      icon: 'i-lucide-trash-2'
    })
  }

  function increaseQty(): void {
    modalQty.value += 1
  }

  function decreaseQty(): void {
    if (modalQty.value > 0)
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
    openScan,
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
