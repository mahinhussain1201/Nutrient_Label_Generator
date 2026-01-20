const API_BASE_URL = 'http://localhost:5000/api';

export const searchNutrition = async (query: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/nutrition?food=${encodeURIComponent(query)}`);
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

export const searchMultipleIngredients = async (ingredients: string[]): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/nutrition?ingredient_list=${encodeURIComponent(ingredients.join(','))}`
    );
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
