import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required."
  }),
  amount: z.string().min(1),
  resolution: z.string().min(1),
  style: z.string().min(1)
});

export const amountOptions = [
  {
    value: "1",
    label: "Single Image",
    description: "Generate one artwork"
  },
  {
    value: "2",
    label: "Two Images",
    description: "Generate two variations"
  },
  {
    value: "3",
    label: "Three Images",
    description: "Generate three variations"
  },
  {
    value: "4",
    label: "Four Images",
    description: "Generate four variations"
  },
  {
    value: "5",
    label: "Five Images",
    description: "Generate five variations"
  }
];

export const resolutionOptions = [
  {
    value: "256x256",
    label: "Preview (256x256)",
    description: "Quick generation, lower quality"
  },
  {
    value: "512x512",
    label: "Standard (512x512)",
    description: "Balanced quality and speed"
  },
  {
    value: "1024x1024",
    label: "HD (1024x1024)",
    description: "High quality, longer generation"
  }
];

export const styleOptions = [
  {
    value: "realistic",
    label: "Photorealistic",
    description: "Ultra-realistic, photographic quality"
  },
  {
    value: "anime",
    label: "Anime & Manga",
    description: "Japanese animation style"
  },
  {
    value: "digital-art",
    label: "Digital Art",
    description: "Modern digital illustration"
  },
  {
    value: "oil-painting",
    label: "Oil Painting",
    description: "Classical oil painting style"
  },
  {
    value: "watercolor",
    label: "Watercolor",
    description: "Soft, flowing watercolor effects"
  },
  {
    value: "sketch",
    label: "Pencil Sketch",
    description: "Hand-drawn pencil artwork"
  },
  {
    value: "abstract",
    label: "Abstract",
    description: "Non-representational modern art"
  },
  {
    value: "3d-render",
    label: "3D Render",
    description: "Photorealistic 3D graphics"
  },
  {
    value: "fantasy",
    label: "Fantasy Art",
    description: "Magical and mythical themes"
  },
  {
    value: "surreal",
    label: "Surrealism",
    description: "Dreamlike and imaginative"
  }
];
