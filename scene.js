import * as THREE from 'three';

let scene, camera, renderer;
const interactableObjects = [];
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
    const geonetry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geonetry, material);
    cube.position.set(-2, 0, -3);
    scene.add(cube);
    interactableObjects.push(cube);

    const sphereGeo = new THREE.SphereGeometry(0.7, 32, 16);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xff00ff });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(2, 0, -3);
    scene.add(sphere);
    interactableObjects.push(sphere);

    const torusGeo = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(0, 1.5, -3.5);
    scene.add(torus);
    interactableObjects.push(torus);

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

    return { render, updateHandVisuals, getInteractableObjects: () => interactableObjects, getCamera: () => camera };
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function render() {
    interactableObjects.forEach(obj => {
        if (!obj.userData.isGrabbed) {
            obj.rotation.x += 0.005;
            obj.rotation.y += 0.005;
        }
    });

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