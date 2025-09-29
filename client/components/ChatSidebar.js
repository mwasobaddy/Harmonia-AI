
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Plus, Search, Trash2, CheckSquare, Square } from 'lucide-react';
import Modal from './Modal';
import gsap from 'gsap';

export default function ChatSidebar({
  conversations = [],
  onSelectConversation,
  selectedId,
  onNewConversation,
  searchTerm,
  setSearchTerm,
  loading,
  selectedConversations = new Set(),
  setSelectedConversations,
  isSelectionMode = false,
  setIsSelectionMode,
  onDeleteConversation,
  onDeleteSelectedConversations
}) {
  const router = useRouter();
  const [modalState, setModalState] = useState({
    isOpen: false,
    icon: null,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
    iconColor: 'text-blue-500',
    titleColor: 'text-gray-900',
    confirmButtonColor: 'bg-blue-500 hover:bg-blue-600'
  });
  // Sidebar animation ref
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

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
      onSelectConversation(conversationId)
    }
  }



  // Generate a concise title from a user message (same as chat page)
  const generateTitleFromMessage = (message) => {
    if (!message || message.length === 0) return 'Starting consultation...'

    let cleanMessage = message.trim()
    cleanMessage = cleanMessage.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '')

    if (cleanMessage.length <= 3) return cleanMessage || 'Starting consultation...'

    let title = cleanMessage.substring(0, 25)
    const lastSpace = title.lastIndexOf(' ')
    if (lastSpace > 10) {
      title = title.substring(0, lastSpace)
    }

    title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()

    if (title.length < cleanMessage.length) {
      title += '...'
    }

    return title || 'Starting consultation...'
  }

  // Get the display title for a conversation, using the second user message if needed
  const getDisplayTitle = (conversation) => {
    // For session-based chats (not drafts), always use the second user message
    if (conversation.type !== 'draft') {
      // If conversation.messages exists and has at least 2 user messages, use the second one
      if (Array.isArray(conversation.messages)) {
        const userMessages = conversation.messages.filter(msg => msg.role === 'user');
        if (userMessages.length >= 2) {
          return generateTitleFromMessage(userMessages[1].content);
        }
      }
      // fallback
      return 'Starting consultation...';
    }
    // For drafts, use the existing title logic
    const genericTitles = ['Starting consultation...', '', null, undefined];
    if (genericTitles.includes(conversation.title)) {
      // If conversation.messages exists and has at least 2 user messages, use the second one
      if (Array.isArray(conversation.messages)) {
        const userMessages = conversation.messages.filter(msg => msg.role === 'user');
        if (userMessages.length >= 2) {
          return generateTitleFromMessage(userMessages[1].content);
        }
      }
      // fallback
      return 'Starting consultation...';
    }
    return generateTitleFromMessage(conversation.title);
  }

  const handleDeleteConversation = async (conversation) => {
    const confirmAction = async () => {
      await onDeleteConversation(conversation.sessionId)
    }

    setModalState({
      isOpen: true,
      icon: Trash2,
      title: isSessionChat ? 'Permanently Delete Chat' : 'Soft Delete Chat',
      message: isSessionChat 
        ? `Are you sure you want to permanently delete "${conversation.title}"? This action cannot be undone.`
        : `Are you sure you want to soft delete "${conversation.title}"? It will be marked as deleted but can be recovered.`,
      confirmText: 'Delete',
      onConfirm: confirmAction,
      iconColor: 'text-red-500',
      titleColor: 'text-red-500',
      confirmButtonColor: 'bg-red-500 hover:bg-red-600'
    })
  }

  const handleDeleteSelected = async () => {
    const selectedCount = selectedConversations.size
    if (selectedCount === 0) return

    const confirmAction = async () => {
      await onDeleteSelectedConversations(Array.from(selectedConversations))
      setSelectedConversations(new Set())
      setIsSelectionMode(false)
    }

    setModalState({
      isOpen: true,
      icon: Trash2,
      title: 'Delete Selected Chats',
      message: `Are you sure you want to delete ${selectedCount} conversation(s)? This action cannot be undone for session chats and will mark database chats as deleted.`,
      confirmText: 'Delete All',
      onConfirm: confirmAction,
      iconColor: 'text-red-500',
      titleColor: 'text-red-500',
      confirmButtonColor: 'bg-red-500 hover:bg-red-600'
    })
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedConversations(new Set())
  }
  return (
    <div
      ref={sidebarRef}
      className="w-full md:w-[380px] max-w-full md:max-w-[380px] flex flex-col min-h-0 bg-gradient-to-b from-[#0f2b2fcc] to-[#1a2332] border-r border-[#222d34] flex-1 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#222d34] bg-[#202c33]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25d366] to-[#73cfd0] flex items-center justify-center text-white font-bold text-lg shadow-md">
            U
          </div>
          <Link href="/chat" className="text-white font-semibold text-lg tracking-wide">Chats</Link>
        </div>
        <div className="flex items-center gap-2">
          {isSelectionMode && selectedConversations.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow"
              title="Delete Selected"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          )}
          <button
            onClick={toggleSelectionMode}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors shadow ${
              isSelectionMode ? 'bg-[#25d366] hover:bg-[#1fa855]' : 'bg-gray-500 hover:bg-gray-600'
            }`}
            title={isSelectionMode ? "Exit Selection Mode" : "Enter Selection Mode"}
          >
            {isSelectionMode ? <Square className="h-4 w-4 text-white" /> : <CheckSquare className="h-4 w-4 text-white" />}
          </button>
          <button
            onClick={onNewConversation}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-[#25d366] to-[#73cfd0] hover:from-[#73cfd0] hover:to-[#25d366] transition-colors shadow"
            title="New Chat"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
      {/* Search */}
      <div className="px-4 py-3 bg-[#0f2b2fcc] border-b border-[#222d34]">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#667781]" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#2a3942] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#25d366] placeholder-[#667781] shadow"
          />
        </div>
      </div>
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-[#0f2b2fcc] custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-[#667781]">Loading...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-[#667781]">
            <p>No conversations yet</p>
            <button
              onClick={onNewConversation}
              className="mt-2 text-[#25d366] hover:text-[#1fa855] font-medium"
            >
              Start your first conversation
            </button>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.sessionId}
              className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#222d34] transition-colors ${
                selectedId === conversation.sessionId ? 'bg-[#202c33] shadow-inner' : 'hover:bg-[#222d34]'
              }`}
            >
              {isSelectionMode && (
                <input
                  type="checkbox"
                  checked={selectedConversations.has(conversation.sessionId)}
                  onChange={() => handleSelectConversation(conversation.sessionId)}
                  className="w-4 h-4 text-[#25d366] bg-[#2a3942] border-[#667781] rounded focus:ring-[#25d366]"
                />
              )}
              <div
                className="flex-1 flex items-center gap-3"
                onClick={() => !isSelectionMode && onSelectConversation(conversation.sessionId)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25d366] to-[#73cfd0] flex items-center justify-center text-white font-bold text-lg shadow">
                  {getDisplayTitle(conversation)?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white truncate tracking-wide">{getDisplayTitle(conversation)}</h3>
                  <p className="text-xs text-[#667781] mt-1">
                    {conversation.messageCount} messages
                    {conversation.type === 'draft' && ' • Draft'}
                    {conversation.isCompleted && conversation.type !== 'draft' && ' • Completed'}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  conversation.type === 'draft' ? 'bg-yellow-500' :
                  conversation.isCompleted ? 'bg-green-500' : 'bg-[#25d366]'
                }`} />
              </div>
              {!isSelectionMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conversation);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-600 hover:bg-red-500 transition-colors shadow"
                  title="Delete Conversation"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        icon={modalState.icon}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        onConfirm={modalState.onConfirm}
        iconColor={modalState.iconColor}
        titleColor={modalState.titleColor}
        confirmButtonColor={modalState.confirmButtonColor}
      />
    </div>
  )
}
