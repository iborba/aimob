// ========================================
// LAR PRIME - AI Lead Capture System
// Conversational chatbot that collects valuable lead data
// ========================================

// Make openLunaChat available immediately (before DOMContentLoaded)
// This ensures it's available even if scripts load in different order
(function() {
    function openLunaChat(initialMessage = null) {
        const chatModal = document.getElementById('ai-chat-modal');
        if (!chatModal) {
            console.error('AI Chat Modal not found!');
            return;
        }
        
        chatModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset and start chat
        if (typeof resetChat === 'function') {
            resetChat();
        }
        if (typeof startChat === 'function') {
            startChat(initialMessage);
        }
    }
    
    window.openLunaChat = openLunaChat;
})();

document.addEventListener('DOMContentLoaded', function() {
    initAISearch();
    initAIChat();
    initAIFloatButton();
    initLeadExport();
});

// ========================================
// LEAD DATA STRUCTURE
// ========================================
// GLOBAL LEAD DATA (acessível por sidebar e conversation engine)
// ========================================
let leadData = {
    // Basic Info
    name: null,
    phone: null,
    email: null,
    
    // Property Preferences
    propertyType: null,
    bedrooms: null,
    location: null,
    mustHaveFeatures: [],
    niceToHaveFeatures: [],
    
    // Financial Information (CRITICAL)
    budget: {
        min: null,
        max: null,
        exact: null,
        flexible: false
    },
    purchaseCondition: {
        method: null, // 'cash', 'financing', 'both'
        downPayment: null,
        financingAmount: null,
        preApproved: false,
        bank: null
    },
    
    // Timeline & Urgency
    timeline: {
        when: null, // 'immediate', '1-3months', '3-6months', '6-12months', 'exploring'
        urgency: null, // 'high', 'medium', 'low'
        reason: null // why this timeline
    },
    
    // Motivation & Context (DEEP INSIGHTS)
    motivation: {
        primary: null, // 'first_home', 'upgrade', 'investment', 'life_change', 'work', 'family'
        secondary: null,
        story: null, // narrative text
        painPoints: [], // what they're trying to solve
        emotionalDrivers: [] // what excites them
    },
    
    // Current Situation
    currentSituation: {
        living: null, // 'renting', 'owning', 'with_family', 'other'
        currentLocation: null,
        whyMoving: null,
        currentPainPoints: []
    },
    
    // Experience Level
    experience: {
        firstTime: false,
        previousPurchases: 0,
        knowledgeLevel: null // 'beginner', 'intermediate', 'expert'
    },
    
    // Decision Making
    decisionMakers: {
        alone: false,
        partner: false,
        family: false,
        others: []
    },
    
    // Contact Preferences
    contactPreference: {
        method: null, // 'whatsapp', 'phone', 'email', 'any'
        bestTime: null,
        urgency: null
    },
    
    // Lead Quality Score
    qualityScore: 0,
    
    // Metadata
    chatDuration: 0,
    questionsAnswered: 0,
    startedAt: new Date(),
    completedAt: null
};

// ========================================
// CONVERSATIONAL FLOW - Natural & Human
// Designed to feel like talking to a friend, not filling a form
// ========================================
const leadCaptureFlow = [
    // ============================================
    // OPENING - Warm, empathetic, inviting
    // ============================================
    {
        id: 'opening',
        message: "Oi! 👋 Que bom você ter chegado até aqui!",
        delay: 500,
        type: 'greeting'
        // LEAD DATA: Estabelece tom amigável, reduz resistência
    },
    {
        id: 'opening2',
        message: "Eu sou a Luna, sua assistente imobiliária. Estou aqui pra te ajudar a encontrar o lugar perfeito!",
        delay: 1000,
        type: 'greeting'
        // LEAD DATA: Apresentação da marca, cria conexão inicial
    },
    {
        id: 'opening3',
        message: "Pra começar, me diz seu nome? 😊",
        type: 'text',
        field: 'name',
        validation: (val) => val.length >= 2,
        errorMessage: "Pode me dizer seu nome?",
        followUp: "Prazer, {name}!",
        // LEAD DATA: Nome (básico, mas essencial para personalização)
    },
    
    // ============================================
    // OPEN-ENDED EXPLORATION - Let them tell their story FIRST
    // ============================================
    {
        id: 'free_description',
        message: "Me conta: o que você está procurando? Pode falar do jeito que quiser, como se estivesse conversando com uma amiga!",
        type: 'text',
        field: 'motivation.story',
        optional: true,
        placeholder: "Ex: Quero um apartamento de 3 quartos perto do metrô...",
        followUp: "Entendi! Deixa eu ver se entendi direito...",
        // LEAD DATA: 
        // - Motivação primária (inferida do texto via NLP)
        // - Perfil do imóvel desejado (tipo, tamanho, features)
        // - Contexto emocional e drivers
        // - Urgência (palavras como "urgente", "logo", "quando der")
        // - Orçamento (se mencionado)
        // - Localização (se mencionada)
    },
    
    // ============================================
    // CONFIRMATION - Only ask what's missing, not everything
    // ============================================
    {
        id: 'confirmation',
        message: "Deixa eu confirmar o que entendi...",
        delay: 1500,
        type: 'greeting',
        skipIf: () => !leadData.motivation?.story && !leadData.propertyType && !leadData.budget?.max
        // LEAD DATA: Transição suave para confirmações
    },
    
    // ============================================
    // ADAPTIVE FOLLOW-UP - Only ask what's missing
    // ============================================
    {
        id: 'contextual_why',
        message: "Que legal! E o que te trouxe até aqui agora? Alguma coisa mudou ou você só sentiu que chegou a hora?",
        type: 'text',
        field: 'motivation.context',
        optional: true,
        placeholder: "Ex: Me casei recentemente...",
        followUp: "Faz todo sentido!",
        skipIf: () => leadData.motivation?.primary && leadData.timeline?.when,
        // LEAD DATA:
        // - Motivação profunda (mudança de vida, timing, necessidade)
        // - Timeline implícito (urgência baseada no contexto)
        // - Situação atual (casamento, filhos, trabalho, etc)
    },
    
    // ============================================
    // CURRENT SITUATION - Only if not mentioned
    // ============================================
    {
        id: 'current_living',
        message: "E hoje, onde você está morando?",
        type: 'text',
        field: 'currentSituation.living',
        optional: true,
        placeholder: "Ex: Estou alugando...",
        followUp: "Entendi!",
        skipIf: () => leadData.currentSituation?.living,
        // LEAD DATA:
        // - Situação atual (renting/owning/family - inferido via NLP)
        // - Pain points (se mencionar problemas)
        // - Motivação para mudança
    },
    
    // ============================================
    // PROPERTY PREFERENCES - Only if not mentioned
    // ============================================
    {
        id: 'property_type_natural',
        message: "E quando você pensa nesse lugar ideal, você imagina mais um apartamento, uma casa, ou você ainda não tem certeza?",
        type: 'text',
        field: 'propertyType',
        optional: true,
        placeholder: "Ex: Acho que uma casa seria melhor...",
        followUp: "Boa escolha!",
        skipIf: () => leadData.propertyType,
        // LEAD DATA:
        // - Tipo de imóvel preferido (inferido via NLP)
        // - Flexibilidade (se não tem certeza = lead menos qualificado)
    },
    
    {
        id: 'space_needs',
        message: "E sobre espaço... você mora sozinho, com alguém, ou tem família? Isso me ajuda a pensar no tamanho ideal.",
        type: 'text',
        field: 'bedrooms',
        optional: true,
        placeholder: "Ex: Somos eu e meu marido, mas queremos planejar família...",
        followUp: "Perfeito!",
        skipIf: () => leadData.bedrooms,
        // LEAD DATA:
        // - Número de quartos necessário (inferido via NLP)
        // - Tamanho da família
        // - Tomadores de decisão
        // - Planejamento futuro (crescimento familiar)
    },
    
    {
        id: 'location_feel',
        message: "E sobre localização... tem algum lugar que você já pensou? Ou alguma coisa que é importante pra você na região?",
        type: 'text',
        field: 'location',
        optional: true,
        placeholder: "Ex: Queria algo perto do metrô...",
        followUp: "Ótimo ponto!",
        skipIf: () => leadData.location,
        // LEAD DATA:
        // - Localização preferida (inferida via NLP)
        // - Features importantes (transporte, proximidade, etc)
        // - Motivação da localização (trabalho, família, etc)
    },
    
    // ============================================
    // FINANCIAL VIABILITY - Only if not mentioned
    // ============================================
    {
        id: 'financial_soft',
        message: "E sobre o investimento... você já tem uma ideia de quanto conseguiria investir? Não precisa ser exato!",
        type: 'text',
        field: 'budget.range',
        optional: true,
        placeholder: "Ex: Acho que até uns 600 mil...",
        followUp: "Perfeito! Isso me ajuda muito.",
        skipIf: () => leadData.budget?.min || leadData.budget?.max || leadData.budget?.exact,
        // LEAD DATA:
        // - Faixa de orçamento (extraída via NLP do texto livre)
        // - Flexibilidade (se não souber = menos qualificado)
        // - Nível de maturidade financeira
    },
    
    {
        id: 'payment_method_natural',
        message: "E sobre o pagamento... você já pensou se seria à vista ou financiamento?",
        type: 'text',
        field: 'purchaseCondition.method',
        optional: true,
        placeholder: "Ex: Provavelmente financiamento...",
        followUp: "Tranquilo!",
        skipIf: () => leadData.purchaseCondition?.method,
        // LEAD DATA:
        // - Método de pagamento preferido (inferido via NLP)
        // - Nível de maturidade (se já consultou banco = mais qualificado)
        // - Necessidade de orientação
    },
    
    // ============================================
    // TIMELINE - Only if not clear
    // ============================================
    {
        id: 'timeline_natural',
        message: "E você tem alguma pressa nisso? Tipo, tem algum prazo ou é mais uma coisa que você tá explorando?",
        type: 'text',
        field: 'timeline.when',
        optional: true,
        placeholder: "Ex: Queria até o final do ano...",
        followUp: "Entendi!",
        skipIf: () => leadData.timeline?.when,
        // LEAD DATA:
        // - Timeline (inferido via NLP do texto)
        // - Urgência (alta/média/baixa)
        // - Motivo do timing
    },
    
    // ============================================
    // DECISION MAKERS - Only if not clear
    // ============================================
    {
        id: 'decision_makers',
        message: "E essa decisão é só sua ou tem mais alguém envolvido?",
        type: 'text',
        field: 'decisionMakers',
        optional: true,
        placeholder: "Ex: Eu e minha esposa...",
        followUp: "Perfeito!",
        skipIf: () => leadData.decisionMakers?.alone || leadData.decisionMakers?.partner || leadData.decisionMakers?.family,
        // LEAD DATA:
        // - Tomadores de decisão (inferido via NLP)
        // - Complexidade da venda (mais pessoas = mais tempo)
    },
    
    // ============================================
    // CONTACT - Only at the end, when we have context
    // ============================================
    {
        id: 'contact_natural',
        message: "Perfeito! Agora que entendi melhor o que você precisa, que tal eu te passar algumas opções que fazem sentido?",
        type: 'text',
        field: 'contact_consent',
        optional: false,
        placeholder: "Sim, pode enviar!",
        followUp: "Ótimo!",
        skipIf: () => {
            // Skip if we don't have enough info yet
            return !leadData.propertyType && !leadData.budget?.max && !leadData.motivation?.primary;
        },
        // LEAD DATA:
        // - Consentimento para contato
        // - Interesse confirmado
    },
    
    {
        id: 'phone_natural',
        message: "Me passa seu WhatsApp? Assim eu consigo te enviar as melhores opções e um dos nossos consultores pode te ajudar com qualquer dúvida.",
        type: 'text',
        field: 'phone',
        validation: (val) => /^[\d\s\(\)\-\+]+$/.test(val) && val.replace(/\D/g, '').length >= 10,
        errorMessage: "Pode me passar um número válido?",
        placeholder: "(11) 99999-9999",
        followUp: "Anotado!",
        skipIf: () => leadData.phone, // Skip if already have phone
        // LEAD DATA:
        // - Telefone (crítico para contato)
        // - Preferência de contato (WhatsApp)
    },
    
    {
        id: 'email_optional',
        message: "E se quiser, me passa seu e-mail também. Às vezes envio materiais legais e simulações que podem te ajudar.",
        type: 'text',
        field: 'email',
        optional: true,
        validation: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        errorMessage: "E-mail inválido",
        placeholder: "seu@email.com",
        followUp: "Perfeito!",
        skipIf: () => leadData.email, // Skip if already have email
        // LEAD DATA:
        // - E-mail (opcional, mas valioso)
        // - Abertura para comunicação
    },
    
    // ============================================
    // CLOSING - Value-driven (only if we have enough info)
    // ============================================
    {
        id: 'closing_check',
        message: "Deixa eu ver se tenho tudo que preciso...",
        delay: 1000,
        type: 'greeting',
        skipIf: () => {
            // Only show if we have minimum required info
            const hasMinInfo = leadData.name && leadData.phone && 
                              (leadData.budget?.max || leadData.budget?.min || leadData.propertyType);
            return !hasMinInfo;
        }
        // LEAD DATA: Transição para fechamento
    },
    {
        id: 'closing',
        message: "Pronto, {name}! 🎉 Agora tenho uma boa ideia do que você precisa.",
        delay: 1000,
        type: 'final',
        // LEAD DATA: Confirmação de coleta completa
    },
    {
        id: 'closing2',
        message: "Vou preparar uma seleção personalizada pra você e um dos nossos consultores vai entrar em contato em breve pra te mostrar as melhores opções!",
        delay: 1500,
        type: 'final',
        // LEAD DATA: Expectativa criada, lead qualificado
    },
    {
        id: 'closing3',
        message: "Alguma coisa mais que você quer me contar antes de eu ir preparar isso?",
        delay: 2000,
        type: 'text',
        field: 'additional_info',
        optional: true,
        placeholder: "Ex: Tenho uma dúvida sobre...",
        // LEAD DATA: Oportunidade para informações adicionais
    },
    {
        id: 'final_close',
        message: "Perfeito! Vou preparar tudo agora. Até logo! 👋",
        delay: 2000,
        type: 'final',
        skipIf: () => {
            // Only show if we got additional info
            return !leadData.additional_info;
        }
    }
];

// ========================================
// CHAT STATE MANAGEMENT
// ========================================
let chatState = {
    currentStep: 0,
    answers: {},
    startTime: null
};

// ========================================
// INITIALIZE AI CHAT
// ========================================
function initAIChat() {
    const startChatBtn = document.getElementById('start-ai-chat');
    const startLunaBtn = document.getElementById('start-luna-chat');
    const chatModal = document.getElementById('ai-chat-modal');
    const closeChatBtn = document.getElementById('close-ai-chat');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');
    const floatBtn = document.getElementById('ai-float-btn');
    
    if (!chatModal) {
        console.error('AI Chat Modal not found!');
        return;
    }
    
    // Open chat from hero button - with multiple fallbacks
    if (startLunaBtn) {
        // Remove any existing listeners
        const newBtn = startLunaBtn.cloneNode(true);
        startLunaBtn.parentNode.replaceChild(newBtn, startLunaBtn);
        
        // Add click listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof openLunaChat === 'function') {
                openLunaChat();
            } else if (typeof window.openLunaChat === 'function') {
                window.openLunaChat();
            } else {
                // Fallback: open modal directly
                const modal = document.getElementById('ai-chat-modal');
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }
    
    // Open chat from original button (if exists)
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => openLunaChat());
    }
    
    // Float button - always available
    if (floatBtn) {
        floatBtn.addEventListener('click', () => openLunaChat());
        // Make it always visible
        floatBtn.style.display = 'flex';
    }
    
    // Close chat
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', closeChat);
    }
    
    if (chatModal) {
        chatModal.addEventListener('click', (e) => {
            if (e.target === chatModal) closeChat();
        });
    }
    
    function closeChat() {
        chatModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Send message
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', () => handleTextInput());
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleTextInput();
        });
    }
}

// ========================================
// RESET CHAT
// ========================================
function resetChat() {
    // Reset chat started flag
    chatStarted = false;
    
    // Reset last message tracking
    lastAIMessageText = null;
    
    chatState = {
        currentStep: -1, // Reset to prevent old flow
        answers: {},
        startTime: new Date()
    };
    leadData = {
        name: null,
        phone: null,
        email: null,
        propertyType: null,
        bedrooms: null,
        location: null,
        mustHaveFeatures: [],
        niceToHaveFeatures: [],
        budget: { min: null, max: null, exact: null, flexible: false },
        purchaseCondition: { method: null, downPayment: null, financingAmount: null, preApproved: false, bank: null },
        timeline: { when: null, urgency: null, reason: null },
        motivation: { primary: null, secondary: null, story: null, painPoints: [], emotionalDrivers: [] },
        currentSituation: { living: null, currentLocation: null, whyMoving: null, currentPainPoints: [] },
        experience: { firstTime: false, previousPurchases: 0, knowledgeLevel: null },
        decisionMakers: { alone: false, partner: false, family: false, others: [] },
        contactPreference: { method: null, bestTime: null, urgency: null },
        qualityScore: 0,
        chatDuration: 0,
        questionsAnswered: 0,
        startedAt: new Date(),
        completedAt: null
    };
}

// ========================================
// START CHAT - With Conversation Engine
// ========================================
let chatStarted = false; // Prevent multiple starts

function startChat(initialMessage = null) {
    // Prevent multiple starts
    if (chatStarted) {
        console.log('Chat already started, ignoring...');
        return;
    }
    chatStarted = true;
    
    const messagesContainer = document.getElementById('chat-messages');
    const optionsContainer = document.getElementById('ai-options');
    
    if (!messagesContainer) return;
    
    // Clear everything
    messagesContainer.innerHTML = '';
    if (optionsContainer) optionsContainer.innerHTML = '';
    
    // Reset conversation memory
    if (typeof window.conversationEngine !== 'undefined') {
        window.conversationEngine.conversationMemory = {
            messages: [],
            extractedData: {},
            topicsCovered: new Set(),
            lastUserMessage: null,
            lastAIMessage: null,
            conversationFlow: []
        };
        // Reset last processed message
        if (window.conversationEngine._lastProcessedMessage !== undefined) {
            window.conversationEngine._lastProcessedMessage = null;
        }
    }
    
    // Clear any pending timeouts that might cause duplicate messages
    // This is a simple approach - in production you'd track timeouts
    
    // Reset chat state
    chatState.currentStep = -1; // Reset to prevent old flow
    
    // Show opening - more friendly and less direct
    setTimeout(() => {
        addAIMessage("Oi! 👋 Que bom você ter chegado até aqui!");
    }, 300);
    
    setTimeout(() => {
        addAIMessage("Eu sou a Luna! Estou aqui pra te ajudar a encontrar o lugar perfeito pra você. 😊");
    }, 1000);
    
    setTimeout(() => {
        // If there's an initial message, use it directly
        if (initialMessage) {
            addAIMessage("Me conta: o que você tá procurando? Pode falar do jeito que quiser, sem pressa!");
            setTimeout(() => {
                addUserMessage(initialMessage);
                if (typeof window.conversationEngine !== 'undefined' && window.conversationEngine.handleConversation) {
                    const response = window.conversationEngine.handleConversation(initialMessage);
                    if (typeof window.processAIResponse === 'function') {
                        window.processAIResponse(response);
                    }
                }
            }, 800);
        } else {
            // Start open conversation - more flexible
            addAIMessage("Me conta: o que você tá procurando? Pode falar do jeito que quiser, como se estivesse conversando com uma amiga! Não precisa ter tudo certo, a gente vai descobrindo juntos! 😊");
            showTextInput({
                field: 'motivation.story',
                type: 'text',
                optional: true,
                placeholder: "Ex: Quero um apartamento de 3 quartos perto do metrô..."
            });
        }
    }, 1800);
}

// openLunaChat is now defined at the top of the file (IIFE)
// This ensures it's available immediately, even before DOMContentLoaded

// ========================================
// PROCESS NEXT STEP (Legacy - disabled when using conversation engine)
// ========================================
function processNextStep() {
    // If conversation engine is available, don't use old flow
    if (typeof window.conversationEngine !== 'undefined' && window.conversationEngine.handleConversation) {
        console.log('Using conversation engine, ignoring processNextStep');
        return;
    }
    
    // Skip to next step if current one should be skipped
    let step = null;
    let attempts = 0;
    const maxAttempts = leadCaptureFlow.length * 2; // Allow more attempts for skipping
    
    do {
        if (chatState.currentStep >= leadCaptureFlow.length - 1) {
            // Check if we have minimum required info before finishing
            if (leadData.name && leadData.phone) {
                finishChat();
            } else {
                // Still need contact info, go back to ask for it
                if (!leadData.phone) {
                    chatState.currentStep = leadCaptureFlow.findIndex(s => s.id === 'phone_natural');
                    if (chatState.currentStep >= 0) {
                        step = leadCaptureFlow[chatState.currentStep];
                        break;
                    }
                }
                finishChat();
            }
            return;
        }
        
        chatState.currentStep++;
        step = leadCaptureFlow[chatState.currentStep];
        attempts++;
        
        if (!step) {
            finishChat();
            return;
        }
        
        // Check if step should be skipped
        if (step.skipIf && typeof step.skipIf === 'function') {
            if (step.skipIf()) {
                // Skip this step, continue to next
                continue;
            }
        }
        
        // Break if we found a valid step
        break;
    } while (attempts < maxAttempts);
    
    if (!step || attempts >= maxAttempts) {
        finishChat();
        return;
    }
    
    // Add delay for natural conversation
    setTimeout(() => {
        addAIMessage(step.message);
        
        // Handle different question types
        if (step.type === 'options') {
            setTimeout(() => showOptions(step.options, step.field, step), 800);
        } else if (step.type === 'multi') {
            setTimeout(() => showMultiOptions(step.options, step.field, step), 800);
        } else if (step.type === 'text') {
            setTimeout(() => showTextInput(step), 800);
        } else if (step.type === 'final') {
            // Check if this is the last step or if we should finish
            setTimeout(() => {
                if (chatState.currentStep >= leadCaptureFlow.length - 1) {
                    finishChat();
                } else {
                    processNextStep();
                }
            }, step.delay || 2000);
        } else if (step.type === 'greeting') {
            setTimeout(() => processNextStep(), step.delay || 1000);
        }
    }, step.delay || 1000);
}

// ========================================
// HANDLE OPTION CLICK
// ========================================
function handleOptionClick(field, value, step) {
    // Save answer
    saveAnswer(field, value, step);
    
    // Add user message
    const optionText = step.options.find(opt => opt.value === value)?.text || value;
    addUserMessage(optionText);
    
    // Clear options
    document.getElementById('ai-options').innerHTML = '';
    
    // Show follow-up if exists
    if (step.followUp) {
        let followUpText = step.followUp;
        if (typeof followUpText === 'object' && followUpText[value]) {
            followUpText = followUpText[value];
        }
        if (typeof followUpText === 'string' && followUpText.includes('{name}')) {
            followUpText = followUpText.replace('{name}', leadData.name || 'você');
        }
        
        setTimeout(() => {
            addAIMessage(followUpText);
            setTimeout(() => processNextStep(), 1000);
        }, 500);
    } else {
        setTimeout(() => processNextStep(), 1000);
    }
    
    // Handle conditional follow-ups
    if (step.conditionalFollowUp && step.conditionalFollowUp[value]) {
        const conditionalStep = step.conditionalFollowUp[value];
        setTimeout(() => {
            addAIMessage(conditionalStep.message);
            setTimeout(() => {
                if (conditionalStep.type === 'options') {
                    showOptions(conditionalStep.options, conditionalStep.field, conditionalStep);
                }
            }, 800);
        }, 2000);
        return; // Don't process next step yet
    }
}

// ========================================
// PROCESS NATURAL LANGUAGE
// Extract structured data from free text
// ========================================
function processNaturalLanguage(text, field) {
    if (!text || typeof text !== 'string') return {};
    
    const lowerText = text.toLowerCase();
    const extracted = {};
    
    // Budget extraction
    if (field === 'budget.range' || text.match(/mil|milhão|reais|r\$/i)) {
        // IMPORTANTE: Verificar "milhão" ANTES de "mil" na regex
        // Primeiro, verificar explicitamente por "milhão" ou "milhões"
        const hasMillionWord = /milh[oõ]es?/i.test(text);
        
        if (hasMillionWord) {
            // Extrair valor de milhões
            const millionMatch = text.match(/(?:até|até\s*|uns?\s*)?(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(?:milh[oõ]es?|m[ií]lh[oõ]es?)/i);
            if (millionMatch) {
                let value = parseFloat(millionMatch[1].replace(',', '.'));
                value *= 1000000; // Sempre milhões
                extracted.budget = { max: value };
            }
        } else {
            // Só processar "mil" se NÃO houver "milhão" no texto
            const thousandMatch = text.match(/(?:até|até\s*|uns?\s*)?(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(mil|k)\b/i);
            if (thousandMatch) {
                let value = parseFloat(thousandMatch[1].replace(',', '.'));
                value *= 1000; // Milhares
                extracted.budget = { max: value };
            }
        }
        
        // Range detection - também verificar milhões primeiro
        const millionRangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:a|até|-)\s*(\d+(?:[.,]\d+)?)\s*(milh[oõ]es?)/i);
        if (millionRangeMatch) {
            let min = parseFloat(millionRangeMatch[1].replace(',', '.'));
            let max = parseFloat(millionRangeMatch[2].replace(',', '.'));
            min *= 1000000;
            max *= 1000000;
            extracted.budget = { min, max };
        } else {
            const thousandRangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:a|até|-)\s*(\d+(?:[.,]\d+)?)\s*(mil|k)/i);
            if (thousandRangeMatch) {
                let min = parseFloat(thousandRangeMatch[1].replace(',', '.'));
                let max = parseFloat(thousandRangeMatch[2].replace(',', '.'));
                min *= 1000;
                max *= 1000;
                extracted.budget = { min, max };
            }
        }
    }
    
    // Property type extraction
    if (field === 'propertyType' || !leadData.propertyType) {
        if (lowerText.match(/apartamento|apto|ap/i)) extracted.propertyType = 'apartamento';
        else if (lowerText.match(/casa|sobrado|residencial/i)) extracted.propertyType = 'casa';
        else if (lowerText.match(/studio|loft|kitnet/i)) extracted.propertyType = 'studio';
        else if (lowerText.match(/cobertura|cobert/i)) extracted.propertyType = 'cobertura';
    }
    
    // Bedrooms extraction
    if (field === 'bedrooms' || !leadData.bedrooms) {
        const bedroomMatch = text.match(/(\d+)\s*(?:quarto|dormitório)/i) || 
                            text.match(/um|dois|três|quatro|cinco/i);
        if (bedroomMatch) {
            const numMap = { 'um': 1, 'dois': 2, 'três': 3, 'quatro': 4, 'cinco': 5 };
            extracted.bedrooms = numMap[bedroomMatch[0].toLowerCase()] || parseInt(bedroomMatch[1]) || null;
        }
        
        // Infer from family size
        if (lowerText.match(/sozinho|só eu/i)) extracted.bedrooms = 1;
        else if (lowerText.match(/casal|eu e (?:minha|meu)/i)) extracted.bedrooms = 2;
        else if (lowerText.match(/filhos|família/i)) extracted.bedrooms = 3;
    }
    
    // Timeline extraction
    if (field === 'timeline.when' || !leadData.timeline?.when) {
        if (lowerText.match(/urgente|logo|já|agora|imediat/i)) {
            extracted.timeline = { when: 'immediate', urgency: 'high' };
        } else if (lowerText.match(/próximo mês|mês que vem|breve/i)) {
            extracted.timeline = { when: '1-3months', urgency: 'high' };
        } else if (lowerText.match(/3.*6.*mês|semestre/i)) {
            extracted.timeline = { when: '3-6months', urgency: 'medium' };
        } else if (lowerText.match(/6.*12.*mês|ano que vem|final do ano/i)) {
            extracted.timeline = { when: '6-12months', urgency: 'medium' };
        } else if (lowerText.match(/explorando|quando der|sem pressa/i)) {
            extracted.timeline = { when: 'exploring', urgency: 'low' };
        }
    }
    
    // Phone/WhatsApp extraction
    if (field === 'phone' || !leadData.phone) {
        // Match phone patterns: (51) 99999-9999, 51 999999999, 99999-9999, etc
        const phoneMatch = text.match(/(?:\(?(\d{2})\)?\s*)?(\d{4,5}[-.\s]?\d{4,5})/);
        if (phoneMatch) {
            let phone = phoneMatch[0].replace(/[^\d]/g, '');
            // If doesn't start with country code, assume it's a local number
            if (phone.length >= 10 && phone.length <= 11) {
                extracted.phone = phone;
            }
        }
        // Also check for WhatsApp mentions
        if (lowerText.match(/whatsapp|zap|wpp/i) && phoneMatch) {
            extracted.phone = phoneMatch[0].replace(/[^\d]/g, '');
        }
    }
    
    // Email extraction
    if (field === 'email' || !leadData.email) {
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
            extracted.email = emailMatch[0];
        }
    }
    
    // Motivation extraction
    if (field === 'motivation.story' || field === 'motivation.context') {
        if (lowerText.match(/primeiro|primeira vez|nunca tive/i)) {
            extracted.motivation = { primary: 'first_home' };
            extracted.experience = { firstTime: true };
        } else if (lowerText.match(/upgrade|trocar|melhor|maior/i)) {
            extracted.motivation = { primary: 'upgrade' };
        } else if (lowerText.match(/investir|investimento|renda|alugar/i)) {
            extracted.motivation = { primary: 'investment' };
        } else if (lowerText.match(/casamento|casou|filhos|nasc/i)) {
            extracted.motivation = { primary: 'life_change' };
        } else if (lowerText.match(/trabalho|emprego|mudança/i)) {
            extracted.motivation = { primary: 'work' };
        }
        
        // Pain points
        if (lowerText.match(/aluguel.*caro|muito.*pagar/i)) {
            extracted.currentSituation = { painPoints: ['high_rent'] };
        }
        if (lowerText.match(/pequeno|espaço|apertado/i)) {
            if (!extracted.motivation) extracted.motivation = {};
            extracted.motivation.painPoints = ['lack_of_space'];
        }
    }
    
    // Payment method extraction
    if (field === 'purchaseCondition.method') {
        if (lowerText.match(/à vista|vista|dinheiro|pronto/i)) {
            extracted.purchaseCondition = { method: 'cash' };
        } else if (lowerText.match(/financiamento|banco|parcela/i)) {
            extracted.purchaseCondition = { method: 'financing' };
            if (lowerText.match(/já.*consultei|pré.*aprov|simulei/i)) {
                extracted.purchaseCondition.preApproved = true;
            }
        }
    }
    
    // Location extraction - PRIORIDADE: CIDADE primeiro
    if (field === 'location' || lowerText.match(/porto alegre|canoas|viamão|gravataí|cachoeirinha|são leopoldo|novo hamburgo|alvorada|sapucaia|cidade/i)) {
        const cities = {
            // Cidades da Região Metropolitana (PRIORIDADE)
            'porto alegre': 'Porto Alegre',
            'poa': 'Porto Alegre',
            'canoas': 'Canoas',
            'viamão': 'Viamão',
            'gravataí': 'Gravataí',
            'gravatai': 'Gravataí',
            'cachoeirinha': 'Cachoeirinha',
            'são leopoldo': 'São Leopoldo',
            'sao leopoldo': 'São Leopoldo',
            'novo hamburgo': 'Novo Hamburgo',
            'alvorada': 'Alvorada',
            'sapucaia do sul': 'Sapucaia do Sul',
            'sapucaia': 'Sapucaia do Sul'
        };
        
        // Tentar match exato primeiro (CIDADES)
        for (const [key, value] of Object.entries(cities)) {
            if (lowerText.includes(key)) {
                extracted.location = value;
                break;
            }
        }
        
        // Se não encontrou match exato, tentar extrair qualquer nome de cidade mencionado
        if (!extracted.location) {
            // Procurar por padrões como "em [cidade]", "na [cidade]", "de [cidade]"
            const cityMatch = lowerText.match(/(?:em|na|no|de|da)\s+([a-záàâãéêíóôõúç\s]+?)(?:,|\.|$|região|metropolitana|rs)/i);
            if (cityMatch && cityMatch[1]) {
                const potentialCity = cityMatch[1].trim();
                // Validar se parece uma cidade (não muito curto, não muito longo, não é palavra comum)
                const commonWords = ['a', 'o', 'de', 'da', 'do', 'em', 'na', 'no', 'para', 'com', 'que', 'tipo', 'região'];
                if (potentialCity.length > 2 && potentialCity.length < 30 && !commonWords.includes(potentialCity.toLowerCase())) {
                    extracted.location = potentialCity;
                }
            }
        }
        
        // Features from location context
        if (lowerText.match(/metrô|transporte|estação|ônibus/i)) {
            extracted.mustHaveFeatures = [...(extracted.mustHaveFeatures || []), 'transporte'];
        }
        if (lowerText.match(/pet|animal|cachorro|gato/i)) {
            extracted.mustHaveFeatures = [...(extracted.mustHaveFeatures || []), 'pet friendly'];
        }
    }
    
    // Current situation extraction
    if (field === 'currentSituation.living') {
        if (lowerText.match(/alugando|alugo|aluguel/i)) {
            extracted.currentSituation = { living: 'renting' };
        } else if (lowerText.match(/tenho|já tenho|próprio/i)) {
            extracted.currentSituation = { living: 'owning' };
        } else if (lowerText.match(/família|pais|mãe|pai/i)) {
            extracted.currentSituation = { living: 'with_family' };
        }
    }
    
    // Decision makers extraction
    if (field === 'decisionMakers') {
        if (lowerText.match(/só eu|sozinho|eu mesmo/i)) {
            extracted.decisionMakers = { alone: true };
        } else if (lowerText.match(/esposa|marido|parceiro|cônjuge|nós/i)) {
            extracted.decisionMakers = { partner: true };
        } else if (lowerText.match(/família|todos|juntos/i)) {
            extracted.decisionMakers = { family: true };
        }
    }
    
    return extracted;
}

// ========================================
// SAVE ANSWER
// ========================================
function saveAnswer(field, value, step) {
    // Save to chatState
    const fieldParts = field.split('.');
    let obj = chatState.answers;
    for (let i = 0; i < fieldParts.length - 1; i++) {
        if (!obj[fieldParts[i]]) obj[fieldParts[i]] = {};
        obj = obj[fieldParts[i]];
    }
    obj[fieldParts[fieldParts.length - 1]] = value;
    
    // Save to leadData with data from step
    if (step && step.options) {
        const option = step.options.find(opt => opt.value === value);
        if (option && option.data) {
            mergeData(leadData, option.data);
        }
    }
    
    // Update field directly
    setNestedField(leadData, field, value);
    
    // Process natural language if value is text
    if (typeof value === 'string' && value.length > 3) {
        const extracted = processNaturalLanguage(value, field);
        if (Object.keys(extracted).length > 0) {
            mergeData(leadData, extracted);
        }
    }
    
    // Update quality score
    updateQualityScore();
    leadData.questionsAnswered++;
}

// ========================================
// MERGE DATA
// ========================================
function mergeData(target, source) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            mergeData(target[key], source[key]);
        } else if (Array.isArray(source[key])) {
            if (!target[key]) target[key] = [];
            target[key] = [...target[key], ...source[key]];
        } else {
            target[key] = source[key];
        }
    }
}

// ========================================
// SET NESTED FIELD
// ========================================
function setNestedField(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

// ========================================
// UPDATE QUALITY SCORE
// ========================================
function updateQualityScore() {
    let score = 0;
    
    // Basic info (20 points)
    if (leadData.name) score += 5;
    if (leadData.phone) score += 10;
    if (leadData.email) score += 5;
    
    // Budget info (30 points) - CRITICAL
    if (leadData.budget.min || leadData.budget.max) score += 20;
    if (leadData.budget.exact) score += 10;
    
    // Purchase condition (25 points) - CRITICAL
    if (leadData.purchaseCondition.method) score += 15;
    if (leadData.purchaseCondition.downPayment) score += 10;
    
    // Timeline (15 points)
    if (leadData.timeline.when) score += 10;
    if (leadData.timeline.urgency === 'high') score += 5;
    
    // Motivation (10 points)
    if (leadData.motivation.primary) score += 10;
    
    // Total: 100 points
    leadData.qualityScore = Math.min(score, 100);
}

// ========================================
// SHOW OPTIONS
// ========================================
function showOptions(options, field, step) {
    const optionsContainer = document.getElementById('ai-options');
    
    optionsContainer.innerHTML = options.map(opt => 
        `<button class="ai-option-btn" data-field="${field}" data-value="${opt.value}">${opt.text}</button>`
    ).join('');
    
    optionsContainer.querySelectorAll('.ai-option-btn').forEach(btn => {
        btn.addEventListener('click', () => handleOptionClick(btn.dataset.field, btn.dataset.value, step));
    });
}

// ========================================
// SHOW MULTI OPTIONS
// ========================================
function showMultiOptions(options, field, step) {
    const optionsContainer = document.getElementById('ai-options');
    
    optionsContainer.innerHTML = options.map(opt => 
        `<button class="ai-option-btn ai-multi-option" data-field="${field}" data-value="${opt.value}">${opt.text}</button>`
    ).join('');
    
    optionsContainer.innerHTML += '<button class="ai-option-btn ai-continue-btn" id="continue-multi" style="background: linear-gradient(135deg, #8b5cf6, #a855f7); margin-top: 12px;">Continuar →</button>';
    
    const selected = new Set();
    
    optionsContainer.querySelectorAll('.ai-multi-option').forEach(btn => {
        btn.addEventListener('click', () => {
            if (selected.has(btn.dataset.value)) {
                selected.delete(btn.dataset.value);
                btn.style.background = '';
                btn.style.borderColor = '';
            } else {
                selected.add(btn.dataset.value);
                btn.style.background = 'linear-gradient(135deg, #8b5cf6, #a855f7)';
                btn.style.borderColor = '#8b5cf6';
                btn.style.color = 'white';
            }
        });
    });
    
    document.getElementById('continue-multi').addEventListener('click', () => {
        if (selected.size === 0) {
            showNotification('Selecione pelo menos uma opção!', 'error');
            return;
        }
        
        // Save all selected
        const values = Array.from(selected);
        setNestedField(leadData, field, values);
        
        addUserMessage(`Selecionado: ${values.length} opção(ões)`);
        optionsContainer.innerHTML = '';
        
        setTimeout(() => processNextStep(), 1000);
    });
}

// ========================================
// SHOW TEXT INPUT
// ========================================
function showTextInput(step) {
    const input = document.getElementById('chat-input');
    input.placeholder = step.placeholder || "Digite sua resposta...";
    input.dataset.stepField = step.field || '';
    input.dataset.stepValidation = step.validation ? 'true' : 'false';
    input.dataset.stepOptional = step.optional ? 'true' : 'false';
    input.dataset.onComplete = step.onComplete ? 'true' : 'false';
    if (step.onComplete) {
        input._onComplete = step.onComplete;
    }
    input.style.display = 'block';
    input.focus();
}

// ========================================
// HANDLE TEXT INPUT - With Conversation Engine
// ========================================
function handleTextInput() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    const field = input.dataset.stepField;
    const needsValidation = input.dataset.stepValidation === 'true';
    const isOptional = input.dataset.stepOptional === 'true';
    
    if (!text && !isOptional) {
        showNotification('Por favor, digite uma resposta', 'error');
        return;
    }
    
    if (text && needsValidation) {
        const step = leadCaptureFlow.find(s => s.field === field);
        if (step && step.validation && !step.validation(text)) {
            showNotification(step.errorMessage || 'Resposta inválida', 'error');
            return;
        }
    }
    
    if (text) {
        addUserMessage(text);
        
        // Save answer to leadData
        if (field) {
            saveAnswer(field, text, leadCaptureFlow.find(s => s.field === field));
        }
        
        // Check for onComplete callback
        if (input._onComplete && typeof input._onComplete === 'function') {
            input._onComplete(text);
            input._onComplete = null;
            input.value = '';
            input.style.display = 'none';
            return;
        }
        
        // Use conversation engine if available (and not handling name)
        if (field !== 'name' && typeof window.conversationEngine !== 'undefined' && window.conversationEngine.handleConversation) {
            const response = window.conversationEngine.handleConversation(text);
            if (typeof window.processAIResponse === 'function') {
                window.processAIResponse(response);
            }
        } else if (field === 'name') {
            // Name is handled by onComplete callback, nothing to do here
        } else {
            // Fallback: simple acknowledgment
            setTimeout(() => {
                addAIMessage("Entendi!");
            }, 500);
        }
    } else {
        // If optional and empty, just continue
        setTimeout(() => processNextStep(), 1000);
    }
    
    input.value = '';
    input.style.display = 'none';
}

// ========================================
// FINISH CHAT
// ========================================
function finishChat() {
    // Silently save search preferences (not lead data)
    // This is just for analytics, not for contact
    const searchData = {
        propertyType: leadData.propertyType,
        bedrooms: leadData.bedrooms,
        location: leadData.location,
        budget: leadData.budget,
        preferences: {
            mustHaveFeatures: leadData.mustHaveFeatures,
            motivation: leadData.motivation?.primary
        },
        timestamp: new Date().toISOString()
    };
    
    // Save search session (not lead)
    try {
        const searches = JSON.parse(localStorage.getItem('larprime_searches') || '[]');
        searches.push(searchData);
        localStorage.setItem('larprime_searches', JSON.stringify(searches));
    } catch(e) {
        console.log('Could not save search data');
    }
    
    // No messages shown - user is already being redirected to results
    // The conversation engine handles the closing message
}

// ========================================
// SAVE LEAD TO STORAGE
// ========================================
function saveLeadToStorage() {
    try {
        // Calculate lead score
        const score = calculateLeadScore();
        leadData.qualityScore = score;
        leadData.timestamp = new Date().toISOString();
        leadData.id = leadData.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Get existing leads
        const existingLeads = JSON.parse(localStorage.getItem('larprime_leads') || '[]');
        
        // Check if lead already exists (by ID or similar data)
        const existingIndex = existingLeads.findIndex(l => l.id === leadData.id);
        
        if (existingIndex >= 0) {
            // Update existing lead (merge with new data)
            existingLeads[existingIndex] = { ...existingLeads[existingIndex], ...leadData };
        } else {
            // Add new lead
            existingLeads.push({...leadData});
        }
        
        // Save back
        localStorage.setItem('larprime_leads', JSON.stringify(existingLeads));
        
        // Make leadData globally accessible for sidebar
        window.leadData = leadData;
        
        // Trigger storage event for admin panel
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'larprime_leads',
            newValue: JSON.stringify(existingLeads)
        }));
        
        // In production, also send to API
        // fetch('/api/leads', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(leadData)
        // });
        
        console.log('Lead salvo com sucesso!', leadData);
    } catch (error) {
        console.error('Erro ao salvar lead:', error);
    }
}

// ========================================
// SHOW LEAD SUMMARY
// ========================================
function showLeadSummary() {
    const messagesContainer = document.getElementById('chat-messages');
    
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'lead-summary';
    summaryDiv.innerHTML = `
        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; margin-top: 20px;">
            <h4 style="margin-bottom: 16px; color: #c084fc;">
                <i class="fas fa-chart-line"></i> Lead Qualificado
            </h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div>
                    <strong>Nome:</strong> ${leadData.name || 'Não informado'}<br>
                    <strong>Telefone:</strong> ${leadData.phone || 'Não informado'}<br>
                    <strong>E-mail:</strong> ${leadData.email || 'Não informado'}
                </div>
                <div>
                    <strong>Orçamento:</strong> ${formatBudget()}<br>
                    <strong>Timeline:</strong> ${leadData.timeline.when || 'Não informado'}<br>
                    <strong>Score:</strong> <span style="color: #10b981; font-weight: bold;">${leadData.qualityScore}/100</span>
                </div>
            </div>
            <button id="export-lead" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-download"></i> Exportar Dados do Lead
            </button>
        </div>
    `;
    
    messagesContainer.appendChild(summaryDiv);
    
    document.getElementById('export-lead').addEventListener('click', exportLeadData);
}

// ========================================
// FORMAT BUDGET
// ========================================
function formatBudget() {
    if (leadData.budget.exact) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(leadData.budget.exact);
    }
    if (leadData.budget.min && leadData.budget.max) {
        return `R$ ${(leadData.budget.min / 1000).toFixed(0)}k - R$ ${(leadData.budget.max / 1000).toFixed(0)}k`;
    }
    if (leadData.budget.max) {
        return `Até R$ ${(leadData.budget.max / 1000).toFixed(0)}k`;
    }
    if (leadData.budget.min) {
        return `A partir de R$ ${(leadData.budget.min / 1000).toFixed(0)}k`;
    }
    return 'Não informado';
}

// ========================================
// EXPORT LEAD DATA
// ========================================
function exportLeadData() {
    const dataStr = JSON.stringify(leadData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lead-${leadData.name || 'anonimo'}-${Date.now()}.json`;
    link.click();
    
    // Also copy to clipboard
    navigator.clipboard.writeText(dataStr).then(() => {
        showNotification('Dados exportados e copiados para a área de transferência!', 'success');
    });
    
    // In production, send to server
    // fetch('/api/leads', { method: 'POST', body: JSON.stringify(leadData) });
}

// ========================================
// INIT LEAD EXPORT
// ========================================
function initLeadExport() {
    // Add export button to admin panel (if exists)
    // This would be in a separate admin interface
}

// ========================================
// HELPER FUNCTIONS (from previous file)
// ========================================
let lastAIMessageText = null; // Track last message to prevent duplicates

function addAIMessage(text) {
    // Prevent duplicate messages
    if (lastAIMessageText === text) {
        console.log('Duplicate AI message detected, ignoring:', text);
        return;
    }
    lastAIMessageText = text;
    
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    // Check if this message already exists in DOM
    const existingMessages = messagesContainer.querySelectorAll('.ai-message-content');
    for (let msg of existingMessages) {
        if (msg.textContent.trim() === text.trim()) {
            console.log('Message already in DOM, ignoring:', text);
            return;
        }
    }
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message';
    typingDiv.innerHTML = `
        <div class="ai-message-avatar"><i class="fas fa-robot"></i></div>
        <div class="ai-message-content">
            <div class="ai-typing">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    setTimeout(() => {
        typingDiv.querySelector('.ai-message-content').innerHTML = text;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 800);
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message user';
    messageDiv.innerHTML = `
        <div class="ai-message-avatar"><i class="fas fa-user"></i></div>
        <div class="ai-message-content">${text}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#8b5cf6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Keep old search functionality - these are defined in ai-search.js
// Just placeholder functions to prevent errors
function initAISearch() {
    // Function is in ai-search.js
}

function initAIFloatButton() {
    // Function is in ai-search.js - but we override it here for lead capture
    const floatBtn = document.getElementById('ai-float-btn');
    if (floatBtn) {
        floatBtn.addEventListener('click', () => {
            const chatModal = document.getElementById('ai-chat-modal');
            if (chatModal) {
                chatModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                resetChat();
                startChat();
            }
        });
    }
}

