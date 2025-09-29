import { useState, useRef, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import Layout from '../../components/Layout'
import api from '../../lib/api'
import { MessageCircle, Bot, User, Save, Send, ArrowLeft, Plus, Search, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ChatSidebar from '../../components/ChatSidebar'

export default function Chat() {
    const [conversation, setConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(false)
    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const [autoSaveStatus, setAutoSaveStatus] = useState('') // New state for auto-save feedback
    const [conversations, setConversations] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoadingConversations, setIsLoadingConversations] = useState(true)
    const [selectedConversations, setSelectedConversations] = useState(new Set())
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const messagesEndRef = useRef(null)
    const router = useRouter()
    const { id } = router.query
    const { isLoggedIn, loading } = useAuth()
    // Fetch all conversations for sidebar
    useEffect(() => {
        if (!loading && isLoggedIn) {
            loadConversations()
        }
        // eslint-disable-next-line
    }, [isLoggedIn, loading])

    const loadConversations = async () => {
        setIsLoadingConversations(true)
        try {
            const data = await api.getConversations()
            setConversations(data.conversations || [])
        } catch (error) {
            setConversations([])
        } finally {
            setIsLoadingConversations(false)
        }
    }
    const filteredConversations = useMemo(() => {
        return conversations.filter(conv =>
            conv.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [conversations, searchTerm])

    // Generate a concise title from a user message
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

    const handleSelectConversation = (conversationId) => {
        if (conversationId !== id) {
            router.push('/chat/' + conversationId)
        }
    }

    const handleNewConversation = async () => {
        // Check if there's already a blank conversation that hasn't been started
        const blankConversation = conversations.find(conv =>
            conv.title === 'Starting consultation...' &&
            conv.messageCount <= 1 &&
            !conv.isCompleted
        )
        if (blankConversation) {
            router.push('/chat/' + blankConversation.sessionId)
            return
        }
        try {
            const data = await api.initChat()
            if (data.sessionId) {
                // Add the new conversation to the list immediately
                const newConversation = {
                    sessionId: data.sessionId,
                    title: 'Starting consultation...',
                    messageCount: 0,
                    type: 'draft',
                    isCompleted: false
                }
                setConversations(prev => [newConversation, ...prev])
                router.push('/chat/' + data.sessionId)
            }
        } catch (error) { }
    }

    const handleDeleteConversation = async (conversationId) => {
        try {
            const response = await api.deleteConversation(conversationId)
            const isPermanentDelete = response.type === 'session'
            setConversations(prev => prev.filter(conv => conv.sessionId !== conversationId))
            if (conversationId === id) {
                router.push('/chat')
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
            
            if (selectedIds.includes(id)) {
                router.push('/chat')
            }
            
            toast.success(`${selectedIds.length} conversation(s) deleted successfully`)
        } catch (error) {
            console.error('Error deleting conversations:', error)
            toast.error('Failed to delete selected conversations')
        }
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

        if (isLoggedIn && id) {
            loadConversation()
        }
    }, [router, isLoggedIn, loading, id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadConversation = async () => {
        // Reset loading states to prevent interference from previous conversations
        setIsLoading(true)
        setIsInitialLoading(false)
        setMessages([])
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

                // Check if we need to generate a title from existing messages
                const userMessages = data.messages.filter(msg => msg.role === 'user')
                if (userMessages.length >= 2 && (!data.title || data.title === 'Starting consultation...')) {
                    const secondUserMessage = userMessages[1].content
                    const generatedTitle = generateTitleFromMessage(secondUserMessage)

                    // Update conversation title in the conversations list
                    setConversations(prev => prev.map(conv =>
                        conv.sessionId === id
                            ? { ...conv, title: generatedTitle }
                            : conv
                    ))
                }
            } else {
                // For new conversations, show thinking state first
                setIsInitialLoading(true)
                setTimeout(() => {
                    setMessages([{ role: 'assistant', content: "Hi, welcome to your consultation. This should take about 15 minutes to complete as I need important information. Are you ready to start?" }])
                    setIsInitialLoading(false)
                }, 1000)
            }

            // Set conversation details
            const userMessages = data.messages ? data.messages.filter(msg => msg.role === 'user') : []
            const finalTitle = data.title && data.title !== 'Starting consultation...'
                ? data.title
                : (userMessages.length >= 2 ? generateTitleFromMessage(userMessages[1].content) : 'Starting consultation...')
            setConversation({ sessionId: id, title: finalTitle, isCompleted: data.isCompleted || false })
        } catch (error) {
            console.error('❌ [DEBUG] Error loading conversation:', error)
            setMessages([
                { role: 'assistant', content: 'Welcome back to your conversation!' },
                { role: 'user', content: 'Error loading conversation' },
                { role: 'assistant', content: 'Sorry, we couldn\'t load the conversation history. Please try again.' }
            ])
            setConversation({ sessionId: id, title: 'Starting consultation...', isCompleted: false })
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

        // Check if this is the second user message to generate a title
        const userMessageCount = newMessages.filter(msg => msg.role === 'user').length
        if (userMessageCount === 2) {
            const newTitle = generateTitleFromMessage(inputMessage)
            // Update conversation title in the conversations list
            setConversations(prev => prev.map(conv =>
                conv.sessionId === conversation.sessionId
                    ? { ...conv, title: newTitle }
                    : conv
            ))
            // Update local conversation state
            setConversation(prev => ({ ...prev, title: newTitle }))

            // Auto-save when title is generated (second message)
            setAutoSaveStatus('Auto-saving conversation...')
            saveDraft().then(() => {
                setAutoSaveStatus('Conversation saved automatically')
                setTimeout(() => setAutoSaveStatus(''), 3000)
            }).catch(() => {
                setAutoSaveStatus('Auto-save failed')
                setTimeout(() => setAutoSaveStatus(''), 3000)
            })
        }

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

                // Refresh conversations list to update sidebar with new message count and status
                loadConversations()

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
                null, // Let backend generate title from second user message
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

    // WhatsApp-style: show sidebar and chat area side by side on desktop, stacked on mobile
    if (!conversation) {
        return (
            <Layout title="Chat - Harmonia-AI" description="Your chat conversation">
                <div className="h-full min-h-0 flex-1 flex flex-row bg-[#111b21]">
                    {/* Sidebar */}
                    <div className="w-full md:w-[380px] max-w-full md:max-w-[380px] flex flex-col min-h-0 bg-[#0f2b2fcc] border-r border-[#222d34] flex-1">
                        <ChatSidebar
                            conversations={filteredConversations}
                            onSelectConversation={handleSelectConversation}
                            selectedId={id}
                            onNewConversation={handleNewConversation}
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
                    {/* Main area - hidden on mobile when no conversation */}
                    <div className="hidden md:flex flex-1 flex flex-col min-h-0 bg-[#222d34]">
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-white">
                                <h2 className="text-2xl font-bold mb-4">Welcome to Harmonia-AI</h2>
                                <p className="text-gray-300 mb-6">Select a conversation from the sidebar to get started</p>
                                <button
                                    onClick={handleNewConversation}
                                    className="px-6 py-3 bg-[#25d366] hover:bg-[#1fa855] text-white rounded-lg font-medium transition-colors"
                                >
                                    Start New Conversation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Chat - Harmonia-AI" description="Your chat conversation">
            <div className="h-full flex min-h-0 flex-1 flex-row bg-[#0f2b2fcc]">
                {/* Sidebar (desktop always visible, mobile toggleable) */}
                <div className={`hidden md:flex md:relative absolute inset-y-0 left-0 z-20`}>
                    <ChatSidebar
                        conversations={filteredConversations}
                        onSelectConversation={handleSelectConversation}
                        selectedId={id}
                        onNewConversation={handleNewConversation}
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
                {/* Main chat area */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#0f2b2fcc]">
                    {/* Chat header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#73cfd0] bg-[#0f2b2fcc] sticky top-0 z-10">
                        <button
                            className="hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#2a4a5a] hover:bg-[#73cfd0] transition-colors"
                            title="Toggle Sidebar"
                        >
                            <Menu className="h-4 w-4 text-[#73cfd0] hover:text-black" />
                        </button>
                        <button
                            onClick={() => router.push('/chat')}
                            className="md:hidden flex items-center gap-2 text-[#73cfd0] hover:text-[#0f2b2fcc]"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#73cfd0] flex items-center justify-center text-black font-bold text-lg">{conversation?.title?.charAt(0)?.toUpperCase() || 'C'}</div>
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-lg">{conversation?.title || 'Starting consultation...'}</span>
                            <span className="text-[#73cfd0] text-xs">{conversation?.isCompleted ? 'Completed' : 'In Progress'}</span>
                            {autoSaveStatus && (
                                <span className={`text-xs mt-1 ${autoSaveStatus.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>
                                    {autoSaveStatus}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#0f2b2fcc]">
                        {messages.length === 0 && (
                            <div className="text-center text-[#667781] mt-8">
                                <p>Loading conversation...</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex space-x-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex-shrink-0 mb-1">
                                        <div className="w-8 h-8 bg-[#25d366] rounded-full flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-base break-words ${message.role === 'user'
                                            ? 'bg-[#73cfd0] text-black rounded-br-md'
                                            : 'bg-[#2a4a5a] text-white rounded-bl-md'
                                        }`}
                                >
                                    <p>{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <div className="flex-shrink-0 mb-1">
                                        <div className="w-8 h-8 bg-[#25d366] rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start items-start space-x-4">
                                <div className="flex-shrink-0 mb-1">
                                    <div className="w-8 h-8 bg-[#25d366] rounded-full flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div className="bg-[#2a4a5a] text-white px-4 py-2 rounded-2xl shadow">
                                    <div className="flex items-center space-x-2">
                                        <LoadingSpinner size="sm" color="white" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isInitialLoading && (
                            <div className="flex justify-start items-start space-x-4">
                                <div className="flex-shrink-0 mb-1">
                                    <div className="w-8 h-8 bg-[#25d366] rounded-full flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div className="bg-[#2a4a5a] text-white px-4 py-2 rounded-2xl shadow">
                                    <div className="flex items-center space-x-2">
                                        <LoadingSpinner size="sm" color="white" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {/* Input Form */}
                    <div className="border-t border-[#73cfd0] bg-[#0f2b2fcc] px-4 py-4 sticky bottom-0 z-10 shadow-lg">
                        <form onSubmit={sendMessage} className="flex space-x-3 items-center">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="w-full px-4 py-3 pr-12 rounded-2xl bg-[#1a3a4a] text-white border-2 border-[#73cfd0]/30 focus:outline-none focus:border-[#73cfd0] focus:ring-2 focus:ring-[#73cfd0]/20 placeholder-[#73cfd0]/70 transition-all duration-200 shadow-md"
                                    disabled={isLoading || isInitialLoading}
                                />
                                {inputMessage.trim() && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#73cfd0] text-sm opacity-70">
                                        Press Enter to send
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={saveDraft}
                                disabled={isSavingDraft || messages.length === 0 || conversation?.isCompleted}
                                className={`p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-md ${
                                    conversation?.isCompleted
                                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                        : 'bg-[#2a4a5a] text-[#73cfd0] hover:bg-[#73cfd0] hover:text-black hover:shadow-lg hover:scale-105'
                                }`}
                                title={conversation?.isCompleted ? "Conversation completed - no need to save draft" : "Save Draft"}
                            >
                                <Save className={`h-5 w-5 ${isSavingDraft ? 'animate-pulse' : ''}`} />
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || isInitialLoading || !inputMessage.trim()}
                                className="p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-[#73cfd0] hover:bg-[#5ba8a0] text-black transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    )
}