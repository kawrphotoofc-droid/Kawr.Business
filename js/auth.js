/* ==========================================
   KAWR BUSINESS v2.0
   auth.js - Autenticação Robusta
========================================== */

// ===== VARIÁVEIS GLOBAIS =====
let usuarioAtual = null;
let autenticado = false;

// ===== OBJETO DE AUTENTICAÇÃO =====
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
            try {
                // Validações
                if (!email || !email.trim()) {
                    reject(new Error("Email é obrigatório"));
                    return;
                }

                if (!validarEmail(email)) {
                    reject(new Error("Email inválido. Use um email válido (ex: seu@email.com)"));
                    return;
                }

                const emailLower = email.toLowerCase();
                if (this.usuarios[emailLower]) {
                    reject(new Error("Este email já está cadastrado. Tente fazer login."));
                    return;
                }

                if (!nome || !nome.trim()) {
                    reject(new Error("Nome é obrigatório"));
                    return;
                }

                if (!senha || senha.length === 0) {
                    reject(new Error("Senha é obrigatória"));
                    return;
                }

                const validacaoSenha = validarSenha(senha);
                if (!validacaoSenha.valida) {
                    reject(new Error("Senha fraca: " + validacaoSenha.erros.join(", ")));
                    return;
                }

                // Criar usuário
                const usuario = {
                    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    email: email.toLowerCase(),
                    nome: nome.trim(),
                    senha: btoa(senha), // Encoding simples (em produção, usar bcrypt)
                    criadoEm: new Date().toISOString(),
                    empresa: null,
                    ultimoLogin: null
                };

                this.usuarios[email.toLowerCase()] = usuario;
                salvarLocal('kawr_usuarios', this.usuarios);

                console.log("✅ Usuário registrado:", email);

                resolve({
                    sucesso: true,
                    mensagem: "Conta criada com sucesso! Faça login para continuar.",
                    usuario: {
                        id: usuario.id,
                        email: usuario.email,
                        nome: usuario.nome
                    }
                });
            } catch (erro) {
                reject(erro);
            }
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
            try {
                // Validações
                if (!email || !email.trim()) {
                    reject(new Error("Email é obrigatório"));
                    return;
                }

                if (!validarEmail(email)) {
                    reject(new Error("Email inválido"));
                    return;
                }

                if (!senha || senha.length === 0) {
                    reject(new Error("Senha é obrigatória"));
                    return;
                }

                const emailLower = email.toLowerCase();
                const usuario = this.usuarios[emailLower];

                if (!usuario) {
                    reject(new Error("Email ou senha incorretos"));
                    return;
                }

                // Verificar senha
                const senhaDecodificada = atob(usuario.senha);
                if (senhaDecodificada !== senha) {
                    reject(new Error("Email ou senha incorretos"));
                    return;
                }

                // Criar sessão
                const sessao = {
                    usuarioId: usuario.id,
                    email: usuario.email,
                    nome: usuario.nome,
                    loginEm: new Date().toISOString(),
                    token: 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    ativo: true
                };

                this.sessao = sessao;
                usuarioAtual = usuario;
                autenticado = true;

                salvarLocal('kawr_sessao', sessao);
                usuario.ultimoLogin = new Date().toISOString();
                this.usuarios[emailLower] = usuario;
                salvarLocal('kawr_usuarios', this.usuarios);

                console.log("✅ Login realizado:", email);

                resolve({
                    sucesso: true,
                    mensagem: "Login realizado com sucesso!",
                    usuario: {
                        id: usuario.id,
                        email: usuario.email,
                        nome: usuario.nome
                    }
                });
            } catch (erro) {
                reject(erro);
            }
        });
    },

    /**
     * Faz logout do usuário
     * @returns {Promise} Resultado do logout
     */
    logout: async function() {
        return new Promise((resolve) => {
            try {
                const emailAtual = usuarioAtual?.email;
                usuarioAtual = null;
                autenticado = false;
                this.sessao = null;
                removerLocal('kawr_sessao');

                console.log("✅ Logout realizado");

                resolve({
                    sucesso: true,
                    mensagem: "Você foi desconectado"
                });
            } catch (erro) {
                console.error("Erro no logout:", erro);
                resolve({
                    sucesso: true,
                    mensagem: "Desconectado"
                });
            }
        });
    },

    /**
     * Verifica se usuário está autenticado
     * @returns {boolean} True se autenticado
     */
    estaAutenticado: function() {
        try {
            if (this.sessao && this.sessao.token && this.sessao.ativo) {
                const usuario = this.usuarios[this.sessao.email];
                if (usuario) {
                    usuarioAtual = usuario;
                    autenticado = true;
                    return true;
                }
            }
        } catch (erro) {
            console.error("Erro ao verificar autenticação:", erro);
        }
        return false;
    },

    /**
     * Obtém usuário atual
     * @returns {object} Dados do usuário ou null
     */
    obterUsuarioAtual: function() {
        if (this.estaAutenticado() && usuarioAtual) {
            return {
                id: usuarioAtual.id,
                email: usuarioAtual.email,
                nome: usuarioAtual.nome,
                empresa: usuarioAtual.empresa || null
            };
        }
        return null;
    },

    /**
     * Recupera senha (simulado - em produção, enviar email)
     * @param {string} email - Email do usuário
     * @returns {Promise} Resultado da recuperação
     */
    recuperarSenha: async function(email) {
        return new Promise((resolve, reject) => {
            try {
                if (!email || !validarEmail(email)) {
                    reject(new Error("Email inválido"));
                    return;
                }

                const emailLower = email.toLowerCase();
                if (!this.usuarios[emailLower]) {
                    // Não revelar se o email existe (segurança)
                    resolve({
                        sucesso: true,
                        mensagem: "Se este email estiver cadastrado, você receberá um link de recuperação"
                    });
                    return;
                }

                // Em produção, enviar email com link de recuperação
                console.log("📧 Email de recuperação enviado para:", email);
                resolve({
                    sucesso: true,
                    mensagem: "Email de recuperação enviado (simulado - em produção será real)"
                });
            } catch (erro) {
                reject(erro);
            }
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
            try {
                const emailLower = email.toLowerCase();
                const usuario = this.usuarios[emailLower];

                if (!usuario) {
                    reject(new Error("Usuário não encontrado"));
                    return;
                }

                if (dados.nome) usuario.nome = dados.nome.trim();
                if (dados.empresa) usuario.empresa = dados.empresa;

                this.usuarios[emailLower] = usuario;
                salvarLocal('kawr_usuarios', this.usuarios);

                if (usuarioAtual && usuarioAtual.email === emailLower) {
                    usuarioAtual = usuario;
                }

                console.log("✅ Usuário atualizado:", email);

                resolve({
                    sucesso: true,
                    mensagem: "Dados atualizados com sucesso"
                });
            } catch (erro) {
                reject(erro);
            }
        });
    },

    /**
     * Altera a senha do usuário
     * @param {string} email - Email do usuário
     * @param {string} senhaAtual - Senha atual
     * @param {string} novaSenha - Nova senha
     * @returns {Promise} Resultado da alteração
     */
    alterarSenha: async function(email, senhaAtual, novaSenha) {
        return new Promise((resolve, reject) => {
            try {
                const emailLower = email.toLowerCase();
                const usuario = this.usuarios[emailLower];

                if (!usuario) {
                    reject(new Error("Usuário não encontrado"));
                    return;
                }

                // Verificar senha atual
                if (atob(usuario.senha) !== senhaAtual) {
                    reject(new Error("Senha atual incorreta"));
                    return;
                }

                // Validar nova senha
                const validacao = validarSenha(novaSenha);
                if (!validacao.valida) {
                    reject(new Error("Nova senha fraca: " + validacao.erros.join(", ")));
                    return;
                }

                // Atualizar senha
                usuario.senha = btoa(novaSenha);
                this.usuarios[emailLower] = usuario;
                salvarLocal('kawr_usuarios', this.usuarios);

                console.log("✅ Senha alterada:", email);

                resolve({
                    sucesso: true,
                    mensagem: "Senha alterada com sucesso"
                });
            } catch (erro) {
                reject(erro);
            }
        });
    }
};

// ===== EVENT LISTENERS =====

// Tabs de Login/Cadastro
document.getElementById('tabLogin')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('tabCadastro').classList.remove('active');
    document.getElementById('tabLoginContent').classList.add('active');
    document.getElementById('tabCadastroContent').classList.remove('active');
});

document.getElementById('tabCadastro')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('tabCadastro').classList.add('active');
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('tabCadastroContent').classList.add('active');
    document.getElementById('tabLoginContent').classList.remove('active');
});

// Formulário de Login
document.getElementById('formLogin')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail')?.value.trim() || '';
    const senha = document.getElementById('loginSenha')?.value || '';
    const btnSubmit = this.querySelector('button[type="submit"]');

    if (!email || !senha) {
        notificarErro("Preencha todos os campos");
        return;
    }

    try {
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Entrando...';
        }

        const resultado = await AUTH.login(email, senha);
        notificarSucesso(resultado.mensagem);

        // Aguardar um pouco antes de fechar o modal
        setTimeout(() => {
            esconder('#modalLogin');
            inicializarDashboard();
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Entrar';
            }
        }, 500);
    } catch (erro) {
        notificarErro(erro.message);
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Entrar';
        }
    }
});

// Formulário de Cadastro
document.getElementById('formCadastro')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('cadastroNome')?.value.trim() || '';
    const email = document.getElementById('cadastroEmail')?.value.trim() || '';
    const senha = document.getElementById('cadastroSenha')?.value || '';
    const confirmar = document.getElementById('cadastroConfirm')?.value || '';
    const btnSubmit = this.querySelector('button[type="submit"]');

    if (!nome || !email || !senha || !confirmar) {
        notificarErro("Preencha todos os campos");
        return;
    }

    if (senha !== confirmar) {
        notificarErro("As senhas não conferem");
        return;
    }

    try {
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Criando conta...';
        }

        const resultado = await AUTH.registrar(email, senha, nome);
        notificarSucesso(resultado.mensagem);

        // Limpar formulário
        this.reset();

        // Voltar para login
        setTimeout(() => {
            document.getElementById('tabLogin')?.click();
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Criar Conta';
            }
        }, 500);
    } catch (erro) {
        notificarErro(erro.message);
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Criar Conta';
        }
    }
});

// Botão Logout
document.getElementById('btnLogout')?.addEventListener('click', async function() {
    if (confirm("Deseja sair do sistema?")) {
        try {
            await AUTH.logout();
            location.reload();
        } catch (erro) {
            console.error("Erro no logout:", erro);
            location.reload();
        }
    }
});

// Link Recuperar Senha
document.getElementById('linkRecuperarSenha')?.addEventListener('click', async function(e) {
    e.preventDefault();
    const email = prompt("Digite seu email para recuperar a senha:");
    if (email && email.trim()) {
        try {
            const resultado = await AUTH.recuperarSenha(email);
            notificarSucesso(resultado.mensagem);
        } catch (erro) {
            notificarErro(erro.message);
        }
    }
});

// ===== FUNÇÕES DE INICIALIZAÇÃO =====

/**
 * Inicializa o dashboard após autenticação
 */
function inicializarDashboard() {
    const usuario = AUTH.obterUsuarioAtual();
    if (usuario) {
        document.getElementById('empresaNome').textContent = usuario.nome || "Minha Empresa";
        document.getElementById('saudacao').textContent = `Bem-vindo, ${usuario.nome}!`;
        document.getElementById('dataAtual').textContent = obterDataAtual();

        console.log("📊 Dashboard inicializado para:", usuario.email);

        // Carregar dados da empresa
        if (typeof carregarDadosEmpresa === 'function') {
            carregarDadosEmpresa();
        }
    }
}

/**
 * Verifica autenticação ao carregar a página
 */
function verificarAutenticacao() {
    if (AUTH.estaAutenticado()) {
        console.log("✅ Usuário autenticado");
        esconder('#modalLogin');
        inicializarDashboard();
    } else {
        console.log("🔐 Nenhum usuário autenticado - mostrando login");
        mostrar('#modalLogin');
    }
}

// ===== INICIALIZAÇÃO GERAL =====

// Executar ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarAutenticacao);
} else {
    verificarAutenticacao();
}

console.log("✅ Auth carregado e pronto");
