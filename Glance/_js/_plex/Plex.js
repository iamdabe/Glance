
/* STRAVA */
var Plex = function (opts) {
    this.options = {};
    //this._resetOptions();
    this.options = $.extend({
        container: $('#plex'),
        server:  'http://dave-media:32400',
        urlList: '/library/recentlyAdded'
    }, opts);

    //console.log(options);
    this.container = this.options.container;
    this.init();
}

Plex.prototype.init = function () {
    var self = this;
    var options = self.options;
    console.log(options);
    this._interval = setInterval(this.update(), 1200000);
}


Plex.prototype.update = function () {
    var self = this;
    var container = self.container;
    var options = self.options;

    var latestContainer = container.find('.latest');


    $.ajax({
        url: options.server + options.urlList,
        dataType: "json",
        headers: { "Accept": "application/json" },
        success: function (data) {
            latestContainer.html('');
            if (data._children) {
                $.each(data._children, function () {
                    latestContainer.append(
                        $('<img>').attr('src', options.server + this.thumb)
                        )
                });
            }
            console.log(data);
        }
    });


};