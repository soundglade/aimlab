export interface TtsServiceConfig {
  id: string;
  displayName: string;
  defaultPreviewText: string;
  defaultSettings: any;
}

export interface TtsPreset {
  id: string;
  name: string;
  description: string;
  settings: any;
  ttsService: string;
}

export type VoiceSettings = {
  ttsService: string;
  ttsSettings: any;
  isAdvancedMode: boolean;
};
