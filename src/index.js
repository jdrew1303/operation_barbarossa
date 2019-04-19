console.clear();
console.warn = () => {};
console.error = () => {};

require("./styles.css");

const CANNON = require("cannon");
const THREE = require("three");

// some of our packages need modules to be on the window object
window.THREE = THREE;
window.CANNON = CANNON;

const OrbitControls = require("three-orbit-controls")(THREE);

const g = require("geotic");

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

// Set the direction of the light
shadowLight.position.set(150, 350, 350);

// Allow shadow casting
shadowLight.castShadow = true;

// define the visible area of the projected shadow
shadowLight.shadow.camera.left = -400;
shadowLight.shadow.camera.right = 400;
shadowLight.shadow.camera.top = 400;
shadowLight.shadow.camera.bottom = -400;
shadowLight.shadow.camera.near = 1;
shadowLight.shadow.camera.far = 1000;

// define the resolution of the shadow; the higher the better,
// but also the more expensive and less performant
shadowLight.shadow.mapSize.width = 2048;
shadowLight.shadow.mapSize.height = 2048;

const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;
const ASPECT_RATIO = WIDTH / HEIGHT;

// this is like a stage where all the animation takes palce.
const scene = new THREE.Scene();

// Add a fog effect to the scene; same color as the
// background color used in the style sheet
scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

scene.add(hemisphereLight);
scene.add(shadowLight);

const fieldOfView = 60;
const nearPlane = 1;
const farPlane = 10000;
const camera = new THREE.PerspectiveCamera(
  fieldOfView,
  ASPECT_RATIO,
  nearPlane,
  farPlane
);

// Set the position of the camera
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 10;
camera.lookAt(new THREE.Vector3());
const controls = new OrbitControls(camera);

const world = new CANNON.World();
world.gravity.set(0, 0, -9.82);

g.component("transform", (entity, position) => position);
g.component("model", (entity, model) => model);

const demo = g
  .entity()
  .add("transform", {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  })
  .add("model", "scene");

// const { modelLoadingSystem } = require("./systems/modelLoadingSystem");
const { modelLoadingSystem } = require("./systems/gltfModelLoadingSystem");
modelLoadingSystem(g, scene, world);

// adds panels to the ui if debugging is turned on
const { debugPanelSystem } = require("./systems/debugSystem");
debugPanelSystem(g, scene, world);

// Add the DOM element of the renderer to the
// container we created in the HTML
const container = document.getElementById("world");
container.appendChild(renderer.domElement);

require("cannon/tools/threejs/CannonDebugRenderer");
var cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);

const clock = new THREE.Clock();

function loop() {
  requestAnimationFrame(loop);

  //world.step(clock.getDelta());
  cannonDebugRenderer.update();
  renderer.render(scene, camera);
}
loop();
//window.addEventListener("load", loop, false);
