import * as THREE from 'three';

let sceneManager;
let isGrabbing = false;
let grabbingHandIndex = -1;
let grabOffset = new THREE.Vector3();

export function init(manager) {
    sceneManager = manager;
}

export function handleGesture(gesture, landmarks, handIndex) {
    const cube = sceneManager.getCube();
    const camera = sceneManager.getCamera();

    if (gesture.name === 'pinch') {
        const pinchPosition = landmarks[8]; // Index finger tip

        // Convert normalized 2D screen coordinate to 3D world space
        const vector = new THREE.Vector3(
            (pinchPosition.x - 0.5) * 2, 
            - (pinchPosition.y - 0.5) * 2, 
            0.5
        );
        vector.unproject(camera);

        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));

        if (!isGrabbing) {
            // Check if the pinch is close to the cube
            if (pos.distanceTo(cube.position) < 1.0) { // Grab radius
                isGrabbing = true;
                grabbingHandIndex = handIndex;
                // Calculate offset from cube center to grabbing point
                grabOffset.subVectors(cube.position, pos);
            }
        } else if (grabbingHandIndex === handIndex) {
            // Cube is being grabbed by this hand, update its position
            cube.position.addVectors(pos, grabOffset);
        }

    } else { // 'none' gesture
        if (isGrabbing && grabbingHandIndex === handIndex) {
            isGrabbing = false;
            grabbingHandIndex = -1;
        }
    }
}