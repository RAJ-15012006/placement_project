import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCubes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.15;
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Interactive ERP Core Node */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[1.6, 0]} />
          <MeshWobbleMaterial
            color="#0284c7"
            factor={0.4}
            speed={2}
            wireframe
            emissive="#0369a1"
            emissiveIntensity={0.6}
          />
        </mesh>
      </Float>

      {/* Inner Glowing Crystal */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.8}
          emissive="#0284c7"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Satellite Node 1 - Warehouse Stock */}
      <Float speed={3} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[-3, 1.2, -1]}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.6} />
        </mesh>
      </Float>

      {/* Satellite Node 2 - Sales CRM */}
      <Float speed={2.5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[3, -1, -0.5]}>
          <torusGeometry args={[0.7, 0.25, 16, 32]} />
          <meshStandardMaterial color="#818cf8" roughness={0.1} metalness={0.7} />
        </mesh>
      </Float>

      {/* Satellite Node 3 - Accounts & Finance */}
      <Float speed={3.5} rotationIntensity={1.8} floatIntensity={2.2}>
        <mesh position={[-2.5, -1.5, 0.5]}>
          <dodecahedronGeometry args={[0.6]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

export const Hero3DCanvas: React.FC = () => {
  return (
    <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden glass-panel relative border border-cyan-500/20 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent z-10 p-6 flex flex-col justify-center pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold w-fit mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          REAL-TIME 3D ENTERPRISE ENGINE
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Next-Gen Operations Portal
        </h2>
        <p className="text-gray-400 text-xs md:text-sm max-w-md mt-1">
          Automated CRM follow-ups, real-time inventory movement, & atomic sales challan processing.
        </p>
      </div>

      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950"
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#38bdf8" />
        <FloatingCubes />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
      </Canvas>
    </div>
  );
};
