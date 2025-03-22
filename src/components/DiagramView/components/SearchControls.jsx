import React from 'react';
import SearchBar from '../../SearchBar';

const SearchControls = ({
  handleSearch,
  isSearching,
  searchResults,
  currentResultIndex,
  goToPrevSearchResult,
  goToNextSearchResult,
  clearSearch
}) => {
  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <SearchBar onSearch={handleSearch} />
        
        {/* Controles de navegación de resultados */}
        {isSearching && (
          <div className="flex items-center bg-gray-800 rounded-md px-2 py-1 text-white">
            <span className="text-xs mr-2">
              {searchResults.length > 0 
                ? `${currentResultIndex + 1}/${searchResults.length}` 
                : '0 resultados'}
            </span>
            
            <button 
              onClick={goToPrevSearchResult}
              disabled={searchResults.length === 0}
              className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed p-1"
              aria-label="Resultado anterior"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && goToPrevSearchResult()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <button 
              onClick={goToNextSearchResult}
              disabled={searchResults.length === 0}
              className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed p-1"
              aria-label="Siguiente resultado"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && goToNextSearchResult()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Indicador de resultados y botón de limpiar */}
      {searchResults.length > 0 && (
        <div className="flex items-center gap-2 bg-gray-800 bg-opacity-70 rounded-md px-2 py-1 text-xs text-gray-300">
          <div>
            <span className="font-medium text-yellow-300">{searchResults.length}</span> 
            {` coincidencia${searchResults.length !== 1 ? 's' : ''} encontrada${searchResults.length !== 1 ? 's' : ''}`}
          </div>
          <button 
            onClick={clearSearch}
            className="text-gray-400 hover:text-white ml-auto"
            aria-label="Limpiar búsqueda"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && clearSearch()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchControls; 