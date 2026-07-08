export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    quotation: 'badge-blue',
    packing: 'badge-amber',
    dispatch: 'badge-purple',
    completed: 'badge-green',
    quotation_received: 'badge-blue',
    unpaid: 'badge-red',
    paid: 'badge-green',
    in_progress: 'badge-amber',
  };
  return map[status] || 'badge-gray';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    quotation: 'Quotation',
    packing: 'Packing',
    dispatch: 'Dispatched',
    completed: 'Completed',
    quotation_received: 'Received',
    unpaid: 'Unpaid',
    paid: 'Paid',
    in_progress: 'In Progress',
  };
  return map[status] || status;
}
