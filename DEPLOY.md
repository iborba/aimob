# 🚀 Deploy no GitHub Pages

Este projeto está configurado para deploy automático no GitHub Pages usando GitHub Actions.

## ✅ O que já está configurado

1. **Workflow do GitHub Actions** (`.github/workflows/deploy.yml`)
   - Deploy automático a cada push na branch `main`
   - Também pode ser acionado manualmente

2. **Estrutura de arquivos**
   - Todos os arquivos estão organizados e prontos para deploy
   - Caminhos relativos configurados corretamente

## 📋 Passos para ativar o GitHub Pages

### 1. Ativar GitHub Pages no repositório

1. Vá para o repositório no GitHub: `https://github.com/iborba/aimob`
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em **Source**, selecione:
   - **Source**: `GitHub Actions`
5. Clique em **Save**

### 2. Verificar o workflow

1. Vá para a aba **Actions** no repositório
2. Você verá o workflow "Deploy to GitHub Pages"
3. Após o primeiro push, o workflow será executado automaticamente
4. Aguarde a conclusão (geralmente 1-2 minutos)

### 3. Acessar o site

Após o deploy bem-sucedido:
- O site estará disponível em: `https://iborba.github.io/aimob/`
- Ou: `https://[seu-usuario].github.io/[nome-do-repo]/`

## 🔄 Deploy automático

A partir de agora, **todo push na branch `main`** irá:
1. Acionar o workflow automaticamente
2. Fazer deploy no GitHub Pages
3. Atualizar o site em alguns minutos

## 🛠️ Deploy manual

Se quiser fazer deploy manualmente:

1. Vá para **Actions** no GitHub
2. Selecione o workflow "Deploy to GitHub Pages"
3. Clique em **Run workflow**
4. Selecione a branch `main`
5. Clique em **Run workflow**

## 📝 Notas importantes

- O workflow usa a ação oficial do GitHub para Pages
- Não é necessário configurar branch `gh-pages` manualmente
- O site é atualizado automaticamente a cada push
- Todos os arquivos estáticos são servidos corretamente

## 🔍 Verificar status do deploy

1. Vá para **Actions** no GitHub
2. Veja o status do último workflow
3. Se estiver verde ✅, o deploy foi bem-sucedido
4. Se estiver vermelho ❌, clique para ver os erros

## 🌐 URL do site

Após a configuração, seu site estará em:
```
https://iborba.github.io/aimob/
```

Ou ajuste conforme seu usuário e nome do repositório.

