<script setup>
import { ref, computed } from 'vue'
import { useUploadStore } from '../stores/uploadStore'
import NavSidebar from '@/components/sidebar.vue'

const store = useUploadStore()

const isDragging = ref(false)
const fileInput = ref(null)

// =====================================================
// ETAPAS DO PROCESSO
// =====================================================
const steps = [
  {
    number: 1,
    title: 'Envie o arquivo',
    description: 'Arraste a planilha para o campo acima ou clique em selecionar arquivo.',
  },
  {
    number: 2,
    title: 'Processamento dos dados',
    description: 'Validamos e tratamos todos os registros enviados na planilha.',
  },
  {
    number: 3,
    title: 'Dashboard pronto',
    description: 'Geramos os gráficos e indicadores com os dados validados.',
  },
]

const formatos = ['XLSX', 'XLS', 'CSV']

// =====================================================
// SELECIONAR ARQUIVO
// =====================================================
function triggerFileInput() {
  fileInput.value?.click()
}

async function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (file) {
    await store.lerArquivo(file)
  }
}

// =====================================================
// SOLTAR ARQUIVO (drag and drop)
// =====================================================
async function onDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await store.lerArquivo(file)
  }
}

// =====================================================
// LIMPAR (também zera o input, para permitir reenviar o mesmo arquivo)
// =====================================================
function limpar() {
  store.limpar()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// =====================================================
// DATA E HORA DO UPLOAD
// =====================================================
const dataUploadFormatada = computed(() => {
  if (!store.dataUpload) {
    return ''
  }

  return new Date(store.dataUpload).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const temResultado = computed(() => store.dadosTratados.length > 0)

// =====================================================
// PERCENTUAIS E STATUS
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

const status = computed(() => {
  if (store.erro) {
    return { texto: 'Falha no envio', classe: 'bg-red-500/10 text-red-300 ring-red-400/20', ponto: 'bg-red-400' }
  }
  if (!store.arquivo) {
    return { texto: 'Aguardando arquivo', classe: 'bg-slate-500/10 text-slate-300 ring-slate-400/20', ponto: 'bg-slate-400' }
  }
  if (!temResultado.value) {
    return { texto: 'Processando', classe: 'bg-indigo-500/10 text-indigo-300 ring-indigo-400/20', ponto: 'bg-indigo-400' }
  }
  if (store.totalComErro > 0) {
    return { texto: 'Validada com erros', classe: 'bg-amber-500/10 text-amber-300 ring-amber-400/20', ponto: 'bg-amber-400' }
  }
  return { texto: 'Validada', classe: 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/20', ponto: 'bg-emerald-400' }
})

// =====================================================
// CARDS DE RESUMO
// =====================================================
const kpis = computed(() => [
  {
    label: 'Linhas carregadas',
    value: store.totalLinhas,
    detalhe: 'Total de registros lidos',
    detalheCor: 'text-slate-500',
    iconeCor: 'bg-indigo-500/10 text-indigo-300 ring-indigo-400/20',
    icone: 'M3 6h18M3 12h18M3 18h18',
  },
  {
    label: 'Colunas',
    value: store.totalColunas,
    detalhe: 'Campos identificados',
    detalheCor: 'text-slate-500',
    iconeCor: 'bg-sky-500/10 text-sky-300 ring-sky-400/20',
    icone: 'M4 3h16v18H4zM9 3v18M15 3v18',
  },
  {
    label: 'Registros válidos',
    value: store.totalValidas,
    detalhe: formatarPercentual(percentualValidas.value) + ' do total',
    detalheCor: 'text-emerald-400',
    iconeCor: 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/20',
    icone: 'M20 6L9 17l-5-5',
  },
  {
    label: 'Registros com erro',
    value: store.totalComErro,
    detalhe:
      store.totalComErro > 0
        ? formatarPercentual(percentualErros.value) + ' do total'
        : 'Nenhum problema',
    detalheCor: store.totalComErro > 0 ? 'text-amber-400' : 'text-slate-500',
    iconeCor: 'bg-amber-500/10 text-amber-300 ring-amber-400/20',
    icone:
      'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  },
])
</script>

<template>
  <div class="min-h-screen bg-[#070a17] text-slate-100 flex">

    <NavSidebar />

    <div class="min-w-0 flex-1 pt-16 md:pt-0">
      <div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        <!-- ================================================= -->
        <!-- CABEÇALHO                                         -->
        <!-- ================================================= -->

        <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Upload de planilha
            </h1>
            <p class="mt-1 max-w-xl text-sm leading-6 text-slate-400">
              Envie um arquivo .xlsx, .xls ou .csv para validar os dados e gerar o dashboard.
            </p>
          </div>

          <span
            class="inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1"
            :class="status.classe"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="status.ponto"></span>
            {{ status.texto }}
          </span>
        </header>

        <!-- ================================================= -->
        <!-- ÁREA DE UPLOAD                                    -->
        <!-- ================================================= -->

        <section
          aria-label="Área de upload"
          class="relative overflow-hidden rounded-2xl border border-dashed bg-[#0e1226] px-6 py-12 text-center transition-all duration-200 sm:py-16"
          :class="
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_0_4px_rgba(99,102,241,0.12)]'
              : 'border-indigo-500/30 hover:border-indigo-400/60'
          "
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <!-- BRILHO DE FUNDO -->
          <div
            aria-hidden="true"
            class="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
          ></div>

          <div class="relative">
            <div
              class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-400/30 transition-transform duration-200"
              :class="isDragging ? 'scale-110' : ''"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-7 w-7 text-indigo-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M12 16V4" />
                <path d="M6 10l6-6 6 6" />
                <path d="M4 20h16" />
              </svg>
            </div>

            <h2 class="mt-6 text-lg font-bold text-white sm:text-xl">
              {{ isDragging ? 'Solte o arquivo para enviar' : 'Arraste sua planilha aqui' }}
            </h2>
            <p class="mt-1 text-sm text-slate-400">
              ou selecione um arquivo do seu computador
            </p>

            <button
              type="button"
              @click="triggerFileInput"
              class="mt-7 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-indigo-400 active:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1226]"
            >
              Selecionar arquivo
            </button>

            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls,.csv"
              class="hidden"
              @change="onFileSelected"
            />

            <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span
                v-for="formato in formatos"
                :key="formato"
                class="rounded-md border border-indigo-500/20 bg-[#070a17] px-2.5 py-1 text-xs font-medium text-slate-300"
              >
                {{ formato }}
              </span>
              <span class="text-xs text-slate-500">até 10 MB</span>
            </div>
          </div>
        </section>

        <!-- ================================================= -->
        <!-- ERRO AO PROCESSAR                                 -->
        <!-- ================================================= -->

        <aside
          v-if="store.erro"
          role="alert"
          class="mt-6 flex gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-400/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-red-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-red-300">Não foi possível processar o arquivo.</p>
            <p class="mt-1 text-sm text-slate-400">{{ store.erro }}</p>
          </div>
        </aside>

        <!-- ================================================= -->
        <!-- ARQUIVO ENVIADO + RESULTADO                       -->
        <!-- ================================================= -->

        <template v-if="store.arquivo">

          <!-- ARQUIVO -->
          <section
            aria-label="Arquivo enviado"
            class="mt-6 flex flex-col gap-4 rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div class="flex min-w-0 items-center gap-4">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                  <path d="M14 3v5h5" />
                  <path d="M9 13h6" />
                  <path d="M9 17h6" />
                </svg>
              </div>

              <div class="min-w-0">
                <p class="truncate font-semibold text-white">{{ store.arquivo.name }}</p>
                <p v-if="store.dataUpload" class="mt-0.5 text-xs text-slate-400">
                  Enviado em {{ dataUploadFormatada }}
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="limpar"
              class="w-full shrink-0 rounded-lg border border-indigo-500/20 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:w-auto"
            >
              Remover arquivo
            </button>
          </section>

          <!-- RESUMO -->
          <section
            v-if="temResultado"
            aria-label="Resultado da validação"
            class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <article
              v-for="kpi in kpis"
              :key="kpi.label"
              class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5"
            >
              <div class="flex items-start justify-between gap-3">
                <p class="text-sm text-slate-400">{{ kpi.label }}</p>
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1"
                  :class="kpi.iconeCor"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path :d="kpi.icone" />
                  </svg>
                </span>
              </div>
              <p class="mt-3 text-3xl font-bold text-white">{{ kpi.value }}</p>
              <p class="mt-2 text-xs font-medium" :class="kpi.detalheCor">{{ kpi.detalhe }}</p>
            </article>
          </section>

          <!-- QUALIDADE DOS DADOS -->
          <section
            v-if="temResultado"
            aria-label="Qualidade dos dados"
            class="mt-4 rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5 sm:p-6"
          >
            <div class="flex items-center justify-between gap-4">
              <h2 class="font-bold text-white">Qualidade dos dados</h2>
              <span class="text-sm font-semibold text-emerald-400">
                {{ formatarPercentual(percentualValidas) }} válidos
              </span>
            </div>

            <div class="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-[#070a17]">
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

            <!-- AVISO DE ERROS -->
            <div
              v-if="store.totalComErro > 0"
              role="alert"
              class="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
            >
              <p class="text-sm font-semibold text-amber-300">
                Foram encontrados erros na planilha
              </p>
              <p class="mt-1 text-sm leading-6 text-slate-400">
                Abra a tela de Relatório para ver o detalhamento dos erros de cada linha.
                Depois, corrija a planilha e envie o arquivo novamente.
              </p>
            </div>

            <!-- SUCESSO -->
            <div
              v-else
              class="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
            >
              <p class="text-sm font-semibold text-emerald-300">Planilha validada sem erros</p>
              <p class="mt-1 text-sm leading-6 text-slate-400">
                Todos os registros passaram pelas validações realizadas.
              </p>
            </div>
          </section>

        </template>

        <!-- ================================================= -->
        <!-- COMO FUNCIONA                                     -->
        <!-- ================================================= -->

        <section aria-labelledby="titulo-etapas" class="mt-10">
          <h2 id="titulo-etapas" class="font-bold text-white">Como funciona</h2>

          <ol class="mt-4 grid gap-4 md:grid-cols-3">
            <li
              v-for="step in steps"
              :key="step.number"
              class="rounded-2xl border border-indigo-500/10 bg-[#0e1226] p-5"
            >
              <span
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-sm font-bold text-indigo-300 ring-1 ring-indigo-400/20"
              >
                {{ step.number }}
              </span>
              <h3 class="mt-4 text-sm font-semibold text-white">{{ step.title }}</h3>
              <p class="mt-1 text-sm leading-6 text-slate-400">{{ step.description }}</p>
            </li>
          </ol>
        </section>

      </div>
    </div>
  </div>
</template>