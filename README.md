# Kawr Business v2.0

**Gestão Financeira Inteligente para MEI e ME**

Kawr Business é um sistema web moderno e profissional que auxilia empresários e contadores brasileiros na gestão financeira, análise de indicadores e tomada de decisões estratégicas.

## 🎯 Objetivo

O Kawr Business **não substitui o contador**, mas facilita a visualização dos dados financeiros de forma clara, intuitiva e profissional. O sistema apresenta:

- **Como está sua empresa** - Indicadores em tempo real
- **O que melhorou** - Comparações mensais
- **O que piorou** - Alertas automáticos
- **Quais ações tomar** - Recomendações inteligentes

---

## ✨ Principais Características

### 🎨 Design Premium
- Interface elegante com paleta preto, dourado e branco
- Responsivo para celular, tablet, notebook e desktop
- Animações suaves e transições profissionais
- Cantos arredondados e sombras elegantes

### 📊 Dashboard Inteligente
- **6 Cards Principais**: Receita, Lucro, Despesas, Fluxo de Caixa, Impostos, Score
- **Score Geral**: Análise inteligente baseada em 8 fatores
- **Insights Automáticos**: Recomendações personalizadas
- **Alertas Contextualizados**: Problemas identificados automaticamente

### 💹 Análise Financeira
- **Score Inteligente** com 8 fatores:
  - Fluxo de Caixa (20 pontos)
  - Receita (15 pontos)
  - Lucro Líquido (15 pontos)
  - Margem de Lucro (15 pontos)
  - Liquidez (10 pontos)
  - Carga Tributária (10 pontos)
  - Crescimento (5 pontos)
  - Estabilidade (5 pontos)

### 📈 Visualizações Profissionais
- Gráfico de Receita Mensal (barras)
- Evolução do Lucro (linhas)
- Fluxo de Caixa (linhas)
- Receita x Custos (comparativo)
- Distribuição Financeira (pizza)
- Evolução do Score (linhas)

### 🚨 Sistema de Alertas
- Fluxo de Caixa Negativo
- Despesas Muito Altas
- Receita em Queda
- Possível Desenquadramento do MEI
- Carga Tributária Elevada
- Informações Incompletas

### 📄 Relatórios
- Geração de PDF profissional
- Exportação de dados em CSV
- Inclui: empresa, financeiro, score, alertas

### 📅 Histórico Mensal
- Navegação entre meses
- Comparação automática com mês anterior
- Visualização de tendências

### 🔐 Autenticação e Segurança
- Login e Cadastro de usuários
- Recuperação de senha
- Sessão persistente
- Dados isolados por usuário

---

## 🚀 Como Usar

### 1. Abrir o Sistema
```bash
# Abrir index.html em um navegador
# ou servir com um servidor local
python -m http.server 8000
```

### 2. Criar Conta
- Clique em "Cadastro"
- Preencha nome, email e senha
- A senha deve ter: 8+ caracteres, maiúscula, minúscula, número

### 3. Fazer Login
- Use seu email e senha cadastrados
- Sua sessão será mantida

### 4. Cadastrar Empresa
- Vá para "Financeiro"
- Preencha dados da empresa (nome, CNPJ, tipo, regime)
- Clique em "Salvar Dados"

### 5. Inserir Dados Financeiros
- Preencha Receita Bruta, Despesas e Folha de Pagamento
- Selecione o período
- Clique em "Salvar Dados"
- O sistema calcula automaticamente todos os indicadores

### 6. Analisar Resultados
- **Dashboard**: Visão geral com cards principais
- **Gráficos**: Visualizações profissionais
- **Alertas**: Problemas identificados
- **Histórico**: Evolução mensal
- **Relatórios**: Gerar PDF com análise completa

## 📋 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Gráficos**: Chart.js 4.4.0
- **PDF**: jsPDF 2.5.1 + html2canvas 1.4.1
- **Ícones**: Font Awesome 6.4.0
- **Autenticação**: Firebase Authentication (pronto)
- **Banco de Dados**: Firestore (pronto)

---

## 📋 Estrutura do Projeto

```
Kawr-Business/
├── index.html              # Estrutura HTML principal
├── css/
│   └── style.css          # Estilos premium (v2.0)
├── js/
│   ├── config.js          # Configurações e constantes
│   ├── utils.js           # Funções utilitárias
│   ├── auth.js            # Autenticação
│   ├── database.js        # Banco de dados
│   ├── score.js           # Score inteligente
│   ├── alerts.js          # Sistema de alertas
│   ├── charts.js          # Gráficos
│   ├── relatorios.js      # Geração de PDF
│   └── app.js             # Controlador principal
└── README.md              # Este arquivo
```

## 🎯 Faixas de Score

| Faixa | Cor | Significado |
|-------|-----|-------------|
| 0-25 | Vermelho | Alto risco financeiro |
| 26-45 | Laranja | Empresa em dificuldades |
| 46-50 | Amarelo | Situação de atenção |
| 51-70 | Verde | Empresa saudável |
| 71-90 | Azul | Excelente desempenho |
| 91-100 | Roxo | Desempenho excepcional |

## 💾 Armazenamento de Dados

**Desenvolvimento Local**: localStorage (simulação)
- Usuários: `kawr_usuarios`
- Empresas: `kawr_empresas`
- Financeiro: `kawr_financeiro`
- Scores: `kawr_scores`
- Alertas: `kawr_alertas`

**Produção**: Firebase Firestore (pronto para integração)
- Autenticação: Firebase Authentication
- Banco de Dados: Firestore
- Armazenamento: Cloud Storage

## 🔧 Configuração do Firebase (Produção)

Para usar Firebase em produção:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Copie suas credenciais
3. Atualize `js/config.js` com suas credenciais
4. Adicione os scripts do Firebase ao `index.html`

## 📱 Responsividade

O sistema funciona perfeitamente em:
- **Desktop** (1920x1080+)
- **Notebook** (1366x768)
- **Tablet** (768x1024)
- **Celular** (375x667+)

## 🌐 Compatibilidade

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## ⚠️ Aviso Legal

O Kawr Business é uma ferramenta de **apoio à gestão financeira**. Não substitui um contador habilitado nem fornece garantia de conformidade fiscal. Sempre consulte um profissional para decisões tributárias importantes.

---

## 🚀 Roadmap - Próximas Versões

### v2.1
- [ ] Integração com APIs bancárias
- [ ] Sincronização automática de transações
- [ ] Categorização inteligente de despesas

### v2.2
- [ ] IA para previsão de fluxo de caixa
- [ ] Recomendações automáticas de economia
- [ ] Análise de sazonalidade

### v3.0
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com contadores
- [ ] Assinatura de documentos digitais

---

**Kawr Business v2.0** - Transformando números em decisões 💡

Desenvolvido com ❤️ para empresários e contadores brasileiros.

© 2026 Kawr Business. Todos os direitos reservados.
