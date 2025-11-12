import { useState } from 'react';

export default function Filters({ categorias, marcas, filters, onFilterChange }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Contar filtros ativos
  const activeFiltersCount = (filters.nome ? 1 : 0) + (filters.categoria ? 1 : 0) + (filters.marca ? 1 : 0);
  
  const clearFilters = () => {
    onFilterChange('nome', '');
    onFilterChange('categoria', '');
    onFilterChange('marca', '');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
      {/* Desktop: Filtros sempre visíveis */}
      <div className="hidden md:block p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por nome
            </label>
            <input
              type="text"
              value={filters.nome}
              onChange={(e) => onFilterChange('nome', e.target.value)}
              placeholder="Digite o nome do produto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={filters.categoria}
              onChange={(e) => onFilterChange('categoria', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <select
              value={filters.marca}
              onChange={(e) => onFilterChange('marca', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            >
              <option value="">Todas as marcas</option>
              {marcas.map((marca) => (
                <option key={marca} value={marca}>
                  {marca}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile: Botão para abrir filtros */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-primary-purple to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-primary-purple text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <svg 
            className={`w-5 h-5 transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Menu suspenso mobile */}
        {showMobileFilters && (
          <div className="p-4 border-t border-purple-200 bg-gray-50 animate-fade-in">
            <div className="space-y-4">
              {/* Buscar por nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar por nome
                </label>
                <input
                  type="text"
                  value={filters.nome}
                  onChange={(e) => onFilterChange('nome', e.target.value)}
                  placeholder="Digite o nome..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-sm"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={filters.categoria}
                  onChange={(e) => onFilterChange('categoria', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-sm bg-white"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  value={filters.marca}
                  onChange={(e) => onFilterChange('marca', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-sm bg-white"
                >
                  <option value="">Todas as marcas</option>
                  {marcas.map((marca) => (
                    <option key={marca} value={marca}>
                      {marca}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão limpar filtros */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    clearFilters();
                  }}
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

