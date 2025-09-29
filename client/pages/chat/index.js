import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import Layout from '../../components/Layout'
import api from '../../lib/api'
import { MessageCircle, Plus, Search, Bot, User, Save, ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ChatSidebar from '../../components/ChatSidebar'

export default function Chat() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversations, setSelectedConversations] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()
  const { isLoggedIn, loading } = useAuth()

    // Generate a concise title from a user message (copied from [id].js for consistency)
    const generateTitleFromMessage = (message) => {
      if (!message || message.length === 0) return 'Starting consultation...'

      // Clean the message: remove extra whitespace, punctuation at start/end
      let cleanMessage = message.trim()
      cleanMessage = cleanMessage.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '')

      // If message is too short, return it as is
      if (cleanMessage.length <= 3) return cleanMessage || 'Starting consultation...'

      // Take first 25 characters, but try to break at word boundaries
      let title = cleanMessage.substring(0, 25)
      const lastSpace = title.lastIndexOf(' ')

      // If we have a space and it's not too close to the start, break there
      if (lastSpace > 10) {
        title = title.substring(0, lastSpace)
      }

      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()

      // Add ellipsis if truncated
      if (title.length < cleanMessage.length) {
        title += '...'
      }

      return title || 'Starting consultation...'
    }
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Check authentication
    if (!loading && !isLoggedIn) {
      router.push('/login')
      return
    }

    if (isLoggedIn) {
      loadConversations()
    }
  }, [router, isLoggedIn, loading])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      const data = await api.getConversations()
      setConversations(data.conversations || [])

      // Do not auto-select any conversation on the list page
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadConversationHistory = async (conversation) => {
    console.log('📚 [DEBUG] Loading conversation history for:', conversation.sessionId)
    setIsLoading(true)
    try {
      const data = await api.getConversation(conversation.sessionId)
      console.log('📚 [DEBUG] Loaded conversation history:', {
        sessionId: conversation.sessionId,
        messageCount: data.messages?.length || 0,
        messages: data.messages
      })
      setMessages(data.messages || [])
    } catch (error) {
      console.error('❌ [DEBUG] Error loading conversation:', error)
      setMessages([
        { role: 'assistant', content: 'Welcome back to your conversation!' },
        { role: 'user', content: conversation.title },
        { role: 'assistant', content: 'Sorry, we couldn\'t load the conversation history. Please try again.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const selectConversation = async (conversation) => {
    console.log('🔄 [DEBUG] Selecting conversation:', {
      sessionId: conversation.sessionId,
      title: conversation.title,
      messageCount: conversation.messageCount,
      isCompleted: conversation.isCompleted,
      currentlySelected: selectedConversation?.sessionId
    })

    // If this is the currently selected conversation and it has messages, don't refetch
    if (selectedConversation?.sessionId === conversation.sessionId && messages.length > 0) {
      console.log('🔄 [DEBUG] Skipping refetch - already selected with messages')
      return
    }

    setSelectedConversation(conversation)

    // For new conversations with no messages, set the welcome message directly
    if (conversation.messageCount <= 1 && !conversation.isCompleted) {
      console.log('🔄 [DEBUG] Setting welcome message for new conversation')
      setMessages([{ role: 'assistant', content: "Hi, welcome to your consultation. This should take about 15 minutes to complete as I need important information. Are you ready to start?" }])
      return
    }

    // For existing conversations, load from backend
    console.log('🔄 [DEBUG] Loading existing conversation from backend')
    loadConversationHistory(conversation)

    // On mobile, switch to chat view after selecting conversation
    setIsMobileChatView(true)
  }

  const createNewConversation = async () => {
    // Check if there's already a blank conversation that hasn't been started
    const blankConversation = conversations.find(conv =>
      generateTitleFromMessage(conv.title) === 'Starting consultation...' &&
      conv.messageCount <= 1 &&
      !conv.isCompleted
    )

    if (blankConversation) {
      // Navigate to the existing blank conversation
      router.push('/chat/' + blankConversation.sessionId)
      return
    }

    try {
      const data = await api.initChat()
      if (data.sessionId) {
        const newConversation = {
          id: data.sessionId, // Set id for consistency with backend
          sessionId: data.sessionId,
          title: generateTitleFromMessage(''),
          messageCount: 0,
          lastMessageTime: new Date().toISOString(),
          isCompleted: false
        }

        setConversations(prev => [newConversation, ...prev])
        // Navigate to the new conversation
        router.push('/chat/' + data.sessionId)
      }
    } catch (error) {
      console.error('Error creating new conversation:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading || !selectedConversation) return

    const userMessage = { role: 'user', content: inputMessage }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage('')
    setIsLoading(true)

    console.log('📤 [DEBUG] Frontend sending message:', {
      message: inputMessage,
      sessionId: selectedConversation.sessionId,
      conversationLength: newMessages.length
    })

    // Ensure loading shows for at least 2 seconds
    const startTime = Date.now()

    try {
      const data = await api.sendChatMessage(inputMessage, newMessages, selectedConversation.sessionId)

      console.log('📥 [DEBUG] Frontend received response:', {
        response: data.response,
        sessionId: data.sessionId,
        isFinal: data.isFinal
      })

      // Calculate remaining time to show loading for at least 2 seconds
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)

      setTimeout(() => {
        // Backend now stores the assistant response, so we don't need to add it locally
        // The conversation will be updated when we fetch it again
        setMessages([...newMessages, { role: 'assistant', content: data.response }])

        // Update conversation in list
        setConversations(prev => prev.map(conv =>
          conv.sessionId === selectedConversation.sessionId
            ? { ...conv, messageCount: conv.messageCount + 2, lastMessageTime: new Date().toISOString() }
            : conv
        ))

        if (data.isFinal) {
          // Mark conversation as completed
          setConversations(prev => prev.map(conv =>
            conv.sessionId === selectedConversation.sessionId
              ? { ...conv, isCompleted: true }
              : conv
          ))
          console.log('Questionnaire completed')
        }

        setIsLoading(false)
      }, remainingTime)
    } catch (error) {
      console.error('❌ [DEBUG] Error sending message:', error)

      // Calculate remaining time to show loading for at least 2 seconds
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)

      setTimeout(() => {
        const errorMessage = { role: 'assistant', content: 'Sorry, there was an error. Please try again.' }
        setMessages([...newMessages, errorMessage])
        setIsLoading(false)
      }, remainingTime)
    }
  }

  const saveDraft = async () => {
    if (!selectedConversation || messages.length === 0) return

    setIsSavingDraft(true)
    try {
      console.log('💾 [DEBUG] Saving draft:', {
        sessionId: selectedConversation.sessionId,
        messageCount: messages.length,
        title: selectedConversation.title
      })

      await api.saveDraft(
        selectedConversation.sessionId,
        messages,
        selectedConversation.title,
        selectedConversation.offenseType
      )

      // Update conversation in list to mark as draft
      setConversations(prev => prev.map(conv =>
        conv.sessionId === selectedConversation.sessionId
          ? { ...conv, type: 'draft', lastMessageTime: new Date().toISOString() }
          : conv
      ))

      toast.success('Draft saved successfully!')
    } catch (error) {
      console.error('❌ [DEBUG] Error saving draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const filteredConversations = conversations.map(conv => ({
    ...conv,
    title: generateTitleFromMessage(conv.title)
  })).filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteConversation = async (conversationId) => {
    try {
      const response = await api.deleteConversation(conversationId)
      const isPermanentDelete = response.type === 'session'
      setConversations(prev => prev.filter(conv => conv.sessionId !== conversationId))
      if (selectedConversation?.sessionId === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }
      toast.success(isPermanentDelete ? 'Conversation permanently deleted' : 'Conversation soft deleted')
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  const handleDeleteSelectedConversations = async (selectedIds) => {
    try {
      // Delete all conversations - backend handles permanent vs soft delete
      const deletePromises = selectedIds.map(id => api.deleteConversation(id))
      await Promise.all(deletePromises)
      
      setConversations(prev => prev.filter(conv => !selectedIds.includes(conv.sessionId)))
      
      if (selectedConversation && selectedIds.includes(selectedConversation.sessionId)) {
        setSelectedConversation(null)
        setMessages([])
      }
      
      toast.success(`${selectedIds.length} conversation(s) deleted successfully`)
    } catch (error) {
      console.error('Error deleting conversations:', error)
      toast.error('Failed to delete selected conversations')
    }
  }

  const handleSelectConversation = (conversationId) => {
    // Navigate to the chat page for this conversation
    router.push('/chat/' + conversationId)
  }

  return (
    <Layout title="Chat - Harmonia-AI" description="Your chat conversations">
      <div className="h-full flex min-h-0 flex-1 flex-row bg-[#0f2b2fcc]">
        {/* Sidebar: visible on all screens like WhatsApp */}
        <div className="w-full md:w-[380px] max-w-full md:max-w-[380px] flex flex-col min-h-0">
          <ChatSidebar
            conversations={filteredConversations}
            onSelectConversation={handleSelectConversation}
            selectedId={selectedConversation?.sessionId}
            onNewConversation={createNewConversation}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={isLoadingConversations}
            selectedConversations={selectedConversations}
            setSelectedConversations={setSelectedConversations}
            isSelectionMode={isSelectionMode}
            setIsSelectionMode={setIsSelectionMode}
            onDeleteConversation={handleDeleteConversation}
            onDeleteSelectedConversations={handleDeleteSelectedConversations}
          />
        </div>
        {/* Main Area: hidden on mobile, visible on desktop */}
        <div className="hidden md:flex flex-1 flex flex-col items-center justify-center bg-[#0f2b2fcc] min-h-0">
          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-[#73cfd0] flex items-center justify-center mb-6">
              <MessageCircle className="h-16 w-16 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Harmonia-AI</h1>
            <p className="text-[#73cfd0] text-lg text-center max-w-md mb-4">Start a new conversation or select an existing chat from the sidebar. Your legal AI assistant is ready to help!</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}