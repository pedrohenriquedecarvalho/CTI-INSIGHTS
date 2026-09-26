import { createRouter, createWebHistory } from 'vue-router'
import home from '../views/home.vue'
import login from '../views/login.vue'
import upload from '../views/upload.vue'
import relatorios from '../views/relatorios.vue'
import dashboard from '../views/dashboard.vue'
const routes =[
{ path: '/', name: 'home', component: home },
{ path: '/login', name: 'login', component: login },
{ path: '/upload', name: 'upload', component: upload },
{ path: '/relatorios', name: 'relatorios', component: relatorios },
{ path: '/dashboard', name: 'dashboard', component: dashboard },
]
const router = createRouter({ history: createWebHistory(), routes })
export default router