import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { SearchX, ArrowUp, Clock, MapPin, Phone } from 'lucide-react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturedCarousel from './components/FeaturedCarousel'
import CategoryTabs from './components/CategoryTabs'
import ProductCard from './components/ProductCard'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import FloatingCartBar from './components/FloatingCartBar'
import { MENU, CATEGORIES } from './data/menuData'

const makeKey = (productId, spicy, note) => `${productId}|${spicy || ''}|${(note || '').trim().toLowerCase()}`

export default function App() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('todos')
  const [cart, setCart] = useState([]) // [{key, productId, qty, spicy, note}]
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [cols, setCols] = useState(4)
  const [flights, setFlights] = useState([])
  const cartaRef = useRef(null)

  // Columnas actuales del grid según breakpoint (para la ola diagonal)
  useEffect(() => {
    const mqLg = window.matchMedia('(min-width: 1024px)')
    const mqSm = window.matchMedia('(min-width: 640px)')
    const update = () => setCols(mqLg.matches ? 4 : mqSm.matches ? 3 : 2)
    update()
    mqLg.addEventListener('change', update)
    mqSm.addEventListener('change', update)
    return () => {
      mqLg.removeEventListener('change', update)
      mqSm.removeEventListener('change', update)
    }
  }, [])

  // Fly-to-cart: un clon de la foto del plato vuela en arco hasta el carrito
  const flyToCart = (src, rect) => {
    const target = document.querySelector('[data-fly-target="cart"]')
    if (!target || !rect) return
    const t = target.getBoundingClientRect()
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setFlights((prev) => [
      ...prev.slice(-4),
      {
        id,
        src,
        from: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
        to: { x: t.left + t.width / 2 - 22, y: t.top + t.height / 2 - 22, w: 44, h: 44 },
      },
    ])
  }
  const removeFlight = (id) => setFlights((prev) => prev.filter((f) => f.id !== id))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MENU.filter((p) => {
      const inCategory = activeCategory === 'todos' || p.categoryId === activeCategory
      const inSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      return inCategory && inSearch
    })
  }, [search, activeCategory])

  const entries = useMemo(
    () =>
      cart
        .map((c) => ({ ...c, product: MENU.find((p) => p.id === c.productId) }))
        .filter((e) => e.product && e.qty > 0),
    [cart],
  )

  const totalCount = entries.reduce((s, e) => s + e.qty, 0)
  const totalPrice = entries.reduce((s, e) => s + e.product.price * e.qty, 0)

  const qtyByProduct = useMemo(() => {
    const map = {}
    entries.forEach((e) => {
      map[e.productId] = (map[e.productId] || 0) + e.qty
    })
    return map
  }, [entries])

  const addToCart = (product, { spicy = null, note = '', qty = 1 } = {}) => {
    const key = makeKey(product.id, spicy, note)
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key)
      if (existing) {
        return prev.map((c) => (c.key === key ? { ...c, qty: Math.min(20, c.qty + qty) } : c))
      }
      return [...prev, { key, productId: product.id, qty, spicy, note: note.trim() }]
    })
  }

  const quickAdd = (product) => addToCart(product, { spicy: product.isSpicyOption ? 'Ají normal' : null, note: '', qty: 1 })

  const openDishById = (slide) => {
    const full = MENU.find((p) => p.id === slide.id)
    if (full) setSelectedProduct(full)
  }
  const quickAddById = (slide) => {
    const full = MENU.find((p) => p.id === slide.id)
    if (full) quickAdd(full)
  }

  const updateQty = (key, qty) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((c) => c.key !== key) : prev.map((c) => (c.key === key ? { ...c, qty: Math.min(20, qty) } : c)),
    )
  }

  const removeEntry = (key) => setCart((prev) => prev.filter((c) => c.key !== key))

  // Resta 1 de la última línea del pedido para ese plato (stepper de la card)
  const decrementProduct = (product) => {
    setCart((prev) => {
      const idxs = prev.map((c, i) => (c.productId === product.id ? i : -1)).filter((i) => i >= 0)
      if (idxs.length === 0) return prev
      const last = idxs[idxs.length - 1]
      return prev.flatMap((c, i) => (i === last ? (c.qty <= 1 ? [] : [{ ...c, qty: c.qty - 1 }]) : [c]))
    })
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="wave-pattern min-h-dvh">
      <Navbar cartCount={totalCount} onCartClick={() => setCartOpen(true)} />
      <HeroSection onOpenDish={openDishById} onQuickAdd={quickAddById} />
      <FeaturedCarousel onOpen={setSelectedProduct} onQuickAdd={quickAdd} />

      <div id="carta" ref={cartaRef} className="relative scroll-mt-24">
        <AquariumLayer targetRef={cartaRef} />
        <div className="relative z-10">
        <CategoryTabs
          categories={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory}
          search={search}
          onSearchChange={setSearch}
        />

        <main className="mx-auto max-w-6xl px-4 pb-36 pt-6">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl font-extrabold text-abisal">
              {CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h2>
            <p className="text-sm text-slate-500">
              {filtered.length} {filtered.length === 1 ? 'plato' : 'platos'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
            >
              <SearchX size={40} className="text-slate-300" />
              <p className="mt-3 font-display text-lg font-bold text-slate-700">No encontramos ese plato</p>
              <p className="mt-1 text-sm text-slate-500">Prueba con otra búsqueda o explora otra categoría.</p>
              <button
                onClick={() => {
                  setSearch('')
                  setActiveCategory('todos')
                }}
                className="mt-4 rounded-full bg-abisal px-5 py-2.5 text-sm font-bold text-white transition hover:bg-oceano"
              >
                Ver toda la carta
              </button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    qtyInCart={qtyByProduct[product.id] || 0}
                    onOpen={setSelectedProduct}
                    onQuickAdd={quickAdd}
                    onDecrement={decrementProduct}
                    onFly={flyToCart}
                    waveDelay={(Math.floor(i / cols) + (i % cols)) * 0.04}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Footer */}
          <footer className="mt-14 rounded-3xl bg-[radial-gradient(ellipse_at_top_right,#0B2447_0%,#040D21_70%)] px-6 py-8 text-white">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-extrabold tracking-[0.14em]">
                  CEVICHERÍA <span className="text-turquesa">WIRA</span>
                </p>
                <span className="mt-1 block h-px w-28 bg-gradient-to-r from-turquesa via-turquesa/40 to-transparent" aria-hidden="true" />
                <p className="mt-1.5 font-gastro text-base italic text-slate-300">
                  Tradición marina trujillana · Precios en soles (S/)
                </p>
              </div>
              <div className="space-y-1.5 text-sm text-slate-200">
                <p className="flex items-center gap-2">
                  <Clock size={15} className="text-aji-400" /> Atención: 10:00 AM – 5:00 PM
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={15} className="text-aji-400" /> Trujillo, La Libertad, Perú
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={15} className="text-aji-400" /> WhatsApp: 935 466 580
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-white/15 pt-4 text-xs text-slate-300">
              <p>
                Las imágenes son referenciales. El costo de delivery se calcula según la zona de entrega.
                Pagos aceptados: Yape y Efectivo.
              </p>
            </div>
          </footer>
        </main>
        </div>
      </div>

      <FloatingCartBar count={totalCount} total={totalPrice} onOpen={() => setCartOpen(true)} />

      {/* Botón volver al inicio (esquina inferior izquierda) */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileTap={{ scale: 0.94 }}
            onClick={scrollToTop}
            aria-label="Volver al inicio de la carta"
            className="fixed bottom-24 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white text-abisal shadow-float ring-1 ring-slate-200 transition hover:bg-marfil sm:bottom-6"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
      <ScrollTracker onChange={setShowTop} />

      {/* Clones fly-to-cart: la foto del plato vuela en arco hasta el carrito */}
      <AnimatePresence>
        {flights.map((f) => (
          <motion.img
            key={f.id}
            src={f.src}
            alt=""
            aria-hidden="true"
            initial={{ x: f.from.x, y: f.from.y, width: f.from.w, height: f.from.h, opacity: 0.95, borderRadius: 14 }}
            animate={{
              x: [f.from.x, (f.from.x + f.to.x) / 2, f.to.x],
              y: [f.from.y, Math.min(f.from.y, f.to.y) - 70, f.to.y],
              width: [f.from.w, f.from.w * 0.6, f.to.w],
              height: [f.from.h, f.from.h * 0.6, f.to.h],
              opacity: [0.95, 0.85, 0.15],
            }}
            transition={{ duration: 0.75, ease: [0.3, 0.7, 0.3, 1] }}
            onAnimationComplete={() => removeFlight(f.id)}
            className="pointer-events-none fixed left-0 top-0 z-[70] object-cover shadow-xl"
          />
        ))}
      </AnimatePresence>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        entries={entries}
        onUpdateQty={updateQty}
        onRemove={removeEntry}
        onClear={() => setCart([])}
      />
    </div>
  )
}

/* ---------- ACUARIO DE FONDO (Idea 2) ----------
 * Vida marina en parallax detrás de toda la carta:
 * - 3 cardúmenes a distintas velocidades ligadas al scroll (0.2 / 0.5 / 0.9)
 *   que además siguen nadando solos (loop CSS) al detener el scroll
 * - Algas que se mecen en los bordes y haces de luz que se inclinan con el scroll
 * - Todo sutil (6–15% de opacidad) para no competir con los platos
 */
function Fish({ size = 26, flip = false, className = '' }) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 40 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M2 10c6-6 16-8 24-4 3-3 7-4 12-4-2 3-3 5-3 8s1 5 3 8c-5 0-9-1-12-4-8 4-18 2-24-4z" />
      <circle cx="9" cy="8.6" r="1.1" fill="#F8FAFC" opacity="0.65" />
    </svg>
  )
}

const SCHOOLS = [
  { top: '10%', count: 8, tone: 'text-turquesa/15', size: 20, dur: '46s', reverse: false, speed: [50, -70] },
  { top: '36%', count: 6, tone: 'text-marino-400/15', size: 30, dur: '30s', reverse: true, speed: [90, -190] },
  { top: '64%', count: 5, tone: 'text-oceano/10', size: 42, dur: '20s', reverse: false, speed: [150, -360] },
]

function AquariumLayer({ targetRef }) {
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start end', 'end start'] })
  const yFar = useTransform(scrollYProgress, [0, 1], SCHOOLS[0].speed)
  const yMid = useTransform(scrollYProgress, [0, 1], SCHOOLS[1].speed)
  const yNear = useTransform(scrollYProgress, [0, 1], SCHOOLS[2].speed)
  const ys = [yFar, yMid, yNear]
  const raysX = useTransform(scrollYProgress, [0, 1], [-40, 40])
  const raysR = useTransform(scrollYProgress, [0, 1], [-4, 4])

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Haces de luz que se inclinan con el scroll */}
      <motion.div style={{ x: raysX, rotate: raysR }} className="absolute inset-0">
        <span className="absolute -top-8 left-[14%] h-[65%] w-20 bg-gradient-to-b from-white/30 via-turquesa/10 to-transparent blur-2xl" />
        <span className="absolute -top-8 left-[46%] h-[75%] w-32 bg-gradient-to-b from-white/25 via-turquesa/10 to-transparent blur-2xl" />
        <span className="absolute -top-8 left-[76%] h-[60%] w-16 bg-gradient-to-b from-white/30 via-turquesa/10 to-transparent blur-2xl" />
      </motion.div>

      {/* Cardúmenes en parallax: nado continuo + velocidad ligada al scroll */}
      {SCHOOLS.map((s, si) => (
        <motion.div key={si} style={{ y: ys[si], top: s.top }} className="absolute inset-x-0">
          <div
            className={`swim-x flex w-[200%] items-center justify-around ${s.reverse ? 'swim-reverse' : ''}`}
            style={{ animationDuration: s.dur }}
          >
            {Array.from({ length: s.count * 2 }).map((_, i) => (
              <Fish key={i} size={s.size + (i % 4) * 6} flip={s.reverse} className={s.tone} />
            ))}
          </div>
        </motion.div>
      ))}

      {/* Algas que se mecen en los bordes */}
      <svg className="kelp-sway absolute -bottom-3 left-1 h-44 w-16 text-turquesa/20" viewBox="0 0 40 120" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M12 120c-6-24 8-36 2-58-4-16 6-28 4-40" />
        <path d="M26 120c8-20-6-34 0-54 4-14-4-26-2-36" />
      </svg>
      <span className="absolute -bottom-3 right-1 block" style={{ transform: 'scaleX(-1)' }}>
        <svg className="kelp-sway h-36 w-14 text-turquesa/15" viewBox="0 0 40 120" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" style={{ animationDelay: '1.6s' }}>
          <path d="M12 120c-6-24 8-36 2-58-4-16 6-28 4-40" />
          <path d="M26 120c8-20-6-34 0-54 4-14-4-26-2-36" />
        </svg>
      </span>

      {/* Burbujas suaves que suben por la carta */}
      {[18, 44, 70, 88].map((left, i) => (
        <span
          key={left}
          className="bubble-up absolute bottom-0 rounded-full border border-turquesa/25"
          style={{
            left: `${left}%`,
            width: 8 + (i % 3) * 5,
            height: 8 + (i % 3) * 5,
            animationDelay: `${i * 2.3}s`,
            animationDuration: `${11 + i * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

function ScrollTracker({ onChange }) {
  // Componente auxiliar: detecta scroll para mostrar el botón de inicio
  return <ScrollListener onChange={onChange} />
}

function ScrollListener({ onChange }) {
  useEffect(() => {
    const handler = () => onChange(window.scrollY > 600)
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [onChange])
  return null
}
