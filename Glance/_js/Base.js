// JavaScript Document

//Classes

//Container
var _baseContainer;
var _calendarContainer;
var _clockContainer;
var _timeContainer;
var _dayofweekContainer;
var _dateContainer;
var _eventsContainer;
var _weatherContainer;
var _cityContainer;
var _currenttempContainer;
var _forecastContainer;

var _stravaContainer;
var _distancecoveredContainer;
var _distancegoalContainer;
var _graphContainer;
var _activityContainer;
var _friendactivityContainer;

var _weatherUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=';
var _weatherParams = '&mode=json&units=metric&cnt=5'
var _weatherCity = 'southampton,uk';

var _weekdayNames = 'MON TUE WED THU FRI SAT SUN'.split(' ');

var _distanceConversion = 0.000621371192;
var _speedConversion = 2.23693629;
var _climbConversion = 3.2808399;
var _distanceGoal = 50;

var _rootURL = window.location.protocol + "//" + window.location.host + window.location.pathname;

var _stravaClientID = 940;
var _stravaClientSecret = 'dfb6c3a088f6e6ffa88ddb14501b3e9f64014c97';
var _stravaUrlAuth = 'https://www.strava.com/oauth/authorize?client_id=' + _stravaClientID + '&response_type=code&redirect_uri=' + _rootURL + '&state=stravaoauth&approval_prompt=force';
var _stravaUrlToken = 'https://www.strava.com/oauth/token';
var _stravaUrlDeAuth = 'https://www.strava.com/oauth/deauthorize';

var _instagramUrlAuth = "https://api.instagram.com/v1/users/self/feed?access_token=";
var _instagramUrlFeed = "https://instagram.com/oauth/authorize/?client_id=274a865a47ee44bda36c89f24bf8dfc3&redirect_uri=http://instagram.demodern.de/&response_type=token";

var _liveClientID = '000000004413FC1B'
var _liveClientSecret = 'JV1trf9QoSC76dnCSeqv7nQN5H9pXP0D'
var _liveUrlAuth = 'https://login.live.com/oauth20_authorize.srf?client_id=' + _liveClientID + '&scope=wl.basic%20wl.contacts_birthday%20wl.calendars&response_type=code&redirect_uri=' + encodeURIComponent(_rootURL + '?state=liveoauth');
var _liveUrlToken = 'https://login.live.com/oauth20_token.srf';
var _liveUrlRefresh = 'https://login.live.com/oauth20_token.srf';
var _liveAccessToken = 'EwCAAq1DBAAUGCCXc8wU/zFu9QnLdZXy%2bYnElFkAASlZvMMpuhIDYumirdlTBwe4HwPWV9qb4pXBqi7nuyDyXVo03v/5exWa817j/Qey4gvlrintx4c3qyoqc7k3fjnbWct%2booE23IjzrLZYL4KDu7xJfWv/j5i%2bzurlA3bpfrqBoEybOdbBs6Ax0o8CJwDZcwrQ8nEpcqFwLna3VWbfOKcOH9h3oFu6GpWkCKo%2bbN/ExSfWKX1svz5plMdlJfYjeQis3jPUktqjF1YGROf3Wn6LMhfS%2b3iMHuTFSoxk4hW5Kudf9h%2bfGg8C8l3/wH242SbCt1/XlXyr5Q2Bm4y04fGucssuES2CPACyzC3ajfQunChP0JmGNiFUBHngKx0DZgAACMZ1Vj1T54aJUAGH60WoIVGlPt5vcdtrNOHA0WoIcKOHt6dBhSBcxqyymj2gPFdPlOdIQPLhxGSp/rqooLnZE7hFWWGJwrvqOpK90gtsDsR3EJZNsaKbs0JiZaUKv5YGpZpBXIIQeh2ep0lOv2/A/qhwlTxKoT0MYoP0JPA0Zw3QXiZHD7Kcq6sn0zpx7dow7gwFmAA01e3DEl5UdDS5gkT2I8beK750PwBtd/cI1hQp8hbuIWcuselrexNGR57MmJfTPCtTIEcln5IJcMa5xCbunT2cFT74omlxSuVP8JVC0LIx7A43oKhlWfRTKL405mUazR9%2b9MFn1Q2PywoKOMFFK9erHgDg0WwWw/%2bSfczPYYr1UurTA3LhP3qRUAnwyUeGBTg3sLbVeRAko0Q2OJp6IOFZ0XhaodjfGRSvKzClDhl2uzhf0Q8mceRnesLOJFRvmyqOTgi%2btcNhAQ%3d%3d'
var _liveEventsUrl = 'https://apis.live.net/v5.0/me/events?access_token=' + _liveAccessToken
var _liveCalendarsUrl = 'https://apis.live.net/v5.0/me/calendars?access_token=' + _liveAccessToken

var _proxyUrl = _rootURL + 'proxy.ashx';

var _isStrava = false;
var _isLive = false;




function init() {

    _timeContainer = $('#clock .time');
    _dayofweekContainer = $('#clock .dayofweek');
    _dateContainer = $('#clock .date');
    _eventsContainer = $('#clock .events');

    _cityContainer = $('#weather .city');
    _currenttempContainer = $('#weather .currenttemp');
    _forecastContainer = $('#weather .forecast');

    _distancecoveredContainer = $('#strava .distancecovered');
    _distancegoalContainer = $('#strava .distancegoal');
    _graphContainer = $('#strava #goal .graph');
    _activityContainer = $('#strava #goal .activity');
    _friendactivityContainer = $('#strava #friendactivity .activity');

    // Setup proxy
    $.ajaxPrefilter(function (options) {
        if (options.crossDomain) {
            var newData = { data: JSON.stringify(options.data), url: options.url };
            options.url = _proxyUrl;
            options.data = $.param(newData);
            options.crossDomain = false;
        }
    });


    initFullPage();
    initOAuth();
    initCalendar();
    initCalendarEvents();
    initWeather();
    initStrava();
}

function initFullPage() {
    $('#fullpage').fullpage({
        loopHorizontal: false,
        slidesNavigation: true,
        slidesNavPosition: 'top',
        controlArrows: true,
        resize: false
    });

    $("body").on("touchmove", function (e) {
        e.preventDefault();
    });
}

function initOAuth() {
    oAuthSetup();
    oAuthResponseCheck();
}

function oAuthSetup() {

    var stravaAccessToken = localStorage.getItem('stravaAccessToken');
    var liveAccessToken = localStorage.getItem('liveAccessToken');
    var stravaUser = localStorage.getItem('stravaUser');

    _isStrava = ((stravaAccessToken != null) ? true : false)
    _isLive = ((liveAccessToken != null) ? true : false)

    if (_isStrava) {
        setOAuthUI('strava', 'Disconnect', _stravaUrlDeAuth, stravaUser)
    } else {
        setOAuthUI('strava', 'Connect', _stravaUrlAuth, null)
    }

    if (_isLive) {
        setOAuthUI('ms', 'Disconnect', _liveUrlAuth, '')
    } else {
        setOAuthUI('ms', 'Connect', _liveUrlAuth, null)
    }

}

function setOAuthUI(provider, status, url, user) {
    var Connected = ((user != null) ? true : false)
    var oAuthLink = $('#settings .connections-list .' + provider + ' a.connect')
    var oAuthInfo = $('#settings .connections-list .' + provider + ' .info')

    oAuthLink.attr('href', url);
    oAuthLink.find("em").html(status);
    if (Connected){
        oAuthInfo.html('Connected as ' + user);
    }
}

function oAuthResponseCheck() {
    console.log(getUrlVars());

    var oAuthProvider = '';
    var state = '';
    var accessToken = '';

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
            localStorage.setItem('liveAccessToken', accesstoken);
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
                    data: { client_id: _stravaClientID, client_secret: _stravaClientSecret, code: code },
                    success: function (data) {
                        console.log(data)
                        localStorage.setItem('stravaAccessToken', data.access_token);
                        localStorage.setItem('stravaUser', data.athlete.email);
                        oAuthSetup();
                        initStrava();
                    },
                    error: function (error) {

                    }
                });
            }
            break;
    }
}

function initCalendar() {
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    //console.log("updateTime");
    var dayofweek = moment().format('d') - 1;
    if (dayofweek < 0) dayofweek = 6;
    _timeContainer.html(moment().format('HH:mm'));
    _dateContainer.html(moment().format('D MMMM'));

    if (_dayofweekContainer.children().length == 0) {
        $.each(_weekdayNames, function () {
            _dayofweekContainer.append(
                $('<li>').append(this)
            );
        });
    }

    _dayofweekContainer.find('li').removeClass('current');
    var currentday = _dayofweekContainer.find('li').eq(dayofweek);
    currentday.addClass('current');
}


/* CALENDAR EVENTS */


function initCalendarEvents() {
    updateCalendarEvents()
    setInterval(updateCalendarEvents, 1200000);
}

function updateCalendarEvents() {
    var url;
    var call;

    url = _liveEventsUrl
    call = $.getJSON(url, onCalendarEventsLoaded);
}

function onCalendarEventsLoaded(data) {
    if (data) {
        //console.log(data.data);

        _eventsContainer.html('');

        var nextevent = data.data[0];
        if (nextevent) {
            var starttime = moment(new Date(nextevent.start_time));
            var endtime = moment(new Date(nextevent.end_time));

            _eventsContainer.append($('<div>').attr('class', 'title').append(nextevent.name));

            var eventInfoContainer = $('<div>').attr('class', 'info');
            if (moment().date != starttime.date) {
                eventInfoContainer.append(starttime.format('D MMMM'));
            }
            if (!nextevent.is_all_day_event) {
                eventInfoContainer.append(' ' + starttime.format('HH:mm') + ' - ' + endtime.format('HH:mm') + ' ');
            }

            if (nextevent.location) {
                eventInfoContainer.append($('<span>').attr('class', 'location').append(nextevent.location));
            }

            _eventsContainer.append(eventInfoContainer);
        }
    }
}

/* WEATHER */

function initWeather() {
    updateWeather()
    setInterval(updateWeather, 1200000);
}

function updateWeather() {
    var url;
    var call;

    url = _weatherUrl + _weatherCity + _weatherParams;
    call = $.getJSON(url, onWeatherLoaded);
}

function onWeatherLoaded(data) {
    if (data) {
        var icon = weatherIcon(data.list[0].weather[0].icon.substr(0, 2));

        _cityContainer.html(data.city.name);
        _currenttempContainer.html(Math.round(data.list[0].temp.day) + '°');
        _currenttempContainer.append(' <i class="wi ' + icon + '"></i>')
        _forecastContainer.html('');

        $.each(data.list, function () {
            var forecastday = moment(new Date(this.dt * 1000));
            var dayofweek = forecastday.format('d') - 1;
            var forecasticon = weatherIcon(this.weather[0].icon.substr(0, 2));

            if (dayofweek < 0) dayofweek = 6;

            _forecastContainer.append(
                $('<li>').append(
                    $('<span>').append(_weekdayNames[dayofweek])).append(
                    $('<span>').attr('class', 'forecasttemp').append(
                    $(' <i class="wi ' + forecasticon + '"></i>')).append(
                    Math.round(this.temp.day) + '°')
            ));
        });
    }
}

function weatherIcon(feedicon) {
    var icon;
    switch (feedicon) {
        case '01': //Clear Sky
            icon = 'wi-day-sunny';
            break;
        case '02': //few clouds
            icon = 'wi-day-sunny-overcast';
            break;
        case '03': //scattered clouds
            icon = 'wi-day-cloudy';
            break;
        case '04': //broken clouds
            icon = 'wi-cloudy';
            break;
        case '10': //shower rain
            icon = 'wi-showers';
            break;
        case '11': //thunderstorms
            icon = 'wi-thunderstorm'
            break;
        case '13': //snow
            icon = 'wi-snow';
            break;
        case '50': //mist
            icon = 'wi-fog';
            break;
    }
    return icon;
}


/* STRAVA */


function initStrava() {
    updateStrava()
    setInterval(updateStrava, 1200000);
}

function updateStrava() {

    // init only if we have an authtoken
    //console.log(stravaAccessToken);

    if (_isStrava) {
        var stravaAccessToken = localStorage.getItem('stravaAccessToken');

        // Pull current user
        var stravauser;
        $.getJSON('https://www.strava.com/api/v3/athlete?access_token=' + stravaAccessToken + '&callback=?', function (data) {
            stravauser = data;

            // Once current user is pulled, pull latest 2 activities
            $.getJSON('https://www.strava.com/api/v3/athlete/activities?per_page=2&access_token=' + stravaAccessToken + '&callback=?', function (data) {
                _activityContainer.html('');
                $.each(data, function () {
                    _activityContainer.append(
                        $('<div>').attr('class', 'item clearfix')
                            .append(
                            $('<div>').attr('class', 'type')
                                .append($('<i>').attr('class', 'icon-' + ((this.type == 'Ride') ? 'cycle' : 'run')))
                            ).append(
                            $('<div>').attr('class', 'title').append(this.name)).append(
                            $('<ul>').attr('class', 'info clearfix').append(
                            $('<li>').append(stravauser.firstname + ' ' + stravauser.lastname)).append(
                            $('<li>').append(Math.round((this.distance * _distanceConversion) * 10) / 10
                            ).append($('<span>').append('mi'))).append(
                            $('<li>').append(Math.round((this.total_elevation_gain * _climbConversion) * 10) / 10
                            ).append($('<span>').append('ft'))).append(
                            $('<li>').append(Math.round((this.average_speed * _speedConversion) * 10) / 10
                            ).append($('<span>').append('mph'))).append(
                            $('<li>').append($('<i>').attr('class', 'fa fa-trophy')).append(this.achievement_count)
                        )));
                });
            });

        });

        var begin = moment().isoWeekday(1).startOf('isoweek');
        var startofweek = Math.floor(begin.valueOf() / 1000);

        // Pull current week activities 
        $.getJSON('https://www.strava.com/api/v3/athlete/activities?after=' + startofweek + '&access_token=' + stravaAccessToken + '&callback=?', function (data) {

            _distancecoveredContainer.html('');
            _distancegoalContainer.html('');


            // Calculate total distance covered (strava reports in m, convert to miles)
            var distancecovered = 0;
            $.each(data, function () {
                distancecovered += this.distance;
            });

            distancecovered = distancecovered * _distanceConversion;
            _distancecoveredContainer.append(Math.round(distancecovered * 10) / 10).append($('<span>').append('mi'));
            _distancegoalContainer.append(Math.round(_distanceGoal)).append($('<span>').append('mi'));

            var percent = (100 / _distanceGoal) * distancecovered;
            if (percent > 100) percent = 100;

            _graphContainer.find('.value').animate({ 'width': percent + '%' }, 2000)
        });

        // Pull friends activity feed
        $.getJSON('https://www.strava.com/api/v3/activities/following?per_page=5&access_token=' + stravaAccessToken + '&callback=?', function (data) {
            //console.log(data);
            _friendactivityContainer.html('');
            $.each(data, function () {
                _friendactivityContainer.append(
                    $('<div>').attr('class', 'item clearfix').append(
                        $('<div>').attr('class', 'type')
                            .append($('<i>').attr('class', 'icon-' + ((this.type == 'Ride') ? 'cycle' : 'run')))
                        ).append(
                        $('<div>').attr('class', 'title').append(this.name)).append(
                        $('<ul>').attr('class', 'info clearfix').append(
                        $('<li>').append(this.athlete.firstname + ' ' + this.athlete.lastname)).append(
                        $('<li>').append(Math.round((this.distance * _distanceConversion) * 10) / 10
                        ).append($('<span>').append('mi'))).append(
                        $('<li>').append(Math.round((this.total_elevation_gain * _climbConversion) * 10) / 10
                        ).append($('<span>').append('ft'))).append(
                        $('<li>').append(Math.round((this.average_speed * _speedConversion) * 10) / 10
                        ).append($('<span>').append('mph'))).append(
                        $('<li>').append($('<i>').attr('class', 'fa fa-trophy')).append(this.achievement_count)
                    )));
            });
        });
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