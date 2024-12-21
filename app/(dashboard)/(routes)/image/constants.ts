import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Image prompt is required",
  }),
  amount: z.string().min(1),
  resolution: z.enum(["1024x1024", "1792x1024", "1024x1792"], {
    required_error: "Please select a resolution",
  }),
  style: z.enum(["realistic", "artistic", "digital", "vintage", "minimalist", "fantasy", "comic", "cinematic"], {
    required_error: "Please select a style",
  }),
});

export const amountOptions = [
  {
    value: "1",
    label: "1 Image",
  },
  {
    value: "2",
    label: "2 Images",
  },
  {
    value: "3",
    label: "3 Images",
  },
  {
    value: "4",
    label: "4 Images",
  },
  {
    value: "5",
    label: "5 Images",
  },
];

export const resolutionOptions = [
  {
    value: "256x256",
    label: "256x256",
  },
  {
    value: "512x512",
    label: "512x512",
  },
  {
    value: "1024x1024",
    label: "1024x1024",
  },
];

export const styleOptions = [
  {
    value: "realistic",
    label: "Realistic",
  },
  {
    value: "artistic",
    label: "Artistic",
  },
  {
    value: "digital",
    label: "Digital Art",
  },
  {
    value: "vintage",
    label: "Vintage",
  },
  {
    value: "minimalist",
    label: "Minimalist",
  },
  {
    value: "fantasy",
    label: "Fantasy",
  },
  {
    value: "comic",
    label: "Comic",
  },
  {
    value: "cinematic",
    label: "Cinematic",
  },
];
