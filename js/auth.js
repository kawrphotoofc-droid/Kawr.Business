/* ==========================================
   KAWR BUSINESS v2.0
   auth.js - Autenticação Firebase
========================================== */

// ===== VARIÁVEIS GLOBAIS =====
let usuarioAtual = null;
let autenticado = false;

// ===== INICIALIZAÇÃO DO FIREBASE =====
// Nota: Em produção, use a CDN do Firebase
// <script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"></script>

// Para desenvolvimento local, usaremos localStorage como simulação
const AUTH = {
    usuarios: recuperarLocal('kawr_usuarios') || {},
    sessao: recuperarLocal('kawr_sessao') || null,

    /**
     * Registra novo usuário
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha do usuário
     * @param {string} nome - Nome do usuário
     * @returns {Promise} Resultado do registro
     */
    registrar: async function(email, senha, nome) {
        return new Promise((resolve, reject) => {
            // Validações
            if (!validarEmail(email)) {
                reject(new Error("Email inválido"));
                return;
            }

            if (this.usuarios[email]) {
                reject(new Error("Email já cadastrado"));
                return;
            }

            const validacaoSenha = validarSenha(senha);
            if (!validacaoSenha.valida) {
                reject(new Error("Senha fraca: " + validacaoSenha.erros.join(", ")));
                return;
            }

            // Criar usuário
            const usuario = {
                id: 'user_' + Date.now(),
                email: email,
                nome: nome,
                senha: btoa(senha), // Simples encoding (em produção, usar hash seguro)
                criadoEm: new Date().toISOString(),
                empresa: null,
                ultimoLogin: null
            };

            this.usuarios[email] = usuario;
            salvarLocal('kawr_usuarios', this.usuarios);

            resolve({
                sucesso: true,
                mensagem: "Usuário registrado com sucesso",
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    nome: usuario.nome
                }
            });
        });
    },

    /**
     * Faz login do usuário
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha do usuário
     * @returns {Promise} Resultado do login
     */
    login: async function(email, senha) {
        return new Promise((resolve, reject) => {
            // Validações
            if (!validarEmail(email)) {
                reject(new Error("Email inválido"));
                return;
            }

            const usuario = this.usuarios[email];
            if (!usuario) {
                reject(new Error("Usuário não encontrado"));
                return;
            }

            if (usuario.senha !== btoa(senha)) {
                reject(new Error("Senha incorreta"));
                return;
            }

            // Criar sessão
            const sessao = {
                usuarioId: usuario.id,
                email: usuario.email,
                nome: usuario.nome,
                loginEm: new Date().toISOString(),
                token: 'token_' + Date.now() + '_' + Math.random().toString(36)
            };

            this.sessao = sessao;
            usuarioAtual = usuario;
            autenticado = true;

            salvarLocal('kawr_sessao', sessao);
            usuario.ultimoLogin = new Date().toISOString();
            this.usuarios[email] = usuario;
            salvarLocal('kawr_usuarios', this.usuarios);

            resolve({
                sucesso: true,
                mensagem: "Login realizado com sucesso",
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    nome: usuario.nome
                }
            });
        });
    },

    /**
     * Faz logout do usuário
     * @returns {Promise} Resultado do logout
     */
    logout: async function() {
        return new Promise((resolve) => {
            usuarioAtual = null;
            autenticado = false;
            this.sessao = null;
            removerLocal('kawr_sessao');

            resolve({
                sucesso: true,
                mensagem: "Logout realizado com sucesso"
            });
        });
    },

    /**
     * Verifica se usuário está autenticado
     * @returns {boolean} True se autenticado
     */
    estaAutenticado: function() {
        if (this.sessao && this.sessao.token) {
            usuarioAtual = this.usuarios[this.sessao.email];
            autenticado = true;
            return true;
        }
        return false;
    },

    /**
     * Obtém usuário atual
     * @returns {object} Dados do usuário ou null
     */
    obterUsuarioAtual: function() {
        if (this.estaAutenticado()) {
            return {
                id: usuarioAtual.id,
                email: usuarioAtual.email,
                nome: usuarioAtual.nome,
                empresa: usuarioAtual.empresa
            };
        }
        return null;
    },

    /**
     * Recupera senha (simulado)
     * @param {string} email - Email do usuário
     * @returns {Promise} Resultado da recuperação
     */
    recuperarSenha: async function(email) {
        return new Promise((resolve, reject) => {
            if (!this.usuarios[email]) {
                reject(new Error("Email não encontrado"));
                return;
            }

            // Em produção, enviar email com link de recuperação
            resolve({
                sucesso: true,
                mensagem: "Email de recuperação enviado (simulado)"
            });
        });
    },

    /**
     * Atualiza dados do usuário
     * @param {string} email - Email do usuário
     * @param {object} dados - Dados a atualizar
     * @returns {Promise} Resultado da atualização
     */
    atualizarUsuario: async function(email, dados) {
        return new Promise((resolve, reject) => {
            const usuario = this.usuarios[email];
            if (!usuario) {
                reject(new Error("Usuário não encontrado"));
                return;
            }

            if (dados.nome) usuario.nome = dados.nome;
            if (dados.empresa) usuario.empresa = dados.empresa;

            this.usuarios[email] = usuario;
            salvarLocal('kawr_usuarios', this.usuarios);

            if (usuarioAtual && usuarioAtual.email === email) {
                usuarioAtual = usuario;
            }

            resolve({
                sucesso: true,
                mensagem: "Usuário atualizado com sucesso"
            });
        });
    }
};

// ===== EVENT LISTENERS =====

// Tabs de Login/Cadastro
document.getElementById('tabLogin')?.addEventListener('click', function() {
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('tabCadastro').classList.remove('active');
    document.getElementById('tabLoginContent').classList.add('active');
    document.getElementById('tabCadastroContent').classList.remove('active');
});

document.getElementById('tabCadastro')?.addEventListener('click', function() {
    document.getElementById('tabCadastro').classList.add('active');
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('tabCadastroContent').classList.add('active');
    document.getElementById('tabLoginContent').classList.remove('active');
});

// Formulário de Login
document.getElementById('formLogin')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;

    try {
        const resultado = await AUTH.login(email, senha);
        notificarSucesso(resultado.mensagem);
        document.getElementById('modalLogin').classList.add('hidden');
        inicializarDashboard();
    } catch (erro) {
        notificarErro(erro.message);
    }
});

// Formulário de Cadastro
document.getElementById('formCadastro')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('cadastroNome').value.trim();
    const email = document.getElementById('cadastroEmail').value.trim();
    const senha = document.getElementById('cadastroSenha').value;
    const confirmar = document.getElementById('cadastroConfirm').value;

    if (senha !== confirmar) {
        notificarErro("As senhas não conferem");
        return;
    }

    try {
        const resultado = await AUTH.registrar(email, senha, nome);
        notificarSucesso(resultado.mensagem);
        
        // Limpar formulário e voltar para login
        document.getElementById('formCadastro').reset();
        document.getElementById('tabLogin').click();
    } catch (erro) {
        notificarErro(erro.message);
    }
});

// Botão Logout
document.getElementById('btnLogout')?.addEventListener('click', async function() {
    if (confirm("Deseja sair do sistema?")) {
        await AUTH.logout();
        location.reload();
    }
});

// Link Recuperar Senha
document.getElementById('linkRecuperarSenha')?.addEventListener('click', async function(e) {
    e.preventDefault();
    const email = prompt("Digite seu email:");
    if (email) {
        try {
            const resultado = await AUTH.recuperarSenha(email);
            notificarSucesso(resultado.mensagem);
        } catch (erro) {
            notificarErro(erro.message);
        }
    }
});

// ===== INICIALIZAÇÃO =====

/**
 * Inicializa o dashboard após autenticação
 */
function inicializarDashboard() {
    const usuario = AUTH.obterUsuarioAtual();
    if (usuario) {
        document.getElementById('empresaNome').textContent = usuario.nome || "Minha Empresa";
        document.getElementById('saudacao').textContent = `Bem-vindo, ${usuario.nome}!`;
        document.getElementById('dataAtual').textContent = obterDataAtual();
        
        // Carregar dados da empresa
        carregarDadosEmpresa();
    }
}

/**
 * Verifica autenticação ao carregar a página
 */
function verificarAutenticacao() {
    if (AUTH.estaAutenticado()) {
        esconder('#modalLogin');
        inicializarDashboard();
    } else {
        mostrar('#modalLogin');
    }
}

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', verificarAutenticacao);

console.log("✅ Auth carregado");
