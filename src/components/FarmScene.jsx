import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";

const SHELF_MODEL_PATH = "/models/polka2.glb";
const FARM_SCALE = 0.05;
const TRAY_MESH_NAMES = [
  "Cylinder035",
  "Cylinder043",
  "Cylinder040",
  "Cylinder037",
  "Cylinder026",
  "Cylinder029",
  "Cylinder032",
  "Cylinder024",
];

export default function FarmScene() {
  const [isFocused, setIsFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [10.5, 6.8, 13.5], fov: 45 }} shadows dpr={[1, 2]}>
        <color attach="background" args={["#0b1120"]} />

        <ambientLight intensity={0.5} color="#dbe3ea" />
        <directionalLight
          castShadow
          intensity={1.85}
          position={[9, 14, 8]}
          color="#f8fafc"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={40}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-normalBias={0.03}
        />
        <directionalLight
          intensity={0.45}
          position={[-7, 6, -9]}
          color="#cbd5e1"
        />

        <CameraController isFocused={isFocused} />

        <group
          onClick={() => setIsFocused(!isFocused)}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
        >
          <Suspense fallback={null}>
            <HydroponicShelf isFocused={isFocused} hovered={hovered} />
          </Suspense>
        </group>

        <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[36, 36]} />
          <shadowMaterial opacity={0.24} transparent />
        </mesh>
      </Canvas>
    </div>
  );
}

function HydroponicShelf({ isFocused, hovered }) {
  const { scene } = useGLTF(SHELF_MODEL_PATH);
  const shelfRef = useRef(null);

  useEffect(() => {
    document.body.style.cursor = hovered && !isFocused ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, isFocused]);

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh || !child.material) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
      child.material = child.material.clone();

      if (TRAY_MESH_NAMES.includes(child.name)) {
        child.material.color.set("#9ca3af");
        child.material.roughness = 0.86;
        child.material.metalness = 0.12;
      } else {
        if ("roughness" in child.material) {
          child.material.roughness = Math.min(child.material.roughness ?? 0.82, 0.82);
        }

        if ("metalness" in child.material) {
          child.material.metalness = Math.max(child.material.metalness ?? 0.08, 0.08);
        }
      }

      if ("emissive" in child.material) {
        child.material.emissive.set("#000000");
        child.material.emissiveIntensity = 0;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!shelfRef.current) return;

    if (!isFocused) {
      shelfRef.current.rotation.y += delta * 0.05;
    } else {
      const currentY = shelfRef.current.rotation.y;
      const n = Math.round((currentY - Math.PI / 2) / Math.PI);
      const targetY = n * Math.PI + Math.PI / 2;

      shelfRef.current.rotation.y = THREE.MathUtils.lerp(currentY, targetY, 0.08);
    }

    const isHoverActive = hovered && !isFocused;
    const targetScale = isHoverActive ? 1.012 : 1;
    const targetOffsetY = isHoverActive
      ? Math.sin(state.clock.elapsedTime * 0.9) * 0.01
      : 0;

    shelfRef.current.scale.x = THREE.MathUtils.lerp(
      shelfRef.current.scale.x,
      targetScale,
      delta * 3
    );
    shelfRef.current.scale.y = THREE.MathUtils.lerp(
      shelfRef.current.scale.y,
      targetScale,
      delta * 3
    );
    shelfRef.current.scale.z = THREE.MathUtils.lerp(
      shelfRef.current.scale.z,
      targetScale,
      delta * 3
    );
    shelfRef.current.position.y = THREE.MathUtils.lerp(
      shelfRef.current.position.y,
      targetOffsetY,
      delta * 2.2
    );
  });

  return (
    <group ref={shelfRef}>
      <Center position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <primitive
          object={scene}
          dispose={null}
          scale={FARM_SCALE}
          onPointerDown={(e) => {
            e.stopPropagation();
            console.log("Clicked part:", e.object.name);
          }}
        />
      </Center>
    </group>
  );
}

function CameraController({ isFocused }) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const lookAtPos = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);

  useFrame((state) => {
    if (isFocused) {
      targetPos.set(0, 5, 15);
    } else {
      targetPos.set(10.5, 6.8, 13.5);
    }

    state.camera.position.lerp(targetPos, 0.05);
    state.camera.lookAt(lookAtPos);
  });

  return null;
}

useGLTF.preload(SHELF_MODEL_PATH);
