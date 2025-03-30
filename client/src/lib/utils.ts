import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericPrice);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateStarRating(rating: number): { type: string; className: string; key: string }[] {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push({ 
      type: 'i', 
      className: "fas fa-star", 
      key: `star-${i}` 
    });
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push({ 
      type: 'i', 
      className: "fas fa-star-half-alt", 
      key: "half-star" 
    });
  }
  
  // Add empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push({ 
      type: 'i', 
      className: "far fa-star", 
      key: `empty-star-${i}` 
    });
  }
  
  return stars;
}
