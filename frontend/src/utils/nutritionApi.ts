const API_BASE_URL = 'http://localhost:5000/api';

export interface FoodItem {
  id: string;
  name: string;
  group?: string;
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  per_100g?: number;
}

export interface FoodNutrition {
  id: string;
  name: string;
  amount: number;
  unit: string;
  nutrients: Nutrient[];
}

export interface CalculatedNutrition {
  ingredients: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
    nutrients: Record<string, Nutrient>;
  }>;
  totals: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
}

// Search for food items by name
export const searchFoods = async (query: string, limit: number = 10): Promise<FoodItem[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/foods/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search for foods');
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching for foods:', error);
    throw error;
  }
};

// Get nutrition information for a specific food item
export const getFoodNutrition = async (
  foodId: string, 
  amount: number = 100
): Promise<FoodNutrition> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/foods/${foodId}/nutrition?amount=${amount}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch nutrition data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching food nutrition:', error);
    throw error;
  }
};

// Calculate nutrition for a list of ingredients
export const calculateNutrition = async (
  ingredients: Array<{ id: string; amount: number }>
): Promise<CalculatedNutrition> => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to calculate nutrition');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calculating nutrition:', error);
    throw error;
  }
};

// Check if the API is running
export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
