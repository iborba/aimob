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
    
    // Load saved preferences from URL, localStorage, OR global leadData
    // PRIORIDADE: leadData (conversa inicial) > URL params > localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const currentLead = getOrCreateLeadData(); // Get from conversation or storage
    
    const savedData = {
        propertyType: currentLead.propertyType || urlParams.get('tipo') || '',
        bedrooms: currentLead.bedrooms || (urlParams.get('quartos') ? parseInt(urlParams.get('quartos')) : null),
        budgetMax: currentLead.budget?.max || (urlParams.get('preco_max') ? parseInt(urlParams.get('preco_max')) : null),
        location: currentLead.location || urlParams.get('localizacao') || ''
    };
    
    // CRITICAL: Mark questions as already asked if data exists
    if (savedData.bedrooms) {
        sidebarState.questionsAsked.add('bedrooms_refine');
    }
    if (savedData.location) {
        sidebarState.questionsAsked.add('location');
    }
    if (savedData.propertyType) {
        sidebarState.questionsAsked.add('property_type');
    }
    
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
    // FIXED: For mandatory fields (name, contact), check if actually collected
    // Don't skip if already asked but not properly collected
    if (state.questionsAsked.has(type)) {
        // For mandatory fields, check if they're actually collected
        if (type === 'name') {
            const currentLead = getOrCreateLeadData();
            if (currentLead.name && currentLead.name !== 'Não informado' && currentLead.name.trim() !== '') {
                return; // Name is properly collected, skip
            }
            // Name not properly collected, allow re-asking
        } else if (type === 'contact') {
            const currentLead = getOrCreateLeadData();
            if (currentLead.phone || currentLead.email) {
                return; // Contact is properly collected, skip
            }
            // Contact not properly collected, allow re-asking
        } else {
            return; // Non-mandatory field already asked, skip
        }
    }
    
    if (!state.questionsAsked.has(type)) {
        state.questionsAsked.add(type);
    }
    
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
        case 'contact':
            question = {
                message: "Pra eu te enviar as melhores opções e você não perder nenhuma oportunidade, me passa seu WhatsApp ou e-mail? 😊",
                field: 'contact',
                type: 'text'
            };
            break;
        case 'name':
            question = {
                message: "Qual seu nome? Pra eu te chamar pelo nome! 😊",
                field: 'name',
                type: 'text'
            };
            break;
        case 'motivation':
            question = {
                message: "Me conta... qual é o motivo principal da sua busca? Tipo, sair do aluguel, família crescendo, investimento, mudança de vida...",
                field: 'motivation',
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
    
    // Se não há pergunta ativa, trata como novo filtro livre
    if (!question) {
        // Usuário está refinando busca livremente
        processFreeTextFilter(text, savedData, state);
        input.value = '';
        return;
    }
    
    if (question) {
        // Save answer (could update filters)
        const filtersChanged = processSidebarAnswer(question.field, text, savedData);
        
        // Clear current question to allow free input after answering
        state.currentQuestion = null;
        
        // Ask next question in sequence - PRIORIDADE: IMÓVEL primeiro, CLIENTE depois
        // FIXED: Nome e Contato são OBRIGATÓRIOS e devem ser sempre perguntados
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
            // 4. NOME (OBRIGATÓRIO - sempre perguntar se não foi coletado)
            else if (!state.questionsAsked.has('name')) {
                const currentLead = getOrCreateLeadData();
                if (!currentLead.name || currentLead.name === 'Não informado' || currentLead.name.trim() === '') {
                    askRefinementQuestion('name', state, savedData);
                } else {
                    // Já tem nome válido, marcar como perguntado e continuar
                    state.questionsAsked.add('name');
                    // Continue to next question without recursive call
                    // The setTimeout will handle the next iteration
                }
            }
            // 5. Motivação (importante para entender o lead)
            else if (!state.questionsAsked.has('motivation')) {
                askRefinementQuestion('motivation', state, savedData);
            }
            // 6. Informações do cliente (depois de saber sobre o imóvel)
            else if (!state.questionsAsked.has('timeline')) {
                askRefinementQuestion('timeline', state, savedData);
            } else if (!state.questionsAsked.has('payment')) {
                askRefinementQuestion('payment', state, savedData);
            } else if (!state.questionsAsked.has('current_situation')) {
                askRefinementQuestion('current_situation', state, savedData);
            } 
            // 7. CONTATO (OBRIGATÓRIO - sempre perguntar se não foi coletado)
            else if (!state.questionsAsked.has('contact')) {
                const currentLead = getOrCreateLeadData();
                if (!currentLead.phone && !currentLead.email) {
                    askRefinementQuestion('contact', state, savedData);
                } else {
                    // Já tem contato, marcar como perguntado e finalizar
                    state.questionsAsked.add('contact');
                    addLunaSidebarMessage("Perfeito! Com essas informações, consigo te ajudar ainda melhor. Os resultados já estão filtrados pra você! 😊");
                    addLunaSidebarMessage("Se quiser refinar mais alguma coisa ou mudar algum filtro, é só me falar! Estou sempre aqui pra ajudar! ✨");
                }
            } else {
                // Todas as perguntas foram feitas, mas sidebar permanece aberta para novos filtros
                addLunaSidebarMessage("Perfeito! Com essas informações, consigo te ajudar ainda melhor. Os resultados já estão filtrados pra você! 😊");
                addLunaSidebarMessage("Se quiser refinar mais alguma coisa ou mudar algum filtro, é só me falar! Estou sempre aqui pra ajudar! ✨");
            }
        }, 1000);
    }
    
    input.value = '';
    
    // Sidebar permanece aberta - permite novos filtros a qualquer momento
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
    } else if (field === 'name') {
        // Extract name - use the value directly (user's name)
        if (value && value.trim().length > 0) {
            leadUpdates.name = value.trim();
        }
    } else if (field === 'motivation') {
        // Extract motivation
        let motivationPrimary = null;
        
        if (lowerValue.includes('aluguel') || lowerValue.includes('alugando') || lowerValue.includes('sair do aluguel')) {
            motivationPrimary = 'sair_aluguel';
        } else if (lowerValue.includes('família') || lowerValue.includes('crescendo') || lowerValue.includes('filhos') || lowerValue.includes('bebê')) {
            motivationPrimary = 'familia_crescendo';
        } else if (lowerValue.includes('investimento') || lowerValue.includes('investir') || lowerValue.includes('renda')) {
            motivationPrimary = 'investimento';
        } else if (lowerValue.includes('mudança') || lowerValue.includes('mudar') || lowerValue.includes('trocar')) {
            motivationPrimary = 'mudanca_vida';
        } else if (lowerValue.includes('primeiro') || lowerValue.includes('primeira vez') || lowerValue.includes('primeira casa')) {
            motivationPrimary = 'primeiro_imovel';
        } else if (lowerValue.includes('trabalho') || lowerValue.includes('emprego') || lowerValue.includes('carreira')) {
            motivationPrimary = 'mudanca_trabalho';
        } else {
            // Se não identificou categoria específica, salva o texto como motivação primária
            motivationPrimary = 'outro';
        }
        
        if (motivationPrimary) {
            leadUpdates.motivation = {
                primary: motivationPrimary,
                story: value // Salva a história completa
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
    if (filtersChanged || field === 'free_filter') {
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
        const existingHistory = currentLead.filterHistory || [];
        leadUpdates.filterHistory = [...existingHistory, {
            timestamp: new Date().toISOString(),
            filters: { ...currentFilters }
        }];
    }
    
    // Salva informações no leadData (mantém contexto)
    if (Object.keys(leadUpdates).length > 0) {
        updateLeadDataAndSave(leadUpdates);
    }
    
    // Acknowledge answer using user's words
    let acknowledgment = "";
    if (field === 'location') {
        // IMPROVED: More natural, less technical
        acknowledgment = `Perfeito! Vou focar em ${filters.localizacao || value}. `;
    } else if (field === 'bedrooms') {
        // IMPROVED: More natural, less technical
        acknowledgment = "Perfeito! Vou ajustar os resultados. ";
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
        // IMPROVED: More natural, less technical
        acknowledgment = "Perfeito! Vou ajustar os resultados com essas características. ";
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
    } else if (field === 'name') {
        acknowledgment = `Prazer, ${value}! 😊 Vou te chamar pelo nome daqui pra frente!`;
    } else if (field === 'motivation') {
        if (lowerValue.includes('aluguel') || lowerValue.includes('alugando')) {
            acknowledgment = "Entendi! Sair do aluguel é um grande passo. Vou focar em opções que fazem sentido pra essa transição! 🏠";
        } else if (lowerValue.includes('família') || lowerValue.includes('crescendo')) {
            acknowledgment = "Que legal! Família crescendo precisa de mais espaço. Vou te mostrar opções perfeitas pra vocês! 👨‍👩‍👧‍👦";
        } else if (lowerValue.includes('investimento')) {
            acknowledgment = "Ótimo! Investimento imobiliário é uma excelente escolha. Vou focar em opções com bom potencial! 💰";
        } else if (lowerValue.includes('mudança') || lowerValue.includes('mudar')) {
            acknowledgment = "Entendi! Mudança de vida é sempre emocionante. Vou te ajudar a encontrar o lugar perfeito! ✨";
        } else {
            acknowledgment = "Entendi! Vou considerar isso na busca. Obrigada por compartilhar! 😊";
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

// ========================================
// PROCESS FREE TEXT FILTER (novos filtros livres)
// ========================================
function processFreeTextFilter(text, savedData, state) {
    const lowerText = text.toLowerCase();
    
    // Tenta identificar o que o usuário quer filtrar
    let filtersChanged = false;
    const filters = {
        tipo: savedData.propertyType || '',
        quartos: savedData.bedrooms || null,
        preco_max: savedData.budgetMax || null,
        localizacao: savedData.location || ''
    };
    
    // Detecta tipo de imóvel
    if (lowerText.match(/apartamento|apto|ap/i)) {
        filters.tipo = 'apartamento';
        filtersChanged = true;
    } else if (lowerText.match(/casa|sobrado/i)) {
        filters.tipo = 'casa';
        filtersChanged = true;
    }
    
    // Detecta quartos
    const bedroomMatch = text.match(/(\d+)\s*(?:quarto|dormitório)/i);
    if (bedroomMatch) {
        filters.quartos = parseInt(bedroomMatch[1]);
        filtersChanged = true;
    }
    
    // Detecta preço
    const priceMatch = text.match(/(?:até|até\s*|uns?\s*)?(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(milhões?|mil|m)?/i);
    if (priceMatch) {
        let value = parseFloat(priceMatch[1].replace(',', '.'));
        if (priceMatch[2] && priceMatch[2].includes('milhão')) {
            value *= 1000000;
        } else if (priceMatch[2] && priceMatch[2].includes('mil')) {
            value *= 1000;
        }
        filters.preco_max = value;
        filtersChanged = true;
    }
    
    // Detecta localização
    const cities = ['porto alegre', 'canoas', 'viamão', 'gravataí', 'cachoeirinha', 'são leopoldo', 'novo hamburgo'];
    for (const city of cities) {
        if (lowerText.includes(city)) {
            filters.localizacao = city.charAt(0).toUpperCase() + city.slice(1);
            filtersChanged = true;
            break;
        }
    }
    
    if (filtersChanged) {
        // Processa como se fosse uma resposta de filtro
        processSidebarAnswer('free_filter', text, savedData);
        
        // Atualiza URL e resultados
        const newParams = new URLSearchParams(window.location.search);
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== '' && filters[key] !== undefined) {
                newParams.set(key, filters[key]);
            }
        });
        window.history.replaceState({}, '', `?${newParams.toString()}`);
        
        setTimeout(() => {
            if (typeof window.initFilters === 'function') {
                window.initFilters();
            }
        }, 300);
        
        // IMPROVED: More natural, less technical
        addLunaSidebarMessage("Perfeito! Vou ajustar os resultados. ");
    } else {
        addLunaSidebarMessage("Entendi! Se quiser refinar algum filtro específico, pode me dizer! Por exemplo: 'mais barato', 'mais quartos', 'outra cidade'... 😊");
    }
}

