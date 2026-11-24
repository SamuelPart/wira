import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Flame, StickyNote, ShoppingBag } from 'lucide-react'
import { formatPrice, SPICY_LEVELS } from '../data/menuData'

export default function ProductModal({ product, onClose, onAdd }) {
  const [spicy, setSpicy] = useState('Ají normal')
  const [note, setNote] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (product) {
      setSpicy('Ají normal')
      setNote('')
      setQty(1)
    }
  }, [product])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (product) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [product, onClose])

  const handleAdd = () => {
    onAdd(product, {
      spicy: product.isSpicyOption ? spicy : null,
      note: note.trim(),
      qty,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-abisal/60 backdrop-blur-sm"
          />
          <div className="pointer-events-none fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="pointer-events-auto flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-float sm:rounded-3xl"
              role="dialog"
              aria-modal="true"
              aria-label={`Detalle de ${product.name}`}
            >
              <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-gradient-to-br from-marino-100 to-marino-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/35 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-xl font-extrabold leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{product.name}</h3>
                  <p className="mt-0.5 text-sm font-medium text-white/85">{formatPrice(product.price)}</p>
                </div>
                <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  Imagen referencial
                </span>
                <button
                  onClick={onClose}
                  aria-label="Cerrar detalle"
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white"
                >
                  <X size={20} />
                </button>
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-marino-700 shadow-sm backdrop-blur-sm">
                  {product.category}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-extrabold leading-tight text-abisal">
                    {product.name}
                  </h3>
                  <span className="shrink-0 font-display text-xl font-extrabold text-marino-700">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <span className="mt-2 block h-px w-10 bg-gradient-to-r from-aji-400 to-transparent" aria-hidden="true" />
                <p className="mt-2 font-gastro text-base italic leading-relaxed text-slate-600 sm:text-lg">
                  {product.description}
                </p>

                {product.isSpicyOption && (
                  <div className="mt-5">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                      <Flame size={15} className="text-rocoto-500" /> Nivel de ají
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {SPICY_LEVELS.map((level) => {
                        const active = spicy === level
                        return (
                          <motion.button
                            key={level}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setSpicy(level)}
                            className={`rounded-xl border-2 px-2 py-2.5 text-[13px] font-bold transition ${
                              active
                                ? 'border-rocoto-500 bg-rocoto-500/5 text-rocoto-600'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {level}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    <StickyNote size={15} className="text-marino-500" /> Nota para este plato{' '}
                    <span className="font-normal text-slate-400">(opcional)</span>
                  </label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder='Ej. "Sin cebolla", "Bastante cancha", "Bebida helada"'
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[16px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-marino-500 focus:ring-2 focus:ring-marino-500/20"
                  />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Cantidad</span>
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-marfil p-1.5">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Quitar uno"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-marino-700 shadow-sm"
                    >
                      <Minus size={16} />
                    </motion.button>
                    <motion.span
                      key={qty}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="min-w-[32px] text-center font-display text-lg font-extrabold text-abisal"
                    >
                      {qty}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setQty((q) => Math.min(20, q + 1))}
                      aria-label="Agregar uno"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-abisal text-white shadow-sm"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleAdd}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-abisal px-4 py-4 font-display text-base font-extrabold text-white shadow-lg transition hover:bg-oceano"
                >
                  <ShoppingBag size={20} />
                  Agregar al pedido · {formatPrice(product.price * qty)}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
