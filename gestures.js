// Landmark indices for thumb and index finger tips
const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;

export function detect(landmarks) {
    if (!landmarks || landmarks.length === 0) {
        return { name: 'none' };
    }

    const hand = landmarks[0]; // Using the first detected hand

    const thumbTip = hand[THUMB_TIP];
    const indexTip = hand[INDEX_FINGER_TIP];

    // Calculate distance between thumb and index finger tips
    const dx = thumbTip.x - indexTip.x;
    const dy = thumbTip.y - indexTip.y;
    const dz = thumbTip.z - indexTip.z;
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Threshold for pinch detection (this may need tuning)
    const pinchThreshold = 0.05;

    if (distance < pinchThreshold) {
        return { name: 'pinch', position: indexTip };
    }

    return { name: 'none' };
}