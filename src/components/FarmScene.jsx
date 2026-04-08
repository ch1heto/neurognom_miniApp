import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";

const SLOT_POSITIONS = [
  [-1, 1, 0],
  [0, 1, 0],
  [1, 1, 0]
];

const SHELF_MODEL_PATH = "/models/polka2.glb";

export default function FarmScene({ plantedSlotIds, onPlant }) {
  const groupRef = useRef(null);

  const handleFarmClick = (event) => {
    event.stopPropagation();
    console.log("Farm clicked! Ready for zoom transition.");
  };

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 8, 25], fov: 45 }} shadows dpr={[1, 2]}>
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

        <OrbitControls
          makeDefault
          target={[0, 2, 0]}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />

        <ShowcaseRotation groupRef={groupRef} />

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]}>
          <circleGeometry args={[7, 64]} />
          <meshStandardMaterial color="#d6dce3" />
        </mesh>

        <group ref={groupRef} onClick={handleFarmClick}>
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
        </group>
      </Canvas>
    </div>
  );
}

function ShowcaseRotation({ groupRef }) {
  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += delta * 0.1;
  });

  return null;
}

function HydroponicShelf() {
  const { scene } = useGLTF(SHELF_MODEL_PATH);

  return (
    <Center position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
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
        onPointerDown={handleClick}
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

useGLTF.preload(SHELF_MODEL_PATH);
