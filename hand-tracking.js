import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let handLandmarker;
let video;
let lastVideoTime = -1;
let onHandsDetectedCallback;

export async function init(videoElement, callback) {
    video = videoElement;
    onHandsDetectedCallback = callback;

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
    });

    await enableWebcam();
}

async function enableWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
    });
    video.srcObject = stream;
    video.addEventListener("loadeddata", predict);
}

export function predict() {
    if (!handLandmarker || video.readyState < 2) return;

    const startTimeMs = performance.now();
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const results = handLandmarker.detectForVideo(video, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
            const handData = {
                landmarks: results.landmarks,
                worldLandmarks: results.worldLandmarks,
                handedness: results.handedness
            };
            onHandsDetectedCallback(handData);
        } else {
             onHandsDetectedCallback({ landmarks: [] });
        }
    }
}

