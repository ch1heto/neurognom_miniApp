import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x09130d);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.5, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.minDistance = 1.5;
controls.maxDistance = 12;

scene.add(new THREE.AmbientLight(0xffffff, 1.6));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(4, 6, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xb7ffd3, 1.1);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const plantedSeeds = new THREE.Group();
scene.add(plantedSeeds);

let farmModel = null;

const loader = new GLTFLoader();
loader.load(
  "models/polka2.glb",
  (gltf) => {
    farmModel = gltf.scene;

    const bounds = new THREE.Box3().setFromObject(farmModel);
    const center = bounds.getCenter(new THREE.Vector3());
    farmModel.position.sub(center);

    scene.add(farmModel);
    controls.update();
  },
  undefined,
  (error) => {
    console.log("Model not found at models/polka2.glb. Add the file to continue.", error);
  }
);

function plantSeed(point) {
  const seed = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x4cff5f })
  );

  seed.position.copy(point);
  plantedSeeds.add(seed);
}

function onPointerDown(event) {
  if (!farmModel) {
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Convert the pointer position into a ray projected from the camera.
  raycaster.setFromCamera(pointer, camera);

  // Intersect that ray with every child mesh in the loaded GLB hierarchy.
  const intersections = raycaster.intersectObject(farmModel, true);

  if (intersections.length > 0) {
    plantSeed(intersections[0].point);
  }
}

renderer.domElement.addEventListener("pointerdown", onPointerDown);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
