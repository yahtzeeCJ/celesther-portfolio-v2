
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// You must have a GEMINI_API_KEY environment variable set.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
