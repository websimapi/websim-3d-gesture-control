import * as ui from './ui.js';
import * as handTracking from './hand-tracking.js';
import * as gestures from './gestures.js';
import * as interaction from './interaction.js';
import * as scene from './scene.js';

async function main() {
    const videoElement = document.getElementById('webcam');
    
    ui.showLoading();

    try {
        scene.init();
        interaction.init();

        const onHandsDetected = (handData) => {
            let detectedGestures = { left: 'None', right: 'None' };
            
            // Pass hand data to the scene for 3D visualization
            scene.updateHandVisuals(handData.worldLandmarks, handData.handedness);
            
            if (handData.handedness && handData.handedness.length > 0) {
                 handData.landmarks.forEach((landmarks, index) => {
                    const handedness = handData.handedness[index][0].categoryName;
                    const gesture = gestures.detect(landmarks);

                    if (handedness === 'Left') {
                        detectedGestures.left = gesture.name.split(' ')[0]; // Show base gesture
                    } else if (handedness === 'Right') {
                        detectedGestures.right = gesture.name.split(' ')[0];
                    }
                    
                    // Prioritize right hand for interaction if both are present
                    const rightHandIndex = handData.handedness.findIndex(h => h[0].categoryName === 'Right');
                    if (rightHandIndex !== -1) {
                         if (index === rightHandIndex) {
                            interaction.handleGesture(gesture, landmarks, 0);
                         }
                    } else {
                        // If no right hand, use the first detected hand
                        interaction.handleGesture(gesture, landmarks, 0);
                    }
                });
            } else {
                interaction.handleGesture({ name: 'None' }, [], 0); // Hide cursor
            }


             ui.updateGestureUI(detectedGestures.left, detectedGestures.right);
        };
        
        await handTracking.init(videoElement, onHandsDetected);
        
        ui.hideLoading();
        ui.showInstructions();

        function animate() {
            requestAnimationFrame(animate);
            handTracking.predict();
            scene.render();
        }
        
        animate();

    } catch (error) {
        console.error("Initialization failed:", error);
        ui.showError("Could not initialize webcam or AI model. Please grant camera permissions and refresh.");
    }
}

main();