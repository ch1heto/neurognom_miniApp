import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";

const SHELF_MODEL_PATH = "/models/polka2.glb";
const FARM_SCALE = 0.05;
const OUTLINE_SCALE = FARM_SCALE * 1.006;

export default function FarmScene() {
  const [isFocused, setIsFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [12, 6, 12], fov: 45 }} shadows dpr={[1, 2]}>
        <color attach="background" args={["#1e293b"]} />

        <ambientLight intensity={1.5} color="white" />
        <directionalLight
          castShadow
          intensity={2}
          position={[10, 10, 10]}
          color="white"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
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
      </Canvas>
    </div>
  );
}

function HydroponicShelf({ isFocused, hovered }) {
  const { scene } = useGLTF(SHELF_MODEL_PATH);
  const shelfRef = useRef(null);

  const outlineScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!child.isMesh) {
        return;
      }

      child.material = new THREE.MeshBasicMaterial({
        color: "#34d399",
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        toneMapped: false
      });
      child.renderOrder = -1;
      child.raycast = () => null;
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (["Cylinder035", "Cylinder043", "Cylinder040", "Cylinder037", "Cylinder026", "Cylinder029", "Cylinder032", "Cylinder024"].includes(child.name)) {
          child.material = child.material.clone();
          child.material.color.set("#9ca3af");
          child.material.emissive.set("#000000");
          child.material.roughness = 0.9;
          child.material.metalness = 0.1;
        }
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

    outlineScene.traverse((child) => {
      if (!child.isMesh) {
        return;
      }

      const material = child.material;
      if (!material) {
        return;
      }

      const pulse = 0.22 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
      material.opacity = hovered && !isFocused ? pulse : 0;
    });
  });

  return (
    <group ref={shelfRef}>
      <Center position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {hovered && !isFocused && (
          <primitive object={outlineScene} dispose={null} scale={OUTLINE_SCALE} />
        )}
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
      targetPos.set(12, 6, 12);
    }

    state.camera.position.lerp(targetPos, 0.05);
    state.camera.lookAt(lookAtPos);
  });

  return null;
}

useGLTF.preload(SHELF_MODEL_PATH);
