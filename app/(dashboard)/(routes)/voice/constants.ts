// app/(dashboard)/(routes)/voice/constants.ts

import * as z from "zod";

export const voiceOptions = [
  { value: "alloy", label: "Alloy" },
  { value: "ash", label: "Ash" },
  { value: "coral", label: "Coral" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable" },
  { value: "onyx", label: "Onyx" },
  { value: "nova", label: "Nova" },
  { value: "sage", label: "Sage" },
  { value: "shimmer", label: "Shimmer" },
];

export const formatOptions = [
  { value: "mp3", label: "MP3" },
  { value: "opus", label: "Opus" },
  { value: "aac", label: "AAC" },
  { value: "flac", label: "FLAC" },
  { value: "pcm", label: "PCM" },
];

export const languageOptions = [
  { value: "af", label: "Afrikaans" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "ja", label: "Japanese" },
  { value: "ru", label: "Russian" },
  { value: "es", label: "Spanish" },
  // Add more languages as needed
];

export const emotionOptions = [
  { value: "neutral", label: "Neutral" },
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "angry", label: "Angry" },
  { value: "fearful", label: "Fearful" },
  { value: "disgusted", label: "Disgusted" },
  { value: "surprised", label: "Surprised" },
  // Add more emotions as needed
];

export const formSchema = z.object({
  text: z.string().min(1, "Text is required"),
  voice: z.string().min(1, "Voice is required"),
  format: z.string().min(1, "Format is required"),
  language: z.string().min(1, "Language is required"),
  emotion: z.string().min(1, "Emotion is required"),
  speed: z.number().min(0.25).max(4.0).default(1.0),
  pitch: z.number().min(0.25).max(4.0).default(1.0),
});
