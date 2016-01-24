// Glance: base.js

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


var _rootURL = window.location.protocol + "//" + window.location.host + window.location.pathname;

var _instagramUrlAuth = "https://api.instagram.com/v1/users/self/feed?access_token=";
var _instagramUrlFeed = "https://instagram.com/oauth/authorize/?client_id=274a865a47ee44bda36c89f24bf8dfc3&redirect_uri=http://instagram.demodern.de/&response_type=token";

var _outlookClientID = 'e20a36de-5ef2-48f4-a52b-e485b670aab3';
var _outlookClientSecret = 'XXTahVHPfTXhqnuRV6rv13k';
var _outlookUrlAuth = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=' + _outlookClientID + '&response_type=code&redirect_uri=' + encodeURIComponent(_rootURL + '?state=outlookoauth') + '&scope=https://outlook.office.com/Calendars.Read';
var _outlookUrlToken = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

//console.log(_outlookUrlAuth);

var _liveClientID = '000000004413FC1B'
var _liveClientSecret = 'JV1trf9QoSC76dnCSeqv7nQN5H9pXP0D'
var _liveUrlAuth = 'https://login.live.com/oauth20_authorize.srf?client_id=' + _liveClientID + '&scope=wl.basic%20wl.contacts_birthday%20wl.calendars&response_type=code&redirect_uri=' + encodeURIComponent(_rootURL + '?state=liveoauth');
var _liveUrlToken = 'https://login.live.com/oauth20_token.srf';
var _liveUrlRefresh = 'https://login.live.com/oauth20_token.srf';
var _liveAccessToken = 'EwCAAq1DBAAUGCCXc8wU/zFu9QnLdZXy%2bYnElFkAASlZvMMpuhIDYumirdlTBwe4HwPWV9qb4pXBqi7nuyDyXVo03v/5exWa817j/Qey4gvlrintx4c3qyoqc7k3fjnbWct%2booE23IjzrLZYL4KDu7xJfWv/j5i%2bzurlA3bpfrqBoEybOdbBs6Ax0o8CJwDZcwrQ8nEpcqFwLna3VWbfOKcOH9h3oFu6GpWkCKo%2bbN/ExSfWKX1svz5plMdlJfYjeQis3jPUktqjF1YGROf3Wn6LMhfS%2b3iMHuTFSoxk4hW5Kudf9h%2bfGg8C8l3/wH242SbCt1/XlXyr5Q2Bm4y04fGucssuES2CPACyzC3ajfQunChP0JmGNiFUBHngKx0DZgAACMZ1Vj1T54aJUAGH60WoIVGlPt5vcdtrNOHA0WoIcKOHt6dBhSBcxqyymj2gPFdPlOdIQPLhxGSp/rqooLnZE7hFWWGJwrvqOpK90gtsDsR3EJZNsaKbs0JiZaUKv5YGpZpBXIIQeh2ep0lOv2/A/qhwlTxKoT0MYoP0JPA0Zw3QXiZHD7Kcq6sn0zpx7dow7gwFmAA01e3DEl5UdDS5gkT2I8beK750PwBtd/cI1hQp8hbuIWcuselrexNGR57MmJfTPCtTIEcln5IJcMa5xCbunT2cFT74omlxSuVP8JVC0LIx7A43oKhlWfRTKL405mUazR9%2b9MFn1Q2PywoKOMFFK9erHgDg0WwWw/%2bSfczPYYr1UurTA3LhP3qRUAnwyUeGBTg3sLbVeRAko0Q2OJp6IOFZ0XhaodjfGRSvKzClDhl2uzhf0Q8mceRnesLOJFRvmyqOTgi%2btcNhAQ%3d%3d'
var _liveEventsUrl = 'https://apis.live.net/v5.0/me/events?access_token=' + _liveAccessToken
var _liveCalendarsUrl = 'https://apis.live.net/v5.0/me/calendars?access_token=' + _liveAccessToken

var _proxyUrl = _rootURL + 'proxy.ashx';

function init() {

    _timeContainer = $('.clock .time');
    _dayofweekContainer = $('.clock .dayofweek');
    _dateContainer = $('.clock .date');
    _eventsContainer = $('.clock .events');

    _cityContainer = $('.weather .city');
    _currenttempContainer = $('.weather .currenttemp');
    _forecastContainer = $('.weather .forecast');





    initFullPage();
    

    _strava = new Strava();
    _plex = new Plex();


    initCalendar();
    initCalendarEvents();
    initWeather();
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


