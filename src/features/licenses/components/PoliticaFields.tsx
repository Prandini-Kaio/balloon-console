import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { LICENCA_PERMISSOES, PERMISSAO_LABELS, type LicencaPermissao } from '@/features/licenses/types'

type Props = {
  permissoes: LicencaPermissao[]
  onChange: (next: LicencaPermissao[]) => void
  disabled?: boolean
}

export function PermissoesCheckboxGroup({ permissoes, onChange, disabled }: Props) {
  function toggle(code: LicencaPermissao) {
    if (permissoes.includes(code)) {
      onChange(permissoes.filter((p) => p !== code))
    } else {
      onChange([...permissoes, code])
    }
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Permissões</Typography>
      <FormGroup>
        {LICENCA_PERMISSOES.map((code) => (
          <FormControlLabel
            key={code}
            control={
              <Checkbox
                checked={permissoes.includes(code)}
                onChange={() => toggle(code)}
                disabled={disabled}
                size="small"
              />
            }
            label={PERMISSAO_LABELS[code]}
          />
        ))}
      </FormGroup>
    </Stack>
  )
}

type LimitsProps = {
  maxEventos: string
  maxUsuarios: string
  onMaxEventos: (v: string) => void
  onMaxUsuarios: (v: string) => void
  disabled?: boolean
  helper?: string
}

export function LimitesFields({
  maxEventos,
  maxUsuarios,
  onMaxEventos,
  onMaxUsuarios,
  disabled,
  helper = 'Deixe vazio para ilimitado',
}: LimitsProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        label="Máx. eventos"
        value={maxEventos}
        onChange={(e) => onMaxEventos(e.target.value)}
        disabled={disabled}
        size="small"
        type="number"
        helperText={helper}
        fullWidth
      />
      <TextField
        label="Máx. usuários"
        value={maxUsuarios}
        onChange={(e) => onMaxUsuarios(e.target.value)}
        disabled={disabled}
        size="small"
        type="number"
        helperText={helper}
        fullWidth
      />
    </Stack>
  )
}

export function parseOptionalInt(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
