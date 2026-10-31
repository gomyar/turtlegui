/**
 * Web Application Demo - Controller Code
 * Demonstrates layered GUI design with custom animations
 */

var gui = {};

// State variables
gui.show_dialog = false;
gui.show_notification = false;
gui.show_notification_timeout = null;
gui.tab = "info";


gui.switch_tab = function(tab_id) {
    gui.tab = tab_id;
    turtlegui.reload();
}

/**
 * Opens the centered modal dialog
 */
gui.open_dialog = function() {
    gui.show_dialog = true;
    turtlegui.reload();
}

/**
 * Closes the modal dialog
 */
gui.close_dialog = function() {
    gui.show_dialog = false;
    turtlegui.reload();
}

/**
 * Shows a notification for 3 seconds then auto-dismisses
 */
gui.open_notification = function() {
    gui.show_notification = true;
    turtlegui.reload();
    clearTimeout(gui.show_notification_timeout);
    gui.show_notification_timeout = setTimeout(function() {
        gui.show_notification = false;
        turtlegui.reload();
    }, 3000);
}

/**
 * Animation: Fade in element from opacity 0 to 1
 * Used by gui-onshow directive - element is passed as a param
 */
gui.fade_in = function(element) {
    element.style.opacity = '0';
    element.style.display = 'block';

    // Force reflow to ensure the initial style is applied
    element.offsetHeight;

    // Animate to full opacity
    element.style.transition = 'opacity 1s';
    element.style.opacity = '1';
}

/**
 * Animation: Fade out element from opacity 1 to 0 then hide
 * Used by gui-onhide directive - element is passed as a param
 */
gui.fade_out = function(element) {
    if (element.style.display !== 'none') {
        element.style.transition = 'opacity 1s';
        element.style.opacity = '0';

        // Hide the element after animation completes
        setTimeout(function() {
            element.style.display = 'none';
        }, 1000);
    }
}

/**
 * Animation: Slide in vertically from bottom
 * Used by gui-onshow directive - element passed as a param
 * @param {number} height - Target height in pixels
 */
gui.scroll_vertical_in = function(element, height) {
    element.style.height = '0px';
    element.style.top = '-20px';
    element.style.opacity = '1';
    element.style.display = 'block';

    // Force reflow
    element.offsetHeight;

    // Animate to target height and position
    element.style.transition = 'height 1s, top 1s';
    element.style.height = height + 'px';
    element.style.top = '-' + (height + 20) + 'px';
}

// Initialize TurtleGUI when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    turtlegui.reload();
});
