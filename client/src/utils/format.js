export function formatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n));
}

export function conditionLabel(c) {
  const map = { new: 'Like new', good: 'Good', fair: 'Fair', worn: 'Worn' };
  return map[c] || c || '—';
}

export function sellerId(seller) {
  if (!seller) return '';
  return String(seller._id ?? seller);
}
