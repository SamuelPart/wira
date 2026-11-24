import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Flame, Plus, ChevronRight, ChevronLeft, Snowflake } from 'lucide-react'
import { MENU, formatPrice } from '../data/menuData'
import { FrostLayer } from './HeroSection'

/**
 * CARRUSEL "MAREA VIVA" — coverflow 3D con arrastre (Idea 1):
 * 5 cartas (3 platos + 2 bebidas) como RECORTE SIN FONDO flotando sobre
 * vitrina marina: rotateY por offset, drag con inercia y spring, reflejo
 * bajo cada plato, olas y burbujas animadas, dots con layoutId, autoplay 4s
 * que se pausa al pasar el mouse o arrastrar.
 */
const CUTOUTS = {
  5: '/images/cutout-wira-mix.png',
  14: '/images/cutout-ceviche-mixto.png',
  15: '/images/cutout-trio-marino.png',
  28: '/images/cutout-chicha-morada.png',
  30: '/images/cutout-limonada-frozen.png',
}

// Ingredientes en recorte que flotan alrededor de cada carta activa
const ING = {
  5: ['/images/ing-cancha.png', '/images/ing-chifles.png', '/images/ing-limon.png'],
  14: ['/images/ing-pescado.png', '/images/ing-cebolla.png', '/images/ing-cancha.png'],
  15: ['/images/ing-pescado.png', '/images/ing-limon.png', '/images/ing-chifles.png'],
  28: ['/images/ing-maiz-morado.png', '/images/ing-canela.png'],
  30: ['/images/ing-limon.png', '/images/ing-menta.png'],
}
const ING_POS = [
  { left: '6%', top: '16%' },
  { right: '6%', top: '30%' },
  { left: '12%', bottom: '20%' },
]

const ITEMS = [5, 14, 15, 28, 30]
  .map((id) => MENU.find((p) => p.id === id))
  .filter(Boolean)
  .map((p) => ({ ...p, cutout: CUTOUTS[p.id] }))

const N = ITEMS.length

// offset circular: -2..2 para que las 5 cartas rodeen la vitrina
const circOffset = (i, active) => {
  let d = i - active
  if (d > N / 2) d -= N
  if (d < -N / 2) d += N
  return d
}

export default function FeaturedCarousel({ onOpen, onQuickAdd }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const panelRef = useRef(null)

  // Parallax al scroll: ingredientes y pista se mueven a distinta velocidad
  const { scrollYProgress } = useScroll({ target: panelRef, offset: ['start end', 'end start'] })
  const yIng = useTransform(scrollYProgress, [0, 1], [60, -80])
  const yIngAlt = useTransform(scrollYProgress, [0, 1], [-50, 70])
  const yTrack = useTransform(scrollYProgress, [0, 1], [26, -26])

  const go = (i) => setActive(((i % N) + N) % N)
  const next = () => go(active + 1)
  const prev = () => go(active - 1)

  // Autoplay 4s, se pausa con hover / drag
  useEffect(() => {
    if (paused || dragging) return undefined
    const id = window.setInterval(() => setActive((a) => (a + 1) % N), 4000)
    return () => window.clearInterval(id)
  }, [paused, dragging])

  return (
    <section
      className="mx-auto max-w-6xl px-4 pt-8"
      aria-label="Marea Viva: los favoritos de Wira"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-4 flex items-end justify-between"
      >
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rocoto-500">
            <Flame size={14} /> Marea Viva · Los Favoritos de Wira
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-abisal">
            Platos y bebidas que enamoran
          </h2>
        </div>
        <a
          href="#carta"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-marino-600 transition hover:text-marino-700"
        >
          Ver carta <ChevronRight size={16} />
        </a>
      </motion.div>

      {/* Vitrina marina */}
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        ref={panelRef}
        className="relative overflow-hidden rounded-[2rem] shadow-[0_20px_60px_rgba(4,13,33,0.35)]"
        style={{ background: 'linear-gradient(180deg, #052A33 0%, #0A4552 55%, #0E7490 130%)' }}
      >
        {/* Ambiente de lugar fresco: escarcha, cubos de hielo y niebla helada */}
        <FrostLayer />
        {/* Ingredientes sin fondo flotando alrededor de la carta activa (también en celular) */}
        <AnimatePresence>
          {(ING[ITEMS[active].id] || []).map((src, i) => {
            const pos = ING_POS[i]
            return (
              <motion.div
                key={`${ITEMS[active].id}-${src}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.9, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.05 }}
                style={{
                  y: i % 2 ? yIngAlt : yIng,
                  ...(pos.left ? { left: pos.left } : {}),
                  ...(pos.right ? { right: pos.right } : {}),
                  ...(pos.top ? { top: pos.top } : {}),
                  ...(pos.bottom ? { bottom: pos.bottom } : {}),
                }}
                className="pointer-events-none absolute z-0"
                aria-hidden="true"
              >
                <img
                  src={src}
                  alt=""
                  className="float-slow object-contain opacity-80"
                  style={{
                    width: 'min(84px, 15vw)',
                    height: 'auto',
                    animationDelay: `${i * 0.7}s`,
                    filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.4))',
                  }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
        {/* olas animadas al fondo */}
        <svg
          className="wave-drift pointer-events-none absolute -bottom-2 left-0 h-24 w-[200%] opacity-25"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,60 C150,110 350,10 600,60 C850,110 1050,10 1200,60 L1200,120 L0,120 Z" fill="#19A7CE" />
        </svg>
        <svg
          className="wave-drift-slow pointer-events-none absolute -bottom-4 left-0 h-20 w-[200%] opacity-15"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,70 C200,20 400,110 600,70 C800,20 1000,110 1200,70 L1200,120 L0,120 Z" fill="#A5F3FC" />
        </svg>
        {/* burbujas que suben */}
        {[12, 30, 55, 74, 88].map((left, i) => (
          <span
            key={left}
            aria-hidden="true"
            className="bubble-up pointer-events-none absolute bottom-0 rounded-full border border-turquesa/40"
            style={{
              left: `${left}%`,
              width: 10 + (i % 3) * 6,
              height: 10 + (i % 3) * 6,
              animationDelay: `${i * 1.7}s`,
              animationDuration: `${7 + i * 1.3}s`,
            }}
          />
        ))}

        {/* Pista 3D con drag */}
        <motion.div
          className="relative z-10 mx-auto h-[380px] w-full max-w-4xl cursor-grab active:cursor-grabbing sm:h-[430px]"
          style={{ perspective: 1200, touchAction: 'pan-y', y: yTrack }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_, info) => {
            setDragging(false)
            if (info.offset.x < -60 || info.velocity.x < -320) next()
            else if (info.offset.x > 60 || info.velocity.x > 320) prev()
          }}
        >
          {ITEMS.map((p, i) => {
            const o = circOffset(i, active)
            const abs = Math.abs(o)
            const isActive = o === 0
            return (
              <motion.article
                key={p.id}
                className="absolute inset-x-0 top-6 mx-auto w-[220px] sm:w-[280px]"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                  x: `${o * 62}%`,
                  rotateY: o * -18,
                  scale: 1 - abs * 0.14,
                  zIndex: 20 - abs,
                  opacity: abs > 2 ? 0 : 1 - abs * 0.25,
                  filter: abs === 0 ? 'blur(0px)' : `blur(${abs * 1.6}px)`,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                onClick={() => (isActive ? onOpen(p) : go(i))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && (isActive ? onOpen(p) : go(i))}
                aria-label={`${p.name}, ${formatPrice(p.price)}`}
              >
                <div
                  className={`relative rounded-3xl border bg-white/[0.06] px-4 pb-4 pt-8 backdrop-blur-sm transition-colors ${
                    isActive ? 'border-aji-400/80 shadow-[0_0_45px_rgba(245,158,11,0.28)]' : 'border-white/10'
                  }`}
                >
                  {p.featured && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-rocoto-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow">
                      <Flame size={11} /> Más Pedido
                    </span>
                  )}
                  {p.categoryId === 'bebidas' && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-turquesa px-2.5 py-1 text-[10px] font-extrabold text-white shadow">
                      <Snowflake size={11} /> Bien Frío
                    </span>
                  )}

                  {/* Recorte SIN FONDO + reflejo */}
                  <div className="relative flex h-[168px] items-end justify-center sm:h-[190px]">
                    <img
                      src={p.cutout}
                      alt={p.name}
                      loading="lazy"
                      draggable={false}
                      className="max-h-[168px] w-auto object-contain sm:max-h-[190px]"
                      style={{ filter: 'drop-shadow(0 16px 26px rgba(0,0,0,0.45))' }}
                    />
                    <img
                      src={p.cutout}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      draggable={false}
                      className="pointer-events-none absolute inset-x-0 top-full mx-auto max-h-[80px] w-auto -scale-y-100 object-contain opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
                    />
                  </div>

                  <h3 className="mt-3 text-center font-display text-base font-extrabold leading-tight text-white">
                    {p.name}
                  </h3>
                  <p className="mt-0.5 text-center text-xs text-white/60">{p.category}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display text-lg font-extrabold text-aji-400">{formatPrice(p.price)}</span>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onQuickAdd(p)
                      }}
                      className="flex items-center gap-1 rounded-full bg-white px-3.5 py-2 text-xs font-extrabold text-abisal shadow transition hover:bg-marfil"
                      aria-label={`Agregar ${p.name} al pedido`}
                    >
                      <Plus size={14} strokeWidth={3} /> Agregar
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>

        {/* Controles */}
        <div className="relative z-30 flex items-center justify-center gap-4 pb-5">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={prev}
            aria-label="Anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div className="flex items-center gap-2">
            {ITEMS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => go(i)}
                aria-label={`Ir a ${p.name}`}
                className="relative flex h-6 w-6 items-center justify-center"
              >
                {i === active ? (
                  <motion.span
                    layoutId="mareaDot"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="h-2 w-6 rounded-full bg-aji-400"
                  />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white/30 transition hover:bg-white/60" />
                )}
              </button>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={next}
            aria-label="Siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}
