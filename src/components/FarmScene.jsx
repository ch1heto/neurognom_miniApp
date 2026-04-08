import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import shelfModelUrl from "../../models/polka2.glb?url";

const SLOT_POSITIONS = [
  [-1, 1, 0],
  [0, 1, 0],
  [1, 1, 0]
];

export default function FarmScene({ plantedSlotIds, onPlant }) {
  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [8, 8, 8], fov: 42 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <color attach="background" args={["#09130d"]} />
        <fog attach="fog" args={["#09130d", 12, 28]} />

        <ambientLight intensity={1.6} />
        <directionalLight
          castShadow
          intensity={2.4}
          position={[6, 10, 8]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight intensity={0.8} position={[-6, 5, -4]} color="#b9ffd0" />

        <OrbitControls
          makeDefault
          target={[0, 0.8, 0]}
          enablePan={false}
          minDistance={6}
          maxDistance={18}
          minPolarAngle={0.55}
          maxPolarAngle={Math.PI / 2.05}
        />

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]}>
          <circleGeometry args={[7, 64]} />
          <meshStandardMaterial color="#122d1b" />
        </mesh>

        <Suspense fallback={null}>
          <HydroponicShelf />
        </Suspense>

        {SLOT_POSITIONS.map((position, index) => (
          <PlantingSlot
            key={index}
            index={index}
            position={position}
            isPlanted={plantedSlotIds.includes(index)}
            onPlant={onPlant}
          />
        ))}
      </Canvas>
    </div>
  );
}

function HydroponicShelf() {
  const { scene } = useGLTF(shelfModelUrl);

  return (
    <Center>
      <primitive object={scene} dispose={null} />
    </Center>
  );
}

function PlantingSlot({ index, position, isPlanted, onPlant }) {
  const handleClick = (event) => {
    event.stopPropagation();
    onPlant(index);
  };

  return (
    <group position={position}>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleClick}
      >
        <circleGeometry args={[0.34, 40]} />
        <meshStandardMaterial
          color={isPlanted ? "#507d3d" : "#c8f7c4"}
          emissive={isPlanted ? "#0d150d" : "#12311a"}
          transparent
          opacity={isPlanted ? 0.26 : 0.42}
        />
      </mesh>

      {isPlanted && (
        <mesh castShadow position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.24, 24]} />
          <meshStandardMaterial color="#68462a" />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload(shelfModelUrl);
