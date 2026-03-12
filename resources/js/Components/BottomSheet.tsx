import React from 'react';
import { BottomSheet as SpringBottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    isDark?: boolean;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children, isDark }) => {
    return (
        <SpringBottomSheet
            open={isOpen}
            onDismiss={onClose}
            snapPoints={({ maxHeight }) => [maxHeight * 0.5, maxHeight * 0.9]}
            defaultSnap={({ snapPoints }) => Math.max(...snapPoints)}
            expandOnContentDrag={true}
            style={{
                // @ts-ignore
                "--rsbs-bg": isDark ? "#0f172a" : "#fff",
                "--rsbs-handle-bg": isDark ? "#334155" : "rgba(0, 0, 0, 0.15)",
                "--rsbs-overlay-bg": "rgba(0, 0, 0, 0.6)",
            }}
            header={
                <div className={`flex-shrink-0 flex flex-col items-center w-full py-4 cursor-grab active:cursor-grabbing transition-colors rounded-t-[32px] ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div className={`w-16 h-1.5 transition-colors rounded-full ${isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-300 hover:bg-slate-400"}`} />
                </div>
            }
        >
            <div className={`flex flex-col h-full w-full ${isDark ? "bg-slate-900 text-slate-100" : "bg-white"}`}>
                {children}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                [data-rsbs-root] {
                    --rsbs-bg: ${isDark ? '#0f172a' : '#fff'};
                    --rsbs-handle-bg: ${isDark ? '#334155' : 'rgba(0, 0, 0, 0.15)'};
                }
                [data-rsbs-header] {
                    background: ${isDark ? '#0f172a' : '#fff'} !important;
                    padding: 0 !important;
                }
                [data-rsbs-bg] {
                    background: ${isDark ? '#0f172a' : '#fff'} !important;
                }
            ` }} />
        </SpringBottomSheet>
    );
};

export default BottomSheet;
