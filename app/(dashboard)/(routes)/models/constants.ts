import * as z from "zod";

export const formSchema = z.object({
  name: z.string().min(1, { message: "Model name is required" }),
  type: z.string().min(1, { message: "Model type is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});

export const modelTypes = [
  { value: "classification", label: "Classification" },
  { value: "generation", label: "Generation" },
  { value: "completion", label: "Completion" },
  { value: "embedding", label: "Embedding" },
];
