export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percent_daily_value?: number;
  standard_content?: {
    name: string;
    amount: number;
    unit: string;
  };
}

export interface NutritionResponse {
  food?: string;
  ingredients?: string[];
  nutrients: Nutrient[];
  error?: string;
}

export interface SearchResult {
  food: string;
  nutrients: Nutrient[];
}

export interface NutritionState {
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  nutritionData: NutritionResponse | null;
  searchHistory: string[];
}
