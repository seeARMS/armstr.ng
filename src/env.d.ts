declare module 'virtual:photo-meta' {
  type PhotoMeta = {
    camera?: string
    lens?: string
    lensFull?: string
    focal?: string
    aperture?: string
    shutter?: string
    iso?: string
    date?: string
    /** The photo's average color in OKLCH: hue in degrees, and chroma. */
    tint?: { hue: number; chroma: number }
    /** An exposure of a second or more: the night sky. */
    night?: boolean
  }
  const meta: Record<string, PhotoMeta>
  export default meta
}

declare module 'virtual:post-images' {
  type PostImage = {
    width: number
    height: number
    /** A PNG of flat graphics (a screenshot), to be served as PNG, not lossy WebP. */
    lossless: boolean
    /** A ~16px WebP of the image, as a data URL, for the blurred preview. */
    preview: { src: string; width: number; height: number }
  }
  const images: Record<string, PostImage>
  export default images
}
