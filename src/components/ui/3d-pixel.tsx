'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';
import { useSettingsStore } from '@/lib/store';
import * as THREE from 'three';

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
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Auto-rotation and interactive animation logic
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Auto-rotation
    if (autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }

    // Smooth hover effect
    const targetScale = hovered ? 1.2 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });
  
  const emissiveColor = hovered ? new THREE.Color(color).multiplyScalar(0.5) : new THREE.Color('black');

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        if (interactive) {
          setClicked(!clicked);
          onClick?.();
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (interactive) setHovered(true);
      }}
      onPointerOut={() => {
        if (interactive) setHovered(false);
      }}
    >
      <Box args={[size, size, size]}>
        <meshStandardMaterial 
          color={color} 
          metalness={0.5}
          roughness={0.2}
          emissive={emissiveColor}
        />
      </Box>
    </mesh>
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
