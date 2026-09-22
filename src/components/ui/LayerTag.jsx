// LayerTag (docs/thiet-ke.md mục 4) — Tầng 1 / 2 / 3, theo bảng màu CLAUDE.md.
const LAYER_STYLE = {
  1: 'border-teal-600 bg-teal-50 text-teal-700',
  2: 'border-violet-600 bg-violet-50 text-violet-700',
  3: 'border-orange-600 bg-orange-50 text-orange-700',
}

export default function LayerTag({ layer, className = '' }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-label font-medium ${LAYER_STYLE[layer] ?? LAYER_STYLE[1]} ${className}`}
    >
      Tầng {layer}
    </span>
  )
}
