import * as z from "zod";
import { Analytics } from '@vercel/analytics/react';
export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
});
