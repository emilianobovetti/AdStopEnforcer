
document.addEventListener('DOMContentLoaded', function() {
    var offModeButton = document.getElementById('off-mode'),
        normalModeButton = document.getElementById('normal-mode'),
        experimentalModeButton = document.getElementById('experimental-mode');

    function offModeButtonActive () {
        offModeButton.classList.add('active');
        normalModeButton.classList.remove('active');
        experimentalModeButton.classList.remove('active');
    }

    function normalModeButtonActive () {
        offModeButton.classList.remove('active');
        normalModeButton.classList.add('active');
        experimentalModeButton.classList.remove('active');
    }

    function experimentalModeButtonActive () {
        offModeButton.classList.remove('active');
        normalModeButton.classList.remove('active');
        experimentalModeButton.classList.add('active');
    }

    function switchToOffMode () {
        chrome.storage.local.set({ 'mode': 'off' });

        offModeButtonActive();
    }

    function switchToNormalMode () {
        chrome.storage.local.set({ 'mode': 'normal' });

        normalModeButtonActive();
    }

    function switchToExperimentalMode () {
        chrome.storage.local.set({ 'mode': 'experimental' });

        experimentalModeButtonActive();
    }

    chrome.storage.local.get('mode', function (result) {
        switch (result.mode) {
            case 'off':
                offModeButtonActive();
                break;
            case 'normal':
                normalModeButtonActive();
                break;
            case 'experimental':
                experimentalModeButtonActive();
                break;
            default:
                switchToNormalMode();
                break;
        }
    });

    offModeButton.addEventListener('click', switchToOffMode);

    normalModeButton.addEventListener('click', switchToNormalMode);

    experimentalModeButton.addEventListener('click', switchToExperimentalMode);
});
