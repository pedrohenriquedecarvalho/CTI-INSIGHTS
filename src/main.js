import { createApp } from 'vue'
<<<<<<< HEAD
import App from './App.vue'
import router from './router/index.js' // Importa as rotas de src/router/index.js
import './style.css' // Importa o Tailwind CSS (se houver)
const app = createApp(App)
app.use(router) // Registra o Vue Router na aplicação
app.mount("#app")
=======
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
>>>>>>> 8ee5a4dbd502c35a3e650d9e58dad9ea68af681a
