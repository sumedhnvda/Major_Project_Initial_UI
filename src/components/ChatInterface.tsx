import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'model',
            text: 'Namaskara! I am Saraswati, your Tulu AI assistant. How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        // Simulate model delay and response
        setTimeout(() => {
            const modelMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "I am currently a UI demo. Once connected to the Tulu model, I will generate text in Tulu for you! For now, imagine I said something profound in Tulu.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, modelMessage]);
            setIsLoading(false);
        }, 1500);
    };

    const handleNewChat = () => {
        setMessages([
            {
                id: Date.now().toString(),
                role: 'model',
                text: 'Namaskara! I am Saraswati, your Tulu AI assistant. How can I help you today?',
                timestamp: new Date()
            }
        ]);
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl overflow-hidden">
            {/* Chat Header - Simplified/Removed or integrated */}
            <div className="bg-cream-100 border-b border-cream-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-light-red-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-light-red-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 text-sm">Saraswati AI</h2>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleNewChat}
                    className="text-gray-500 hover:text-light-red-500 transition-colors p-1.5 rounded-full hover:bg-cream-200"
                    title="New Chat"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex gap-3 max-w-[80%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-light-red-100'
                                }`}>
                                {msg.role === 'user' ? (
                                    <User className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <Bot className="w-5 h-5 text-light-red-600" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                ? 'bg-light-red-500 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <span className={`text-[10px] mt-2 block ${msg.role === 'user' ? 'text-light-red-100' : 'text-gray-400'
                                    }`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-light-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="w-5 h-5 text-light-red-600" />
                            </div>
                            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-100 p-4">
                <div className="max-w-4xl mx-auto relative">
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type your message in Tulu or English..."
                            className="w-full pl-6 pr-14 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-light-red-500 focus:bg-white transition-all text-sm text-gray-700 placeholder-gray-400"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-light-red-500 text-white rounded-full hover:bg-light-red-600 disabled:opacity-50 disabled:hover:bg-light-red-500 transition-colors shadow-sm"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
