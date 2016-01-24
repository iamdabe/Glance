var OAuth = function (options) {
    this.options = {};
    this._resetOptions();
    $.extend(this.options, options);

    this.init();
}

OAuth.prototype.token = function () {
    var _token = localStorage.getItem(this.options.provider.tokenStorage);
    return _token;
}

OAuth.prototype.hasToken = function () {
    return ((this.token != null) ? true : false);
}

OAuth.prototype.init = function () {
    this._responseCheck();
    this._initProvider();

    // Setup proxy
    $.ajaxPrefilter(function (options) {
        if (options.crossDomain) {
            var newData = { data: JSON.stringify(options.data), url: options.url };
            options.url = _proxyUrl;
            options.data = $.param(newData);
            options.crossDomain = false;
        }
    });
}

OAuth.prototype._resetOptions = function _resetOptions() {
    this.options = {
        provider: {
            providerID: '',
            clientID: '',
            clientSecret: '',
            callback: null,
            tokenStorage: '',
            urlAuth: '',
            urlToken: '',
            deAuthCallback: null,
            displayNameStorage: ''
        }
    };
};

OAuth.prototype._initProvider = function () {
    var provider = this.options.provider;
    _hasAccess = ((this.token != null) ? true : false)

    // if we have token then oauth ok.
    if (_hasAccess) {
        this._setUI(provider.providerID, 'Disconnect', provider.deAuthCallback, provider.displayName)
    } else {
        this._setUI(provider.providerID, 'Connect', provider.urlAuth, null)
    }
}

OAuth.prototype._setUI = function (provider, status, url, user) {
    var Connected = ((user != null) ? true : false)
    var oAuthLink = $('#settings .connections-list .' + provider + ' a.connect')
    var oAuthInfo = $('#settings .connections-list .' + provider + ' .info')

    oAuthLink.attr('href', url);
    oAuthLink.find("em").html(status);
    if (Connected) {
        oAuthInfo.html('Connected as ' + user);
    }
}

OAuth.prototype._responseCheck = function () {
    var provider = this.options.provider;
    var state = '';

    //console.log(getUrlVars());

    state = getUrlVars()['state'];

    if (!state) {
        var scope = getUrlVars()['scope'];
        if (scope) {
            if (scope.indexOf('wl.') > -1) {
                state = 'liveoauth';
            }
        }
    }

    console.log(state);

    switch (state) {
        case 'liveoauth':
            //TODO: Get Proper Token & Refresh Token storage + refresh token check
            var accesstoken = getUrlVars()[0];
            localStorage.setItem(provider.tokenStorage, accesstoken);
            oAuthSetup();

            break;
        case 'stravaoauth':
            var code = getUrlVars()['code'];
            if (code) {
                var token_url = _stravaUrlToken;
                $.ajax({
                    url: token_url,
                    type: 'POST',
                    crossDomain: true,
                    processData: false,
                    dataType: "json",
                    data: { client_id: provider.clientID, client_secret: provider.clientSecret, code: code },
                    success: function (data) {
                        console.log(data)
                        localStorage.setItem(provider.tokenStorage, data.access_token);
                        localStorage.setItem(provider.displayNameStorage, data.athlete.email);

                        this._initProvider();

                        if (typeof provider.callback === "function") {
                            provider.callback();
                        }

                    },
                    error: function (error) {

                    }
                });
            }
            break;
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