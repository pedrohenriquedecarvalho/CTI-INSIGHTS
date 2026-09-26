<script setup>
import { computed } from 'vue'
import NavSidebar from '@/components/sidebar.vue'

// =====================================================
// DADOS (mock — troque pelos dados reais da store depois)
// =====================================================
const kpis = [
  { label: 'Clientes CTI ativos', value: 164, delta: '+12 este mês' },
  { label: 'Consultores responsáveis', value: 11, delta: '3 carteiras abertas' },
  { label: 'Clientes nível A', value: 63, delta: '38,4% da base' },
  { label: 'Serviços contratados', value: 312, delta: '+21 no mês' },
]

const evolucao = {
  meses: ['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'],
  carteira: [48, 55, 51, 58, 60, 64],
  meta: [40, 42, 44, 46, 48, 50],
}

const niveis = [
  { nome: 'Nível A', valor: 63, cor: '#6d5bf8' },
  { nome: 'Nível B', valor: 70, cor: '#38bdf8' },
  { nome: 'Nível C', valor: 31, cor: '#f59e0b' },
]

const totalNiveis = computed(() => niveis.reduce((soma, n) => soma + n.valor, 0))

const segmentos = [
  { nome: 'Indústria', a: 28, b: 21, c: 9 },
  { nome: 'Comércio', a: 22, b: 18, c: 7 },
  { nome: 'Serviços', a: 11, b: 18, c: 10 },
  { nome: 'Saúde', a: 6, b: 19, c: 6 },
  { nome: 'Educação', a: 2, b: 9, c: 3 },
  { nome: 'Outros', a: 0, b: 5, c: 4 },
]

const totalGeral = computed(() =>
  segmentos.reduce((soma, s) => soma + s.a + s.b + s.c, 0)
)

function maiorLinha(s) {
  return Math.max(s.a, s.b, s.c, 1)
}

// =====================================================
// GEOMETRIA DO DONUT (SVG)
// =====================================================
const raio = 52
const circunferencia = 2 * Math.PI * raio

const donutSegmentos = computed(() => {
  let acumulado = 0
  return niveis.map((n) => {
    const fracao = n.valor / totalNiveis.value
    const comprimento = fracao * circunferencia
    const offset = -acumulado * circunferencia
    acumulado += fracao
    return { ...n, comprimento, offset }
  })
})

// =====================================================
// GEOMETRIA DA LINHA (SVG)
// =====================================================
function pontos(serie) {
  const max = Math.max(...evolucao.carteira, ...evolucao.meta)
  const min = Math.min(...evolucao.carteira, ...evolucao.meta)
  const largura = 100
  const altura = 100
  return serie
    .map((v, i) => {
      const x = (i / (serie.length - 1)) * largura
      const y = altura - ((v - min) / (max - min)) * altura
      return `${x},${y}`
    })
    .join(' ')
}
</script>

<template>
<div class="min-h-screen bg-[#070a17] text-slate-100 flex">

    <NavSidebar />

    <div class="flex-1 pt-16 md:pt-0">
<div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

      <!-- ================================================= -->
<!-- CABEÇALHO                                         -->
<!-- ================================================= -->

      <header class="mb-6">
<h1 class="text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
<p class="mt-1 text-sm text-slate-400">
          Base de clientes Provedor CTI — Agosto 2026
</p>
</header>

      <!-- ================================================= -->
<!-- KPIs                                              -->
<!-- ================================================= -->

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
<article
          v-for="kpi in kpis"
          :key="kpi.label"
          class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5"
>
<p class="text-sm text-slate-400">{{ kpi.label }}</p>
<p class="mt-2 text-3xl font-bold text-white">{{ kpi.value }}</p>
<p class="mt-2 text-xs font-medium text-indigo-400">{{ kpi.delta }}</p>
</article>
</section>

      <!-- ================================================= -->
<!-- EVOLUÇÃO + DISTRIBUIÇÃO POR NÍVEL                 -->
<!-- ================================================= -->

      <section class="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">

        <!-- EVOLUÇÃO DA CARTEIRA -->
<article class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5 sm:p-6">
<div class="flex items-center justify-between">
<div>
<h2 class="font-bold text-white">Evolução da carteira</h2>
<p class="text-xs text-slate-400">Clientes A, B e C por mês</p>
</div>
<div class="flex items-center gap-4 text-xs text-slate-400">
<span class="flex items-center gap-1.5">
<span class="h-2 w-2 rounded-full bg-indigo-400"></span>
                Carteira
</span>
<span class="flex items-center gap-1.5">
<span class="h-2 w-2 rounded-full bg-amber-400"></span>
                Meta
</span>
</div>
</div>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="mt-6 h-48 w-full">
<polyline
              :points="pontos(evolucao.carteira)"
              fill="none"
              stroke="#6d5bf8"
              stroke-width="1.5"
              vector-effect="non-scaling-stroke"
            />
<polyline
              :points="pontos(evolucao.meta)"
              fill="none"
              stroke="#fbbf24"
              stroke-width="1.5"
              vector-effect="non-scaling-stroke"
            />
</svg>

          <div class="mt-2 flex justify-between text-xs text-slate-500">
<span v-for="mes in evolucao.meses" :key="mes">{{ mes }}</span>
</div>
</article>

        <!-- DISTRIBUIÇÃO POR NÍVEL -->
<article class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5 sm:p-6">
<h2 class="font-bold text-white">Distribuição por nível</h2>

          <div class="mt-4 flex justify-center">
<svg viewBox="0 0 120 120" class="h-32 w-32 -rotate-90">
<circle
                v-for="seg in donutSegmentos"
                :key="seg.nome"
                cx="60"
                cy="60"
                :r="raio"
                fill="none"
                :stroke="seg.cor"
                stroke-width="14"
                :stroke-dasharray="`${seg.comprimento} ${circunferencia}`"
                :stroke-dashoffset="seg.offset"
              />
</svg>
</div>

          <ul class="mt-4 space-y-3">
<li
              v-for="n in niveis"
              :key="n.nome"
              class="flex items-center justify-between text-sm"
>
<span class="flex items-center gap-2 text-slate-300">
<span class="h-2 w-2 rounded-full" :style="{ backgroundColor: n.cor }"></span>
                {{ n.nome }}
</span>
<span class="font-semibold text-white">{{ n.valor }}</span>
</li>
</ul>
</article>

      </section>

      <!-- ================================================= -->
<!-- CLIENTES POR SEGMENTO                             -->
<!-- ================================================= -->

      <section class="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">

        <article class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5 sm:p-6">
<h2 class="font-bold text-white">Clientes por segmento</h2>

          <div class="mt-6 space-y-4">
<div v-for="s in segmentos" :key="s.nome">
<p class="mb-1 text-xs text-slate-400">{{ s.nome }}</p>
<div class="flex h-3 w-full overflow-hidden rounded-full bg-[#070a17]">
<div
                  class="bg-indigo-400"
                  :style="{ width: (s.a / maiorLinha(s)) * 33.33 + '%' }"
></div>
<div
                  class="bg-sky-400"
                  :style="{ width: (s.b / maiorLinha(s)) * 33.33 + '%' }"
></div>
<div
                  class="bg-amber-400"
                  :style="{ width: (s.c / maiorLinha(s)) * 33.33 + '%' }"
></div>
</div>
</div>
</div>

          <div class="mt-5 flex items-center gap-4 text-xs text-slate-400">
<span class="flex items-center gap-1.5">
<span class="h-2 w-2 rounded-full bg-indigo-400"></span> Nível A
</span>
<span class="flex items-center gap-1.5">
<span class="h-2 w-2 rounded-full bg-sky-400"></span> Nível B
</span>
<span class="flex items-center gap-1.5">
<span class="h-2 w-2 rounded-full bg-amber-400"></span> Nível C
</span>
</div>
</article>

        <!-- PARTICIPAÇÃO POR SEGMENTO -->
<article class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5 sm:p-6">
<h2 class="font-bold text-white">Participação por segmento</h2>

          <ul class="mt-5 space-y-4">
<li v-for="s in segmentos" :key="s.nome">
<div class="flex justify-between text-sm">
<span class="text-slate-300">{{ s.nome }}</span>
<span class="font-semibold text-white">
                  {{ (((s.a + s.b + s.c) / totalGeral) * 100).toFixed(1) }}%
</span>
</div>
<div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#070a17]">
<div
                  class="h-full rounded-full bg-indigo-400"
                  :style="{ width: ((s.a + s.b + s.c) / totalGeral) * 100 + '%' }"
></div>
</div>
</li>
</ul>
</article>

      </section>

      <!-- ================================================= -->
<!-- MATRIZ SEGMENTO x NÍVEL                          -->
<!-- ================================================= -->

      <section class="mt-6 overflow-hidden rounded-2xl border border-indigo-500/10 bg-[#0e1226]">
<header class="border-b border-indigo-500/10 p-4 sm:p-5">
<h2 class="font-bold text-white">Matriz segmento x nível</h2>
</header>

        <div class="overflow-x-auto">
<table class="min-w-full text-sm">
<thead class="bg-[#070a17]">
<tr>
<th class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Segmento</th>
<th class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Nível A</th>
<th class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Nível B</th>
<th class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Nível C</th>
<th class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Total</th>
<th class="whitespace-nowrap px-4 py-3 text-left font-semibold text-white">% da base</th>
</tr>
</thead>
<tbody>
<tr v-for="s in segmentos" :key="s.nome" class="border-t border-indigo-500/10">
<td class="whitespace-nowrap px-4 py-3 font-semibold text-white">{{ s.nome }}</td>
<td class="whitespace-nowrap px-4 py-3 text-slate-300">{{ s.a }}</td>
<td class="whitespace-nowrap px-4 py-3 text-slate-300">{{ s.b }}</td>
<td class="whitespace-nowrap px-4 py-3 text-slate-300">{{ s.c }}</td>
<td class="whitespace-nowrap px-4 py-3 font-semibold text-white">{{ s.a + s.b + s.c }}</td>
<td class="whitespace-nowrap px-4 py-3 text-indigo-400">
                  {{ (((s.a + s.b + s.c) / totalGeral) * 100).toFixed(1) }}%
</td>
</tr>
<tr class="border-t border-indigo-500/20 bg-[#070a17]">
<td class="whitespace-nowrap px-4 py-3 font-bold text-white">Total</td>
<td class="whitespace-nowrap px-4 py-3 font-bold text-white">
                  {{ segmentos.reduce((s, x) => s + x.a, 0) }}
</td>
<td class="whitespace-nowrap px-4 py-3 font-bold text-white">
                  {{ segmentos.reduce((s, x) => s + x.b, 0) }}
</td>
<td class="whitespace-nowrap px-4 py-3 font-bold text-white">
                  {{ segmentos.reduce((s, x) => s + x.c, 0) }}
</td>
<td class="whitespace-nowrap px-4 py-3 font-bold text-white">{{ totalGeral }}</td>
<td class="whitespace-nowrap px-4 py-3 font-bold text-indigo-400">100%</td>
</tr>
</tbody>
</table>
</div>
</section>

    </div>
</div>
</div>
</template>