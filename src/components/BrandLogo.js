import Image from 'next/image'

export default function BrandLogo({ className = '', priority = false }) {
  return (
    <Image
      src="/brand/brand-mark-512.png"
      alt=""
      width={512}
      height={512}
      className={className}
      priority={priority}
      draggable={false}
    />
  )
}

