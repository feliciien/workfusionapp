import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required."
  }),
  voice: z.string().min(1),
  emotion: z.string().min(1),
  speed: z.number().min(0.25).max(4.0),
  pitch: z.number().min(0.25).max(4.0)
});

export const voiceOptions = [
  {
    value: "male",
    label: "Male Voice"
  },
  {
    value: "female",
    label: "Female Voice"
  },
  {
    value: "child",
    label: "Child Voice"
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
