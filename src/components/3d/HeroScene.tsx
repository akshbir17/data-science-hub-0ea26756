import { Canvas } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const FloatingCrystal = ({ position, scale = 1, speed = 1 }: { position: [number, number, number]; scale?: number; speed?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color="#9333ea"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

const GlowingSphere = ({ position, color = "#7c3aed" }: { position: [number, number, number]; color?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
};

const TorusKnot = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, -2]} scale={1.5}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <MeshDistortMaterial
          color="#6b21a8"
          attach="material"
          distort={0.2}
          speed={3}
          roughness={0.1}
          metalness={0.9}
          emissive="#4c1d95"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
};

const SceneContent = () => {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#9333ea" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7c3aed" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#a855f7"
      />

      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Sparkles */}
      <Sparkles
        count={100}
        scale={10}
        size={3}
        speed={0.3}
        color="#a855f7"
      />

      {/* Central torus knot */}
      <TorusKnot />

      {/* Floating crystals */}
      <FloatingCrystal position={[-3, 1, -1]} scale={0.6} speed={1.2} />
      <FloatingCrystal position={[3, -1, -1]} scale={0.5} speed={0.8} />
      <FloatingCrystal position={[-2, -2, 0]} scale={0.4} speed={1.5} />
      <FloatingCrystal position={[2.5, 2, -2]} scale={0.7} speed={0.9} />

      {/* Glowing spheres */}
      <GlowingSphere position={[-4, 0, -3]} color="#9333ea" />
      <GlowingSphere position={[4, 1, -2]} color="#7c3aed" />
      <GlowingSphere position={[0, -3, -1]} color="#a855f7" />
    </>
  );
};

const HeroScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroScene;
