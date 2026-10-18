import { existsSync } from 'node:fs'
import path from 'node:path'
import Image from 'next/image'

type Device = 'phone' | 'laptop'

const frame: Record<Device, { box: string; width: number; height: number }> = {
  phone: { box: 'aspect-[9/19.5] w-full max-w-[260px] rounded-[2rem] border-[6px]', width: 390, height: 844 },
  laptop: { box: 'aspect-[16/10] w-full rounded-xl border-[6px]', width: 1440, height: 900 },
}

// Real product screenshots live in public/screens/. Until a file is supplied, a labelled
// frame marks what belongs there so the layout can be reviewed.
export default function Screenshot({
  file,
  alt,
  device,
  className = '',
}: {
  file: string
  alt: string
  device: Device
  className?: string
}) {
  const src = `/screens/${file}`
  const { box, width, height } = frame[device]
  const present = existsSync(path.join(process.cwd(), 'public', 'screens', file))

  return (
    <div className={`${box} overflow-hidden border-neutral-800 bg-panel shadow-2xl ${className}`}>
      {present ? (
        <Image src={src} alt={alt} width={width} height={height} className="h-full w-full object-cover object-top" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-white/20 p-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rslRed">Screenshot</span>
          <span className="text-xs text-neutral-400">{alt}</span>
          <span className="font-mono text-[10px] text-neutral-600">{src}</span>
        </div>
      )}
    </div>
  )
}
