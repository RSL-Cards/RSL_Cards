'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Trash2, Maximize2, Minimize2, RefreshCw, DollarSign, Package, TrendingUp, Search } from 'lucide-react'
import { apiClient } from '@/lib/axios'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: string
}

const SUGGESTIONS = [
  { text: 'What is my inventory summary & valuation?', icon: Package, label: 'Inventory Summary' },
  { text: 'How much net profit did I earn this month?', icon: DollarSign, label: 'Monthly Profit' },
  { text: 'Show me my aging inventory sitting over 60 days', icon: TrendingUp, label: 'Aging Alerts' },
  { text: 'Check market comps for 2018 Prizm Luka PSA 10', icon: Search, label: 'Card Comps' },
  { text: 'Which sales channel has the highest revenue?', icon: Sparkles, label: 'Channel Stats' },
]

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'model',
      text: "👋 Hi! I'm your **RSL Assistant**. I have live access to your inventory, transactions, sales analytics, and live market comps.\n\nHow can I assist your business today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('RSL Assistant is thinking...')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isLoading])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLoading) {
      setStatusMessage('Analyzing query & checking RSL tools...')
      timer = setTimeout(() => {
        setStatusMessage('Checking dealer database & market comps...')
      }, 1500)
    }
    return () => clearTimeout(timer)
  }, [isLoading])

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'model',
        text: "✨ Chat cleared! Ask me anything about your inventory, transactions, or card comps.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const handleSend = async (textToSubmit: string = inputText) => {
    if (!textToSubmit.trim() || isLoading) return

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: textToSubmit.trim(), timestamp: timeStr }
    
    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const history = messages
        .filter((m) => m.id !== '0')
        .slice(-8)
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }))

      const res = await apiClient.post('/v1/assistant/chat', {
        message: textToSubmit.trim(),
        history,
      })

      const aiResponseText = res.data?.data?.response || res.data?.response || "I didn't quite catch that."
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } catch (e: any) {
      console.error('Assistant Error:', e.response?.data || e.message)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: '⚠️ **Connection Notice:** I had trouble connecting to the live dealer database right now. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Helper to render basic markdown formatting (bold, newlines, bullet points)
  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold text `**text**` formatting
      const parts = line.split(/(\*\*.*?\*\*)/g)
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>
        }
        return part
      })

      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim())
      return (
        <div key={idx} className={`${isBullet ? 'pl-3 my-1 border-l-2 border-indigo-400/60' : 'my-1'} leading-relaxed`}>
          {formattedLine}
        </div>
      )
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`mb-4 flex flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-2xl transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
              isExpanded ? 'h-[740px] w-[520px]' : 'h-[620px] w-[400px]'
            } max-h-[calc(100vh-100px)] max-w-[calc(100vw-32px)]`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base tracking-tight text-white">RSL Assistant</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Online" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear Conversation"
                  className="rounded-xl p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Restore Size' : 'Expand Chat'}
                  className="rounded-xl p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white hidden sm:block"
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Widget"
                  className="rounded-xl p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-gray-100/30 p-5 dark:from-gray-950 dark:to-gray-900">
              {messages.length <= 2 && (
                <div className="mb-6">
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Recommended Questions & Tools
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((sug, i) => {
                      const IconComponent = sug.icon
                      return (
                        <button
                          key={i}
                          onClick={() => handleSend(sug.text)}
                          className="group flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white/80 p-3 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-sm dark:border-gray-800 dark:bg-gray-800/80 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/20"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors dark:bg-indigo-950 dark:text-indigo-400">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="block text-xs font-semibold text-gray-800 dark:text-gray-200">{sug.label}</span>
                              <span className="line-clamp-1 text-[11px] text-gray-500 dark:text-gray-400">{sug.text}</span>
                            </div>
                          </div>
                          <span className="text-gray-300 group-hover:text-indigo-500 transition-colors">→</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`flex w-full max-w-[88%] gap-2.5 ${
                      item.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                        item.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-indigo-600 dark:bg-gray-800 dark:border-gray-700 dark:text-indigo-400'
                      }`}
                    >
                      {item.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col gap-1 max-w-full">
                      <div
                        className={`rounded-3xl px-4 py-3 text-sm shadow-sm transition-all ${
                          item.role === 'user'
                            ? 'rounded-tr-xs bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-medium'
                            : 'rounded-tl-xs bg-white text-gray-800 border border-gray-200/80 dark:bg-gray-800 dark:border-gray-700/80 dark:text-gray-200'
                        }`}
                      >
                        {formatText(item.text)}
                      </div>
                      <span
                        className={`text-[10px] text-gray-400 px-1 ${
                          item.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="mr-auto flex w-full max-w-[88%] flex-row gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white border border-gray-200 text-indigo-600 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-indigo-400">
                      <Bot className="h-4 w-4 animate-spin text-indigo-600" />
                    </div>
                    <div className="flex flex-col gap-1.5 rounded-3xl rounded-tl-xs border border-gray-300 bg-gray-100 px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{statusMessage}</span>
                      </div>
                      <div className="flex items-center gap-1.5 pl-5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 dark:bg-indigo-400 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 dark:bg-indigo-400 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 py-1.5 pl-4 pr-1.5 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all dark:border-gray-700 dark:bg-gray-800/80 dark:focus-within:bg-gray-800">
                <input
                  type="text"
                  placeholder="Ask about cards, stock, transactions, profits..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:hover:scale-100"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-gray-400 dark:text-gray-500">
                <span>Powered by RSL Intelligence + Dealer DB</span>
                <span>Press Enter ↵</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Toggle Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="group relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl transition-all duration-300 hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
        >
          <MessageSquare className="h-7 w-7 transition-transform group-hover:-translate-y-0.5 group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white dark:ring-gray-950">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          </span>
        </motion.button>
      )}
    </div>
  )
}
