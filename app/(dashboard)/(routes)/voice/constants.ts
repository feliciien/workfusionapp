import * as z from "zod";

export const formSchema = z.object({
  text: z.string().min(1, {
    message: "Text is required."
  }),
  voice: z.string().min(1),
  emotion: z.string().min(1),
  speed: z.number().min(0.25).max(4.0),
  pitch: z.number().min(0.25).max(4.0)
});

export const voiceOptions = [
  {
    value: "alloy",
    label: "Alloy (Male Voice)"
  },
  {
    value: "ash",
    label: "Ash (Female Voice)"
  },
  {
    value: "fable",
    label: "Fable (Child Voice)"
  },
  {
    value: "nova",
    label: "Nova"
  },
  {
    value: "shimmer",
    label: "Shimmer"
  },
  {
    value: "echo",
    label: "Echo"
  },
  {
    value: "onyx",
    label: "Onyx"
  },
  {
    value: "sage",
    label: "Sage"
  },
  {
    value: "coral",
    label: "Coral"
  }
];

export const emotionOptions = [
  {
    value: "neutral",
    label: "Neutral"
  },
  {
    value: "happy",
    label: "Happy"
  },
  {
    value: "sad",
    label: "Sad"
  },
  {
    value: "angry",
    label: "Angry"
  }
];
