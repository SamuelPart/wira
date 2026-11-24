import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { formatPrice } from '../data/menuData'

export default function FloatingCartBar({ count, total, onOpen }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4"
        >
          <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl bg-abisal p-2.5 pl-4 text-white shadow-float ring-1 ring-white/10">
            <div className="relative shrink-0">
              <ShoppingBag size={26} />
              <motion.span
                key={count}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rocoto-500 px-1 text-[11px] font-extrabold"
              >
                {count}
              </motion.span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Total</p>
              <p className="font-display text-lg font-extrabold leading-tight">{formatPrice(total)}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onOpen}
              className="flex shrink-0 items-center gap-1 rounded-xl bg-aji-500 px-4 py-3 font-display text-sm font-extrabold text-abisal shadow-sm transition hover:bg-aji-400 sm:px-5"
            >
              Ver Pedido <ChevronRight size={16} strokeWidth={3} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
