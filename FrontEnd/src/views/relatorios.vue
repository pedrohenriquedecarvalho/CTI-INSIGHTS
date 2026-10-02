<script setup>
import { computed } from 'vue'
import { useUploadStore } from '../stores/uploadStore'
import NavSidebar from '@/components/sidebar.vue'

const store = useUploadStore()

// =====================================================
// FORMATA DATA E HORA DO UPLOAD
// =====================================================
const dataUploadFormatada = computed(() => {
  if (!store.dataUpload) {
    return 'Não informado'
  }

  return new Date(store.dataUpload).toLocaleString('pt-BR')
})

// =====================================================
// PERCENTUAIS
// =====================================================
const percentualValidas = computed(() => {
  if (!store.totalLinhas) return 0
  return (store.totalValidas / store.totalLinhas) * 100
})

const percentualErros = computed(() => {
  if (!store.totalLinhas) return 0
  return (store.totalComErro / store.totalLinhas) * 100
})

const formatarPercentual = (valor) => valor.toFixed(1).replace('.', ',') + '%'

// =====================================================
// CARDS DE RESUMO
// =====================================================
const kpis = computed(() => [
  {
    label: 'Linhas carregadas',
    value: store.totalLinhas,
    detalhe: `${store.totalColunas} colunas`,
    cor: 'text-indigo-400',
  },
  {
    label: 'Registros válidos',
    value: store.totalValidas,
    detalhe: formatarPercentual(percentualValidas.value) + ' do total',
    cor: 'text-emerald-400',
  },
  {
    label: 'Registros com erro',
    value: store.totalComErro,
    detalhe: formatarPercentual(percentualErros.value) + ' do total',
    cor: store.totalComErro > 0 ? 'text-amber-400' : 'text-slate-500',
  },
  {
    label: 'Problemas encontrados',
    value: store.totalErros,
    detalhe: 'Uma linha pode ter vários',
    cor: 'text-slate-500',
  },
])

// =====================================================
// RESUMO POR TIPO DE ERRO
// (e-mail só aparece se a planilha tiver coluna de e-mail com problemas)
// =====================================================
const tiposExibidos = computed(() =>
  store.resumoPorTipo.filter(
    (item) => item.tipo !== 'email_invalido' || item.quantidade > 0
  )
)

const estiloPorTipo = {
  vazio: { badge: 'bg-amber-500/10 text-amber-300 ring-amber-400/20', barra: 'bg-amber-400' },
  duplicado: { badge: 'bg-rose-500/10 text-rose-300 ring-rose-400/20', barra: 'bg-rose-400' },
  fora_do_padrao: { badge: 'bg-sky-500/10 text-sky-300 ring-sky-400/20', barra: 'bg-sky-400' },
  email_invalido: { badge: 'bg-violet-500/10 text-violet-300 ring-violet-400/20', barra: 'bg-violet-400' },
}

function larguraBarra(quantidade) {
  if (!store.totalErros) return '0%'
  return (quantidade / store.totalErros) * 100 + '%'
}
</script>

<template>
  <div class="min-h-screen bg-[#070a17] text-slate-100 flex">

    <NavSidebar />

    <div class="min-w-0 flex-1 pt-16 md:pt-0">
      <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        <!-- ================================================= -->
        <!-- CABEÇALHO                                         -->
        <!-- ================================================= -->

        <header class="mb-6">
          <h1 class="text-2xl font-bold text-white sm:text-3xl">Relatório</h1>
          <p class="mt-1 text-sm text-slate-400">
            Resumo da validação e problemas encontrados na planilha.
          </p>
        </header>

        <!-- ================================================= -->
        <!-- SEM PLANILHA                                      -->
        <!-- ================================================= -->

        <section
          v-if="!store.totalLinhas"
          aria-label="Nenhuma planilha carregada"
          class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-6"
        >
          <p class="font-semibold text-white">Nenhuma planilha carregada.</p>
          <p class="mt-1 text-sm text-slate-400">
            Faça primeiro o upload de uma planilha para gerar o relatório.
          </p>
        </section>

        <!-- ================================================= -->
        <!-- RELATÓRIO                                         -->
        <!-- ================================================= -->

        <template v-else>

          <!-- INFORMAÇÕES DO PROCESSAMENTO -->
          <article class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5 sm:p-6">
            <h2 class="font-bold text-white">Informações do processamento</h2>

            <dl class="mt-4 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-indigo-500/10 bg-[#070a17] p-4">
                <dt class="text-sm text-slate-400">Arquivo analisado</dt>
                <dd class="mt-1 break-all font-semibold text-white">
                  {{ store.arquivo?.name || 'Não informado' }}
                </dd>
              </div>

              <div class="rounded-xl border border-indigo-500/10 bg-[#070a17] p-4">
                <dt class="text-sm text-slate-400">Data e hora do upload</dt>
                <dd class="mt-1 font-semibold text-white">
                  {{ dataUploadFormatada }}
                </dd>
              </div>
            </dl>
          </article>

          <!-- RESUMO -->
          <section aria-label="Resumo da validação" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article
              v-for="kpi in kpis"
              :key="kpi.label"
              class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5"
            >
              <p class="text-sm text-slate-400">{{ kpi.label }}</p>
              <p class="mt-2 text-3xl font-bold text-white">{{ kpi.value }}</p>
              <p class="mt-2 text-xs font-medium" :class="kpi.cor">{{ kpi.detalhe }}</p>
            </article>
          </section>

          <!-- SITUAÇÃO GERAL -->
          <section class="mt-6 rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5 sm:p-6">
            <div class="flex items-center justify-between gap-4">
              <h2 class="font-bold text-white">
                {{
                  store.totalComErro === 0
                    ? 'Planilha validada sem erros'
                    : 'Foram encontrados erros na planilha'
                }}
              </h2>
              <span class="shrink-0 text-sm font-semibold text-emerald-400">
                {{ formatarPercentual(percentualValidas) }} válidos
              </span>
            </div>

            <div class="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-[#070a17]">
              <div class="bg-emerald-400" :style="{ width: percentualValidas + '%' }"></div>
              <div class="bg-amber-400" :style="{ width: percentualErros + '%' }"></div>
            </div>

            <div class="mt-3 flex items-center gap-4 text-xs text-slate-400">
              <span class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-emerald-400"></span> Válidos
              </span>
              <span class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-amber-400"></span> Com erro
              </span>
            </div>

            <p class="mt-4 text-sm leading-6 text-slate-400">
              {{
                store.totalComErro === 0
                  ? 'Todos os registros passaram pelas validações realizadas.'
                  : 'Existem registros que precisam ser analisados e corrigidos.'
              }}
            </p>
          </section>

          <!-- ================================================= -->
          <!-- RESUMO POR TIPO DE ERRO                           -->
          <!-- ================================================= -->

          <section
            aria-labelledby="titulo-resumo-tipos"
            class="mt-6 overflow-hidden rounded-2xl border border-indigo-500/10 bg-[#0e1226]"
          >
            <header class="border-b border-indigo-500/10 p-4 sm:p-5">
              <h2 id="titulo-resumo-tipos" class="font-bold text-white">Validações realizadas</h2>
              <p class="mt-1 text-xs text-slate-400">Quantidade de problemas encontrados por tipo.</p>
            </header>

            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-[#070a17]">
                  <tr>
                    <th scope="col" class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Validação realizada</th>
                    <th scope="col" class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Quantidade</th>
                    <th scope="col" class="w-1/2 px-4 py-3 text-left font-semibold text-slate-300">
                      <span class="sr-only">Proporção</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="item in tiposExibidos"
                    :key="item.tipo"
                    class="border-t border-indigo-500/10"
                  >
                    <td class="whitespace-nowrap px-4 py-3 text-slate-300">{{ item.nome }}</td>
                    <td class="whitespace-nowrap px-4 py-3 font-semibold text-white">{{ item.quantidade }}</td>
                    <td class="px-4 py-3">
                      <div class="h-1.5 w-full overflow-hidden rounded-full bg-[#070a17]">
                        <div
                          class="h-full rounded-full"
                          :class="estiloPorTipo[item.tipo].barra"
                          :style="{ width: larguraBarra(item.quantidade) }"
                        ></div>
                      </div>
                    </td>
                  </tr>

                  <tr class="border-t border-indigo-500/20 bg-[#070a17]">
                    <td class="whitespace-nowrap px-4 py-3 font-bold text-white">Registros válidos</td>
                    <td class="whitespace-nowrap px-4 py-3 font-bold text-emerald-400">{{ store.totalValidas }}</td>
                    <td class="px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- ================================================= -->
          <!-- DETALHAMENTO DOS ERROS                            -->
          <!-- ================================================= -->

          <section
            v-if="store.totalErros > 0"
            aria-labelledby="titulo-erros"
            class="mt-6 overflow-hidden rounded-2xl border border-indigo-500/10 bg-[#0e1226]"
          >
            <header class="border-b border-indigo-500/10 p-4 sm:p-5">
              <h2 id="titulo-erros" class="font-bold text-white">Detalhamento dos erros</h2>
              <p class="mt-1 text-xs text-slate-400">
                Linha da planilha, campo e descrição de cada problema encontrado.
              </p>
            </header>

            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">

                <thead class="bg-[#070a17]">
                  <tr>
                    <th scope="col" class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Linha</th>
                    <th scope="col" class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Código</th>
                    <th scope="col" class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Cliente</th>
                    <th scope="col" class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Campo</th>
                    <th scope="col" class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-300">Tipo</th>
                    <th scope="col" class="min-w-[320px] px-4 py-3 text-left font-semibold text-white">Descrição do erro</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(erro, indice) in store.errosDetalhados"
                    :key="`${erro.numero_linha}-${erro.campo}-${indice}`"
                    class="border-t border-indigo-500/10"
                  >
                    <td class="whitespace-nowrap px-4 py-3 text-slate-300">{{ erro.numero_linha }}</td>
                    <td class="whitespace-nowrap px-4 py-3 font-semibold text-white">{{ erro.codigo_cliente || '-' }}</td>
                    <td class="whitespace-nowrap px-4 py-3 text-slate-300">{{ erro.nome_cliente || '-' }}</td>
                    <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-300">{{ erro.campo }}</td>
                    <td class="whitespace-nowrap px-4 py-3">
                      <span
                        class="rounded-full px-2.5 py-1 text-xs font-medium ring-1"
                        :class="estiloPorTipo[erro.tipo].badge"
                      >
                        {{ erro.tipoNome }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-slate-300">{{ erro.mensagem }}</td>
                  </tr>
                </tbody>

              </table>
            </div>
          </section>

        </template>

      </div>
    </div>
  </div>
</template>