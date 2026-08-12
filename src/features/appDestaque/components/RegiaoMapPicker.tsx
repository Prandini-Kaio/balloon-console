import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { BRAZIL_UFS, formatRegiaoLabel } from '@/features/appDestaque/utils/brazilUfs'
import { geocodeCity } from '@/features/appDestaque/utils/geocodeCity'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export type RegiaoMapValue = {
  nome: string
  cidade: string
  estado: string
  latitude: number
  longitude: number
  raioKm: number
}

type RegiaoMapPickerProps = {
  value: RegiaoMapValue
  onChange: (next: RegiaoMapValue) => void
}

function MapRecenter({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom())
  }, [latitude, longitude, map])
  return null
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function RegiaoMapPicker({ value, onChange }: RegiaoMapPickerProps) {
  const [geoError, setGeoError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  async function buscarCidade() {
    setGeoError(null)
    setSearching(true)
    try {
      const hit = await geocodeCity(value.cidade, value.estado)
      if (!hit) {
        setGeoError('Cidade não encontrada. Confira o nome e a UF.')
        return
      }
      const label = formatRegiaoLabel(value.cidade, value.estado)
      onChange({
        ...value,
        latitude: hit.latitude,
        longitude: hit.longitude,
        nome: value.nome.trim() ? value.nome : label,
      })
    } finally {
      setSearching(false)
    }
  }

  const circleRadiusM = useMemo(() => Math.max(100, value.raioKm * 1000), [value.raioKm])

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Informe cidade e estado. O mapa centraliza a região; clique no mapa para ajustar o centro ou use o raio para
        cobrir bairros e áreas maiores.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Cidade"
          value={value.cidade}
          onChange={(e) => onChange({ ...value, cidade: e.target.value })}
          fullWidth
          required
        />
        <FormControl fullWidth required>
          <InputLabel>UF</InputLabel>
          <Select
            label="UF"
            value={value.estado}
            onChange={(e) => onChange({ ...value, estado: e.target.value })}
          >
            {BRAZIL_UFS.map((uf) => (
              <MenuItem key={uf} value={uf}>
                {uf}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Button variant="outlined" onClick={() => void buscarCidade()} disabled={searching}>
        {searching ? 'Buscando…' : 'Localizar cidade no mapa'}
      </Button>

      {geoError ? <Alert severity="warning">{geoError}</Alert> : null}

      <TextField
        label="Nome da região"
        value={value.nome}
        onChange={(e) => onChange({ ...value, nome: e.target.value })}
        helperText="Ex.: Maringá - PR ou Centro — Maringá"
        fullWidth
        required
      />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Raio de exibição: {value.raioKm} km
        </Typography>
        <Slider
          value={value.raioKm}
          min={1}
          max={80}
          step={1}
          valueLabelDisplay="auto"
          onChange={(_, v) => onChange({ ...value, raioKm: v as number })}
        />
      </Box>

      <Box sx={{ height: 320, borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
        <MapContainer
          center={[value.latitude, value.longitude]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter latitude={value.latitude} longitude={value.longitude} />
          <MapClickHandler
            onPick={(lat, lng) => onChange({ ...value, latitude: lat, longitude: lng })}
          />
          <Marker position={[value.latitude, value.longitude]} />
          <Circle
            center={[value.latitude, value.longitude]}
            radius={circleRadiusM}
            pathOptions={{ color: '#1976d2', fillColor: '#1976d2', fillOpacity: 0.15 }}
          />
        </MapContainer>
      </Box>

      <Button size="small" onClick={() => setShowAdvanced((v) => !v)}>
        {showAdvanced ? 'Ocultar coordenadas' : 'Ajuste fino (coordenadas)'}
      </Button>
      <Collapse in={showAdvanced}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Latitude"
            type="number"
            value={value.latitude}
            onChange={(e) => onChange({ ...value, latitude: Number(e.target.value) })}
            fullWidth
            slotProps={{ htmlInput: { step: 'any' } }}
          />
          <TextField
            label="Longitude"
            type="number"
            value={value.longitude}
            onChange={(e) => onChange({ ...value, longitude: Number(e.target.value) })}
            fullWidth
            slotProps={{ htmlInput: { step: 'any' } }}
          />
        </Stack>
      </Collapse>
    </Stack>
  )
}
