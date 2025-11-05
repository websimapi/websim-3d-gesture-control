const loadingIndicator = document.getElementById('loading-indicator');
const instructions = document.getElementById('instructions');
const uiContainer = document.getElementById('ui-container');
const gestureUiLeft = document.getElementById('gesture-ui-left');
const gestureUiRight = document.getElementById('gesture-ui-right');

export function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

export function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

export function showInstructions() {
    instructions.classList.remove('hidden');
    instructions.querySelector('p').textContent = 'Use your right hand to control the UI.';
    instructions.querySelectorAll('p')[1].textContent = 'Point to move cursor, swipe up/down to scroll, pinch to tap buttons.';
}

export function showError(message) {
    hideLoading();
    const errorElement = document.createElement('p');
    errorElement.textContent = `Error: ${message}`;
    errorElement.style.color = 'red';
    errorElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
    errorElement.style.padding = '20px';
    errorElement.style.borderRadius = '10px';
    uiContainer.appendChild(errorElement);
}

export function updateGestureUI(left, right) {
    gestureUiLeft.textContent = `Left: ${left}`;
    gestureUiRight.textContent = `Right: ${right}`;
}