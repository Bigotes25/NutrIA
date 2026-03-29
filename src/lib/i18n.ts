export const TRANSLATIONS: Record<string, string> = {
  // Categories
  'BREAKFAST': 'Desayuno',
  'LUNCH': 'Almuerzo',
  'DINNER': 'Cena',
  'SNACK': 'Snack',
  'OTHER': 'Otro',
  
  // Source Types
  'TEXT': 'Texto',
  'IMAGE': 'Imagen',
  'AUDIO': 'Audio',
  'MANUAL': 'Manual',
}

export function t(key: string): string {
  return TRANSLATIONS[key] || key
}
