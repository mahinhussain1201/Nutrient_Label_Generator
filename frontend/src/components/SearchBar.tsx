import { useState } from 'react';
import type { KeyboardEvent } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a food item (e.g., apple, chicken breast)..."
          className="flex-grow px-4 py-3 text-gray-700 focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className={`px-6 py-3 font-medium text-white ${isLoading || !query.trim() ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Try searching for foods like "chicken breast", "brown rice", or "broccoli"
      </p>
    </div>
  );
};

export default SearchBar;
