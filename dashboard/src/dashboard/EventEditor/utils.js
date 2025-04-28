// Utility: Generate a random 6-character alphanumeric coupon code
export const generateCouponCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Utility: Validate if a ticket form is correctly filled
export const validateTicket = (ticket) => {
  if (!ticket.name) return 'Ticket name is required.';
  if (ticket.type === 'PAID' && (ticket.price === undefined || ticket.price <= 0)) {
    return 'Price must be greater than 0 for paid tickets.';
  }
  return null;
};

// Utility: Validate if a coupon form is correctly filled
export const validateCoupon = (coupon) => {
  if (!coupon.code) return 'Coupon code is required.';
  if (coupon.type !== 'FREE' && (coupon.amount === undefined || coupon.amount <= 0)) {
    return 'Discount amount must be greater than 0.';
  }
  return null;
};