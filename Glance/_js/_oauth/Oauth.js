var OAuth = function (opts) {
    this.options = {};
    this._resetOptions();
    this.options = $.extend(this.options, opts);
    this.init();
}

OAuth.prototype.token = function () {
    var _token = localStorage.getItem(this.options.provider.tokenStorage);
    return _token;
}

OAuth.prototype.hasToken = function (callback, reject) {
    var self = this;
    var provider = self.options.provider;

    if ((self.token() != null) ? true : false) {
        if ((provider.refreshTokenStorage    != null) ? true : false) {
            self._validToken(function () {
                if (typeof callback === "function") {
                    callback();
                }
            }, function () {
                self._refreshToken(function () {
                    if (typeof callback === "function") {
                        callback();
                    }
                }, function () {
                    if (typeof reject === "function") {
                        reject();
                    }
                });
            });
        } else {
            if (typeof callback === "function") {
                callback();
            }
        }
    } else {
        if (typeof reject === "function") {
            reject();
        }
    }
}

OAuth.prototype.init = function () {
    var self = this;

    this._responseCheck();
    this._initProvider();
}

OAuth.prototype._resetOptions = function _resetOptions() {
    this.options = {
        proxy:'',
        provider: {
            providerId: '',
            clientId: '',
            clientSecret: '',
            callback: null,
            tokenStorage: '',
            refreshTokenStorage: '',
            urlAuth: '',
            urlToken: '',
            urlTokenRefresh: '',
            urlTokenCheck: '',
            invalidTokenValue: '',
            deAuthCallback: null,
            displayNameStorage: ''
        }
    };
};

OAuth.prototype._initProvider = function () {
    var self = this;
    var provider = self.options.provider;

    self.hasToken(function () {
        self._setUI(provider.providerId, 'Disconnect', provider.deAuthCallback, provider.displayName)
    }, function () {
        self._setUI(provider.providerId, 'Connect', provider.urlAuth, null)
    });
}

OAuth.prototype._setUI = function (provider, status, url, user) {
    var Connected = ((user != null) ? true : false)
    var oAuthLink = $('#settings .connections-list .' + provider + ' a.connect')
    var oAuthInfo = $('#settings .connections-list .' + provider + ' .info')

    oAuthLink.find("em").html(status);
    if (Connected) {
        oAuthInfo.html('Connected as ' + user);
    } else {
        oAuthLink.attr('href', url);
    }
}

OAuth.prototype._validToken = function (callback, reject) {
    console.log('_validToken');
    var self = this;
    var provider = self.options.provider;
    $.ajax({
        url: provider.urlTokenCheck,
        headers: $.extend({
            "Authorization": 'Bearer ' + self.token()
        }, {}),
        dataType: "json",
        method: 'GET',
        success: function (data) {
            console.log('_validToken: success;');
            if (JSON.stringify(data).indexOf(provider.invalidTokenValue) == -1) {
                console.log('_validToken: callback;');
                callback();
            } else {
                console.log('_validToken: reject;');
                reject();
            }
        },
        error: function (data) {
            reject();
        }
    });
}

OAuth.prototype._refreshToken = function (callback, reject) {
    console.log('_refreshToken');
    var self = this;
    var provider = self.options.provider;
    if (provider.urlTokenRefresh && provider.refreshTokenStorage) {
        $.ajax({
            url: provider.urlTokenRefresh.replace('{refresh_token}', localStorage.getItem(provider.refreshTokenStorage)),
            type: 'GET',
            crossDomain: true,
            processData: false,
            success: function (data) {
                console.log('_refreshToken: success;');
                if (data.access_token) {
                    localStorage.setItem(provider.tokenStorage, data.access_token);
                    localStorage.setItem(provider.refreshTokenStorage, data.refresh_token);

                    console.log('_refreshToken: callback;');

                    //self._initProvider();

                    if (typeof callback === "function") {
                        callback();
                    }
                } else {
                    localStorage.setItem(provider.tokenStorage, null);
                    localStorage.setItem(provider.refreshTokenStorage, null);

                    console.log('_refreshToken: reject;');
                    //self._initProvider();

                    if (typeof reject === "function") {
                        reject();
                    }
                }
            },
            error: function (error) {
                if (typeof reject === "function") {
                    reject();
                }
            }
        });
    }
}

OAuth.prototype._responseCheck = function () {
    var self = this;
    var provider = self.options.provider;
    var state = '';
    state = getUrlVars()['state'];

    //console.log(getUrlVars());
    //console.log(state);

    if (provider.providerId == state) {
        switch (state) {
            case 'microsofthealth':
                var code = getUrlVars()['code'];
                //console.log(code);
                //console.log(provider);

                if (code) {
                    $.ajax({
                        url: provider.urlToken.replace('{code}', code),
                        type: 'GET',
                        success: function (data) {
                            //console.log(data)
                            if (data.access_token) {
                                localStorage.setItem(provider.tokenStorage, data.access_token);
                                localStorage.setItem(provider.refreshTokenStorage, data.refresh_token);

                                self._initProvider();

                                if (typeof provider.callback === "function") {
                                    provider.callback();
                                }

                            } else {
                                self.refreshToken();
                            }
                        },
                        error: function (error) {
                        }
                    });
                }
                break;

            case 'strava':
                var code = getUrlVars()['code'];
                if (code) {
                    $.ajax({
                        url: provider.urlToken.replace('{code}', code),
                        type: 'POST',
                        success: function (data) {
                            if (data.access_token) {
                                localStorage.setItem(provider.tokenStorage, data.access_token);
                                localStorage.setItem(provider.displayNameStorage, data.athlete.email);

                                self._initProvider();

                                if (typeof provider.callback === "function") {
                                    provider.callback();
                                }
                            }
                        },
                        error: function (error) {
                        }
                    });
                }
                break;
        }
    }
}

function getUrlVars() {
    var vars = [],
		hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }

    return vars;
}