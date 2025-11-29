export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  timestamp: number;
  width?: number;
  height?: number;
  model: string;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface GenerationConfig {
  aspectRatio: AspectRatio;
  stylePreset?: string; // Placeholder for future use
}

export interface HistoryItem {
  id: string;
  prompt: string;
  thumbnail: string;
  timestamp: number;
}
