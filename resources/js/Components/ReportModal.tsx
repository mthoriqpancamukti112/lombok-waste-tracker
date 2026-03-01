import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import { MapPinUserInside, X } from '@mynaui/icons-react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPinned } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isDark?: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, isDark = false }) => {
    // ── Form State (Inertia) ──────────────────────
    const { data, setData, post, processing: isSubmitting, errors, reset } = useForm({
        description: '',
        photo: null as File | null,
        photos: [] as File[],
        latitude: '' as string | number,
        longitude: '' as string | number,
        address: '',
        severity_level: '',
    });

    // ── Local UI State ────────────────────────────
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [locationMode, setLocationMode] = useState<'current' | 'pick'>('current');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [urgency, setUrgency] = useState<'low' | 'moderate' | 'high' | ''>('');
    const [needs, setNeeds] = useState<string[]>([]);
    const [needInput, setNeedInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<{ name: string; full_address: string; mapbox_id: string }[]>([]);
    const [showResults, setShowResults] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const resultsContainerRef = useRef<HTMLDivElement>(null);
    const sessionTokenRef = useRef<string>(crypto.randomUUID());

    const [viewState, setViewState] = useState({
        longitude: 116.1165,
        latitude: -8.5833,
        zoom: 12,
    });

    // Sync local urgency/location/needs to form data
    useEffect(() => {
        setData('severity_level', urgency);
    }, [urgency]);

    useEffect(() => {
        if (selectedLocation) {
            setData((prev) => ({
                ...prev,
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
                address: selectedLocation.address,
            }));
        }
    }, [selectedLocation]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setImages([]);
            reset();
            setLocationMode('current');
            setSearchQuery('');
            setSelectedLocation(null);
            setUrgency('');
            setNeeds([]);
            setNeedInput('');
            setSearchResults([]);
            setShowResults(false);
        }
    }, [isOpen]);

    // ── Image handling ────────────────────────────
    const updateImagesInForm = (newImages: { file: File; preview: string }[]) => {
        setData((prev) => ({
            ...prev,
            photo: newImages[0]?.file || null,
            photos: newImages.slice(1).map(img => img.file)
        }));
    };

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const newImagesList = Array.from(files)
            .filter(f => f.type.startsWith('image/'))
            .slice(0, 5 - images.length)
            .map(file => ({
                file,
                preview: URL.createObjectURL(file),
            }));

        const updatedImages = [...images, ...newImagesList].slice(0, 5);
        setImages(updatedImages);
        updateImagesInForm(updatedImages);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);

    const removeImage = (index: number) => {
        setImages(prev => {
            const removed = prev[index];
            if (removed) URL.revokeObjectURL(removed.preview);
            const updated = prev.filter((_, i) => i !== index);
            updateImagesInForm(updated);
            return updated;
        });
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); };

    // ── Location handling ─────────────────────────
    const getCurrentLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setSelectedLocation({ lat: latitude, lng: longitude, address: '' });
                setViewState({ longitude, latitude, zoom: 15 });
                await reverseGeocode(longitude, latitude);
            },
            () => alert('Could not get your location. Please enable location access.'),
            { enableHighAccuracy: true }
        );
    };

    const reverseGeocode = async (lng: number, lat: number) => {
        try {
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=id`);
            const json = await res.json();
            if (json.features?.[0]) {
                const address = json.features[0].place_name;
                setSelectedLocation(prev => prev ? { ...prev, address } : { lat, lng, address });
            }
        } catch (err) { console.error('Geocode error:', err); }
    };

    const handleMapClick = useCallback((event: any) => {
        const { lng, lat } = event.lngLat;
        setSelectedLocation({ lat, lng, address: '' });
        reverseGeocode(lng, lat);
    }, []);

    const searchLocation = async (query?: string) => {
        const q = (query ?? searchQuery).trim();
        if (!q) { setSearchResults([]); setShowResults(false); return; }
        setIsSearching(true);
        try {
            const res = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(q)}&access_token=${MAPBOX_TOKEN}&proximity=116.1165,-8.5833&language=id&limit=5&session_token=${sessionTokenRef.current}`);
            const json = await res.json();
            if (json.suggestions?.length) {
                setSearchResults(json.suggestions.map((s: any) => ({
                    name: s.name || s.full_address || q,
                    full_address: s.full_address || s.place_formatted || '',
                    mapbox_id: s.mapbox_id,
                })));
                setShowResults(true);
            } else { setSearchResults([]); setShowResults(false); }
        } catch (err) { console.error('Search error:', err); }
        finally { setIsSearching(false); }
    };

    const pickSearchResult = async (result: { name: string; full_address: string; mapbox_id: string }) => {
        setShowResults(false);
        setSearchResults([]);
        setSearchQuery(result.name);
        setIsSearching(true);
        try {
            const res = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${result.mapbox_id}?access_token=${MAPBOX_TOKEN}&session_token=${sessionTokenRef.current}`);
            const json = await res.json();
            if (json.features?.[0]) {
                const coords = json.features[0].geometry.coordinates;
                const [lng, lat] = coords;
                setSelectedLocation({ lat, lng, address: result.full_address || result.name });
                setViewState({ longitude: lng, latitude: lat, zoom: 15 });
            }
            sessionTokenRef.current = crypto.randomUUID();
        } catch (err) {
            console.error('Retrieve error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (value.trim().length >= 2) {
            searchTimeoutRef.current = setTimeout(() => searchLocation(value), 400);
        } else { setSearchResults([]); setShowResults(false); }
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            const inSearch = searchContainerRef.current?.contains(target);
            const inResults = resultsContainerRef.current?.contains(target);
            if (!inSearch && !inResults) setShowResults(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const clearLocation = () => {
        setSelectedLocation(null);
        setViewState({ longitude: 116.1165, latitude: -8.5833, zoom: 12 });
    };

    // ── Needs / Tags ──────────────────────────────
    const addNeed = () => {
        const trimmed = needInput.trim();
        if (trimmed && !needs.includes(trimmed)) { setNeeds(prev => [...prev, trimmed]); setNeedInput(''); }
    };
    const removeNeed = (tag: string) => setNeeds(prev => prev.filter(n => n !== tag));

    // ── Submit ─────────────────────────────────────
    const handleSubmit = () => {
        if (!data.photo || !data.description || !selectedLocation) {
            if (!data.photo) toast.error("Mohon unggah foto bukti.");
            if (!data.description) toast.error("Mohon isi deskripsi.");
            if (!selectedLocation) toast.error("Mohon pilih lokasi di peta.");
            return;
        }

        // Append needs to description for now or handle in backend if needed
        // For consistency with existing backend, we'll follow the same structure
        post(route('report.store'), {
            onSuccess: () => {
                onSubmit(data);
                onClose();
            },
            onError: (err) => {
                console.error('Submit errors:', err);
                if (Object.keys(err).length > 0) {
                    Object.values(err).forEach(errMsg => toast.error(errMsg as string));
                } else {
                    toast.error("Gagal mengirim laporan. Pastikan file tidak terlalu besar.");
                }
            },
        });
    };

    useEffect(() => {
        if (locationMode === 'current' && isOpen && !selectedLocation) getCurrentLocation();
    }, [locationMode, isOpen]);

    if (!isOpen) return null;

    // ── Design System Tokens ──
    const bg = isDark ? 'bg-ds-bg-inverse' : 'bg-white';
    const textPrimary = isDark ? 'text-ds-inverse' : 'text-ds-mono-bold';
    const textSecondary = 'text-ds-mono';
    const borderColor = isDark ? 'border-ds-border-bold' : 'border-ds-border';
    const cardBg = isDark ? 'bg-ds-bg-inverse' : 'bg-white';
    const inputBg = isDark ? 'bg-ds-bg-inverse border-ds-border-bold' : 'bg-ds-disabled-bg border-ds-border';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ y: '100%', opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0.5 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`relative w-full max-w-md ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-poppins`}
                >
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-ds-border-bold' : 'bg-ds-disabled'}`} />
                    </div>

                    <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
                        <button
                            onClick={onClose}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isDark ? 'bg-ds-border-bold hover:bg-ds-mono text-white' : 'bg-ds-disabled-bg hover:bg-ds-negative-subtle hover:text-ds-negative text-ds-mono'}`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <h2 className={`text-lg font-semibold tracking-tight ${textPrimary}`}>Report</h2>
                        <div className="w-10" />
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                        {/* 1. IMAGE UPLOAD */}
                        <section>
                            <label className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2.5`}>Image</label>
                            <div
                                onClick={() => images.length < 5 && fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative rounded-2xl border-2 border-dashed ${isDragging ? 'border-ds-primary bg-ds-primary-subtle' : isDark ? 'border-ds-border-bold' : 'border-ds-border'} ${isDark ? 'bg-ds-bg-inverse' : 'bg-ds-bg'} flex flex-col items-center justify-center cursor-pointer transition-all min-h-[130px] ${images.length > 0 ? 'p-3' : 'p-8'}`}
                            >
                                {images.length > 0 ? (
                                    <div className="w-full">
                                        <div className="flex gap-2 flex-wrap">
                                            {images.map((img, i) => (
                                                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                                                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                        className="absolute top-1 right-1 w-5 h-5 bg-ds-negative rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                            {images.length < 5 && (
                                                <div className={`w-20 h-20 rounded-xl border-2 border-dashed ${isDark ? 'border-ds-border-bold' : 'border-ds-border'} flex items-center justify-center`}>
                                                    <svg className={`w-6 h-6 ${textSecondary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <svg className={`w-9 h-9 mx-auto mb-2.5 ${textSecondary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                        <p className={`text-sm font-semibold ${textPrimary}`}>Click or drag to upload</p>
                                        <p className={`text-xs mt-1 ${textSecondary}`}>png, jpg, jpeg, webp · max 7MB</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple className="hidden" onChange={handleImageChange} />
                            </div>
                            {errors.photo && <p className="text-xs text-ds-negative mt-1 font-medium">{errors.photo}</p>}
                        </section>

                        {/* 2. DESCRIPTION */}
                        <section>
                            <label className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2.5`}>Location Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe the waste location in detail..."
                                rows={3}
                                className={`w-full rounded-xl border ${inputBg} p-3.5 text-sm ${textPrimary} placeholder:text-ds-mono focus:border-ds-primary focus:ring-1 focus:ring-ds-primary/40 outline-none resize-none transition-colors`}
                            />
                            {errors.description && <p className="text-xs text-ds-negative mt-1 font-medium">{errors.description}</p>}
                        </section>

                        {/* 3. LOCATION PICKER */}
                        <section>
                            <label className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2.5`}>Location</label>
                            <div className={`flex rounded-xl border p-1 mb-3 ${isDark ? 'bg-ds-bg-inverse border-ds-border-bold' : 'bg-ds-bg border-ds-border'}`}>
                                <button
                                    type="button"
                                    onClick={() => { setLocationMode('current'); getCurrentLocation(); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${locationMode === 'current'
                                        ? `${cardBg} shadow-sm ${textPrimary} ${isDark ? '' : 'shadow-ds-border/60'}`
                                        : textSecondary
                                        }`}
                                >
                                    <MapPinUserInside className="w-3.5 h-3.5" />
                                    Current Location
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLocationMode('pick')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${locationMode === 'pick'
                                        ? `bg-ds-primary-subtle text-ds-primary-pressed shadow-sm`
                                        : textSecondary
                                        }`}
                                >
                                    <MapPinned className="w-3.5 h-3.5" />
                                    Pick on map
                                </button>
                            </div>

                            <div ref={searchContainerRef} className="mb-3">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearchInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
                                            onFocus={() => searchResults.length > 0 && setShowResults(true)}
                                            placeholder="Search Location"
                                            className={`w-full rounded-xl border ${inputBg} py-2.5 px-3.5 text-sm ${textPrimary} placeholder:text-ds-mono focus:border-ds-primary focus:ring-1 focus:ring-ds-primary/40 outline-none transition-colors`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => searchLocation()}
                                        disabled={isSearching}
                                        className="w-10 h-10 rounded-xl bg-ds-primary/15 flex items-center justify-center hover:bg-ds-primary/25 transition-colors flex-shrink-0"
                                    >
                                        {isSearching ? (
                                            <svg className="w-4 h-4 text-ds-primary-pressed animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-ds-primary-pressed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showResults && searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mb-3"
                                    >
                                        <div ref={resultsContainerRef} className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden max-h-[220px] overflow-y-auto shadow-lg`}>
                                            {searchResults.map((result, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => pickSearchResult(result)}
                                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-ds-primary-subtle transition-colors ${i < searchResults.length - 1 ? `border-b ${borderColor}` : ''}`}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-ds-primary-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <svg className="w-4 h-4 text-ds-primary-pressed" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold ${textPrimary} truncate`}>{result.name}</p>
                                                        <p className={`text-xs ${textSecondary} truncate mt-0.5`}>{result.full_address}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={`rounded-2xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200'} h-[170px] relative`}>
                                <Map
                                    {...viewState}
                                    onMove={(evt) => setViewState(evt.viewState)}
                                    onClick={locationMode === 'pick' ? handleMapClick : undefined}
                                    style={{ width: '100%', height: '100%' }}
                                    mapStyle={isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12'}
                                    mapboxAccessToken={MAPBOX_TOKEN}
                                    cursor={locationMode === 'pick' ? 'crosshair' : 'grab'}
                                    interactive={true}
                                >
                                    <NavigationControl position="top-right" showCompass={false} />
                                    {selectedLocation && (
                                        <Marker longitude={selectedLocation.lng} latitude={selectedLocation.lat} anchor="bottom">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 bg-ds-primary rounded-full border-[3px] border-white shadow-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Marker>
                                    )}
                                </Map>
                            </div>

                            {selectedLocation && (
                                <div className={`flex items-center gap-3 mt-3 p-3 rounded-xl border ${isDark ? 'bg-ds-bg-inverse border-ds-border-bold' : 'bg-ds-bg/80 border-ds-border'}`}>
                                    <div className="w-8 h-8 rounded-full bg-ds-primary/15 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-ds-primary-pressed" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold ${textPrimary}`}>Selected Location</p>
                                        <p className={`text-[11px] ${textSecondary} truncate`}>
                                            {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                                        </p>
                                    </div>
                                    <button onClick={clearLocation} className={`${textSecondary} hover:text-ds-negative transition-colors`}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {(errors.latitude || errors.longitude) && <p className="text-xs text-ds-negative mt-1 font-medium">Please select a location on the map.</p>}
                        </section>

                        {/* 4. URGENCY LEVEL */}
                        <section>
                            <label className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2.5`}>Urgency Level</label>
                            <div className="flex gap-2">
                                {(['low', 'moderate', 'high'] as const).map(level => {
                                    const isActive = urgency === level;
                                    let colorClasses = '';
                                    let icon = null;

                                    if (level === 'low') {
                                        colorClasses = isActive ? 'bg-ds-positive-subtle border-ds-positive text-ds-positive-pressed' : '';
                                        icon = <svg className={`w-3.5 h-3.5 ${isActive ? 'text-ds-positive' : isDark ? 'text-ds-border-bold' : 'text-ds-disabled'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                    } else if (level === 'moderate') {
                                        colorClasses = isActive ? 'bg-ds-notice-subtle border-ds-notice text-ds-notice-pressed' : '';
                                        icon = <svg className={`w-3.5 h-3.5 ${isActive ? 'text-ds-notice' : isDark ? 'text-ds-border-bold' : 'text-ds-disabled'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
                                    } else {
                                        colorClasses = isActive ? 'bg-ds-negative-subtle border-ds-negative text-ds-negative-pressed' : '';
                                        icon = <svg className={`w-3.5 h-3.5 ${isActive ? 'text-ds-negative' : isDark ? 'text-ds-border-bold' : 'text-ds-disabled'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>;
                                    }

                                    return (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setUrgency(level)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${isActive ? colorClasses : `${isDark ? 'bg-ds-bg-inverse border-ds-border-bold' : 'bg-ds-bg border-ds-border'} ${textSecondary}`}`}
                                        >
                                            {icon}
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 5. REPORT NEEDS */}
                        <section>
                            <label className={`block text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2.5`}>Report Needs</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={needInput}
                                    onChange={(e) => setNeedInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNeed())}
                                    placeholder="Add needs (e.g. Trash bin, Water)..."
                                    className={`flex-1 rounded-xl border ${inputBg} py-2.5 px-3.5 text-sm ${textPrimary} placeholder:text-ds-mono focus:border-ds-primary focus:ring-1 focus:ring-ds-primary/40 outline-none transition-colors`}
                                />
                                <button type="button" onClick={addNeed} className="w-10 h-10 rounded-xl bg-ds-primary/15 flex items-center justify-center hover:bg-ds-primary/25 transition-colors flex-shrink-0">
                                    <svg className="w-5 h-5 text-ds-primary-pressed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                </button>
                            </div>
                            {needs.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {needs.map((need) => (
                                        <span key={need} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ds-primary/15 text-ds-primary-pressed text-xs font-semibold">
                                            {need}
                                            <button onClick={() => removeNeed(need)} className="hover:text-ds-negative transition-colors"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <div className={`px-6 py-4 border-t ${borderColor}`}>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isSubmitting
                                ? `${isDark ? 'bg-ds-border-bold text-ds-border-bold' : 'bg-ds-disabled-bg text-ds-disabled'} cursor-not-allowed`
                                : 'bg-ds-primary text-ds-mono-bold hover:bg-ds-primary-hover active:scale-[0.98] shadow-lg shadow-ds-primary/20'
                                }`}
                        >
                            {isSubmitting ? (
                                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</>
                            ) : (
                                <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>Submit Report</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReportModal;
