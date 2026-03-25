import React from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';

export const metadata = {
    title: 'DaVinci Admin Center',
    description: 'ADC Control Center for DaVinci Studio',
    robots: 'noindex, nofollow' // Crucial to prevent Google from indexing the admin panel!
};

export default function Layout({ children }: { children: React.ReactNode }) {
    // Note: Auth verification is already handled by middleware/proxy route interception
    // and server-side in all API and Server Actions.
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
