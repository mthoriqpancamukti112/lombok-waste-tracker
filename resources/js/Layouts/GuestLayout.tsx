import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 px-4 sm:justify-center">
            <div className="mb-8">
                <Link href="/">
                    <ApplicationLogo className="h-16 w-16 fill-current text-[#a7e94a] drop-shadow-sm" />
                </Link>
            </div>

            <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden ring-1 ring-slate-100/50">
                {children}
            </div>
        </div>
    );
}
