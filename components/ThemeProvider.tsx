'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'aurora' | 'crimson' | 'silver' | 'ember' | 'champagne' | 'rose' | 'forest' | 'mauve';
export type SparkleMode = 'theme' | 'original';
export type HoverEffect = 'grab' | 'repulse' | 'none';
export type BackgroundMode = 'stars' | 'smoke';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    lampColor: string;
    sparkleMode: SparkleMode;
    toggleSparkleMode: () => void;
    hoverEffect: HoverEffect;
    toggleHoverEffect: () => void;
    backgroundMode: BackgroundMode;
    setBackgroundMode: (mode: BackgroundMode) => void;
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
    // Default to 'original' (unsynced) as requested — user can toggle to 'theme' in Vibes drawer
    const [sparkleMode, setSparkleMode] = useState<SparkleMode>('original');
    const [hoverEffect, setHoverEffect] = useState<HoverEffect>('grab');
    const [backgroundMode, setBackgroundModeState] = useState<BackgroundMode>('stars');

    useEffect(() => {
        const savedTheme = localStorage.getItem('davinci-theme') as Theme;
        if (savedTheme && Object.keys(THEME_COLORS).includes(savedTheme)) {
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

        const savedBackgroundMode = localStorage.getItem('davinci-background-mode') as BackgroundMode;
        if (savedBackgroundMode && (savedBackgroundMode === 'stars' || savedBackgroundMode === 'smoke')) {
            setBackgroundModeState(savedBackgroundMode);
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('davinci-theme', newTheme);
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

    const setBackgroundMode = (mode: BackgroundMode) => {
        setBackgroundModeState(mode);
        localStorage.setItem('davinci-background-mode', mode);
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            lampColor: THEME_COLORS[theme],
            sparkleMode,
            toggleSparkleMode,
            hoverEffect,
            toggleHoverEffect,
            backgroundMode,
            setBackgroundMode
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
