import * as THREE from 'three';
import { TIMESTEP, MAX_TIMESTEPS_PER_FRAME, NUM_PARTICLES, DIM } from './constants';
import { step } from './step'; 
import { createRenderer, createCamera, createScene, createParticles } from './render';


const positions = new Float32Array(NUM_PARTICLES * DIM);
const velocities = new Float32Array(NUM_PARTICLES * DIM);

initSimulation(positions, velocities);

let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let particles: THREE.Points;

function init() {
  const container = document.getElementById('app');
  if (!container) throw new Error("Missing #app container");

  renderer = createRenderer(container);
  camera = createCamera(container.clientWidth / container.clientHeight);
  scene = createScene();

  particles = createParticles(positions);
  scene.add(particles);

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  animate();
}

let accumulator = 0;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  let frameTime = clock.getDelta();
  accumulator += frameTime;

  // If accumulator is too large, step physics up to MAX_STEPS forward
  let steps = 0;
  while (accumulator >= TIMESTEP && steps < MAX_TIMESTEPS_PER_FRAME) {
    step(positions, velocities); // Mutates positions and velocities in-place
    accumulator -= TIMESTEP;
    steps++;
  }

  const geometry = particles.geometry as THREE.BufferGeometry;
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
  posAttr.copyArray(positions); // Efficient in-place copy
  posAttr.needsUpdate = true;

  renderer.render(scene, camera);
}

function initSimulation(pos: Float32Array, vel: Float32Array) {
  for (let i = 0; i < NUM_PARTICLES; i++) {
    for (let j = 0; j < DIM; j++) {
      pos[i * 3 + j] = (Math.random() - 0.5) * 2;
      vel[i * 3 + j] = 0;
    }
    for (let j = DIM; j < 3; j++) {
      pos[i * 3 + j] = 0;
      vel[i * 3 + j] = 0;
    }
  }
}

init();

