type BrandLogoProps = {
  variant?: 'lateral' | 'icon' | 'full'
  height?: number
  alt?: string
}

const sources = {
  lateral: `${import.meta.env.BASE_URL}brand/logo_azul_lateral_esquerdo.svg`,
  icon: `${import.meta.env.BASE_URL}brand/Balloon_azul.svg`,
  full: `${import.meta.env.BASE_URL}brand/logo_azul_portugues.svg`,
} as const

export function BrandLogo({ variant = 'lateral', height = 36, alt = 'Balloon' }: BrandLogoProps) {
  return (
    <img
      src={sources[variant]}
      alt={alt}
      height={height}
      style={{ display: 'block', width: 'auto', maxWidth: '100%' }}
    />
  )
}
