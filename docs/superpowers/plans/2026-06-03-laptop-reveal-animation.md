# Laptop Reveal Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the wallet fold prototype with a scroll-driven laptop-opening animation — a closed laptop seen from table level at the hinge, lid rotating 0°→90° as the user scrolls.

**Architecture:** Single R3F component `LaptopRig` replaces `WalletRig` in the existing file. A pivot `<group>` at the back-top edge of the base acts as the hinge; the lid is a child offset so its rear edge sits on that pivot. Progress drives `rotation.x` on the hinge group via `useFrame`. Camera is repositioned behind the hinge at table level. All wallet-specific code is removed.

**Tech Stack:** React Three Fiber, Three.js, GSAP ScrollTrigger (existing), TypeScript, Vite

---

### Task 1: Strip wallet-specific code and scaffold LaptopRig

**Files:**
- Modify: `prototypes/wallet-reveal-test/src/WalletRevealTest.tsx`

- [ ] **Step 1: Remove wallet-only imports and helpers**

  Delete the following from the top of the file (keep React, Canvas, useFrame, OrbitControls, Environment, THREE, gsap, ScrollTrigger, and the type `WalletRigProps`):
  - `Line` import from `@react-three/drei`
  - `createPlaceholderTexture` function (lines ~24–90)
  - `smoothstep` function

- [ ] **Step 2: Rename the rig props type**

  Rename `WalletRigProps` → `LaptopRigProps`. It keeps the same shape:
  ```ts
  type LaptopRigProps = {
    progressRef: React.MutableRefObject<number>;
    onAngleDeg?: (deg: number) => void;
  };
  ```

- [ ] **Step 3: Replace WalletRig with LaptopRig**

  Delete the entire `WalletRig` function and replace with:

  ```tsx
  // Laptop dimensions (meters — scene scale)
  const BASE_W = 2.2;
  const BASE_H = 0.07;  // thickness of base slab
  const BASE_D = 1.5;
  const LID_H  = 0.05;  // thickness of lid slab

  function LaptopRig({ progressRef, onAngleDeg }: LaptopRigProps) {
    const hingeGroupRef = useRef<THREE.Group>(null);

    useFrame(() => {
      const progress = Math.min(1, Math.max(0, progressRef.current));

      // 0 = closed (lid flat), -PI/2 = open 90° (lid upright)
      const rotX = -progress * (Math.PI / 2);

      if (hingeGroupRef.current) {
        hingeGroupRef.current.rotation.x = rotX;
      }

      if (onAngleDeg) {
        onAngleDeg(Math.abs((rotX * 180) / Math.PI));
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
  ```

- [ ] **Step 4: Update the Canvas camera**

  In `WalletRevealTest`, find the `<Canvas>` element and update the `camera` prop:
  ```tsx
  // Before:
  camera={{ position: [0, 2.2, 5.2], fov: 42, near: 0.1, far: 50 }}

  // After:
  camera={{ position: [0, 0.05, -2.2], fov: 46, near: 0.01, far: 50 }}
  ```

  Then add a `lookAt` for the camera. R3F's `camera` prop doesn't accept `lookAt` directly — use the `onCreated` callback on Canvas:
  ```tsx
  onCreated={({ camera }) => camera.lookAt(0, 0.4, 0)}
  ```

- [ ] **Step 5: Update the WalletRig JSX reference in WalletRevealTest**

  Inside the `Canvas`, rename `<WalletRig` → `<LaptopRig` and keep `progressRef` and `onAngleDeg` props unchanged.

- [ ] **Step 6: Update the hint text**

  Replace the hint `<div>` content:
  ```tsx
  // Before:
  Scroll to drive the fold. The <code>red line</code> is the hinge axis...

  // After:
  Scroll to open the lid. Camera is at table level, hinge side.
  ```

- [ ] **Step 7: Update the HUD label**

  The HUD currently says `Fold angle` — change to `Lid angle`:
  ```tsx
  // Before:
  <strong>Fold angle</strong>

  // After:
  <strong>Lid angle</strong>
  ```

- [ ] **Step 8: Verify the dev server compiles without errors**

  The Vite dev server is already running on http://localhost:3001. Check the terminal for any TypeScript/compile errors. Fix any that appear (likely: unused imports left over from the wallet code — remove them).

- [ ] **Step 9: Visual check in browser**

  Open http://localhost:3001 and scroll through:
  - At scroll=0: a flat closed slab visible from behind at table level
  - As you scroll: the lid rotates up, back face of lid sweeps toward vertical
  - At scroll=1: lid is upright at 90°, HUD reads ~90°

- [ ] **Step 10: Commit**

  ```bash
  git add prototypes/wallet-reveal-test/src/WalletRevealTest.tsx
  git commit -m "feat(prototype): replace wallet fold with scroll-driven laptop lid open"
  ```
