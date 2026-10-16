<!-- src/views/CadastroView.vue -->
<template>
  <main class="min-h-screen bg-[#070a17] text-white flex flex-col justify-between p-6 lg:p-12">

    <!-- Header com a Logo no topo alinhada ao container -->
    <header class="w-full max-w-6xl mx-auto">
      <div class="font-bold text-lg tracking-tight">
        CTI <span class="text-indigo-400 font-normal">Insights</span>
      </div>
    </header>

    <!-- Conteúdo centralizado (Hero + Form) -->
    <div class="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center py-8">

      <!-- Seção de Apresentação -->
      <section class="space-y-6 max-w-lg">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
          Peça seu acesso e comece a ler seus dados.
        </h1>

        <p class="text-slate-400 text-sm sm:text-base leading-relaxed">
          Depois que você enviar a solicitação, a conta fica aguardando a aprovação do administrador.
          Com a conta liberada, você entra e acessa dashboards, relatórios e históricos de análises.
        </p>
      </section>

      <!-- Seção do Formulário -->
      <section class="w-full max-w-md mx-auto lg:max-w-none space-y-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Solicitar acesso
          </h2>

          <p class="text-slate-400 text-sm mt-1">
            Preencha seus dados para pedir a criação da sua conta.
          </p>
        </div>

        <form @submit.prevent="cadastrar" class="space-y-5">
          <div class="space-y-2">
            <label for="nome" class="block text-xs font-medium text-slate-300">Nome</label>
            <input
              id="nome"
              v-model="nome"
              type="text"
              placeholder="Seu nome completo"
              autocomplete="name"
              required
              class="w-full px-4 py-3 bg-[#0e1226] border border-indigo-500/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
          </div>

          <div class="space-y-2">
            <label for="email" class="block text-xs font-medium text-slate-300">E-mail:</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="voce@empresa.com"
              autocomplete="email"
              required
              class="w-full px-4 py-3 bg-[#0e1226] border border-indigo-500/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
          </div>

          <div class="space-y-2">
            <label for="senha" class="block text-xs font-medium text-slate-300">Senha</label>
            <input
              id="senha"
              v-model="senha"
              type="password"
              placeholder="*********"
              autocomplete="new-password"
              required
              class="w-full px-4 py-3 bg-[#0e1226] border border-indigo-500/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
          </div>

          <button
            type="submit"
            :disabled="enviando"
            class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ enviando ? 'Enviando...' : 'Enviar solicitação' }}
          </button>

          <!-- Resultado do envio: sucesso (aguardando aprovação) ou erro -->
          <p
            v-if="mensagem"
            :role="sucesso ? 'status' : 'alert'"
            class="text-sm rounded-lg px-4 py-3 border"
            :class="sucesso
              ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
              : 'text-red-300 bg-red-500/10 border-red-500/20'"
          >
            {{ mensagem }}
          </p>
        </form>

        <p class="text-slate-400 text-sm">
          Já tem conta?
          <RouterLink to="/login" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Entrar
          </RouterLink>
        </p>
      </section>

    </div>

    <!-- Div vazia para ajudar no alinhamento vertical flex-col (justify-between) -->
    <div class="hidden lg:block"></div>
  </main>
</template>

<script setup>
import { ref } from 'vue'


const nome = ref('')
const email = ref('')
const senha = ref('')
const mensagem = ref('')
const sucesso = ref(false)   // Define a cor da mensagem (verde = enviado, vermelho = erro)
const enviando = ref(false)  // Evita enviar a solicitação duas vezes

// Envia a solicitação de acesso. A conta só passa a valer depois que o administrador aprovar.
async function cadastrar() {
  mensagem.value = ''
  enviando.value = true

  try {
    await api.post('/auth/register', {
      nome: nome.value,
      email: email.value,
      senha: senha.value
    })

    sucesso.value = true
    mensagem.value = 'Solicitação enviada. Aguarde a aprovação do administrador.'

    // Limpa os campos depois do envio
    nome.value = ''
    email.value = ''
    senha.value = ''
  } catch (e) {
    sucesso.value = false
    mensagem.value = e.response?.data?.message || 'Não foi possível cadastrar.'
  } finally {
    enviando.value = false
  }
}
</script>