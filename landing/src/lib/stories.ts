export type StoryId = "cover" | "history" | "family" | "moment" | "message" | "closing";

export interface StorySlide {
  id: StoryId;
  label: string;
  duration: number;
  lines: string[];
}

export interface StoryPhoto {
  file: string;
  source: string;
  width: number;
  height: number;
  variants: { source: string; width: number }[];
  treatment: "hero" | "editorial" | "memory";
  focalPoint: { x: number; y: number };
  alt: string;
}

export interface HistoryPage {
  kind: "intro" | "photos" | "reflection";
  photos: StoryPhoto[];
}

export interface StoryVideo {
  source: string;
  originalSource?: string;
  poster: string | null;
  captions: string | null;
  transcript: string | null;
  personalized: boolean;
  kind: "invitation" | "special";
  recipient?: string;
}

export interface StoriesContent {
  title: string;
  subtitle: string;
  edition: string;
  volume: string;
  number: string;
  specialEdition: string;
  personalizationLabel: string;
  hashtag: string;
  shareText: string;
  photoAlt: string;
  messageHeading: string;
  messageSignoff: string;
  recipient: string;
  seats: string;
  couple: string;
  date: string;
  location: string;
  colophon: string;
  shareUrl: string | null;
  photo: string | null;
  historyPhoto: string | null;
  historyPages: HistoryPage[];
  historyReflection: string;
  momentPhoto: StoryPhoto | null;
  messagePhoto: StoryPhoto | null;
  music: string | null;
  musicFallback: string | null;
  musicVolume: number;
  videos: StoryVideo[];
  slides: StorySlide[];
}
