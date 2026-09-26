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
          Seus dados já contam uma história. A gente ajuda você a lê-la.
        </h1>

        <p class="text-slate-400 text-sm sm:text-base leading-relaxed">
          Acesse sua conta e continue de onde parou — dashboards, relatórios e históricos de análises em um só lugar.
        </p>
      </section>

      <!-- Seção do Formulário -->
      <section class="w-full max-w-md mx-auto lg:max-w-none space-y-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Entrar na conta
          </h2>
          
          <p class="text-slate-400 text-sm mt-1">
            Bem-vindo de volta, informe seus dados para continuar.
          </p>
        </div>

        <form @submit.prevent="irParaDashboard" class="space-y-5">
          <div class="space-y-2">
            <label for="email" class="block text-xs font-medium text-slate-300">E-mail:</label>
            <input 
              id="email" 
              v-model="email"
              type="email" 
              placeholder="voce@empresa.com" 
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
              required
              class="w-full px-4 py-3 bg-[#0e1226] border border-indigo-500/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
          </div>

          <button 
            type="submit"
            class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Entrar
          </button>
        </form>
      </section>

    </div>

    <!-- Div vazia para ajudar no alinhamento vertical flex-col (justify-between) -->
    <div class="hidden lg:block"></div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const senha = ref('')

// Ao enviar o formulário, leva o usuário para o dashboard.
// Aqui é o ponto certo para validar credenciais / chamar sua API de login
// antes de redirecionar, quando isso estiver pronto.
function irParaDashboard() {
  router.push('/dashboard')
}
</script>