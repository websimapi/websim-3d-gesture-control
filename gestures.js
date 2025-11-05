// Landmark indices
const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_FINGER_MCP = 5;
const INDEX_FINGER_TIP = 8;
const MIDDLE_FINGER_TIP = 12;
const RING_FINGER_TIP = 16;
const PINKY_TIP = 20;

function getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isFingerExtended(landmarks, tipIndex, mcpIndex) {
    const tip = landmarks[tipIndex];
    const mcp = landmarks[mcpIndex]; // Using index MCP as a reference for palm
    const wrist = landmarks[WRIST];
    return getDistance(tip, wrist) > getDistance(mcp, wrist);
}

export function detect(handLandmarks) {
    if (!handLandmarks || handLandmarks.length === 0) {
        return { name: 'None' };
    }

    const thumbTip = handLandmarks[THUMB_TIP];
    const indexTip = handLandmarks[INDEX_FINGER_TIP];

    // Pinch
    if (getDistance(thumbTip, indexTip) < 0.05) {
        return { name: 'Pinch', position: indexTip };
    }

    const indexExtended = isFingerExtended(handLandmarks, INDEX_FINGER_TIP, INDEX_FINGER_MCP);
    const middleExtended = isFingerExtended(handLandmarks, MIDDLE_FINGER_TIP, INDEX_FINGER_MCP + 4);
    const ringExtended = isFingerExtended(handLandmarks, RING_FINGER_TIP, INDEX_FINGER_MCP + 8);
    const pinkyExtended = isFingerExtended(handLandmarks, PINKY_TIP, INDEX_FINGER_MCP + 12);

    // Pointing
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return { name: 'Point', position: indexTip };
    }

    // Fist
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return { name: 'Fist' };
    }
    
    // Open Palm
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
        return { name: 'Open Palm' };
    }


    return { name: 'None' };
}