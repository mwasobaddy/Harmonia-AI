import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import api from '../lib/api'
import { MessageCircle, Plus, Search, Trash2, CheckSquare, Square, Bot, User } from 'lucide-react'

export default function Chat() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversations, setSelectedConversations] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    loadConversations()
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      const data = await api.getConversations()
      setConversations(data.conversations || [])

      // Auto-select the first conversation if available
      if (data.conversations && data.conversations.length > 0) {
        const firstConversation = data.conversations[0]
        setSelectedConversation(firstConversation)

        // For new conversations, set welcome message directly
        if (firstConversation.messageCount <= 1 && !firstConversation.isCompleted) {
          setMessages([{ role: 'assistant', content: "Hi, welcome to your consultation. This should take about 15 minutes to complete as I need important information. Are you ready to start?" }])
        } else {
          // For existing conversations, load from backend
          loadConversationHistory(firstConversation)
        }
      }
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
  }

  const createNewConversation = async () => {
    // Check if there's already a blank conversation that hasn't been started
    const blankConversation = conversations.find(conv =>
      conv.title === 'New Conversation' &&
      conv.messageCount <= 1 &&
      !conv.isCompleted
    )

    if (blankConversation) {
      // Select the existing blank conversation instead of creating a new one
      selectConversation(blankConversation)
      return
    }

    try {
      const data = await api.initChat()
      if (data.sessionId) {
        const newConversation = {
          id: data.sessionId, // Set id for consistency with backend
          sessionId: data.sessionId,
          title: 'New Conversation',
          messageCount: 0,
          lastMessageTime: new Date().toISOString(),
          isCompleted: false
        }

        setConversations(prev => [newConversation, ...prev])
        setSelectedConversation(newConversation)
        setMessages([]) // Clear current messages

        // Show initial loading for 3 seconds and disable input
        setIsInitialLoading(true)
        setTimeout(() => {
          setIsInitialLoading(false)
          // Start the conversation with welcome message
          setMessages([{ role: 'assistant', content: "Hi, welcome to your consultation. This should take about 15 minutes to complete as I need important information. Are you ready to start?" }])
        }, 3000)
      }
    } catch (error) {
      console.error('Error creating new conversation:', error)
      setIsInitialLoading(false)
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

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteConversation = async (conversationId) => {
    try {
      await api.deleteConversation(conversationId)
      setConversations(prev => prev.filter(conv => conv.sessionId !== conversationId))
      if (selectedConversation?.sessionId === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }
      toast.success('Conversation deleted successfully')
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  const handleDeleteSelectedConversations = async () => {
    try {
      const deletePromises = Array.from(selectedConversations).map(id => api.deleteConversation(id))
      await Promise.all(deletePromises)
      
      setConversations(prev => prev.filter(conv => !selectedConversations.has(conv.sessionId)))
      
      if (selectedConversation && selectedConversations.has(selectedConversation.sessionId)) {
        setSelectedConversation(null)
        setMessages([])
      }
      
      setSelectedConversations(new Set())
      setIsSelectionMode(false)
      toast.success(`${selectedConversations.size} conversation(s) deleted successfully`)
    } catch (error) {
      console.error('Error deleting conversations:', error)
      toast.error('Failed to delete selected conversations')
    }
  }

  const handleSelectConversation = (conversationId) => {
    if (isSelectionMode) {
      setSelectedConversations(prev => {
        const newSet = new Set(prev)
        if (newSet.has(conversationId)) {
          newSet.delete(conversationId)
        } else {
          newSet.add(conversationId)
        }
        return newSet
      })
    } else {
      // Find the conversation object by sessionId
      const conversation = conversations.find(conv => conv.sessionId === conversationId)
      if (conversation) {
        selectConversation(conversation)
      }
    }
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedConversations(new Set())
  }

  return (
    <>
      <Head>
        <title>Chat - Harmonia-AI</title>
        <meta name="description" content="Your chat conversations" />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0 flex flex-col">
        <Header />

        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-1 justify-center">
          <div className="flex overflow-hi
          dden w-full h-[calc(100vh-64px)]">
            {/* Sidebar - Conversations List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isSelectionMode ? `${selectedConversations.size} Selected` : 'Conversations'}
                  </h2>
                  <div className="flex items-center space-x-2">
                    {isSelectionMode ? (
                      <>
                        <button
                          onClick={handleDeleteSelectedConversations}
                          disabled={selectedConversations.size === 0}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          title="Delete Selected"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={toggleSelectionMode}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          title="Cancel Selection"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={toggleSelectionMode}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          title="Select Multiple"
                        >
                          <CheckSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={createNewConversation}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          title="New Conversation"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No conversations yet</p>
                    <button
                      onClick={createNewConversation}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Start your first conversation
                    </button>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.sessionId}
                      onClick={() => handleSelectConversation(conversation.sessionId)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.sessionId === conversation.sessionId ? 'bg-blue-50 border-r-2 border-r-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          {isSelectionMode && (
                            <div className="flex-shrink-0 mt-1">
                              {selectedConversations.has(conversation.sessionId) ? (
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {conversation.messageCount} messages
                              {conversation.isCompleted && ' • Completed'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          {!isSelectionMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteConversation(conversation.sessionId)
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Conversation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <div className={`w-2 h-2 rounded-full ${
                            conversation.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-blue-600 text-white px-6 py-4 border-b border-blue-700">
                    <h1 className="text-xl font-semibold">{selectedConversation.title}</h1>
                    <p className="text-blue-100 text-sm">
                      {selectedConversation.isCompleted ? 'Completed' : 'In Progress'}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-gray-500 mt-8">
                        <p>Select a conversation to start chatting</p>
                      </div>
                    )}

                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-2`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                        )}
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start items-start space-x-2">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <LoadingSpinner size="sm" color="gray" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {isInitialLoading && (
                      <div className="flex justify-start items-start space-x-2">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <LoadingSpinner size="sm" color="gray" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <div className="border-t p-4">
                    <form onSubmit={sendMessage} className="flex space-x-4">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your response here..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading || isInitialLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || isInitialLoading || !inputMessage.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500 mb-4">Choose a conversation from the sidebar or start a new one</p>
                    <button
                      onClick={createNewConversation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start New Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  )
}