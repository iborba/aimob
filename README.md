# Lar Prime - Imobiliária com IA

Sistema imobiliário com assistente conversacional inteligente (Luna) para busca e refinamento de imóveis.

## 📁 Estrutura de Pastas

```
/
├── index.html                 # Página inicial com Luna
├── pages/                     # Páginas secundárias
│   ├── imoveis.html          # Listagem de imóveis com sidebar Luna
│   ├── sobre.html            # Sobre a empresa
│   ├── contato.html          # Página de contato
│   ├── imovel-detalhe.html   # Detalhes do imóvel
│   └── admin-leads.html      # Painel administrativo de leads
├── assets/                    # Recursos estáticos
│   ├── css/                  # Folhas de estilo
│   │   ├── main.css          # Estilos principais
│   │   ├── ai.css            # Estilos da IA/Luna
│   │   └── sidebar.css       # Estilos da sidebar
│   └── js/                   # JavaScript organizado por módulo
│       ├── core/             # Funcionalidades core
│       │   └── main.js      # Script principal (menu, animações)
│       ├── ai/               # Módulo de IA/Luna
│       │   ├── conversation-engine.js  # Engine conversacional
│       │   ├── lead-capture.js         # Captura de leads
│       │   ├── search.js               # Busca inteligente
│       │   └── sidebar.js              # Sidebar de refinamento
│       └── imoveis/          # Módulo de imóveis
│           ├── database.js   # Banco de dados de imóveis
│           └── filter.js     # Filtros e renderização
└── docs/                     # Documentação
    └── CONVERSATIONAL_FLOW.md # Fluxo conversacional da Luna
```

## 🎯 Princípios de Organização

### Separação por Responsabilidade

- **Core**: Funcionalidades básicas do site (menu, animações)
- **AI**: Toda lógica relacionada à Luna e conversação
- **Imoveis**: Lógica específica de imóveis (banco de dados, filtros)

### Separação de Estilos

- **main.css**: Estilos globais e componentes base
- **ai.css**: Estilos específicos da interface da Luna
- **sidebar.css**: Estilos da sidebar de refinamento

### Páginas Organizadas

- Páginas secundárias em `/pages/` para manter a raiz limpa
- `index.html` na raiz como ponto de entrada principal

## 🚀 Como Usar

### Desenvolvimento Local

```bash
# Iniciar servidor local
python3 -m http.server 8080

# Acessar
http://localhost:8080
```

### Estrutura de Dados

#### Imóveis

- Banco de dados em `assets/js/imoveis/database.js`
- 50+ imóveis da Região Metropolitana de Porto Alegre/RS
- Filtros dinâmicos baseados em URL parameters

#### Leads

- Dados salvos em `localStorage` (demo)
- Estrutura completa em `assets/js/ai/lead-capture.js`
- Painel administrativo em `pages/admin-leads.html`

## 🤖 Luna - Assistente Conversacional

### Primeira Conversa (index.html)

- Foco em: tipo, quartos, preço, localização
- Não pergunta sobre: financiamento, tomadores de decisão (fica para sidebar)

### Sidebar de Refinamento (pages/imoveis.html)

- Perguntas adicionais para refinar busca
- Forma de pagamento
- Tomadores de decisão
- Situação atual
- Features essenciais

## 📝 Convenções

### Nomenclatura

- Arquivos: `kebab-case` (ex: `conversation-engine.js`)
- Variáveis: `camelCase` (ex: `leadData`)
- Classes CSS: `kebab-case` (ex: `luna-sidebar`)

### Caminhos

- **Raiz → Assets**: `assets/css/main.css`
- **Pages → Assets**: `../assets/css/main.css`
- **Raiz → Pages**: `pages/imoveis.html`
- **Pages → Pages**: `imoveis.html` (mesma pasta)

## 🔧 Tecnologias

- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- JavaScript (ES6+, sem frameworks)
- Font Awesome Icons
- Google Fonts

## 📦 Dependências Externas

- Font Awesome 6.4.0 (CDN)
- Google Fonts (Playfair Display, DM Sans)

## 🎨 Temas

- **Principal**: Dark theme com acentos dourados
- **Luna**: Purple/Violet gradient
- **Responsivo**: Mobile-first approach

## 📄 Licença

Projeto de demonstração - Lar Prime Imobiliária
