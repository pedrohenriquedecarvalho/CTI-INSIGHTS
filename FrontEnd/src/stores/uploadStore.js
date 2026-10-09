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

// Campos internos que a store adiciona em cada linha e que NÃO são colunas da planilha
const CAMPOS_CONTROLE = ['erros', 'avisos', 'numero_linha', 'faturamento_numero']

// Tipos de erro usados no relatório (chave -> nome exibido)
const TIPOS_ERRO = {
  vazio: 'Campos vazios',
  duplicado: 'Registros duplicados',
  fora_do_padrao: 'Dados fora do padrão',
  email_invalido: 'E-mails inválidos'
}

// Avisos: correções feitas automaticamente. Não invalidam a linha, mas aparecem no relatório
const TIPOS_AVISO = {
  espacos: 'Espaços desnecessários removidos',
  padronizado: 'Textos padronizados'
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

// Remove espaços das pontas e reduz espaços repetidos no meio do texto (ex: "João   Silva " -> "João Silva")
const limparTexto = (texto) => texto.trim().replace(/\s+/g, ' ')

// Padroniza o nome da coluna: sem acento, minúsculas e com "_" no lugar de espaços (ex: "Código Cliente" -> "codigo_cliente")
const normalizarCabecalho = (chave) => semAcento(String(chave)).toLowerCase().replace(/\s+/g, '_')

// Retorna true se a data "DD/MM/AAAA" é posterior a hoje
function dataNoFuturo(dataTexto) {
  const [dia, mes, ano] = dataTexto.split('/').map(Number)
  const hoje = new Date()
  return Date.UTC(ano, mes - 1, dia) > Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
}

// Padroniza o código do cliente (sem espaços e em maiúsculas). Retorna '' se estiver vazio
const normalizarCodigo = (valor) => (estaVazio(valor) ? '' : String(valor).trim().toUpperCase())

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

// Confere se dia, mês e ano formam uma data real (ex: 31/02 é inválido). Usa UTC para não depender do fuso do usuário
function dataExiste(dia, mes, ano) {
  if (ano < 1900) return false
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia
}

// Converte número serial do Excel, texto DD/MM/AAAA ou AAAA-MM-DD para "DD/MM/AAAA". Retorna null se for inválida
function normalizarData(valor) {
  let dia, mes, ano

  if (typeof valor === 'number') {
    if (valor < 1) return null
    const data = new Date(Math.round((Math.floor(valor) - 25569) * 86400 * 1000)) // Serial do Excel (dias desde 1900) -> data; ignora a parte da hora
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
    arquivo: null,            // Armazena o objeto do arquivo selecionado pelo usuário
    dadosOriginais: [],       // Armazena os dados brutos convertidos diretamente do Excel
    dadosTratados: [],        // Armazena os dados após passarem por limpeza e validação
    erro: '',                 // Armazena mensagens globais de erro (ex: formato inválido)
    dataUpload: null,         // Guarda a data e hora exatas em que o upload foi feito
    possuiColunaEmail: false  // Indica se a planilha tem coluna de e-mail (para o relatório explicar se a validação foi feita)
  }),


  // =====================================================
  // GETTERS
  // =====================================================
  getters: {

    nomeArquivo: (state) => state.arquivo?.name ?? '', // Nome do arquivo analisado (usado no relatório)

    totalLinhas: (state) => state.dadosTratados.length, // Retorna a quantidade total de linhas tratadas

    possuiDados: (state) => state.dadosTratados.length > 0, // Indica se existe análise para mostrar no relatório

    colunas: (state) => {
      if (!state.dadosTratados.length) return [] // Se não houver dados, retorna array vazio
      return Object.keys(state.dadosTratados[0]).filter(coluna => !CAMPOS_CONTROLE.includes(coluna)) // Nomes das colunas reais da planilha
    },

    totalColunas() {
      return this.colunas.length // Reaproveita o getter "colunas" em vez de repetir o filtro
    },

    totalValidas: (state) => state.dadosTratados.filter(linha => linha.erros.length === 0).length, // Linhas sem nenhum erro
    totalComErro: (state) => state.dadosTratados.filter(linha => linha.erros.length > 0).length,   // Linhas com pelo menos um erro

    linhasComErro: (state) => state.dadosTratados.filter(linha => linha.erros.length > 0), // Apenas as linhas que contêm erros
    linhasValidas: (state) => state.dadosTratados.filter(linha => linha.erros.length === 0), // Apenas as linhas totalmente válidas

    // Percentual de linhas válidas (0 a 100, com uma casa decimal)
    percentualValidas() {
      if (!this.totalLinhas) return 0
      return Math.round((this.totalValidas / this.totalLinhas) * 1000) / 10
    },

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

    // Total de correções automáticas feitas (espaços removidos e textos padronizados)
    totalAvisos: (state) => state.dadosTratados.reduce((soma, linha) => soma + linha.avisos.length, 0),

    // Conta quantas correções automáticas existem de cada tipo
    resumoAvisos: (state) => {
      const contagem = Object.fromEntries(Object.keys(TIPOS_AVISO).map(tipo => [tipo, 0]))

      for (const linha of state.dadosTratados) {
        for (const aviso of linha.avisos) {
          contagem[aviso.tipo]++
        }
      }

      return Object.entries(TIPOS_AVISO).map(([tipo, nome]) => ({
        tipo,
        nome,
        quantidade: contagem[tipo]
      }))
    },

    // Lista plana com um item por correção automática: linha, campo, tipo e descrição
    avisosDetalhados: (state) =>
      state.dadosTratados.flatMap(linha =>
        linha.avisos.map(aviso => ({
          numero_linha: linha.numero_linha,
          codigo_cliente: linha.codigo_cliente,
          nome_cliente: linha.nome_cliente,
          campo: aviso.campo,
          tipo: aviso.tipo,
          tipoNome: TIPOS_AVISO[aviso.tipo],
          mensagem: aviso.mensagem
        }))
      ),

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
      this.erro = ''                  // Reseta a mensagem de erro global
      this.arquivo = file             // Salva a referência do arquivo no estado
      this.dataUpload = new Date()    // Registra a data e hora atual do upload
      this.dadosOriginais = []        // Limpa os dados brutos anteriores
      this.dadosTratados = []         // Limpa os dados tratados anteriores
      this.possuiColunaEmail = false  // Reseta a informação sobre a coluna de e-mail

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
        // CSV é lido como texto (evita problemas com acentos); XLSX e XLS são lidos como binário
        const workbook = extensao === 'csv'
          ? XLSX.read(await file.text(), { type: 'string', raw: true }) // raw: mantém tudo como texto (senão "1500,50" viraria 150050)
          : XLSX.read(await file.arrayBuffer(), { type: 'array' })

        const nomeAba = workbook.SheetNames[0] // Identifica o nome da primeira aba da planilha
        const worksheet = workbook.Sheets[nomeAba] // Obtém os dados da primeira aba

        this.dadosOriginais = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) // Converte a aba em array de objetos (células vazias viram string vazia)

        if (!this.dadosOriginais.length) {
          this.erro = 'A planilha está vazia.' // Valida se o JSON gerado está vazio
          return
        }

        this.tratarDados() // Chama o método responsável por higienizar e validar as linhas
      } catch (error) {
        console.error(error) // Exibe o erro técnico no console para debug
        this.erro = 'Não foi possível ler a planilha.' // Define mensagem amigável caso ocorra falha de leitura
      }
    },


    tratarDados() {
      // 1. LIMPEZA GERAL: remove espaços (pontas e repetidos no meio) e padroniza o nome das colunas
      const numerosLinha = []   // Número real de cada linha no Excel
      const avisosLimpeza = []  // Avisos de espaços removidos, por linha

      const linhasLimpas = this.dadosOriginais.map((linha, indice) => {
        const limpa = {}
        const avisos = []

        for (const [chave, valor] of Object.entries(linha)) {
          if (chave === '__rowNum__') continue // Campo interno da biblioteca, não é coluna da planilha

          const nomeColuna = normalizarCabecalho(chave)
          let novoValor = valor

          if (typeof valor === 'string') {
            novoValor = limparTexto(valor)
            if (novoValor !== valor) {
              avisos.push(criarErro(nomeColuna, 'espacos', 'Espaços desnecessários removidos.'))
            }
          }

          limpa[nomeColuna] = novoValor
        }

        // __rowNum__ é a posição real da linha (começa em 0); +1 converte para o número do Excel
        // Assim, linhas em branco no meio da planilha não deslocam a contagem
        numerosLinha.push((linha.__rowNum__ ?? indice + 1) + 1)
        avisosLimpeza.push(avisos)
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
      const colunaEmail = colunasPlanilha.find(coluna => /^e[-_]?mail/.test(coluna)) // Aceita email, e-mail, e_mail, email_cliente...
      this.possuiColunaEmail = Boolean(colunaEmail)

      // 4. DUPLICADOS: primeira passada para saber em quais linhas cada código aparece
      //    (assim TODAS as ocorrências são marcadas, inclusive a primeira)
      const linhasPorCodigo = new Map()
      linhasLimpas.forEach((linha, indice) => {
        const codigo = normalizarCodigo(linha.codigo_cliente)
        if (!codigo) return
        if (!linhasPorCodigo.has(codigo)) linhasPorCodigo.set(codigo, [])
        linhasPorCodigo.get(codigo).push(numerosLinha[indice])
      })

      // 5. VALIDAÇÃO LINHA A LINHA
      this.dadosTratados = linhasLimpas.map((linha, indice) => {
        const novaLinha = { ...linha }   // Cria um novo objeto para a linha atual
        const erros = []                 // Armazena os erros encontrados nesta linha
        const avisos = [...avisosLimpeza[indice]] // Avisos de correções automáticas (começa com os de espaços)
        const numeroLinha = numerosLinha[indice]  // Número real da linha no Excel

        // Registra um aviso quando um texto foi alterado para ficar no padrão
        const registrarPadronizacao = (campo, antes, depois) => {
          // Ignora diferenças só de espaço (o formatador de moeda usa um espaço especial) — espaços têm aviso próprio
          const semEspaco = (texto) => String(texto).replace(/\s/g, '')
          if (typeof antes === 'string' && semEspaco(antes) !== semEspaco(depois)) {
            avisos.push(criarErro(campo, 'padronizado', `"${antes}" padronizado para "${depois}".`))
          }
        }
        novaLinha.faturamento_numero = null // Valor numérico do faturamento (preenchido abaixo se for válido)

        // CÓDIGO DO CLIENTE
        if (estaVazio(novaLinha.codigo_cliente)) {
          erros.push(criarErro('codigo_cliente', 'vazio', 'Campo obrigatório em branco.'))
        } else {
          const codigo = normalizarCodigo(novaLinha.codigo_cliente)
          registrarPadronizacao('codigo_cliente', novaLinha.codigo_cliente, codigo)
          novaLinha.codigo_cliente = codigo // Padroniza o código para maiúsculas

          if (!/^CTI\d{3}$/.test(codigo)) {
            erros.push(criarErro('codigo_cliente', 'fora_do_padrao', 'Código inválido. Use o formato CTI001, CTI002...'))
          }

          const linhasIguais = linhasPorCodigo.get(codigo) || []
          if (linhasIguais.length > 1) {
            const outras = linhasIguais.filter(numero => numero !== numeroLinha)
            erros.push(criarErro('codigo_cliente', 'duplicado', `Código ${codigo} duplicado (também aparece na(s) linha(s) ${outras.join(', ')}).`))
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
            registrarPadronizacao('segmento', novaLinha.segmento, oficial)
            novaLinha.segmento = oficial // Padroniza o texto (ex: "ind." vira "Indústria")
          } else {
            erros.push(criarErro('segmento', 'fora_do_padrao', `Segmento "${novaLinha.segmento}" fora do padrão. Use: Indústria, Comércio, Serviços, Saúde, Educação, Tecnologia ou Outros.`))
          }
        }

        // NÍVEL DO CLIENTE
        if (typeof novaLinha.nivel_cliente === 'string') {
          registrarPadronizacao('nivel_cliente', novaLinha.nivel_cliente, novaLinha.nivel_cliente.toUpperCase())
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
            const formatado = numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) // Texto formatado para exibição
            registrarPadronizacao('faturamento_anual', novaLinha.faturamento_anual, formatado)
            novaLinha.faturamento_numero = numero // Guarda o número puro (para somar, ordenar, filtrar)
            novaLinha.faturamento_anual = formatado
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
            registrarPadronizacao('data_contratacao', novaLinha.data_contratacao, dataFormatada)
            novaLinha.data_contratacao = dataFormatada // Padroniza para DD/MM/AAAA

            if (dataNoFuturo(dataFormatada)) {
              erros.push(criarErro('data_contratacao', 'fora_do_padrao', 'A data de contratação não pode ser futura.'))
            }
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
          registrarPadronizacao('uf', novaLinha.uf, novaLinha.uf.toUpperCase())
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
            const emailMinusculo = String(novaLinha[colunaEmail]).toLowerCase()
            registrarPadronizacao(colunaEmail, novaLinha[colunaEmail], emailMinusculo)
            novaLinha[colunaEmail] = emailMinusculo // Padroniza e-mail para minúsculas

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novaLinha[colunaEmail])) {
              erros.push(criarErro(colunaEmail, 'email_invalido', 'E-mail inválido. Use o formato nome@dominio.com.'))
            }
          }
        }

        // RESULTADO DA LINHA
        novaLinha.numero_linha = numeroLinha // Atribui o número da linha física do Excel
        novaLinha.erros = erros              // Atribui a lista de erros acumulados desta linha
        novaLinha.avisos = avisos            // Atribui a lista de correções automáticas desta linha

        return novaLinha // Retorna o objeto tratado para o array de dados tratados
      })
    },


    limpar() {
      this.arquivo = null            // Reseta o arquivo carregado
      this.dadosOriginais = []       // Limpa os dados brutos
      this.dadosTratados = []        // Limpa os dados tratados
      this.erro = ''                 // Limpa mensagens de erro
      this.dataUpload = null         // Reseta a data e hora do upload
      this.possuiColunaEmail = false // Reseta a informação da coluna de e-mail
    }
  }
})