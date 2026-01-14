'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'aurora' | 'crimson' | 'silver' | 'ember' | 'champagne' | 'rose' | 'forest' | 'mauve';
export type SparkleMode = 'theme' | 'original';
export type HoverEffect = 'grab' | 'repulse';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    lampColor: string;
    sparkleMode: SparkleMode;
    toggleSparkleMode: () => void;
    hoverEffect: HoverEffect;
    toggleHoverEffect: () => void;
}

const THEME_COLORS: Record<Theme, string> = {
    aurora: '#7c3aed',
    crimson: '#ef4444',
    silver: '#94a3b8',
    ember: '#f97316',
    champagne: '#fbbf24',
    rose: '#f472b6',
    forest: '#34d399',
    mauve: '#af8d99',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('aurora');
    const [sparkleMode, setSparkleMode] = useState<SparkleMode>('theme');
    const [hoverEffect, setHoverEffect] = useState<HoverEffect>('grab');

    useEffect(() => {
        const savedTheme = localStorage.getItem('davinci-theme') as Theme;
        if (savedTheme && Object.keys(THEME_COLORS).includes(savedTheme)) {
            setThemeState(savedTheme);
            setThemeState(savedTheme);
            document.body.setAttribute('data-theme', savedTheme);
        }

        const savedSparkleMode = localStorage.getItem('davinci-sparkle-mode') as SparkleMode;
        if (savedSparkleMode && (savedSparkleMode === 'theme' || savedSparkleMode === 'original')) {
            setSparkleMode(savedSparkleMode);
        }

        const savedHoverEffect = localStorage.getItem('davinci-hover-effect') as HoverEffect;
        if (savedHoverEffect && (savedHoverEffect === 'grab' || savedHoverEffect === 'repulse')) {
            setHoverEffect(savedHoverEffect);
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('davinci-theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
    };

    const toggleSparkleMode = () => {
        const newMode = sparkleMode === 'theme' ? 'original' : 'theme';
        setSparkleMode(newMode);
        localStorage.setItem('davinci-sparkle-mode', newMode);
    };

    const toggleHoverEffect = () => {
        const newEffect = hoverEffect === 'grab' ? 'repulse' : 'grab';
        setHoverEffect(newEffect);
        localStorage.setItem('davinci-hover-effect', newEffect);
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            lampColor: THEME_COLORS[theme],
            sparkleMode,
            toggleSparkleMode,
            hoverEffect,
            toggleHoverEffect
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
