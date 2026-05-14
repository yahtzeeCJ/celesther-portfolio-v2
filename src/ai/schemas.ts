/**
 * @fileOverview Defines the Zod schemas and TypeScript types for AI flows.
 * This file does not use the 'use server' directive and can safely export objects.
 */

import {z} from 'zod';

// Schema for generating project descriptions
export const ProjectSummaryInputSchema = z.object({
  keywords: z.string().describe('A comma-separated list of keywords about the project.'),
  currentDescription: z.string().optional().describe('The existing project description, if any, for context.'),
});
export type ProjectSummaryInput = z.infer<typeof ProjectSummaryInputSchema>;

export const ProjectSummaryOutputSchema = z.object({
  summary: z.string().describe('A compelling, professional summary for a portfolio project, written in the first person ("I created..."). Should be around 2-3 sentences.'),
});
export type ProjectSummaryOutput = z.infer<typeof ProjectSummaryOutputSchema>;
