import { motion } from 'framer-motion'
import { ShoppingBag, MessageCircle, Clock } from 'lucide-react'

/**
 * Navbar sin logo gráfico: el negocio no tiene logo, así que la marca es
 * puramente tipográfica (wordmark "CEVICHERÍA WIRA" con filete turquesa).
 */
export default function Navbar({ cartCount, onCartClick }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-abisal/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <a href="#inicio" className="group leading-none" aria-label="Cevichería Wira — inicio">
          <span className="block font-display text-[16px] font-extrabold tracking-[0.14em] text-white sm:text-lg">
            CEVICHERÍA <span className="text-turquesa">WIRA</span>
          </span>
          <span className="mt-1 block h-px w-full bg-gradient-to-r from-turquesa via-turquesa/40 to-transparent" aria-hidden="true" />
          <span className="mt-1 flex items-center gap-1 text-[10px] font-medium tracking-wide text-slate-300">
            <Clock size={10} /> 10:00 AM – 5:00 PM · Trujillo
          </span>
        </a>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://wa.me/51935466580"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full bg-whatsapp-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-whatsapp-600 sm:flex"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onCartClick}
            data-fly-target="cart"
            aria-label="Abrir pedido"
            className="relative flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Pedido</span>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-aji-500 px-1 text-[11px] font-extrabold text-abisal"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  )
}
