import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Camera,
    MapPin,
    AlertTriangle,
    ChevronRight,
    Image as ImageIcon,
    Search,
    Check,
    Loader2,
    Trash2,
    Plus,
    Tag,
    Info,
    AlertCircle
} from 'lucide-react';
import {
    FilePlusSolid,
    ImageSolid,
} from '@mynaui/icons-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isDark?: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, isDark = false }) => {
    const [step, setStep] = useState(1);
    const [image, setImage] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [tags, setTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const urgencyLevels = [
        { id: 'low', label: 'Low', color: 'bg-yellow-400', icon: '🌱' },
        { id: 'medium', label: 'Medium', color: 'bg-orange-400', icon: '⚠️' },
        { id: 'high', label: 'High', color: 'bg-red-500', icon: '🔥' },
        { id: 'critical', label: 'Critical', color: 'bg-red-900', icon: '🚨' },
    ];

    const commonTags = ['Plastic', 'Organic', 'Hazardous', 'Metal', 'Glass', 'Electronic'];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleTag = (tag: string) => {
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        onSubmit({ image, description, location, urgency, tags });
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center pointer-events-none">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ y: "100%", opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0.5 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`relative w-full max-w-lg ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} rounded-t-[32px] sm:rounded-[32px] shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]`}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} sticky top-0 z-10 bg-inherit`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#a7e94a]/20 flex items-center justify-center">
                                <FilePlusSolid className="w-6 h-6 text-[#a7e94a]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Report Waste</h2>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Help us keep Lombok clean</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* 1. Image Upload Section */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <ImageSolid className="w-5 h-5 text-[#a7e94a]" />
                                <h3 className="font-semibold text-sm uppercase tracking-wider opacity-70">Evidence Image</h3>
                            </div>

                            <div
                                onClick={() => !image && fileInputRef.current?.click()}
                                className={`relative aspect-video rounded-3xl border-2 border-dashed ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'} flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all duration-300 hover:border-[#a7e94a]`}
                            >
                                {image ? (
                                    <>
                                        <img src={image} alt="Report preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors"
                                            >
                                                <Camera className="w-6 h-6 text-white" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setImage(null); }}
                                                className="p-3 bg-red-500/80 backdrop-blur-md rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-6 h-6 text-white" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-8">
                                        <div className="w-16 h-16 rounded-3xl bg-[#a7e94a]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Camera className="w-8 h-8 text-[#a7e94a]" />
                                        </div>
                                        <p className="font-medium">Tap to take photo</p>
                                        <p className="text-xs opacity-50 mt-1">Upload an image of the waste location</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </section>

                        {/* 2. Description Section */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-5 h-5 text-[#a7e94a]" />
                                <h3 className="font-semibold text-sm uppercase tracking-wider opacity-70">Description</h3>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the situation... (e.g. Broken bins, illegal dumping, plastic waste overflow)"
                                className={`w-full min-h-[120px] p-5 rounded-3xl ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border focus:border-[#a7e94a] focus:ring-1 focus:ring-[#a7e94a] transition-all outline-none resize-none font-medium leading-relaxed`}
                            />
                        </section>

                        {/* 3. Location Selector Section */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-5 h-5 text-[#a7e94a]" />
                                <h3 className="font-semibold text-sm uppercase tracking-wider opacity-70">Location</h3>
                            </div>

                            <div className={`p-4 rounded-3xl ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border group cursor-pointer hover:border-[#a7e94a] transition-all`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-white shadow-sm'} flex items-center justify-center text-[#a7e94a]`}>
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">
                                            {location?.address || 'Set Location on Map'}
                                        </p>
                                        <p className="text-xs opacity-50">
                                            {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Tap to select or search location'}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 opacity-30 group-hover:translate-x-1 group-hover:opacity-100 transition-all text-[#a7e94a]" />
                                </div>
                            </div>
                        </section>

                        {/* 4. Urgency Level Section */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-[#a7e94a]" />
                                <h3 className="font-semibold text-sm uppercase tracking-wider opacity-70">Urgency Level</h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {urgencyLevels.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => setUrgency(level.id as any)}
                                        className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${urgency === level.id
                                            ? `border-[#a7e94a] ${isDark ? 'bg-[#a7e94a]/10' : 'bg-[#a7e94a]/5'}`
                                            : `${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`
                                            }`}
                                    >
                                        <span className="text-2xl">{level.icon}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${urgency === level.id ? 'text-[#a7e94a]' : 'opacity-60'}`}>
                                            {level.label}
                                        </span>
                                        {urgency === level.id && (
                                            <motion.div
                                                layoutId="urgency-check"
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-[#a7e94a] rounded-full flex items-center justify-center"
                                            >
                                                <Check className="w-3 h-3 text-white" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 5. Waste Tags Section */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag className="w-5 h-5 text-[#a7e94a]" />
                                <h3 className="font-semibold text-sm uppercase tracking-wider opacity-70">Waste Tags</h3>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {commonTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${tags.includes(tag)
                                            ? 'bg-[#a7e94a] text-black border-[#a7e94a] shadow-[0_4px_12px_rgba(167,233,74,0.3)]'
                                            : `${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-500'} hover:border-[#a7e94a]`
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {tags.includes(tag) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 opacity-50" />}
                                            {tag}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className={`p-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} bg-inherit`}>
                        <button
                            disabled={!image || !description || isSubmitting}
                            onClick={handleSubmit}
                            className={`w-full py-4 rounded-[20px] font-bold text-lg flex items-center justify-center gap-3 transition-all ${!image || !description || isSubmitting
                                ? `${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'} cursor-not-allowed`
                                : 'bg-[#a7e94a] text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#a7e94a]/20'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span>Send Report</span>
                                    <ChevronRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReportModal;
