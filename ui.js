const loadingIndicator = document.getElementById('loading-indicator');
const instructions = document.getElementById('instructions');
const uiContainer = document.getElementById('ui-container');

export function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

export function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

export function showInstructions() {
    instructions.classList.remove('hidden');
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

