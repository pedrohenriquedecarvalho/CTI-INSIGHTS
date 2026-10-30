
<template>
  <div class="min-h-screen bg-[#070a17] text-white flex">

    <!-- Sidebar -->
    <Sidebar />

    <!-- Conteúdo principal -->
    <main class="flex-1 min-w-0 p-6 lg:p-10">

      <div class="max-w-6xl mx-auto">

        <!-- Cabeçalho -->
        <header class="mb-10">
          <h1 class="text-3xl font-bold">
            Gerenciamento de usuários
          </h1>

          <p class="text-slate-400 mt-2">
            Gerencie as solicitações de acesso ao CTI Insights.
          </p>
        </header>

        <!-- Resumo -->
        <section class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          <div class="bg-[#0e1226] border border-slate-800 rounded-xl p-5">
            <p class="text-slate-400 text-sm">
              Usuários pendentes
            </p>

            <p class="text-3xl font-bold mt-2">
              {{ usuarios.length }}
            </p>
          </div>

          <div class="bg-[#0e1226] border border-slate-800 rounded-xl p-5">
            <p class="text-slate-400 text-sm">
              Solicitações carregadas
            </p>

            <p class="text-3xl font-bold mt-2">
              {{ usuarios.length }}
            </p>
          </div>

        </section>

        <!-- Tabela -->
        <section class="bg-[#0e1226] border border-slate-800 rounded-xl p-6">

          <div class="flex flex-wrap justify-between items-center gap-4 mb-6">

            <div>
              <h2 class="text-xl font-semibold">
                Solicitações de acesso
              </h2>

              <p class="text-sm text-slate-400 mt-1">
                Aprove ou rejeite os novos cadastros.
              </p>
            </div>

            <button
              @click="buscarUsuarios"
              :disabled="carregando"
              class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg transition"
            >
              {{ carregando ? 'Atualizando...' : 'Atualizar lista' }}
            </button>

          </div>

          <!-- Carregando -->
          <div v-if="carregando" class="text-center py-10 text-slate-400">
            Carregando usuários...
          </div>

          <!-- Erro -->
          <div
            v-else-if="mensagemErro"
            class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4"
          >
            {{ mensagemErro }}
          </div>

          <!-- Lista vazia -->
          <div
            v-else-if="usuarios.length === 0"
            class="text-center py-10 text-slate-400"
          >
            Nenhuma solicitação pendente.
          </div>

          <!-- Lista de usuários -->
          <div v-else class="overflow-x-auto">

            <table class="w-full text-left">

              <thead>
                <tr class="border-b border-slate-700 text-slate-400 text-sm">
                  <th class="p-4">ID</th>
                  <th class="p-4">Nome</th>
                  <th class="p-4">E-mail</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-center">Ações</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="usuario in usuarios"
                  :key="usuario.id"
                  class="border-b border-slate-800 hover:bg-white/5 transition"
                >

                  <td class="p-4">
                    {{ usuario.id }}
                  </td>

                  <td class="p-4 font-medium">
                    {{ usuario.nome }}
                  </td>

                  <td class="p-4 text-slate-300">
                    {{ usuario.email }}
                  </td>

                  <td class="p-4">
                    <span class="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-xs">
                      Pendente
                    </span>
                  </td>

                  <td class="p-4">
                    <div class="flex justify-center gap-2">

                      <button
                        @click="aprovarUsuario(usuario)"
                        :disabled="processando === usuario.id"
                        class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-3 py-2 rounded-lg text-sm transition"
                      >
                        Aprovar
                      </button>

                      <button
                        @click="rejeitarUsuario(usuario)"
                        :disabled="processando === usuario.id"
                        class="bg-red-600 hover:bg-red-500 disabled:opacity-50 px-3 py-2 rounded-lg text-sm transition"
                      >
                        Rejeitar
                      </button>

                    </div>
                  </td>

                </tr>
              </tbody>

            </table>

          </div>

          <!-- Mensagens -->
          <div
            v-if="mensagemSucesso"
            class="mt-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg"
          >
            {{ mensagemSucesso }}
          </div>

        </section>

      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../Service/api.js'
import Sidebar from '../components/sidebar.vue'

const usuarios = ref([])
const carregando = ref(false)
const processando = ref(null)

const mensagemErro = ref('')
const mensagemSucesso = ref('')

// Buscar usuários pendentes
async function buscarUsuarios() {
  carregando.value = true
  mensagemErro.value = ''

  try {
    const resposta = await api.get('/api/admin/usuarios/pendentes')

    usuarios.value = resposta.data

  } catch (erro) {
    console.error('Erro ao buscar usuários:', erro)

    mensagemErro.value =
      erro.response?.data?.message ||
      `Erro ${erro.response?.status || ''} ao carregar usuários.`

  } finally {
    carregando.value = false
  }
}

// Aprovar usuário
async function aprovarUsuario(usuario) {
  const confirmar = window.confirm(
    `Deseja aprovar o cadastro de ${usuario.nome}?`
  )

  if (!confirmar) return

  processando.value = usuario.id
  mensagemErro.value = ''
  mensagemSucesso.value = ''

  try {
    await api.patch(
      `/api/admin/usuarios/${usuario.id}/aprovar`
    )

    mensagemSucesso.value =
      `Usuário ${usuario.nome} aprovado com sucesso!`

    await buscarUsuarios()

  } catch (erro) {
    console.error('Erro ao aprovar usuário:', erro)

    mensagemErro.value =
      erro.response?.data?.message ||
      `Não foi possível aprovar o usuário. Erro ${erro.response?.status || ''}.`

  } finally {
    processando.value = null
  }
}

// Rejeitar usuário
async function rejeitarUsuario(usuario) {
  const confirmar = window.confirm(
    `Deseja realmente rejeitar o cadastro de ${usuario.nome}?`
  )

  if (!confirmar) return

  processando.value = usuario.id
  mensagemErro.value = ''
  mensagemSucesso.value = ''

  try {
    await api.patch(
      `/api/admin/usuarios/${usuario.id}/rejeitar`
    )

    mensagemSucesso.value =
      `Cadastro de ${usuario.nome} rejeitado.`

    await buscarUsuarios()

  } catch (erro) {
    console.error('Erro ao rejeitar usuário:', erro)

    mensagemErro.value =
      erro.response?.data?.message ||
      `Não foi possível rejeitar o usuário. Erro ${erro.response?.status || ''}.`

  } finally {
    processando.value = null
  }
}

onMounted(() => {
  buscarUsuarios()
})
</script>
