import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  href?: string
}

const sizeMap = {
  sm: { width: 100, height: 30 },
  md: { width: 140, height: 42 },
  lg: { width: 180, height: 54 },
  xl: { width: 240, height: 72 },
}

export default function Logo({ size = 'md', className = '', href = '/' }: LogoProps) {
  const dimensions = sizeMap[size]

  const logoImage = (
    <Image
      src="/images/ideepx-logo.png"
      alt="iDeepX"
      width={dimensions.width}
      height={dimensions.height}
      priority
      className={`object-contain ${className}`}
      style={{ width: 'auto', height: dimensions.height }}
    />
  )

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-80 transition-opacity">
        {logoImage}
      </Link>
    )
  }

  return logoImage
}
