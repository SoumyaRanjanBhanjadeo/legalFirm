import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Scale, Trash2, MessageSquare } from 'lucide-react';
import { sendChatMessage } from '../../services/chatbotService';
import toast from 'react-hot-toast';

const AIChatBot = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            type: 'bot',
            text: 'Hello! I am your Legal Firm AI Assistant. How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (text = inputValue) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: text.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await sendChatMessage(text.trim());

            // Artificial delay for realism
            setTimeout(() => {
                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    text: response.data.message,
                    timestamp: new Date(response.data.timestamp)
                };
                setMessages(prev => [...prev, botMessage]);
                setIsTyping(false);
            }, 1000);

        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Failed to get a response. Please try again.');
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: Date.now().toString(),
                type: 'bot',
                text: 'Chat cleared. How can I help you now?',
                timestamp: new Date()
            }
        ]);
    };

    const suggestedQuestions = [
        "What are your business hours?",
        "What services do you offer?",
        "How can I book an appointment?",
        "Where is your office located?"
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl border shadow-sm"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gold/10 text-gold">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Legal AI Assistant</h2>
                        <p className="text-xs flex items-center" style={{ color: 'var(--text-muted)' }}>
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Online & Ready to Help
                        </p>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Clear Chat"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 rounded-2xl border scrollbar-hide"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>

                {messages.length === 1 && (
                    <div className="flex flex-col items-center justify-center h-full py-10 opacity-50">
                        {/* <Scale className="w-16 h-16 mb-4 text-gold/30" /> */}
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            Ask me about our services, hours, or appointments!
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`flex max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                            <div className={`p-2 rounded-full hidden sm:flex shrink-0 ${msg.type === 'user' ? 'bg-gold/10 text-gold ml-2' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                                {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            <div className="flex flex-col space-y-1">
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                    ? 'bg-gold text-white rounded-br-none shadow-lg shadow-gold/20'
                                    : 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-bl-none shadow-sm'
                                    }`} style={msg.type === 'bot' ? { color: 'var(--text-primary)' } : {}}>
                                    {msg.text}
                                </div>
                                <span className={`text-[10px] px-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--text-muted)' }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border dark:border-gray-700">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            <div className="flex flex-wrap gap-2 px-1">
                {suggestedQuestions.map((q, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gold/20 bg-gold/5 text-gold hover:bg-gold hover:text-white transition-all duration-300 cursor-pointer"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/60 group-focus-within:text-gold transition-colors">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    // onKeyPress={handleKeyPress}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your question here..."
                    className="block w-full pl-12 pr-16 py-4 border rounded-2xl focus:ring-4 focus:ring-gold/10 focus:border-gold transition-all outline-none shadow-sm"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                    }}
                />
                <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    className="absolute inset-y-0 right-2 my-2 w-12 flex items-center justify-center rounded-xl bg-gold text-white hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/20 cursor-pointer"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default AIChatBot;