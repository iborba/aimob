// ========================================
// LUNA - Conversational AI Engine
// Natural conversation with memory and context
// ========================================

// ========================================
// CONVERSATION MEMORY
// ========================================
let conversationMemory = {
    messages: [], // All messages in order
    extractedData: {}, // Structured data extracted
    topicsCovered: new Set(), // Topics already discussed
    lastUserMessage: null,
    lastAIMessage: null,
    conversationFlow: [] // Track conversation flow
};

// ========================================
// ANALYZE CONVERSATION CONTEXT
// ========================================
function analyzeContext() {
    const context = {
        hasName: !!leadData.name,
        hasPropertyType: !!leadData.propertyType,
        hasBedrooms: !!leadData.bedrooms,
        hasLocation: !!leadData.location,
        hasBudget: !!(leadData.budget?.min || leadData.budget?.max || leadData.budget?.exact),
        hasPaymentMethod: !!leadData.purchaseCondition?.method,
        hasTimeline: !!leadData.timeline?.when,
        hasMotivation: !!leadData.motivation?.primary,
        hasCurrentSituation: !!leadData.currentSituation?.living,
        hasDecisionMakers: !!(leadData.decisionMakers?.alone || leadData.decisionMakers?.partner || leadData.decisionMakers?.family),
        
        // Check what was mentioned in last message
        lastMessageText: conversationMemory.lastUserMessage || '',
        topicsInLastMessage: extractTopicsFromText(conversationMemory.lastUserMessage || ''),
        
        // Check completeness for search (not for lead capture)
        isComplete: false
    };
    
    // Determine if we have enough info to show results
    // Need at least: property type OR budget OR location
    // AND at least: bedrooms OR motivation OR timeline
    context.isComplete = (context.hasPropertyType || context.hasBudget || context.hasLocation) &&
                         (context.hasBedrooms || context.hasMotivation || context.hasTimeline);
    
    return context;
}

// ========================================
// EXTRACT TOPICS FROM TEXT
// ========================================
function extractTopicsFromText(text) {
    if (!text) return new Set();
    
    const lowerText = text.toLowerCase();
    const topics = new Set();
    
    // Property types
    if (lowerText.match(/apartamento|apto|ap/i)) topics.add('property_type');
    if (lowerText.match(/casa|sobrado/i)) topics.add('property_type');
    if (lowerText.match(/studio|loft/i)) topics.add('property_type');
    if (lowerText.match(/cobertura/i)) topics.add('property_type');
    
    // Budget
    if (lowerText.match(/mil|milhão|reais|r\$/i)) topics.add('budget');
    
    // Location
    if (lowerText.match(/zona|bairro|região|localização|perto|próximo/i)) topics.add('location');
    
    // Bedrooms
    if (lowerText.match(/quarto|dormitório|espaço|família|casal|sozinho/i)) topics.add('bedrooms');
    
    // Timeline
    if (lowerText.match(/quando|prazo|urgente|logo|mês|ano/i)) topics.add('timeline');
    
    // Payment
    if (lowerText.match(/pagamento|vista|financiamento|banco/i)) topics.add('payment');
    
    // Motivation
    if (lowerText.match(/primeiro|upgrade|investir|mudança|casamento|filhos/i)) topics.add('motivation');
    
    // Current situation
    if (lowerText.match(/alugando|aluguel|tenho|moro|família/i)) topics.add('current_situation');
    
    return topics;
}

// ========================================
// FORMAT CURRENCY - Better formatting
// ========================================
function formatCurrency(value) {
    if (!value || value === 0) return '';
    
    // For values in thousands, show as "X mil" or "X milhões"
    if (value >= 1000000) {
        const millions = value / 1000000;
        if (millions % 1 === 0) {
            return `${millions.toFixed(0)} milhão${millions > 1 ? 'ões' : ''}`;
        } else {
            return `${millions.toFixed(1)} milhões`;
        }
    } else if (value >= 1000) {
        const thousands = value / 1000;
        if (thousands % 1 === 0) {
            return `${thousands.toFixed(0)} mil`;
        } else {
            return `${thousands.toFixed(1)} mil`;
        }
    }
    
    // For smaller values, use full format
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL', 
        maximumFractionDigits: 0 
    }).format(value);
}

// ========================================
// GENERATE CONTEXTUAL ACKNOWLEDGMENT
// Uses user's own words and shows we're listening
// ========================================
function generateAcknowledgment(userMessage, extractedData) {
    const lowerMsg = userMessage.toLowerCase();
    const words = userMessage.split(' ');
    let acknowledgment = "";
    const parts = [];
    
    // Extract key phrases from user's message to echo back
    const userPhrases = [];
    
    // Property type - use their words
    if (lowerMsg.includes('apartamento')) {
        userPhrases.push('apartamento');
        parts.push(`você busca um apartamento`);
    } else if (lowerMsg.includes('casa')) {
        userPhrases.push('casa');
        parts.push(`você busca uma casa`);
    } else if (lowerMsg.includes('studio') || lowerMsg.includes('loft')) {
        userPhrases.push('studio/loft');
        parts.push(`você busca um ${lowerMsg.includes('studio') ? 'studio' : 'loft'}`);
    } else if (extractedData.propertyType) {
        parts.push(`você busca um ${extractedData.propertyType}`);
    }
    
    // Bedrooms - use their words
    if (lowerMsg.includes('quarto')) {
        const quartoMatch = userMessage.match(/(\d+)\s*quarto/i) || userMessage.match(/um|dois|três|quatro|cinco/i);
        if (quartoMatch) {
            parts.push(`com ${quartoMatch[0]}`);
        } else if (extractedData.bedrooms) {
            parts.push(`com ${extractedData.bedrooms} quarto${extractedData.bedrooms > 1 ? 's' : ''}`);
        }
    } else if (extractedData.bedrooms) {
        parts.push(`com ${extractedData.bedrooms} quarto${extractedData.bedrooms > 1 ? 's' : ''}`);
    }
    
    // Family context - use their words
    if (lowerMsg.includes('família') || lowerMsg.includes('filhos') || lowerMsg.includes('casal')) {
        if (lowerMsg.includes('família')) {
            parts.push(`para sua família`);
        } else if (lowerMsg.includes('filhos')) {
            parts.push(`para você e seus filhos`);
        } else if (lowerMsg.includes('casal')) {
            parts.push(`para o casal`);
        }
    }
    
    // Budget - use their words, preserving "milhão" vs "mil"
    if (lowerMsg.includes('milhão') || lowerMsg.includes('milhões')) {
        // Se mencionou "milhão", usar as palavras do usuário ou formatar corretamente
        const budgetPhrase = userMessage.match(/(?:até|até\s*|uns?\s*)?(?:r\$\s*)?[\d.,]+\s*milh[oõ]es?/i)?.[0] || '';
        if (budgetPhrase) {
            parts.push(budgetPhrase.toLowerCase());
        } else if (extractedData.budget?.max) {
            parts.push(`até ${formatCurrency(extractedData.budget.max)}`);
        }
    } else if (lowerMsg.match(/até|até\s*uns|até\s*uns\s*\d+/)) {
        const budgetPhrase = userMessage.match(/até[^,\.]*/i)?.[0] || '';
        if (budgetPhrase && !budgetPhrase.toLowerCase().includes('milhão')) {
            parts.push(budgetPhrase.toLowerCase());
        } else if (extractedData.budget?.max) {
            parts.push(`até ${formatCurrency(extractedData.budget.max)}`);
        }
    } else if (extractedData.budget?.max) {
        parts.push(`até ${formatCurrency(extractedData.budget.max)}`);
    }
    
    // Location - use their words
    if (lowerMsg.includes('perto') || lowerMsg.includes('próximo') || lowerMsg.includes('região') || lowerMsg.includes('bairro')) {
        const locationPhrase = userMessage.match(/(?:perto|próximo|região|bairro)[^,\.]*/i)?.[0] || '';
        if (locationPhrase) {
            parts.push(locationPhrase.toLowerCase());
        } else if (extractedData.location) {
            parts.push(`na região de ${extractedData.location}`);
        }
    } else if (extractedData.location) {
        parts.push(`na região de ${extractedData.location}`);
    }
    
    // Motivation - use their words
    if (lowerMsg.includes('primeiro imóvel') || lowerMsg.includes('primeira vez')) {
        parts.push(`e é seu primeiro imóvel`);
    } else if (lowerMsg.includes('aluguel') || lowerMsg.includes('alugando')) {
        parts.push(`e você está alugando agora`);
    } else if (lowerMsg.includes('investir') || lowerMsg.includes('investimento')) {
        parts.push(`para investimento`);
    }
    
    // Build acknowledgment using their words - more friendly
    if (parts.length > 0) {
        acknowledgment = "Ah, entendi! Então você busca " + parts.join(', ') + ". ";
    } else {
        // If we can't extract much, use a more general but still acknowledging response
        if (userMessage.length > 30) {
            acknowledgment = "Entendi! Deixa eu ver se entendi direito o que você precisa... ";
        } else {
            acknowledgment = "Entendi! ";
        }
    }
    
    // Add a friendly transition
    if (!acknowledgment.endsWith('... ')) {
        acknowledgment += "Legal! ";
    }
    
    return acknowledgment.trim();
}

// ========================================
// DECIDE NEXT QUESTION - Intelligent & Contextual
// ========================================
function decideNextQuestion(context) {
    // Build question based on what's missing, avoiding repetition
    
    // Check what was just mentioned to avoid asking again
    const justMentioned = context.topicsInLastMessage;
    const allMessages = conversationMemory.messages.filter(m => m.role === 'user').map(m => m.text.toLowerCase()).join(' ');
    
    // Priority order: what's most critical and what makes sense in context
    
    // 1. LOCALIZAÇÃO - CIDADE (CRÍTICO! Perguntar antes de tudo)
    if (!context.hasLocation && !justMentioned.has('location') && !allMessages.match(/porto alegre|canoas|viamão|gravataí|cachoeirinha|são leopoldo|novo hamburgo|cidade/i)) {
        let question = "";
        if (context.hasPropertyType) {
            question = `Ah, legal! E em qual cidade você tá pensando em encontrar esse ${leadData.propertyType}? `;
        } else {
            question = "E me conta... em qual cidade você tá pensando? ";
        }
        question += "Tipo, Porto Alegre, Canoas, Viamão, Gravataí, ou alguma outra cidade da região metropolitana? Isso é super importante! 😊";
        
        return {
            id: 'location_priority',
            message: question,
            field: 'location',
            type: 'text',
            optional: false
        };
    }
    
    // 2. Budget - Ask gently when needed, more conversational
    if (!context.hasBudget && !justMentioned.has('budget') && !allMessages.match(/mil|milhão|reais|r\$/)) {
        // Build contextual question - more flexible and friendly
        let question = "";
        if (context.hasPropertyType) {
            question = `Ah, legal! E quando você pensa nesse ${leadData.propertyType}, você já tem uma ideia de quanto conseguiria investir? `;
        } else {
            question = "E me conta... você já pensou em quanto conseguiria investir nisso? ";
        }
        question += "Não precisa ser nada exato, só pra eu ter uma noção do que faz sentido te mostrar!";
        
        return {
            id: 'budget_gentle',
            message: question,
            field: 'budget.range',
            type: 'text',
            optional: true
        };
    }
    
    // Skip timeline, current situation, decision makers, and payment in first conversation
    // These will be asked in the results page sidebar for refinement
    // First conversation focuses ONLY on: type, bedrooms, budget, location
    
    // 6. Check if we have enough info to show results
    // For initial filter, we need at least: property type OR budget OR location
    // Timeline, payment, etc. will be asked in sidebar for refinement
    const hasEnoughInfo = (context.hasPropertyType || context.hasBudget || context.hasLocation || 
                          context.hasBedrooms || context.hasMotivation);
    
    if (hasEnoughInfo) {
        // Build personalized closing message - more friendly and less direct
        let closingMessage = "";
        
        // Add specific details we know
        const details = [];
        if (context.hasPropertyType) {
            details.push(`um ${leadData.propertyType}`);
        }
        if (context.hasBedrooms) {
            details.push(`${leadData.bedrooms} quarto${leadData.bedrooms > 1 ? 's' : ''}`);
        }
        if (context.hasBudget) {
            const budget = leadData.budget?.max || leadData.budget?.min;
            if (budget) {
                details.push(`até ${formatCurrency(budget)}`);
            }
        }
        if (context.hasLocation) {
            details.push(`na região de ${leadData.location}`);
        }
        
        if (details.length > 0) {
            closingMessage = `Perfeito! Entendi que você busca ${details.join(', ')}. `;
        } else {
            closingMessage = "Perfeito! ";
        }
        
        closingMessage += "Com o que você me contou, já consigo te mostrar algumas opções que podem fazer sentido pra você. Que tal darmos uma olhada? 😊";
        
        return {
            type: 'close',
            message: closingMessage,
            redirectToResults: true
        };
    }
    
    // Fallback: if we have some info but not enough for closing, ask for more context
    // But if we have enough basic info, offer to refine instead
    if (hasEnoughInfo) {
        // We have enough info but decideNextQuestion didn't close - offer refinement
        return {
            type: 'close',
            message: "Perfeito! Com o que você me contou, já consigo te mostrar algumas opções que podem fazer sentido pra você. Que tal darmos uma olhada? 😊\n\nSe quiser refinar a pesquisa depois, é só pedir pra mim! Estou sempre aqui pra ajudar! ✨",
            redirectToResults: true
        };
    }
    
    // Fallback: ask for more context
    return {
        id: 'more_context',
        message: "Me conta um pouco mais sobre o que você está procurando?",
        field: 'motivation.story',
        type: 'text',
        optional: true
    };
}

// ========================================
// CONVERSATION HANDLER
// ========================================
function handleConversation(userMessage) {
    // Save user message to memory
    conversationMemory.messages.push({
        role: 'user',
        text: userMessage,
        timestamp: new Date()
    });
    conversationMemory.lastUserMessage = userMessage;
    
    // Extract data from message
    const extracted = processNaturalLanguage(userMessage, 'motivation.story');
    if (Object.keys(extracted).length > 0) {
        mergeData(leadData, extracted);
        conversationMemory.extractedData = { ...conversationMemory.extractedData, ...extracted };
    }
    
    // Extract topics
    const topics = extractTopicsFromText(userMessage);
    topics.forEach(topic => conversationMemory.topicsCovered.add(topic));
    
    // Analyze current context
    const context = analyzeContext();
    
    // Generate acknowledgment
    const acknowledgment = generateAcknowledgment(userMessage, extracted);
    
    // Update results dynamically if we have enough info (with delay to avoid overload)
    setTimeout(() => {
        updateResultsDynamically(context);
    }, 500);
    
    // Decide next question
    const nextQuestion = decideNextQuestion(context);
    
    return {
        acknowledgment,
        nextQuestion,
        context
    };
}

// ========================================
// PROCESS AI RESPONSE
// ========================================
let lastProcessedMessage = null; // Prevent duplicate processing

function processAIResponse(response) {
    // Prevent duplicate processing
    const responseKey = response.acknowledgment + (response.nextQuestion?.message || '');
    if (lastProcessedMessage === responseKey) {
        console.log('Duplicate response detected, ignoring...');
        return;
    }
    lastProcessedMessage = responseKey;
    
    // Save AI acknowledgment to memory
    if (response.acknowledgment) {
        // Check if we already have this message
        const alreadyExists = conversationMemory.messages.some(m => 
            m.role === 'assistant' && m.text === response.acknowledgment
        );
        
        if (!alreadyExists) {
            conversationMemory.messages.push({
                role: 'assistant',
                text: response.acknowledgment,
                timestamp: new Date()
            });
            conversationMemory.lastAIMessage = response.acknowledgment;
            
            // Show acknowledgment
            if (typeof addAIMessage === 'function') {
                addAIMessage(response.acknowledgment);
            }
        }
    }
    
    // If there's a next question, show it after a natural pause
    if (response.nextQuestion) {
        if (response.nextQuestion.type === 'close') {
            setTimeout(() => {
                const closeMsg = response.nextQuestion.message;
                // Check if already shown
                const alreadyShown = conversationMemory.messages.some(m => 
                    m.role === 'assistant' && m.text === closeMsg
                );
                
                if (!alreadyShown) {
                    if (typeof addAIMessage === 'function') {
                        addAIMessage(closeMsg);
                    }
                    conversationMemory.messages.push({
                        role: 'assistant',
                        text: closeMsg,
                        timestamp: new Date()
                    });
                }
                
                // If should redirect to results, do it
                if (response.nextQuestion.redirectToResults) {
                    setTimeout(() => {
                        // Add message about refinement
                        const refinementMsg = "Se quiser refinar a pesquisa depois, é só pedir pra mim! Estou sempre aqui pra ajudar! ✨";
                        if (typeof addAIMessage === 'function') {
                            addAIMessage(refinementMsg);
                        }
                        
                        setTimeout(() => {
                            // Build search URL with filters
                            const filters = buildSearchFilters();
                            // Use relative path (works with both file:// and http://)
                            const searchUrl = `pages/imoveis.html?${new URLSearchParams(filters).toString()}`;
                            
                            // Show button to go to results
                            if (typeof showResultsButton === 'function') {
                                showResultsButton(searchUrl);
                            } else {
                                // Fallback: redirect directly
                                window.location.href = searchUrl;
                            }
                        }, 1500);
                    }, 2000);
                } else {
                    setTimeout(() => {
                        if (typeof finishChat === 'function') {
                            finishChat();
                        }
                    }, 2000);
                }
            }, 1500);
        } else {
            // Regular question - show after pause
            setTimeout(() => {
                const questionMsg = response.nextQuestion.message;
                // Check if already shown
                const alreadyShown = conversationMemory.messages.some(m => 
                    m.role === 'assistant' && m.text === questionMsg
                );
                
                if (!alreadyShown) {
                    if (typeof addAIMessage === 'function') {
                        addAIMessage(questionMsg);
                    }
                    conversationMemory.messages.push({
                        role: 'assistant',
                        text: questionMsg,
                        timestamp: new Date()
                    });
                    
                    // Show input field
                    if (typeof showTextInput === 'function') {
                        showTextInput(response.nextQuestion);
                    }
                }
            }, 1500);
        }
    }
}

// ========================================
// UPDATE RESULTS DYNAMICALLY DURING CONVERSATION
// ========================================
function updateResultsDynamically(context) {
    // Only update if we have at least some basic info
    const hasBasicInfo = context.hasPropertyType || context.hasBudget || context.hasLocation || context.hasBedrooms;
    
    if (!hasBasicInfo) return;
    
    // Build filters from current conversation data
    const filters = buildSearchFilters();
    
    // Check if we're on the index page (has ai-results section)
    const resultsSection = document.getElementById('ai-results');
    const resultsGrid = document.getElementById('ai-results-grid');
    
    if (!resultsSection || !resultsGrid) return;
    
    // Load database if not available
    if (typeof window.imoveisPOA === 'undefined') {
        console.log('Database not loaded yet, skipping dynamic update');
        return;
    }
    
    // Filter properties
    const imoveis = window.imoveisPOA || [];
    let filteredImoveis = imoveis.filter(imovel => {
        if (filters.tipo && imovel.tipo !== filters.tipo) return false;
        if (filters.quartos && imovel.quartos < filters.quartos) return false;
        if (filters.preco_max && imovel.preco > filters.preco_max) return false;
        if (filters.preco_min && imovel.preco < filters.preco_min) return false;
        if (filters.localizacao) {
            const locLower = filters.localizacao.toLowerCase();
            const cidadeLower = imovel.cidade.toLowerCase();
            const regiaoLower = imovel.regiao.toLowerCase();
            const bairroLower = imovel.bairro.toLowerCase();
            
            if (!cidadeLower.includes(locLower) && 
                !locLower.includes(cidadeLower) &&
                !regiaoLower.includes(locLower) && 
                !bairroLower.includes(locLower)) {
                return false;
            }
        }
        return true;
    });
    
    // Smart fallback: if no exact matches, show similar properties
    if (filteredImoveis.length === 0) {
        filteredImoveis = imoveis.filter(imovel => {
            let score = 0;
            if (filters.tipo && imovel.tipo === filters.tipo) score += 3;
            if (filters.quartos && imovel.quartos >= filters.quartos) score += 2;
            if (filters.preco_max && imovel.preco <= filters.preco_max) score += 2;
            if (filters.localizacao) {
                const locLower = filters.localizacao.toLowerCase();
                if (imovel.cidade.toLowerCase().includes(locLower)) score += 3;
            }
            return score >= 2;
        }).slice(0, 12);
    } else {
        // Limit to 12 most relevant
        filteredImoveis = filteredImoveis.slice(0, 12);
    }
    
    // Update understanding text
    const understandingText = document.getElementById('ai-understanding-text');
    const criteriaTags = document.getElementById('ai-criteria-tags');
    
    if (understandingText) {
        const criteria = [];
        if (context.hasPropertyType) criteria.push(leadData.propertyType);
        if (context.hasBedrooms) criteria.push(`${leadData.bedrooms} quarto${leadData.bedrooms > 1 ? 's' : ''}`);
        if (context.hasBudget) {
            const budget = leadData.budget?.max || leadData.budget?.min;
            if (budget) criteria.push(`até ${formatCurrency(budget)}`);
        }
        if (context.hasLocation) criteria.push(leadData.location);
        
        understandingText.textContent = criteria.length > 0 
            ? criteria.join(', ') 
            : 'Explorando opções...';
    }
    
    if (criteriaTags) {
        criteriaTags.innerHTML = '';
        if (context.hasPropertyType) {
            const tag = document.createElement('span');
            tag.className = 'ai-tag';
            tag.textContent = leadData.propertyType;
            criteriaTags.appendChild(tag);
        }
        if (context.hasBedrooms) {
            const tag = document.createElement('span');
            tag.className = 'ai-tag';
            tag.textContent = `${leadData.bedrooms} quarto${leadData.bedrooms > 1 ? 's' : ''}`;
            criteriaTags.appendChild(tag);
        }
        if (context.hasBudget) {
            const budget = leadData.budget?.max || leadData.budget?.min;
            if (budget) {
                const tag = document.createElement('span');
                tag.className = 'ai-tag';
                tag.textContent = formatCurrency(budget);
                criteriaTags.appendChild(tag);
            }
        }
        if (context.hasLocation) {
            const tag = document.createElement('span');
            tag.className = 'ai-tag';
            tag.textContent = leadData.location;
            criteriaTags.appendChild(tag);
        }
    }
    
    // Render properties
    resultsGrid.innerHTML = '';
    filteredImoveis.forEach(imovel => {
        const card = createPropertyCardForResults(imovel);
        resultsGrid.appendChild(card);
    });
    
    // Show results section with animation
    const wasHidden = resultsSection.style.display === 'none' || !resultsSection.style.display;
    resultsSection.style.display = 'block';
    
    // Smooth scroll to results only if section was hidden
    if (wasHidden) {
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}

// ========================================
// CREATE PROPERTY CARD FOR RESULTS SECTION
// ========================================
function createPropertyCardForResults(imovel) {
    const card = document.createElement('article');
    card.className = 'property-card property-card-ai';
    
    const tipoLabel = {
        'apartamento': 'Apartamento',
        'casa': 'Casa',
        'cobertura': 'Cobertura',
        'studio': 'Studio'
    }[imovel.tipo] || imovel.tipo;
    
    card.innerHTML = `
        <div class="property-image">
            <img src="${imovel.imagem}" alt="${imovel.titulo}" loading="lazy">
            <button class="property-favorite" aria-label="Favoritar">
                <i class="far fa-heart"></i>
            </button>
            <div class="property-price">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(imovel.preco)}</div>
        </div>
        <div class="property-content">
            <div class="property-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${imovel.bairro}, ${imovel.cidade} - RS</span>
            </div>
            <h3 class="property-title">${imovel.titulo}</h3>
            <p style="color: var(--color-text-muted); font-size: 0.9rem; margin: 8px 0;">${imovel.descricao}</p>
            <div class="property-features">
                <div class="feature">
                    <i class="fas fa-bed"></i>
                    <span>${imovel.quartos} Quarto${imovel.quartos > 1 ? 's' : ''}</span>
                </div>
                <div class="feature">
                    <i class="fas fa-bath"></i>
                    <span>${imovel.banheiros} Banheiro${imovel.banheiros > 1 ? 's' : ''}</span>
                </div>
                ${imovel.vagas > 0 ? `
                <div class="feature">
                    <i class="fas fa-car"></i>
                    <span>${imovel.vagas} Vaga${imovel.vagas > 1 ? 's' : ''}</span>
                </div>
                ` : ''}
                <div class="feature">
                    <i class="fas fa-ruler-combined"></i>
                    <span>${imovel.area} m²</span>
                </div>
            </div>
            ${imovel.features && imovel.features.length > 0 ? `
            <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px;">
                ${imovel.features.slice(0, 3).map(f => `<span style="font-size: 0.75rem; padding: 4px 8px; background: rgba(139, 92, 246, 0.1); border-radius: 12px; color: #8b5cf6;">${f}</span>`).join('')}
            </div>
            ` : ''}
            <div class="property-footer">
                <a href="pages/imovel-detalhe.html?id=${imovel.id}" class="btn btn-outline">Ver Detalhes</a>
                <a href="https://wa.me/5551999999999?text=Olá! Tenho interesse no imóvel: ${encodeURIComponent(imovel.titulo)}" class="btn-whatsapp" target="_blank">
                    <i class="fab fa-whatsapp"></i>
                </a>
            </div>
        </div>
    `;
    
    return card;
}

// ========================================
// BUILD SEARCH FILTERS FROM CONVERSATION
// ========================================
function buildSearchFilters() {
    const filters = {};
    
    if (leadData.propertyType) {
        filters.tipo = leadData.propertyType;
    }
    
    if (leadData.bedrooms) {
        filters.quartos = leadData.bedrooms;
    }
    
    if (leadData.budget?.max) {
        filters.preco_max = leadData.budget.max;
    }
    
    if (leadData.budget?.min) {
        filters.preco_min = leadData.budget.min;
    }
    
    if (leadData.location) {
        filters.localizacao = leadData.location;
    }
    
    if (leadData.mustHaveFeatures && leadData.mustHaveFeatures.length > 0) {
        filters.features = leadData.mustHaveFeatures.join(',');
    }
    
    return filters;
}

// ========================================
// SHOW RESULTS BUTTON
// ========================================
function showResultsButton(searchUrl) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'ai-message';
    buttonDiv.innerHTML = `
        <div class="ai-message-avatar"><i class="fas fa-robot"></i></div>
        <div class="ai-message-content">
            <a href="${searchUrl}" class="btn btn-primary" style="display: inline-block; margin-top: 12px; padding: 12px 24px; text-decoration: none;">
                <i class="fas fa-search"></i> Ver Imóveis Encontrados
            </a>
        </div>
    `;
    messagesContainer.appendChild(buttonDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Export for use
if (typeof window !== 'undefined') {
    window.conversationEngine = {
        handleConversation,
        analyzeContext,
        conversationMemory,
        processAIResponse,
        buildSearchFilters,
        showResultsButton,
        updateResultsDynamically,
        _lastProcessedMessage: null
    };
    
    // Make functions globally available
    window.processAIResponse = processAIResponse;
    window.buildSearchFilters = buildSearchFilters;
    window.showResultsButton = showResultsButton;
    window.updateResultsDynamically = updateResultsDynamically;
    
    // Update lastProcessedMessage reference
    Object.defineProperty(window.conversationEngine, '_lastProcessedMessage', {
        get: () => lastProcessedMessage,
        set: (val) => { lastProcessedMessage = val; }
    });
}


