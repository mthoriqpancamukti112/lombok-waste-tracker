import React from 'react';
import { BottomSheet as SpringBottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <SpringBottomSheet
            open={isOpen}
            onDismiss={onClose}
            snapPoints={({ maxHeight }) => [maxHeight * 0.5, maxHeight * 0.9]}
            defaultSnap={({ snapPoints }) => Math.max(...snapPoints)}
            expandOnContentDrag={true}
            header={
                <div className="flex-shrink-0 flex flex-col items-center w-full py-4 cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors rounded-t-[32px]">
                    <div className="w-16 h-1.5 bg-slate-300 hover:bg-slate-400 transition-colors rounded-full" />
                </div>
            }
        >
            <div className="flex flex-col h-full w-full">
                {children}
            </div>
        </SpringBottomSheet>
    );
};

export default BottomSheet;
