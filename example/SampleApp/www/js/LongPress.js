/**
 * Custom google-maps @event LongClick hack.
 */
function LongPress(map, maxTime) {
    this.maxTime = maxTime;
    this.isDragging = false;
    var me = this;
    me.map = map;
    google.maps.event.addListener(map, 'mousedown', function(e) {
        me.onMouseDown_(e);
    });
    google.maps.event.addListener(map, 'mouseup', function(e) {
        me.onMouseUp_(e);
    });
    google.maps.event.addListener(map, 'drag', function(e) {
        me.onMapDrag_(e);
    });
}
LongPress.prototype.onMouseUp_ = function(e) {
    var now = +new Date;
    if (now - this.downTime > this.maxTime && this.isDragging === false) {
        google.maps.event.trigger(this.map, 'longpress', e);
    }
}
LongPress.prototype.onMouseDown_ = function() {
    this.downTime = +new Date;
    this.isDragging = false;
}
LongPress.prototype.onMapDrag_ = function(e) {
    this.isDragging = true;
};
