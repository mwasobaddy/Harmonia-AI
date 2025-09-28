import { useRouter } from 'next/router'
import { Plus, Search } from 'lucide-react'

export default function ChatSidebar({ conversations = [], onSelectConversation, selectedId, onNewConversation, searchTerm, setSearchTerm, loading }) {
  const router = useRouter()
  return (
    <div className="w-full md:w-[380px] max-w-full md:max-w-[380px] flex flex-col min-h-0 bg-[#202c33] border-r border-[#222d34]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222d34] bg-[#202c33]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center text-white font-bold text-lg">U</div>
          <span className="text-white font-semibold text-lg">Chats</span>
        </div>
        <button
          onClick={onNewConversation}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25d366] hover:bg-[#1fa855] transition-colors"
          title="New Chat"
        >
          <Plus className="h-5 w-5 text-white" />
        </button>
      </div>
      {/* Search */}
      <div className="px-4 py-2 bg-[#111b21] border-b border-[#222d34]">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#667781]" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#2a3942] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#25d366] placeholder-[#667781]"
          />
        </div>
      </div>
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-[#111b21]">
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
              onClick={() => onSelectConversation(conversation.sessionId)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#222d34] transition-colors ${
                selectedId === conversation.sessionId ? 'bg-[#202c33]' : 'hover:bg-[#222d34]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center text-white font-bold text-lg">
                {conversation.title?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-white truncate">{conversation.title}</h3>
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
          ))
        )}
      </div>
    </div>
  )
}
