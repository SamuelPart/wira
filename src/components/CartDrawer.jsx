import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Minus,
  Plus,
  Trash2,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  MessageCircle,
  Banknote,
  Smartphone,
  Clock,
  MapPin,
  User,
  Hash,
  StickyNote,
  AlertCircle,
  Flame,
} from 'lucide-react'
import { formatPrice, WHATSAPP_BASE } from '../data/menuData'

const MODALITIES = [
  { id: 'local', label: 'Consumo en el Local', icon: UtensilsCrossed, hint: 'Comes en la cevichería' },
  { id: 'delivery', label: 'Delivery', icon: Bike, hint: 'Te lo llevamos' },
  { id: 'recojo', label: 'Recojo en Local', icon: ShoppingBag, hint: 'Lo recoges tú' },
]

export default function CartDrawer({ open, onClose, entries, onUpdateQty, onRemove, onClear }) {
  const [modality, setModality] = useState('local')
  const [name, setName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [address, setAddress] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState('yape')
  const [cashAmount, setCashAmount] = useState('')
  const [touched, setTouched] = useState(false)

  const total = useMemo(() => entries.reduce((s, e) => s + e.product.price * e.qty, 0), [entries])
  const count = useMemo(() => entries.reduce((s, e) => s + e.qty, 0), [entries])

  const cashValue = parseFloat(cashAmount)
  const hasCash = payment === 'efectivo' && !Number.isNaN(cashValue) && cashValue > 0
  const change = hasCash ? cashValue - total : null

  const errors = useMemo(() => {
    const e = {}
    if (!name.trim()) e.name = 'Ingresa tu nombre'
    if (modality === 'local' && !tableNumber.trim()) e.tableNumber = 'Ingresa el número de mesa'
    if (modality === 'delivery' && !address.trim()) e.address = 'Ingresa tu dirección exacta y referencia'
    if (modality === 'recojo' && !pickupTime.trim()) e.pickupTime = 'Ingresa la hora aproximada de recojo'
    return e
  }, [name, tableNumber, address, pickupTime, modality])

  const isValid = Object.keys(errors).length === 0 && count > 0

  const buildMessage = () => {
    const modalityLabel =
      modality === 'local' ? 'Consumo en el Local' : modality === 'delivery' ? 'Delivery' : 'Recojo en Local'
    const lines = []
    lines.push('*CEVICHERÍA WIRA — NUEVO PEDIDO*')
    lines.push('------------------------------')
    lines.push(`*Modalidad:* ${modalityLabel}`)
    lines.push(`*Nombre:* ${name.trim()}`)
    if (modality === 'local') lines.push(`*Número de Mesa:* ${tableNumber.trim()}`)
    if (modality === 'delivery') {
      lines.push(`*Dirección:* ${address.trim()}`)
      lines.push('_(Costo de envío según zona)_')
    }
    if (modality === 'recojo') lines.push(`*Hora aprox. de recojo:* ${pickupTime.trim()}`)
    lines.push('')
    lines.push('*PEDIDO:*')
    entries.forEach((e) => {
      lines.push(`• ${e.qty} × ${e.product.name} — ${formatPrice(e.product.price * e.qty)}`)
      const extras = []
      if (e.spicy) extras.push(`Ají: ${e.spicy}`)
      if (e.note) extras.push(`Nota: ${e.note}`)
      if (extras.length) lines.push(`   (${extras.join(' · ')})`)
    })
    lines.push('')
    if (notes.trim()) lines.push(`*Notas del pedido:* ${notes.trim()}`)
    lines.push(`*Método de pago:* ${payment === 'yape' ? 'Yape' : 'Efectivo'}`)
    if (hasCash) {
      lines.push(`*¿Con cuánto paga?:* ${formatPrice(cashValue)}`)
      if (change !== null && change >= 0) lines.push(`*Vuelto:* ${formatPrice(change)}`)
    }
    lines.push('')
    lines.push(`*TOTAL: ${formatPrice(total)}*`)
    lines.push('------------------------------')
    lines.push('¡Gracias por su pedido! 🦐')
    return lines.join('\n')
  }

  const handleSend = () => {
    setTouched(true)
    if (!isValid) return
    window.open(WHATSAPP_BASE + encodeURIComponent(buildMessage()), '_blank', 'noopener,noreferrer')
  }

  const inputCls = (hasError) =>
    `w-full rounded-xl border bg-white px-3.5 py-3 text-[16px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
      hasError && touched
        ? 'border-rocoto-500 focus:border-rocoto-500 focus:ring-rocoto-500/20'
        : 'border-slate-200 focus:border-marino-500 focus:ring-marino-500/20'
    }`

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-abisal/60 backdrop-blur-sm"
          />
          <div className="pointer-events-none fixed inset-0 z-[70] flex items-end justify-center sm:items-stretch sm:justify-end">
            <motion.div
              initial={{ y: '100%', opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="pointer-events-auto flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-float sm:max-h-none sm:h-full sm:rounded-none sm:rounded-l-3xl"
              role="dialog"
              aria-modal="true"
              aria-label="Tu pedido"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-abisal">Tu Pedido</h2>
                  <p className="text-xs text-slate-500">
                    {count} {count === 1 ? 'producto' : 'productos'} · {formatPrice(total)}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Cerrar pedido"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {entries.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <ShoppingBag size={44} className="text-slate-300" />
                    <p className="mt-3 font-display text-lg font-bold text-slate-700">Tu pedido está vacío</p>
                    <p className="mt-1 text-sm text-slate-500">Agrega tus platos favoritos de la carta.</p>
                    <button
                      onClick={onClose}
                      className="mt-4 rounded-full bg-abisal px-5 py-2.5 text-sm font-bold text-white transition hover:bg-oceano"
                    >
                      Ver la carta
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {entries.map((e) => (
                        <div key={e.key} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-marfil px-3 py-2.5">
                          <img src={e.product.image} alt={e.product.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" loading="lazy" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-800">{e.product.name}</p>
                            <p className="text-xs text-slate-500">{formatPrice(e.product.price)} c/u</p>
                            {(e.spicy || e.note) && (
                              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                                {e.spicy && (
                                  <span className="flex items-center gap-0.5 font-medium text-rocoto-500">
                                    <Flame size={11} /> {e.spicy}
                                  </span>
                                )}
                                {e.note && <span>“{e.note}”</span>}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              onClick={() => onUpdateQty(e.key, e.qty - 1)}
                              aria-label={`Quitar uno de ${e.product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-marino-700 shadow-sm"
                            >
                              <Minus size={14} />
                            </motion.button>
                            <span className="min-w-[24px] text-center text-sm font-bold text-abisal">{e.qty}</span>
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              onClick={() => onUpdateQty(e.key, e.qty + 1)}
                              aria-label={`Agregar uno de ${e.product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-abisal text-white shadow-sm"
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>
                          <span className="w-[72px] shrink-0 text-right text-sm font-bold text-marino-700">
                            {formatPrice(e.product.price * e.qty)}
                          </span>
                        </div>
                      ))}
                      <button onClick={onClear} className="flex items-center gap-1.5 text-xs font-medium text-rocoto-500 transition hover:text-rocoto-600">
                        <Trash2 size={13} /> Vaciar pedido
                      </button>
                    </div>

                    {/* Modalidad */}
                    <h3 className="mt-6 font-display text-sm font-bold uppercase tracking-wide text-abisal">
                      ¿Cómo quieres tu pedido? <span className="text-rocoto-500">*</span>
                    </h3>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {MODALITIES.map((m) => {
                        const Icon = m.icon
                        const active = modality === m.id
                        return (
                          <motion.button
                            key={m.id}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setModality(m.id)}
                            className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-center transition ${
                              active ? 'border-abisal bg-marino-50' : 'border-slate-200 bg-white hover:border-marino-300'
                            }`}
                          >
                            {active && <motion.span layoutId="modality-dot" className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-aji-500" />}
                            <Icon size={22} className={active ? 'text-abisal' : 'text-slate-400'} />
                            <span className={`text-[12px] font-bold leading-tight ${active ? 'text-abisal' : 'text-slate-600'}`}>{m.label}</span>
                            <span className="text-[10px] leading-tight text-slate-400">{m.hint}</span>
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Campos */}
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                          <User size={15} className="text-marino-500" /> Nombre <span className="text-rocoto-500">*</span>
                        </label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className={inputCls(errors.name)} autoComplete="name" />
                        {touched && errors.name && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-rocoto-500"><AlertCircle size={12} /> {errors.name}</p>
                        )}
                      </div>

                      {modality === 'local' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            <Hash size={15} className="text-marino-500" /> Número de Mesa <span className="text-rocoto-500">*</span>
                          </label>
                          <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Ej. 5" inputMode="numeric" className={inputCls(errors.tableNumber)} />
                          {touched && errors.tableNumber && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rocoto-500"><AlertCircle size={12} /> {errors.tableNumber}</p>
                          )}
                        </motion.div>
                      )}

                      {modality === 'delivery' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            <MapPin size={15} className="text-marino-500" /> Dirección exacta y Referencia <span className="text-rocoto-500">*</span>
                          </label>
                          <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej. Av. España 123, frente al parque, casa azul" rows={2} className={inputCls(errors.address)} />
                          {touched && errors.address && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rocoto-500"><AlertCircle size={12} /> {errors.address}</p>
                          )}
                          <p className="mt-1 text-xs font-medium text-aji-600">* Costo de envío según zona</p>
                        </motion.div>
                      )}

                      {modality === 'recojo' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            <Clock size={15} className="text-marino-500" /> Hora aproximada de recojo <span className="text-rocoto-500">*</span>
                          </label>
                          <input value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} placeholder="Ej. 12:30 PM" className={inputCls(errors.pickupTime)} />
                          {touched && errors.pickupTime && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rocoto-500"><AlertCircle size={12} /> {errors.pickupTime}</p>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Notas globales */}
                    <div className="mt-4">
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <StickyNote size={15} className="text-marino-500" /> Notas del pedido <span className="font-normal text-slate-400">(opcional)</span>
                      </label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder='Ej. "Sin picante", "Poco ají", "Helada"' rows={2} className={inputCls(false)} />
                    </div>

                    {/* Pago */}
                    <h3 className="mt-6 font-display text-sm font-bold uppercase tracking-wide text-abisal">Método de pago</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setPayment('yape')}
                        className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 font-semibold transition ${
                          payment === 'yape' ? 'border-[#742284] bg-[#742284]/5 text-[#742284]' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Smartphone size={18} /> Yape
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setPayment('efectivo')}
                        className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 font-semibold transition ${
                          payment === 'efectivo' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Banknote size={18} /> Efectivo
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {payment === 'efectivo' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-3">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                              ¿Con cuánto paga? <span className="font-normal text-slate-400">(opcional, para llevar vuelto)</span>
                            </label>
                            <input value={cashAmount} onChange={(e) => setCashAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Ej. 50" inputMode="decimal" className={inputCls(false)} />
                            {hasCash && change !== null && (
                              <p className={`mt-1 text-xs font-medium ${change >= 0 ? 'text-emerald-600' : 'text-rocoto-500'}`}>
                                {change >= 0 ? `Vuelto: ${formatPrice(change)}` : `Faltan ${formatPrice(Math.abs(change))} para completar el pago`}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-abisal px-4 py-3.5 text-white">
                      <span className="text-sm font-medium text-slate-300">Total a pagar</span>
                      <span className="font-display text-xl font-extrabold">{formatPrice(total)}</span>
                    </div>
                    {modality === 'delivery' && (
                      <p className="mt-2 text-center text-xs text-slate-500">* El costo de envío se calcula según tu zona y se suma al total.</p>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {entries.length > 0 && (
                <div className="border-t border-slate-100 px-5 py-4">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={handleSend}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-whatsapp-500 px-4 py-4 font-display text-base font-extrabold text-white shadow-lg shadow-whatsapp-500/30 transition hover:bg-whatsapp-600"
                  >
                    <MessageCircle size={22} /> Enviar Pedido por WhatsApp
                  </motion.button>
                  <p className="mt-2 text-center text-[11px] text-slate-400">
                    Se abrirá WhatsApp con tu pedido listo para enviar a Cevichería Wira.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
