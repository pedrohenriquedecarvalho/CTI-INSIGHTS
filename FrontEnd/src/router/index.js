// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import home from "/src/views/home.vue"                 // Linhas 1-2 não apareciam no print: confira este import
import login from "/src/views/login.vue"
import upload from "/src/views/upload.vue"
import relatorios from "/src/views/relatorios.vue"
import dashboard from "/src/views/dashboard.vue"
import Cadastro from "/src/views/cadastro.vue"
import usuario from "/src/views/usuarios.vue"           

const routes = [
  { path: '/', name: 'home', component: home },
  { path: '/login', name: 'login', component: login },
  { path: '/upload', name: 'upload', component: upload },
  { path: '/relatorios', name: 'relatorios', component: relatorios },
  { path: '/dashboard', name: 'dashboard', component: dashboard },
  { path: '/cadastro', name: 'cadastro', component: Cadastro },

  // Só ADMIN abre esta tela (o backend também precisa conferir, o guard só esconde a página)
  { path: '/usuario', name: 'usuario', component: usuario, meta: { requiresAdmin: true } }
]

const router = createRouter({ history: createWebHistory(), routes })

// Guard de rota: lê o token e o perfil que o login deve salvar
//   localStorage.setItem('token', data.token)
//   localStorage.setItem('perfil', data.perfil)   // ex.: 'ADMIN'
router.beforeEach((to) => {
  if (!to.meta.requiresAdmin) return true // Rotas sem restrição passam direto

  const token = localStorage.getItem('token')
  const perfil = localStorage.getItem('perfil')

  if (!token) return { name: 'login' }                 // Não logado: vai para o login
  if (perfil !== 'ADMIN') return { name: 'dashboard' } // Logado, mas não é admin: volta ao dashboard

  return true
})

export default router