"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, UIMessage } from "ai"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, User, Bot, Loader2, ArrowLeft } from "lucide-react"

type Waifu = 'miku' | 'rem' | 'reze' | null;

const WAIFU_INFO = {
  miku: {
    name: "Miku Nakano",
    theme: "text-indigo-400",
    bg: "bg-indigo-500",
    bgHover: "hover:bg-indigo-600",
    img: "/miku.jpg",
    greeting: "He estado esperando, tutor. ¿Hay algún anime que quieras que te recomiende hoy?"
  },
  rem: {
    name: "Rem",
    theme: "text-blue-400",
    bg: "bg-blue-500",
    bgHover: "hover:bg-blue-600",
    img: "/rem.jpg",
    greeting: "¿En qué puedo ayudarte hoy? Estoy lista para recomendarte el mejor anime."
  },
  reze: {
    name: "Reze",
    theme: "text-violet-400",
    bg: "bg-violet-600",
    bgHover: "hover:bg-violet-700",
    img: "/reze.jpg",
    greeting: "Hola. ¿Buscando algo para ver? Vamos a ver qué encuentro para ti."
  }
}

export function MikuChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedWaifu, setSelectedWaifu] = useState<Waifu>(null)

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 overflow-hidden ring-2 ring-indigo-300 ring-offset-2 ring-offset-background"
            style={{ backgroundImage: 'linear-gradient(to bottom right, #6366f1, #3b82f6)' }}
          >
            {!selectedWaifu && (
               <MessageCircle className="w-7 h-7" />
            )}
            {selectedWaifu && (
              <>
                 <img src={WAIFU_INFO[selectedWaifu].img} alt={WAIFU_INFO[selectedWaifu].name} className="w-full h-full object-cover fallback:opacity-0" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
                 <MessageCircle className="w-7 h-7 hidden" />
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
             {!selectedWaifu ? (
                <WaifuSelector onSelect={setSelectedWaifu} onClose={() => setIsOpen(false)} />
             ) : (
                <ChatEngine waifu={selectedWaifu!} onBack={() => setSelectedWaifu(null)} onClose={() => setIsOpen(false)} />
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function WaifuSelector({ onSelect, onClose }: { onSelect: (w: Waifu) => void, onClose: () => void }) {
  return (
     <div className="flex flex-col h-full bg-background relative">
        <div className="bg-indigo-500/10 border-b border-indigo-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div>
                  <h3 className="font-semibold text-foreground leading-none">Asistente Virtual</h3>
                  <p className="text-xs text-indigo-400 mt-1">Selecciona a tu acompañante</p>
               </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-white/5">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center gap-6 overflow-y-auto">
            {Object.keys(WAIFU_INFO).map((char) => {
               const w = char as Waifu;
               const info = WAIFU_INFO[w!];
               return (
                  <button key={char} onClick={() => onSelect(w)} className="flex items-center gap-4 w-full p-3 rounded-2xl border border-border bg-card hover:bg-white/5 hover:border-indigo-500/50 transition-all group">
                     <div className={`w-14 h-14 rounded-full ${info.bg} shrink-0 overflow-hidden ring-2 ring-border group-hover:ring-indigo-400 p-0.5`}>
                         <img src={info.img} alt={info.name} className="w-full h-full rounded-full object-cover" />
                     </div>
                     <div className="text-left">
                        <span className="block font-semibold text-foreground text-lg">{info.name}</span>
                        <span className="block text-xs text-muted-foreground">Elegir como asistente</span>
                     </div>
                  </button>
               )
            })}
        </div>
     </div>
  );
}

function ChatEngine({ waifu, onBack, onClose }: { waifu: Exclude<Waifu, null>, onBack: () => void, onClose: () => void }) {
  const [input, setInput] = useState("")
  const info = WAIFU_INFO[waifu];
  
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: `/api/waifu?char=${waifu}` }),
    messages: [
      {
        id: "start-1",
        role: "assistant",
        parts: [{ type: "text", text: info.greeting }],
      } as unknown as UIMessage,
    ],
  })
  
  const isLoading = status === 'submitted' || status === 'streaming'
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-background relative">
        {/* Header */}
        <div className="bg-indigo-500/10 border-b border-indigo-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-white/5 -ml-2 mr-1">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`w-10 h-10 rounded-full ${info.bg} flex items-center justify-center overflow-hidden shrink-0 ring-2 ${info.theme.replace('text', 'ring')} p-0.5`}>
              <img src={info.img} alt={info.name} className="w-full h-full rounded-full object-cover bg-indigo-900 fallback:opacity-0" 
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
              <Bot className="w-6 h-6 text-white hidden" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-none">{info.name}</h3>
              <p className={`text-xs ${info.theme} mt-1`}>Recomendando anime...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className={`w-8 h-8 rounded-full ${info.bg} shrink-0 flex items-center justify-center overflow-hidden border border-border`}>
                  <img src={info.img} alt={info.name} className="w-full h-full object-cover fallback:opacity-0"
                     onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
                  <Bot className="w-4 h-4 text-white hidden" />
                </div>
              )}
              
              <div
                className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted border border-border text-foreground rounded-tl-sm whitespace-pre-wrap"
                }`}
              >
                {message.parts?.map((part: any, i: number) => 
                  part.type === 'text' ? <span key={i}>{part.text}</span> : null
                )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary shrink-0 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-3 justify-start items-center text-muted-foreground">
                <div className={`w-8 h-8 rounded-full ${info.bg} shrink-0 flex items-center justify-center`}>
                   <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="text-xs italic bg-muted px-4 py-2.5 rounded-2xl rounded-tl-sm">{info.name} está escribiendo...</div>             </div>          )}          {error && (            <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg">              Hubo un error de conexión ({error.message}). Intenta de nuevo.            </div>          )}          <div ref={messagesEndRef} />        </div>        {/* Input Area */}        <div className="p-4 bg-card border-t border-border">          <form            onSubmit={(e) => {              e.preventDefault();              if (input.trim()) {                sendMessage({ text: input });                setInput('');              }            }}            className="flex items-end gap-2"          >            <div className="relative flex-1">              <input                value={input || ''}                onChange={(e) => setInput(e.target.value)}                placeholder={`Pídele a ${info.name} una recomendación...`}                className="w-full bg-muted border border-border rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"                disabled={isLoading}              />            </div>            <button              type="submit"              disabled={isLoading || !input?.trim()}              className={`w-11 h-11 ${info.bg} ${info.bgHover} disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white shrink-0 transition-colors`}            >              <Send className="w-5 h-5 ml-0.5" />            </button>          </form>        </div>    </div>  )}
