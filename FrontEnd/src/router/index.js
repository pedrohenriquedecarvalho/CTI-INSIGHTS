
import { createRouter, createWebHistory } from 'vue-router'

import home from '../views/home.vue'
import login from '../views/login.vue'
import upload from '../views/upload.vue'
import relatorios from '../views/relatorios.vue'
import dashboard from '../views/dashboard.vue'
import cadastro from '../views/cadastro.vue'
import usuarios from '../views/usuarios.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: home
  },
  {
    path: '/login',
    name: 'login',
    component: login
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: cadastro
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/upload',
    name: 'upload',
    component: upload,
    meta: { requiresAuth: true }
  },
  {
    path: '/relatorios',
    name: 'relatorios',
    component: relatorios,
    meta: { requiresAuth: true }
  },
  {
    path: '/usuarios',
    alias: '/usuario',
    name: 'usuarios',
    component: usuarios,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const perfil = (
    localStorage.getItem('perfil') || ''
  ).toUpperCase()

  if (to.meta.requiresAuth && !token) {
    return { name: 'login' }
  }

  if (to.meta.requiresAdmin && !['ADMIN', 'ROLE_ADMIN'].includes(perfil)) {
    return { name: 'dashboard' }
  }

  if (to.name === 'login' && token) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
