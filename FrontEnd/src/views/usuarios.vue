<!-- src/views/UsuariosView.vue -->
<template>
  <main class="min-h-screen bg-[#070a17] text-white p-6 lg:p-12">
    <div class="w-full max-w-6xl mx-auto space-y-8">

      <!-- Header com a Logo e o link de volta -->
      <header class="flex items-center justify-between">
        <div class="font-bold text-lg tracking-tight">
          CTI <span class="text-indigo-400 font-normal">Insights</span>
        </div>

        <RouterLink to="/dashboard" class="text-slate-400 hover:text-white text-sm transition-colors">
          Voltar ao dashboard
        </RouterLink>
      </header>

      <!-- Título -->
      <section class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Usuários
          </h1>

          <p class="text-slate-400 text-sm mt-1">
            Aprove ou bloqueie os acessos solicitados no cadastro.
          </p>
        </div>

        <button
          type="button"
          @click="atualizarLista"
          :disabled="carregando"
          class="self-start sm:self-auto py-2 px-4 bg-[#0e1226] border border-indigo-500/10 hover:border-indigo-500 text-slate-200 text-sm rounded-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{ carregando ? 'Atualizando...' : 'Atualizar lista' }}
        </button>
      </section>

      <!-- Mensagem de erro ou de confirmação da última ação -->
      <p
        v-if="mensagem"
        :role="erro ? 'alert' : 'status'"
        class="text-sm rounded-lg px-4 py-3 border"
        :class="erro
          ? 'text-red-300 bg-red-500/10 border-red-500/20'
          : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'"
      >
        {{ mensagem }}
      </p>

      <!-- Tabela de usuários -->
      <section class="bg-[#0e1226] border border-indigo-500/10 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <caption class="sr-only">Usuários cadastrados e situação do acesso</caption>

            <thead class="text-xs font-medium text-slate-400 border-b border-indigo-500/10">
              <tr>
                <th scope="col" class="px-4 py-3">Nome</th>
                <th scope="col" class="px-4 py-3">E-mail</th>
                <th scope="col" class="px-4 py-3">Status</th>
                <th scope="col" class="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="u in usuarios"
                :key="u.id"
                class="border-b border-indigo-500/10 last:border-b-0"
              >
                <td class="px-4 py-3 text-white whitespace-nowrap">{{ u.nome }}</td>
                <td class="px-4 py-3 text-slate-300 whitespace-nowrap">{{ u.email }}</td>

                <td class="px-4 py-3">
                  <span
                    class="inline-block px-2.5 py-1 rounded-full text-xs font-medium border"
                    :class="classeStatus(u.status)"
                  >
                    {{ u.status }}
                  </span>
                </td>

                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button
                      type="button"
                      @click="ativar(u.id)"
                      :disabled="processandoId === u.id || u.status === 'ATIVO'"
                      :aria-label="'Ativar ' + u.nome"
                      class="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Ativar
                    </button>

                    <button
                      type="button"
                      @click="bloquear(u.id)"
                      :disabled="processandoId === u.id || u.status === 'BLOQUEADO'"
                      :aria-label="'Bloquear ' + u.nome"
                      class="py-1.5 px-3 border border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Bloquear
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estados vazios: carregando ou nenhum cadastro -->
        <p v-if="carregando && !usuarios.length" class="px-4 py-8 text-center text-slate-400 text-sm">
          Carregando usuários...
        </p>

        <p v-else-if="!usuarios.length && !erro" class="px-4 py-8 text-center text-slate-400 text-sm">
          Nenhum cadastro por enquanto. Quando alguém solicitar acesso, aparece aqui.
        </p>
      </section>

    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'


const usuarios = ref([])
const carregando = ref(false)
const processandoId = ref(null) // Id do usuário que está sendo alterado (trava os botões da linha)
const mensagem = ref('')
const erro = ref(false)

// Cor do status: verde = ativo, vermelho = bloqueado, amarelo = qualquer outro (ex.: aguardando aprovação)
function classeStatus(status) {
  if (status === 'ATIVO') return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
  if (status === 'BLOQUEADO') return 'text-red-300 bg-red-500/10 border-red-500/20'
  return 'text-amber-300 bg-amber-500/10 border-amber-500/20'
}

function mostrarErro(e, padrao) {
  erro.value = true
  mensagem.value = e.response?.data?.message || padrao
}

async function carregar() {
  carregando.value = true
  try {
    const { data } = await api.get('/admin/usuarios') // Busca usuários cadastrados
    usuarios.value = Array.isArray(data) ? data : []
  } catch (e) {
    mostrarErro(e, 'Não foi possível carregar os usuários.')
  } finally {
    carregando.value = false
  }
}

// Botão "Atualizar lista": limpa a mensagem anterior e busca de novo
function atualizarLista() {
  mensagem.value = ''
  return carregar()
}

// Envia o novo status para a API e atualiza a tabela. Quem autoriza de verdade é o backend
async function alterarStatus(id, status, textoSucesso) {
  mensagem.value = ''
  processandoId.value = id

  try {
    await api.patch('/admin/usuarios/' + id + '/status', { status })
    erro.value = false
    mensagem.value = textoSucesso
    await carregar() // Atualiza a tabela
  } catch (e) {
    mostrarErro(e, 'Não foi possível alterar o status do usuário.')
  } finally {
    processandoId.value = null
  }
}

function ativar(id) {
  return alterarStatus(id, 'ATIVO', 'Usuário ativado.')
}

function bloquear(id) {
  return alterarStatus(id, 'BLOQUEADO', 'Usuário bloqueado.')
}

onMounted(carregar)
</script>