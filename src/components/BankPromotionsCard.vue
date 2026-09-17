<script setup lang="ts">
// Dumb renderer for the promotions of the day. The data lives in
// data/promotions.ts and already carries its own presentational classes.
import { promotionGroups } from '../data/promotions'
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
                {{ promo.name }}
              </p>
              <p class="text-[11px] text-slate-500">
                {{ promo.detail }}
              </p>
              <span
                v-if="promo.note && promo.noteStyle === 'tag'"
                class="w-fit rounded-sm bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700"
              >
                {{ promo.note }}
              </span>
              <span
                v-else-if="promo.note"
                class="text-[10px] text-slate-400"
              >
                {{ promo.note }}
              </span>
            </div>
          </div>
          <p
            class="shrink-0 pl-2  font-bold"
            :class="promo.valueClass ?? 'text-emerald-700'"
          >
            {{ promo.value }}
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
