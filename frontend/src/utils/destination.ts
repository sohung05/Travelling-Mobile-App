import { Destination } from '../types';

export type DestinationLike = Partial<Destination> & {
  reviewCount?: number;
  reviews?: number;
  price?: number | string | null;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    country?: string;
  } | null;
  type?: 'DOMESTIC' | 'INTERNATIONAL' | string;
};

export const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

export const getDestinationPrice = (destination?: DestinationLike | null): number => {
  return toNumber(destination?.price, 0);
};

export const formatPriceAmount = (rawAmount: unknown): string => {
  const amount = toNumber(rawAmount, NaN);
  if (!Number.isFinite(amount)) return 'Liên hệ';
  if (amount >= 100000) {
    try {
      return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} ₫`;
    } catch {
      return `${Math.round(amount).toLocaleString('vi-VN')} ₫`;
    }
  }
  return `$${amount.toLocaleString('en-US')}`;
};

export const formatDestinationPrice = (destination?: DestinationLike | null): string => {
  const amount = getDestinationPrice(destination);
  return formatPriceAmount(amount);
};

export const getDestinationReviewCount = (destination?: DestinationLike | null): number => {
  return toNumber(destination?.reviews ?? destination?.reviewCount, 0);
};

export const getDestinationRating = (destination?: DestinationLike | null): number => {
  const rating = toNumber(destination?.rating, 0);
  return Math.max(0, Math.min(5, rating));
};

export const getDestinationTypeLabel = (destination?: DestinationLike | null): string | null => {
  const type = destination?.type;
  if (type === 'DOMESTIC') return 'Trong nước';
  if (type === 'INTERNATIONAL') return 'Quốc tế';
  const country = (destination?.country || destination?.location?.country || '').trim().toLowerCase();
  if (!country) return null;
  if (country === 'vietnam' || country === 'việt nam' || country === 'viet nam') return 'Trong nước';
  return 'Quốc tế';
};

export const getDestinationLocationText = (destination?: DestinationLike | null): string => {
  const loc = destination?.location;
  const parts = [loc?.address, loc?.city, loc?.country || destination?.country]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);
  // Deduplicate while preserving order
  const unique: string[] = [];
  for (const part of parts) {
    if (!unique.some((u) => u.toLowerCase() === part.toLowerCase())) unique.push(part);
  }
  return unique.join(', ');
};
