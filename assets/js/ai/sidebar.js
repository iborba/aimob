// ========================================
// LUNA SIDEBAR - Refinamento de Busca
// Mantém contexto da conversa inicial e salva todas as informações no leadData
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initLunaSidebar();
});

// ========================================
// GET OR CREATE LEAD DATA (mantém contexto)
// ========================================
function getOrCreateLeadData() {
    // Tenta acessar o leadData global da conversa inicial
    if (typeof window.leadData !== 'undefined' && window.leadData) {
        return window.leadData;
    }
    
    // Se não existe, tenta recuperar do localStorage (último lead salvo)
    const existingLeads = JSON.parse(localStorage.getItem('larprime_leads') || '[]');
    if (existingLeads.length > 0) {
        // Retorna o último lead como base (para manter contexto)
        const lastLead = existingLeads[existingLeads.length - 1];
        // Cria um novo objeto baseado no último, mas sem sobrescrever
        return {
            ...lastLead,
            // Não sobrescrever dados já coletados
        };
    }
    
    // Se não há leadData, cria um novo baseado nos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    return {
        propertyType: urlParams.get('tipo') || null,
        bedrooms: urlParams.get('quartos') ? parseInt(urlParams.get('quartos')) : null,
        budget: {
            max: urlParams.get('preco_max') ? parseInt(urlParams.get('preco_max')) : null,
            min: urlParams.get('preco_min') ? parseInt(urlParams.get('preco_min')) : null
        },
        location: urlParams.get('localizacao') || null,
        mustHaveFeatures: [],
        timeline: { when: null, urgency: null },
        purchaseCondition: { method: null },
        currentSituation: { living: null },
        qualityScore: 0,
        timestamp: new Date().toISOString()
    };
}

// ========================================
// UPDATE LEAD DATA AND SAVE
// ========================================
function updateLeadDataAndSave(updates) {
    // Acessa ou cria leadData
    let leadData = getOrCreateLeadData();
    
    // Faz merge dos updates (mantém dados existentes)
    function deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                deepMerge(target[key], source[key]);
            } else if (source[key] !== null && source[key] !== undefined) {
                target[key] = source[key];
            }
        }
        return target;
    }
    
    leadData = deepMerge(leadData, updates);
    
    // Atualiza timestamp
    leadData.timestamp = new Date().toISOString();
    
    // Recalcula score
    if (typeof window.calculateLeadScore === 'function') {
        leadData.qualityScore = window.calculateLeadScore(leadData);
    } else {
        // Fallback: cálculo básico de score
        let score = 0;
        if (leadData.phone) score += 15;
        if (leadData.email) score += 10;
        if (leadData.name) score += 5;
        if (leadData.propertyType) score += 5;
        if (leadData.bedrooms) score += 5;
        if (leadData.location) score += 10;
        if (leadData.mustHaveFeatures && leadData.mustHaveFeatures.length > 0) score += 5;
        if (leadData.budget?.exact) score += 20;
        else if (leadData.budget?.max) score += 15;
        else if (leadData.budget?.min) score += 10;
        if (leadData.timeline?.when) {
            score += 5;
            if (leadData.timeline.urgency === 'high') score += 5;
        }
        if (leadData.motivation?.primary) score += 10;
        if (leadData.purchaseCondition?.method) score += 10;
        if (leadData.currentSituation?.living) score += 5;
        leadData.qualityScore = Math.min(score, 100);
    }
    
    // Salva no localStorage
    const existingLeads = JSON.parse(localStorage.getItem('larprime_leads') || '[]');
    
    // Procura se já existe um lead com o mesmo ID ou dados similares
    const leadId = leadData.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    leadData.id = leadId;
    
    const existingIndex = existingLeads.findIndex(l => l.id === leadId);
    
    if (existingIndex >= 0) {
        // Atualiza lead existente
        existingLeads[existingIndex] = { ...existingLeads[existingIndex], ...leadData };
    } else {
        // Adiciona novo lead
        existingLeads.push(leadData);
    }
    
    localStorage.setItem('larprime_leads', JSON.stringify(existingLeads));
    
    // Atualiza leadData global se existir
    if (typeof window.leadData !== 'undefined') {
        window.leadData = leadData;
    }
    
    // Dispara evento para atualizar dashboard
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'larprime_leads',
        newValue: JSON.stringify(existingLeads)
    }));
    
    return leadData;
}

function initLunaSidebar() {
    // Create sidebar HTML
    const sidebar = document.createElement('div');
    sidebar.id = 'luna-sidebar';
    sidebar.className = 'luna-sidebar';
    sidebar.innerHTML = `
        <div class="luna-sidebar-header">
            <div class="luna-avatar-small">
                <i class="fas fa-robot"></i>
            </div>
            <div>
                <h3>Luna</h3>
                <span>Vamos refinar sua busca?</span>
            </div>
            <button class="luna-sidebar-close" id="close-luna-sidebar">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="luna-sidebar-messages" id="luna-sidebar-messages">
            <!-- Messages will be inserted here -->
        </div>
        <div class="luna-sidebar-input-area">
            <div id="luna-sidebar-options" class="luna-sidebar-options"></div>
            <div class="luna-sidebar-input-wrapper">
                <input type="text" id="luna-sidebar-input" placeholder="Digite sua resposta..." class="luna-sidebar-input">
                <button id="luna-sidebar-send" class="luna-sidebar-send">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(sidebar);
    
    // Initialize sidebar state
    let sidebarState = {
        questionsAsked: new Set(),
        currentQuestion: null
    };
    
    // Load saved preferences from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const savedData = {
        propertyType: urlParams.get('tipo') || '',
        bedrooms: urlParams.get('quartos') ? parseInt(urlParams.get('quartos')) : null,
        budgetMax: urlParams.get('preco_max') ? parseInt(urlParams.get('preco_max')) : null,
        location: urlParams.get('localizacao') || ''
    };
    
    // Start conversation - mais amigável
    setTimeout(() => {
        addLunaSidebarMessage("Oi! Vi que você está procurando imóveis. Que tal eu te ajudar a refinar sua busca? 😊");
        setTimeout(() => {
            // PRIORIDADE 1: LOCALIZAÇÃO (CRÍTICO - nunca foi perguntado!)
            if (!savedData.location) {
                askRefinementQuestion('location', sidebarState, savedData);
            } else {
                // Se já tem localização, perguntar sobre características do imóvel
                askRefinementQuestion('property_features', sidebarState, savedData);
            }
        }, 1500);
    }, 500);
    
    // Close button
    document.getElementById('close-luna-sidebar').addEventListener('click', () => {
        sidebar.classList.remove('active');
        document.body.classList.remove('luna-sidebar-active');
    });
    
    // Show sidebar and add body class
    function showSidebar() {
        sidebar.classList.add('active');
        document.body.classList.add('luna-sidebar-active');
    }
    
    // Show by default
    setTimeout(showSidebar, 500);
    
    // Send message
    document.getElementById('luna-sidebar-send').addEventListener('click', () => {
        handleSidebarInput(sidebarState, savedData);
    });
    
    document.getElementById('luna-sidebar-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSidebarInput(sidebarState, savedData);
        }
    });
}

function askRefinementQuestion(type, state, savedData) {
    if (state.questionsAsked.has(type)) return;
    
    state.questionsAsked.add(type);
    
    let question = null;
    
    switch(type) {
        // PRIORIDADE 1: LOCALIZAÇÃO - CIDADE (CRÍTICO!)
        case 'location':
            question = {
                message: "Me conta... em qual cidade você tá pensando? Tipo, Porto Alegre, Canoas, Viamão, Gravataí, ou alguma outra cidade da região metropolitana? Isso é super importante pra eu te mostrar as melhores opções! 😊",
                field: 'location',
                type: 'text'
            };
            break;
        // PRIORIDADE 2: Características do imóvel
        case 'property_features':
            question = {
                message: "E tem alguma coisa que é ESSENCIAL pra você no imóvel? Tipo, aceitar pets, piscina, academia, perto de transporte, segurança...",
                field: 'features',
                type: 'text'
            };
            break;
        case 'bedrooms_refine':
            if (!savedData.bedrooms) {
                question = {
                    message: "E quantos quartos você precisa? Isso ajuda a filtrar melhor as opções!",
                    field: 'bedrooms',
                    type: 'text'
                };
            }
            break;
        // PRIORIDADE 3: Informações do cliente (depois de saber sobre o imóvel)
        case 'timeline':
            question = {
                message: "E me diz... você tem alguma pressa nisso? Tipo, tem algum prazo ou você tá mais explorando as opções?",
                field: 'timeline',
                type: 'text'
            };
            break;
        case 'payment':
            question = {
                message: "Me conta... você já pensou como faria o pagamento? Tipo, à vista ou financiamento? Isso me ajuda a entender melhor o que você precisa!",
                field: 'payment',
                type: 'text'
            };
            break;
        case 'current_situation':
            question = {
                message: "E me conta... hoje você tá alugando, já tem um lugar seu, ou tá morando com a família? Só pra eu entender melhor sua situação!",
                field: 'current_situation',
                type: 'text'
            };
            break;
    }
    
    if (question) {
        state.currentQuestion = question;
        addLunaSidebarMessage(question.message);
        showSidebarTextInput(question);
    }
}

function handleSidebarInput(state, savedData) {
    const input = document.getElementById('luna-sidebar-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    addSidebarUserMessage(text);
    
    // Process answer
    const question = state.currentQuestion;
    if (question) {
        // Save answer (could update filters)
        const filtersChanged = processSidebarAnswer(question.field, text, savedData);
        
        // Ask next question in sequence - PRIORIDADE: IMÓVEL primeiro, CLIENTE depois
        setTimeout(() => {
            // 1. LOCALIZAÇÃO (se não foi perguntado ainda)
            if (!state.questionsAsked.has('location') && !savedData.location) {
                askRefinementQuestion('location', state, savedData);
            }
            // 2. Características do imóvel
            else if (!state.questionsAsked.has('property_features')) {
                askRefinementQuestion('property_features', state, savedData);
            }
            // 3. Quartos (se não foi informado na conversa inicial)
            else if (!state.questionsAsked.has('bedrooms_refine') && !savedData.bedrooms) {
                askRefinementQuestion('bedrooms_refine', state, savedData);
            }
            // 4. Informações do cliente (depois de saber sobre o imóvel)
            else if (!state.questionsAsked.has('timeline')) {
                askRefinementQuestion('timeline', state, savedData);
            } else if (!state.questionsAsked.has('payment')) {
                askRefinementQuestion('payment', state, savedData);
            } else if (!state.questionsAsked.has('current_situation')) {
                askRefinementQuestion('current_situation', state, savedData);
            } else if (!state.questionsAsked.has('contact')) {
                // Por último, pedir contato (telefone ou email)
                askRefinementQuestion('contact', state, savedData);
            } else {
                addLunaSidebarMessage("Perfeito! Com essas informações, consigo te ajudar ainda melhor. Os resultados já estão filtrados pra você! 😊");
                addLunaSidebarMessage("Se quiser refinar mais alguma coisa, é só me falar! Estou sempre aqui pra ajudar! ✨");
            }
        }, 1000);
    }
    
    input.value = '';
}

function processSidebarAnswer(field, value, savedData) {
    const lowerValue = value.toLowerCase();
    const filters = {
        tipo: savedData.propertyType || '',
        quartos: savedData.bedrooms || null,
        preco_max: savedData.budgetMax || null,
        localizacao: savedData.location || ''
    };
    
    let filtersChanged = false;
    const leadUpdates = {}; // Dados para salvar no leadData
    
    // Process answer and update filters + leadData
    if (field === 'location') {
        // Extract location - PRIORIDADE: CIDADE primeiro
        let location = '';
        
        // Cidades da região metropolitana (PRIORIDADE)
        if (lowerValue.includes('porto alegre') || lowerValue.includes('poa')) {
            location = 'Porto Alegre';
        } else if (lowerValue.includes('canoas')) {
            location = 'Canoas';
        } else if (lowerValue.includes('viamão')) {
            location = 'Viamão';
        } else if (lowerValue.includes('gravataí') || lowerValue.includes('gravatai')) {
            location = 'Gravataí';
        } else if (lowerValue.includes('cachoeirinha')) {
            location = 'Cachoeirinha';
        } else if (lowerValue.includes('são leopoldo') || lowerValue.includes('sao leopoldo')) {
            location = 'São Leopoldo';
        } else if (lowerValue.includes('novo hamburgo')) {
            location = 'Novo Hamburgo';
        } else if (lowerValue.includes('alvorada')) {
            location = 'Alvorada';
        } else if (lowerValue.includes('sapucaia') || lowerValue.includes('sapucaia do sul')) {
            location = 'Sapucaia do Sul';
        } else {
            // Tentar extrair qualquer nome de cidade mencionado
            // Procurar por padrões como "em [cidade]", "na [cidade]"
            const cityMatch = lowerValue.match(/(?:em|na|no|de|da)\s+([a-záàâãéêíóôõúç\s]+?)(?:,|\.|$|região|metropolitana|rs)/i);
            if (cityMatch && cityMatch[1]) {
                const potentialCity = cityMatch[1].trim();
                if (potentialCity.length > 2 && potentialCity.length < 30) {
                    location = potentialCity;
                }
            } else {
                // Fallback: usar o valor original (pode ser cidade ou região)
                location = value;
            }
        }
        
        if (location) {
            filters.localizacao = location;
            savedData.location = location;
            leadUpdates.location = location;
            filtersChanged = true;
        } else {
            // Se não conseguiu extrair, usar o valor original como fallback
            filters.localizacao = value;
            savedData.location = value;
            leadUpdates.location = value;
            filtersChanged = true;
        }
    } else if (field === 'bedrooms') {
        // Extract bedrooms
        const bedroomMatch = value.match(/(\d+)/);
        if (bedroomMatch) {
            const bedrooms = parseInt(bedroomMatch[1]);
            filters.quartos = bedrooms;
            savedData.bedrooms = bedrooms;
            leadUpdates.bedrooms = bedrooms;
            filtersChanged = true;
        }
    } else if (field === 'features') {
        // Extract features and add to filters
        const features = [];
        if (lowerValue.includes('pet') || lowerValue.includes('animal') || lowerValue.includes('cachorro') || lowerValue.includes('gato')) {
            features.push('pet friendly');
        }
        if (lowerValue.includes('piscina')) {
            features.push('piscina');
        }
        if (lowerValue.includes('academia') || lowerValue.includes('ginásio')) {
            features.push('academia');
        }
        if (lowerValue.includes('transporte') || lowerValue.includes('metrô') || lowerValue.includes('ônibus')) {
            features.push('transporte');
        }
        if (lowerValue.includes('segurança') || lowerValue.includes('portaria')) {
            features.push('segurança');
        }
        if (lowerValue.includes('churrasqueira')) {
            features.push('churrasqueira');
        }
        if (lowerValue.includes('elevador')) {
            features.push('elevador');
        }
        
        if (features.length > 0) {
            filters.features = features.join(',');
            // Adiciona features ao leadData (merge com existentes)
            const currentLead = getOrCreateLeadData();
            const existingFeatures = currentLead.mustHaveFeatures || [];
            leadUpdates.mustHaveFeatures = [...new Set([...existingFeatures, ...features])];
            filtersChanged = true;
        }
    } else if (field === 'timeline') {
        // Extract timeline information
        let timelineWhen = null;
        let urgency = 'medium';
        
        if (lowerValue.includes('urgente') || lowerValue.includes('logo') || lowerValue.includes('já') || lowerValue.includes('imediato') || lowerValue.includes('rápido')) {
            timelineWhen = 'immediate';
            urgency = 'high';
        } else if (lowerValue.includes('próximo mês') || lowerValue.includes('mês que vem') || lowerValue.includes('breve')) {
            timelineWhen = '1-3months';
            urgency = 'high';
        } else if (lowerValue.match(/\d+\s*(?:a|-)\s*\d+\s*(?:mês|meses)/)) {
            timelineWhen = '3-6months';
            urgency = 'medium';
        } else if (lowerValue.match(/\d+\s*(?:a|-)\s*\d+\s*(?:mês|meses)/) && lowerValue.includes('6')) {
            timelineWhen = '6-12months';
            urgency = 'medium';
        } else if (lowerValue.includes('explorando') || lowerValue.includes('sem pressa') || lowerValue.includes('quando der')) {
            timelineWhen = 'exploring';
            urgency = 'low';
        } else if (lowerValue.match(/\d+\s*(mês|meses|ano)/)) {
            const timeMatch = value.match(/(\d+)\s*(mês|meses|ano)/i);
            if (timeMatch) {
                const num = parseInt(timeMatch[1]);
                if (num <= 3) timelineWhen = '1-3months';
                else if (num <= 6) timelineWhen = '3-6months';
                else timelineWhen = '6-12months';
            }
        }
        
        if (timelineWhen) {
            leadUpdates.timeline = {
                when: timelineWhen,
                urgency: urgency,
                reason: value // Salva a resposta original para contexto
            };
        }
    } else if (field === 'payment') {
        // Extract payment method
        let paymentMethod = null;
        
        if (lowerValue.includes('financiamento') || lowerValue.includes('financiar')) {
            paymentMethod = 'financing';
        } else if (lowerValue.includes('vista') || lowerValue.includes('dinheiro') || lowerValue.includes('pronto') || lowerValue.includes('à vista')) {
            paymentMethod = 'cash';
        } else if (lowerValue.includes('ambos') || lowerValue.includes('qualquer') || lowerValue.includes('depende')) {
            paymentMethod = 'both';
        }
        
        if (paymentMethod) {
            leadUpdates.purchaseCondition = {
                method: paymentMethod
            };
        }
    } else if (field === 'current_situation') {
        // Extract current living situation
        let living = null;
        
        if (lowerValue.includes('alugando') || lowerValue.includes('aluguel') || lowerValue.includes('alugo')) {
            living = 'renting';
        } else if (lowerValue.includes('tenho') || lowerValue.includes('próprio') || lowerValue.includes('já tenho') || lowerValue.includes('minha casa')) {
            living = 'owning';
        } else if (lowerValue.includes('família') || lowerValue.includes('pais') || lowerValue.includes('morando com')) {
            living = 'with_family';
        } else if (lowerValue.includes('outro') || lowerValue.includes('diferente')) {
            living = 'other';
        }
        
        if (living) {
            leadUpdates.currentSituation = {
                living: living,
                whyMoving: value // Salva contexto adicional
            };
        }
    } else if (field === 'contact') {
        // Extract phone or email
        const phoneMatch = value.match(/(?:\(?(\d{2})\)?\s*)?(\d{4,5}[-.\s]?\d{4,5})/);
        const emailMatch = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        
        if (phoneMatch) {
            let phone = phoneMatch[0].replace(/[^\d]/g, '');
            if (phone.length >= 10 && phone.length <= 11) {
                leadUpdates.phone = phone;
            }
        }
        
        if (emailMatch) {
            leadUpdates.email = emailMatch[0];
        }
        
        // Se não encontrou nem telefone nem email, salva o texto original para contexto
        if (!phoneMatch && !emailMatch) {
            // Pode ser que o usuário tenha escrito de forma diferente
            // Salva como texto livre para análise posterior
            leadUpdates.contactText = value;
        }
    }
    
    // Salva filtros como metadata sempre que houver mudanças
    if (filtersChanged) {
        const currentLead = getOrCreateLeadData();
        const currentFilters = {
            tipo: filters.tipo || currentLead.searchFilters?.tipo || null,
            quartos: filters.quartos || currentLead.searchFilters?.quartos || null,
            preco_max: filters.preco_max || currentLead.searchFilters?.preco_max || null,
            preco_min: filters.preco_min || currentLead.searchFilters?.preco_min || null,
            localizacao: filters.localizacao || currentLead.searchFilters?.localizacao || null,
            features: filters.features || currentLead.searchFilters?.features || null
        };
        leadUpdates.searchFilters = currentFilters;
        leadUpdates.filterHistory = leadUpdates.filterHistory || currentLead.filterHistory || [];
        leadUpdates.filterHistory.push({
            timestamp: new Date().toISOString(),
            filters: { ...currentFilters }
        });
    }
    
    // Salva informações no leadData (mantém contexto)
    if (Object.keys(leadUpdates).length > 0) {
        updateLeadDataAndSave(leadUpdates);
    }
    
    // Acknowledge answer using user's words
    let acknowledgment = "";
    if (field === 'location') {
        acknowledgment = `Perfeito! Vou focar em ${filters.localizacao || value}. Os resultados já estão sendo atualizados! ✨`;
    } else if (field === 'bedrooms') {
        acknowledgment = `Entendi! ${filters.quartos} quarto${filters.quartos > 1 ? 's' : ''}. Vou filtrar as opções!`;
    } else if (field === 'timeline') {
        if (lowerValue.includes('urgente') || lowerValue.includes('logo') || lowerValue.includes('já') || lowerValue.includes('rápido') || lowerValue.includes('imediato')) {
            acknowledgment = "Entendi, então você precisa de algo rápido. Vou priorizar opções que possam ser fechadas rapidamente!";
        } else if (lowerValue.includes('explorando') || lowerValue.includes('sem pressa') || lowerValue.includes('quando der')) {
            acknowledgment = "Sem pressa então! Vamos explorar as melhores opções com calma. 😊";
        } else if (lowerValue.match(/\d+\s*(mês|meses|ano)/)) {
            const timeMatch = value.match(/(\d+)\s*(mês|meses|ano)/i);
            acknowledgment = `Entendi, então você tem ${timeMatch ? timeMatch[0] : 'esse prazo'} em mente. Vou considerar isso!`;
        } else {
            acknowledgment = "Entendi! Vou considerar isso na busca. ";
        }
    } else if (field === 'payment') {
        if (lowerValue.includes('financiamento')) {
            acknowledgment = "Financiamento, entendi! Vou focar em opções que aceitam financiamento.";
        } else if (lowerValue.includes('vista') || lowerValue.includes('dinheiro') || lowerValue.includes('pronto')) {
            acknowledgment = "À vista, perfeito! Isso abre mais opções pra você.";
        } else {
            acknowledgment = "Entendi sobre o pagamento! ";
        }
    } else if (field === 'features') {
        acknowledgment = "Perfeito! Vou filtrar os imóveis com essas características. Os resultados já estão sendo atualizados! ✨";
    } else if (field === 'decision_makers') {
        if (lowerValue.includes('sozinho') || lowerValue.includes('só eu')) {
            acknowledgment = "Entendi, a decisão é só sua. Isso facilita o processo!";
        } else if (lowerValue.includes('parceiro') || lowerValue.includes('esposa') || lowerValue.includes('marido') || lowerValue.includes('nós')) {
            acknowledgment = "Entendi, você e seu parceiro estão decidindo juntos. Que legal! 💑";
        } else if (lowerValue.includes('família')) {
            acknowledgment = "Entendi, toda a família está envolvida. Vou considerar isso! 👨‍👩‍👧‍👦";
        } else {
            acknowledgment = "Entendi sobre quem está envolvido na decisão! ";
        }
    } else if (field === 'current_situation') {
        if (lowerValue.includes('alugando') || lowerValue.includes('aluguel')) {
            acknowledgment = "Entendi, você está alugando agora. Vou focar em opções que fazem sentido pra essa transição!";
        } else if (lowerValue.includes('tenho') || lowerValue.includes('próprio')) {
            acknowledgment = "Entendi, você já tem um imóvel. Então você está pensando em trocar ou comprar outro!";
        } else if (lowerValue.includes('família') || lowerValue.includes('pais')) {
            acknowledgment = "Entendi, você está morando com a família. É hora de ter seu próprio espaço! 🏠";
        } else {
            acknowledgment = "Entendi sobre sua situação atual! ";
        }
    } else if (field === 'contact') {
        const phoneMatch = value.match(/(?:\(?(\d{2})\)?\s*)?(\d{4,5}[-.\s]?\d{4,5})/);
        const emailMatch = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        
        if (phoneMatch) {
            acknowledgment = "Perfeito! Vou salvar seu WhatsApp. Um dos nossos consultores vai entrar em contato com as melhores opções! 📱";
        } else if (emailMatch) {
            acknowledgment = "Perfeito! Vou salvar seu e-mail. Vou te enviar as melhores opções por lá! 📧";
        } else {
            acknowledgment = "Entendi! Vou salvar essas informações. Obrigada! 😊";
        }
        // Após salvar contato, oferece continuar refinando
        setTimeout(() => {
            addLunaSidebarMessage("Se quiser refinar mais alguma coisa na busca, é só me falar! Estou sempre aqui! ✨");
        }, 1500);
    } else if (field === 'free_filter') {
        // Já processado em processFreeTextFilter
        acknowledgment = "";
    } else {
        acknowledgment = "Entendi! ";
    }
    
    addLunaSidebarMessage(acknowledgment);
    
    // If filters changed, update results dynamically
    if (filtersChanged) {
        // Update URL with new filters
        const newParams = new URLSearchParams(window.location.search);
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== '' && filters[key] !== undefined) {
                newParams.set(key, filters[key]);
            }
        });
        
        // Update URL without reload
        window.history.replaceState({}, '', `?${newParams.toString()}`);
        
        // Re-filter and render immediately
        setTimeout(() => {
            if (typeof window.initFilters === 'function') {
                window.initFilters();
            }
        }, 300);
    }
}

function addLunaSidebarMessage(text) {
    const messagesContainer = document.getElementById('luna-sidebar-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'luna-sidebar-message';
    messageDiv.innerHTML = `
        <div class="luna-sidebar-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="luna-sidebar-content">${text}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSidebarUserMessage(text) {
    const messagesContainer = document.getElementById('luna-sidebar-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'luna-sidebar-message user';
    messageDiv.innerHTML = `
        <div class="luna-sidebar-content">${text}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showSidebarTextInput(question) {
    const input = document.getElementById('luna-sidebar-input');
    input.placeholder = question.placeholder || "Digite sua resposta...";
    input.focus();
}

