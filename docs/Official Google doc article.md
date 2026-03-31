Nano Banana image generation

Nano Banana is the name for Gemini's native image generation capabilities. Gemini can generate and process images conversationally with text, images, or a combination of both. This lets you create, edit, and iterate on visuals with unprecedented control.

Nano Banana refers to three distinct models available in the Gemini API:

Nano Banana 2: The Gemini 3.1 Flash Image Preview model (gemini-3.1-flash-image-preview). This model serves as the high-efficiency counterpart to Gemini 3 Pro Image, optimized for speed and high-volume developer use cases.
Nano Banana Pro: The Gemini 3 Pro Image Preview model (gemini-3-pro-image-preview). This model is designed for professional asset production, utilizing advanced reasoning ("Thinking") to follow complex instructions and render high-fidelity text.
Nano Banana: The Gemini 2.5 Flash Image model (gemini-2.5-flash-image). This model is designed for speed and efficiency, optimized for high-volume, low-latency tasks.
All generated images include a SynthID watermark.

Image generation (text-to-image)

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt =
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

main();


Image editing (text-and-image-to-image)
Reminder: Make sure you have the necessary rights to any images you upload. Don't generate content that infringe on others' rights, including videos or images that deceive, harass, or harm. Your use of this generative AI service is subject to our Prohibited Use Policy.

Provide an image and use text prompts to add, remove, or modify elements, change the style, or adjust the color grading.

The following example demonstrates uploading base64 encoded images. For multiple images, larger payloads, and supported MIME types, check the Image understanding page.


import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath = "path/to/cat_image.png";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    { text: "Create a picture of my cat eating a nano-banana in a" +
            "fancy restaurant under the Gemini constellation" },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

main();



Multi-turn image editing
Keep generating and editing images conversationally. Chat or multi-turn conversation is the recommended way to iterate on images. The following example shows a prompt to generate an infographic about photosynthesis.


import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function main() {
  const chat = ai.chats.create({
    model: "gemini-3.1-flash-image-preview",
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      tools: [{googleSearch: {}}],
    },
  });
}

await main();

const message = "Create a vibrant infographic that explains photosynthesis as if it were a recipe for a plant's favorite food. Show the \"ingredients\" (sunlight, water, CO2) and the \"finished dish\" (sugar/energy). The style should be like a page from a colorful kids' cookbook, suitable for a 4th grader."

let response = await chat.sendMessage({message});

for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("photosynthesis.png", buffer);
      console.log("Image saved as photosynthesis.png");
    }
}




New with Gemini 3 Image models
Gemini 3 offers state-of-the-art image generation and editing models. Gemini 3.1 Flash Image is optimized for speed and high-volume use-cases, and Gemini 3 Pro Image is optimized for professional asset production. Designed to tackle the most challenging workflows through advanced reasoning, they excel at complex, multi-turn creation and modification tasks.

High-resolution output: Built-in generation capabilities for 1K, 2K, and 4K visuals.
Gemini 3.1 Flash Image adds the smaller 512 (0.5K) resolution.
Advanced text rendering: Capable of generating legible, stylized text for infographics, menus, diagrams, and marketing assets.
Grounding with Google Search: The model can use Google Search as a tool to verify facts and generate imagery based on real-time data (e.g., current weather maps, stock charts, recent events).
Gemini 3.1 Flash Image adds the integration of Grounding with Google Search for Images alongside Web Search.
Thinking mode: The model utilizes a "thinking" process to reason through complex prompts. It generates interim "thought images" (visible in the backend but not charged) to refine the composition before producing the final high-quality output.
Up to 14 reference images: You can now mix up to 14 reference images to produce the final image.
New aspect ratios: Gemini 3.1 Flash Image Preview adds 1:4, 4:1, 1:8, and 8:1 aspect ratios.
Use up to 14 reference images
Gemini 3 image models let you to mix up to 14 reference images. These 14 images can include the following:

Gemini 3.1 Flash Image Preview	Gemini 3 Pro Image Preview
Up to 10 images of objects with high-fidelity to include in the final image	Up to 6 images of objects with high-fidelity to include in the final image
Up to 4 images of characters to maintain character consistency	Up to 5 images of characters to maintain character consistency



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt =
      'An office group photo of these people, they are making funny faces.';
  const aspectRatio = '5:4';
  const resolution = '2K';

const contents = [
  { text: prompt },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64ImageFile1,
    },
  },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64ImageFile2,
    },
  },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64ImageFile3,
    },
  },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64ImageFile4,
    },
  },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64ImageFile5,
    },
  }
];

const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: contents,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: resolution,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("image.png", buffer);
      console.log("Image saved as image.png");
    }
  }

}

main();



Grounding with Google Search
Use the Google Search tool to generate images based on real-time information, such as weather forecasts, stock charts, or recent events.

Note that when using Grounding with Google Search with image generation, image-based search results are not passed to the generation model and are excluded from the response (see Grounding with Google Search for images)




import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt = 'Visualize the current weather forecast for the next 5 days in San Francisco as a clean, modern weather chart. Add a visual on what I should wear each day';
  const aspectRatio = '16:9';
  const resolution = '2K';

const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: resolution,
      },
    tools: [{ googleSearch: {} }]
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("image.png", buffer);
      console.log("Image saved as image.png");
    }
  }

}

main();



The response includes groundingMetadata which contains the following required fields:

searchEntryPoint: Contains the HTML and CSS to render the required search suggestions.
groundingChunks: Returns the top 3 web sources used to ground the generated image
Grounding with Google Search for Images (3.1 Flash)
Note: This feature is only available for the Gemini 3.1 Flash Image model.
Grounding with Google Search for images allows models to use web images retrieved via Google Search as visual context for image generation. Image Search is a new search type within the existing Grounding with Google Search tool, functioning alongside standard Web Search.

To enable Image Search, configure the googleSearch tool in your API request and specify imageSearch within the searchTypes object. Image Search can be used independently or together with Web Search.

Note that Grounding with Google Search for images can't be used to search for people.



import { GoogleGenAI } from "@google/genai";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt = "A detailed painting of a Timareta butterfly resting on a flower";

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
      tools: [
        {
          googleSearch: {
            searchTypes: {
              webSearch: {},
              imageSearch: {}
            }
          }
        }
      ]
    }
  });

  // Display grounding sources if available
  if (response.candidates && response.candidates[0].groundingMetadata && response.candidates[0].groundingMetadata.searchEntryPoint) {
      console.log(response.candidates[0].groundingMetadata.searchEntryPoint.renderedContent);
  }
}

main();



Display requirements

When you use Image Search within Grounding with Google Search, you must comply with the following conditions:

Source attribution: You must provide a link to the webpage containing the source image (the "containing page," not the image file itself) in a manner that the user will recognize as a link.
Direct navigation: If you also choose to display the source images, you must provide a direct, single-click path from the source images to its containing source webpage. Any other implementation that delays or abstracts the end user's access to the source webpage, including but not limited to any multi-click path or the use of an intermediate image viewer, is not permitted.
Response

For grounded responses using image search, the API provides clear attribution and metadata to link its output to verified sources. Key fields in the groundingMetadata object include:

imageSearchQueries: The specific queries used by the model for visual context (image search).
groundingChunks: Contains source information for retrieved results. For image sources, these will be returned as redirect URLs using a new image chunk type. This chunk includes:

uri: The web page URL for attribution (the landing page).
image_uri: The direct image URL.
groundingSupports: Provides specific mappings that link the generated content to its relevant citation source in the chunks.

searchEntryPoint: Includes the "Google Search" chip containing compliant HTML and CSS to render Search Suggestions.

Generate images up to 4K resolution
Gemini 3 image models generate 1K images by default but can also output 2K, 4K, and 512 (0.5K) (Gemini 3.1 Flash Image only) images. To generate higher resolution assets, specify the image_size in the generation_config.

You must use an uppercase 'K' (e.g. 1K, 2K, 4K). The 512 value does not use a 'K' suffix. Lowercase parameters (e.g., 1k) will be rejected.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt =
      'Da Vinci style anatomical sketch of a dissected Monarch butterfly. Detailed drawings of the head, wings, and legs on textured parchment with notes in English.';
  const aspectRatio = '1:1';
  const resolution = '1K';

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: resolution,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("image.png", buffer);
      console.log("Image saved as image.png");
    }
  }

}

main();



Thinking Process
Gemini 3 image models are thinking models that use a reasoning process ("Thinking") for complex prompts. This feature is enabled by default and cannot be disabled in the API. To learn more about the thinking process, see the Gemini Thinking guide.

The model generates up to two interim images to test composition and logic. The last image within Thinking is also the final rendered image.

You can check the thoughts that lead to the final image being produced.



for (const part of response.candidates[0].content.parts) {
  if (part.thought) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, 'base64');
      fs.writeFileSync('image.png', buffer);
      console.log('Image saved as image.png');
    }
  }
}



Controlling thinking levels
With Gemini 3.1 Flash Image, you can control the amount of thinking the model uses to balance quality and latency. The default thinkingLevel is minimal, and the supported levels are minimal and high. Setting the thinkingLevel to minimal provides the lowest latency responses. Note that minimal thinking does not mean the model uses no thinking at all.

You can add the includeThoughts boolean to determine whether the model's generated thoughts are returned in the response, or remain hidden.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: "A futuristic city built inside a giant glass bottle floating in space",
    config: {
      responseModalities: ["IMAGE"],
      thinkingConfig: {
        thinkingLevel: "High",
        includeThoughts: true
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.thought) { // Skip outputting thoughts
      continue;
    }
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("image.png", buffer);
      console.log("Image saved as image.png");
    }
  }
}
main();



always happens by default whether you view the process or not.

Thought Signatures
Thought signatures are encrypted representations of the model's internal thought process and are used to preserve reasoning context across multi-turn interactions. All responses include a thought_signature field. As a general rule, if you receive a thought signature in a model response, you should pass it back exactly as received when sending the conversation history in the next turn. Failure to circulate thought signatures may cause the response to fail. Check the thought signature documentation for more explanations of signatures overall.

Note: If you use the official Google Gen AI SDKs and use the chat feature (or append the full model response object directly to history), thought signatures are handled automatically. You do not need to manually extract or manage them, or change your code.
Here is how thought signatures work:

All inline_data parts with image mimetype which are part of the response should have signature.
If there are some text parts at the beginning (before any image) right after the thoughts, the first text part should also have a signature.
If inline_data parts with image mimetype are part of thoughts, they won't have signatures.
The following code shows an example of where thought signatures are included:


[
  {
    "inline_data": {
      "data": "<base64_image_data_0>",
      "mime_type": "image/png"
    },
    "thought": true // Thoughts don't have signatures
  },
  {
    "inline_data": {
      "data": "<base64_image_data_1>",
      "mime_type": "image/png"
    },
    "thought": true // Thoughts don't have signatures
  },
  {
    "inline_data": {
      "data": "<base64_image_data_2>",
      "mime_type": "image/png"
    },
    "thought": true // Thoughts don't have signatures
  },
  {
    "text": "Here is a step-by-step guide to baking macarons, presented in three separate images.\n\n### Step 1: Piping the Batter\n\nThe first step after making your macaron batter is to pipe it onto a baking sheet. This requires a steady hand to create uniform circles.\n\n",
    "thought_signature": "<Signature_A>" // The first non-thought part always has a signature
  },
  {
    "inline_data": {
      "data": "<base64_image_data_3>",
      "mime_type": "image/png"
    },
    "thought_signature": "<Signature_B>" // All image parts have a signatures
  },
  {
    "text": "\n\n### Step 2: Baking and Developing Feet\n\nOnce piped, the macarons are baked in the oven. A key sign of a successful bake is the development of \"feet\"—the ruffled edge at the base of each macaron shell.\n\n"
    // Follow-up text parts don't have signatures
  },
  {
    "inline_data": {
      "data": "<base64_image_data_4>",
      "mime_type": "image/png"
    },
    "thought_signature": "<Signature_C>" // All image parts have a signatures
  },
  {
    "text": "\n\n### Step 3: Assembling the Macaron\n\nThe final step is to pair the cooled macaron shells by size and sandwich them together with your desired filling, creating the classic macaron dessert.\n\n"
  },
  {
    "inline_data": {
      "data": "<base64_image_data_5>",
      "mime_type": "image/png"
    },
    "thought_signature": "<Signature_D>" // All image parts have a signatures
  }
]
Other image generation modes
Gemini supports other image interaction modes based on prompt structure and context, including:

Text to image(s) and text (interleaved): Outputs images with related text.
Example prompt: "Generate an illustrated recipe for a paella."
Image(s) and text to image(s) and text (interleaved): Uses input images and text to create new related images and text.
Example prompt: (With an image of a furnished room) "What other color sofas would work in my space? can you update the image?"
Generate images in batch
If you need to generate a lot of images, you can use the Batch API. You get higher rate limits in exchange for a turnaround of up to 24 hours.

Check the Batch API image generation documentation and the cookbook for Batch API image examples and code.

Prompting guide and strategies
Mastering image generation starts with one fundamental principle:

Describe the scene, don't just list keywords. The model's core strength is its deep language understanding. A narrative, descriptive paragraph will almost always produce a better, more coherent image than a list of disconnected words.

Prompts for generating images
The following strategies will help you create effective prompts to generate exactly the images you're looking for.

1. Photorealistic scenes
For realistic images, use photography terms. Mention camera angles, lens types, lighting, and fine details to guide the model toward a photorealistic result.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt =
    "A photorealistic close-up portrait of an elderly Japanese ceramicist with deep, sun-etched wrinkles and a warm, knowing smile. He is carefully inspecting a freshly glazed tea bowl. The setting is his rustic, sun-drenched workshop with pottery wheels and shelves of clay pots in the background. The scene is illuminated by soft, golden hour light streaming through a window, highlighting the fine texture of the clay and the fabric of his apron. Captured with an 85mm portrait lens, resulting in a soft, blurred background (bokeh). The overall mood is serene and masterful.";

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("photorealistic_example.png", buffer);
      console.log("Image saved as photorealistic_example.png");
    }
  }
}

main();



 Stylized illustrations & stickers
To create stickers, icons, or assets, be explicit about the style and request a transparent background.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt =
    "A kawaii-style sticker of a happy red panda wearing a tiny bamboo hat. It's munching on a green bamboo leaf. The design features bold, clean outlines, simple cel-shading, and a vibrant color palette. The background must be white.";

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("red_panda_sticker.png", buffer);
      console.log("Image saved as red_panda_sticker.png");
    }
  }
}

main();



3. Accurate text in images
Gemini excels at rendering text. Be clear about the text, the font style (descriptively), and the overall design. Use Gemini 3 Pro Image Preview for professional asset production.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt =
    "Create a modern, minimalist logo for a coffee shop called 'The Daily Grind'. The text should be in a clean, bold, sans-serif font. The color scheme is black and white. Put the logo in a circle. Use a coffee bean in a clever way.";

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("logo_example.jpg", buffer);
      console.log("Image saved as logo_example.jpg");
    }
  }
}

main();



4. Product mockups & commercial photography
Perfect for creating clean, professional product shots for ecommerce, advertising, or branding.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt =
    "A high-resolution, studio-lit product photograph of a minimalist ceramic coffee mug in matte black, presented on a polished concrete surface. The lighting is a three-point softbox setup designed to create soft, diffused highlights and eliminate harsh shadows. The camera angle is a slightly elevated 45-degree shot to showcase its clean lines. Ultra-realistic, with sharp focus on the steam rising from the coffee. Square image.";

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("product_mockup.png", buffer);
      console.log("Image saved as product_mockup.png");
    }
  }
}

main();




5. Minimalist & negative space design
Excellent for creating backgrounds for websites, presentations, or marketing materials where text will be overlaid.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt =
    "A minimalist composition featuring a single, delicate red maple leaf positioned in the bottom-right of the frame. The background is a vast, empty off-white canvas, creating significant negative space for text. Soft, diffused lighting from the top left. Square image.";

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("minimalist_design.png", buffer);
      console.log("Image saved as minimalist_design.png");
    }
  }
}

main();



6. Sequential art (Comic panel / Storyboard)
Builds on character consistency and scene description to create panels for visual storytelling. For accuracy with text and storytelling ability, these prompts work best with Gemini 3 Pro and Gemini 3.1 Flash Image Preview.




import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath = "/path/to/your/man_in_white_glasses.jpg";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    {text: "Make a 3 panel comic in a gritty, noir art style with high-contrast black and white inks. Put the character in a humurous scene."},
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("comic_panel.jpg", buffer);
      console.log("Image saved as comic_panel.jpg");
    }
  }
}

main();



7. Grounding with Google Search
Use Google Search to generate images based on recent or real-time information. This is useful for news, weather, and other time-sensitive topics.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt = "Make a simple but stylish graphic of last night's Arsenal game in the Champion's League";

  const aspectRatio = '16:9';
  const resolution = '2K';

const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: resolution,
      },
      tools: [{"google_search": {}}],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("football-score.jpg", buffer);
      console.log("Image saved as football-score.jpg");
    }
  }

}

main();




Prompts for editing images
These examples show how to provide images alongside your text prompts for editing, composition, and style transfer.

1. Adding and removing elements
Provide an image and describe your change. The model will match the original image's style, lighting, and perspective.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath = "/path/to/your/cat_photo.png";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    { text: "Using the provided image of my cat, please add a small, knitted wizard hat on its head. Make it look like it's sitting comfortably and not falling off." },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("cat_with_hat.png", buffer);
      console.log("Image saved as cat_with_hat.png");
    }
  }
}

main();



2. Inpainting (Semantic masking)
Conversationally define a "mask" to edit a specific part of an image while leaving the rest untouched.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath = "/path/to/your/living_room.png";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
    { text: "Using the provided image of a living room, change only the blue sofa to be a vintage, brown leather chesterfield sofa. Keep the rest of the room, including the pillows on the sofa and the lighting, unchanged." },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("living_room_edited.png", buffer);
      console.log("Image saved as living_room_edited.png");
    }
  }
}

main();



3. Style transfer
Provide an image and ask the model to recreate its content in a different artistic style.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath = "/path/to/your/city.png";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
    { text: "Transform the provided photograph of a modern city street at night into the artistic style of Vincent van Gogh's 'Starry Night'. Preserve the original composition of buildings and cars, but render all elements with swirling, impasto brushstrokes and a dramatic palette of deep blues and bright yellows." },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("city_style_transfer.png", buffer);
      console.log("Image saved as city_style_transfer.png");
    }
  }
}

main();




4. Advanced composition: Combining multiple images
Provide multiple images as context to create a new, composite scene. This is perfect for product mockups or creative collages.



import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath1 = "/path/to/your/dress.png";
  const imageData1 = fs.readFileSync(imagePath1);
  const base64Image1 = imageData1.toString("base64");
  const imagePath2 = "/path/to/your/model.png";
  const imageData2 = fs.readFileSync(imagePath2);
  const base64Image2 = imageData2.toString("base64");

  const prompt = [
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image1,
      },
    },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image2,
      },
    },
    { text: "Create a professional e-commerce fashion photo. Take the blue floral dress from the first image and let the woman from the second image wear it. Generate a realistic, full-body shot of the woman wearing the dress, with the lighting and shadows adjusted to match the outdoor environment." },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("fashion_ecommerce_shot.png", buffer);
      console.log("Image saved as fashion_ecommerce_shot.png");
    }
  }
}

main();




5. High-fidelity detail preservation
To ensure critical details (like a face or logo) are preserved during an edit, describe them in great detail along with your edit request.




import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath1 = "/path/to/your/woman.png";
  const imageData1 = fs.readFileSync(imagePath1);
  const base64Image1 = imageData1.toString("base64");
  const imagePath2 = "/path/to/your/logo.png";
  const imageData2 = fs.readFileSync(imagePath2);
  const base64Image2 = imageData2.toString("base64");

  const prompt = [
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image1,
      },
    },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image2,
      },
    },
    { text: "Take the first image of the woman with brown hair, blue eyes, and a neutral expression. Add the logo from the second image onto her black t-shirt. Ensure the woman's face and features remain completely unchanged. The logo should look like it's naturally printed on the fabric, following the folds of the shirt." },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("woman_with_logo.png", buffer);
      console.log("Image saved as woman_with_logo.png");
    }
  }
}

main();





6. Bring something to life
Upload a rough sketch or drawing and ask the model to refine it into a finished image.




import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath = "/path/to/your/car_sketch.png";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
    { text: "Turn this rough pencil sketch of a futuristic car into a polished photo of the finished concept car in a showroom. Keep the sleek lines and low profile from the sketch but add metallic blue paint and neon rim lighting." },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("car_photo.png", buffer);
      console.log("Image saved as car_photo.png");
    }
  }
}

main();




7. Character consistency: 360 view
You can generate 360-degree views of a character by iteratively prompting for different angles. For best results, include previously generated images in subsequent prompts to maintain consistency. For complex poses, include a reference image of the desired pose.




import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath = "/path/to/your/man_in_white_glasses.jpg";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    { text: "A studio portrait of this man against white, in profile looking right" },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("man_right_profile.png", buffer);
      console.log("Image saved as man_right_profile.png");
    }
  }
}

main();




Best Practices
To elevate your results from good to great, incorporate these professional strategies into your workflow.

Be Hyper-Specific: The more detail you provide, the more control you have. Instead of "fantasy armor," describe it: "ornate elven plate armor, etched with silver leaf patterns, with a high collar and pauldrons shaped like falcon wings."
Provide Context and Intent: Explain the purpose of the image. The model's understanding of context will influence the final output. For example, "Create a logo for a high-end, minimalist skincare brand" will yield better results than just "Create a logo."
Iterate and Refine: Don't expect a perfect image on the first try. Use the conversational nature of the model to make small changes. Follow up with prompts like, "That's great, but can you make the lighting a bit warmer?" or "Keep everything the same, but change the character's expression to be more serious."
Use Step-by-Step Instructions: For complex scenes with many elements, break your prompt into steps. "First, create a background of a serene, misty forest at dawn. Then, in the foreground, add a moss-covered ancient stone altar. Finally, place a single, glowing sword on top of the altar."
Use "Semantic Negative Prompts": Instead of saying "no cars," describe the desired scene positively: "an empty, deserted street with no signs of traffic."
Control the Camera: Use photographic and cinematic language to control the composition. Terms like wide-angle shot, macro shot, low-angle perspective.
Limitations
For best performance, use the following languages: EN, ar-EG, de-DE, es-MX, fr-FR, hi-IN, id-ID, it-IT, ja-JP, ko-KR, pt-BR, ru-RU, ua-UA, vi-VN, zh-CN.
Image generation does not support audio or video inputs.
The model won't always follow the exact number of image outputs that the user explicitly asks for.
gemini-2.5-flash-image works best with up to 3 images as input, while gemini-3-pro-image-preview supports 5 images with high fidelity, and up to 14 images in total. gemini-3.1-flash-image-preview supports character resemblance of up to 4 characters and the fidelity of up to 10 objects in a single workflow.
When generating text for an image, Gemini works best if you first generate the text and then ask for an image with the text.
gemini-3.1-flash-image-preview Grounding with Google Search does not support using real-world images of people from web search at this time.
All generated images include a SynthID watermark.
Optional configurations
You can optionally configure the response modalities and aspect ratio of the model's output in the config field of generate_content calls.

Output types
The model defaults to returning text and image responses (i.e. response_modalities=['Text', 'Image']). You can configure the response to return only images without text using response_modalities=['Image'].





const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
    config: {
        responseModalities: ['Image']
    }
  });




  Aspect ratios and image size
The model defaults to matching the output image size to that of your input image, or otherwise generates 1:1 squares. You can control the aspect ratio of the output image using the aspect_ratio field under image_config in the response request, shown here:



// For gemini-2.5-flash-image
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      },
    }
  });

// For gemini-3.1-flash-image-preview and gemini-3-pro-image-preview
const response_gemini3 = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "2K",
      },
    }
  });





  The different ratios available and the size of the image generated are listed in the following tables:




Gemini 2.5 Flash Image:

Aspect ratio	Resolution	Tokens
1:1	1024x1024	1290
2:3	832x1248	1290
3:2	1248x832	1290
3:4	864x1184	1290
4:3	1184x864	1290
4:5	896x1152	1290
5:4	1152x896	1290
9:16	768x1344	1290
16:9	1344x768	1290
21:9	1536x672	1290e 