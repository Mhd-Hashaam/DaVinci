import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";
import { MODEL_NAME } from "../constants";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio = "1:1"
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        // Force the model to behave strictly as an image generator
        systemInstruction: "You are an expert AI artist. Your goal is to generate images based on user prompts. You must NOT generate text responses, conversational advice, or questions. If the prompt is vague or abstract, use your creativity to generate a high-quality interpretation. ALWAYS generate an image.",
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    let imageUrl = "";
    const candidate = response.candidates?.[0];

    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
                break; // Found the image, exit loop
            }
        }
    }

    if (!imageUrl) {
      // If no image, check if the model returned a text explanation
      const textPart = candidate?.content?.parts?.find((part) => part.text)?.text;
      if (textPart) {
        throw new Error(textPart);
      }

      // Check for safety stops or other finish reasons
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
         throw new Error(`Image generation stopped. Reason: ${candidate.finishReason}`);
      }

      throw new Error("No image data found in response");
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};