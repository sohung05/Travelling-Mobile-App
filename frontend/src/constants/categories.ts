import { DestinationCategory } from '../types';

export const CATEGORY_NAMES: Record<DestinationCategory, string> = {
  Beach: 'Bãi biển',
  Nature: 'Thiên nhiên',
  Cultural: 'Văn hóa',
  Entertainment: 'Phiêu lưu',
  Luxury: 'Sang trọng',
};

export const getCategoryName = (category?: string | null): string => {
  if (!category) return '';
  return CATEGORY_NAMES[category as DestinationCategory] || category;
};
