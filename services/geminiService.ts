import { GoogleGenAI } from "@google/genai";
import { Restaurant } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get today's weekday in Traditional Chinese (e.g., "星期一")
function getTodayWeekday(): string {
  return new Date().toLocaleDateString('zh-TW', { weekday: 'long' });
}

// Helper to parse the raw text into restaurant objects
// We expect Gemini to return a numbered list formatted specifically to make this easier.
function parseRestaurantsFromText(text: string, groundingChunks: any[]): Restaurant[] {
  const lines = text.split('\n');
  const restaurants: Restaurant[] = [];
  
  // Regex to find lines starting with "1. **Name**" or "1. Name"
  // Adapted to handle Chinese characters and potential formatting variations
  // Captures: 1=Name, 2=Description
  const nameRegex = /^\d+\.?\s*(?:\*\*)?([^*\n]+)(?:\*\*)?(?:[:\s-]*)(.*)/;

  let currentRestaurant: Partial<Restaurant> | null = null;
  let count = 0;

  lines.forEach((line) => {
    const match = line.trim().match(nameRegex);
    if (match) {
        if (currentRestaurant && currentRestaurant.name) {
             restaurants.push(currentRestaurant as Restaurant);
        }
        
        const rawName = match[1].trim();
        // Clean up name if it contains ratings or extra chars
        // e.g. "1. **好吃餐廳** (4.5 stars)" -> "好吃餐廳"
        const cleanName = rawName.split(/[\(（]/)[0].trim().replace(/[:：-]/g, ''); 
        
        currentRestaurant = {
            id: `gemini-${Date.now()}-${count++}`,
            name: cleanName,
            description: match[2]?.trim() || '',
            source: 'gemini',
            googleMapsUrl: '' // Will try to fill from grounding
        };
    } else if (currentRestaurant) {
        // Append description if line continues
        if (line.trim().length > 0 && !line.trim().startsWith('http')) {
             currentRestaurant.description += ' ' + line.trim();
        }
    }
  });

  // Push the last one
  if (currentRestaurant && currentRestaurant.name) {
    restaurants.push(currentRestaurant as Restaurant);
  }

  // Attempt to match grounding chunks (Maps links) to restaurants
  // This is a best-effort matching since grounding chunks aren't 1:1 mapped to list items in the API response structure directly
  if (groundingChunks && groundingChunks.length > 0) {
      restaurants.forEach(rest => {
          // Find a chunk that contains the restaurant name in its title
          const chunk = groundingChunks.find((c: any) => 
            c.web?.title?.includes(rest.name) || 
            c.maps?.title?.includes(rest.name) ||
            rest.name.includes(c.maps?.title || '$$$')
          );

          if (chunk) {
              if (chunk.maps?.uri) rest.googleMapsUrl = chunk.maps.uri;
              else if (chunk.web?.uri) rest.googleMapsUrl = chunk.web.uri;
          }
      });
  }

  // Fallback: If we couldn't parse structured data well, but we have grounding chunks, use the chunks directly
  if (restaurants.length === 0 && groundingChunks && groundingChunks.length > 0) {
      groundingChunks.forEach((chunk: any, index: number) => {
          const title = chunk.maps?.title || chunk.web?.title;
          const uri = chunk.maps?.uri || chunk.web?.uri;
          
          if (title && uri) {
              restaurants.push({
                  id: `gemini-chunk-${index}`,
                  name: title,
                  googleMapsUrl: uri,
                  description: 'Google Maps 推薦',
                  source: 'gemini'
              });
          }
      });
  }

  return restaurants.slice(0, 10); // Limit to 10 slices for the wheel
}

function getPriceInstruction(level?: string): string {
    if (!level) return "";
    switch(level) {
        case 'inexpensive': return "Strictly filter for inexpensive/affordable options (Price level $). Avoid expensive places.";
        case 'moderate': return "Strictly filter for moderately priced options (Price level $$).";
        case 'expensive': return "Strictly filter for expensive/high-end options (Price level $$$).";
        case 'very_expensive': return "Strictly filter for luxury/very expensive options (Price level $$$$).";
        default: return "";
    }
}

export const getNearbyRestaurants = async (lat: number, lng: number, radius: number, keyword?: string, priceLevel?: string): Promise<Restaurant[]> => {
  try {
    const distanceText = radius >= 1000 ? `${radius / 1000} km` : `${radius} meters`;
    const priceContext = getPriceInstruction(priceLevel);
    const today = getTodayWeekday();
    
    // Explicitly handling the "foreign country" hallucination issue
    // We emphasize that the search MUST be around the provided coordinates.
    // Added instruction to exclude closed restaurants based on current weekday.
    const promptContext = keyword 
        ? `Search for "${keyword}" restaurants strictly located within ${distanceText} of the user's current GPS coordinates (Lat: ${lat}, Lng: ${lng}).
           IMPORTANT: The user is physically located at these coordinates. Do NOT recommend restaurants in other countries (e.g. Thailand, Japan, Vietnam) unless the coordinates are actually there.
           Only show local restaurants in the immediate vicinity. 
           CRITICAL: Today is ${today}. Do NOT recommend restaurants that are closed on ${today}. Ensure the suggested places are likely open today.
           ${priceContext}`
        : `Search for popular restaurants strictly located within ${distanceText} of the user's current GPS coordinates (Lat: ${lat}, Lng: ${lng}).
           Focus on the closest options first. Do NOT recommend places outside this distance.
           CRITICAL: Today is ${today}. Do NOT recommend restaurants that are closed on ${today}. Ensure the suggested places are likely open today.
           ${priceContext}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${promptContext} 
      Please provide the output in Traditional Chinese (Taiwan).
      Format the output as a strictly numbered list. 
      Each line MUST start with the number, then the restaurant name, then a brief description.
      Example: 
      1. **餐廳名稱** - 簡短描述 (例如: 泰式料理/平價好吃)
      `,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
            retrievalConfig: {
                latLng: {
                    latitude: lat,
                    longitude: lng
                }
            }
        }
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return parseRestaurantsFromText(text, groundingChunks);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getRestaurantsByRegion = async (city: string, district: string, priceLevel?: string): Promise<Restaurant[]> => {
  try {
    const priceContext = getPriceInstruction(priceLevel);
    const today = getTodayWeekday();
    
    const query = `Recommend 8-10 popular restaurants in ${city}${district} (Taiwan). 
    Focus on local favorites with high ratings. 
    CRITICAL: Today is ${today}. Do NOT recommend restaurants that are closed on ${today}. Ensure the suggested places are likely open today.
    ${priceContext}
    Please provide the output in Traditional Chinese (Taiwan).
    Format the output as a strictly numbered list.
    Each line MUST start with the number, then the restaurant name, then a brief description.
    Example: 
    1. **餐廳名稱** - 簡短描述.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }], // Use maps to get real data links
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return parseRestaurantsFromText(text, groundingChunks);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};