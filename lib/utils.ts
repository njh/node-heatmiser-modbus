// Library of utility functions

export function isDST (d: Date): boolean {
  const jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset()
  return Math.max(jan, jul) !== d.getTimezoneOffset()
}
