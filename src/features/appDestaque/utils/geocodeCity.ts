export type GeocodeResult = {
  latitude: number
  longitude: number
  displayName: string
}

export async function geocodeCity(cidade: string, estado: string): Promise<GeocodeResult | null> {
  const city = cidade.trim()
  const uf = estado.trim().toUpperCase()
  if (!city || !uf) return null

  const query = encodeURIComponent(`${city}, ${uf}, Brasil`)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=br`,
    {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'pt-BR',
      },
    },
  )
  if (!res.ok) return null

  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
  const hit = data[0]
  if (!hit) return null

  return {
    latitude: Number(hit.lat),
    longitude: Number(hit.lon),
    displayName: hit.display_name,
  }
}
