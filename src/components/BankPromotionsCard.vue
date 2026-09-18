<script setup lang="ts">
// Dumb renderer for the promotions of the day. The data lives in
// data/promotions.ts and already carries its own presentational classes.
import { promotionGroups } from '../data/promotions'
import type { BankPromotion } from '../data/promotions'
import { useCart } from '../composables/useCart'

const { cartTotal } = useCart()

function getDiscountPercent(promo: BankPromotion): number | null {
  if (typeof promo.discountPercent === 'number')
    return promo.discountPercent
  const match = /(\d+(?:[.,]\d+)?)\s*%/.exec(promo.value ?? '')
  if (!match)
    return null
  return Number(match[1].replace(',', '.'))
}

function getCap(promo: BankPromotion): number | null {
  if (!promo.note)
    return null
  const match = /tope\s*\$\s*([\d.]+)/i.exec(promo.note)
  if (!match)
    return null
  return Number(match[1].replace(/\./g, ''))
}

function finalPrice(promo: BankPromotion): number | null {
  const percent = getDiscountPercent(promo)
  if (percent == null)
    return null
  const total = cartTotal.value
  let discount = total * (percent / 100)
  const cap = getCap(promo)
  if (cap != null)
    discount = Math.min(discount, cap)
  return Math.round(total - discount)
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
}

function displayName(promo: BankPromotion): string {
  const percent = getDiscountPercent(promo)
  if (percent == null)
    return promo.name
  const label = promo.value.includes('%') ? promo.value.trim() : `${String(percent).replace('.', ',')}%`
  return `${label} con ${promo.name}`
}

function displayValue(promo: BankPromotion): string {
  const price = finalPrice(promo)
  if (price == null)
    return promo.value
  return formatPrice(price)
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm">
    <p class="border-b border-slate-100 px-6 py-4 text-base font-bold tracking-[-0.4px] text-slate-900">
      Promociones bancarias del día
    </p>
    <div class="max-h-[395px] overflow-y-auto pb-6">
      <div
        v-for="(group, index) in promotionGroups"
        :key="group.categoryId"
        :class="index > 0 ? 'border-t border-slate-100' : ''"
      >
        <!-- <p class="bg-slate-100/80 px-6 py-1.5 text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500">
          {{ group.categoryName }} ({{ group.items.length }})
        </p> -->
        <div
          v-for="promo in group.items"
          :key="promo.id"
          class="flex items-center justify-between px-6 py-3.5"
        >
          <div class="flex items-center">
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-lg border  font-bold"
              :class="promo.badgeClass"
            >
              {{ promo.badge }}
            </div>
            <div class="flex flex-col gap-px pl-3.5">
              <p class=" font-bold text-slate-900">
                {{ displayName(promo) }}
              </p>
              <p class="text-xs text-slate-500">
                {{ promo.detail }}
              </p>
              <span
                v-if="promo.note && promo.noteStyle === 'tag'"
                class="w-fit  rounded-sm bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700"
              >
                {{ promo.note }}
              </span>
              <span
                v-else-if="promo.note"
                class="text-xs text-slate-400"
              >
                {{ promo.note }}
              </span>
            </div>
          </div>
          <p
            class="shrink-0  grid gap-1 pl-2 text-right  "
            :class="promo.valueClass ?? 'text-emerald-700'"
          >
            <span class="font-bold text-sm">{{ displayValue(promo) }}</span>
            <span class="text-xs">Total con descuento</span>
          </p>
        </div>
      </div>
    </div>
    <!-- <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
      <p class=" text-slate-600">
        Reintegros y beneficios:
      </p>
      <p class=" font-bold text-emerald-700">
        Se aplican en el resumen
      </p>
    </div> -->
  </div>
</template>
