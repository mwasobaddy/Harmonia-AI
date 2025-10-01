// API client for making authenticated requests
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://harmonia-ai-backend.onrender.com/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  getAuthHeaders() {
    const token = localStorage.getItem('authToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth methods
  async verifyToken() {
    return this.request('/auth/verify')
  }

  async getProfile() {
    return this.request('/auth/profile')
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' })
  }

  // Chat methods
  async initChat() {
    return this.request('/chat/init', { method: 'POST' })
  }

  async sendChatMessage(message, conversation, sessionId) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation, sessionId })
    })
  }

  async getConversations() {
    return this.request('/chat/conversations')
  }

  async getConversation(sessionId) {
    return this.request(`/chat/conversations/${sessionId}`)
  }

  async deleteConversation(sessionId) {
    return this.request(`/chat/conversations/${sessionId}`, { method: 'DELETE' })
  }

  async deleteOrder(orderId) {
    return this.request(`/chat/orders/${orderId}`, { method: 'DELETE' })
  }

  async saveDraft(sessionId, messages, title, offenseType) {
    return this.request('/chat/drafts', {
      method: 'POST',
      body: JSON.stringify({ sessionId, messages, title, offenseType })
    })
  }

  // Order methods
  async getDocument(documentId) {
    return this.request(`/documents/${documentId}`)
  }

  // Document methods
  async getDocuments() {
    return this.request('/documents')
  }
}

export default new ApiClient()