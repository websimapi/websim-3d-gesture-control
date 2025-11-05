import * as THREE from 'three';

let cursor, scrollContent, buttons;
let lastTapTime = 0;
const TAP_COOLDOWN = 300; // ms

export function init() {
    cursor = document.getElementById('hand-cursor');
    scrollContent = document.getElementById('scroll-content');
    buttons = document.querySelectorAll('.ui-button');
}

function updateCursor(position) {
    if (!position) {
        cursor.style.opacity = '0';
        return;
    }
    cursor.style.opacity = '1';
    const screenX = window.innerWidth * (1 - position.x); // Mirrored video
    const screenY = window.innerHeight * position.y;
    cursor.style.transform = `translate(${screenX}px, ${screenY}px)`;
    
    // Check for hover
    const elementUnderCursor = document.elementFromPoint(screenX, screenY);
    buttons.forEach(btn => {
        if (btn === elementUnderCursor) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

export function handleGesture(gesture, landmarks, handIndex) {
    // We'll primarily use the right hand (index 0 if available) for UI control for simplicity
    // but the cursor will follow whichever hand is detected first.
    if (handIndex > 0) return;

    updateCursor(gesture.position);

    switch (gesture.name) {
        case 'Swipe Up':
            scrollContent.scrollBy({ top: -150, behavior: 'smooth' });
            break;
        case 'Swipe Down':
            scrollContent.scrollBy({ top: 150, behavior: 'smooth' });
            break;
        case 'Tap':
            const now = Date.now();
            if (now - lastTapTime > TAP_COOLDOWN) {
                lastTapTime = now;
                const screenX = window.innerWidth * (1 - gesture.position.x);
                const screenY = window.innerHeight * gesture.position.y;
                const element = document.elementFromPoint(screenX, screenY);
                if (element && element.classList.contains('ui-button')) {
                    console.log(`Tapped button: ${element.dataset.action}`);
                    element.click(); // Trigger a click for visual feedback/other scripts
                }
            }
            break;
    }
}