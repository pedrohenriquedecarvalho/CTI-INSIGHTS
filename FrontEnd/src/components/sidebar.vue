<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Itens do menu — ajuste os "to" para os paths reais das suas rotas
const menuItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'M3 13h4v8H3v-8zm7-6h4v14h-4V7zm7 3h4v11h-4V10z',
  },
  {
    label: 'Clientes',
    to: '/clientes',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    label: 'Relatórios',
    to: '/relatorios',
    icon: 'M9 17v-6M12 17V9M15 17v-3M4 4h16v16H4V4z',
  },
  {
    label: 'Upload',
    to: '/upload',
    icon: 'M12 16V4m0 0L7 9m5-5l5 5M5 20h14',
  },
]

// Controle do menu em telas menores (mobile)
const mobileOpen = ref(false)

// Controle de recolher/expandir no desktop
const collapsed = ref(false)

function isActivo(path) {
  return route.path === path
}

function sair() {
  // Ponto certo para limpar sessão/token antes de voltar ao login
  router.push('/login')
}
</script>

<template>
  <!-- Botão hambúrguer (mobile) -->
  <button
    @click="mobileOpen = !mobileOpen"
    class="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0e1226] border border-indigo-500/10 text-slate-300"
  >
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  <!-- Overlay mobile -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="mobileOpen"
      @click="mobileOpen = false"
      class="md:hidden fixed inset-0 bg-black/60 z-40"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <aside
    class="fixed md:sticky top-0 left-0 h-screen bg-[#0b0e20] border-r border-indigo-500/10 flex flex-col justify-between p-4 z-40 transition-all duration-300"
    :class="[
      mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      collapsed ? 'md:w-20 w-64' : 'w-64',
    ]"
  >
    <div>
      <!-- Logo + botão de recolher -->
      <div class="flex items-center justify-between px-2 mb-8">
        <div class="font-bold text-lg tracking-tight overflow-hidden whitespace-nowrap" :class="collapsed && 'md:hidden'">
          CTI <span class="text-indigo-400 font-normal">Insights</span>
        </div>

        <!-- Botão recolher (só aparece no desktop) -->
        <button
          @click="collapsed = !collapsed"
          class="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-200 shrink-0"
          :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <svg
            class="w-4 h-4 transition-transform duration-300"
            :class="collapsed && 'rotate-180'"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- Itens do menu -->
      <nav class="space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          @click="mobileOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
          :class="[
            isActivo(item.to)
              ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent',
            collapsed && 'md:justify-center',
          ]"
          :title="collapsed ? item.label : undefined"
        >
          <svg class="w-4.5 h-4.5 shrink-0" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          <span :class="collapsed && 'md:hidden'">{{ item.label }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Rodapé: usuário + logout -->
    <div class="border-t border-indigo-500/10 pt-4 px-2">
      <div class="flex items-center gap-3 mb-3" :class="collapsed && 'md:justify-center'">
        <div class="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300 shrink-0">
          A
        </div>
        <div class="min-w-0" :class="collapsed && 'md:hidden'">
          <p class="text-sm font-medium text-white truncate">Admin</p>
          <p class="text-xs text-slate-500 truncate">admin@cti.com</p>
        </div>
      </div>

      <button
        @click="sair"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-200"
        :class="collapsed && 'md:justify-center'"
        :title="collapsed ? 'Sair' : undefined"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
        </svg>
        <span :class="collapsed && 'md:hidden'">Sair</span>
      </button>
    </div>
  </aside>
</template>