import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState } from 'react';
import type { Mesh, Group } from 'three';
import HeroSceneLoader from './HeroSceneLoader';

interface ScrollProps {
  scrollProgress: number;
}

const FloatingCrystal = ({ position, scale = 1, speed = 1, scrollProgress }: { position: [number, number, number]; scale?: number; speed?: number; scrollProgress: number }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Base rotation + scroll-based rotation
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5 * speed + scrollProgress * Math.PI * 2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed + scrollProgress * Math.PI;
      
      // Scroll-based position offset
      meshRef.current.position.y = position[1] + Math.sin(scrollProgress * Math.PI) * 2;
      meshRef.current.position.z = position[2] - scrollProgress * 3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color="#9333ea"
          attach="material"
          distort={0.3 + scrollProgress * 0.2}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

const GlowingSphere = ({ position, color = "#7c3aed", scrollProgress }: { position: [number, number, number]; color?: string; scrollProgress: number }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating + scroll-based movement
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.3 - scrollProgress * 2;
      meshRef.current.position.x = position[0] + Math.sin(scrollProgress * Math.PI * 2) * 1.5;
      
      // Scale based on scroll
      const scaleValue = 1 + scrollProgress * 0.5;
      meshRef.current.scale.setScalar(scaleValue);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5 + scrollProgress * 0.5}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
};

const TorusKnot = ({ scrollProgress }: ScrollProps) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Enhanced rotation with scroll
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 + scrollProgress * Math.PI * 3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 + scrollProgress * Math.PI * 2;
      meshRef.current.rotation.z = scrollProgress * Math.PI;
    }
    if (groupRef.current) {
      // Move entire group based on scroll
      groupRef.current.position.y = scrollProgress * -4;
      groupRef.current.position.z = -2 - scrollProgress * 5;
      
      // Scale down as user scrolls
      const scaleValue = 1.5 - scrollProgress * 0.5;
      groupRef.current.scale.setScalar(Math.max(0.5, scaleValue));
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <torusKnotGeometry args={[1, 0.3, 128, 16]} />
          <MeshDistortMaterial
            color="#6b21a8"
            attach="material"
            distort={0.2 + scrollProgress * 0.3}
            speed={3}
            roughness={0.1}
            metalness={0.9}
            emissive="#4c1d95"
            emissiveIntensity={0.3 + scrollProgress * 0.4}
          />
        </mesh>
      </Float>
    </group>
  );
};

const SceneContent = ({ scrollProgress }: ScrollProps) => {
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
        intensity={1 + scrollProgress}
        color="#a855f7"
      />

      {/* Stars background - rotate based on scroll */}
      <group rotation={[0, scrollProgress * Math.PI * 0.5, 0]}>
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={1 + scrollProgress * 2}
        />
      </group>

      {/* Sparkles */}
      <Sparkles
        count={100}
        scale={10 + scrollProgress * 5}
        size={3 + scrollProgress * 2}
        speed={0.3 + scrollProgress}
        color="#a855f7"
      />

      {/* Central torus knot */}
      <TorusKnot scrollProgress={scrollProgress} />

      {/* Floating crystals */}
      <FloatingCrystal position={[-3, 1, -1]} scale={0.6} speed={1.2} scrollProgress={scrollProgress} />
      <FloatingCrystal position={[3, -1, -1]} scale={0.5} speed={0.8} scrollProgress={scrollProgress} />
      <FloatingCrystal position={[-2, -2, 0]} scale={0.4} speed={1.5} scrollProgress={scrollProgress} />
      <FloatingCrystal position={[2.5, 2, -2]} scale={0.7} speed={0.9} scrollProgress={scrollProgress} />

      {/* Glowing spheres */}
      <GlowingSphere position={[-4, 0, -3]} color="#9333ea" scrollProgress={scrollProgress} />
      <GlowingSphere position={[4, 1, -2]} color="#7c3aed" scrollProgress={scrollProgress} />
      <GlowingSphere position={[0, -3, -1]} color="#a855f7" scrollProgress={scrollProgress} />
    </>
  );
};

const HeroScene = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress (0 to 1) based on viewport height
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 1.5; // Animate over 1.5 viewport heights
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Suspense fallback={<HeroSceneLoader />}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 75 }}
          style={{ background: 'transparent' }}
        >
          <SceneContent scrollProgress={scrollProgress} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default HeroScene;
