import locations from './turkeyLocations.json';

export interface CityData {
  cityName: string;
  cityCode: number;
  districts: string[];
}

export const CITIES: CityData[] = (locations as CityData[])
  .filter((c) => c.cityName && c.cityName.trim().length > 0)
  .sort((a, b) => a.cityName.localeCompare(b.cityName, 'tr'));

export function getDistrictsByCity(cityName: string): string[] {
  if (!cityName) return [];
  const found = CITIES.find((c) => c.cityName.toUpperCase() === cityName.toUpperCase());
  return found ? [...found.districts].sort((a, b) => a.localeCompare(b, 'tr')) : [];
}
