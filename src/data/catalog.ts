/**
 * Single source of truth for the store catalog.
 *
 * Price convention: `price` is the GROSS list price, before any discount.
 * `discountPercent` carries the discount, and the final price is always
 * derived through `finalPrice()`. This matches `CartProduct` in
 * composables/useCart.ts, so a discount is applied exactly once.
 *
 * Discount coverage: exactly half the catalog carries a discount
 * (30 of 60 products), spread as 2 products per aisle.
 *
 * Categories are VIEWS over this one catalog, never copies of it: every
 * category resolves its products through `Category.match`. A product can
 * therefore show up in several categories at once (Lácteos + Sin TACC +
 * Veganos) while keeping a single id, so the cart never sees the same
 * product as two different lines.
 */

export type ProductTag = 'sin-tacc' | 'vegano'

export interface Category {
  id: number
  name: string
  /** Resolves this category's products from the single catalog. */
  match: (product: Product) => boolean
}

export interface Product {
  id: number
  name: string
  categoryId: number
  /** Gross list price, before the discount. */
  price: number
  /** Active discount over `price`, as a percentage. */
  discountPercent?: number
  /** Dietary attributes that drive the derived categories. */
  tags?: ProductTag[]
}

/** An aisle: the products that physically sit together on one shelf. */
function aisle(id: number, name: string): Category {
  return { id, name, match: product => product.categoryId === id }
}

function hasTag(product: Product, tag: ProductTag): boolean {
  return product.tags?.includes(tag) ?? false
}

export const categories: Category[] = [
  // Derived views, shown first. Their ids continue the aisle ids (1..15)
  // so every product keeps its real `categoryId` untouched.
  { id: 16, name: 'Sin TACC', match: product => hasTag(product, 'sin-tacc') },
  { id: 17, name: 'Con descuentos', match: product => Boolean(product.discountPercent) },
  { id: 18, name: 'Veganos', match: product => hasTag(product, 'vegano') },
  // Aisles
  aisle(1, 'Lácteos'),
  aisle(2, 'Panadería'),
  aisle(3, 'Huevos'),
  aisle(4, 'Aceites y Vinagres'),
  aisle(5, 'Arroz y Legumbres'),
  aisle(6, 'Pastas'),
  aisle(7, 'Azúcar y Endulzantes'),
  aisle(8, 'Yerba y Café'),
  aisle(9, 'Gaseosas'),
  aisle(10, 'Aguas'),
  aisle(11, 'Cervezas y Vinos'),
  aisle(12, 'Limpieza'),
  aisle(13, 'Higiene Personal'),
  aisle(14, 'Carnes'),
  aisle(15, 'Frutas y Verduras'),
]

export const products: Product[] = [
  // Lácteos
  { id: 1, name: 'Leche entera 1L', categoryId: 1, price: 1200, discountPercent: 20, tags: ['sin-tacc'] },
  { id: 2, name: 'Leche descremada 1L', categoryId: 1, price: 1300, tags: ['sin-tacc'] },
  { id: 3, name: 'Manteca 200g', categoryId: 1, price: 2400, tags: ['sin-tacc'] },
  { id: 4, name: 'Queso cremoso 500g', categoryId: 1, price: 6800, discountPercent: 15, tags: ['sin-tacc'] },
  { id: 5, name: 'YogurNatural x4', categoryId: 1, price: 3200, tags: ['sin-tacc'] },
  { id: 6, name: 'Queso rallado 250g', categoryId: 1, price: 4500, tags: ['sin-tacc'] },
  // Panadería
  { id: 7, name: 'Pan lactal', categoryId: 2, price: 2800, discountPercent: 20 },
  { id: 8, name: 'Pan francés x12', categoryId: 2, price: 2400, tags: ['vegano'] },
  { id: 9, name: 'Medialunas x6', categoryId: 2, price: 5200, discountPercent: 25 },
  { id: 10, name: 'Facturas x6', categoryId: 2, price: 5800 },
  // Huevos
  { id: 11, name: 'Huevos x12', categoryId: 3, price: 3500, discountPercent: 20, tags: ['sin-tacc'] },
  { id: 12, name: 'Huevos x6', categoryId: 3, price: 1600, discountPercent: 15, tags: ['sin-tacc'] },
  { id: 13, name: 'Huevos blancos x12', categoryId: 3, price: 3000, tags: ['sin-tacc'] },
  // Aceites y Vinagres
  { id: 14, name: 'Aceite de oliva 500ml', categoryId: 4, price: 8500, tags: ['sin-tacc', 'vegano'] },
  { id: 15, name: 'Aceite de girasol 1L', categoryId: 4, price: 5200, discountPercent: 15, tags: ['sin-tacc', 'vegano'] },
  { id: 16, name: 'Vinagre de manzana 500ml', categoryId: 4, price: 3800, tags: ['sin-tacc', 'vegano'] },
  { id: 17, name: 'Aceite de maíz 1L', categoryId: 4, price: 5600, discountPercent: 10, tags: ['sin-tacc', 'vegano'] },
  // Arroz y Legumbres
  { id: 18, name: 'Arroz 1kg', categoryId: 5, price: 1600, discountPercent: 20, tags: ['sin-tacc', 'vegano'] },
  { id: 19, name: 'Frijoles 500g', categoryId: 5, price: 2200, tags: ['sin-tacc', 'vegano'] },
  { id: 20, name: 'Lentejas 500g', categoryId: 5, price: 2100, discountPercent: 15, tags: ['sin-tacc', 'vegano'] },
  { id: 21, name: 'Garbanzos 500g', categoryId: 5, price: 3400, tags: ['sin-tacc', 'vegano'] },
  // Pastas
  { id: 22, name: 'Fideos 500g', categoryId: 6, price: 1400, discountPercent: 25, tags: ['vegano'] },
  { id: 23, name: 'Spaghetti 500g', categoryId: 6, price: 1500, tags: ['vegano'] },
  { id: 24, name: 'Ñoquis 500g', categoryId: 6, price: 2800 },
  { id: 25, name: 'Ravioles 500g', categoryId: 6, price: 4200, discountPercent: 15 },
  // Azúcar y Endulzantes
  { id: 26, name: 'Azúcar 1kg', categoryId: 7, price: 1800, discountPercent: 20, tags: ['sin-tacc', 'vegano'] },
  { id: 27, name: 'Endulzante x100', categoryId: 7, price: 1200, tags: ['sin-tacc', 'vegano'] },
  { id: 28, name: 'Miel 500g', categoryId: 7, price: 12500, discountPercent: 10, tags: ['sin-tacc'] },
  // Yerba y Café
  { id: 29, name: 'Yerba mate 500g', categoryId: 8, price: 4200, discountPercent: 20, tags: ['sin-tacc', 'vegano'] },
  { id: 30, name: 'Café molido 250g', categoryId: 8, price: 7500, discountPercent: 15, tags: ['sin-tacc', 'vegano'] },
  { id: 31, name: 'Café instantáneo 100g', categoryId: 8, price: 8200, tags: ['sin-tacc', 'vegano'] },
  { id: 32, name: 'Té negro x24', categoryId: 8, price: 2100, tags: ['sin-tacc', 'vegano'] },
  // Gaseosas
  { id: 33, name: 'Gaseosa 2.25L', categoryId: 9, price: 3200, discountPercent: 25, tags: ['sin-tacc', 'vegano'] },
  { id: 34, name: 'Gaseosa 500ml', categoryId: 9, price: 1600, tags: ['sin-tacc', 'vegano'] },
  { id: 35, name: 'Jugo en polvo x10', categoryId: 9, price: 1800, discountPercent: 15, tags: ['sin-tacc', 'vegano'] },
  { id: 36, name: 'Agua saborizada 500ml', categoryId: 9, price: 1400, tags: ['sin-tacc', 'vegano'] },
  // Aguas
  { id: 37, name: 'Agua mineral 2L', categoryId: 10, price: 1100, discountPercent: 20, tags: ['sin-tacc', 'vegano'] },
  { id: 38, name: 'Agua mineral 500ml', categoryId: 10, price: 800, discountPercent: 10, tags: ['sin-tacc', 'vegano'] },
  { id: 39, name: 'Agua saborizada 1L', categoryId: 10, price: 1900, tags: ['sin-tacc', 'vegano'] },
  // Cervezas y Vinos
  { id: 40, name: 'Cerveza x6', categoryId: 11, price: 5800, discountPercent: 20, tags: ['vegano'] },
  { id: 41, name: 'Cerveza artesanal x3', categoryId: 11, price: 4200, tags: ['vegano'] },
  { id: 42, name: 'Vino tinto 750ml', categoryId: 11, price: 6500, tags: ['sin-tacc', 'vegano'] },
  { id: 43, name: 'Vino blanco 750ml', categoryId: 11, price: 5800, discountPercent: 25, tags: ['sin-tacc', 'vegano'] },
  // Limpieza
  { id: 44, name: 'Detergente 1L', categoryId: 12, price: 3800, discountPercent: 25 },
  { id: 45, name: 'Lavandina 1L', categoryId: 12, price: 1200 },
  { id: 46, name: 'Jabón en polvo 800g', categoryId: 12, price: 4200, discountPercent: 20 },
  { id: 47, name: 'Esponjas x3', categoryId: 12, price: 1500 },
  // Higiene Personal
  { id: 48, name: 'Jabón en barra', categoryId: 13, price: 900, discountPercent: 15 },
  { id: 49, name: 'Shampoo 400ml', categoryId: 13, price: 5200 },
  { id: 50, name: 'Pasta dental 90g', categoryId: 13, price: 3400 },
  { id: 51, name: 'Papel higiene x4', categoryId: 13, price: 4500, discountPercent: 20 },
  // Carnes
  { id: 52, name: 'Bondiola 1kg', categoryId: 14, price: 12000, discountPercent: 20, tags: ['sin-tacc'] },
  { id: 53, name: 'Pechuga de pollo 1kg', categoryId: 14, price: 7200, tags: ['sin-tacc'] },
  { id: 54, name: 'Carne picada 1kg', categoryId: 14, price: 8400, discountPercent: 15, tags: ['sin-tacc'] },
  { id: 55, name: 'Chorizo x6', categoryId: 14, price: 5600, tags: ['sin-tacc'] },
  // Frutas y Verduras
  { id: 56, name: 'Banana 1kg', categoryId: 15, price: 1500, discountPercent: 15, tags: ['sin-tacc', 'vegano'] },
  { id: 57, name: 'Manzana 1kg', categoryId: 15, price: 2200, discountPercent: 10, tags: ['sin-tacc', 'vegano'] },
  { id: 58, name: 'Tomate 1kg', categoryId: 15, price: 1800, tags: ['sin-tacc', 'vegano'] },
  { id: 59, name: 'Cebolla 1kg', categoryId: 15, price: 1200, tags: ['sin-tacc', 'vegano'] },
  { id: 60, name: 'Papa 1kg', categoryId: 15, price: 1600, tags: ['sin-tacc', 'vegano'] },
]

/** The products of one category, resolved from the single catalog. */
export function productsOf(category: Category): Product[] {
  return products.filter(category.match)
}

/** Price the customer actually pays per unit, with the discount applied once. */
export function finalPrice(product: Product): number {
  if (!product.discountPercent)
    return product.price
  return Math.round(product.price * (1 - product.discountPercent / 100))
}

export function findProduct(id: number): Product | undefined {
  return products.find(p => p.id === id)
}
