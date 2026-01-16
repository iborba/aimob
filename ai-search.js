// ========================================
// LAR PRIME - AI Search Engine
// Simulates intelligent property search
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initAISearch();
    initAIChat();
    initAIFloatButton();
});

// ========================================
// PROPERTY DATABASE (Simulated)
// ========================================
const properties = [
    {
        id: 1,
        title: "Apartamento 3 Quartos Vila Olímpia",
        type: "apartamento",
        price: 580000,
        bedrooms: 3,
        bathrooms: 2,
        parking: 1,
        area: 95,
        location: "Vila Olímpia",
        city: "São Paulo",
        features: ["pet friendly", "academia", "piscina", "portaria 24h", "metrô próximo"],
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        aiInsight: "Ideal para jovens profissionais. 5 min do metrô.",
        matchScore: 0
    },
    {
        id: 2,
        title: "Casa com Quintal em Alphaville",
        type: "casa",
        price: 1450000,
        bedrooms: 4,
        bathrooms: 3,
        parking: 3,
        area: 320,
        location: "Alphaville",
        city: "Barueri",
        features: ["quintal", "churrasqueira", "piscina", "condomínio fechado", "segurança 24h", "aceita pet", "área verde"],
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        aiInsight: "Perfeita para família grande. Condomínio com lazer completo.",
        matchScore: 0
    },
    {
        id: 3,
        title: "Studio Moderno Pinheiros",
        type: "studio",
        price: 380000,
        bedrooms: 1,
        bathrooms: 1,
        parking: 1,
        area: 35,
        location: "Pinheiros",
        city: "São Paulo",
        features: ["mobiliado", "metrô próximo", "lazer completo", "ideal investimento", "alto retorno"],
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        aiInsight: "ROI de 0.65% ao mês. Região em valorização.",
        matchScore: 0
    },
    {
        id: 4,
        title: "Cobertura Duplex Itaim Bibi",
        type: "cobertura",
        price: 2800000,
        bedrooms: 4,
        bathrooms: 5,
        parking: 4,
        area: 380,
        location: "Itaim Bibi",
        city: "São Paulo",
        features: ["vista panorâmica", "piscina privativa", "área gourmet", "alto padrão", "automação", "varanda"],
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        aiInsight: "Exclusividade máxima. Vista 360° da cidade.",
        matchScore: 0
    },
    {
        id: 5,
        title: "Apartamento Garden Moema",
        type: "apartamento",
        price: 720000,
        bedrooms: 2,
        bathrooms: 2,
        parking: 2,
        area: 110,
        location: "Moema",
        city: "São Paulo",
        features: ["garden", "quintal privativo", "pet friendly", "próximo Ibirapuera", "lazer completo"],
        image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
        aiInsight: "Raro garden com quintal. Perto do Ibirapuera.",
        matchScore: 0
    },
    {
        id: 6,
        title: "Casa Moderna Jardins",
        type: "casa",
        price: 1250000,
        bedrooms: 4,
        bathrooms: 3,
        parking: 2,
        area: 280,
        location: "Jardins",
        city: "São Paulo",
        features: ["piscina", "churrasqueira", "home office", "acabamento premium", "jardim"],
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
        aiInsight: "Localização nobre. Arquitetura contemporânea.",
        matchScore: 0
    },
    {
        id: 7,
        title: "Loft Industrial Vila Madalena",
        type: "loft",
        price: 650000,
        bedrooms: 1,
        bathrooms: 2,
        parking: 1,
        area: 85,
        location: "Vila Madalena",
        city: "São Paulo",
        features: ["pé direito alto", "estilo industrial", "próximo bares", "jovem", "metrô"],
        image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop",
        aiInsight: "Estilo único. Bairro boêmio e cultural.",
        matchScore: 0
    },
    {
        id: 8,
        title: "Apartamento Primeiro Imóvel Tatuapé",
        type: "apartamento",
        price: 320000,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        area: 55,
        location: "Tatuapé",
        city: "São Paulo",
        features: ["entrada facilitada", "metrô próximo", "MCMV", "lazer completo", "segurança"],
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
        aiInsight: "Ótimo para primeiro imóvel. Aceita financiamento.",
        matchScore: 0
    }
];

// ========================================
// AI SEARCH KEYWORDS MAPPING
// ========================================
const keywordMapping = {
    // Tipos
    "apartamento": { field: "type", values: ["apartamento"] },
    "casa": { field: "type", values: ["casa"] },
    "studio": { field: "type", values: ["studio"] },
    "cobertura": { field: "type", values: ["cobertura"] },
    "loft": { field: "type", values: ["loft"] },
    
    // Quartos
    "1 quarto": { field: "bedrooms", min: 1, max: 1 },
    "2 quartos": { field: "bedrooms", min: 2, max: 2 },
    "3 quartos": { field: "bedrooms", min: 3, max: 3 },
    "4 quartos": { field: "bedrooms", min: 4 },
    
    // Preços
    "até 300": { field: "price", max: 300000 },
    "até 400": { field: "price", max: 400000 },
    "até 500": { field: "price", max: 500000 },
    "até 600": { field: "price", max: 600000 },
    "até 700": { field: "price", max: 700000 },
    "até 800": { field: "price", max: 800000 },
    "até 1 milhão": { field: "price", max: 1000000 },
    "até 1.5 milhão": { field: "price", max: 1500000 },
    "até 2 milhões": { field: "price", max: 2000000 },
    "acima de 1 milhão": { field: "price", min: 1000000 },
    "acima de 2 milhões": { field: "price", min: 2000000 },
    
    // Features contextuais
    "pet": { field: "features", value: "pet friendly" },
    "cachorro": { field: "features", value: "pet friendly" },
    "gato": { field: "features", value: "pet friendly" },
    "animal": { field: "features", value: "pet friendly" },
    "piscina": { field: "features", value: "piscina" },
    "metrô": { field: "features", value: "metrô" },
    "transporte": { field: "features", value: "metrô" },
    "churrasqueira": { field: "features", value: "churrasqueira" },
    "quintal": { field: "features", value: "quintal" },
    "jardim": { field: "features", value: "jardim" },
    "home office": { field: "features", value: "home office" },
    "trabalhar": { field: "features", value: "home office" },
    "investimento": { field: "features", value: "ideal investimento" },
    "investir": { field: "features", value: "ideal investimento" },
    "renda": { field: "features", value: "ideal investimento" },
    "alto padrão": { field: "features", value: "alto padrão" },
    "luxo": { field: "features", value: "alto padrão" },
    "vista": { field: "features", value: "vista" },
    "segurança": { field: "features", value: "segurança" },
    "seguro": { field: "features", value: "segurança" },
    "condomínio": { field: "features", value: "condomínio fechado" },
    
    // Perfis
    "família": { field: "profile", value: "family" },
    "filhos": { field: "profile", value: "family" },
    "crianças": { field: "profile", value: "family" },
    "casal": { field: "profile", value: "couple" },
    "jovem": { field: "profile", value: "young" },
    "primeiro imóvel": { field: "profile", value: "first" },
    "solteiro": { field: "profile", value: "single" },
    
    // Localizações
    "pinheiros": { field: "location", value: "Pinheiros" },
    "vila olímpia": { field: "location", value: "Vila Olímpia" },
    "moema": { field: "location", value: "Moema" },
    "jardins": { field: "location", value: "Jardins" },
    "itaim": { field: "location", value: "Itaim Bibi" },
    "alphaville": { field: "location", value: "Alphaville" },
    "vila madalena": { field: "location", value: "Vila Madalena" },
    "tatuapé": { field: "location", value: "Tatuapé" },
    "ibirapuera": { field: "location", value: "Moema" }
};

// ========================================
// AI SEARCH INITIALIZATION
// ========================================
function initAISearch() {
    const searchInput = document.getElementById('ai-search-input');
    const searchBtn = document.getElementById('ai-search-btn');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    
    if (!searchInput || !searchBtn) return;
    
    // Auto-resize textarea
    searchInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Search button click
    searchBtn.addEventListener('click', () => performAISearch(searchInput.value));
    
    // Enter key (but allow Shift+Enter for new lines)
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            performAISearch(searchInput.value);
        }
    });
    
    // Suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            searchInput.value = chip.dataset.text;
            searchInput.style.height = 'auto';
            searchInput.style.height = Math.min(searchInput.scrollHeight, 120) + 'px';
            performAISearch(chip.dataset.text);
        });
    });
}

// ========================================
// PERFORM AI SEARCH
// ========================================
function performAISearch(query) {
    if (!query.trim()) {
        showNotification('Digite o que você procura!', 'error');
        return;
    }
    
    // Show loading state
    const searchBtn = document.getElementById('ai-search-btn');
    const originalContent = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analisando...';
    searchBtn.disabled = true;
    
    // Simulate AI processing delay
    setTimeout(() => {
        const results = processAIQuery(query);
        displayAIResults(query, results);
        
        // Restore button
        searchBtn.innerHTML = originalContent;
        searchBtn.disabled = false;
    }, 1500);
}

// ========================================
// PROCESS AI QUERY
// ========================================
function processAIQuery(query) {
    const queryLower = query.toLowerCase();
    let criteria = [];
    let matchedProperties = [...properties];
    
    // Extract criteria from query
    for (const [keyword, config] of Object.entries(keywordMapping)) {
        if (queryLower.includes(keyword)) {
            criteria.push(keyword);
            
            // Filter properties based on criteria
            matchedProperties = matchedProperties.filter(property => {
                if (config.field === 'type') {
                    return config.values.includes(property.type);
                }
                if (config.field === 'bedrooms') {
                    if (config.min && property.bedrooms < config.min) return false;
                    if (config.max && property.bedrooms > config.max) return false;
                    return true;
                }
                if (config.field === 'price') {
                    if (config.min && property.price < config.min) return false;
                    if (config.max && property.price > config.max) return false;
                    return true;
                }
                if (config.field === 'features') {
                    return property.features.some(f => f.toLowerCase().includes(config.value.toLowerCase()));
                }
                if (config.field === 'location') {
                    return property.location.toLowerCase() === config.value.toLowerCase();
                }
                if (config.field === 'profile') {
                    // Profile-based matching
                    if (config.value === 'family') {
                        return property.bedrooms >= 3;
                    }
                    if (config.value === 'young' || config.value === 'single') {
                        return property.bedrooms <= 2;
                    }
                    if (config.value === 'first') {
                        return property.price <= 500000;
                    }
                    if (config.value === 'couple') {
                        return property.bedrooms >= 2 && property.bedrooms <= 3;
                    }
                }
                return true;
            });
        }
    }
    
    // Calculate match score for each property
    matchedProperties.forEach(property => {
        let score = 50; // Base score
        
        // Bonus for matching features
        criteria.forEach(criterion => {
            const config = keywordMapping[criterion];
            if (config && config.field === 'features') {
                if (property.features.some(f => f.toLowerCase().includes(config.value.toLowerCase()))) {
                    score += 15;
                }
            }
        });
        
        // Bonus for price in range
        if (queryLower.includes('até')) {
            const priceMatch = queryLower.match(/até\s*(\d+)/);
            if (priceMatch) {
                const maxPrice = parseInt(priceMatch[1]) * 1000;
                if (property.price <= maxPrice) {
                    score += 10;
                }
            }
        }
        
        // Random variation for realism
        score += Math.floor(Math.random() * 15);
        
        property.matchScore = Math.min(score, 99);
    });
    
    // Sort by match score
    matchedProperties.sort((a, b) => b.matchScore - a.matchScore);
    
    return {
        properties: matchedProperties,
        criteria: criteria,
        interpretation: generateInterpretation(query, criteria)
    };
}

// ========================================
// GENERATE AI INTERPRETATION
// ========================================
function generateInterpretation(query, criteria) {
    let interpretation = "";
    
    // Type
    const types = ['apartamento', 'casa', 'studio', 'cobertura', 'loft'];
    const matchedType = types.find(t => query.toLowerCase().includes(t));
    if (matchedType) {
        interpretation += matchedType.charAt(0).toUpperCase() + matchedType.slice(1);
    } else {
        interpretation += "Imóvel";
    }
    
    // Bedrooms
    const bedroomMatch = query.match(/(\d+)\s*quarto/i);
    if (bedroomMatch) {
        interpretation += ` com ${bedroomMatch[1]} quarto(s)`;
    }
    
    // Price
    const priceMatch = query.match(/até\s*([\d.,]+)\s*(mil|milhão|milhões)?/i);
    if (priceMatch) {
        interpretation += `, até R$ ${priceMatch[1]}${priceMatch[2] ? ' ' + priceMatch[2] : ' mil'}`;
    }
    
    // Features
    const features = [];
    if (query.toLowerCase().includes('pet') || query.toLowerCase().includes('cachorro')) {
        features.push('aceita pets');
    }
    if (query.toLowerCase().includes('metrô') || query.toLowerCase().includes('transporte')) {
        features.push('perto de transporte');
    }
    if (query.toLowerCase().includes('piscina')) {
        features.push('com piscina');
    }
    if (query.toLowerCase().includes('família') || query.toLowerCase().includes('filhos')) {
        features.push('ideal para família');
    }
    if (query.toLowerCase().includes('investimento') || query.toLowerCase().includes('investir')) {
        features.push('para investimento');
    }
    
    if (features.length > 0) {
        interpretation += ', ' + features.join(', ');
    }
    
    return interpretation || "Imóvel conforme suas preferências";
}

// ========================================
// DISPLAY AI RESULTS
// ========================================
function displayAIResults(query, results) {
    const resultsSection = document.getElementById('ai-results');
    const understandingText = document.getElementById('ai-understanding-text');
    const criteriaTags = document.getElementById('ai-criteria-tags');
    const resultsGrid = document.getElementById('ai-results-grid');
    
    if (!resultsSection) return;
    
    // Update understanding section
    understandingText.textContent = results.interpretation;
    
    // Generate criteria tags
    criteriaTags.innerHTML = results.criteria
        .slice(0, 6)
        .map(c => `<span class="ai-tag">${c}</span>`)
        .join('');
    
    // Generate property cards
    if (results.properties.length === 0) {
        resultsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--color-text-muted); margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px;">Nenhum imóvel encontrado</h3>
                <p style="color: var(--color-text-secondary);">Tente refinar sua busca ou descreva de outra forma.</p>
            </div>
        `;
    } else {
        resultsGrid.innerHTML = results.properties.map(property => createAIPropertyCard(property)).join('');
    }
    
    // Show section with animation
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Animate cards
    setTimeout(() => {
        document.querySelectorAll('#ai-results-grid .property-card').forEach((card, i) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }, 300);
}

// ========================================
// CREATE AI PROPERTY CARD
// ========================================
function createAIPropertyCard(property) {
    const scoreColor = property.matchScore >= 80 ? 'high' : '';
    const priceFormatted = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 0 
    }).format(property.price);
    
    return `
        <article class="property-card property-card-ai" style="opacity: 0; transform: translateY(20px); transition: all 0.4s ease;">
            <div class="property-image">
                <img src="${property.image}" alt="${property.title}">
                <div class="ai-match-score ${scoreColor}">
                    <i class="fas fa-chart-line"></i>
                    <span>${property.matchScore}% match</span>
                </div>
                <button class="property-favorite" aria-label="Favoritar">
                    <i class="far fa-heart"></i>
                </button>
                <div class="property-price">${priceFormatted}</div>
            </div>
            <div class="property-content">
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${property.location}, ${property.city}</span>
                </div>
                <h3 class="property-title">${property.title}</h3>
                <p class="ai-insight">
                    <i class="fas fa-robot"></i>
                    ${property.aiInsight}
                </p>
                <div class="property-features">
                    <div class="feature">
                        <i class="fas fa-bed"></i>
                        <span>${property.bedrooms} Quarto${property.bedrooms > 1 ? 's' : ''}</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-bath"></i>
                        <span>${property.bathrooms} Banheiro${property.bathrooms > 1 ? 's' : ''}</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-car"></i>
                        <span>${property.parking} Vaga${property.parking > 1 ? 's' : ''}</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-ruler-combined"></i>
                        <span>${property.area} m²</span>
                    </div>
                </div>
                <div class="property-footer">
                    <a href="imovel-detalhe.html" class="btn btn-outline">Ver Detalhes</a>
                    <a href="https://wa.me/5511999999999?text=Olá! Tenho interesse no imóvel: ${encodeURIComponent(property.title)}" class="btn-whatsapp">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// ========================================
// AI CHAT INITIALIZATION
// ========================================
function initAIChat() {
    const startChatBtn = document.getElementById('start-ai-chat');
    const chatModal = document.getElementById('ai-chat-modal');
    const closeChatBtn = document.getElementById('close-ai-chat');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');
    
    if (!startChatBtn || !chatModal) return;
    
    // Chat state
    let chatState = {
        step: 0,
        answers: {}
    };
    
    // Open chat
    startChatBtn.addEventListener('click', () => {
        chatModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        chatState = { step: 0, answers: {} };
        startChat();
    });
    
    // Close chat
    closeChatBtn.addEventListener('click', closeChat);
    chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) closeChat();
    });
    
    function closeChat() {
        chatModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Send message
    sendChatBtn.addEventListener('click', () => sendUserMessage(chatState));
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserMessage(chatState);
    });
}

// ========================================
// CHAT FLOW
// ========================================
const chatFlow = [
    {
        message: "Olá! 👋 Sou a Luna, sua assistente imobiliária com IA. Vou te ajudar a encontrar o imóvel perfeito em poucos minutos!",
        delay: 500
    },
    {
        message: "Para começar, me conta: você está procurando um imóvel para morar ou para investir?",
        options: ["🏠 Para morar", "💰 Para investir", "🤔 Ainda não sei"],
        field: "purpose"
    },
    {
        message: "Entendi! E qual tipo de imóvel você prefere?",
        options: ["🏢 Apartamento", "🏡 Casa", "🏙️ Studio/Loft", "✨ Cobertura"],
        field: "type"
    },
    {
        message: "Quantas pessoas vão morar no imóvel?",
        options: ["👤 Só eu", "👫 Eu e mais 1 pessoa", "👨‍👩‍👧 Família pequena (3-4)", "👨‍👩‍👧‍👦 Família grande (5+)"],
        field: "people"
    },
    {
        message: "Qual faixa de preço você tem em mente?",
        options: ["Até R$ 400 mil", "R$ 400 - 700 mil", "R$ 700 mil - 1.2 milhão", "Acima de 1.2 milhão"],
        field: "budget"
    },
    {
        message: "Tem alguma região ou bairro de preferência em São Paulo?",
        options: ["Zona Sul", "Zona Oeste", "Centro", "Qualquer região"],
        field: "region",
        allowText: true
    },
    {
        message: "Última pergunta! Tem algo que é essencial para você?",
        options: ["🐕 Aceitar pet", "🚇 Perto do metrô", "🏊 Ter piscina", "🏋️ Academia", "Nenhum específico"],
        field: "essential",
        multi: true
    }
];

// ========================================
// START CHAT
// ========================================
function startChat() {
    const messagesContainer = document.getElementById('chat-messages');
    const optionsContainer = document.getElementById('ai-options');
    
    messagesContainer.innerHTML = '';
    optionsContainer.innerHTML = '';
    
    // Show first messages with delay
    let delay = 0;
    chatFlow.slice(0, 2).forEach((item, index) => {
        setTimeout(() => {
            addAIMessage(item.message);
            if (item.options && index === 1) {
                setTimeout(() => showOptions(item.options, item.field), 500);
            }
        }, delay);
        delay += item.delay || 1000;
    });
}

// ========================================
// ADD AI MESSAGE
// ========================================
function addAIMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    
    // Show typing indicator first
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
    
    // Replace with actual message
    setTimeout(() => {
        typingDiv.querySelector('.ai-message-content').innerHTML = text;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 800);
}

// ========================================
// ADD USER MESSAGE
// ========================================
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

// ========================================
// SHOW OPTIONS
// ========================================
function showOptions(options, field) {
    const optionsContainer = document.getElementById('ai-options');
    
    optionsContainer.innerHTML = options.map(opt => 
        `<button class="ai-option-btn" data-field="${field}" data-value="${opt}">${opt}</button>`
    ).join('');
    
    // Add click handlers
    optionsContainer.querySelectorAll('.ai-option-btn').forEach(btn => {
        btn.addEventListener('click', () => handleOptionClick(btn.dataset.field, btn.dataset.value));
    });
}

// ========================================
// HANDLE OPTION CLICK
// ========================================
let currentStep = 2; // Start after intro messages

function handleOptionClick(field, value) {
    // Add user message
    addUserMessage(value);
    
    // Clear options
    document.getElementById('ai-options').innerHTML = '';
    
    // Save answer
    window.chatAnswers = window.chatAnswers || {};
    window.chatAnswers[field] = value;
    
    // Move to next step
    currentStep++;
    
    if (currentStep < chatFlow.length) {
        setTimeout(() => {
            const nextItem = chatFlow[currentStep];
            addAIMessage(nextItem.message);
            if (nextItem.options) {
                setTimeout(() => showOptions(nextItem.options, nextItem.field), 800);
            }
        }, 500);
    } else {
        // Chat complete - generate results
        setTimeout(() => {
            generateChatResults();
        }, 500);
    }
}

// ========================================
// GENERATE CHAT RESULTS
// ========================================
function generateChatResults() {
    const answers = window.chatAnswers || {};
    
    addAIMessage("Perfeito! 🎯 Com base nas suas respostas, encontrei alguns imóveis que combinam muito com você!");
    
    setTimeout(() => {
        addAIMessage(`Vou mostrar os melhores resultados. Clique no botão abaixo para ver!`);
        
        // Show results button
        const optionsContainer = document.getElementById('ai-options');
        optionsContainer.innerHTML = `
            <button class="ai-option-btn" style="background: linear-gradient(135deg, #8b5cf6, #a855f7); color: white; border: none;" id="show-chat-results">
                <i class="fas fa-search"></i> Ver imóveis recomendados
            </button>
        `;
        
        document.getElementById('show-chat-results').addEventListener('click', () => {
            // Close modal and perform search
            document.getElementById('ai-chat-modal').classList.remove('active');
            document.body.style.overflow = '';
            
            // Build search query from answers
            let searchQuery = buildSearchQueryFromAnswers(answers);
            document.getElementById('ai-search-input').value = searchQuery;
            performAISearch(searchQuery);
        });
    }, 1500);
}

// ========================================
// BUILD SEARCH QUERY FROM ANSWERS
// ========================================
function buildSearchQueryFromAnswers(answers) {
    let query = [];
    
    if (answers.type) {
        if (answers.type.includes('Apartamento')) query.push('apartamento');
        if (answers.type.includes('Casa')) query.push('casa');
        if (answers.type.includes('Studio')) query.push('studio');
        if (answers.type.includes('Cobertura')) query.push('cobertura');
    }
    
    if (answers.people) {
        if (answers.people.includes('Só eu')) query.push('1 quarto');
        if (answers.people.includes('mais 1')) query.push('2 quartos');
        if (answers.people.includes('pequena')) query.push('3 quartos');
        if (answers.people.includes('grande')) query.push('4 quartos');
    }
    
    if (answers.budget) {
        if (answers.budget.includes('400 mil')) query.push('até 400 mil');
        if (answers.budget.includes('400 - 700')) query.push('até 700 mil');
        if (answers.budget.includes('700 mil - 1.2')) query.push('até 1.2 milhão');
    }
    
    if (answers.essential) {
        if (answers.essential.includes('pet')) query.push('pet friendly');
        if (answers.essential.includes('metrô')) query.push('perto do metrô');
        if (answers.essential.includes('piscina')) query.push('com piscina');
    }
    
    if (answers.purpose && answers.purpose.includes('investir')) {
        query.push('para investimento');
    }
    
    return query.join(', ');
}

// ========================================
// SEND USER MESSAGE (free text)
// ========================================
function sendUserMessage(chatState) {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    addUserMessage(text);
    input.value = '';
    
    // Simple response for free text
    setTimeout(() => {
        addAIMessage("Entendi! Vou considerar isso na minha busca. " + 
            (currentStep < chatFlow.length - 1 ? "Mas antes, preciso de mais algumas informações..." : ""));
    }, 500);
}

// ========================================
// AI FLOAT BUTTON
// ========================================
function initAIFloatButton() {
    const floatBtn = document.getElementById('ai-float-btn');
    const chatModal = document.getElementById('ai-chat-modal');
    
    if (!floatBtn || !chatModal) return;
    
    floatBtn.addEventListener('click', () => {
        chatModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentStep = 2;
        window.chatAnswers = {};
        startChat();
    });
}

// ========================================
// NOTIFICATION HELPER
// ========================================
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

