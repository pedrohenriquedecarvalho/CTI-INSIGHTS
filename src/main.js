import { createApp } from 'vue'

import App from './App.vue'
import router from './router/index.js' // Importa as rotas de src/router/index.js
import './style.css' // Importa o Tailwind CSS (se houver)
const app = createApp(App)
app.use(router) // Registra o Vue Router na aplicação
app.mount("#app")

import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

