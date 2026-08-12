import { Box, Button, Stack, Typography } from '@mui/material'
import { BrandLogo } from '@/shared/ui/BrandLogo'
import { balloonColors } from '@/core/theme/tokens'
import type { LicencaStatusOutput } from '@/features/licenses/types'
import { Link as RouterLink } from 'react-router-dom'

type Props = {
  status: LicencaStatusOutput
}

export function LicenseRenewalGate({ status }: Props) {
  const renewUrl = status.renewUrl || 'https://balloon.app.br/planos'

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 480,
          width: '100%',
          p: 4,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: `linear-gradient(180deg, ${balloonColors.white} 0%, ${balloonColors.surface} 100%)`,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <BrandLogo variant="lateral" height={40} />
          <Typography variant="h5" component="h1">
            Renove sua licença
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sua assinatura Balloon está {status.status === 'VENCIDA' ? 'vencida' : 'inativa'}. O acesso de
            leitura continua disponível em &quot;Minha licença&quot;, mas criar ou editar eventos fica bloqueado
            até a renovação.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%', pt: 1 }}>
            <Button
              variant="contained"
              href={renewUrl}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
            >
              Ir para planos / renovação
            </Button>
            <Button component={RouterLink} to="/admin/minha-licenca" variant="outlined" fullWidth>
              Ver detalhes da licença
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
