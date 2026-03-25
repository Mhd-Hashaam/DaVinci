import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  viewMoreHref: string;
  viewMoreText?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  viewMoreHref, 
  viewMoreText = "View More" 
}) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-4">
      <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
      <Link 
        href={viewMoreHref}
        className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-white transition-colors group"
      >
        {viewMoreText}
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  </div>
);
