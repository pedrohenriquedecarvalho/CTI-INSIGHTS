
<template>
  <main class="min-h-screen bg-[#070a17] text-white flex flex-col justify-between p-6 lg:p-12">

    <header class="w-full max-w-6xl mx-auto">
      <div class="font-bold text-lg tracking-tight">
        CTI <span class="text-indigo-400 font-normal">Insights</span>
      </div>
    </header>

    <div class="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center py-8">

      <section class="space-y-6 max-w-lg">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
          Entre e acompanhe seus dados.
        </h1>

        <p class="text-slate-400 text-sm sm:text-base leading-relaxed">
          Acesse dashboards, relatórios e históricos de análises com a sua conta.
        </p>
      </section>

      <section class="w-full max-w-md mx-auto lg:max-w-none space-y-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Entrar
          </h2>
          <p class="text-slate-400 text-sm mt-1">
            Use o e-mail e a senha da sua conta.
          </p>
        </div>

        <form @submit.prevent="entrar" class="space-y-5">

          <div class="space-y-2">
            <label for="email" class="block text-xs font-medium text-slate-300">
              E-mail:
            </label>

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
            <label for="senha" class="block text-xs font-medium text-slate-300">
              Senha
            </label>

            <input
              id="senha"
              v-model="senha"
              type="password"
              placeholder="Sua senha"
              autocomplete="current-password"
              required
              class="w-full px-4 py-3 bg-[#0e1226] border border-indigo-500/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
          </div>

          <button
            type="submit"
            :disabled="enviando"
            class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ enviando ? 'Entrando...' : 'Entrar' }}
          </button>

          <p
            v-if="mensagem"
            role="alert"
            class="text-sm rounded-lg px-4 py-3 border text-red-300 bg-red-500/10 border-red-500/20"
          >
            {{ mensagem }}
          </p>

        </form>

        <p class="text-slate-400 text-sm">
          Ainda não tem conta?

          <RouterLink
            to="/cadastro"
            class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Solicitar acesso
          </RouterLink>
        </p>
      </section>
    </div>

    <div class="hidden lg:block"></div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const senha = ref('')
const mensagem = ref('')
const enviando = ref(false)

async function entrar() {
  mensagem.value = ''
  enviando.value = true

  try {
    // Atualiza Pinia e localStorage ao mesmo tempo.
    await auth.login(email.value, senha.value)

    // Redireciona depois que os dados do usuário foram atualizados.
    await router.push({ name: 'dashboard' })

  } catch (e) {
    console.error('Erro no login:', e)

    const status = e.response?.status

    if (!e.response) {
      mensagem.value = 'Não foi possível conectar ao servidor.'
    } else if (status === 401) {
      mensagem.value = 'E-mail ou senha inválidos.'
    } else if (status === 403) {
      mensagem.value = 'Sua conta ainda aguarda aprovação ou foi bloqueada.'
    } else {
      mensagem.value =
        e.response?.data?.message || 'Não foi possível realizar o login.'
    }

  } finally {
    enviando.value = false
  }
}
</script>
