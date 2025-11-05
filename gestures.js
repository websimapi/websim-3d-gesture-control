// Landmark indices
const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_FINGER_MCP = 5;
const INDEX_FINGER_TIP = 8;
const MIDDLE_FINGER_TIP = 12;
const RING_FINGER_TIP = 16;
const PINKY_TIP = 20;

// Swipe detection state
const swipeState = {
    isTracking: false,
    trackStartTime: 0,
    startPosition: null,
    lastPosition: null,
    lastGesture: 'None',
    cooldown: false
};

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
        if (swipeState.isTracking) {
             Object.assign(swipeState, { isTracking: false, startPosition: null, lastPosition: null, cooldown: false });
        }
        return { name: 'None' };
    }

    const thumbTip = handLandmarks[THUMB_TIP];
    const indexTip = handLandmarks[INDEX_FINGER_TIP];

    // Tap (previously Pinch)
    if (getDistance(thumbTip, indexTip) < 0.05) {
        return { name: 'Tap', position: indexTip };
    }

    const indexExtended = isFingerExtended(handLandmarks, INDEX_FINGER_TIP, INDEX_FINGER_MCP);
    const middleExtended = isFingerExtended(handLandmarks, MIDDLE_FINGER_TIP, INDEX_FINGER_MCP + 4);
    const ringExtended = isFingerExtended(handLandmarks, RING_FINGER_TIP, INDEX_FINGER_MCP + 8);
    const pinkyExtended = isFingerExtended(handLandmarks, PINKY_TIP, INDEX_FINGER_MCP + 12);

    // Pointing gesture for swipe tracking
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        const gesture = { name: 'Point', position: indexTip };
        
        if (!swipeState.isTracking) {
            swipeState.isTracking = true;
            swipeState.trackStartTime = Date.now();
            swipeState.startPosition = { ...indexTip };
        }
        swipeState.lastPosition = { ...indexTip };
        
        if (swipeState.cooldown) {
            return gesture;
        }

        const deltaY = swipeState.startPosition.y - swipeState.lastPosition.y;
        const deltaX = swipeState.startPosition.x - swipeState.lastPosition.x;
        const timeElapsed = Date.now() - swipeState.trackStartTime;

        if (timeElapsed > 100 && timeElapsed < 500) {
             if (Math.abs(deltaY) > 0.1 && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
                swipeState.cooldown = true;
                setTimeout(() => swipeState.cooldown = false, 500); // 500ms cooldown
                return deltaY > 0 ? { name: 'Swipe Up', position: indexTip } : { name: 'Swipe Down', position: indexTip };
            }
        }
        
        return gesture;
    } else {
         if (swipeState.isTracking) {
             Object.assign(swipeState, { isTracking: false, startPosition: null, lastPosition: null, cooldown: false });
        }
    }

    // Fist
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return { name: 'Fist' };
    }
    
    // Open Palm
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
        return { name: 'Open Palm', position: handLandmarks[9] }; // Center of palm
    }


    return { name: 'None' };
}