# 🚀 Configuração do GitHub Pages - Passo a Passo

## ✅ Passo 1: Configurar o Source no GitHub Pages

1. Acesse seu repositório no GitHub: `https://github.com/iborba/aimob`
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Na seção **"Build and deployment"**, em **"Source"**:
   - Selecione **"GitHub Actions"** (NÃO selecione "Deploy from a branch")
5. **Não precisa clicar em "Configure"** nos cards sugeridos - você já tem um workflow customizado!

## ✅ Passo 2: Verificar o Workflow

O workflow já está criado em `.github/workflows/deploy.yml` e está correto!

Ele irá:
- ✅ Executar automaticamente a cada push na branch `main`
- ✅ Fazer deploy de todos os arquivos estáticos
- ✅ Publicar no GitHub Pages

## ✅ Passo 3: Acionar o Deploy

Após configurar o Source como "GitHub Actions", você pode:

### Opção A: Fazer um novo push (recomendado)
```bash
git commit --allow-empty -m "trigger: deploy to GitHub Pages"
git push origin main
```

### Opção B: Acionar manualmente
1. Vá para a aba **Actions** no GitHub
2. Clique em **"Deploy to GitHub Pages"**
3. Clique em **"Run workflow"**
4. Selecione a branch `main`
5. Clique em **"Run workflow"** novamente

## ✅ Passo 4: Verificar o Status

1. Vá para **Actions** no GitHub
2. Você verá o workflow rodando
3. Aguarde a conclusão (geralmente 1-2 minutos)
4. Se estiver verde ✅, o deploy foi bem-sucedido!

## ✅ Passo 5: Acessar o Site

Após o deploy bem-sucedido:
- O site estará disponível em: `https://iborba.github.io/aimob/`
- Ou: `https://[seu-usuario].github.io/[nome-do-repo]/`

## 🔍 Troubleshooting

### Se o workflow falhar:

1. **Verifique as permissões:**
   - Vá em **Settings** → **Actions** → **General**
   - Em **"Workflow permissions"**, selecione **"Read and write permissions"**
   - Marque **"Allow GitHub Actions to create and approve pull requests"**
   - Clique em **Save**

2. **Verifique se o Source está correto:**
   - Deve estar como **"GitHub Actions"**, não "Deploy from a branch"

3. **Verifique os logs:**
   - Clique no workflow que falhou
   - Veja os logs de erro para identificar o problema

## 📝 Notas Importantes

- ⚠️ **NÃO** selecione "Deploy from a branch" - isso não funcionará com nosso workflow
- ✅ Use **"GitHub Actions"** como source
- ✅ O workflow já está configurado e pronto para usar
- ✅ Após configurar, o deploy será automático a cada push

## 🎯 Resumo Rápido

1. Settings → Pages
2. Source: **GitHub Actions**
3. Salvar
4. Ir para Actions e verificar o deploy
5. Acessar `https://iborba.github.io/aimob/`

Pronto! 🚀

