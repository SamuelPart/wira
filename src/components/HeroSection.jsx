import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Flame, Snowflake } from 'lucide-react'
import { formatPrice } from '../data/menuData'

/**
 * Banner / Portada estilo Blendy para Wira con ambiente de LUGAR FRESCO:
 * - Fondos en degradados helados (glaciar, turquesa carbónico, menta fría, baya escarchada)
 * - Escarcha cayendo (copos + cubos de hielo), niebla helada a los pies y pulso de frío
 *   detrás del plato = sensación de vitrina refrigerada
 * - Palabra gigante blanca detrás del plato (recorte SIN FONDO)
 * - Piezas flotantes: ingredientes y mini platos en recorte, visibles también en celular
 * - Parallax al scroll, wipe de panel 970 ms solapado (sin franja blanca),
 *   autoplay 2.6 s, swipe, teclado y tabs con subrayado animado
 */
const CUTOUTS = {
  5: '/images/cutout-wira-mix.png',
  14: '/images/cutout-ceviche-mixto.png',
  15: '/images/cutout-trio-marino.png',
  19: '/images/cutout-leche-tigre.png',
}

const SLIDES = [
  {
    id: 5,
    word: 'WIRA MIX',
    tab: 'Wira Mix',
    name: 'Wira Mix',
    price: 16.0,
    backdrop: 'linear-gradient(168deg, #062C33 0%, #0B4F5B 52%, #0E7490 100%)',
    description: 'Tallarín, huancaína, arroz con mariscos, chicharrón de pota, ceviche y cancha.',
    floats: ['/images/ing-cancha.png', '/images/cutout-ceviche-mixto.png', '/images/ing-limon.png', '/images/ing-aji.png', '/images/ing-chifles.png'],
  },
  {
    id: 14,
    word: 'CEVICHE',
    tab: 'Ceviche Mixto',
    name: 'Ceviche Mixto',
    price: 32.0,
    backdrop: 'linear-gradient(168deg, #04303E 0%, #0A6E8A 55%, #19A7CE 100%)',
    description: 'Pescado fresco y variedad de mariscos seleccionados en su punto.',
    floats: ['/images/ing-pescado.png', '/images/ing-cebolla.png', '/images/ing-cancha.png', '/images/ing-limon.png', '/images/cutout-trio-marino.png'],
  },
  {
    id: 15,
    word: 'TRÍO',
    tab: 'Trío Marino',
    name: 'Trío Marino',
    price: 32.0,
    backdrop: 'linear-gradient(168deg, #0B3B33 0%, #0F766E 55%, #14B8A6 100%)',
    description: 'Combinación perfecta de ceviche, arroz con mariscos y chicharrón de pescado.',
    floats: ['/images/ing-pescado.png', '/images/ing-limon.png', '/images/ing-chifles.png', '/images/ing-cancha.png', '/images/cutout-ceviche-mixto.png'],
  },
  {
    id: 19,
    word: 'TIGRE',
    tab: 'Leche de Tigre',
    name: 'Leche de Tigre Tradicional',
    price: 16.0,
    backdrop: 'linear-gradient(168deg, #3B0A22 0%, #9F1239 55%, #E11D48 100%)',
    description: 'Concentrado marino levantamuertos con trozos de pescado, cancha y chifles.',
    floats: ['/images/ing-pescado.png', '/images/ing-cancha.png', '/images/ing-chifles.png', '/images/ing-aji.png', '/images/ing-limon.png'],
  },
]

const FLOAT_POS = [
  { left: '4%', top: '18%', size: 96, delay: '0s' },
  { right: '5%', top: '24%', size: 110, delay: '0.6s' },
  { left: '8%', bottom: '24%', size: 88, delay: '1.1s' },
  { right: '9%', bottom: '27%', size: 76, delay: '0.3s' },
  { left: '20%', top: '9%', size: 64, delay: '1.4s' },
]

// Escarcha: copos de nieve y cubos de hielo que caen lento (ambiente refrigerado)
const FROST = [
  { left: '6%', delay: '0s', dur: '9s', type: 'flake', size: 14 },
  { left: '16%', delay: '2.2s', dur: '11s', type: 'cube', size: 10 },
  { left: '28%', delay: '4s', dur: '8.5s', type: 'flake', size: 10 },
  { left: '40%', delay: '1.2s', dur: '12s', type: 'cube', size: 8 },
  { left: '55%', delay: '3.1s', dur: '9.5s', type: 'flake', size: 16 },
  { left: '68%', delay: '0.8s', dur: '10.5s', type: 'cube', size: 12 },
  { left: '78%', delay: '5s', dur: '8s', type: 'flake', size: 12 },
  { left: '90%', delay: '2.8s', dur: '11.5s', type: 'cube', size: 9 },
]

export function FrostLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* escarcha superior */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-100/15 to-transparent" />
      {/* copos y cubos de hielo cayendo */}
      {FROST.map((f, i) => (
        <span
          key={i}
          className="frost-fall absolute -top-8"
          style={{ left: f.left, animationDelay: f.delay, animationDuration: f.dur }}
        >
          {f.type === 'flake' ? (
            <Snowflake size={f.size} className="text-cyan-100/50" strokeWidth={1.6} />
          ) : (
            <span
              className="block rotate-12 rounded-[4px] border border-white/30 bg-white/15 backdrop-blur-[1px]"
              style={{ width: f.size, height: f.size }}
            />
          )}
        </span>
      ))}
      {/* niebla helada a los pies */}
      <div className="mist-drift absolute -bottom-10 -left-10 h-40 w-[70%] rounded-full bg-cyan-100/10 blur-3xl" />
      <div className="mist-drift absolute -bottom-14 -right-10 h-44 w-[60%] rounded-full bg-white/10 blur-3xl" style={{ animationDelay: '2.5s' }} />
    </div>
  )
}

export default function HeroSection({ onOpenDish, onQuickAdd }) {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const lastInteract = useRef(0)
  const touchStart = useRef(null)
  const sectionRef = useRef(null)
  const slide = SLIDES[index]
  const others = SLIDES.filter((s) => s.id !== slide.id)

  // Parallax al scroll: cada capa se mueve a su velocidad
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const yDish = useTransform(scrollYProgress, [0, 1], [0, -90])
  const yWord = useTransform(scrollYProgress, [0, 1], [0, -40])
  const yText = useTransform(scrollYProgress, [0, 1], [0, -55])
  const yFloatA = useTransform(scrollYProgress, [0, 1], [0, 130])
  const yFloatB = useTransform(scrollYProgress, [0, 1], [0, -150])
  const yCorner = useTransform(scrollYProgress, [0, 1], [0, 70])

  const goTo = useCallback(
    (next, direction) => {
      if (isAnimating) return
      const target = (next + SLIDES.length) % SLIDES.length
      if (target === index) return
      setDir(direction)
      setIsAnimating(true)
      setIndex(target)
      lastInteract.current = Date.now()
      window.setTimeout(() => setIsAnimating(false), 970)
    },
    [index, isAnimating],
  )

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index])

  // Autoplay cada 2.6s, pausa 6s tras interacción
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return
      if (Date.now() - lastInteract.current < 6000) return
      if (isAnimating) return
      setDir(1)
      setIndex((i) => (i + 1) % SLIDES.length)
    }, 2600)
    return () => window.clearInterval(id)
  }, [isAnimating])

  // Teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const onPointerDown = (e) => {
    touchStart.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e) => {
    if (!touchStart.current) return
    const dx = e.clientX - touchStart.current.x
    const dy = e.clientY - touchStart.current.y
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next()
      else prev()
    }
    touchStart.current = null
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: 'calc(100svh - 66px)', minHeight: 580, touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      aria-label="Platos estrella de Cevichería Wira"
    >
      <AnimatePresence mode="popLayout" custom={dir}>
        <motion.div
          key={slide.id}
          custom={dir}
          initial={{ clipPath: dir >= 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }}
          animate={{ clipPath: dir >= 0 ? 'inset(0 0 0 -4%)' : 'inset(0 -4% 0 0)' }}
          exit={{ clipPath: dir >= 0 ? 'inset(0 102% 0 0)' : 'inset(0 0 0 102%)' }}
          transition={{ duration: 0.97, ease: [0.65, 0, 0.35, 1] }}
          className="absolute inset-0"
          style={{ background: slide.backdrop }}
        >
          {/* Palabra gigante detrás */}
          <motion.div
            initial={{ x: dir * 160, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 0.8, 0.3, 1] }}
            style={{ y: yWord }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span
              className="whitespace-nowrap font-display font-extrabold leading-none text-white"
              style={{
                fontSize: 'clamp(3.2rem, 16vw, 11rem)',
                letterSpacing: slide.word.length > 7 ? '-0.02em' : '0.005em',
                textShadow: '0 1px 6px rgba(0,0,0,0.18)',
              }}
            >
              {slide.word}
            </span>
          </motion.div>

          {/* Esquinas grandes difuminadas (recortes desenfocados) */}
          <motion.img
            src={CUTOUTS[others[0].id]}
            alt=""
            aria-hidden="true"
            initial={{ x: dir * 220, opacity: 0 }}
            animate={{ x: 0, opacity: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 0.8, 0.3, 1] }}
            style={{ y: yCorner }}
            className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 object-contain blur-lg sm:h-80 sm:w-80"
          />
          <motion.img
            src={CUTOUTS[others[1].id]}
            alt=""
            aria-hidden="true"
            initial={{ x: dir * 220, opacity: 0 }}
            animate={{ x: 0, opacity: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 0.8, 0.3, 1] }}
            style={{ y: yCorner }}
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 object-contain blur-lg sm:h-80 sm:w-80"
          />

          {/* Piezas flotantes: ingredientes y mini platos sin fondo (también en celular) */}
          {slide.floats.map((src, i) => {
            const pos = FLOAT_POS[i]
            return (
              <motion.div
                key={src + i}
                style={{
                  y: i % 2 ? yFloatA : yFloatB,
                  ...(pos.left ? { left: pos.left } : {}),
                  ...(pos.right ? { right: pos.right } : {}),
                  ...(pos.top ? { top: pos.top } : {}),
                  ...(pos.bottom ? { bottom: pos.bottom } : {}),
                }}
                className="pointer-events-none absolute"
              >
                <motion.img
                  src={src}
                  alt=""
                  aria-hidden="true"
                  initial={{ x: dir * 200, opacity: 0 }}
                  animate={{ x: 0, opacity: 0.95 }}
                  transition={{ duration: 0.9, ease: [0.22, 0.8, 0.3, 1] }}
                  className="float-slow object-contain"
                  style={{
                    width: `min(${pos.size}px, 21vw)`,
                    height: 'auto',
                    animationDelay: pos.delay,
                    filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.30))',
                  }}
                />
              </motion.div>
            )
          })}

          {/* Plato centrado: recorte SIN FONDO con pulso de frío detrás */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-24 pt-16 text-center">
            <motion.button
              initial={{ x: dir * 120, opacity: 0, scale: 0.92 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 0.8, 0.3, 1] }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onOpenDish(slide)}
              style={{ y: yDish }}
              className="relative"
              aria-label={`Ver detalle de ${slide.name}`}
            >
              <span className="cold-pulse pointer-events-none absolute inset-4 rounded-full border-2 border-cyan-100/40" aria-hidden="true" />
              <span
                className="cold-pulse pointer-events-none absolute inset-4 rounded-full border border-cyan-100/25"
                style={{ animationDelay: '1.4s' }}
                aria-hidden="true"
              />
              <img
                src={CUTOUTS[slide.id]}
                alt={slide.name}
                className="relative h-[220px] w-auto max-w-[86vw] object-contain sm:h-[340px] lg:h-[380px]"
                style={{ filter: 'drop-shadow(0 26px 44px rgba(0,0,0,0.38))' }}
              />
              <span className="absolute -left-2 top-2 flex items-center gap-1 rounded-full bg-rocoto-500 px-3 py-1 text-xs font-extrabold text-white shadow-lg sm:left-0">
                <Flame size={12} /> Más Pedido
              </span>
            </motion.button>

            <motion.div
              initial={{ x: dir * 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 0.8, 0.3, 1] }}
              style={{ y: yText }}
              className="mt-4 max-w-md"
            >
              <h2
                className="font-display text-2xl font-extrabold text-white sm:text-3xl"
                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.22)' }}
              >
                {slide.name} · {formatPrice(slide.price)}
              </h2>
              <p
                className="mt-1.5 font-gastro text-base italic leading-snug text-cyan-50/90 sm:text-lg"
                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}
              >
                {slide.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onOpenDish(slide)}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-abisal shadow-lg transition hover:bg-marfil"
                >
                  Personalizar y pedir
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onQuickAdd(slide)}
                  className="flex items-center gap-1.5 rounded-full bg-black/25 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-black/40"
                >
                  <Plus size={16} strokeWidth={2.5} /> Agregar
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Ambiente frío por encima de los paneles */}
      <FrostLayer />

      {/* Tabs superiores */}
      <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-4">
        <div className="flex items-center gap-5 rounded-full bg-black/20 px-4 py-2 backdrop-blur-md sm:gap-8 sm:px-6">
          {SLIDES.map((s, i) => {
            const active = i === index
            return (
              <button
                key={s.id}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                aria-current={active ? 'true' : undefined}
                className={`relative pb-1 text-xs font-semibold transition sm:text-sm ${active ? 'text-white' : 'text-white/60 hover:text-white'}`}
                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.22)' }}
              >
                {s.tab}
                {active && (
                  <motion.span
                    layoutId="wira-slide-underline"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-white"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Flechas inferiores */}
      <button
        onClick={prev}
        aria-label="Plato anterior"
        className="absolute bottom-5 left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition hover:bg-black/35 sm:left-8"
      >
        <ChevronLeft size={26} />
      </button>
      <button
        onClick={next}
        aria-label="Plato siguiente"
        className="absolute bottom-5 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition hover:bg-black/35 sm:right-8"
      >
        <ChevronRight size={26} />
      </button>

      {/* VER CARTA inferior centro */}
      <a
        href="#carta"
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 font-display text-sm font-bold uppercase tracking-[0.2em] text-white"
        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.22)' }}
      >
        Ver Carta
      </a>
    </section>
  )
}
