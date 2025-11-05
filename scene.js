import * as THREE from 'three';
import { OrbitControls } from 'https://esm.sh/three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js';

let scene, camera, webglRenderer, css3dRenderer, controls;
const handMeshes = [];

const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [5, 9], [9, 10], [10, 11], [11, 12], // Middle
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [13, 17], [17, 18], [18, 19], [19, 20] // Pinky and palm
];

export function init() {
    // Basic Three.js setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1000;

    // WebGL Renderer for hand visualization
    webglRenderer = new THREE.WebGLRenderer({ alpha: true });
    webglRenderer.setSize(window.innerWidth, window.innerHeight);
    webglRenderer.setPixelRatio(window.devicePixelRatio);
    webglRenderer.domElement.style.position = 'absolute';
    webglRenderer.domElement.style.top = '0px';
    webglRenderer.domElement.style.zIndex = '1';
    document.getElementById('scene-container').appendChild(webglRenderer.domElement);

    // CSS3D Renderer for UI
    css3dRenderer = new CSS3DRenderer();
    css3dRenderer.setSize(window.innerWidth, window.innerHeight);
    css3dRenderer.domElement.style.position = 'absolute';
    css3dRenderer.domElement.style.top = '0px';
    css3dRenderer.domElement.style.zIndex = '2'; // Place it on top of WebGL
    document.getElementById('scene-container').appendChild(css3dRenderer.domElement);

    // OrbitControls for debugging
    controls = new OrbitControls(camera, css3dRenderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = false;

    // Create 3D object for the UI
    const uiElement = document.getElementById('futuristic-ui');
    const cssObject = new CSS3DObject(uiElement);
    scene.add(cssObject);

    // Create groups for hand meshes
    for (let i = 0; i < 2; i++) {
        const handGroup = new THREE.Group();
        // Joints
        for (let j = 0; j < 21; j++) {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(4, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x00ffff })
            );
            handGroup.add(sphere);
        }
        // Bones
        HAND_CONNECTIONS.forEach(() => {
             const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
             const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 }));
             handGroup.add(line);
        });
        handGroup.visible = false;
        scene.add(handGroup);
        handMeshes.push(handGroup);
    }

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    webglRenderer.setSize(window.innerWidth, window.innerHeight);
    css3dRenderer.setSize(window.innerWidth, window.innerHeight);
}

export function render() {
    controls.update();
    webglRenderer.render(scene, camera);
    css3dRenderer.render(scene, camera);
}

export function updateHandVisuals(worldLandmarks, handedness) {
    handMeshes.forEach(h => h.visible = false);

    if (worldLandmarks && worldLandmarks.length > 0) {
        worldLandmarks.forEach((landmarks, index) => {
            const handIndex = handedness[index][0].categoryName === 'Right' ? 0 : 1;
            const handGroup = handMeshes[handIndex];
            handGroup.visible = true;

            // Update joints
            landmarks.forEach((landmark, i) => {
                const joint = handGroup.children[i];
                // MediaPipe coords are (-1, 1), we need to scale them.
                // Y is inverted. Let's make it more 3D.
                // We use a large scale factor to bring hands into camera view.
                const scale = 3000;
                joint.position.set(
                    (landmark.x - 0.5) * -scale, // Invert X for mirror effect
                    (landmark.y - 0.5) * -scale,
                     landmark.z * -scale
                );
            });

            // Update bones
            HAND_CONNECTIONS.forEach((connection, i) => {
                const line = handGroup.children[21 + i]; // Bones start after 21 joints
                const startPoint = handGroup.children[connection[0]].position;
                const endPoint = handGroup.children[connection[1]].position;
                line.geometry.setFromPoints([startPoint, endPoint]);
                line.geometry.verticesNeedUpdate = true;
            });
        });
    }
}