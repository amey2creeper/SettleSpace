// AI Chatbot JavaScript with Gemini API integration and conversation memory
class SettleSpaceChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.conversationHistory = [];
        this.apiKey = 'AIzaSyDCditncxg_r2gfVyK3PGqB1bX_cwrkB6g';
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        this.currentUser = null;
        this.adminCommunicationActive = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadChatHistory();
        this.checkUserAccess();
    }
    
    checkUserAccess() {
        this.currentUser = JSON.parse(localStorage.getItem('settlespace_user') || 'null');
        
        if (!this.currentUser) {
            this.disableChatbot();
        } else {
            this.enableChatbot();
            this.showWelcomeMessage();
        }
    }
    
    disableChatbot() {
        const toggleBtn = document.getElementById('chatbot-toggle');
        const container = document.getElementById('chatbot-container');
        
        if (toggleBtn) {
            toggleBtn.style.display = 'none';
        }
        if (container) {
            container.style.display = 'none';
        }
    }
    
    enableChatbot() {
        const toggleBtn = document.getElementById('chatbot-toggle');
        const container = document.getElementById('chatbot-container');
        
        if (toggleBtn) {
            toggleBtn.style.display = 'flex';
        }
        if (container) {
            container.style.display = 'flex';
        }
    }
    
    setupEventListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle');
        const minimizeBtn = document.getElementById('chatbot-minimize');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.close());
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSend());
        }
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSend();
                }
            });
        }
        
        // Listen for user login/logout events
        window.addEventListener('userLoggedIn', () => {
            this.checkUserAccess();
        });
        
        window.addEventListener('userLoggedOut', () => {
            this.checkUserAccess();
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        const container = document.getElementById('chatbot-container');
        const toggleBtn = document.getElementById('chatbot-toggle');
        
        if (container && toggleBtn) {
            container.classList.add('active');
            toggleBtn.style.display = 'none';
            this.isOpen = true;
            
            const input = document.getElementById('chatbot-input');
            if (input) {
                setTimeout(() => input.focus(), 300);
            }
        }
    }
    
    close() {
        const container = document.getElementById('chatbot-container');
        const toggleBtn = document.getElementById('chatbot-toggle');
        
        if (container && toggleBtn) {
            container.classList.remove('active');
            toggleBtn.style.display = 'flex';
            this.isOpen = false;
        }
    }
    
    showWelcomeMessage() {
        if (this.messages.length === 0) {
            const welcomeMessage = this.getWelcomeMessage();
            this.addMessage('bot', welcomeMessage);
        }
    }
    
    getWelcomeMessage() {
        const currentPage = window.location.pathname.split('/').pop();
        
        let message = `Hi ${this.currentUser.name}! I'm your SettleSpace AI assistant. `;
        
        switch (currentPage) {
            case 'index.html':
            case '':
                message += "I can help you find properties, answer questions about real estate, or guide you through our platform.";
                break;
            case 'properties.html':
                message += "I can help you find specific properties, explain details, or suggest similar options.";
                break;
            case 'property_detail.html':
                message += "I can provide more details about this property or help you with the inquiry process.";
                break;
            default:
                message += "How can I assist you today?";
        }
        
        return message;
    }
    
    async handleSend() {
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        
        if (!input || !sendBtn) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage('user', message);
        this.conversationHistory.push({ role: 'user', content: message });
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        sendBtn.disabled = true;
        
        try {
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessage('bot', response);
            this.conversationHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('bot', this.getErrorResponse(error));
        } finally {
            sendBtn.disabled = false;
        }
    }
    
    async getAIResponse(userMessage) {
        try {
            const context = this.buildContext(userMessage);
            
            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: context
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 300,
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                let aiResponse = data.candidates[0].content.parts[0].text;
                
                // Process response for links and admin communication
                aiResponse = this.processResponse(aiResponse, userMessage);
                
                return aiResponse;
            } else {
                throw new Error('Invalid response format');
            }
            
        } catch (error) {
            console.error('Gemini API Error:', error);
            return this.getLocalResponse(userMessage);
        }
    }
    
    buildContext(userMessage) {
        const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
        const approvedProperties = properties.filter(p => p.status === 'approved');
        const currentPage = window.location.pathname.split('/').pop();
        
        // Build conversation history for context
        const recentHistory = this.conversationHistory.slice(-6); // Last 6 messages
        const historyText = recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        
        // Get property details for context
        const propertyContext = approvedProperties.slice(0, 5).map(p => 
            `Property: ${p.title} - ${p.location} - ${p.propertyType} - ₹${p.price.toLocaleString('en-IN')} - ${p.transactionType}`
        ).join('\n');
        
        let context = `You are SettleSpace AI assistant for Indian real estate. Keep responses SHORT (2-3 sentences max).

CONVERSATION HISTORY:
${historyText}

CURRENT USER: ${this.currentUser.name} (${this.currentUser.userType})
CURRENT PAGE: ${currentPage || 'homepage'}

AVAILABLE PROPERTIES:
${propertyContext}

GUIDELINES:
- Keep responses concise and helpful
- When user wants to buy/rent, provide direct link: <a href="properties.html">Browse Properties</a>
- For specific properties, mention exact details (price, location, type)
- If you don't know something, offer admin communication: "Would you like me to connect you with our admin for personalized assistance?"
- Use Indian currency (₹) and local terms
- Be conversational and remember previous context

USER MESSAGE: "${userMessage}"

Provide a helpful, SHORT response:`;
        
        return context;
    }
    
    processResponse(response, userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Check if user is asking about unknown topics
        if (response.toLowerCase().includes("i don't know") || 
            response.toLowerCase().includes("i'm not sure") ||
            response.toLowerCase().includes("unclear")) {
            
            response += "\n\nWould you like me to connect you with our admin for personalized assistance?";
            this.offerAdminCommunication = true;
        }
        
        // Check if user wants admin communication
        if (lowerMessage.includes('yes') && this.offerAdminCommunication) {
            this.initiateAdminCommunication();
            return "Great! I've notified our admin. They will contact you shortly for personalized assistance.";
        }
        
        return response;
    }
    
    getLocalResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
        const approvedProperties = properties.filter(p => p.status === 'approved');
        
        // Greeting responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return `Hi ${this.currentUser.name}! How can I help you find your perfect property today?`;
        }
        
        // Property search queries
        if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
            const saleProperties = approvedProperties.filter(p => p.transactionType === 'sale');
            return `We have ${saleProperties.length} properties for sale! <a href="properties.html" style="color: #667eea;">Browse Properties</a> to find your dream home.`;
        }
        
        if (lowerMessage.includes('rent')) {
            const rentProperties = approvedProperties.filter(p => p.transactionType === 'rent');
            return `${rentProperties.length} rental properties available! <a href="properties.html" style="color: #667eea;">View Rentals</a> to find your perfect place.`;
        }
        
        // Location-based queries
        if (lowerMessage.includes('mumbai') || lowerMessage.includes('bandra')) {
            const mumbaiProps = approvedProperties.filter(p => p.location.toLowerCase().includes('mumbai'));
            if (mumbaiProps.length > 0) {
                const prop = mumbaiProps[0];
                return `Found ${mumbaiProps.length} properties in Mumbai! Like "${prop.title}" in ${prop.location} for ₹${prop.price.toLocaleString('en-IN')}. <a href="properties.html?location=mumbai" style="color: #667eea;">See all Mumbai properties</a>`;
            }
        }
        
        if (lowerMessage.includes('bangalore')) {
            const bangaloreProps = approvedProperties.filter(p => p.location.toLowerCase().includes('bangalore'));
            if (bangaloreProps.length > 0) {
                const prop = bangaloreProps[0];
                return `${bangaloreProps.length} properties in Bangalore! "${prop.title}" in ${prop.location} for ₹${prop.price.toLocaleString('en-IN')}. <a href="properties.html?location=bangalore" style="color: #667eea;">View Bangalore properties</a>`;
            }
        }
        
        // Price inquiries
        if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            return `Property prices vary by location. Mumbai: ₹8,000-25,000/sq ft, Bangalore: ₹4,000-12,000/sq ft. <a href="properties.html" style="color: #667eea;">Browse by budget</a>`;
        }
        
        // Default response with admin option
        return `I can help with property search, pricing, and platform features. Would you like me to connect you with our admin for personalized assistance?`;
    }
    
    initiateAdminCommunication() {
        // Create admin notification
        const adminNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        const notification = {
            id: 'notif-' + Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userEmail: this.currentUser.email,
            message: 'User requested admin assistance via chatbot',
            timestamp: new Date().toISOString(),
            status: 'pending',
            type: 'chat_request'
        };
        
        adminNotifications.push(notification);
        localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications));
        
        // Set flag for admin communication
        this.adminCommunicationActive = true;
        localStorage.setItem(`admin_chat_${this.currentUser.id}`, 'true');
        
        this.offerAdminCommunication = false;
    }
    
    getErrorResponse(error) {
        return `I'm having trouble connecting right now. Would you like me to connect you with our admin for immediate assistance?`;
    }
    
    addMessage(sender, content) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const contentP = document.createElement('p');
        contentP.innerHTML = content; // Use innerHTML to support links
        contentDiv.appendChild(contentP);
        
        if (sender === 'user') {
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(contentDiv);
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save message
        this.messages.push({ sender, content, timestamp: new Date() });
        this.saveChatHistory();
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<p>Typing<span class="dots">...</span></p>';
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(contentDiv);
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add CSS for typing animation
        if (!document.getElementById('typing-css')) {
            const style = document.createElement('style');
            style.id = 'typing-css';
            style.textContent = `
                .dots {
                    animation: typing-dots 1.5s infinite;
                }
                @keyframes typing-dots {
                    0%, 20% { opacity: 0; }
                    40% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    loadChatHistory() {
        const saved = localStorage.getItem(`settlespace_chat_${this.currentUser?.id || 'guest'}`);
        if (saved) {
            const data = JSON.parse(saved);
            this.messages = data.messages || [];
            this.conversationHistory = data.conversationHistory || [];
            
            // Restore messages to UI
            this.messages.forEach(msg => {
                this.addMessageToUI(msg.sender, msg.content);
            });
        }
    }
    
    addMessageToUI(sender, content) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const contentP = document.createElement('p');
        contentP.innerHTML = content;
        contentDiv.appendChild(contentP);
        
        if (sender === 'user') {
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(contentDiv);
        }
        
        messagesContainer.appendChild(messageDiv);
    }
    
    saveChatHistory() {
        if (!this.currentUser) return;
        
        // Keep only last 50 messages to avoid storage issues
        if (this.messages.length > 50) {
            this.messages = this.messages.slice(-50);
        }
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
        
        const chatData = {
            messages: this.messages,
            conversationHistory: this.conversationHistory
        };
        
        localStorage.setItem(`settlespace_chat_${this.currentUser.id}`, JSON.stringify(chatData));
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.settleSpaceChatbot = new SettleSpaceChatbot();
});