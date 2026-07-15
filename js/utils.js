/* ==========================================
   KAWR BUSINESS v2.0
   utils.js - Funções Utilitárias
========================================== */

// ===== FORMATAÇÃO =====

/**
 * Formata número como moeda brasileira
 * @param {number} valor - Valor a formatar
 * @returns {string} Valor formatado (R$ X,XX)
 */
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

/**
 * Formata número com 2 casas decimais
 * @param {number} valor - Valor a formatar
 * @returns {string} Valor formatado
 */
function formatarNumero(valor) {
    return Number(valor).toFixed(2).replace('.', ',');
}

/**
 * Formata data para formato brasileiro
 * @param {Date|string} data - Data a formatar
 * @returns {string} Data formatada (DD/MM/YYYY)
 */
function formatarData(data) {
    if (typeof data === 'string') {
        data = new Date(data);
    }
    return new Intl.DateTimeFormat('pt-BR').format(data);
}

/**
 * Formata data para formato de mês/ano
 * @param {Date|string} data - Data a formatar
 * @returns {string} Mês/ano formatado
 */
function formatarMes(data) {
    if (typeof data === 'string') {
        data = new Date(data);
    }
    return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
    }).format(data);
}

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ sem formatação
 * @returns {string} CNPJ formatado (XX.XXX.XXX/XXXX-XX)
 */
function formatarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Remove formatação de moeda
 * @param {string} valor - Valor formatado
 * @returns {number} Valor numérico
 */
function desformatarMoeda(valor) {
    if (typeof valor !== 'string') return Number(valor);
    return Number(valor.replace(/[^\d,-]/g, '').replace(',', '.'));
}

// ===== CÁLCULOS FINANCEIROS =====

/**
 * Calcula lucro líquido
 * @param {number} receita - Receita bruta
 * @param {number} despesas - Despesas totais
 * @returns {number} Lucro líquido
 */
function calcularLucro(receita, despesas) {
    return Math.max(0, receita - despesas);
}

/**
 * Calcula margem de lucro
 * @param {number} receita - Receita bruta
 * @param {number} lucro - Lucro líquido
 * @returns {number} Margem em percentual
 */
function calcularMargem(receita, lucro) {
    if (receita <= 0) return 0;
    return (lucro / receita) * 100;
}

/**
 * Calcula fator R (folha / receita)
 * @param {number} receita - Receita bruta
 * @param {number} folha - Folha de pagamento
 * @returns {number} Fator R
 */
function calcularFatorR(receita, folha) {
    if (receita <= 0) return 0;
    return folha / receita;
}

/**
 * Identifica anexo do Simples Nacional
 * @param {number} fatorR - Fator R
 * @returns {string} Nome do anexo
 */
function identificarAnexo(fatorR) {
    if (fatorR >= 0.28) {
        return "Anexo III";
    }
    return "Anexo V";
}

/**
 * Calcula DAS estimado
 * @param {number} receita - Receita bruta
 * @param {string} anexo - Nome do anexo
 * @returns {number} DAS estimado
 */
function calcularDAS(receita, anexo) {
    let aliquota = 0;
    
    switch(anexo) {
        case "Anexo III":
            aliquota = KAWR.ANEXOS.III.aliquota;
            break;
        case "Anexo IV":
            aliquota = KAWR.ANEXOS.IV.aliquota;
            break;
        case "Anexo V":
            aliquota = KAWR.ANEXOS.V.aliquota;
            break;
        default:
            aliquota = 0;
    }
    
    return receita * aliquota;
}

/**
 * Calcula variação percentual
 * @param {number} atual - Valor atual
 * @param {number} anterior - Valor anterior
 * @returns {number} Variação em percentual
 */
function calcularVariacao(atual, anterior) {
    if (anterior === 0) return 0;
    return ((atual - anterior) / anterior) * 100;
}

// ===== VALIDAÇÕES =====

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ a validar
 * @returns {boolean} True se válido
 */
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = 0;
    
    for (let i = tamanho - 1; i >= 0; i--) {
        soma += numeros.charAt(tamanho - 1 - i) * (pos + 2);
        pos++;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = 0;
    
    for (let i = tamanho - 1; i >= 0; i--) {
        soma += numeros.charAt(tamanho - 1 - i) * (pos + 2);
        pos++;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
}

/**
 * Valida email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida senha
 * @param {string} senha - Senha a validar
 * @returns {object} Resultado da validação
 */
function validarSenha(senha) {
    const resultado = {
        valida: true,
        erros: []
    };
    
    if (senha.length < 8) {
        resultado.valida = false;
        resultado.erros.push("Mínimo 8 caracteres");
    }
    
    if (!/[A-Z]/.test(senha)) {
        resultado.valida = false;
        resultado.erros.push("Deve conter letra maiúscula");
    }
    
    if (!/[a-z]/.test(senha)) {
        resultado.valida = false;
        resultado.erros.push("Deve conter letra minúscula");
    }
    
    if (!/[0-9]/.test(senha)) {
        resultado.valida = false;
        resultado.erros.push("Deve conter número");
    }
    
    return resultado;
}

// ===== ARMAZENAMENTO LOCAL =====

/**
 * Salva dados no localStorage
 * @param {string} chave - Chave de armazenamento
 * @param {any} dados - Dados a salvar
 */
function salvarLocal(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
    } catch (erro) {
        console.error("Erro ao salvar dados localmente:", erro);
    }
}

/**
 * Recupera dados do localStorage
 * @param {string} chave - Chave de armazenamento
 * @returns {any} Dados recuperados ou null
 */
function recuperarLocal(chave) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : null;
    } catch (erro) {
        console.error("Erro ao recuperar dados localmente:", erro);
        return null;
    }
}

/**
 * Remove dados do localStorage
 * @param {string} chave - Chave de armazenamento
 */
function removerLocal(chave) {
    try {
        localStorage.removeItem(chave);
    } catch (erro) {
        console.error("Erro ao remover dados localmente:", erro);
    }
}

/**
 * Limpa todo o localStorage
 */
function limparLocal() {
    try {
        localStorage.clear();
    } catch (erro) {
        console.error("Erro ao limpar localStorage:", erro);
    }
}

// ===== DOM MANIPULATION =====

/**
 * Mostra elemento
 * @param {string|HTMLElement} elemento - Seletor CSS ou elemento
 */
function mostrar(elemento) {
    if (typeof elemento === 'string') {
        elemento = document.querySelector(elemento);
    }
    if (elemento) {
        elemento.classList.remove('hidden');
        elemento.style.display = '';
    }
}

/**
 * Esconde elemento
 * @param {string|HTMLElement} elemento - Seletor CSS ou elemento
 */
function esconder(elemento) {
    if (typeof elemento === 'string') {
        elemento = document.querySelector(elemento);
    }
    if (elemento) {
        elemento.classList.add('hidden');
        elemento.style.display = 'none';
    }
}

/**
 * Alterna visibilidade de elemento
 * @param {string|HTMLElement} elemento - Seletor CSS ou elemento
 */
function alternar(elemento) {
    if (typeof elemento === 'string') {
        elemento = document.querySelector(elemento);
    }
    if (elemento) {
        elemento.classList.toggle('hidden');
    }
}

/**
 * Adiciona classe a elemento
 * @param {string|HTMLElement} elemento - Seletor CSS ou elemento
 * @param {string} classe - Nome da classe
 */
function adicionarClasse(elemento, classe) {
    if (typeof elemento === 'string') {
        elemento = document.querySelector(elemento);
    }
    if (elemento) {
        elemento.classList.add(classe);
    }
}

/**
 * Remove classe de elemento
 * @param {string|HTMLElement} elemento - Seletor CSS ou elemento
 * @param {string} classe - Nome da classe
 */
function removerClasse(elemento, classe) {
    if (typeof elemento === 'string') {
        elemento = document.querySelector(elemento);
    }
    if (elemento) {
        elemento.classList.remove(classe);
    }
}

// ===== NOTIFICAÇÕES =====

/**
 * Cria e mostra notificação visual
 * @param {string} mensagem - Mensagem a exibir
 * @param {string} tipo - Tipo: 'sucesso', 'erro', 'aviso'
 * @param {number} duracao - Duração em ms
 */
function criarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
    // Criar container se não existir
    let container = document.getElementById('notificacoes-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificacoes-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    // Criar notificação
    const notif = document.createElement('div');
    const cores = {
        'sucesso': '#10b981',
        'erro': '#ef4444',
        'aviso': '#f59e0b',
        'info': '#3b82f6'
    };
    const icones = {
        'sucesso': '✅',
        'erro': '❌',
        'aviso': '⚠️',
        'info': 'ℹ️'
    };

    notif.style.cssText = `
        background: ${cores[tipo] || cores['info']};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    notif.innerHTML = `<span>${icones[tipo]}</span><span>${mensagem}</span>`;

    container.appendChild(notif);

    // Auto remover
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notif.remove(), 300);
    }, duracao);
}

// Adicionar animações CSS
if (!document.getElementById('notificacoes-style')) {
    const style = document.createElement('style');
    style.id = 'notificacoes-style';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Mostra notificação de sucesso
 * @param {string} mensagem - Mensagem a exibir
 * @param {number} duracao - Duração em ms (padrão: 3000)
 */
function notificarSucesso(mensagem, duracao = 3000) {
    console.log("✅ " + mensagem);
    criarNotificacao(mensagem, 'sucesso', duracao);
}

/**
 * Mostra notificação de erro
 * @param {string} mensagem - Mensagem a exibir
 * @param {number} duracao - Duração em ms (padrão: 5000)
 */
function notificarErro(mensagem, duracao = 5000) {
    console.error("❌ " + mensagem);
    criarNotificacao(mensagem, 'erro', duracao);
}

/**
 * Mostra notificação de aviso
 * @param {string} mensagem - Mensagem a exibir
 * @param {number} duracao - Duração em ms (padrão: 4000)
 */
function notificarAviso(mensagem, duracao = 4000) {
    console.warn("⚠️ " + mensagem);
    criarNotificacao(mensagem, 'aviso', duracao);
}

/**
 * Mostra notificação de informação
 * @param {string} mensagem - Mensagem a exibir
 * @param {number} duracao - Duração em ms (padrão: 3000)
 */
function notificarInfo(mensagem, duracao = 3000) {
    console.info("ℹ️ " + mensagem);
    criarNotificacao(mensagem, 'info', duracao);
}

// ===== DATAS =====

/**
 * Obtém data atual
 * @returns {string} Data atual formatada
 */
function obterDataAtual() {
    return formatarData(new Date());
}

/**
 * Obtém mês/ano atual
 * @returns {string} Mês/ano atual (YYYY-MM)
 */
function obterMesAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
}

/**
 * Obtém mês anterior
 * @param {string} mes - Mês no formato YYYY-MM
 * @returns {string} Mês anterior
 */
function obterMesAnterior(mes) {
    const data = new Date(mes + '-01');
    data.setMonth(data.getMonth() - 1);
    const ano = data.getFullYear();
    const mesNum = String(data.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mesNum}`;
}

/**
 * Obtém próximo mês
 * @param {string} mes - Mês no formato YYYY-MM
 * @returns {string} Próximo mês
 */
function obterProxMes(mes) {
    const data = new Date(mes + '-01');
    data.setMonth(data.getMonth() + 1);
    const ano = data.getFullYear();
    const mesNum = String(data.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mesNum}`;
}

console.log("✅ Utils carregados");
