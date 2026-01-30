import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for food (e.g., 'avocado') or ingredients..."
          className="w-full pl-6 pr-32 py-4 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all duration-300"
          disabled={isLoading}
        />
        <div className="absolute right-2 top-2 bottom-2">
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="h-full bg-slate-900 hover:bg-slate-800 text-white px-6 rounded-xl text-sm font-medium shadow-md shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            ) : 'Analyze'}
          </button>
        </div>
      </form>
      <div className="mt-3 flex items-center justify-between text-xs px-2">
        <p className="text-slate-500 font-medium">
          <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded mr-2">Tip</span>
          Separate ingredients with commas
        </p>
        <p className="text-slate-400 italic">e.g. "oats, milk, banana"</p>
      </div>
    </div>
  );
};

export default SearchBar;
