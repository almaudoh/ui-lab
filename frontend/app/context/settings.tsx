'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type SynthSettings = {
	selectedVoice: string;
	language: string;
	pitch: number;
	rate: number;
	volume: number;
};

type SynthSettingsContextValue = {
	savedSettings: SynthSettings;
	saveSettings: (settings: SynthSettings) => void;
};

const defaultSettings: SynthSettings = {
	selectedVoice: '',
	language: 'en-US',
	pitch: 1,
	rate: 1,
	volume: 1,
};

const SynthSettingsContext = createContext<SynthSettingsContextValue | undefined>(undefined);

export function SynthSettingsProvider({ children }: { children: React.ReactNode }) {
	const [savedSettings, setSavedSettings] = useState<SynthSettings>(defaultSettings);

	const saveSettings = useCallback((settings: SynthSettings) => {
		setSavedSettings(settings);
	}, []);

	const value = useMemo(
		() => ({
			savedSettings,
			saveSettings,
		}),
		[savedSettings, saveSettings]
	);

	return (
	  <SynthSettingsContext.Provider value={value}>
		{children}
	  </SynthSettingsContext.Provider>
	)
}

export function useSynthSettings() {
	const context = useContext(SynthSettingsContext);
	if (!context) {
		throw new Error('useSynthSettings must be used within SynthSettingsProvider');
	}
	return context;
}
