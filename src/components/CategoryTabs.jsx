import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

export default function CategoryTabs({ categories, active, onChange, search, onSearchChange }) {
  return (
    <div className="sticky top-[65px] z-40 border-b border-slate-200/80 bg-marfil/85 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3">
        {/* Buscador */}
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por plato o ingrediente… (huancaína, pota, chita, patita)"
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-11 text-[16px] text-slate-800 shadow-card placeholder:text-slate-400 outline-none transition focus:border-turquesa focus:ring-2 focus:ring-turquesa/25"
            aria-label="Buscar en la carta"
          />
          {search && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            >
              <X size={16} />
            </motion.button>
          )}
        </div>

        {/* Pestañas */}
        <nav className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Categorías">
          {categories.map((cat) => {
            const isActive = active === cat.id
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => onChange(cat.id)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? 'text-white' : 'text-slate-600 hover:text-abisal'
                }`}
                aria-pressed={isActive}
              >
                {isActive ? (
                  <motion.span
                    layoutId="activeCategoryPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-abisal shadow-sm"
                  />
                ) : (
                  <span className="absolute inset-0 rounded-full border border-slate-200 bg-white" />
                )}
                <span className="relative z-10">{cat.label}</span>
              </motion.button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
