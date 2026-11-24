# Cevichería Wira — Carta Digital Interactiva y Pedidos Omnicanal

Aplicación web de nivel ejecutivo para **CEVICHERÍA WIRA** (Trujillo, Perú). Carta digital interactiva con personalización por plato (nivel de ají + nota), carrusel de favoritos y cierre de pedido por WhatsApp. Moneda: Soles (S/).

## Tecnologías

- **React 18 + Vite 5**
- **Tailwind CSS v3** (PostCSS + Autoprefixer)
- **Framer Motion** (stagger, `whileInView`, `layoutId`, `AnimatePresence`)
- **Lucide React** (iconos)

## Dirección de arte

- Fondo marfil arena `#F8FAFC` con patrón sutil de olas SVG.
- Hero y header en azul abisal `#040D21` → azul océano `#0B2447` con destellos turquesa `#19A7CE`.
- Tarjetas blancas con borde ultrafino y sombra multicapa; acentos dorado ají `#F59E0B`, rojo rocoto `#E11D48` y verde WhatsApp `#16A34A`.
- Emblema SVG de langostino en oro y blanco dentro de escudo marino + "Tradición Marina Trujillana".
- Indicador en vivo "Cocina Abierta Hoy · Atención al Momento" y tarjetas glassmorphism con las 3 modalidades: En Mesa (QR), Delivery Express, Recojo en Local.

## Funcionalidades

- **Los Favoritos de Wira**: carrusel horizontal con Wira Mix, Trío Marino y Ceviche Mixto (badge "Más Pedido").
- Buscador inteligente en tiempo real (nombre, ingredientes, categoría) con botón limpiar + pestañas filtrables con píldora animada `layoutId="activeCategoryPill"`.
- Catálogo completo de **40 productos** con precios exactos, imágenes referenciales de Unsplash y etiqueta "Imagen referencial".
- **ProductModal**: selector de ají ("Sin ají", "Ají normal", "Bien picante") para platos marinos, nota específica por plato y cantidad.
- **CartDrawer** omnicanal (bottom-sheet en móvil, panel lateral en escritorio): 3 modalidades (mesa/dirección/hora), notas globales, pago Yape/Efectivo con vuelto, y envío a `https://wa.me/51935466580?text=...` con ticket detallado.
- Barra flotante con contador y total + botón flotante para volver al inicio.

## Desarrollo local

```bash
npm install
npm run dev
```

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel, importa el proyecto (preset **Vite**, build `npm run build`, output `dist`).
3. Deploy. Incluye `vercel.json` con rewrite SPA.

## Estructura

```
index.html
package.json
tailwind.config.js / postcss.config.js / vite.config.js / vercel.json
src/
  main.jsx
  index.css                 # base, scrollbar, glassmorphism, patrón de olas
  data/menuData.js          # 40 ítems exactos + categorías + helpers
  components/
    Navbar.jsx              # header abisal + emblema escudo/langostino
    HeroSection.jsx         # hero premium + modalidades glass
    FeaturedCarousel.jsx    # Los Favoritos de Wira
    CategoryTabs.jsx        # buscador sticky + pestañas animadas
    ProductCard.jsx         # tarjeta de plato
    ProductModal.jsx        # detalle + ají + nota + cantidad
    CartDrawer.jsx          # pedido omnicanal + WhatsApp
    FloatingCartBar.jsx     # barra flotante de total
  App.jsx                   # orquestación: filtros, carrito, modales
```
