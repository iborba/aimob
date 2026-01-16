# Fluxo Conversacional - Luna IA
## Design de Conversa Natural para Captação de Leads

Este documento descreve o fluxo completo de conversa, onde cada mensagem foi projetada para:
1. Parecer uma conversa natural entre amigos
2. Coletar informações valiosas de forma sutil
3. Nunca fazer o usuário sentir que está sendo qualificado
4. Priorizar contexto e história antes de dados objetivos

---

## ESTRUTURA DA CONVERSA

### FASE 1: ABERTURA EMPÁTICA (Estabelecer Conexão)

**Mensagem 1:**
```
"Oi! 👋 Que bom você ter chegado até aqui!"
```
**LEAD DATA:** Estabelece tom amigável, reduz resistência inicial, cria ambiente acolhedor

**Mensagem 2:**
```
"Eu sou a Luna, e estou aqui pra te ajudar a encontrar o lugar perfeito pra você."
```
**LEAD DATA:** Apresentação da marca, cria conexão emocional, define propósito da interação

**Mensagem 3:**
```
"Pra começar, me diz seu nome? 😊"
```
**LEAD DATA:** 
- Nome completo (básico, mas essencial para personalização)
- Cria intimidade para próximas perguntas

**Follow-up automático:**
```
"Prazer, {name}! Agora me conta: o que te trouxe até aqui hoje?"
```
**LEAD DATA:** 
- Motivação inicial (inferida da resposta)
- Contexto da busca
- Urgência implícita

---

### FASE 2: EXPLORAÇÃO LIVRE (Deixar o Usuário Contar sua História)

**Mensagem 4:**
```
"Me conta com suas palavras: como você imagina o seu lar ideal? 
Pode ser qualquer coisa que vier na cabeça!"
```
**LEAD DATA (Extraído via NLP):**
- **Motivação primária** (inferida do texto):
  - "primeiro imóvel" → `motivation.primary = 'first_home'`
  - "trocar", "upgrade" → `motivation.primary = 'upgrade'`
  - "investir", "renda" → `motivation.primary = 'investment'`
  - "casamento", "filhos" → `motivation.primary = 'life_change'`
  
- **Perfil do imóvel desejado:**
  - Tipo (apartamento/casa/studio) mencionado
  - Tamanho (espaçoso, pequeno, etc)
  - Features mencionadas (quintal, piscina, etc)
  
- **Contexto emocional:**
  - Drivers emocionais (segurança, liberdade, família)
  - Pain points (aluguel caro, falta de espaço)
  
- **Urgência:**
  - Palavras como "urgente", "logo", "quando der" indicam timeline

**Follow-up contextual:**
```
"Que interessante! Deixa eu entender melhor..."
```
**LEAD DATA:** Mantém o fluxo, prepara para próxima pergunta

---

### FASE 3: CONTEXTO E MOTIVAÇÃO (Entender o Porquê)

**Mensagem 5:**
```
"E o que está te fazendo pensar nisso agora? 
Tipo, alguma coisa mudou na sua vida ou você só sentiu que chegou a hora?"
```
**LEAD DATA:**
- **Motivação profunda:**
  - Mudança de vida específica (casamento, filhos, trabalho)
  - Timing da decisão
  - Eventos gatilho
  
- **Timeline implícito:**
  - "agora", "já" → urgência alta
  - "quando der" → urgência baixa
  
- **Situação atual:**
  - Contexto de vida atual
  - Eventos recentes que motivam a busca

**Follow-up:**
```
"Faz todo sentido!"
```
**LEAD DATA:** Validação empática, mantém conexão

---

### FASE 4: SITUAÇÃO ATUAL (Entender o Contexto)

**Mensagem 6:**
```
"E hoje, onde você está morando? 
Você aluga, já tem um lugar seu, ou tá com a família?"
```
**LEAD DATA:**
- **Situação atual:**
  - `currentSituation.living = 'renting' | 'owning' | 'with_family' | 'other'`
  
- **Pain points (se mencionados):**
  - "aluguel caro" → `painPoints: ['high_rent']`
  - "pequeno", "apertado" → `painPoints: ['lack_of_space']`
  
- **Motivação para mudança:**
  - Por que quer sair da situação atual

**Follow-up:**
```
"Entendi!"
```
**LEAD DATA:** Transição natural

---

### FASE 5: PREFERÊNCIAS DO IMÓVEL (Através de Conversa)

**Mensagem 7:**
```
"E quando você pensa nesse lugar ideal, você imagina mais um apartamento, 
uma casa, ou você ainda não tem certeza?"
```
**LEAD DATA:**
- **Tipo de imóvel:**
  - `propertyType = 'apartamento' | 'casa' | 'studio' | 'cobertura' | null`
  
- **Flexibilidade:**
  - Se não tem certeza = lead menos qualificado, mas ainda válido

**Follow-up:**
```
"Boa escolha!"
```
**LEAD DATA:** Validação positiva

---

**Mensagem 8:**
```
"E sobre espaço... você mora sozinho, com alguém, ou tem família? 
Isso me ajuda a pensar no tamanho ideal."
```
**LEAD DATA:**
- **Número de quartos** (inferido):
  - "sozinho" → `bedrooms = 1`
  - "casal" → `bedrooms = 2`
  - "família" → `bedrooms = 3+`
  
- **Tamanho da família:**
  - Quantas pessoas morarão
  
- **Tomadores de decisão:**
  - Se mencionar "nós", "eu e minha esposa" → `decisionMakers.partner = true`
  
- **Planejamento futuro:**
  - "queremos planejar família" → indica crescimento futuro

**Follow-up:**
```
"Perfeito!"
```
**LEAD DATA:** Confirmação

---

**Mensagem 9:**
```
"E sobre localização... tem algum lugar que você já pensou? 
Ou alguma coisa que é importante pra você na região? 
Tipo, perto do trabalho, de escola, de transporte..."
```
**LEAD DATA:**
- **Localização preferida:**
  - Bairro/região mencionada → `location = 'Zona Sul' | 'Pinheiros' | etc`
  
- **Features importantes:**
  - "perto do metrô" → `mustHaveFeatures: ['transit']`
  - "perto do trabalho" → indica necessidade de localização específica
  - "escola" → indica família com filhos
  
- **Motivação da localização:**
  - Trabalho, família, transporte, etc.

**Follow-up:**
```
"Ótimo ponto!"
```
**LEAD DATA:** Validação

---

### FASE 6: VIABILIDADE FINANCEIRA (Introdução Suave)

**Mensagem 10:**
```
"Entendi! Agora, uma coisa importante: você já tem uma ideia de quanto 
conseguiria investir nisso? Não precisa ser exato, só pra eu ter uma noção 
do que faz sentido te mostrar."
```
**LEAD DATA (Extraído via NLP):**
- **Faixa de orçamento:**
  - "até 600 mil" → `budget.max = 600000`
  - "entre 500 e 800" → `budget.min = 500000, max = 800000`
  - "acima de 1 milhão" → `budget.min = 1000000`
  
- **Flexibilidade:**
  - Se não souber = `budget.flexible = true` (menos qualificado)
  
- **Nível de maturidade financeira:**
  - Se tem valor exato = mais qualificado
  - Se é vago = precisa de mais orientação

**Follow-up:**
```
"Perfeito! Isso me ajuda muito."
```
**LEAD DATA:** Confirmação, reduz ansiedade sobre a pergunta financeira

---

**Mensagem 11:**
```
"E sobre o pagamento... você já pensou se seria à vista ou se você faria um financiamento?"
```
**LEAD DATA (Extraído via NLP):**
- **Método de pagamento:**
  - "à vista", "vista", "dinheiro" → `purchaseCondition.method = 'cash'`
  - "financiamento", "banco", "parcela" → `purchaseCondition.method = 'financing'`
  
- **Nível de maturidade:**
  - "já consultei banco" → `purchaseCondition.preApproved = true` (MUITO qualificado)
  - "ainda não consultei" → `purchaseCondition.preApproved = false` (precisa orientação)
  
- **Necessidade de orientação:**
  - Se não souber = oportunidade de valor agregado

**Follow-up:**
```
"Tranquilo!"
```
**LEAD DATA:** Reduz pressão sobre questão financeira

---

### FASE 7: TIMELINE (Através de Contexto)

**Mensagem 12:**
```
"E você tem alguma pressa nisso? Tipo, tem algum prazo ou é mais uma coisa 
que você tá explorando pra quando der certo?"
```
**LEAD DATA (Extraído via NLP):**
- **Timeline:**
  - "urgente", "logo", "já" → `timeline.when = 'immediate'`, `urgency = 'high'`
  - "próximo mês" → `timeline.when = '1-3months'`, `urgency = 'high'`
  - "3 a 6 meses" → `timeline.when = '3-6months'`, `urgency = 'medium'`
  - "final do ano" → `timeline.when = '6-12months'`, `urgency = 'medium'`
  - "explorando", "quando der" → `timeline.when = 'exploring'`, `urgency = 'low'`
  
- **Motivo do timing:**
  - Por que esse prazo específico

**Follow-up:**
```
"Entendi!"
```
**LEAD DATA:** Transição

---

### FASE 8: TOMADORES DE DECISÃO

**Mensagem 13:**
```
"E essa decisão é só sua ou tem mais alguém envolvido? 
Tipo, parceiro, família..."
```
**LEAD DATA:**
- **Tomadores de decisão:**
  - "só eu" → `decisionMakers.alone = true`
  - "eu e minha esposa" → `decisionMakers.partner = true`
  - "família toda" → `decisionMakers.family = true`
  
- **Complexidade da venda:**
  - Mais pessoas = mais tempo de decisão
  - Mais pessoas = mais qualificado (comprometimento maior)

**Follow-up:**
```
"Perfeito!"
```
**LEAD DATA:** Confirmação

---

### FASE 9: FECHAMENTO E CONTATO (Geração de Valor)

**Mensagem 14:**
```
"Perfeito! Agora que entendi melhor o que você precisa, que tal eu te passar 
algumas opções que fazem sentido?"
```
**LEAD DATA:**
- **Consentimento para contato:**
  - Se aceitar = `contact_consent = true`
  
- **Interesse confirmado:**
  - Lead qualificado e interessado

**Follow-up:**
```
"Ótimo!"
```
**LEAD DATA:** Transição para coleta de contato

---

**Mensagem 15:**
```
"Me passa seu WhatsApp? Assim eu consigo te enviar as melhores opções e um dos 
nossos consultores pode te ajudar com qualquer dúvida."
```
**LEAD DATA:**
- **Telefone** (CRÍTICO):
  - `phone = valor validado`
  
- **Preferência de contato:**
  - WhatsApp = `contactPreference.method = 'whatsapp'`

**Follow-up:**
```
"Anotado!"
```
**LEAD DATA:** Confirmação

---

**Mensagem 16 (Opcional):**
```
"E se quiser, me passa seu e-mail também. Às vezes envio materiais legais e 
simulações que podem te ajudar."
```
**LEAD DATA:**
- **E-mail** (opcional, mas valioso):
  - `email = valor validado`
  
- **Abertura para comunicação:**
  - Se fornecer = mais engajado

**Follow-up:**
```
"Perfeito!"
```
**LEAD DATA:** Confirmação

---

### FASE 10: ENCERRAMENTO (Valor Imediato)

**Mensagem 17:**
```
"Pronto, {name}! 🎉 Agora tenho uma boa ideia do que você precisa."
```
**LEAD DATA:** Confirmação de coleta completa

**Mensagem 18:**
```
"Vou preparar uma seleção personalizada pra você e um dos nossos consultores 
vai entrar em contato em breve pra te mostrar as melhores opções!"
```
**LEAD DATA:**
- Expectativa criada
- Lead qualificado e com expectativa de retorno

**Mensagem 19 (Opcional):**
```
"Alguma coisa mais que você quer me contar antes de eu ir preparar isso?"
```
**LEAD DATA:**
- Oportunidade para informações adicionais
- Dados complementares que o usuário queira compartilhar

---

## PRINCÍPIOS APLICADOS

### ✅ O que fazemos:
1. **Perguntas abertas primeiro** - Deixamos o usuário contar sua história
2. **Contexto antes de dados** - Entendemos o "porquê" antes do "quanto"
3. **Linguagem natural** - Como conversa entre amigos
4. **Follow-ups empáticos** - Validamos e conectamos respostas
5. **Extração inteligente** - NLP processa texto livre e extrai dados estruturados

### ❌ O que NÃO fazemos:
1. ❌ Listas de opções logo de início
2. ❌ Perguntas diretas sobre orçamento sem contexto
3. ❌ Tom burocrático ou formal
4. ❌ Múltiplas escolhas quando texto livre funciona melhor
5. ❌ Interrogatório sequencial

---

## PROCESSAMENTO DE LINGUAGEM NATURAL

O sistema processa cada resposta em texto livre e extrai:

- **Orçamento:** Valores mencionados, faixas, flexibilidade
- **Tipo de imóvel:** Apartamento, casa, studio, cobertura
- **Quartos:** Inferido de contexto familiar
- **Localização:** Bairros, regiões, proximidades
- **Timeline:** Urgência baseada em palavras-chave
- **Motivação:** Primeiro imóvel, upgrade, investimento, mudança de vida
- **Método de pagamento:** À vista, financiamento, pré-aprovado
- **Features:** Transporte, pets, piscina, etc.

---

## RESULTADO FINAL

Ao final da conversa, temos um lead qualificado com:

✅ **Dados básicos:** Nome, telefone, e-mail
✅ **Contexto completo:** Motivação, situação atual, história
✅ **Preferências:** Tipo, tamanho, localização, features
✅ **Viabilidade financeira:** Orçamento, método de pagamento
✅ **Timeline:** Quando e por quê
✅ **Tomadores de decisão:** Quem está envolvido
✅ **Score de qualidade:** 0-100 baseado em completude e maturidade

**Tudo isso coletado de forma natural, sem o usuário sentir que está preenchendo um formulário.**

