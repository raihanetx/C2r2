export const slugify = (text: string): string => {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export const formatPrice = (price: number, currency: string, rate: number): string => {
  if (currency === 'USD') {
    return `$${price.toFixed(2)}`;
  } else {
    return `৳${(price * rate).toFixed(0)}`;
  }
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export const calculateOrderTotals = (items: Array<{ productId: string; quantity: number }>, products: any[]): OrderTotals => {
  // Ensure products is an array
  const productsArray = Array.isArray(products) ? products : [];
  
  const subtotal = items.reduce((sum, item) => {
    const product = productsArray.find(p => p.id === item.productId);
    if (!product) return sum;
    return sum + (product.pricing[0].price * item.quantity);
  }, 0);

  const shipping = 0; // Free shipping for digital products
  const tax = 0; // No tax for digital products
  const total = subtotal + shipping + tax;

  return { subtotal, tax, shipping, total };
}