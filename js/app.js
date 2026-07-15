/* ==========================================
   KAWR BUSINESS v2.0
   app.js - Controlador Principal da Aplicação
========================================== */

// ===== VARIÁVEIS GLOBAIS =====
let mesSelecionado = obterMesAtual();

// ===== INICIALIZAÇÃO =====

/**
 * Inicializa o dashboard com dados do usuário
 */
async function inicializarDashboard() {
    const usuario = AUTH.obterUsuarioAtual();
    if (!usuario) return;

    try {
        // Carregar dados
        await carregarDadosEmpresa();
        await carregarFinanceiro();
        await carregarScore(usuario.id, mesSelecionado);
        await carregarAlertas(usuario.id, mesSelecionado);
        await atualizarGraficos(usuario.id);
        await atualizarDashboard();

        // Atualizar data
        document.getElementById('dataAtual').textContent = obterDataAtual();

    } catch (erro) {
        console.error("Erro ao inicializar dashboard:", erro);
    }
}

/**
 * Atualiza o dashboard com dados financeiros
 * @param {object} financeiro - Dados financeiros (opcional)
 */
async function atualizarDashboard(financeiro = null) {
    const usuario = AUTH.obterUsuarioAtual();
    if (!usuario) return;

    try {
        // Se não houver dados financeiros, carregar do banco
        if (!financeiro) {
            financeiro = await DB.obterFinanceiro(usuario.id, mesSelecionado);
        }

        if (!financeiro) {
            // Mostrar estado vazio
            document.getElementById('cardReceita').textContent = 'R$ 0,00';
            document.getElementById('cardLucro').textContent = 'R$ 0,00';
            document.getElementById('cardDespesas').textContent = 'R$ 0,00';
            document.getElementById('cardFluxo').textContent = 'R$ 0,00';
            document.getElementById('cardImpostos').textContent = 'R$ 0,00';
            return;
        }

        // Atualizar cards
        document.getElementById('cardReceita').textContent = formatarMoeda(financeiro.receitaBruta);
        document.getElementById('cardLucro').textContent = formatarMoeda(financeiro.lucroLiquido);
        document.getElementById('cardDespesas').textContent = formatarMoeda(financeiro.despesasTotal);
        document.getElementById('cardFluxo').textContent = formatarMoeda(financeiro.fluxoCaixa);
        document.getElementById('cardImpostos').textContent = formatarMoeda(financeiro.impostos);

        // Atualizar comparações (simulado - em produção, comparar com mês anterior)
        document.getElementById('compReceita').innerHTML = '<span class="badge-up">↑ +5%</span> vs. mês anterior';
        document.getElementById('compLucro').innerHTML = '<span class="badge-up">↑ +8%</span> vs. mês anterior';
        document.getElementById('compDespesas').innerHTML = '<span class="badge-down">↓ -2%</span> vs. mês anterior';
        document.getElementById('compFluxo').innerHTML = '<span class="badge-up">↑ Saudável</span>';

        // Atualizar histórico
        await atualizarHistorico(usuario.id, mesSelecionado);

    } catch (erro) {
        console.error("Erro ao atualizar dashboard:", erro);
    }
}

/**
 * Atualiza a seção de histórico
 * @param {string} usuarioId - ID do usuário
 * @param {string} mes - Mês (YYYY-MM)
 */
async function atualizarHistorico(usuarioId, mes) {
    try {
        const financeiro = await DB.obterFinanceiro(usuarioId, mes);
        const mesAnterior = obterMesAnterior(mes);
        const financeirAnterior = await DB.obterFinanceiro(usuarioId, mesAnterior);

        if (financeiro) {
            document.getElementById('histReceita').textContent = formatarMoeda(financeiro.receitaBruta);
            document.getElementById('histLucro').textContent = formatarMoeda(financeiro.lucroLiquido);
            document.getElementById('histDespesas').textContent = formatarMoeda(financeiro.despesasTotal);
            document.getElementById('histFluxo').textContent = formatarMoeda(financeiro.fluxoCaixa);

            // Calcular variações
            if (financeirAnterior) {
                const varReceita = calcularVariacao(financeiro.receitaBruta, financeirAnterior.receitaBruta);
                const varLucro = calcularVariacao(financeiro.lucroLiquido, financeirAnterior.lucroLiquido);
                const varDespesas = calcularVariacao(financeiro.despesasTotal, financeirAnterior.despesasTotal);
                const varFluxo = calcularVariacao(financeiro.fluxoCaixa, financeirAnterior.fluxoCaixa);

                document.getElementById('histReceitaComp').textContent = 
                    (varReceita > 0 ? '↑' : '↓') + ' ' + Math.abs(varReceita).toFixed(1) + '%';
                document.getElementById('histLucroComp').textContent = 
                    (varLucro > 0 ? '↑' : '↓') + ' ' + Math.abs(varLucro).toFixed(1) + '%';
                document.getElementById('histDespesasComp').textContent = 
                    (varDespesas > 0 ? '↑' : '↓') + ' ' + Math.abs(varDespesas).toFixed(1) + '%';
                document.getElementById('histFluxoComp').textContent = 
                    (varFluxo > 0 ? '↑' : '↓') + ' ' + Math.abs(varFluxo).toFixed(1) + '%';
            }

            // Score
            const score = await DB.obterScore(usuarioId, mes);
            if (score) {
                document.getElementById('histScore').textContent = Math.round(score.valor);
            }
        }

        // Atualizar seletor de mês
        document.getElementById('mesSelecionado').textContent = formatarMes(mes + '-01');

    } catch (erro) {
        console.error("Erro ao atualizar histórico:", erro);
    }
}

// ===== NAVEGAÇÃO =====

/**
 * Muda para uma seção específica
 * @param {string} secao - ID da seção
 */
function irParaSecao(secao) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });

    // Mostrar seção selecionada
    const secaoElement = document.getElementById(secao);
    if (secaoElement) {
        secaoElement.classList.add('active');
    }

    // Atualizar nav ativa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${secao}"]`)?.classList.add('active');

    // Scroll para o topo
    window.scrollTo(0, 0);
}

// ===== EVENT LISTENERS =====

// Navegação Sidebar
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const secao = this.getAttribute('data-section');
        irParaSecao(secao);
        
        // Fechar sidebar em mobile
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 768) {
            sidebar.classList.remove('active');
        }
    });
});

// Toggle Sidebar (Mobile)
document.getElementById('toggleSidebar')?.addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
});

// Fechar sidebar ao clicar fora (Mobile)
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('toggleSidebar');
    
    if (window.innerWidth < 768 && 
        !sidebar.contains(e.target) && 
        !toggle.contains(e.target) &&
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

// Histórico - Navegação de Meses
document.getElementById('btnMesAnterior')?.addEventListener('click', async function() {
    mesSelecionado = obterMesAnterior(mesSelecionado);
    const usuario = AUTH.obterUsuarioAtual();
    if (usuario) {
        await atualizarHistorico(usuario.id, mesSelecionado);
        await atualizarDashboard();
        await carregarScore(usuario.id, mesSelecionado);
        await carregarAlertas(usuario.id, mesSelecionado);
    }
});

document.getElementById('btnProxMes')?.addEventListener('click', async function() {
    mesSelecionado = obterProxMes(mesSelecionado);
    const usuario = AUTH.obterUsuarioAtual();
    if (usuario) {
        await atualizarHistorico(usuario.id, mesSelecionado);
        await atualizarDashboard();
        await carregarScore(usuario.id, mesSelecionado);
        await carregarAlertas(usuario.id, mesSelecionado);
    }
});

// Tema
document.getElementById('selectTema')?.addEventListener('change', function(e) {
    const tema = e.target.value;
    if (tema === 'claro') {
        document.body.style.filter = 'invert(1)';
        salvarLocal('kawr_tema', 'claro');
    } else {
        document.body.style.filter = 'none';
        salvarLocal('kawr_tema', 'escuro');
    }
});

// Carregar tema salvo
const temaSalvo = recuperarLocal('kawr_tema') || 'escuro';
if (temaSalvo === 'claro') {
    document.getElementById('selectTema').value = 'claro';
    document.body.style.filter = 'invert(1)';
}

// ===== INICIALIZAÇÃO GERAL =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Kawr Business v2.0 iniciando...');
    
    // Verificar autenticação
    if (AUTH.estaAutenticado()) {
        esconder('#modalLogin');
        inicializarDashboard();
    } else {
        mostrar('#modalLogin');
    }

    // Ir para dashboard por padrão
    irParaSecao('dashboard');
});

// ===== RESPONSIVIDADE =====

window.addEventListener('resize', function() {
    // Ajustar layout em mudanças de tamanho
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth >= 768) {
        sidebar.classList.remove('active');
    }
});

console.log("✅ App carregado e pronto");
