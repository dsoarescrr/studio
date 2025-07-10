// src/components/pixel-grid/PortugalMapSvg.tsx
'use client';

import React, { useEffect, useRef } from 'react';

export interface MapData {
  svgElement: SVGSVGElement;
  pathStrings: string[];
}

interface PortugalMapSvgProps {
  className?: string;
  onMapDataLoaded?: (data: MapData) => void;
}

export default function PortugalMapSvg({ className, onMapDataLoaded }: PortugalMapSvgProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && onMapDataLoaded) {
      // Extract path strings from the SVG
      const pathElements = svgRef.current.querySelectorAll('path');
      const pathStrings = Array.from(pathElements).map(path => path.getAttribute('d') || '');
      
      onMapDataLoaded({
        svgElement: svgRef.current,
        pathStrings
      });
    }
  }, [onMapDataLoaded]);

  return (
    <svg
      ref={svgRef}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12969 26674"
      width="12969"
      height="26674"
    >
      {/* Simplified Portugal map with districts */}
      <path d="M6500 2000 L8000 3500 L9000 5000 L9500 7000 L9000 9000 L8000 11000 L7000 13000 L6000 15000 L5500 17000 L5000 19000 L4500 21000 L4000 23000 L3500 24000 L3000 24500 L2500 24000 L2000 23000 L1500 21000 L1000 19000 L1500 17000 L2000 15000 L3000 13000 L4000 11000 L5000 9000 L5500 7000 L6000 5000 L6500 2000 Z" fill="none" stroke="black" />
      
      {/* Viana do Castelo */}
      <path d="M3000 3000 L4000 3500 L4500 4500 L4000 5500 L3000 5000 L2500 4000 L3000 3000 Z" fill="none" stroke="black" />
      
      {/* Braga */}
      <path d="M4000 3500 L5000 4000 L5500 5000 L5000 6000 L4500 4500 L4000 3500 Z" fill="none" stroke="black" />
      
      {/* Porto */}
      <path d="M4000 5500 L5000 6000 L5500 7000 L5000 8000 L4000 7500 L3500 6500 L4000 5500 Z" fill="none" stroke="black" />
      
      {/* Vila Real */}
      <path d="M5000 4000 L6000 4500 L6500 5500 L6000 6500 L5500 5000 L5000 4000 Z" fill="none" stroke="black" />
      
      {/* Bragança */}
      <path d="M6000 4500 L7000 5000 L7500 6000 L7000 7000 L6500 5500 L6000 4500 Z" fill="none" stroke="black" />
      
      {/* Aveiro */}
      <path d="M3500 6500 L4000 7500 L4500 8500 L4000 9500 L3000 9000 L2500 8000 L3500 6500 Z" fill="none" stroke="black" />
      
      {/* Viseu */}
      <path d="M5000 8000 L6000 8500 L6500 9500 L6000 10500 L5000 10000 L4500 8500 L5000 8000 Z" fill="none" stroke="black" />
      
      {/* Guarda */}
      <path d="M6000 6500 L7000 7000 L7500 8000 L7000 9000 L6500 9500 L6000 8500 L6000 6500 Z" fill="none" stroke="black" />
      
      {/* Coimbra */}
      <path d="M4000 9500 L5000 10000 L5500 11000 L5000 12000 L4000 11500 L3500 10500 L4000 9500 Z" fill="none" stroke="black" />
      
      {/* Castelo Branco */}
      <path d="M6000 10500 L7000 11000 L7500 12000 L7000 13000 L6000 12500 L5500 11000 L6000 10500 Z" fill="none" stroke="black" />
      
      {/* Leiria */}
      <path d="M3500 10500 L4000 11500 L4500 12500 L4000 13500 L3000 13000 L2500 12000 L3500 10500 Z" fill="none" stroke="black" />
      
      {/* Santarém */}
      <path d="M4000 13500 L5000 14000 L5500 15000 L5000 16000 L4000 15500 L3500 14500 L4000 13500 Z" fill="none" stroke="black" />
      
      {/* Portalegre */}
      <path d="M5000 12000 L6000 12500 L6500 13500 L6000 14500 L5500 15000 L5000 14000 L5000 12000 Z" fill="none" stroke="black" />
      
      {/* Lisboa */}
      <path d="M3000 13000 L4000 13500 L3500 14500 L2500 14000 L2000 13000 L3000 13000 Z" fill="none" stroke="black" />
      
      {/* Setúbal */}
      <path d="M3500 14500 L4000 15500 L3500 16500 L2500 16000 L2000 15000 L2500 14000 L3500 14500 Z" fill="none" stroke="black" />
      
      {/* Évora */}
      <path d="M4000 15500 L5000 16000 L5500 17000 L5000 18000 L4000 17500 L3500 16500 L4000 15500 Z" fill="none" stroke="black" />
      
      {/* Beja */}
      <path d="M4000 17500 L5000 18000 L5500 19000 L5000 20000 L4000 19500 L3500 18500 L4000 17500 Z" fill="none" stroke="black" />
      
      {/* Faro */}
      <path d="M3500 18500 L4000 19500 L4500 20500 L4000 21500 L3000 21000 L2500 20000 L3500 18500 Z" fill="none" stroke="black" />
      
      {/* Madeira */}
      <path d="M9000 22000 L9500 22500 L9000 23000 L8500 22500 L9000 22000 Z" fill="none" stroke="black" />
      
      {/* Azores */}
      <path d="M2000 1000 L2500 1500 L2000 2000 L1500 1500 L2000 1000 Z" fill="none" stroke="black" />
      <path d="M3000 1000 L3500 1500 L3000 2000 L2500 1500 L3000 1000 Z" fill="none" stroke="black" />
      <path d="M4000 1000 L4500 1500 L4000 2000 L3500 1500 L4000 1000 Z" fill="none" stroke="black" />
    </svg>
  );
}