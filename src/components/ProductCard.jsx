import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Minus, Flame, Sparkles } from 'lucide-react'
import { formatPrice } from '../data/menuData'

/**
 * Card de plato con animación combinada:
 * (Idea 2) Entrada en OLA: delay diagonal por posición, rotateX y foto que
 * "enfoca" desde blur+saturación baja; salida hundiéndose como espuma.
 * (Idea 3) PEDIDO VIVO: clon de la foto vuela al carrito, pulso de anillo
 * dorado al agregar, botón que se morphs a stepper (layoutId) y llamas de
 * picor que encienden una a una al pasar el mouse.
 */
export default function ProductCard({ product, qtyInCart, onOpen, onQuickAdd, onDecrement, onFly, waveDelay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [imgWrapRef, setImgWrapRef] = useState(null)

  const handleAdd = (e) => {
    e.stopPropagation()
    const rect = imgWrapRef?.getBoundingClientRect()
    if (rect && onFly) onFly(product.image, rect)
    onQuickAdd(product)
    setPulseKey((k) => k + 1)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28, rotateX: 12, filter: 'blur(6px) saturate(0.6)' }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px) saturate(1)' }}
      viewport={{ once: true, amount: 0.15 }}
      exit={{ opacity: 0, scale: 0.9, y: 14, transition: { duration: 0.22, ease: 'easeIn' } }}
      transition={{ duration: 0.55, delay: waveDelay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      style={{ transformPerspective: 900 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-soft sm:rounded-3xl"
    >
      {/* Pulso de anillo dorado al agregar */}
      {pulseKey > 0 && (
        <motion.span
          key={pulseKey}
          initial={{ opacity: 0.85, scale: 1 }}
          animate={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl ring-2 ring-aji-400 sm:rounded-3xl"
          aria-hidden="true"
        />
      )}

      <button onClick={() => onOpen(product)} className="block w-full text-left" aria-label={`Ver detalle de ${product.name}`}>
        {/* Imagen con nombre del plato superpuesto */}
        <div ref={setImgWrapRef} className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-marino-100 to-marino-50">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          {/* Degradado inferior para legibilidad del nombre */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/35 to-transparent" aria-hidden="true" />

          {/* Badges superiores */}
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-marino-700 shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
            {product.category}
          </span>
          {product.isNew && (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-rocoto-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
              <Sparkles size={11} /> Nuevo
            </span>
          )}
          {product.featured && !product.isNew && (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-aji-500 px-2 py-0.5 text-[10px] font-extrabold text-abisal shadow-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
              <Flame size={11} /> Favorito
            </span>
          )}

          {/* Nombre del plato sobre la imagen */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5">
            <h3 className="font-display text-[13px] font-extrabold leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] sm:text-base">
              {product.name}
            </h3>
            <p className="mt-0.5 flex items-center text-[10px] font-medium text-white/85 sm:text-xs">
              {formatPrice(product.price)}
              {product.isSpicyOption && (
                <span className="ml-1.5 inline-flex items-center gap-0.5" title="Ají al gusto: elige tu nivel de picor">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      initial={false}
                      animate={{ scale: hovered ? [1, 1.45, 1] : 1 }}
                      transition={{ delay: hovered ? i * 0.08 : 0, duration: 0.3 }}
                      className={hovered ? 'text-rocoto-500' : 'text-aji-400/80'}
                    >
                      <Flame size={10} fill={hovered ? 'currentColor' : 'none'} />
                    </motion.span>
                  ))}
                </span>
              )}
            </p>
          </div>
          <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-1.5 py-px text-[9px] font-medium text-white/90 backdrop-blur-sm sm:bottom-2.5 sm:right-2.5 sm:px-2 sm:py-0.5 sm:text-[10px]">
            Imagen referencial
          </span>
        </div>

        <div className="p-2.5 sm:p-4">
          <span className="mb-1.5 block h-px w-7 bg-gradient-to-r from-aji-400 to-transparent" aria-hidden="true" />
          <p className="line-clamp-2 font-gastro text-[13px] italic leading-snug text-slate-600 sm:text-[15px]">
            {product.description}
          </p>
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between gap-2 px-2.5 pb-2.5 sm:px-4 sm:pb-4">
        <span className="font-display text-base font-extrabold text-marino-700 sm:text-lg">{formatPrice(product.price)}</span>
        <AnimatePresence mode="popLayout" initial={false}>
          {qtyInCart > 0 ? (
            <motion.div
              key="stepper"
              layoutId={`addctl-${product.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="flex items-center gap-0.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200"
            >
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={(e) => { e.stopPropagation(); onDecrement(product) }}
                className="px-2 py-2 text-emerald-700 transition hover:text-emerald-900 sm:px-2.5 sm:py-2.5"
                aria-label={`Quitar uno de ${product.name}`}
              >
                <Minus size={14} strokeWidth={3} />
              </motion.button>
              <motion.span
                key={qtyInCart}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                className="min-w-[1.35rem] text-center text-xs font-extrabold text-emerald-700 sm:text-sm"
              >
                {qtyInCart}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleAdd}
                className="px-2 py-2 text-emerald-700 transition hover:text-emerald-900 sm:px-2.5 sm:py-2.5"
                aria-label={`Agregar uno más de ${product.name}`}
              >
                <Plus size={14} strokeWidth={3} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="add"
              layoutId={`addctl-${product.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleAdd}
              className="flex items-center gap-1 rounded-full bg-abisal px-3 py-2 text-xs font-bold text-white transition hover:bg-oceano sm:px-4 sm:py-2.5 sm:text-sm"
              aria-label={`Agregar ${product.name} al pedido`}
            >
              <Plus size={15} strokeWidth={2.5} /> Agregar
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}
