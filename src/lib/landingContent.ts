import { supabase } from "@/integrations/supabase/client";

export const LANDING_BUCKET = "menu-images";
export const LANDING_PREFIX = "landing";

export type HeroContent = {
  headline: string;
  subheadline: string;
  eyebrow: string;
  ctaText: string;
  ctaUrl: string;
  image: string;
};

export type FeatureCard = {
  id: string;
  icon: string;
  title: string;
  description: string;
  image: string;
};

export type FeaturesContent = {
  eyebrow: string;
  heading: string;
  items: FeatureCard[];
};

export type GalleryContent = {
  eyebrow: string;
  heading: string;
  images: { id: string; url: string; alt: string }[];
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

export type TestimonialsContent = {
  eyebrow: string;
  heading: string;
  items: Testimonial[];
};

export type FooterContent = {
  email: string;
  phone: string;
  address: string;
  copyright: string;
  socials: { id: string; label: string; url: string }[];
};

export type HoursContent = {
  eyebrow: string;
  heading: string;
  note: string;
  items: { id: string; days: string; time: string }[];
};

export type LocationContent = {
  eyebrow: string;
  heading: string;
  address: string;
  mapEmbedUrl: string;
  mapsUrl: string;
  image: string;
  parkingNote: string;
  directions: { id: string; mode: string; detail: string }[];
};

export type StoryContent = {
  eyebrow: string;
  heading: string;
  image: string;
  quote: string;
  quoteAuthor: string;
  paragraphs: { id: string; text: string }[];
};

export type FaqContent = {
  eyebrow: string;
  heading: string;
  items: { id: string; question: string; answer: string }[];
};

export type LandingSections = {
  hero: HeroContent;
  features: FeaturesContent;
  gallery: GalleryContent;
  testimonials: TestimonialsContent;
  footer: FooterContent;
  hours: HoursContent;
  location: LocationContent;
  story: StoryContent;
  faq: FaqContent;
};


export const landingDefaults: LandingSections = {
  hero: {
    eyebrow: "Est. 1998",
    headline: "A quiet kind of elegance.",
    subheadline:
      "Hand-rolled pasta, dry-aged steaks, and a cellar curated over a quarter century. An evening at Saveur is a slow conversation.",
    ctaText: "Reserve a table",
    ctaUrl: "/reserve",
    image: "",
  },
  features: {
    eyebrow: "Why Saveur",
    heading: "Crafted with intention",
    items: [
      {
        id: "f1",
        icon: "ChefHat",
        title: "Seasonal kitchen",
        description: "Menus rewritten every few weeks around what the farms and the coast send us.",
        image: "",
      },
      {
        id: "f2",
        icon: "Wine",
        title: "Curated cellar",
        description: "Four hundred labels, chosen one bottle at a time over twenty-five years.",
        image: "",
      },
      {
        id: "f3",
        icon: "Flame",
        title: "Open hearth",
        description: "Dry-aged cuts finished over olive wood in the centre of the dining room.",
        image: "",
      },
    ],
  },
  gallery: {
    eyebrow: "The room",
    heading: "Moments at Saveur",
    images: [],
  },
  testimonials: {
    eyebrow: "Guests",
    heading: "What they said",
    items: [
      {
        id: "t1",
        name: "Giulia Ferrari",
        role: "Regular since 2011",
        quote: "The kind of place where three hours vanish and you order one more glass anyway.",
        avatar: "",
      },
    ],
  },
  footer: {
    email: "hello@saveur.com",
    phone: "+39 02 1234 5678",
    address: "12 Via Dante, Milan, IT 20121",
    copyright: "Saveur. All rights reserved.",
    socials: [
      { id: "s1", label: "Instagram", url: "https://instagram.com" },
      { id: "s2", label: "Facebook", url: "https://facebook.com" },
    ],
  },
  hours: {
    eyebrow: "Opening hours",
    heading: "When we're open",
    note: "Kitchen closes 45 minutes before the dining room. Closed Mondays.",
    items: [
      { id: "h1", days: "Tuesday – Thursday", time: "18:00 — 23:00" },
      { id: "h2", days: "Friday – Saturday", time: "18:00 — 24:00" },
      { id: "h3", days: "Sunday", time: "12:00 — 16:00" },
      { id: "h4", days: "Monday", time: "Closed" },
    ],
  },
  location: {
    eyebrow: "Location",
    heading: "Find us on Via Dante",
    address: "12 Via Dante, Milan, IT 20121",
    mapEmbedUrl: "",
    mapsUrl: "https://maps.google.com/?q=Via+Dante+12+Milano",
    image: "",
    parkingNote: "Valet parking available from 19:00 on Friday and Saturday.",
    directions: [
      { id: "d1", mode: "By metro", detail: "M1 red line to Cairoli Castello — two minutes on foot toward Via Dante." },
      { id: "d2", mode: "By tram", detail: "Lines 1 and 4 stop at Cordusio, a five-minute walk away." },
      { id: "d3", mode: "By car", detail: "Area C congestion zone — the Autosilo Dante garage is 200m from the door." },
    ],
  },
  story: {
    eyebrow: "Our story",
    heading: "Twenty-five years of slow cooking",
    image: "",
    quote: "Cucina è tempo.",
    quoteAuthor: "Elena Romano",
    paragraphs: [
      {
        id: "p1",
        text: "Saveur opened in the spring of 1998, in a converted apothecary on Via Dante. Chef Elena Romano had spent a decade in the kitchens of Modena and Tokyo, and returned to Milan with a single intention: to cook the food she'd cook for her own family — only better.",
      },
      {
        id: "p2",
        text: "Twenty-five years later, the dining room still seats forty. The pasta is still cut by hand each morning. The cellar has grown to nearly 800 labels.",
      },
      {
        id: "p3",
        text: "What hasn't changed is the rhythm. We open at six. We close when the last conversation ends.",
      },
    ],
  },
  faq: {
    eyebrow: "Good to know",
    heading: "Frequently asked questions",
    items: [
      { id: "q1", question: "Do you take walk-ins?", answer: "We keep a few counter seats for walk-ins each evening, but reserving is the surest way in." },
      { id: "q2", question: "Is there a dress code?", answer: "Smart casual. No trainers or sportswear after 19:00." },
      { id: "q3", question: "Can you handle dietary requirements?", answer: "Yes — tell us when booking and the kitchen will prepare alternatives, including vegan and gluten-free menus." },
      { id: "q4", question: "Do you host private events?", answer: "The cellar room seats up to fourteen. Write to us and we'll build a menu around your evening." },
    ],
  },
};


export type SectionKey = keyof LandingSections;

export async function fetchSection<K extends SectionKey>(key: K): Promise<LandingSections[K]> {
  const { data } = await supabase
    .from("landing_content")
    .select("content")
    .eq("section_key", key)
    .maybeSingle();
  const stored = (data?.content ?? {}) as Partial<LandingSections[K]>;
  return { ...landingDefaults[key], ...stored } as LandingSections[K];
}

export async function saveSection<K extends SectionKey>(key: K, content: LandingSections[K]) {
  const { error } = await supabase
    .from("landing_content")
    .upsert({ section_key: key, content: content as never, updated_at: new Date().toISOString() }, { onConflict: "section_key" });
  if (error) throw error;
}

export async function uploadLandingImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${LANDING_PREFIX}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(LANDING_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(LANDING_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteLandingImage(url: string) {
  const marker = `/${LANDING_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  if (!path.startsWith(`${LANDING_PREFIX}/`)) return;
  await supabase.storage.from(LANDING_BUCKET).remove([path]);
}

export const uid = () => crypto.randomUUID();
