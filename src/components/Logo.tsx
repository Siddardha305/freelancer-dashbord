import React from 'react';

interface LogoProps {
  height?: number;
  className?: string;
}

export default function Logo({ height = 48, className = '' }: LogoProps) {
  return (
    <div className={`logo-wrapper inline-flex items-center select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/smartadverts-color.png"
        onError={(e) => {
          e.currentTarget.src = "https://res.cloudinary.com/drfiuipgl/image/upload/v1781253019/smartadverts-color_vszm4p.webp";
        }}
        alt="SmartAdverts Logo"
        style={{ height: `${height}px`, width: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
}
