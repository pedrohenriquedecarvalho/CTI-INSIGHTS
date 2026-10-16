// src/stores/auth.js
import { defineStore } from 'pinia'
import api from '../Service/api.js'

export const useAuthStore = defineStore('auth', {

  // STATE: lê do localStorage para o login continuar valendo ao recarregar a página
  state: () => ({
    token: localStorage.getItem('token') || '',   // Token devolvido pela API no login
    perfil: localStorage.getItem('perfil') || '', // Perfil do usuário (ex.: 'ADMIN')
    nome: localStorage.getItem('nome') || ''      // Nome para exibir na tela
  }),

  // GETTERS: as respostas "true/false" que o router usa para liberar páginas privadas
  getters: {
    estaLogado: (state) => Boolean(state.token),
    ehAdmin: (state) => state.perfil === 'ADMIN'
  },

  // ACTIONS
  actions: {

    // Chama a API e guarda o resultado. Se a API recusar (senha errada, conta pendente ou bloqueada),
    // o erro sobe para a tela de login mostrar a mensagem
    async login(email, senha) {
      const { data } = await api.post('/auth/login', { email, senha })

      this.token = data.token
      this.perfil = data.perfil
      this.nome = data.nome

      // O api.js lê o token daqui para enviar em todas as requisições
      localStorage.setItem('token', this.token)
      localStorage.setItem('perfil', this.perfil)
      localStorage.setItem('nome', this.nome)
    },

    logout() {
      this.token = ''
      this.perfil = ''
      this.nome = ''

      localStorage.removeItem('token')
      localStorage.removeItem('perfil')
      localStorage.removeItem('nome')
    }
  }
})