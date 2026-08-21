"use server";

import { apiRequest } from "@/lib/admin-api";

export interface ZoneBuilding {
  id: number;
  name: string;
  landmark: string;
  is_active: boolean;
}

/**
 * Buildings registered in one zone, for the vendor form's pickup selector.
 *
 * Fetched per zone rather than shipping every building to the client: the
 * list grows with the platform, and only one zone's worth is ever shown.
 */
export async function getZoneBuildings(zoneId: number): Promise<ZoneBuilding[]> {
  if (!zoneId) return [];

  const { data } = await apiRequest(`/api/locations/buildings/?zone=${zoneId}`, "GET");
  // This endpoint is unpaginated, so a plain array is the expected shape.
  if (!Array.isArray(data)) return [];

  return (data as ZoneBuilding[])
    .filter((building) => building.is_active)
    .map(({ id, name, landmark, is_active }) => ({ id, name, landmark, is_active }));
}
