import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'KI MUSIKK - Lag norske sanger med KI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06090F 0%, #0F1629 50%, #141E33 100%)',
          position: 'relative',
        }}
      >
        {/* Orange accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242,101,34,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Logo + Title row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '20px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://kimusikk.no/ki-musikk.png"
            width={80}
            height={80}
            alt=""
          />
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-1px',
            }}
          >
            KI MUSIKK
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '32px',
          }}
        >
          Lag norske sanger med KI
        </div>

        {/* Orange accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            background: 'linear-gradient(90deg, #F26522, #FF8844)',
            borderRadius: '2px',
            marginBottom: '32px',
            display: 'flex',
          }}
        />

        {/* URL */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          kimusikk.no
        </div>
      </div>
    ),
    { ...size }
  )
}
