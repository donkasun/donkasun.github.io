import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type LaptopRigProps = {
  progressRef: React.MutableRefObject<number>;
  onAngleDeg?: (deg: number) => void;
};

// Laptop dimensions (meters — scene scale)
const BASE_W = 2.2;
const BASE_H = 0.07;  // thickness of base slab
const BASE_D = 1.5;
const LID_H  = 0.05;  // thickness of lid slab

function LaptopRig({ progressRef, onAngleDeg }: LaptopRigProps) {
  const hingeGroupRef = useRef<THREE.Group>(null);
  const prevAngleDegRef = useRef(-1);

  useFrame(() => {
    const progress = Math.min(1, Math.max(0, progressRef.current));

    // 0 = closed (lid flat), -PI/2 = open 90° (lid upright)
    const rotX = -progress * (Math.PI / 2);

    if (hingeGroupRef.current) {
      hingeGroupRef.current.rotation.x = rotX;
    }

    const deg = Math.abs((rotX * 180) / Math.PI);
    if (onAngleDeg && Math.abs(deg - prevAngleDegRef.current) > 0.01) {
      prevAngleDegRef.current = deg;
      onAngleDeg(deg);
    }
  });

  // Hinge sits at the back-top edge of the base
  const hingeY = BASE_H;          // top surface of base
  const hingeZ = -BASE_D / 2;     // back edge of base

  return (
    <group>
      {/* Base slab */}
      <mesh position={[0, BASE_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BASE_W, BASE_H, BASE_D]} />
        <meshStandardMaterial color="#1e2130" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Hinge pivot — placed at back-top edge of base */}
      <group ref={hingeGroupRef} position={[0, hingeY, hingeZ]}>
        {/*
          Lid is offset so its back edge aligns with the hinge pivot.
          When rotation.x = 0 the lid lies flat on the base.
          When rotation.x = -PI/2 it stands upright.
          position.z = BASE_D/2 moves the lid's centre forward from the hinge.
          position.y = LID_H/2 lifts it so it sits on top of the base surface.
        */}
        <mesh
          position={[0, LID_H / 2, BASE_D / 2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[BASE_W, LID_H, BASE_D]} />
          <meshStandardMaterial color="#252840" roughness={0.8} metalness={0.15} />
        </mesh>
      </group>
    </group>
  );
}

export function WalletRevealTest() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [angleDeg, setAngleDeg] = useState(0);
  const [progressUI, setProgressUI] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Normalized scroll progress: 0 → 1.
    // We keep this in a ref so the Three render loop can read it without React re-rendering each tick.
    const st = ScrollTrigger.create({
      trigger: scroller,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        setProgressUI((prev) =>
          Math.abs(prev - self.progress) > 0.002 ? self.progress : prev,
        );
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div className="page" ref={scrollerRef}>
      <div className="hud">
        <div>
          <strong>Lid angle</strong>: {angleDeg.toFixed(1)}°
        </div>
        <div>
          <strong>progress</strong>: {progressUI.toFixed(3)}
        </div>
      </div>

      <div className="hint">
        Scroll to open the lid. Camera is at table level, hinge side.
      </div>

      <div className="stickyStage">
        <Canvas
          shadows
          camera={{ position: [0, 0.05, -2.2], fov: 46, near: 0.01, far: 50 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#060914']} />

          <ambientLight intensity={0.55} />
          <directionalLight
            position={[3.2, 5, 2.5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          <LaptopRig
            progressRef={progressRef}
            onAngleDeg={(deg) => {
              // Avoid hammering React state every frame; update only when it meaningfully changes.
              setAngleDeg((prev) => (Math.abs(prev - deg) > 0.15 ? deg : prev));
            }}
          />

          <Environment preset="city" />
          <OrbitControls target={[0, 0.4, 0]} enablePan={false} enableDamping makeDefault />
        </Canvas>
      </div>
    </div>
  );
}
