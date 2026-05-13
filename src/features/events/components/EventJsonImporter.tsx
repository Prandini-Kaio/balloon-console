import { useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { EventFormValues } from '@/features/events/types'
import { EVENT_IMPORT_JSON_EXAMPLE, parseEventImportJson } from '@/features/events/eventImportJson'

type EventJsonImporterProps = {
  onApply: (patch: Partial<EventFormValues>) => void
}

export function EventJsonImporter({ onApply }: EventJsonImporterProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleApply() {
    setError(null)
    const r = parseEventImportJson(text)
    if (!r.ok) {
      setError(r.error)
      return
    }
    onApply(r.value)
  }

  function handleFillExample() {
    setText(EVENT_IMPORT_JSON_EXAMPLE)
    setError(null)
  }

  return (
    <Accordion disableGutters sx={{ mb: 2, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<Typography component="span" sx={{ fontSize: 18 }}>▾</Typography>}>
        <Typography component="div" sx={{ fontWeight: 600 }}>
          Importar de JSON
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Cole um JSON com os campos que deseja preencher (parcial ou completo). Campos aceitos: nome,
            descricao, categoriaId, status, tipoEvento, latitude, longitude, dataInicio, dataFim, ativo,
            companyId. Datas em ISO ou no formato usado pelo campo local (AAAA-MM-DDTHH:mm).
          </Typography>
          <Button size="small" variant="outlined" onClick={handleFillExample}>
            Inserir modelo no campo
          </Button>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="JSON"
            value={text}
            onChange={(e) => setText(e.target.value)}
            multiline
            minRows={10}
            fullWidth
            spellCheck={false}
            sx={{ '& textarea': { fontFamily: 'ui-monospace, monospace', fontSize: 13 } }}
          />
          <Box>
            <Button variant="contained" onClick={handleApply}>
              Aplicar ao formulário
            </Button>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
