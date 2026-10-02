import { defineStore } from 'pinia'   // Importa a função defineStore da Pinia para gerenciar o estado global
import * as XLSX from 'xlsx'          // Importa a biblioteca SheetJS (xlsx) para leitura e manipulação de planilhas




// =====================================================
// CONSTANTES DE VALIDAÇÃO
// =====================================================

const TAMANHO_MAXIMO = 10 * 1024 * 1024 // Limite de 10 MB para o arquivo enviado

// Colunas que a planilha precisa ter (nomes do cabeçalho)
const COLUNAS_OBRIGATORIAS = [
  'codigo_cliente', 'nome_cliente', 'consultor', 'segmento', 'nivel_cliente',
  'faturamento_anual', 'servicos_contratados', 'data_contratacao', 'cidade', 'uf'
]

// Tipos de erro usados no relatório (chave -> nome exibido)
const TIPOS_ERRO = {
  vazio: 'Campos vazios',
  duplicado: 'Registros duplicados',
  fora_do_padrao: 'Dados fora do padrão',
  email_invalido: 'E-mails inválidos'
}

// Segmentos oficiais aceitos e variações conhecidas (chave sem acento e em maiúsculas)
const MAPA_SEGMENTOS = {
  'IND.': 'Indústria', 'IND': 'Indústria', 'INDUSTRIA': 'Indústria',
  'COMERCIO': 'Comércio',
  'SERVICO': 'Serviços', 'SERVICOS': 'Serviços',
  'SAUDE': 'Saúde',
  'EDUCACAO': 'Educação',
  'TECNOLOGIA': 'Tecnologia',
  'OUTROS': 'Outros'
}

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

// Cria um erro estruturado: qual campo, qual tipo e qual a descrição
const criarErro = (campo, tipo, mensagem) => ({ campo, tipo, mensagem })

// Retorna true se o valor é vazio, nulo ou só espaços
const estaVazio = (valor) => valor === undefined || valor === null || String(valor).trim() === ''

// Remove acentos e coloca em maiúsculas (ex: "Indústria" -> "INDUSTRIA")
const semAcento = (texto) =>
  String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim()

// Converte valores como "R$ 1.500,00", "1500.50" ou 1500 em número. Retorna NaN se não for possível
function converterParaNumero(valor) {
  if (typeof valor === 'number') return valor

  let texto = String(valor).replace(/R\$/gi, '').replace(/\s/g, '')
  if (!texto) return NaN

  const temVirgula = texto.includes(',')
  const temPonto = texto.includes('.')

  if (temVirgula && temPonto) {
    texto = texto.replace(/\./g, '').replace(',', '.')        // 1.500,50 -> 1500.50
  } else if (temVirgula) {
    texto = texto.replace(',', '.')                           // 1500,50 -> 1500.50
  } else if (temPonto && /^\d{1,3}(\.\d{3})+$/.test(texto)) {
    texto = texto.replace(/\./g, '')                          // 1.500 -> 1500 (ponto de milhar)
  }

  return /^-?\d+(\.\d+)?$/.test(texto) ? Number(texto) : NaN
}

// Confere se dia, mês e ano formam uma data real (ex: 31/02 é inválido)
function dataExiste(dia, mes, ano) {
  if (ano < 1900) return false
  const data = new Date(ano, mes - 1, dia)
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
}

// Converte número serial do Excel, texto DD/MM/AAAA ou AAAA-MM-DD para "DD/MM/AAAA". Retorna null se for inválida
function normalizarData(valor) {
  let dia, mes, ano

  if (typeof valor === 'number') {
    if (valor < 1) return null
    const data = new Date(Math.round((valor - 25569) * 86400 * 1000)) // Converte o número serial do Excel (dias desde 1900) em data
    dia = data.getUTCDate(); mes = data.getUTCMonth() + 1; ano = data.getUTCFullYear()
  } else {
    const texto = String(valor).trim()
    let encontrado = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (encontrado) {
      dia = Number(encontrado[1]); mes = Number(encontrado[2]); ano = Number(encontrado[3])
    } else {
      encontrado = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (!encontrado) return null
      ano = Number(encontrado[1]); mes = Number(encontrado[2]); dia = Number(encontrado[3])
    }
  }

  if (!dataExiste(dia, mes, ano)) return null
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`
}

export const useUploadStore = defineStore('upload', {

  // =====================================================
  // STATE
  // =====================================================
  state: () => ({
    arquivo: null,          // Armazena o objeto do arquivo selecionado pelo usuário
    dadosOriginais: [],     // Armazena os dados brutos convertidos diretamente do Excel
    dadosTratados: [],      // Armazena os dados após passarem por limpeza e validação
    erro: '',               // Armazena mensagens globais de erro (ex: formato inválido)
    dataUpload: null        // Guarda a data e hora exatas em que o upload foi feito
  }),


  // =====================================================
  // GETTERS
  // =====================================================
  getters: {

    totalLinhas: (state) => state.dadosTratados.length, // Retorna a quantidade total de linhas tratadas

    totalColunas: (state) => {
      if (!state.dadosTratados.length) return 0 // Se não houver dados, retorna 0 colunas
      return Object.keys(state.dadosTratados[0]).filter(coluna => coluna !== 'erros' && coluna !== 'numero_linha').length // Conta as colunas reais ignorando os metadados de controle
    },

    colunas: (state) => {
      if (!state.dadosTratados.length) return [] // Se não houver dados, retorna array vazio
      return Object.keys(state.dadosTratados[0]).filter(coluna => coluna !== 'erros' && coluna !== 'numero_linha') // Retorna os nomes das colunas reais da planilha
    },

    totalValidas: (state) => state.dadosTratados.filter(linha => linha.erros.length === 0).length, // Conta quantas linhas passaram sem nenhum erro
    totalComErro: (state) => state.dadosTratados.filter(linha => linha.erros.length > 0).length,   // Conta quantas linhas possuem pelo menos um erro

    linhasComErro: (state) => state.dadosTratados.filter(linha => linha.erros.length > 0), // Retorna apenas as linhas que contêm erros
    linhasValidas: (state) => state.dadosTratados.filter(linha => linha.erros.length === 0), // Retorna apenas as linhas totalmente válidas

    // Soma todos os problemas encontrados (uma linha pode ter vários)
    totalErros: (state) => state.dadosTratados.reduce((soma, linha) => soma + linha.erros.length, 0),

    // Conta quantos erros existem de cada tipo (campos vazios, duplicados, fora do padrão, e-mails inválidos)
    resumoPorTipo: (state) => {
      const contagem = Object.fromEntries(Object.keys(TIPOS_ERRO).map(tipo => [tipo, 0]))

      for (const linha of state.dadosTratados) {
        for (const erro of linha.erros) {
          contagem[erro.tipo]++
        }
      }

      return Object.entries(TIPOS_ERRO).map(([tipo, nome]) => ({
        tipo,
        nome,
        quantidade: contagem[tipo]
      }))
    },

    // Lista plana com um item por erro: linha, campo, tipo e descrição (usada na tabela do relatório)
    errosDetalhados: (state) =>
      state.dadosTratados.flatMap(linha =>
        linha.erros.map(erro => ({
          numero_linha: linha.numero_linha,
          codigo_cliente: linha.codigo_cliente,
          nome_cliente: linha.nome_cliente,
          campo: erro.campo,
          tipo: erro.tipo,
          tipoNome: TIPOS_ERRO[erro.tipo],
          mensagem: erro.mensagem
        }))
      )
  },


  // =====================================================
  // ACTIONS
  // =====================================================
  actions: {

    async lerArquivo(file) {
      this.erro = ''           // Reseta a mensagem de erro global
      this.arquivo = file      // Salva a referência do arquivo no estado
      this.dataUpload = new Date() // Registra a data e hora atual do upload
      this.dadosOriginais = [] // Limpa os dados brutos anteriores
      this.dadosTratados = []  // Limpa os dados tratados anteriores

      if (!file) return // Interrompe a execução se nenhum arquivo foi passado

      const extensao = file.name.split('.').pop()?.toLowerCase() // Extrai e converte a extensão do arquivo para minúsculas

      if (!['xlsx', 'xls', 'csv'].includes(extensao)) {
        this.erro = 'Formato inválido. Use XLSX, XLS ou CSV.' // Valida se a extensão é permitida
        return
      }

      if (file.size > TAMANHO_MAXIMO) {
        this.erro = 'O arquivo é maior que 10 MB.' // Valida o tamanho máximo
        return
      }

      try {
        const buffer = await file.arrayBuffer() // Converte o arquivo carregado em um buffer binário ArrayBuffer
        const workbook = XLSX.read(buffer, { type: 'array' }) // Lê o arquivo binário usando a biblioteca SheetJS

        const nomeAba = workbook.SheetNames[0] // Identifica o nome da primeira aba da planilha
        const worksheet = workbook.Sheets[nomeAba] // Obtém os dados da primeira aba

        this.dadosOriginais = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) // Converte a aba do Excel em um array de objetos JSON (células vazias viram string vazia)

        if (!this.dadosOriginais.length) {
          this.erro = 'A planilha está vazia.' // Valida se o arquivo JSON gerado está vazio
          return
        }

        this.tratarDados() // Chama o método responsável por higienizar e validar as linhas
      } catch (error) {
        console.error(error) // Exibe o erro técnico no console para debug
        this.erro = 'Não foi possível ler a planilha.' // Define mensagem amigável caso ocorra falha de leitura
      }
    },


    tratarDados() {
      const codigosEncontrados = new Map() // Guarda cada código e a linha onde apareceu primeiro (para achar duplicados)

      // 1. LIMPEZA GERAL: remove espaços e padroniza o nome das colunas (minúsculas)
      const linhasLimpas = this.dadosOriginais.map(linha => {
        const limpa = {}
        for (const [chave, valor] of Object.entries(linha)) {
          limpa[String(chave).trim().toLowerCase()] = typeof valor === 'string' ? valor.trim() : valor
        }
        return limpa
      })

      // 2. COLUNAS OBRIGATÓRIAS: se faltar alguma, interrompe e avisa
      const colunasPlanilha = Object.keys(linhasLimpas[0] || {})
      const ausentes = COLUNAS_OBRIGATORIAS.filter(coluna => !colunasPlanilha.includes(coluna))

      if (ausentes.length) {
        this.erro = `A planilha não tem as colunas obrigatórias: ${ausentes.join(', ')}.`
        this.dadosTratados = []
        return
      }

      // 3. COLUNA DE E-MAIL (opcional): só é validada se existir na planilha
      const colunaEmail = colunasPlanilha.find(coluna => ['email', 'e-mail', 'e_mail'].includes(coluna))

      this.dadosTratados = linhasLimpas.map((linha, indice) => {
        const novaLinha = { ...linha } // Cria um novo objeto para a linha atual
        const erros = []               // Armazena os erros encontrados nesta linha
        const numeroLinha = indice + 2 // Calcula o número real da linha no Excel (Linha 1 = cabeçalho)

        // CÓDIGO DO CLIENTE
        if (typeof novaLinha.codigo_cliente === 'string') {
          novaLinha.codigo_cliente = novaLinha.codigo_cliente.toUpperCase() // Padroniza o código para maiúsculas
        }

        if (estaVazio(novaLinha.codigo_cliente)) {
          erros.push(criarErro('codigo_cliente', 'vazio', 'Campo obrigatório em branco.'))
        } else {
          const codigo = String(novaLinha.codigo_cliente)

          if (!/^CTI\d{3}$/.test(codigo)) {
            erros.push(criarErro('codigo_cliente', 'fora_do_padrao', 'Código inválido. Use o formato CTI001, CTI002...'))
          }

          if (codigosEncontrados.has(codigo)) {
            erros.push(criarErro('codigo_cliente', 'duplicado', `Código ${codigo} duplicado (já aparece na linha ${codigosEncontrados.get(codigo)}).`))
          } else {
            codigosEncontrados.set(codigo, numeroLinha)
          }
        }

        // NOME DO CLIENTE
        if (estaVazio(novaLinha.nome_cliente)) {
          erros.push(criarErro('nome_cliente', 'vazio', 'Campo obrigatório em branco.'))
        }

        // CONSULTOR
        if (estaVazio(novaLinha.consultor)) {
          erros.push(criarErro('consultor', 'vazio', 'Campo obrigatório em branco.'))
        }

        // SEGMENTO
        if (estaVazio(novaLinha.segmento)) {
          erros.push(criarErro('segmento', 'vazio', 'Campo obrigatório em branco.'))
        } else {
          const oficial = MAPA_SEGMENTOS[semAcento(novaLinha.segmento)] // Procura o nome oficial do segmento

          if (oficial) {
            novaLinha.segmento = oficial // Padroniza o texto (ex: "ind." vira "Indústria")
          } else {
            erros.push(criarErro('segmento', 'fora_do_padrao', `Segmento "${novaLinha.segmento}" fora do padrão. Use: Indústria, Comércio, Serviços, Saúde, Educação, Tecnologia ou Outros.`))
          }
        }

        // NÍVEL DO CLIENTE
        if (typeof novaLinha.nivel_cliente === 'string') {
          novaLinha.nivel_cliente = novaLinha.nivel_cliente.toUpperCase() // Padroniza nível para maiúsculas
        }

        if (estaVazio(novaLinha.nivel_cliente)) {
          erros.push(criarErro('nivel_cliente', 'vazio', 'Campo obrigatório em branco.'))
        } else if (!['A', 'B', 'C'].includes(novaLinha.nivel_cliente)) {
          erros.push(criarErro('nivel_cliente', 'fora_do_padrao', `Nível "${novaLinha.nivel_cliente}" inválido. Permitido somente A, B ou C.`))
        }

        // FATURAMENTO ANUAL
        if (estaVazio(novaLinha.faturamento_anual)) {
          erros.push(criarErro('faturamento_anual', 'vazio', 'Campo obrigatório em branco.'))
        } else {
          const numero = converterParaNumero(novaLinha.faturamento_anual)

          if (Number.isNaN(numero)) {
            erros.push(criarErro('faturamento_anual', 'fora_do_padrao', 'Valor inválido. Use somente números (ex: R$ 1.500,00).'))
          } else if (numero < 0) {
            erros.push(criarErro('faturamento_anual', 'fora_do_padrao', 'O faturamento não pode ser negativo.'))
          } else {
            novaLinha.faturamento_anual = numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) // Formata para o padrão monetário BRL
          }
        }

        // SERVIÇOS CONTRATADOS
        if (estaVazio(novaLinha.servicos_contratados)) {
          erros.push(criarErro('servicos_contratados', 'vazio', 'Campo obrigatório em branco.'))
        }

        // DATA DE CONTRATAÇÃO
        if (estaVazio(novaLinha.data_contratacao)) {
          erros.push(criarErro('data_contratacao', 'vazio', 'Campo obrigatório em branco.'))
        } else {
          const dataFormatada = normalizarData(novaLinha.data_contratacao)

          if (dataFormatada) {
            novaLinha.data_contratacao = dataFormatada // Padroniza para DD/MM/AAAA
          } else {
            erros.push(criarErro('data_contratacao', 'fora_do_padrao', 'Data inválida. Use uma data real no formato DD/MM/AAAA.'))
          }
        }

        // CIDADE
        if (estaVazio(novaLinha.cidade)) {
          erros.push(criarErro('cidade', 'vazio', 'Campo obrigatório em branco.'))
        }

        // UF
        if (typeof novaLinha.uf === 'string') {
          novaLinha.uf = novaLinha.uf.toUpperCase() // Padroniza UF para maiúsculas
        }

        if (estaVazio(novaLinha.uf)) {
          erros.push(criarErro('uf', 'vazio', 'Campo obrigatório em branco.'))
        } else if (!UFS.includes(novaLinha.uf)) {
          erros.push(criarErro('uf', 'fora_do_padrao', `UF "${novaLinha.uf}" inválida. Use a sigla de um estado (ex: SP).`))
        }

        // E-MAIL (somente se a planilha tiver essa coluna)
        if (colunaEmail) {
          if (estaVazio(novaLinha[colunaEmail])) {
            erros.push(criarErro(colunaEmail, 'vazio', 'Campo obrigatório em branco.'))
          } else {
            novaLinha[colunaEmail] = String(novaLinha[colunaEmail]).toLowerCase() // Padroniza e-mail para minúsculas

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novaLinha[colunaEmail])) {
              erros.push(criarErro(colunaEmail, 'email_invalido', 'E-mail inválido. Use o formato nome@dominio.com.'))
            }
          }
        }

        // RESULTADO DA LINHA
        novaLinha.numero_linha = numeroLinha // Atribui o número da linha física do Excel
        novaLinha.erros = erros              // Atribui a lista de erros acumulados desta linha

        return novaLinha // Retorna o objeto tratado para o array de dados tratados
      })
    },


    limpar() {
      this.arquivo = null      // Reseta o arquivo carregado
      this.dadosOriginais = [] // Limpa os dados brutos
      this.dadosTratados = []  // Limpa os dados tratados
      this.erro = ''           // Limpa mensagens de erro
      this.dataUpload = null   // Reseta a data e hora do upload
    }
  }
})