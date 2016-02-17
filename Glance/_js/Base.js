/* BASE */

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

var _weatherAppID = '1f82bd22c38c07f1d13e8d3664eb2dee'
var _weatherUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily?appid=' + _weatherAppID +'&q=';
var _weatherParams = '&mode=json&units=metric&cnt=5'
var _weatherCity = 'southampton,uk';
var _weekdayNames = 'MON TUE WED THU FRI SAT SUN'.split(' ');


var _instagramUrlAuth = "https://api.instagram.com/v1/users/self/feed?access_token=";
var _instagramUrlFeed = "https://instagram.com/oauth/authorize/?client_id=274a865a47ee44bda36c89f24bf8dfc3&redirect_uri=http://instagram.demodern.de/&response_type=token";

var _rootURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
var _proxyUrl = _rootURL + 'proxy.ashx';

function init() {
    $.ajaxPrefilter(function (opts) {
        if (opts.crossDomain) {
            var newData = { data: JSON.stringify(opts.data), url: opts.url };
            opts.url = _proxyUrl;
            opts.data = $.param(newData);
            opts.crossDomain = false;
        }
    });

    _timeContainer = $('.clock .time');
    _dayofweekContainer = $('.clock .dayofweek');
    _dateContainer = $('.clock .date');
    _eventsContainer = $('.clock .events');

    _cityContainer = $('.weather .city');
    _currenttempContainer = $('.weather .currenttemp');
    _forecastContainer = $('.weather .forecast');

    initFullPage();
    
    _strava = new Strava({
        clientId: '',
        clientSecret: '',
    });

    _plex = new Plex({
        username: '',
        password: ''
    });

    _microsofthealth = new MicrosoftHealth({
        clientId: '',
        clientSecret: '',
    });

    initCalendar();
    //initCalendarEvents();
    initWeather();
    initSettings();
}

function initSettings() {
    options = {
        labels_placement: "right",
        width: 50,
        height: 20,
        button_width: 25
    };
    $(".switch-wrapper input").switchButton(options);
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
    if (data.data) {
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
    //console.log(url);
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


