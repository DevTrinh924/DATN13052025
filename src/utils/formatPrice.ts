/**
 * Định dạng giá tiền VND
 * @param price - Giá tiền cần định dạng (number)
 * @returns Chuỗi giá tiền đã được định dạng (string)
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Ví dụ: formatPrice(1000000) => "1.000.000 ₫"