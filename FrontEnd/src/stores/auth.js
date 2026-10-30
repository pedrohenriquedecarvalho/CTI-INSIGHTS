
import { defineStore } from 'pinia'
import api from '../Service/api.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    perfil: localStorage.getItem('perfil') || '',
    nome: localStorage.getItem('nome') || '',
    email: localStorage.getItem('email') || '',
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null')
  }),

  getters: {
    estaLogado: (state) => Boolean(state.token),

    ehAdmin: (state) => {
      const perfil = (
        state.perfil || state.usuario?.perfil || ''
      ).toUpperCase()

      return perfil === 'ADMIN' || perfil === 'ROLE_ADMIN'
    }
  },

  actions: {
    async login(email, senha) {
      const { data } = await api.post('/api/auth/login', {
        email,
        senha
      })

      const token = data.token
      const usuario = data.usuario
      const perfil = usuario?.perfil

      if (!token || !usuario || !perfil) {
        throw new Error('Resposta inválida do servidor.')
      }

      this.token = token
      this.usuario = usuario
      this.perfil = perfil
      this.nome = usuario.nome || ''
      this.email = usuario.email || email

      localStorage.setItem('token', token)
      localStorage.setItem('perfil', perfil)
      localStorage.setItem('nome', this.nome)
      localStorage.setItem('email', this.email)
      localStorage.setItem('usuario', JSON.stringify(usuario))

      return data
    },

    logout() {
      this.token = ''
      this.perfil = ''
      this.nome = ''
      this.email = ''
      this.usuario = null

      localStorage.removeItem('token')
      localStorage.removeItem('perfil')
      localStorage.removeItem('nome')
      localStorage.removeItem('email')
      localStorage.removeItem('usuario')
    }
  }
})
