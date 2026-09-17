/**
 * Mock bank promotions shown to the customer before choosing how to pay.
 *
 * There is no promotions backend yet, so this is the single source of truth
 * for the "Promociones bancarias del día" card. Values are illustrative.
 *
 * `badgeClass` and `valueClass` are presentational Tailwind classes kept next
 * to the data on purpose: the card is a dumb renderer and never maps an
 * institution to a colour itself.
 */

/** How a promotion note is rendered. `tag` draws a green pill. */
export type PromotionNoteStyle = 'tag'

export interface BankPromotion {
  id: number
  /** Short institution mark rendered inside the leading chip. */
  badge: string
  /** Tailwind classes colouring the chip; one colour per institution. */
  badgeClass: string
  name: string
  detail: string
  /** Optional footnote. Rendered as plain grey text unless `noteStyle` is set. */
  note?: string
  noteStyle?: PromotionNoteStyle
  /** Right-hand highlight: the discount or benefit itself. */
  value: string
  /** Numeric discount (e.g. 25 for "25%"). Used to compute the final price. */
  discountPercent?: number
  /** Overrides the default emerald colour of `value`. */
  valueClass?: string
}

export interface PromotionGroup {
  categoryId: number
  categoryName: string
  items: BankPromotion[]
}

export const promotionGroups: PromotionGroup[] = [
  {
    categoryId: 1,
    categoryName: 'Bancos',
    items: [
      {
        id: 1,
        badge: 'BN',
        badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
        name: 'Banco Nación',
        detail: 'Viernes y sábados · Tarjeta de crédito',
        note: 'Tope $15.000',
        noteStyle: 'tag',
        value: '25%',
        discountPercent: 25,
      },
      // {
      //   id: 2,
      //   badge: 'BP',
      //   badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      //   name: 'Banco Provincia',
      //   detail: 'Miércoles y jueves · Cuenta DNI',
      //   note: 'Tope $12.000',
      //   noteStyle: 'tag',
      //   value: '30%',
      // },
      // {
      //   id: 3,
      //   badge: 'GAL',
      //   badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
      //   name: 'Banco Galicia',
      //   detail: 'Todos los días · Galicia Visa',
      //   note: 'Sin tope',
      //   noteStyle: 'tag',
      //   value: '20%',
      // },
      {
        id: 4,
        badge: 'SAN',
        badgeClass: 'border-red-200 bg-red-50 text-red-700',
        name: 'Santander',
        detail: 'Martes y miércoles · Santander Río',
        note: 'Requiere registro previo',
        value: '15%',
        discountPercent: 15,
      },
      {
        id: 5,
        badge: 'BBV',
        badgeClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        name: 'BBVA',
        detail: 'Lunes y martes · Tarjeta de débito',
        value: '20%',
        discountPercent: 20,
      },
      // {
      //   id: 6,
      //   badge: 'MAC',
      //   badgeClass: 'border-violet-200 bg-violet-50 text-violet-700',
      //   name: 'Banco Macro',
      //   detail: 'Sábados · Tarjeta de crédito',
      //   note: 'Tope $8.000',
      //   noteStyle: 'tag',
      //   value: '25%',
      // },
    ],
  },
  {
    categoryId: 2,
    categoryName: 'Billeteras virtuales',
    items: [
      {
        id: 7,
        badge: 'MP',
        badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
        name: 'Mercado Pago',
        detail: 'Todos los días · Dinero en cuenta',
        value: '10%',
        discountPercent: 10,
      },
      // {
      //   id: 8,
      //   badge: 'UAL',
      //   badgeClass: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
      //   name: 'Ualá',
      //   detail: 'Jueves y viernes · Tarjeta Ualá',
      //   note: 'Tope $6.000',
      //   noteStyle: 'tag',
      //   value: '15%',
      // },
      // {
      //   id: 9,
      //   badge: 'BRU',
      //   badgeClass: 'border-teal-200 bg-teal-50 text-teal-700',
      //   name: 'Brubank',
      //   detail: 'Todos los días · Tarjeta de crédito',
      //   value: '12%',
      // },
      // {
      //   id: 10,
      //   badge: 'NX',
      //   badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
      //   name: 'Naranja X',
      //   detail: 'Lunes y martes · Tarjeta Naranja',
      //   note: 'Requiere registro previo',
      //   value: '18%',
      // },
    ],
  },
  // {
  //   categoryId: 3,
  //   categoryName: 'Tarjetas de crédito',
  //   items: [
  //     {
  //       id: 11,
  //       badge: 'VISA',
  //       badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
  //       name: 'Visa',
  //       detail: 'Cuotas sin interés desde $50.000',
  //       note: '3 cuotas',
  //       noteStyle: 'tag',
  //       value: 'Sin interés',
  //     },
  //     {
  //       id: 12,
  //       badge: 'MC',
  //       badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
  //       name: 'Mastercard',
  //       detail: 'Cuotas sin interés desde $100.000',
  //       note: '6 cuotas',
  //       noteStyle: 'tag',
  //       value: 'Sin interés',
  //     },
  //     {
  //       id: 13,
  //       badge: 'CAB',
  //       badgeClass: 'border-lime-200 bg-lime-50 text-lime-700',
  //       name: 'Cabal',
  //       detail: 'Cuotas sin interés desde $30.000',
  //       note: 'Reintegro en el resumen',
  //       value: '3 cuotas',
  //     },
  //   ],
  // },
]
