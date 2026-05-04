export const transactionTypeStyles: Record<string, string> = {
  sell: 'chip-success',
  buy: 'chip-blue',
  inquiry: 'chip-warning',
  offer: 'chip-danger',
}

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
