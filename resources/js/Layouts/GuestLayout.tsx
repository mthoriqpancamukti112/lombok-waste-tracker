import { PropsWithChildren } from "react";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-6 sm:justify-center sm:pt-0">
            <div className="w-full overflow-hidden bg-white px-6 py-10 shadow-xl sm:max-w-md sm:rounded-3xl border border-slate-100">
                {children}
            </div>
        </div>
    );
}
