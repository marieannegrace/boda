export type StoryId = "cover" | "history" | "family" | "moment" | "message" | "closing";

export interface StorySlide {
  id: StoryId;
  label: string;
  duration: number;
  lines: string[];
}

export interface StoriesContent {
  title: string;
  subtitle: string;
  edition: string;
  volume: string;
  specialEdition: string;
  personalizationLabel: string;
  hashtag: string;
  shareText: string;
  photoAlt: string;
  photoPlaceholder: string;
  videoPlaceholder: string;
  recipient: string;
  seats: string;
  couple: string;
  date: string;
  location: string;
  colophon: string;
  shareUrl: string | null;
  photo: string | null;
  video: {
    source: string;
    poster: string | null;
    captions: string | null;
    transcript: string | null;
    personalized: boolean;
  } | null;
  slides: StorySlide[];
}
