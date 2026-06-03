import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type LaptopRigProps = {
  progressRef: React.MutableRefObject<number>;
  onAngleDeg?: (deg: number) => void;
};

const CARD_W = 2.2;
const CARD_D = 1.5;


function LaptopRig({ progressRef, onAngleDeg }: LaptopRigProps) {
  const hingeGroupRef = useRef<THREE.Group>(null);
  const prevAngleDegRef = useRef(-1);
  const currentRotXRef = useRef(0);

  const lidTexture = useTexture('/lid.jpeg');
  lidTexture.colorSpace = THREE.SRGBColorSpace;
  // Camera views the back of the lid when it stands up. flipY=false corrects
  // the vertical orientation; mirroring X un-mirrors the back-face view so the
  // image reads upright and the right way round.
  lidTexture.flipY = false;
  lidTexture.wrapS = THREE.RepeatWrapping;
  lidTexture.repeat.x = -1;
  lidTexture.needsUpdate = true;

  useFrame((_, delta) => {
    const progress = Math.min(1, Math.max(0, progressRef.current));

    // 0 = closed (lid flat on base), -PI/2 = open 90° (lid upright)
    const targetRotX = -progress * (Math.PI / 2);

    // Frame-rate-independent exponential damping toward the target angle so
    // the lid eases into place instead of snapping with each scroll tick.
    const smoothing = 8;
    const t = 1 - Math.exp(-smoothing * Math.min(delta, 0.1));
    currentRotXRef.current += (targetRotX - currentRotXRef.current) * t;
    const rotX = currentRotXRef.current;

    if (hingeGroupRef.current) {
      hingeGroupRef.current.rotation.x = rotX;
    }

    const deg = Math.abs((rotX * 180) / Math.PI);
    if (onAngleDeg && Math.abs(deg - prevAngleDegRef.current) > 0.01) {
      prevAngleDegRef.current = deg;
      onAngleDeg(deg);
    }
  });

  return (
    <group>
      {/* Shadow — flat plane beneath the moving lid */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[CARD_W, CARD_D]} />
        <meshStandardMaterial
          color="#8090b0"
          transparent
          opacity={0.28}
          roughness={1}
          metalness={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Hinge pivot at the back edge of the base (y=0, z=-CARD_D/2) */}
      <group ref={hingeGroupRef} position={[0, 0, -CARD_D / 2]}>
        {/*
          Lid card: rotation-x=-PI/2 makes it lie flat in hinge-group local space.
          y=0.001 prevents z-fighting with the base when closed.
          When group rotation.x = -PI/2 the lid stands upright facing the camera.
        */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, CARD_D / 2]}>
          <planeGeometry args={[CARD_W, CARD_D]} />
          <meshStandardMaterial map={lidTexture} roughness={0.8} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export function CardRevealTest() {
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
      scrub: 0.6,
      onUpdate: (self) => {
        // Reach fully-open (progress 1) at 85% of the scroll track and hold it
        // open through the end, so the open state is easy to land on.
        const mapped = Math.min(1, self.progress / 0.85);
        progressRef.current = mapped;
        setProgressUI((prev) =>
          Math.abs(prev - mapped) > 0.002 ? mapped : prev,
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
          camera={{ position: [-1.33, 1.00, -3.00], fov: 46, near: 0.01, far: 50 }}
          onCreated={({ camera }) => camera.lookAt(0, 0.7, -0.4)}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#ffffff']} />

          <ambientLight intensity={0.7} />
          <directionalLight position={[3.2, 5, 2.5]} intensity={1.0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          {/* Fill light from the camera side so the lid face is well lit when open */}
          <directionalLight position={[-1.5, 3, -4]} intensity={0.9} />

          <Suspense fallback={null}>
            <LaptopRig
              progressRef={progressRef}
              onAngleDeg={(deg) => {
                // Avoid hammering React state every frame; update only when it meaningfully changes.
                setAngleDeg((prev) => (Math.abs(prev - deg) > 0.15 ? deg : prev));
              }}
            />
          </Suspense>

          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  );
}
