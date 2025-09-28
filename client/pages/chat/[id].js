import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import Layout from '../../components/Layout'
import api from '../../lib/api'
import { MessageCircle, Bot, User, Save, Send, ArrowLeft, Plus, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ChatSidebar from '../../components/ChatSidebar'

export default function Chat() {
    const [conversation, setConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(false)
    const [isSavingDraft, setIsSavingDraft] = useState(false)
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
    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelectConversation = (conversationId) => {
        if (conversationId !== id) {
            router.push('/chat/' + conversationId)
        }
    }

    const handleNewConversation = async () => {
        // Check if there's already a blank conversation that hasn't been started
        const blankConversation = conversations.find(conv =>
            conv.title === 'New Conversation' &&
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
                router.push('/chat/' + data.sessionId)
            }
        } catch (error) { }
    }

    const handleDeleteConversation = async (conversationId, isSessionChat) => {
        try {
            if (isSessionChat) {
                // Permanent delete for session chats
                await api.deleteConversation(conversationId)
            } else {
                // Soft delete for database chats
                await api.softDeleteConversation(conversationId)
            }
            setConversations(prev => prev.filter(conv => conv.sessionId !== conversationId))
            if (conversationId === id) {
                router.push('/chat')
            }
            toast.success(isSessionChat ? 'Conversation permanently deleted' : 'Conversation soft deleted')
        } catch (error) {
            console.error('Error deleting conversation:', error)
            toast.error('Failed to delete conversation')
        }
    }

    const handleDeleteSelectedConversations = async (selectedIds, sessionChatIds, dbChatIds) => {
        try {
            // Permanent delete session chats
            const sessionPromises = sessionChatIds.map(id => api.deleteConversation(id))
            // Soft delete database chats
            const dbPromises = dbChatIds.map(id => api.softDeleteConversation(id))
            
            await Promise.all([...sessionPromises, ...dbPromises])
            
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

    // WhatsApp-style: show sidebar and chat area side by side on desktop, stacked on mobile
    if (!conversation) {
        return (
            <Layout title="Chat - Harmonia-AI" description="Your chat conversation">
                <div className="h-full min-h-0 flex-1 flex flex-row bg-[#111b21]">
                    {/* Sidebar */}
                    <div className="hidden md:flex w-[380px] max-w-full flex-col min-h-0 bg-[#202c33] border-r border-[#222d34]">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222d34] bg-[#202c33]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center text-white font-bold text-lg">U</div>
                                <span className="text-white font-semibold text-lg">Chats</span>
                            </div>
                            <button
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25d366] hover:bg-[#1fa855] transition-colors"
                                title="New Chat"
                                disabled
                            >
                                <Plus className="h-5 w-5 text-white" />
                            </button>
                        </div>
                        <div className="px-4 py-2 bg-[#111b21] border-b border-[#222d34]">
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-3 text-[#667781]" />
                                <input
                                    type="text"
                                    placeholder="Search or start new chat"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#2a3942] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#25d366] placeholder-[#667781]"
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-[#111b21] flex items-center justify-center">
                            <LoadingSpinner size="lg" />
                        </div>
                    </div>
                    {/* Main area */}
                    <div className="flex-1 flex flex-col min-h-0 bg-[#222d34]">
                        <div className="flex-1 flex items-center justify-center">
                            <LoadingSpinner size="lg" />
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Chat - Harmonia-AI" description="Your chat conversation">
            <div className="h-full flex min-h-0 flex-1 flex-row bg-[#0f2b2fcc]">
                {/* Sidebar (desktop only) */}
                <div className="hidden md:flex">
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
                            onClick={() => router.push('/chat')}
                            className="md:hidden flex items-center gap-2 text-[#73cfd0] hover:text-[#0f2b2fcc]"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#73cfd0] flex items-center justify-center text-black font-bold text-lg">{conversation?.title?.charAt(0)?.toUpperCase() || 'C'}</div>
                        <div className="flex flex-col">
                            <span className="text-black font-semibold text-lg">{conversation?.title || 'Conversation'}</span>
                            <span className="text-[#73cfd0] text-xs">{conversation?.isCompleted ? 'Completed' : 'In Progress'}</span>
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
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end`}
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
                                            : 'bg-[#0f2b2fcc] text-black rounded-bl-md'
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
                            <div className="flex justify-start items-end space-x-2">
                                <div className="flex-shrink-0 mb-1">
                                    <div className="w-8 h-8 bg-[#25d366] rounded-full flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div className="bg-[#0f2b2fcc] text-black px-4 py-2 rounded-2xl shadow">
                                    <div className="flex items-center space-x-2">
                                        <LoadingSpinner size="sm" color="gray" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isInitialLoading && (
                            <div className="flex justify-start items-end space-x-2">
                                <div className="flex-shrink-0 mb-1">
                                    <div className="w-8 h-8 bg-[#25d366] rounded-full flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div className="bg-[#0f2b2fcc] text-black px-4 py-2 rounded-2xl shadow">
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
                    <div className="border-t border-[#73cfd0] bg-[#0f2b2fcc] px-4 py-3 sticky bottom-0 z-10">
                        <form onSubmit={sendMessage} className="flex space-x-3 items-center">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type a message"
                                className="flex-1 px-4 py-2 rounded-2xl bg-[#0f2b2fcc] text-black border-none focus:outline-none focus:ring-2 focus:ring-[#73cfd0] placeholder-[#73cfd0]"
                                disabled={isLoading || isInitialLoading}
                            />
                            <button
                                type="button"
                                onClick={saveDraft}
                                disabled={isSavingDraft || messages.length === 0 || conversation?.isCompleted}
                                className={`p-2 h-fit rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${conversation?.isCompleted
                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                        : 'bg-[#73cfd0] text-black hover:bg-[#0f2b2fcc]'
                                    }`}
                                title={conversation?.isCompleted ? "Conversation completed - no need to save draft" : "Save Draft"}
                            >
                                <Save className="h-4 w-4" />
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || isInitialLoading || !inputMessage.trim()}
                                className="p-2 h-fit rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center bg-[#73cfd0] hover:bg-[#0f2b2fcc] text-black"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    )
}