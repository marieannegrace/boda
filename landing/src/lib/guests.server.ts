import "server-only";
import records from "@/data/guests.json";

export interface Guest {
  slug: string;
  name: string;
  displayName: string;
  greeting: string;
  seats: number | null;
  seatsPendingLabel: string | null;
  video: string | null;
  poster: string | null;
  captions: string | null;
  transcript: string | null;
  videoWidth: number | null;
  videoHeight: number | null;
  postWeddingAccess: boolean | null;
  stories?: {
    edition?: string;
    photo?: string | null;
    photoAlt?: string;
    message?: string | null;
  };
}

const guests: Record<string, Guest> = records;

export function getGuestSlugs() {
  return Object.keys(guests).filter((slug) => slug !== "default");
}

function validateGuest(guest: Guest, key: string) {
  if (guest.slug !== key || !/^[a-z0-9-]+$/.test(key)) {
    throw new Error(`Invalid guest slug in configuration: ${key}`);
  }
  for (const field of [guest.name, guest.displayName, guest.greeting]) {
    if (typeof field !== "string" || !field.trim() || field.length > 200) {
      throw new Error(`Invalid guest text in configuration: ${key}`);
    }
    if (guest.seats !== null && (!Number.isInteger(guest.seats) || guest.seats < 1)) {
      throw new Error(`Invalid seats in configuration: ${key}`);
    }
    if (guest.seats === null && (typeof guest.seatsPendingLabel !== "string" || !guest.seatsPendingLabel.trim())) {
      throw new Error(`Missing pending seats label: ${key}`);
    }
  }
  if (![true, false, null].includes(guest.postWeddingAccess)) {
    throw new Error(`Invalid postWeddingAccess: ${key}`);
  }
  for (const [value, pattern] of [
    [guest.video, /^\/videos\/[a-zA-Z0-9_ -]+\.mp4$/i],
    [guest.poster, /^\/(?:images|posters)\/[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/],
    [guest.captions, /^\/videos\/[a-zA-Z0-9_ -]+\.vtt$/i],
  ] as const) {
    if (value !== null && !pattern.test(value)) {
      throw new Error(`Invalid media path in configuration: ${key}`);
    }
  }
  for (const dimension of [guest.videoWidth, guest.videoHeight]) {
    if (dimension !== null && (!Number.isFinite(dimension) || dimension <= 0)) {
      throw new Error(`Invalid video dimensions: ${key}`);
    }
    if (guest.stories) {
      for (const text of [guest.stories.edition, guest.stories.photoAlt, guest.stories.message]) {
        if (text != null && (typeof text !== "string" || !text.trim() || text.length > 500)) {
          throw new Error(`Invalid stories text: ${key}`);
        }
      }
    }
  }
}

export function getGuest(slug = "default"): Guest | null {
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) return null;
  const key = Object.hasOwn(guests, slug) ? slug : "default";
  const guest = guests[key];
  validateGuest(guest, key);
  return guest;
}

export function getExactGuest(slug: string): Guest | null {
  if (slug === "default" || !Object.hasOwn(guests, slug)) return null;
  return getGuest(slug);
}
