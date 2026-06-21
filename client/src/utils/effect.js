export function effectLabel(effect) {
  if (effect === 0) return '±0';
  return effect > 0 ? `+${effect}` : String(effect);
}

export function effectColor(effect) {
  if (effect > 0) return 'text-green-700';
  if (effect < 0) return 'text-red-600';
  return 'text-neutral-500';
}
