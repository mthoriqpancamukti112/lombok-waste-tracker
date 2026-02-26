import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
    const controls = useAnimation();
    const currentSnap = useRef<'closed' | 'half' | 'full'>('closed');

    useEffect(() => {
        if (isOpen) {
            controls.start('half');
            currentSnap.current = 'half';
        } else {
            controls.start('closed');
            currentSnap.current = 'closed';
        }
    }, [isOpen, controls]);

    const onDragEnd = (_: any, info: PanInfo) => {
        const velocity = info.velocity.y;
        const offset = info.offset.y;

        if (velocity > 300 || offset > 150) {
            if (currentSnap.current === 'full') {
                controls.start('half');
                currentSnap.current = 'half';
            } else {
                onClose();
                currentSnap.current = 'closed';
            }
        } else if (velocity < -300 || offset < -100) {
            controls.start('full');
            currentSnap.current = 'full';
        } else {
            // Snap back to current
            controls.start(currentSnap.current);
        }
    };

    return (
        <>
            {/* Invisible backdrop to catch outside clicks */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[59]"
                    onClick={onClose}
                />
            )}

            <motion.div
                initial="closed"
                animate={controls}
                variants={{
                    closed: { y: '100%' },
                    half: { y: '40%' },
                    full: { y: '0%' },
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0.05, bottom: 0.3 }}
                onDragEnd={onDragEnd}
                className="fixed inset-x-0 bottom-0 z-[60] h-full flex flex-col justify-end pointer-events-none"
            >
                <div className="w-full h-full bg-white rounded-t-[32px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] pointer-events-auto flex flex-col overflow-hidden">
                    {/* Drag Handle */}
                    <div className="flex-shrink-0 flex flex-col items-center pt-3 pb-2">
                        <div className="w-10 h-1 bg-slate-200 rounded-full" />
                    </div>

                    {/* Content - no internal padding, let children handle it */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {children}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default BottomSheet;
