
var gui = {};

gui.show_dialog = false;
gui.show_notification = false;
gui.show_notification_timeout = null;


gui.dialog_class = function() {
    return gui.show_dialog ? "visible": "notvisible"
}


gui.open_dialog = function() {
    gui.show_dialog = true;
    turtlegui.reload();
}


gui.close_dialog = function() {
    gui.show_dialog = false;
    turtlegui.reload();
}


gui.open_notification = function() {
    gui.show_notification = true;
    turtlegui.reload();
    clearTimeout(gui.show_notification_timeout);
    gui.show_notification_timeout = setTimeout(function() {
        gui.show_notification = false;
        turtlegui.reload()
    }, 3000);
}


gui.fade_in = function() {
    this.stop();
    this.css('opacity', '0');
    this.show();
    this.animate({
        opacity: "1",
    }, 1000);
}


gui.fade_out = function() {
    var self = this;
    this.stop();
    if (this.is(":visible")) {
        this.animate(
            {opacity: "0"},
            1000,
            self.hide);
    }
}


gui.scroll_vertical_in = function(height) {
    this.stop();
    this.css('height', 0);
    this.css('top', -20);
    this.css('opacity', 1);
    this.show();
    this.animate({
        height: height,
        top: -220
    }, 1000);
}


$(document).ready(function() {
    turtlegui.reload();
});
