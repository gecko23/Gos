
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import {GoogleGenAI, Modality, FunctionDeclaration, Type} from '@google/genai';
import {APP_DEFINITIONS_CONFIG, getSystemPrompt} from '../constants'; // Import getSystemPrompt and APP_DEFINITIONS_CONFIG
import {InteractionData, ConversationalResponse, GroundingChunk} from '../types';

if (!process.env.API_KEY) {
  // This is a critical error. In a real app, you might throw or display a persistent error.
  // For this environment, logging to console is okay, but the app might not function.
  console.error(
    'API_KEY environment variable is not set. The application will not be able to connect to the Gemini API.',
  );
}

const getAiClient = () => new GoogleGenAI({apiKey: process.env.API_KEY!});

export async function* streamAppContent(
  interactionHistory: InteractionData[],
  currentMaxHistoryLength: number, // Receive current max history length
  isDeepThinkingEnabled: boolean = false, // Added thinking mode flag
): AsyncGenerator<string, void, void> {
  const model = isDeepThinkingEnabled ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  if (!process.env.API_KEY) {
    yield `<div class="p-4 text-red-700 bg-red-100 rounded-lg">
      <p class="font-bold text-lg">Configuration Error</p>
      <p class="mt-2">The API_KEY is not configured. Please set the API_KEY environment variable.</p>
    </div>`;
    return;
  }

  if (interactionHistory.length === 0) {
    yield `<div class="p-4 text-orange-700 bg-orange-100 rounded-lg">
      <p class="font-bold text-lg">No interaction data provided.</p>
    </div>`;
    return;
  }

  const systemPrompt = getSystemPrompt(currentMaxHistoryLength); // Generate system prompt dynamically

  const currentInteraction = interactionHistory[0];
  // pastInteractions already respects currentMaxHistoryLength due to slicing in App.tsx
  const pastInteractions = interactionHistory.slice(1);

  const currentElementName =
    currentInteraction.elementText ||
    currentInteraction.id ||
    'Unknown Element';
  let currentInteractionSummary = `Current User Interaction: Clicked on '${currentElementName}' (Type: ${currentInteraction.type || 'N/A'}, ID: ${currentInteraction.id || 'N/A'}).`;
  if (currentInteraction.value) {
    currentInteractionSummary += ` Associated value: '${currentInteraction.value.substring(0, 100)}'.`;
  }
  if (currentInteraction.isDirectUrlNavigation) {
    currentInteractionSummary += ` This is a direct URL navigation request.`;
  }

  const currentAppDef = APP_DEFINITIONS_CONFIG.find(
    (app) => app.id === currentInteraction.appContext,
  );
  const currentAppContext = currentInteraction.appContext
    ? `Current App Context: '${currentAppDef?.name || currentInteraction.appContext}'.`
    : 'No specific app context for current interaction.';

  let historyPromptSegment = '';
  if (pastInteractions.length > 0) {
    // The number of previous interactions to mention in the prompt text.
    const numPrevInteractionsToMention =
      currentMaxHistoryLength - 1 > 0 ? currentMaxHistoryLength - 1 : 0;
    historyPromptSegment = `\n\nPrevious User Interactions (up to ${numPrevInteractionsToMention} most recent, oldest first in this list segment but chronologically before current):`;

    // Iterate over the pastInteractions array, which is already correctly sized
    pastInteractions.forEach((interaction, index) => {
      const pastElementName =
        interaction.elementText || interaction.id || 'Unknown Element';
      const appDef = APP_DEFINITIONS_CONFIG.find(
        (app) => app.id === interaction.appContext,
      );
      const appName = interaction.appContext
        ? appDef?.name || interaction.appContext
        : 'N/A';
      historyPromptSegment += `\n${index + 1}. (App: ${appName}) Clicked '${pastElementName}' (Type: ${interaction.type || 'N/A'}, ID: ${interaction.id || 'N/A'})`;
      if (interaction.value) {
        historyPromptSegment += ` with value '${interaction.value.substring(0, 50)}'`;
      }
      if (interaction.isDirectUrlNavigation) {
        historyPromptSegment += ` (Direct URL nav)`;
      }
      historyPromptSegment += '.';
    });
  }

  const fullPrompt = `${systemPrompt}

${currentInteractionSummary}
${currentAppContext}
${historyPromptSegment}

Full Context for Current Interaction (for your reference, primarily use summaries and history):
${JSON.stringify(currentInteraction, null, 1)}

Generate the HTML content for the window's content area only:`;

  try {
    const ai = getAiClient();
    const config: any = {};

    // Conditionally add googleSearch tool for Keyword Researcher app
    if (currentInteraction.appContext === 'keyword_researcher_app') {
      config.tools = [{ googleSearch: {} }];
    }

    // Enable thinking if requested
    if (isDeepThinkingEnabled) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContentStream({
      model: model,
      contents: fullPrompt,
      config: config,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        // Ensure text property exists and is not empty
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Error streaming from Gemini:', error);
    let errorMessage = 'An error occurred while generating content.';
    // Check if error is an instance of Error and has a message property
    if (error instanceof Error && typeof error.message === 'string') {
      errorMessage += ` Details: ${error.message}`;
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as any).message === 'string'
    ) {
      // Handle cases where error might be an object with a message property (like the API error object)
      errorMessage += ` Details: ${(error as any).message}`;
    } else if (typeof error === 'string') {
      errorMessage += ` Details: ${error}`;
    }

    yield `<div class="p-4 text-red-700 bg-red-100 rounded-lg">
      <p class="font-bold text-lg">Error Generating Content</p>
      <p class="mt-2">${errorMessage}</p>
      <p class="mt-1">This may be due to an API key issue, network problem, or misconfiguration. Please check the developer console for more details.</p>
    </div>`;
  }
}

const CONVERSATIONAL_SYSTEM_PROMPT = `You are G Assistant, a helpful and friendly voice assistant integrated into G OS.
Keep your answers concise, conversational, and to the point.
If the user asks for information that may be recent or time-sensitive, use the search tool.
Do not use Markdown or any special formatting. Just plain text.`;

// Function declaration for opening an application
export const openAppFunctionDeclaration: FunctionDeclaration = {
  name: 'openApp',
  description: 'Opens a specific application in the Gemini OS. Use the exact application name as displayed on the desktop.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      appName: {
        type: Type.STRING,
        description: 'The exact name of the application to open, e.g., "Web", "Terminal", "Image Studio".',
      },
    },
    required: ['appName'],
  },
};

// Function declaration for simulating printing content
export const printContentFunctionDeclaration: FunctionDeclaration = {
  name: 'printContent',
  description: 'Simulates printing text content to a document with a specified format.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: {
        type: Type.STRING,
        description: 'The text content to be printed.',
      },
      format: {
        type: Type.STRING,
        description: 'The desired output format for printing (e.g., "PDF", "TXT").',
      },
    },
    required: ['content', 'format'],
  },
};

// Function declaration for opening a URL directly in the web browser
export const openUrlFunctionDeclaration: FunctionDeclaration = {
  name: 'openUrl',
  description: 'Opens a specific URL in the web browser.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description: 'The full URL to open, e.g., "https://www.google.com". Ensure it starts with "http://" or "https://".',
      },
    },
    required: ['url'],
  },
};


export async function getConversationalResponse(
  prompt: string,
): Promise<ConversationalResponse> {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not configured.');
  }
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using latest model for conversational responses.
      contents: prompt,
      config: {
        systemInstruction: CONVERSATIONAL_SYSTEM_PROMPT,
        tools: [{
          googleSearch: {},
          functionDeclarations: [
            openAppFunctionDeclaration,
            printContentFunctionDeclaration,
            openUrlFunctionDeclaration, // Added openUrlFunctionDeclaration
          ],
        }],
      },
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    const functionCalls = response.functionCalls || [];

    return {
        text: response.text || "I'm listening...",
        sources: sources.filter(s => s.web?.uri), // Ensure we only return sources with a URI
        functionCalls: functionCalls,
    };

  } catch (error) {
    console.error('Error getting conversational response from Gemini:', error);
    return {
      text: 'Sorry, I encountered an error while trying to respond.',
      sources: [],
      functionCalls: [],
    };
  }
}

export async function generateSpeech(text: string): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not configured.');
  }
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{parts: [{text: text}]}],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Zephyr'}, // A friendly voice
          },
        },
      },
    });
    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data received from TTS API.');
    }
    return base64Audio;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech.');
  }
}

export async function generateImage(prompt: string): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not configured.');
  }
  const ai = getAiClient();
  
  try {
    // Using gemini-2.5-flash-image which is the default for general image tasks.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }]
        }
    });

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
        
        // If no image, check for text response (e.g. safety block or refusal)
        for (const part of candidate.content.parts) {
          if (part.text) {
            throw new Error(`Model responded with text instead of an image: ${part.text}`);
          }
        }
      }
      
      if (candidate.finishReason) {
        throw new Error(`Generation stopped. Reason: ${candidate.finishReason}`);
      }
    }
    
    throw new Error('No image generated and no text response provided.');
  } catch (error: any) {
    console.error('Error generating image:', error);
    throw new Error(error.message || 'Failed to generate image.');
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not configured.');
  }
  const ai = getAiClient();
  const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text to ${targetLanguage}. Provide only the translation, without any introductory phrases like "Here is the translation:" or quotes:\n\n${text}`,
  });
  
  return response.text?.trim() || "";
}

export async function translateImage(base64Image: string, mimeType: string, targetLanguage: string): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not configured.');
  }
  const ai = getAiClient();

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: `Identify and translate all text in this image to ${targetLanguage}. If there is no text, respond with "No text found in the image.". Provide only the translation, without any introductory phrases.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, textPart] },
  });

  return response.text?.trim() || "";
}

export async function generateSeoArticle(
    keyword: string,
    audience: string,
    tone: string,
    secondaryKeywords: string
): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY is not configured.');
    }
    const ai = getAiClient();

    const prompt = `
        You are an expert SEO content writer. Your task is to write a high-quality, comprehensive, and engaging article that is optimized for search engines.

        **Main Topic/Keyword:** "${keyword}"

        **Target Audience:** "${audience || 'General audience'}"

        **Desired Tone of Voice:** "${tone || 'Informative and professional'}"

        **Secondary Keywords to include (if any):** "${secondaryKeywords || 'None'}"

        **Instructions:**
        1.  **Title (H1):** Create a compelling, SEO-friendly title that includes the main keyword.
        2.  **Introduction:** Write a captivating introduction that hooks the reader and clearly states what the article is about. Naturally include the main keyword within the first 1-2 sentences.
        3.  **Body Content:**
            *   Structure the article with logical H2 subheadings that break up the content and improve readability. Use H3s for sub-points where necessary.
            *   Naturally weave the main keyword and secondary keywords throughout the body. Avoid keyword stuffing; the language must flow naturally.
            *   Provide valuable, accurate, and in-depth information on the topic.
            *   Use paragraphs, bullet points, and numbered lists to make the content easy to scan and digest.
        4.  **Conclusion:** Write a strong conclusion that summarizes the key points and provides a clear takeaway for the reader.
        5.  **Formatting:** Return the entire article as a single block of plain text. Use Markdown syntax for formatting (e.g., '# Title' for H1, '## Subheading' for H2, '*' for bullet points). Do not include any HTML or other code.

        Please begin writing the article now.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });

    return response.text?.trim() || "";
}

export async function editMedia(base64Data: string, mimeType: string, prompt: string): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY is not configured.');
    }
    const ai = getAiClient();
    // Using gemini-2.5-flash-image as per guidelines for image editing
    const model = 'gemini-2.5-flash-image';

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
        });

        // Check for image response in candidates
        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    // Return the base64 image data url
                    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                }
            }
        }
        
        throw new Error('No image data received from the AI model. Try a different prompt.');

    } catch (error: any) {
        console.error("Edit Media Error", error);
        throw new Error(error.message || "Failed to edit media.");
    }
}

export async function animateImage(base64Image: string, mimeType: string, prompt: string): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY is not configured.');
    }
    const ai = getAiClient();
    
    // Veo generation
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: base64Image,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9',
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error('No video URI returned.');
    
    return `${videoUri}&key=${process.env.API_KEY}`;
}

/**
 * Deep Multimodal Analysis using Gemini 3 Pro with thinking capabilities.
 */
export async function analyzeContent(
    prompt: string,
    fileData?: { data: string; mimeType: string }
): Promise<string> {
    if (!process.env.API_KEY) throw new Error('API_KEY is not configured.');
    const ai = getAiClient();
    
    const parts: any[] = [];
    if (fileData) {
        parts.push({
            inlineData: fileData
        });
    }
    parts.push({ text: prompt });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts },
            config: {
                thinkingConfig: { thinkingBudget: 32768 } // Upgraded to max budget
            }
        });

        return response.text || "No analysis provided.";
    } catch (error: any) {
        console.error("Analysis Error", error);
        throw new Error(error.message || "Failed to analyze content.");
    }
}

export interface KeywordData {
    keyword: string;
    vol: number;
    cpc: number;
    competition: 'High' | 'Medium' | 'Low';
    difficulty: number; // 0-100 score
    trend: number[]; // Array of numbers 0-100 for sparkline
}

export async function generateKeywordIdeas(seedKeyword: string): Promise<KeywordData[]> {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY is not configured.');
    }
    const ai = getAiClient();
    
    // We are simulating Google Ads API output using Gemini's knowledge
    const prompt = `
        You are acting as the Google Ads Keyword Planner API. 
        I need you to generate a JSON array of 12 keyword ideas related to the seed keyword: "${seedKeyword}".
        
        For each keyword, provide:
        - "keyword": the keyword string
        - "vol": estimated monthly search volume (integer, realistic for the term)
        - "cpc": estimated cost per click in USD (float)
        - "competition": "High", "Medium", or "Low"
        - "difficulty": an integer from 0 to 100 representing SEO difficulty (KD)
        - "trend": an array of 6 integers (0-100) representing search interest over the last 6 months.

        Respond ONLY with the raw JSON array. Do not include markdown formatting or explanation.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        const jsonStr = response.text?.trim() || "[]";
        // Remove markdown code blocks if they exist (clean up)
        const cleanJson = jsonStr.replace(/^```json/, '').replace(/```$/, '');
        
        return JSON.parse(cleanJson) as KeywordData[];
    } catch (error) {
        console.error("Keyword Researcher Error", error);
        throw new Error("Failed to fetch keyword data.");
    }
}

export interface RoutineTask {
  task: string;
  time?: string;
  category: string;
}

export async function generateRoutine(userPrompt: string): Promise<RoutineTask[]> {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY is not configured.');
    }
    const ai = getAiClient();
    
    const prompt = `
        You are a productivity expert. Create a daily schedule or routine based on this request: "${userPrompt}".
        Assign realistic times for each activity to fill a logical day.
        
        Structure the output as a JSON array of objects with:
        - "task": The task description.
        - "time": Suggested time (e.g., "8:00 AM") or duration.
        - "category": A short category name (Work, Personal, Important, Other).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            task: { type: Type.STRING },
                            time: { type: Type.STRING, nullable: true },
                            category: { type: Type.STRING }
                        },
                        required: ["task", "category"]
                    }
                }
            }
        });

        const jsonStr = response.text?.trim();
        if (!jsonStr) return [];
        return JSON.parse(jsonStr) as RoutineTask[];
    } catch (error) {
        console.error("Routine Generation Error", error);
        throw new Error("Failed to generate routine.");
    }
}

export interface TrendDataPoint {
    date: string;
    [term: string]: number | string;
}

export interface TrendsResult {
    timeline: TrendDataPoint[];
    related: {
        [term: string]: Array<{ query: string; value: string }>; // value like "+150%"
    };
    averages: {
        [term: string]: number;
    }
}

export async function generateTrendsAnalysis(terms: string[], location: string = 'United States'): Promise<TrendsResult> {
    if (!process.env.API_KEY) throw new Error('API_KEY is not configured.');
    const ai = getAiClient();

    const prompt = `
        Act as Google Trends. Generate realistic trend data for the following search terms: ${JSON.stringify(terms)}.
        Timeframe: Past 12 months.
        Location: ${location}.
        
        Return a raw JSON object (no markdown) with this exact structure:
        {
            "timeline": [
                { "date": "Jan", "${terms[0]}": 50, "${terms[1] || 'null'}": 20, ... },
                ... (12 points for months)
            ],
            "related": {
                "${terms[0]}": [ { "query": "related query 1", "value": "Breakout" }, ... (top 5) ],
                ...
            },
            "averages": {
                "${terms[0]}": 45,
                ...
            }
        }
        
        Ensure data points are integers 0-100.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        return JSON.parse(response.text || "{}");
    } catch (error: any) {
        console.error("Trends Error", error);
        throw new Error("Failed to generate trends.");
    }
}
