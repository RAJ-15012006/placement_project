import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface StockCubeProps {
  stockCount: number;
  minStock: number;
}

function StockBox({ stockCount, minStock }: StockCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isLow = stockCount <= minStock;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const boxColor = isLow ? '#ef4444' : stockCount > 100 ? '#10b981' : '#38bdf8';

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshStandardMaterial
          color={boxColor}
          roughness={0.2}
          metalness={0.6}
          wireframe={false}
        />
      </mesh>
      
      {/* 3D Stock Label */}
      <Text
        position={[0, 0, 1.2]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`${stockCount} UNITS`}
      </Text>
    </group>
  );
}

export const StockCubeViewer: React.FC<StockCubeProps> = ({ stockCount, minStock }) => {
  return (
    <div className="w-full h-36 rounded-xl overflow-hidden glass-panel relative border border-white/10">
      <div className="absolute top-2 left-3 z-10 text-xs font-bold text-gray-400">
        3D STOCK LEVEL VISUALIZER
      </div>
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <StockBox stockCount={stockCount} minStock={minStock} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};
