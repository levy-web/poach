"use client";

import { useEffect, useRef, useState } from "react";
import { SelectField } from "@/components/FormDialog";
import { getZoneBuildings, type ZoneBuilding } from "@/lib/building-search";
import type { Zone } from "@/lib/dal";

/**
 * Zone and pickup building, linked: the building list is scoped to the
 * chosen zone, because the API rejects a building from another zone (it
 * would send runners to the wrong neighborhood).
 */
export default function ZoneBuildingFields({
  zones,
  initialZone,
  initialBuilding,
  zoneError,
  buildingError,
}: {
  zones: Zone[];
  initialZone: string;
  initialBuilding: string;
  zoneError?: string;
  buildingError?: string;
}) {
  const [zoneId, setZoneId] = useState(initialZone);
  const [buildings, setBuildings] = useState<ZoneBuilding[]>([]);
  const [loading, setLoading] = useState(false);
  // Keeps the saved building selected on first render, but clears it as soon
  // as the admin switches zones — the old building isn't valid there.
  const [buildingId, setBuildingId] = useState(initialBuilding);
  const isFirstRun = useRef(true);
  const requestId = useRef(0);

  useEffect(() => {
    if (!zoneId) {
      setBuildings([]);
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    (async () => {
      const found = await getZoneBuildings(Number(zoneId));
      // Ignore a slower earlier request that resolved after a newer one.
      if (id !== requestId.current) return;
      setBuildings(found);
      setLoading(false);
    })();
  }, [zoneId]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setBuildingId("");
  }, [zoneId]);

  const buildingOptions = buildings.map((building) => ({
    value: String(building.id),
    label: building.landmark ? `${building.name} — ${building.landmark}` : building.name,
  }));

  const buildingHint = !zoneId
    ? "Choose a zone first."
    : loading
      ? "Loading buildings..."
      : buildings.length === 0
        ? "No buildings registered in this zone yet."
        : "Where runners collect orders from this vendor.";

  return (
    <>
      <SelectField
        label="Zone"
        name="zone"
        placeholder="Select a zone"
        defaultValue={zoneId}
        options={zones.map((zone) => ({ value: String(zone.id), label: zone.name }))}
        error={zoneError}
        onChange={setZoneId}
      />

      <SelectField
        label="Pickup building"
        name="pickup_building"
        placeholder={buildings.length === 0 ? "None available" : "Select a building"}
        defaultValue={buildingId}
        options={buildingOptions}
        error={buildingError}
        hint={buildingHint}
        disabled={!zoneId || loading || buildings.length === 0}
        onChange={setBuildingId}
      />
    </>
  );
}
