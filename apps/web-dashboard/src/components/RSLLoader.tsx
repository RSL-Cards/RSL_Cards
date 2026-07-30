'use client'

import React from 'react'
import Image from 'next/image'

/**
 * RSL Logo Loading Animation
 *
 * Logo image fades in first, then "R", "S", "L" letters appear
 * one by one in slow motion with blur + scale. Premium feel, loops.
 */
export default function RSLLoader({ size = 88 }: { size?: number }) {
  const logoSize = Math.round(size * 1.35)

  return (
    <div className="rsl-loader-wrapper">
      <div className="rsl-logo-icon">
        <Image
          src="/rslicon.jpeg"
          alt="RSL Cards"
          width={logoSize}
          height={logoSize}
          className="rsl-logo-img"
        />
      </div>
      <div className="rsl-loader-letters">
        <span className="rsl-letter rsl-r" style={{ fontSize: size }}>R</span>
        <span className="rsl-letter rsl-s" style={{ fontSize: size }}>S</span>
        <span className="rsl-letter rsl-l" style={{ fontSize: size }}>L</span>
      </div>

      <style jsx>{`
        .rsl-loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 0;
          gap: 16px;
        }

        .rsl-logo-icon {
          animation: rsl-logo-pulse 3.6s ease-in-out infinite;
        }

        .rsl-logo-icon :global(.rsl-logo-img) {
          border-radius: 20px;
        }

        .rsl-loader-letters {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rsl-letter {
          font-weight: 900;
          letter-spacing: 4px;
          opacity: 0;
          transform: scale(0.5) translateY(8px);
          animation: rsl-reveal 3.6s ease-in-out infinite;
        }

        .rsl-r {
          color: #E8001C;
          animation-delay: 0.3s;
        }

        .rsl-s {
          color: #FFFFFF;
          animation-delay: 0.8s;
        }

        .rsl-l {
          color: #0057FF;
          animation-delay: 1.3s;
        }

        @keyframes rsl-logo-pulse {
          0% {
            opacity: 0.3;
            transform: scale(0.85);
            filter: blur(2px);
          }
          20% {
            opacity: 1;
            transform: scale(1.05);
            filter: blur(0px);
          }
          30% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
          70% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
          85% {
            opacity: 0.5;
            transform: scale(0.95);
            filter: blur(1px);
          }
          100% {
            opacity: 0.3;
            transform: scale(0.85);
            filter: blur(2px);
          }
        }

        @keyframes rsl-reveal {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(8px);
            filter: blur(4px);
          }
          15% {
            opacity: 1;
            transform: scale(1.08) translateY(0px);
            filter: blur(0px);
          }
          25% {
            opacity: 1;
            transform: scale(1) translateY(0px);
            filter: blur(0px);
          }
          65% {
            opacity: 1;
            transform: scale(1) translateY(0px);
            filter: blur(0px);
          }
          80% {
            opacity: 0.4;
            transform: scale(0.95) translateY(2px);
            filter: blur(1px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateY(8px);
            filter: blur(4px);
          }
        }
      `}</style>
    </div>
  )
}
