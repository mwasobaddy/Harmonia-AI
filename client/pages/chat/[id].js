import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import Layout from '../../components/Layout'
import api from '../../lib/api'
import { MessageCircle, Bot, User, Save, Send, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Chat() {
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()
  const { id } = router.query
  const { isLoggedIn, loading } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Check authentication
    if (!loading && !isLoggedIn) {
      router.push('/login')
      return
    }

    if (isLoggedIn && id) {
      loadConversation()
    }
  }, [router, isLoggedIn, loading, id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversation = async () => {
    setIsLoading(true)
    try {
      console.log('📚 [DEBUG] Loading conversation for id:', id)
      const data = await api.getConversation(id)
      console.log('📚 [DEBUG] Loaded conversation:', {
        sessionId: id,
        messageCount: data.messages?.length || 0,
        messages: data.messages
      })
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages)
      } else {
        // For new conversations, set welcome message
        setMessages([{ role: 'assistant', content: "Hi, welcome to your consultation. This should take about 15 minutes to complete as I need important information. Are you ready to start?" }])
      }
      
      // Set conversation details
      setConversation({ sessionId: id, title: 'Conversation', isCompleted: data.isCompleted || false })
    } catch (error) {
      console.error('❌ [DEBUG] Error loading conversation:', error)
      setMessages([
        { role: 'assistant', content: 'Welcome back to your conversation!' },
        { role: 'user', content: 'Error loading conversation' },
        { role: 'assistant', content: 'Sorry, we couldn\'t load the conversation history. Please try again.' }
      ])
      setConversation({ sessionId: id, title: 'Conversation', isCompleted: false })
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading || !conversation) return

    const userMessage = { role: 'user', content: inputMessage }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage('')
    setIsLoading(true)

    console.log('📤 [DEBUG] Frontend sending message:', {
      message: inputMessage,
      sessionId: conversation.sessionId,
      conversationLength: newMessages.length
    })

    // Ensure loading shows for at least 2 seconds
    const startTime = Date.now()

    try {
      const data = await api.sendChatMessage(inputMessage, newMessages, conversation.sessionId)

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

        if (data.isFinal) {
          // Mark conversation as completed
          setConversation(prev => ({ ...prev, isCompleted: true }))
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
    if (!conversation || messages.length === 0) return

    setIsSavingDraft(true)
    try {
      console.log('💾 [DEBUG] Saving draft:', {
        sessionId: conversation.sessionId,
        messageCount: messages.length,
        title: conversation.title
      })

      await api.saveDraft(
        conversation.sessionId,
        messages,
        conversation.title,
        conversation.offenseType
      )

      toast.success('Draft saved successfully!')
    } catch (error) {
      console.error('❌ [DEBUG] Error saving draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  if (!conversation) {
    return (
      <Layout title="Chat - Harmonia-AI" description="Your chat conversation">
        <div className="h-full min-h-0 flex-1 flex flex-col bg-gray-50">
          <div className="w-full px-6 lg:px-8 flex-1 flex justify-center min-h-0">
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Chat - Harmonia-AI"
      description="Your chat conversation"
    >
      <div className="h-full min-h-0 flex-1 flex flex-col bg-gray-50">
        <div className="w-full px-6 lg:px-8 flex-1 flex justify-center min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className='bg-blue-600 border-b border-blue-700 text-white px-6 py-2 flex gap-4 items-center'>
              <button
                onClick={() => router.push('/chat')}
                className="flex items-center gap-2 text-blue-100 hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to Conversations
              </button>
              <div className="">
                <h1 className="text-xl font-semibold">{conversation.title || 'Conversation'}</h1>
                <p className="text-blue-100 text-sm">
                  {conversation.isCompleted ? 'Completed' : 'In Progress'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <p>Loading conversation...</p>
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
              <form onSubmit={sendMessage} className="flex space-x-4 items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your response here..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading || isInitialLoading}
                />
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={isSavingDraft || messages.length === 0 || conversation?.isCompleted}
                  className={`p-2 h-fit rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                    conversation?.isCompleted 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  title={conversation?.isCompleted ? "Conversation completed - no need to save draft" : "Save Draft"}
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isInitialLoading || !inputMessage.trim()}
                  className="p-2 h-fit rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}