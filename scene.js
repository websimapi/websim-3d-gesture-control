import * as THREE from 'three';

let scene, camera, renderer, cube;
let allHandLandmarks = [];
const handMeshes = [];

export function init(canvas) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Objects
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    cube.position.z = -3;
    scene.add(cube);

    // Camera
    camera.position.z = 5;

    // Hand landmark visuals for two hands
    for (let h = 0; h < 2; h++) {
        for (let i = 0; i < 21; i++) {
            const sphereGeo = new THREE.SphereGeometry(0.02, 16, 16);
            const sphereMat = new THREE.MeshBasicMaterial({ color: h === 0 ? 0xff0000 : 0x0000ff }); // Red for first hand, blue for second
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            handMeshes.push(sphere);
            scene.add(sphere);
        }
    }
    
    window.addEventListener('resize', onWindowResize, false);

    return { render, updateHandVisuals, getCube: () => cube, getCamera: () => camera };
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function render() {
    if (!isGrabbing) {
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
    }

    handMeshes.forEach((mesh, i) => {
        const handIndex = Math.floor(i / 21);
        const landmarkIndex = i % 21;

        if (allHandLandmarks[handIndex] && allHandLandmarks[handIndex][landmarkIndex]) {
            const landmark = allHandLandmarks[handIndex][landmarkIndex];
             // Convert normalized screen coordinates to world coordinates
            const vector = new THREE.Vector3(
                (landmark.x - 0.5) * 2 * (window.innerWidth / window.innerHeight),
                -(landmark.y - 0.5) * 2,
                -3 // Project slightly in front of the cube
            );
            mesh.position.copy(vector);
            mesh.visible = true;
        } else {
            mesh.visible = false;
        }
    });

    renderer.render(scene, camera);
}

export function updateHandVisuals(landmarks) {
    allHandLandmarks = landmarks;
}

// A global grabbing state from interaction.js would be better,
// but for simplicity, we add it here for now to stop rotation.
let isGrabbing = false;

// We can listen to pinch events, but for now, we'll just check the interaction module's state.
// This is a bit of a hack. A better solution would be an event system or state manager.
import * as interaction from './interaction.js';
Object.defineProperty(interaction, 'isGrabbing', {
  get: () => isGrabbing,
  set: (v) => { isGrabbing = v; }
});