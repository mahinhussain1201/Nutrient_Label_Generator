const API_BASE_URL = 'http://localhost:5000/api';

export interface Ingredient {
  name: string;
  quantity_g: number;
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  per_100g?: number;
}

export interface NutritionData {
  ingredient: string;
  quantity_g: number;
  nutrients: Nutrient[];
}

export interface MultipleNutritionResponse {
  ingredients: NutritionData[];
  total_nutrients: Nutrient[];
  not_found: string[];
}

export const searchNutrition = async (query: string, quantity: number = 100): Promise<NutritionData> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/nutrition/single?food=${encodeURIComponent(query)}&quantity_g=${quantity}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch nutrition data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    throw error;
  }
};

export const searchMultipleIngredients = async (ingredients: Ingredient[]): Promise<MultipleNutritionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/nutrition/multiple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ingredients)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch nutrition data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching nutrition data for multiple ingredients:', error);
    throw error;
  }
};

export const fuzzySearch = async (query: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/fuzzy?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fuzzy search failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error performing fuzzy search:', error);
    throw error;
  }
};

export const fetchSuggestions = async (query: string): Promise<string[]> => {
  if (query.trim().length < 2) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};
