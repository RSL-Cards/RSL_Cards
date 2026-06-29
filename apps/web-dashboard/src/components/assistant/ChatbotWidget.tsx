'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/axios'

interface Message {
  id: string
  role: 'user' | 'model'
  text: string
}

const SUGGESTIONS = [
  'What is my inventory worth?',
  'How much did I sell last month?',
  'What are recent comps for Prizm Silver Luka?',
  'Should I lower prices on my active slabs?',
]

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'model', text: "Hi! I'm RSL Assistant. Ask me about your inventory, recent sales, or card comps." },
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isLoading])

  const handleSend = async (textToSubmit: string = inputText) => {
    if (!textToSubmit.trim() || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: textToSubmit.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      // Build history for backend, keeping last 5 messages
      const history = messages
        .slice(-5)
        .filter((m) => m.id !== '0')
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }))

      const res = await apiClient.post('/v1/assistant/chat', {
        message: textToSubmit.trim(),
        history,
      })

      const aiResponseText = res.data?.data?.response || res.data?.response || "I didn't quite catch that."
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'model', text: aiResponseText }])
    } catch (e: any) {
      console.error('Assistant Error:', e.response?.data || e.message)
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: 'Sorry, I had trouble processing that request right now.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[600px] max-h-[calc(100vh-120px)] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-blue-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold leading-none">RSL Assistant</h3>
                <p className="mt-1 text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
            {messages.length === 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-left text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex w-full max-w-[85%] gap-2 ${
                    item.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      item.role === 'user' ? 'bg-gray-200' : 'bg-blue-100'
                    }`}
                  >
                    {item.role === 'user' ? (
                      <User className="h-3.5 w-3.5 text-gray-600" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-blue-600" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      item.role === 'user'
                        ? 'rounded-tr-sm bg-blue-600 text-white'
                        : 'rounded-tl-sm bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="mr-auto flex w-full max-w-[85%] flex-row gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Bot className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 py-1 pl-4 pr-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <input
                type="text"
                placeholder="Ask anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        >
          <MessageSquare className="h-6 w-6 transition-transform group-hover:-translate-y-0.5 group-hover:scale-110" />
        </button>
      )}
    </div>
  )
}
