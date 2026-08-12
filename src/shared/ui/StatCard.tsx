import { Card, CardContent, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: ReactNode
  hint?: string
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h4" component="p" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}
