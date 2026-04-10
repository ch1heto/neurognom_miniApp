import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { EffectComposer, Outline, Select, Selection } from "@react-three/postprocessing";
import { useControls } from "leva";

const SHELF_MODEL_PATH = "/models/polka2.glb";
const FARM_SCALE = 0.05;
const FREE_CAMERA_TUNING = true;
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

function FarmPipes() {
  const { posX, posY, posZ, pipeScale, curveHeight, curveWidth, nozzleLength, trayGap } = useControls("Геометрия Труб", {
    posX: { value: 33.5, min: -100, max: 100, step: 0.5 },
    posY: { value: 0, min: -100, max: 100, step: 0.5 },
    posZ: { value: 8.5, min: -100, max: 100, step: 0.5 },
    pipeScale: { value: 1, min: 0.5, max: 2, step: 0.01 },
    curveHeight: { value: 12, min: 2, max: 30, step: 0.5 },
    curveWidth: { value: 18, min: 4, max: 40, step: 0.5 },
    nozzleLength: { value: 14, min: 2, max: 40, step: 0.5 },
    trayGap: { value: 19.3, min: 5, max: 40, step: 0.1 },
  });

  const pvcMaterial = <meshStandardMaterial color="#9ca3af" roughness={0.7} metalness={0.06} />;

  const mainRadius = 1.0;
  const nozzleRadius = 0.28;
  const collarRadius = 1.22;
  const collarLength = 3.2;
  const nozzleBaseY = -18;
  const nozzleDirection = -1;

  const nozzleYs = useMemo(
    () => Array.from({ length: 4 }, (_, index) => nozzleBaseY + index * trayGap),
    [trayGap]
  );

  const verticalBottom = nozzleYs[0] - 16;
  const verticalTop = nozzleYs[3] + 10;

  const curvePoints = useMemo(
    () => [
      new THREE.Vector3(0, verticalBottom, 0),
      new THREE.Vector3(0, verticalTop - curveHeight * 0.45, 0),
      new THREE.Vector3(0, verticalTop, 0),
      new THREE.Vector3(curveWidth * 0.3, verticalTop + curveHeight * 0.65, 0),
      new THREE.Vector3(curveWidth, verticalTop + curveHeight * 0.2, 0),
    ],
    [verticalBottom, verticalTop, curveHeight, curveWidth]
  );

  const manifoldCurve = useMemo(
    () => new THREE.CatmullRomCurve3(curvePoints),
    [curvePoints]
  );

  const tipPoint = curvePoints[curvePoints.length - 1];
  const bottomCollarY = verticalBottom + collarLength * 0.5;
  const topCollarX = tipPoint.x - collarLength * 0.5;

  return (
    <group name="curved-manifold-pipe" position={[posX, posY, posZ]} scale={pipeScale}>
      <mesh>
        <tubeGeometry args={[manifoldCurve, 96, mainRadius, 32, false]} />
        {pvcMaterial}
      </mesh>

      <mesh position={[0, bottomCollarY, 0]}>
        <cylinderGeometry args={[collarRadius, collarRadius, collarLength, 32]} />
        {pvcMaterial}
      </mesh>

      <mesh position={[topCollarX, tipPoint.y, tipPoint.z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[collarRadius, collarRadius, collarLength, 32]} />
        {pvcMaterial}
      </mesh>

      {nozzleYs.map((y, index) => (
        <mesh
          key={index}
          position={[nozzleDirection * (mainRadius + nozzleLength / 2), y, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[nozzleRadius, nozzleRadius, nozzleLength, 24]} />
          {pvcMaterial}
        </mesh>
      ))}
    </group>
  );
}
function ImportedPipe() {
  const { scene, nodes, materials } = useGLTF("/models/pipe_model.glb");

  useLayoutEffect(() => {
    ["Torus", "Cylinder014", "Torus002", "Cylinder019", "Cylinder018_1"].forEach((name) => {
      if (nodes?.[name]) {
        nodes[name].visible = false;
      }
    });
  }, [nodes]);

  const { pX, pY, pZ, scaleX, scaleY, scaleZ, rotX, rotY, rotZ } = useControls("Тест 3D Трубы", {
    pX: { value: 0, min: -5000, max: 5000, step: 0.1 },
    pY: { value: 0, min: -5000, max: 5000, step: 0.1 },
    pZ: { value: 0, min: -5000, max: 5000, step: 0.1 },
    scaleX: { value: 100, min: 1, max: 2000, step: 0.1 },
    scaleY: { value: 100, min: 1, max: 2000, step: 0.1 },
    scaleZ: { value: 100, min: 1, max: 2000, step: 0.1 },
    rotX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.05 },
    rotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.05 },
    rotZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.05 },
  });

  const { tapX, tapY, tapZ, tapScale, trayGap } = useControls("Краники (Клоны)", {
    tapX: { value: 0, min: -500, max: 500, step: 0.1 },
    tapY: { value: 0, min: -500, max: 500, step: 0.1 },
    tapZ: { value: 0, min: -500, max: 500, step: 0.1 },
    tapScale: { value: 100, min: 1, max: 2000, step: 0.1 },
    trayGap: { value: 20, min: 5, max: 100, step: 0.1 },
  });

  const tapYs = [tapY, tapY - trayGap, tapY - trayGap * 2, tapY - trayGap * 3];
  const tapGeometry = nodes?.Cylinder011?.geometry;
  const fallbackMaterial = nodes?.Cylinder011?.material ?? Object.values(materials ?? {})[0];

  return (
    <group>
      <primitive
        object={scene}
        position={[pX, pY, pZ]}
        scale={[scaleX, scaleY, scaleZ]}
        rotation={[rotX, rotY, rotZ]}
      />

      {tapGeometry && tapYs.map((currentY, index) => (
        <mesh
          key={`tap-${index}`}
          geometry={nodes.Cylinder011.geometry}
          material={fallbackMaterial}
          position={[tapX, currentY, tapZ]}
          scale={[tapScale, tapScale, tapScale]}
        />
      ))}
    </group>
  );
}
export default function FarmScene() {
  const [isFocused, setIsFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [12, 6, 12], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#0b1120"]} />

        <ambientLight intensity={1.2} color="white" />
        <directionalLight intensity={1.5} position={[10, 10, 10]} color="white" />

        {FREE_CAMERA_TUNING ? (
          <OrbitControls
            makeDefault
            enablePan
            enableRotate
            enableZoom
            minDistance={4}
            maxDistance={40}
            target={[0, 1.5, 0]}
          />
        ) : (
          <CameraController isFocused={isFocused} />
        )}

        <Selection>
          <EffectComposer autoClear={false}>
            <Outline
              blur
              visibleEdgeColor="#6ee7b7"
              hiddenEdgeColor="#6ee7b7"
              edgeStrength={15}
              edgeThickness={2}
            />
          </EffectComposer>

          <Select enabled={hovered && !isFocused}>
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
          </Select>
        </Selection>
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

      child.castShadow = false;
      child.receiveShadow = false;
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
        <group scale={0.05}>
          <primitive
            object={scene}
            dispose={null}
            onPointerDown={(e) => {
              e.stopPropagation();
              console.log("Clicked part:", e.object.name);
            }}
          />
          {/* <FarmPipes /> */}
          <ImportedPipe />
        </group>
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

useGLTF.preload("/models/pipe_model.glb");

