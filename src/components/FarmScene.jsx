import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";

const SHELF_MODEL_PATH = "/models/polka2.glb";

export default function FarmScene() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [12, 6, 12], fov: 45 }} shadows dpr={[1, 2]}>
        <color attach="background" args={["#eef2f6"]} />

        <ambientLight intensity={1.5} color="white" />
        <directionalLight
          castShadow
          intensity={2}
          position={[10, 10, 10]}
          color="white"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <gridHelper args={[20, 20]} />
        <axesHelper args={[5]} />

        <CameraController isFocused={isFocused} />

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]}>
          <circleGeometry args={[7, 64]} />
          <meshStandardMaterial color="#d6dce3" />
        </mesh>

        <group onClick={() => setIsFocused(!isFocused)}>
          <Suspense fallback={null}>
            <HydroponicShelf isFocused={isFocused} />
          </Suspense>
        </group>
      </Canvas>
    </div>
  );
}

function HydroponicShelf({ isFocused }) {
  const { scene } = useGLTF(SHELF_MODEL_PATH);
  const shelfRef = useRef(null);

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
  });

  return (
    <group ref={shelfRef}>
      <Center position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <primitive object={scene} dispose={null} scale={0.05} />
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
