
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
    var self = $(this);
    self.stop();
    self.css('opacity', '0');
    self.show();
    self.animate({
        opacity: "1",
    }, 1000);
}


gui.fade_out = function() {
    var self = $(this);
    self.stop();
    if (self.is(":visible")) {
        self.animate(
            {opacity: "0"},
            1000,
            self.hide);
    }
}


gui.scroll_vertical_in = function(height) {
    var self = $(this);
    self.stop();
    self.css('height', 0);
    self.css('top', -20);
    self.css('opacity', 1);
    self.show();
    self.animate({
        height: height,
        top: -220
    }, 1000);
}


$(document).ready(function() {
    turtlegui.reload();
});
