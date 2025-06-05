import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// GSAP is loaded globally via script tag

console.log("Basic main.js started - trying global GSAP");

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(8, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 15;

// Camera position
camera.position.set(0, 1.5, 6);
controls.target.set(0, 1, 0); // Look slightly above the base
controls.update();

// Fridge components
const fridgeGroup = new THREE.Group();
scene.add(fridgeGroup);

// Fridge materials
const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.1,
  roughness: 0.8,
});
const doorMaterial = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  metalness: 0.3,
  roughness: 0.6,
});
const handleMaterial = new THREE.MeshStandardMaterial({
  color: 0x888888,
  metalness: 0.8,
  roughness: 0.4,
});
// Helix materials
const poleMaterial = new THREE.MeshStandardMaterial({
  color: 0x111111,
  metalness: 0.8,
  roughness: 0.6,
}); // Matte Black Column
const rampMaterial = new THREE.MeshStandardMaterial({
  color: 0x66bb66,
  metalness: 0.1,
  roughness: 0.7,
  transparent: true,
  opacity: 0.8,
  side: THREE.DoubleSide,
}); // Semi-transparent green
const podMaterial = new THREE.MeshStandardMaterial({
  color: 0x444444,
  metalness: 0.2,
  roughness: 0.5,
}); // Dark gray pod sockets
// LED Material
const ledMaterial = new THREE.MeshBasicMaterial({ color: 0xffaaff }); // Pink/purple glow

// Fridge dimensions
const fridgeWidth = 2;
const fridgeHeight = 4;
const fridgeDepth = 1.8;
const doorThickness = 0.15;
const wallThickness = 0.05; // Thickness for the hollow walls

// --- Hollow Fridge Walls (Keep this) ---
const wallBack = new THREE.Mesh(
  new THREE.BoxGeometry(fridgeWidth, fridgeHeight, wallThickness),
  bodyMaterial
);
wallBack.position.set(
  0,
  fridgeHeight / 2,
  -fridgeDepth / 2 + wallThickness / 2
);
wallBack.castShadow = true;
wallBack.receiveShadow = true;
fridgeGroup.add(wallBack);

const wallBottom = new THREE.Mesh(
  new THREE.BoxGeometry(fridgeWidth, wallThickness, fridgeDepth),
  bodyMaterial
);
wallBottom.position.set(0, wallThickness / 2, 0);
wallBottom.castShadow = true;
wallBottom.receiveShadow = true;
fridgeGroup.add(wallBottom);

const wallTop = new THREE.Mesh(
  new THREE.BoxGeometry(fridgeWidth, wallThickness, fridgeDepth),
  bodyMaterial
);
wallTop.position.set(0, fridgeHeight - wallThickness / 2, 0);
wallTop.castShadow = true;
wallTop.receiveShadow = true;
fridgeGroup.add(wallTop);

const wallLeft = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, fridgeHeight, fridgeDepth),
  bodyMaterial
);
wallLeft.position.set(
  -fridgeWidth / 2 + wallThickness / 2,
  fridgeHeight / 2,
  0
);
wallLeft.castShadow = true;
wallLeft.receiveShadow = true;
fridgeGroup.add(wallLeft);

const wallRight = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, fridgeHeight, fridgeDepth),
  bodyMaterial
);
wallRight.position.set(
  fridgeWidth / 2 - wallThickness / 2,
  fridgeHeight / 2,
  0
);
wallRight.castShadow = true;
wallRight.receiveShadow = true;
fridgeGroup.add(wallRight);

// Adjust Door Pivot relative to the new structure
const doorPivot = new THREE.Group();
// Pivot at the front-left edge
doorPivot.position.set(-fridgeWidth / 2, 0, fridgeDepth / 2);
fridgeGroup.add(doorPivot);

// Fridge door - position relative to pivot (origin is now front-left base)
const fridgeDoor = new THREE.Mesh(
  new THREE.BoxGeometry(fridgeWidth, fridgeHeight, doorThickness),
  doorMaterial
);
fridgeDoor.position.set(fridgeWidth / 2, fridgeHeight / 2, -doorThickness / 2); // Centered relative to pivot
fridgeDoor.castShadow = true;
fridgeDoor.receiveShadow = true;
doorPivot.add(fridgeDoor);

// Door handle - position relative to door
const handleHeight = 0.6;
const doorHandle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.04, handleHeight, 16),
  handleMaterial
);
doorHandle.rotation.z = Math.PI / 2;
// Position adjusted for door's local coordinates
doorHandle.position.set(
  (fridgeWidth / 2) * 0.9 - fridgeWidth / 2,
  0,
  doorThickness / 2 + 0.05
);
doorHandle.castShadow = true;
fridgeDoor.add(doorHandle); // Handle added to DOOR

// --- Add Bottom Compartment Shelf ---
const shelfWidth = fridgeWidth - 2 * wallThickness;
const shelfDepth = fridgeDepth - wallThickness; // Only back wall
const baseShelfGeometry = new THREE.BoxGeometry(shelfWidth, 0.05, shelfDepth);
const bottomShelfY = fridgeHeight * 0.2; // Changed from 0.1 to 0.2 (20%)
const bottomShelf = new THREE.Mesh(baseShelfGeometry, bodyMaterial); // Use body material
bottomShelf.position.set(
  0,
  bottomShelfY,
  -fridgeDepth / 2 + wallThickness + shelfDepth / 2
);
bottomShelf.castShadow = true;
bottomShelf.receiveShadow = true;
fridgeGroup.add(bottomShelf);

// --- Add Helix Basin ---
const basinWallThickness = 0.02;
const basinHeight = 0.05;
const basinWidth = shelfWidth * 0.95; // Slightly smaller than shelf
const basinDepth = shelfDepth * 0.95;

// Basin Front Wall
const basinWallFrontGeo = new THREE.BoxGeometry(
  basinWidth,
  basinHeight,
  basinWallThickness
);
const basinWallFront = new THREE.Mesh(basinWallFrontGeo, poleMaterial);
// Position on top of bottomShelf, at its front edge
basinWallFront.position.set(
  0,
  bottomShelfY + 0.05 / 2 + basinHeight / 2, // On top of bottom shelf
  bottomShelf.position.z + shelfDepth / 2 - basinWallThickness / 2
);
basinWallFront.castShadow = true;
fridgeGroup.add(basinWallFront);

// Basin Back Wall
const basinWallBack = new THREE.Mesh(basinWallFrontGeo, poleMaterial); // Reuse geometry
// Position on top of bottomShelf, at its back edge
basinWallBack.position.set(
  0,
  bottomShelfY + 0.05 / 2 + basinHeight / 2, // On top of bottom shelf
  bottomShelf.position.z - shelfDepth / 2 + basinWallThickness / 2
);
basinWallBack.castShadow = true;
fridgeGroup.add(basinWallBack);

// Basin Side Walls Geometry
const basinWallSideGeo = new THREE.BoxGeometry(
  basinWallThickness,
  basinHeight,
  basinDepth
);

// Basin Left Wall
const basinWallLeft = new THREE.Mesh(basinWallSideGeo, poleMaterial);
// Position on top of bottomShelf, at its left edge
basinWallLeft.position.set(
  -basinWidth / 2 + basinWallThickness / 2,
  bottomShelfY + 0.05 / 2 + basinHeight / 2, // On top of bottom shelf
  bottomShelf.position.z
);
basinWallLeft.castShadow = true;
fridgeGroup.add(basinWallLeft);

// Basin Right Wall
const basinWallRight = new THREE.Mesh(basinWallSideGeo, poleMaterial);
// Position on top of bottomShelf, at its right edge
basinWallRight.position.set(
  basinWidth / 2 - basinWallThickness / 2,
  bottomShelfY + 0.05 / 2 + basinHeight / 2, // On top of bottom shelf
  bottomShelf.position.z
);
basinWallRight.castShadow = true;
fridgeGroup.add(basinWallRight);

// --- Add Chilled Drawer Facade ---
const drawerHeight = bottomShelfY; // Height of the lower compartment
const drawerFacade = new THREE.Mesh(
  new THREE.BoxGeometry(shelfWidth, drawerHeight * 0.95, wallThickness), // Slightly shorter, thin facade
  bodyMaterial // White like the body
);
// Position it at the front of the bottom compartment space
drawerFacade.position.set(
  0,
  drawerHeight / 2,
  fridgeDepth / 2 - wallThickness / 2
);
drawerFacade.castShadow = true;
drawerFacade.receiveShadow = true;
fridgeGroup.add(drawerFacade);

// Drawer Handle
const drawerHandle = new THREE.Mesh(
  new THREE.BoxGeometry(
    shelfWidth * 0.4,
    drawerHeight * 0.1,
    wallThickness * 1.5
  ), // Simple bar handle
  handleMaterial
);
drawerHandle.position.set(
  0,
  drawerHeight * 0.8,
  wallThickness / 2 + (wallThickness * 1.5) / 2
); // Position on facade
drawerFacade.add(drawerHandle); // Add handle to facade

// --- Add Top Component Shelf & NEW Fan Models ---
const topShelfY = fridgeHeight * 0.9;
const topShelf = new THREE.Mesh(baseShelfGeometry, bodyMaterial);
topShelf.position.set(
  0,
  topShelfY,
  -fridgeDepth / 2 + wallThickness + shelfDepth / 2
);
topShelf.castShadow = true;
topShelf.receiveShadow = true;
fridgeGroup.add(topShelf);

// New Fan Models (Simple Cylinders)
const fanRadius = shelfWidth * 0.15;
const fanHeight = fridgeHeight * 0.03;
const fanGeometry = new THREE.CylinderGeometry(
  fanRadius,
  fanRadius,
  fanHeight,
  16
);
const fanCenterGeometry = new THREE.CylinderGeometry(
  fanRadius * 0.3,
  fanRadius * 0.3,
  fanHeight * 1.2,
  16
);

const fan1 = new THREE.Group();
const fan1Outer = new THREE.Mesh(fanGeometry, handleMaterial);
const fan1Inner = new THREE.Mesh(fanCenterGeometry, poleMaterial);
fan1.add(fan1Outer);
fan1.add(fan1Inner);
fan1.position.set(
  -shelfWidth * 0.25,
  topShelfY + fanHeight / 2 + 0.01,
  -fridgeDepth / 2 + wallThickness + shelfDepth / 2
);
// fan1.rotation.x = Math.PI / 2; // Remove rotation to point down
fridgeGroup.add(fan1);

const fan2 = fan1.clone(true); // Clone first fan
fan2.position.set(
  shelfWidth * 0.25,
  topShelfY + fanHeight / 2 + 0.01,
  -fridgeDepth / 2 + wallThickness + shelfDepth / 2
);
// No need to set rotation again as it's cloned
fridgeGroup.add(fan2);

// --- Re-add Computer Placeholder ---
const computerPlaceholder = new THREE.Mesh(
  new THREE.BoxGeometry(
    shelfWidth * 0.4,
    fridgeHeight * 0.05,
    shelfDepth * 0.5
  ), // Slightly adjusted size
  poleMaterial // Use pole material
);
// Position on the shelf, maybe slightly behind fans
computerPlaceholder.position.set(
  0,
  topShelfY + (fridgeHeight * 0.05) / 2 + 0.01,
  -fridgeDepth / 2 + wallThickness + shelfDepth / 2 - shelfDepth * 0.2
);
computerPlaceholder.castShadow = true;
fridgeGroup.add(computerPlaceholder);

// --- Helix Farm Components (Adjusted Pod Geometry) ---
const helixGroup = new THREE.Group();
fridgeGroup.add(helixGroup);

const helixRadius = (fridgeWidth / 2) * 0.7;
// Fit helix between the shelves, using updated bottomShelfY
const helixStartY = bottomShelfY + 0.1;
const helixEndY = topShelfY - 0.1;
const helixHeight = helixEndY - helixStartY;

// --- LED Light Strips (MOVED HERE) ---
const ledWidth = 0.03;
const ledHeight = helixHeight;
const ledDepth = 0.03;
const ledGeometry = new THREE.BoxGeometry(ledWidth, ledHeight, ledDepth);

// Calculate inner corner positions
const innerX = fridgeWidth / 2 - wallThickness - ledWidth / 2;
const innerZ = fridgeDepth / 2 - wallThickness - ledDepth / 2;
const outerZ = -fridgeDepth / 2 + wallThickness + ledDepth / 2;

const ledPositions = [
  { x: -innerX, z: innerZ }, // Front Left
  { x: innerX, z: innerZ }, // Front Right
  { x: -innerX, z: outerZ }, // Back Left
  { x: innerX, z: outerZ }, // Back Right
];

ledPositions.forEach((pos) => {
  const ledStrip = new THREE.Mesh(ledGeometry, ledMaterial);
  // Directly use calculated positions relative to fridge center
  ledStrip.position.set(pos.x, helixStartY + helixHeight / 2, pos.z);
  fridgeGroup.add(ledStrip);
});

// Custom Curve for Helix
class HelixCurve extends THREE.Curve {
  constructor(radius = 1, height = 1, turns = 1, startY = 0) {
    super();
    this.radius = radius;
    this.height = height;
    this.turns = turns;
    this.startY = startY;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const angle = 2 * Math.PI * this.turns * t;
    const x = this.radius * Math.cos(angle);
    const y = this.startY + this.height * t;
    const z = this.radius * Math.sin(angle);
    return optionalTarget.set(x, y, z);
  }
}

function createHelixFarm(turns, numPods) {
  // Clear previous helix
  while (helixGroup.children.length > 0) {
    const child = helixGroup.children[0];
    helixGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    // Material is reused, no need to dispose unless unique per object
  }

  // Central Pole (Adjusted height and position based on new helixStartY)
  const poleHeight = helixHeight + 0.1; // Slightly taller than helix span
  const poleRadius = 0.1;
  const poleGeometry = new THREE.CylinderGeometry(
    poleRadius,
    poleRadius,
    poleHeight,
    16
  );
  const centralPole = new THREE.Mesh(poleGeometry, poleMaterial);
  centralPole.position.y = helixStartY + helixHeight / 2; // Center pole in the helix space
  centralPole.castShadow = true;
  centralPole.receiveShadow = true;
  helixGroup.add(centralPole);

  // --- Monitoring Arm (MOVED HERE) ---
  // const armGroup = new THREE.Group(); // Maybe not needed if attaching directly to pole
  const armBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.05, 12),
    handleMaterial
  );
  armBase.position.set(0, helixHeight * 0.3, poleRadius); // Position relative to pole center
  armBase.rotation.x = Math.PI / 2; // Rotate base to sit on side of pole
  centralPole.add(armBase); // Attach arm base to the pole itself

  const armSegment1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.2, 0.02),
    handleMaterial
  );
  armSegment1.position.set(0, 0.1, 0); // Offset from base center
  armBase.add(armSegment1);

  const armSegment2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.15, 0.02),
    handleMaterial
  );
  armSegment2.position.set(0, 0.1, 0); // Offset from segment1 end
  armSegment1.add(armSegment2);

  // Sensor/Camera Head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.04, 0.04),
    poleMaterial // Darker head
  );
  head.position.set(0, 0.08, 0.02); // Offset from segment2 end
  armSegment2.add(head);

  // Simple Scissor Placeholder
  const scissorBlade1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.06, 0.01),
    handleMaterial
  );
  scissorBlade1.position.set(-0.015, 0.03, -0.02);
  scissorBlade1.rotation.z = 0.5;
  head.add(scissorBlade1);
  const scissorBlade2 = scissorBlade1.clone();
  scissorBlade2.position.x = 0.015;
  scissorBlade2.rotation.z = -0.5;
  head.add(scissorBlade2);

  // Set initial arm rotation (relative to pole attachment)
  armBase.rotation.z = Math.PI / 4; // Rotate around pole axis
  armSegment1.rotation.x = -Math.PI / 6; // Pitch segment 1
  armSegment2.rotation.x = Math.PI / 8; // Pitch segment 2

  // Helix Ramp (Uses new helixStartY via curve)
  const curve = new HelixCurve(helixRadius, helixHeight, turns, helixStartY);
  const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, false);
  const ramp = new THREE.Mesh(tubeGeometry, rampMaterial);
  ramp.castShadow = true;
  ramp.receiveShadow = true;
  helixGroup.add(ramp);

  // Pods (Changed Geometry)
  const podRadius = 0.06;
  const podHeight = 0.08;
  const podGeometry = new THREE.CylinderGeometry(
    podRadius,
    podRadius * 0.8,
    podHeight,
    12
  ); // Tapered cylinder socket
  // Use more points for smoother pod distribution, especially with many pods
  const numPointsForPods = Math.max(numPods * 2, 100);
  const points = curve.getPoints(numPointsForPods);

  // Distribute pods evenly among the calculated points
  for (let i = 0; i < numPods; i++) {
    const pointIndex = Math.floor((i / numPods) * points.length);
    const pod = new THREE.Mesh(podGeometry, podMaterial);
    pod.position.copy(points[pointIndex]);

    // --- Orient Pods ---
    // Calculate the tangent (direction) of the curve at this point
    // const tangent = curve.getTangent(pointIndex / points.length); // Not directly used but could be useful
    // Calculate the point slightly ahead on the curve
    // const nextPoint = curve.getPoint((pointIndex + 1) / points.length); // Not directly used but could be useful
    // Point the pod slightly outwards from the pole, roughly following curve
    pod.lookAt(centralPole.position.x, pod.position.y, centralPole.position.z);
    pod.rotation.y += Math.PI / 2; // Adjust if needed based on lookAt
    pod.rotation.x += Math.PI / 2; // Stand pods upright

    pod.castShadow = true;
    pod.receiveShadow = true;
    helixGroup.add(pod);
  }
}

// Floor - Changed material color to black
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.8 }) // Black floor
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Door animation state
let isDoorOpen = false;
let isAnimating = false;

document.getElementById("toggleDoor").addEventListener("click", () => {
  console.log(
    "Toggle Door button clicked. isAnimating:",
    isAnimating,
    "isDoorOpen:",
    isDoorOpen
  ); // Added log
  if (isAnimating) return;
  isAnimating = true;

  const targetRotation = isDoorOpen ? 0 : -Math.PI * 0.6; // Swing outwards
  gsap.to(doorPivot.rotation, {
    y: targetRotation,
    duration: 0.8,
    ease: "power2.out",
    onComplete: () => {
      isDoorOpen = !isDoorOpen;
      isAnimating = false;
    },
  });
});

// Scale control - Ensure it uses updated fridgeHeight
document.getElementById("scaleSlider").addEventListener("input", (e) => {
  const scale = parseFloat(e.target.value);
  fridgeGroup.scale.set(scale, scale, scale);
  // Adjust position based on scale to keep base on the floor
  fridgeGroup.position.y = (fridgeHeight * (scale - 1)) / 2; // Uses new fridgeHeight
});

// --- Hardcoded Values ---
const helixTurns = 3.0;
const podCount = 20;

// Initial Helix Creation
createHelixFarm(helixTurns, podCount);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
