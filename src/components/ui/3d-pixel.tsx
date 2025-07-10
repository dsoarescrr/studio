'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useSettingsStore } from '@/lib/store';

interface Pixel3DProps {
  color: string;
  size?: number;
  autoRotate?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

function PixelMesh({ 
  color, 
  size = 1, 
  autoRotate = true, 
  interactive = true,
  onClick 
}: Omit<Pixel3DProps, 'className'>) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Convert hex color to RGB for Three.js
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 1, b: 1 };
  };

  const rgb = hexToRgb(color);

  // Spring animation for hover and click effects
  const { scale, rotation } = useSpring({
    scale: hovered ? [1.2, 1.2, 1.2] : [1, 1, 1],
    rotation: clicked ? [0, Math.PI, 0] : [0, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 }
  });

  // Auto-rotation animation
  useFrame((_, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      scale={scale}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        setClicked(!clicked);
        onClick?.();
      }}
      onPointerOver={() => interactive && setHovered(true)}
      onPointerOut={() => interactive && setHovered(false)}
    >
      <Box args={[size, size, size]}>
        <animated.meshStandardMaterial 
          color={`rgb(${rgb.r * 255}, ${rgb.g * 255}, ${rgb.b * 255})`} 
          metalness={0.5}
          roughness={0.2}
          emissive={hovered ? `rgb(${rgb.r * 255 * 0.5}, ${rgb.g * 255 * 0.5}, ${rgb.b * 255 * 0.5})` : 'black'}
        />
      </Box>
    </animated.mesh>
  );
}

export function Pixel3D({ 
  color, 
  size = 1, 
  autoRotate = true, 
  interactive = true,
  onClick,
  className 
}: Pixel3DProps) {
  const { highQualityRendering } = useSettingsStore();

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        dpr={highQualityRendering ? [1, 2] : [1, 1]}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <PixelMesh 
          color={color} 
          size={size} 
          autoRotate={autoRotate} 
          interactive={interactive}
          onClick={onClick}
        />
        
        {interactive && <OrbitControls enableZoom={false} />}
      </Canvas>
    </div>
  );
}