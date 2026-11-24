"""Convierte las imágenes de banner (fondo sólido de color) en PNG con fondo
transparente real (canal alfa), estilo recorte de Blendy.

Método: flood-fill desde los bordes sobre los píxeles cercanos al color de fondo,
relleno de agujeros internos (para no perforar vidrios/transparentes del plato),
suavizado del alfa y "despille" (un-premultiply) de los bordes para quitar el tinte
del color de fondo.

Uso: .venv/bin/python tools/cutout.py public/images/banner-wira-mix.png public/images/cutout-wira-mix.png
"""
import sys
import pathlib

import numpy as np
from PIL import Image, ImageFilter

MAX_SIDE = 900
TOL = 52.0          # tolerancia de color del fondo (distancia euclidiana RGB)
FEATHER = 1.4       # radio de suavizado del borde alfa
ALPHA_FLOOR = 8     # por debajo de esto el píxel se vuelve totalmente transparente


def flood(near: np.ndarray, seeds: np.ndarray) -> np.ndarray:
    """Crece `seeds` a través de los píxeles True de `near` (4-vecinos)."""
    mask = seeds.copy()
    prev = -1
    total = mask.sum()
    while total != prev:
        prev = total
        grow = mask.copy()
        grow[1:, :] |= mask[:-1, :]
        grow[:-1, :] |= mask[1:, :]
        grow[:, 1:] |= mask[:, :-1]
        grow[:, :-1] |= mask[:, 1:]
        mask = grow & near
        total = mask.sum()
    return mask


def cutout(src: pathlib.Path, dst: pathlib.Path) -> None:
    img = Image.open(src).convert("RGB")
    arr = np.asarray(img).astype(np.float32)
    h, w, _ = arr.shape

    # Color de fondo: mediana de los píxeles del borde
    border = np.concatenate([arr[0, :], arr[-1, :], arr[:, 0], arr[:, -1]], axis=0)
    bg = np.median(border, axis=0)

    dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
    near_global = dist < 150.0  # cualquier tono parecido al fondo (incluye degradado/viñeta)

    # El fondo es suave: crece solo por zonas de gradiente bajo para no entrar al plato
    gx = np.abs(np.diff(arr, axis=1)).sum(axis=2)  # (h, w-1)
    gy = np.abs(np.diff(arr, axis=0)).sum(axis=2)  # (h-1, w)
    gxp = np.zeros((h, w), dtype=np.float32)
    gxp[:, :-1] = gx
    gxp[:, 1:] = np.maximum(gxp[:, 1:], gx)
    gyp = np.zeros((h, w), dtype=np.float32)
    gyp[:-1, :] = gy
    gyp[1:, :] = np.maximum(gyp[1:, :], gy)
    grad = np.maximum(gxp, gyp)
    growable = near_global & (grad < 20.0)

    seeds = np.zeros((h, w), dtype=bool)
    seeds[0, :] = growable[0, :]
    seeds[-1, :] = growable[-1, :]
    seeds[:, 0] = growable[:, 0]
    seeds[:, -1] = growable[:, -1]
    bg_mask = flood(growable, seeds)

    # Rellenar agujeros internos: regiones NO-fondo que no tocan el borde
    inv = ~bg_mask
    inv_seeds = np.zeros((h, w), dtype=bool)
    inv_seeds[0, :] = inv[0, :]
    inv_seeds[-1, :] = inv[-1, :]
    inv_seeds[:, 0] = inv[:, 0]
    inv_seeds[:, -1] = inv[:, -1]
    reachable = flood(inv, inv_seeds)
    holes = inv & ~reachable
    bg_mask = bg_mask & ~holes

    # Alfa con borde suavizado
    alpha_u8 = np.where(bg_mask, 0, 255).astype(np.uint8)
    alpha_u8 = np.array(Image.fromarray(alpha_u8, "L").filter(ImageFilter.GaussianBlur(FEATHER)), copy=True)
    alpha_u8[alpha_u8 < ALPHA_FLOOR] = 0
    af = alpha_u8.astype(np.float32) / 255.0

    # Despille: recuperar el color original en los píxeles semitransparentes
    a3 = np.clip(af[..., None], 0.06, 1.0)
    recovered = np.clip((arr - (1.0 - a3) * bg) / a3, 0.0, 255.0)
    rgb = np.where(af[..., None] < 0.999, recovered, arr)

    rgba = np.dstack([rgb.astype(np.uint8), alpha_u8])
    out = Image.fromarray(rgba, "RGBA")

    # Recortar al contenido visible
    ys, xs = np.where(alpha_u8 > ALPHA_FLOOR)
    if len(xs):
        pad = 6
        x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, out.width)
        y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, out.height)
        out = out.crop((x0, y0, x1, y1))

    if max(out.size) > MAX_SIDE:
        out.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)

    out.save(dst, "PNG", optimize=True)
    print(f"{dst}  {out.size[0]}x{out.size[1]}  {dst.stat().st_size // 1024} KB")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        src = pathlib.Path(arg)
        dst = src.with_name(src.stem.replace("banner-", "cutout-") + ".png")
        cutout(src, dst)
