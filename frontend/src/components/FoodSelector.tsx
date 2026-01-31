import React from 'react';

interface FoodSelectorProps {
  items: string[];
  onSelect: (item: string) => void;
  isLoading?: boolean;
}

const FoodSelector: React.FC<FoodSelectorProps> = ({ items, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="p-4 bg-emerald-50 border-b border-emerald-100">
        <h3 className="text-emerald-800 font-semibold">Select a food item</h3>
        <p className="text-sm text-emerald-600">Multiple matches found. Please select the specific item you meant.</p>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelect(item)}
              className="w-full text-left px-6 py-3 hover:bg-emerald-50 transition-colors duration-200 group flex items-center justify-between"
            >
              <span className="text-gray-700 group-hover:text-emerald-700 font-medium">{item}</span>
              <svg 
                className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodSelector;
