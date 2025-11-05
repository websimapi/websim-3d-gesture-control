import * as scene from './scene.js';
import * as handTracking from './hand-tracking.js';
import * as ui from './ui.js';
import * as gestures from './gestures.js';
import * as interaction from './interaction.js';

async function main() {
    const videoElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('render-canvas');

    ui.showLoading();

    try {
        const sceneManager = scene.init(canvasElement);
        interaction.init(sceneManager);

        const onHandsDetected = (handData) => {
            sceneManager.updateHandVisuals(handData.landmarks);
            handData.landmarks.forEach((landmarks, index) => {
                const gesture = gestures.detect(landmarks);
                interaction.handleGesture(gesture, landmarks, index);
            });
        };
        
        await handTracking.init(videoElement, onHandsDetected);
        
        ui.hideLoading();
        ui.showInstructions();

        function animate() {
            requestAnimationFrame(animate);
            handTracking.predict();
            sceneManager.render();
        }
        
        animate();

    } catch (error) {
        console.error("Initialization failed:", error);
        ui.showError("Could not initialize webcam or AI model.");
    }
}

main();