'use server';

/**
 * @fileOverview An AI agent that generates a description of a pixel based on the surrounding area.
 *
 * - generatePixelDescription - A function that handles the pixel description generation process.
 * - GeneratePixelDescriptionInput - The input type for the generatePixelDescription function.
 * - GeneratePixelDescriptionOutput - The return type for the generatePixelDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePixelDescriptionInputSchema = z.object({
  x: z.number().describe('The x coordinate of the pixel.'),
  y: z.number().describe('The y coordinate of the pixel.'),
  surroundingAreaImageDataUri: z
    .string()
    .describe(
      "A data URI of the surrounding area image data that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' for the pixel."
    ),
});
export type GeneratePixelDescriptionInput = z.infer<typeof GeneratePixelDescriptionInputSchema>;

const GeneratePixelDescriptionOutputSchema = z.object({
  description: z.string().describe('A description of the selected pixel based on the surrounding area.'),
});
export type GeneratePixelDescriptionOutput = z.infer<typeof GeneratePixelDescriptionOutputSchema>;

export async function generatePixelDescription(
  input: GeneratePixelDescriptionInput
): Promise<GeneratePixelDescriptionOutput> {
  return generatePixelDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePixelDescriptionPrompt',
  input: {schema: GeneratePixelDescriptionInputSchema},
  output: {schema: GeneratePixelDescriptionOutputSchema},
  prompt: `You are an AI assistant that generates a description of a pixel based on the surrounding area.

  You will receive the coordinates of the pixel and the image data of the surrounding area.
  You will generate a description of the selected pixel based on the content in the surrounding area.

  Pixel coordinates: x: {{{x}}}, y: {{{y}}}
  Surrounding area image: {{media url=surroundingAreaImageDataUri}}

  Description:`,
});

const generatePixelDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePixelDescriptionFlow',
    inputSchema: GeneratePixelDescriptionInputSchema,
    outputSchema: GeneratePixelDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
