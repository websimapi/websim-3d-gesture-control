import * as THREE from 'three';

let sceneManager;
const grabState = [
    { isGrabbing: false, grabbedObject: null, offset: new THREE.Vector3() }, // Hand 0
    { isGrabbing: false, grabbedObject: null, offset: new THREE.Vector3() }  // Hand 1
];

export function init(manager) {
    sceneManager = manager;
}

export function handleGesture(gesture, landmarks, handIndex) {
    const state = grabState[handIndex];
    const camera = sceneManager.getCamera();
    const interactableObjects = sceneManager.getInteractableObjects();

    if (gesture.name === 'Pinch') {
        const pinchPosition = landmarks[8]; // Index finger tip

        // Convert normalized 2D screen coordinate to 3D world space
        const vector = new THREE.Vector3(
            (pinchPosition.x - 0.5) * 2,
            -(pinchPosition.y - 0.5) * 2,
            0.5
        );
        vector.unproject(camera);

        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z; // Simplified distance calc
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));

        if (!state.isGrabbing) {
            // Check for object to grab
            for (const obj of interactableObjects) {
                if (pos.distanceTo(obj.position) < 1.0) { // Grab radius
                    state.isGrabbing = true;
                    state.grabbedObject = obj;
                    obj.userData.isGrabbed = true;
                    state.offset.subVectors(obj.position, pos);
                    break; // Grab only one object
                }
            }
        } else if (state.grabbedObject) {
            // Move the grabbed object
            state.grabbedObject.position.addVectors(pos, state.offset);
        }

    } else { // Any other gesture
        if (state.isGrabbing) {
            if(state.grabbedObject) state.grabbedObject.userData.isGrabbed = false;
            state.isGrabbing = false;
            state.grabbedObject = null;
        }
    }
}