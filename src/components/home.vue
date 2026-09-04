<script setup>
import { ref } from 'vue'

// Controle do menu em telas menores (Mobile)
const mobileMenuOpen = ref(false)

// Lista de funcionalidades
const features = [
  { title: 'Upload de Dados', desc: 'Envie suas planilhas de forma simples e segura.' },
  { title: 'Análise Inteligente', desc: 'Processamos e analisamos seus dados com precisão.' },
  { title: 'Indicadores Completos', desc: 'Acompanhe métricas essenciais em tempo real.' },
  { title: 'Relatórios Personalizados', desc: 'Gere relatórios completos em poucos cliques.' },
]

// Passos do "Como funciona"
const steps = [
  { title: '1. Envie seus dados', desc: 'Importe planilhas ou conecte suas fontes existentes.' },
  { title: '2. Processamento', desc: 'O CTI Insights organiza e valida os dados automaticamente.' },
  { title: '3. Tome decisões', desc: 'Acompanhe os indicadores e gere relatórios práticos.' },
]
</script>

<template>
  <!-- Cor única no fundo principal -->
  <div class="bg-gray-950 text-white min-h-screen font-sans antialiased">
    
    <!-- NAVEGAÇÃO -->
    <header class="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="font-bold text-lg tracking-tight">
          CTI <span class="text-indigo-400 font-normal">Insights</span>
        </div>

        <!-- Links Desktop -->
        <nav class="hidden md:flex gap-6 text-sm text-gray-400">
          <a href="#funcionalidades" class="hover:text-white transition">Funcionalidades</a>
          <a href="#como-funciona" class="hover:text-white transition">Como Funciona</a>
        </nav>

        <!-- Botão Ação -->
        <button class="hidden md:block bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          Começar agora
        </button>

        <!-- Botão Mobile -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Menu Mobile -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-800 p-4 space-y-3 bg-gray-950">
        <a href="#funcionalidades" @click="mobileMenuOpen = false" class="block text-sm text-gray-300">Funcionalidades</a>
        <a href="#como-funciona" @click="mobileMenuOpen = false" class="block text-sm text-gray-300">Como Funciona</a>
        <button class="w-full bg-indigo-600 text-white text-sm py-2 rounded-lg">Começar agora</button>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span class="text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full">
          Painel em tempo real
        </span>
        
        <h1 class="text-3xl sm:text-5xl font-bold mt-4 leading-tight">
          Transforme dados em <span class="text-indigo-400">decisões estratégicas</span>
        </h1>
        
        <p class="text-gray-400 mt-4 text-base leading-relaxed">
          O CTI Insights ajuda sua empresa a coletar, analisar e visualizar indicadores essenciais para impulsionar seus resultados.
        </p>

        <button class="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition">
          Começar agora
        </button>
      </div>

      <!-- IMAGEM DO DASHBOARD -->
      <div class="flex justify-center items-center">
        <img 
          src="/src/assets/image.png" 
          alt="Demonstração do Dashboard CTI Insights" 
          class="w-full h-auto max-w-lg object-contain rounded-xl drop-shadow-2xl"
        />
      </div>
    </section>

    <!-- FUNCIONALIDADES -->
    <section id="funcionalidades" class="border-t border-gray-800 py-16">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-2xl font-bold">Funcionalidades</h2>
        <p class="text-gray-400 text-sm mt-1 mb-8">Tudo o que você precisa para gerenciar seus dados.</p>

        <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="(f, i) in features" :key="i" class="border border-gray-800 p-5 rounded-xl">
            <h3 class="font-semibold text-base text-white">{{ f.title }}</h3>
            <p class="text-sm text-gray-400 mt-2">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- COMO FUNCIONA -->
    <section id="como-funciona" class="border-t border-gray-800 py-16">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-2xl font-bold">Como funciona</h2>
        <p class="text-gray-400 text-sm mt-1 mb-8">Três passos simples para começar.</p>

        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="(s, i) in steps" :key="i" class="border border-gray-800 p-5 rounded-xl">
            <h3 class="font-medium text-lg text-indigo-400">{{ s.title }}</h3>
            <p class="text-sm text-gray-400 mt-2">{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="border-t border-gray-800 py-16 text-center">
      <div class="max-w-xl mx-auto px-4">
        <h2 class="text-2xl font-bold">Pronto para começar?</h2>
        <p class="text-gray-400 text-sm mt-2">Configure em poucos minutos sem complicações.</p>
        <button class="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition">
          Criar conta gratuita
        </button>
      </div>
    </section>

    <!-- RODAPÉ -->
    <footer class="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
      © 2026 CTI Insights. Todos os direitos reservados.
    </footer>

  </div>
</template>