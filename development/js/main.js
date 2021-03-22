// Lazy load
$('.lazy-load').Lazy({
    // your configuration goes here
    scrollDirection: 'vertical',
    effect: 'fadeIn',
    visibleOnly: true,
    onFinishedAll: function() {
        if( !this.config("autoDestroy") )
            this.destroy();
    },
    onError: function(element) {
        console.log('error loading ' + element.data('src'));
    }
});
