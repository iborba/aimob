// ========================================
// LUNA SIDEBAR - Refinamento de Busca
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initLunaSidebar();
});

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
            // Começar com timeline (mais natural)
            askRefinementQuestion('timeline', sidebarState, savedData);
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
        case 'decision_makers':
            question = {
                message: "E essa decisão é só sua ou tem mais alguém envolvido? Tipo, parceiro, família... só pra eu saber!",
                field: 'decision_makers',
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
        case 'features':
            question = {
                message: "E tem alguma coisa que é ESSENCIAL pra você no imóvel? Tipo, aceitar pets, piscina, academia, perto de transporte...",
                field: 'features',
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
        processSidebarAnswer(question.field, text, savedData);
        
        // Ask next question in sequence
        setTimeout(() => {
            if (!state.questionsAsked.has('payment')) {
                askRefinementQuestion('payment', state, savedData);
            } else if (!state.questionsAsked.has('decision_makers')) {
                askRefinementQuestion('decision_makers', state, savedData);
            } else if (!state.questionsAsked.has('current_situation')) {
                askRefinementQuestion('current_situation', state, savedData);
            } else if (!state.questionsAsked.has('features')) {
                askRefinementQuestion('features', state, savedData);
            } else {
                addLunaSidebarMessage("Perfeito! Com essas informações, consigo te ajudar ainda melhor. Os resultados já estão filtrados pra você! 😊");
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
    
    // Process answer and update filters
    if (field === 'features') {
        // Extract features and add to filters
        const features = [];
        if (lowerValue.includes('pet') || lowerValue.includes('animal') || lowerValue.includes('cachorro') || lowerValue.includes('gato')) {
            features.push('pet_friendly');
        }
        if (lowerValue.includes('piscina')) {
            features.push('pool');
        }
        if (lowerValue.includes('academia') || lowerValue.includes('ginásio')) {
            features.push('gym');
        }
        if (lowerValue.includes('transporte') || lowerValue.includes('metrô') || lowerValue.includes('ônibus')) {
            features.push('transit');
        }
        if (lowerValue.includes('segurança') || lowerValue.includes('portaria')) {
            features.push('security');
        }
        
        if (features.length > 0) {
            filters.features = features.join(',');
            filtersChanged = true;
        }
    }
    
    // Acknowledge answer using user's words
    let acknowledgment = "";
    if (field === 'timeline') {
        if (lowerValue.includes('urgente') || lowerValue.includes('logo') || lowerValue.includes('já') || lowerValue.includes('rápido')) {
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

