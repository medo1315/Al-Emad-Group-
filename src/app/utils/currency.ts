/**
 * Formats a numeric price into Egyptian Pounds (EGP / ج.م) based on the active language.
 * Displays commas for thousands separator and 2 decimal places.
 * 
 * @param price The numeric price value
 * @param language The current language ('ar' or 'en')
 * @returns Formatted currency string
 */
export function formatPrice(price: number, language: string): string {
  const formattedPrice = price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return language === "ar" ? `${formattedPrice} ج.م` : `EGP ${formattedPrice}`;
}
