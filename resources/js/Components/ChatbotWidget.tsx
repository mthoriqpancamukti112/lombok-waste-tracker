import React, { useState, useRef, useEffect } from "react";
import { ChatDots, X, Send, IndifferentSquare } from "@mynaui/icons-react";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

interface ChatbotWidgetProps {
    isDark?: boolean;
    userId?: number;
    onFocusReport?: (id: number) => void;
    onOpenReportModal?: () => void;
}

// Batas maksimal gelembung chat yang dirender agar browser tidak lag
const MAX_HISTORY = 40;

// --- FUNGSI FORMAT MESSAGE ---
const formatMessage = (
    text: string,
    onFocus?: (id: number) => void,
    onOpenReportModal?: () => void,
) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const boldRegex = /\*\*([^*]+)\*\*/g;

    const parts = text.split(linkRegex);

    if (parts.length === 1) {
        return text.split(boldRegex).map((part, index) => {
            if (index % 2 === 1)
                return (
                    <strong key={index} className="font-bold">
                        {part}
                    </strong>
                );
            return <span key={index}>{part}</span>;
        });
    }

    const formatted: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i += 3) {
        const textPart = parts[i];
        if (textPart) {
            const boldParts = textPart.split(boldRegex);
            boldParts.forEach((bp, bi) => {
                if (bi % 2 === 1)
                    formatted.push(
                        <strong key={`b-${i}-${bi}`} className="font-bold">
                            {bp}
                        </strong>,
                    );
                else if (bp)
                    formatted.push(<span key={`s-${i}-${bi}`}>{bp}</span>);
            });
        }

        if (i + 1 < parts.length) {
            const linkText = parts[i + 1];
            const linkUrl = parts[i + 2];

            // 1. JIKA LINK ADALAH FOCUS PETA
            if (linkUrl.startsWith("/?focus=") && onFocus) {
                const reportId = parseInt(linkUrl.replace("/?focus=", ""), 10);
                formatted.push(
                    <button
                        key={`l-${i}`}
                        type="button"
                        onClick={() => onFocus(reportId)}
                        className="text-blue-400 hover:text-blue-300 underline font-bold transition-colors cursor-pointer"
                    >
                        {linkText}
                    </button>,
                );
            }
            // 2. JIKA LINK ADALAH BUKA MODAL LAPORAN
            else if (linkUrl === "#buka-modal-lapor" && onOpenReportModal) {
                formatted.push(
                    <button
                        key={`l-${i}`}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onOpenReportModal();
                        }}
                        className="text-blue-400 hover:text-blue-300 underline font-bold transition-colors cursor-pointer"
                    >
                        {linkText}
                    </button>,
                );
            }
            // 3. JIKA LINK BIASA
            else {
                formatted.push(
                    <a
                        key={`l-${i}`}
                        href={linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline font-bold transition-colors"
                    >
                        {linkText}
                    </a>,
                );
            }
        }
    }
    return formatted;
};

export default function ChatbotWidget({
    isDark = false,
    userId,
    onFocusReport,
    onOpenReportModal,
}: ChatbotWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Halo! Saya adalah Asisten AI Pintar layanan informasi persampahan. Ada yang bisa saya bantu?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Auto-scroll ke pesan terbaru
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // ========================================================
    // FUNGSI UNTUK MENGIRIM PESAN KE API PYTHON ANDA
    // ========================================================
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: "user",
            timestamp: new Date(),
        };

        // Simpan input user, dan batasi array history
        setMessages((prev) => [...prev, userMessage].slice(-MAX_HISTORY));
        const currentInput = inputText; // Simpan input sebelum di-clear
        setInputText("");
        setIsLoading(true);

        try {
            // Memanggil API Python FastAPI
            const apiUrl =
                import.meta.env.VITE_CHATBOT_API_URL ||
                "http://127.0.0.1:8001/api/chat";
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Sesuai dengan ChatRequest di app.py
                body: JSON.stringify({
                    message: currentInput,
                    user_id: userId || 0,
                }),
            });

            if (!response.ok) throw new Error("Gagal terhubung ke API");

            const data = await response.json();

            // Sesuai dengan dictionary return dari app.py Anda
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response, // Mengambil value dari key "response"
                sender: "bot",
                timestamp: new Date(),
            };

            // Simpan balasan bot, dan batasi array history
            setMessages((prev) => [...prev, botMessage].slice(-MAX_HISTORY));
        } catch (error) {
            console.error("Error connecting to Python API:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Maaf, server AI sedang offline.",
                sender: "bot",
                timestamp: new Date(),
            };
            // Simpan pesan error, dan batasi array history
            setMessages((prev) => [...prev, errorMessage].slice(-MAX_HISTORY));
        } finally {
            setIsLoading(false);
        }
    };

    // Styling theme
    const bgCard = isDark
        ? "bg-slate-900 border-slate-700"
        : "bg-white border-slate-200";
    const textMain = isDark ? "text-slate-100" : "text-slate-800";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";
    const bgUserBubble = "bg-[#a7e94a] text-slate-900";
    const bgBotBubble = isDark
        ? "bg-slate-800 text-slate-200"
        : "bg-slate-100 text-slate-700";

    return (
        // z-[100] dan mb-20 untuk memastikan tidak tertutup BottomBar di versi mobile
        <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end">
            {/* --- CHAT WINDOW --- */}
            {isOpen && (
                <div
                    className={`mb-4 w-[calc(100vw-2rem)] sm:w-80 md:w-96 h-[450px] max-h-[70vh] flex flex-col shadow-2xl rounded-2xl border overflow-hidden origin-bottom-right animate-in zoom-in-95 fade-in duration-300 ${bgCard}`}
                >
                    {/* Header */}
                    <div className="bg-slate-900 px-4 py-3 flex items-center justify-between shadow-md z-10">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#a7e94a] flex items-center justify-center shadow-inner">
                                <IndifferentSquare className="w-5 h-5 text-slate-900" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white leading-tight">
                                    AI Assistant
                                </h3>
                                <p className="text-[10px] text-[#a7e94a] font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#a7e94a] animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                                        msg.sender === "user"
                                            ? `${bgUserBubble} rounded-br-sm shadow-sm`
                                            : `${bgBotBubble} rounded-bl-sm border ${isDark ? "border-slate-700" : "border-slate-200"}`
                                    }`}
                                >
                                    {formatMessage(
                                        msg.text,
                                        onFocusReport,
                                        onOpenReportModal,
                                    )}
                                </div>
                                <span
                                    className={`text-[9px] mt-1 ${textMuted}`}
                                >
                                    {msg.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex items-start">
                                <div
                                    className={`${bgBotBubble} px-4 py-3 rounded-2xl rounded-bl-sm border ${isDark ? "border-slate-700" : "border-slate-200"} flex gap-1.5 items-center`}
                                >
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div
                        className={`p-3 border-t ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"}`}
                    >
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-end gap-2 relative"
                        >
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Ketik pertanyaan Anda..."
                                className={`flex-1 max-h-24 min-h-[44px] resize-none rounded-xl border-none focus:ring-1 focus:ring-[#a7e94a] py-2.5 pl-3 pr-10 text-sm custom-scrollbar ${isDark ? "bg-slate-800 text-white placeholder-slate-500" : "bg-slate-100 text-slate-800 placeholder-slate-400"}`}
                                rows={1}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isLoading}
                                className={`absolute right-2 bottom-1.5 p-1.5 rounded-lg transition-all ${inputText.trim() && !isLoading ? "bg-[#a7e94a] text-slate-900 shadow-sm" : "text-slate-400"}`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                        <p
                            className={`text-[9px] text-center mt-2 ${textMuted}`}
                        >
                            Powered by IndoBERT Models
                        </p>
                    </div>
                </div>
            )}

            {/* --- TRIGGER BUTTON (FAB) --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 ${isOpen ? "bg-slate-800 text-white" : "bg-[#a7e94a] text-slate-900 shadow-[#a7e94a]/30"}`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <ChatDots className="w-7 h-7 text-white" />
                )}
            </button>
        </div>
    );
}
