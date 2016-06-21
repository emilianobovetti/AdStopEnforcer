/*
 * This file is part of AdStopEnforcer.
 *
 * AdStopEnforcer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * AdStopEnforcer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with AdStopEnforcer.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

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
        localStorage.setItem('mode', 'off');

        offModeButtonActive();
    }

    function switchToNormalMode () {
        localStorage.setItem('mode', 'normal');

        normalModeButtonActive();
    }

    function switchToExperimentalMode () {
        localStorage.setItem('mode', 'experimental');

        experimentalModeButtonActive();
    }

    switch (localStorage.getItem('mode')) {
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

    offModeButton.addEventListener('click', switchToOffMode);

    normalModeButton.addEventListener('click', switchToNormalMode);

    experimentalModeButton.addEventListener('click', switchToExperimentalMode);
});
