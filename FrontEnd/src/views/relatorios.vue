<template>

  <!-- H1 simples renderizando uma variável reativa -->
  <h1 class="titulo-principal">{{ titulo }}</h1>

  <!-- H1 dinâmico com interpolação e lógica simples -->
  <h1>{{ usuario ? `Bem-vindo, ${usuario}!` : 'Bem-vindo!' }}</h1>

</template>

<script setup>
import { ref } from 'vue'

// Estado reativo contendo o texto do H1
const titulo = ref('Meu Título Principal')
const usuario = ref('Maria')
</script>

<style scoped>
.titulo-principal {
  color: #42b883; /* Cor característica do Vue */
  font-size: 2.5rem;
  font-weight: bold;
}
</style>