
'use server';
/**
 * @fileOverview An AI flow to generate project descriptions.
 *
 * - summarizeProject - A function that generates a project description based on keywords.
 */

import {ai} from '@/ai/genkit';
import {
  ProjectSummaryInputSchema,
  ProjectSummaryOutputSchema,
  type ProjectSummaryInput,
  type ProjectSummaryOutput,
} from '@/ai/schemas';


// Define the prompt for Gemini
const summaryPrompt = ai.definePrompt({
    name: 'projectSummaryPrompt',
    input: { schema: ProjectSummaryInputSchema },
    output: { schema: ProjectSummaryOutputSchema },
    prompt: `You are an expert copywriter for a creative professional's portfolio. Your task is to write a compelling, 2-3 sentence project description.

    The description should be:
    - Written in the first person (e.g., "In this project, I explored...").
    - Professional, engaging, and concise.
    - Based on the provided keywords.
    - If a current description is provided, use it as inspiration but create a new, improved version.
    
    Keywords: {{{keywords}}}
    {{#if currentDescription}}
    Current Description (for context): {{{currentDescription}}}
    {{/if}}
    `,
});

// Define the flow
const summarizeProjectFlow = ai.defineFlow(
  {
    name: 'summarizeProjectFlow',
    inputSchema: ProjectSummaryInputSchema,
    outputSchema: ProjectSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await summaryPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);

// Exported function to be called from the frontend
export async function summarizeProject(input: ProjectSummaryInput): Promise<ProjectSummaryOutput> {
  return summarizeProjectFlow(input);
}
