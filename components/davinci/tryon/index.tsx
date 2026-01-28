'use client';

import dynamic from 'next/dynamic';

const RealisticShirtPreview = dynamic(
    () => import('./RealisticShirtPreview'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[600px] flex items-center justify-center bg-zinc-900 text-zinc-500">
                Initializing WebGL Engine...
            </div>
        )
    }
);

export default RealisticShirtPreview;
