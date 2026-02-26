import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile-ish desktop sizes or just for focus */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[55] lg:hidden"
                    />

                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-6 left-6 bottom-32 w-full max-w-sm z-[60] bg-white/90 backdrop-blur-2xl border border-white/20 shadow-[0_20px_80px_rgba(0,0,0,0.1)] rounded-[40px] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex flex-col items-start pt-8 pb-4 px-8 border-b border-slate-50">
                            <div className="w-full flex justify-between items-center mb-2">
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>
                            <div className="w-12 h-1 bg-[#a7e94a] rounded-full" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SidePanel;
