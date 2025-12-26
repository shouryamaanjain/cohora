import { useState, useRef, useEffect } from 'react'
import StudentCard from './StudentCard'
import { searchStudents, type SearchResult } from '../lib/openai'
import userData from '../data/user.json'
import studentsData from '../data/students.json'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Eye, Send, Users, Sparkles, User, Search } from "lucide-react"

interface Student {
  id: string
  name: string
  batch: string
  skills: string[]
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  students?: SearchResult['students']
  isLoading?: boolean
}

interface ChatProps {
  apiKey: string
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey! I'm Cohora — your campus skill discovery assistant. Ask me things like \"Who knows Python?\" or \"Find me a frontend developer for a hackathon\" and I'll find the right people for you."
}

function NetworkPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const connections = userData.connections.map(id => 
    (studentsData as Student[]).find(s => s.id === id)
  ).filter(Boolean) as Student[]

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 h-9 bg-background/50 hover:bg-accent/50 transition-all border-dashed"
      >
        <Users className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline">Your Network</span>
        <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] justify-center bg-primary/10 text-primary hover:bg-primary/20">
          {connections.length}
        </Badge>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-full mt-2 w-80 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 border-border/60 bg-card/95 backdrop-blur-md">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                1st Degree Connections
              </h3>
              <p className="text-xs text-muted-foreground mt-1">People you're directly connected to</p>
            </div>
            <ScrollArea className="h-80 p-2">
              <div className="space-y-1">
                {connections.map(conn => (
                  <div 
                    key={conn.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors group cursor-default"
                  >
                    <Avatar className="h-9 w-9 border border-border group-hover:border-primary/50 transition-colors">
                      <AvatarFallback className="bg-primary/5 text-xs font-medium text-primary">
                        {conn.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{conn.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conn.skills.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" title="1st degree" />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t bg-muted/20">
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                Ask about connections to find paths
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default function Chat({ apiKey }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setInput('')
    setIsLoading(true)

    try {
      const result = await searchStudents(apiKey, input.trim())
      
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? { 
                ...msg, 
                content: result.message, 
                students: result.students,
                isLoading: false 
              }
            : msg
        )
      )
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? { 
                ...msg, 
                content: "Hmm, something went wrong. Make sure your API key is valid and try again.",
                isLoading: false 
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleSuggestion = (text: string) => {
    setInput(text)
    inputRef.current?.focus()
  }

  const suggestions = [
    { text: "Who knows Python?", icon: <Search className="w-3 h-3" /> },
    { text: "Find me a frontend dev", icon: <User className="w-3 h-3" /> },
    { text: "Need mobile app help", icon: <Users className="w-3 h-3" /> },
    { text: "ML experts", icon: <Sparkles className="w-3 h-3" /> }
  ]

  return (
    <div className="h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-sm font-bold tracking-tight">Cohora</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Skill Discovery</p>
            </div>
          </div>
          <NetworkPanel />
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-primary/10">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                {message.isLoading ? (
                  <Card className="p-4 border-none bg-muted/50 shadow-none">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full typing-dot" />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full typing-dot" />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full typing-dot" />
                    </div>
                  </Card>
                ) : (
                  <>
                    <div
                      className={`px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                          : 'bg-card border text-card-foreground rounded-2xl rounded-tl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {message.students && message.students.length > 0 && (
                      <div className="w-full mt-2 space-y-3 pl-1">
                        {message.students.map((student, i) => (
                          <div 
                            key={student.id} 
                            className="animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-backwards"
                            style={{ animationDelay: `${i * 150}ms` }}
                          >
                            <StudentCard student={student} />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 mt-0.5 border border-border">
                  <AvatarFallback className="bg-muted text-xs">ME</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {/* Suggestions - show when only welcome message exists */}
          {messages.length === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 mt-8">
              <p className="text-xs text-muted-foreground text-center mb-4 font-medium uppercase tracking-widest">Try asking</p>
              <div className="flex flex-wrap gap-2.5 justify-center">
                {suggestions.map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestion(suggestion.text)}
                    className="h-9 px-4 rounded-full bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {suggestion.icon}
                    <span className="ml-2">{suggestion.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Input */}
      <footer className="border-t bg-background/80 backdrop-blur-md p-4 sticky bottom-0 z-10">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skills, projects, or find collaborators..."
            disabled={isLoading}
            className="h-12 pl-4 pr-12 rounded-xl bg-muted/40 border-transparent focus:bg-background transition-all shadow-sm focus:ring-2 focus:ring-primary/20 text-base md:text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  )
}
