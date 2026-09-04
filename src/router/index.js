import { createRouter, createWebHistory } from 'vue-router'
//Páginas Públicas
import home from '../views/home.vue'
import login from '../views/login.vue'
//Layout do Painel e Páginas Internas
import AppLayout from '../layouts/AppLayout.vue'
import upload from '../views/upload.vue'
import relatorios from '../views/relatorios.vue'
import dashboard from '../views/dashboard.vue'
const routes =[
{ path: '/', name: 'home', component: home },
{ path: '/login', name: 'Login', component: login },
//Rota Pai do Painel Interno (Contém a Sidebar e o Header)
{
path: '/app',
component: AppLayout,
redirect: '/app/upload',
children: [
{ path: 'upload', name: 'Upload', component: upload },
{ path: 'relatorios', name: 'Relatorios', component: relatorios },
{ path: 'dashboard', name: 'dashbard', component: dashboard }
]
}
]
const router = createRouter({ history: createWebHistory(), routes })
export default router