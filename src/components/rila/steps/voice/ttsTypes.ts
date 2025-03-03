export interface TtsServiceConfig {
  id: string;
  displayName: string;
  defaultPreviewText: string;
  defaultSettings: any;
  presets: TtsPreset[];
}

export interface TtsPreset {
  id: string;
  name: string;
  description: string;
  settings: any;
}

export type VoiceSettings = {
  ttsService: string;
  ttsSettings: any;
  isAdvancedMode: boolean;
};
