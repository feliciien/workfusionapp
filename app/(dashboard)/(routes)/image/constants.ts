import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Image prompt is required",
  }),
  amount: z.string().min(1),
  style: z.enum(
    [
      "realistic",
      "artistic",
      "digital",
      "vintage",
      "minimalist",
      "fantasy",
      "comic",
      "cinematic",
    ],
    {
      required_error: "Please select a style",
    }
  ),
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

// Removed resolutionOptions since resolutions are no longer supported

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
