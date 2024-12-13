import * as z from "zod";

export const formSchema = z.object({
  name: z.string().min(1, {
    message: "Model name is required."
  }),
  type: z.string().min(1),
  description: z.string().min(1, {
    message: "Model description is required."
  }),
  trainingData: z.any(),
  parameters: z.object({
    epochs: z.number().min(1).max(100),
    batchSize: z.number().min(1).max(128),
    learningRate: z.number().min(0.0001).max(0.1),
  }).optional(),
});

export const modelTypes = [
  {
    value: "text-classification",
    label: "Text Classification",
    description: "Train a model to classify text into categories"
  },
  {
    value: "image-classification",
    label: "Image Classification",
    description: "Train a model to classify images"
  },
  {
    value: "sentiment-analysis",
    label: "Sentiment Analysis",
    description: "Train a model to analyze sentiment in text"
  },
  {
    value: "object-detection",
    label: "Object Detection",
    description: "Train a model to detect objects in images"
  },
  {
    value: "text-generation",
    label: "Text Generation",
    description: "Train a model to generate text based on prompts"
  }
];
