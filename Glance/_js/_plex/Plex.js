
/* STRAVA */
var Plex = function (opts) {
    this.options = {};
    //this._resetOptions();
    this.options = $.extend({
        container: $('#plex'),
        serverName: 'Dave Media',
        username: '',
        password: '',
        urlList: '/library/recentlyAdded',
        urlDeck: '/library/onDeck',
        urlAuth: 'https://plex.tv/users/sign_in.xml',
        urlServer: 'https://plex.tv/pms/servers.xml',
        tokenStorage: 'plexAccesstoken'

    }, opts);

    this.plexHeaders = {
        'X-Plex-Client-Identifier': guid(),
        'X-Plex-Product': this.options.product || 'HTML5 Glance',
        'X-Plex-Version': this.options.version || '1.0',
        'X-Plex-Device': this.options.device || navigator.platform,
        'X-Plex-Device-Name': this.options.deviceName || navigator.userAgent,
        'X-Plex-Platform': this.options.platform || 'HTML5',
        'X-Plex-Platform-Version': this.options.platformVersion || '1.0',
        'X-Plex-Provides': 'controller'
    }
    //console.log(options);
    this.container = this.options.container;
    this.init();
}

Plex.prototype.token = function () {
    var self = this;
    var _token = localStorage.getItem(self.options.tokenStorage);
    return _token;
}

Plex.prototype.init = function () {
    var self = this;
    var options = self.options;

    this.authenticate();
    this._interval = setInterval(self.update(), 1200000);
}

Plex.prototype.authenticate = function () {
    var self = this;
    var options = self.options;

    // try token, if 401, reget token
    if (!self.token()) {
        $.ajax({
            url: options.urlAuth,
            headers: $.extend({
                "Authorization": "Basic " + btoa(options.username + ":" + options.password)
            }, self.plexHeaders),
            dataType: "xml",
            method: 'POST',
            success: function (data) {

                var token = $(data).find('authentication-token').text();
                if (token) {
                    localStorage.setItem(self.options.tokenStorage, token);
                    self.update();
                }
            }
        });
    }

}


Plex.prototype.update = function () {
    var self = this;
    var container = self.container;
    var options = self.options;
    var latestContainer = container.find('.latest');
    var deckContainer = container.find('.deck .list');

    if (this.token()) {
        $.ajax({
            url: options.urlServer,
            headers: {
                'X-Plex-Token': self.token(),
                'X-Plex-Username': options.username
            },
            dataType: "xml",
            success: function (data) {
                var serverAddress = $(data).find('Server[name="' + options.serverName + '"]').attr('address');
                var serverPort = $(data).find('Server[name="' + options.serverName + '"]').attr('port');

                if (serverAddress) {

                    $.ajax({
                        url: "http://" + serverAddress + ":" + serverPort + options.urlList,
                        headers: {
                            "Accept": "application/json",
                            'X-Plex-Token': self.token(),
                            'X-Plex-Username': options.username,
                            'X-Plex-Container-Size': 15,
                            'X-Plex-Container-Start': 0
                        },
                        dataType: "json",
                        success: function (data2) {
                            latestContainer.html('');
                            if (data2._children) {
                                $.each(data2._children, function () {
                                    latestContainer.append(
                                        $('<img>').attr('src', "http://86.149.106.32:18587" + this.thumb + "?X-Plex-Token=" + self.token())
                                        );
                                });
                            };
                        }
                    });


                    $.ajax({
                        url: "http://" + serverAddress + ":" + serverPort + options.urlDeck,
                        headers: {
                            "Accept": "application/json",
                            'X-Plex-Token': self.token(),
                            'X-Plex-Username': options.username,
                            'X-Plex-Container-Size': 5,
                            'X-Plex-Container-Start': 0
                        },
                        dataType: "json",
                        success: function (data2) {
                            deckContainer.html('');
                            if (data2._children) {
                                $.each(data2._children, function () {
                                    deckContainer.append(
                                        $('<img>').attr('src', "http://86.149.106.32:18587" + (this.parentThumb || this.thumb) + "?X-Plex-Token=" + self.token())
                                        );
                                });
                            };
                        }
                    });
                }
            }
        });
    }


};


function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}