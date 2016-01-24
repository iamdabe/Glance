
function helloworld() {
    alert('call me back, yo');
};

function goodbyworld() {
    //alert('good bye');
};

/* STRAVA */
var Strava = function (opts) {
    this._oauth = {};
    this.options = {};
    this.options = $.extend({
        container: $('#strava'),
        urlRoot: window.location.protocol + "//" + window.location.host + window.location.pathname,
        distanceConversion: 0.000621371192, //miles
        speedConversion: 2.23693629, //mph
        climbConversion: 3.2808399, //ft
        distanceGoal: 50, //goal
        clientID: 940, // strava API clientID
        clientSecret: 'dfb6c3a088f6e6ffa88ddb14501b3e9f64014c97',
        urlAuth: 'https://www.strava.com/oauth/authorize?client_id=940&response_type=code&redirect_uri=' + window.location.protocol + "//" + window.location.host + window.location.pathname + '&state=stravaoauth&approval_prompt=force',
        urlToken: 'https://www.strava.com/oauth/token',
        urlDeAuth: 'https://www.strava.com/oauth/deauthorize'
    }, opts);

    this.container = this.options.container;
    this.init();
};

Strava.prototype.init = function () {
    var self = this;
    var options = self.options;

    this._oauth = new OAuth({
        provider: {
            providerID: 'strava',
            clientID: options.clientID,
            clientSecret: options.clientSecret,
            callback: self.update(),
            tokenStorage: 'stravaAccessToken',
            urlAuth: options.urlAuth,
            urlToken: options.urlToken,
            deAuthCallback: goodbyworld,
            displayNameStorage: 'stravaUser'
        }
    });

    this._interval = setInterval(this.update(), 1200000);
};

Strava.prototype.update = function () {
    var self = this;
    var container = self.container;
    var options = self.options;

    var activityContainer = container.find('.goal .activity');
    var distanceCoveredContainer = container.find('.distancecovered');
    var distancegoalContainer = container.find('.distancegoal');
    var graphContainer = container.find('.goal .graph');
    var friendactivityContainer = container.find('.friendactivity .activity');

    if (this._oauth.hasToken) {

        // Pull current user
        var stravauser;
        $.getJSON('https://www.strava.com/api/v3/athlete?access_token=' + self._oauth.token() + '&callback=?', function (data) {
            stravauser = data;

            // Once current user is pulled, pull latest 2 activities
            $.getJSON('https://www.strava.com/api/v3/athlete/activities?per_page=2&access_token=' + self._oauth.token() + '&callback=?', function (data) {
                activityContainer.html('');
                $.each(data, function () {

                    activityContainer.append(
                        $('<div>').attr('class', 'item clearfix')
                            .append(
                            $('<div>').attr('class', 'type')
                                .append($('<i>').attr('class', 'icon-' + ((this.type == 'Ride') ? 'cycle' : 'run')))
                            ).append(
                            $('<div>').attr('class', 'title').append(this.name)).append(
                            $('<ul>').attr('class', 'info clearfix').append(
                            $('<li>').append(stravauser.firstname + ' ' + stravauser.lastname)).append(
                            $('<li>').append(Math.round((this.distance * options.distanceConversion) * 10) / 10
                            ).append($('<span>').append('mi'))).append(
                            $('<li>').append(Math.round((this.total_elevation_gain * options.climbConversion) * 10) / 10
                            ).append($('<span>').append('ft'))).append(
                            $('<li>').append(Math.round((this.average_speed * options.speedConversion) * 10) / 10
                            ).append($('<span>').append('mph'))).append(
                            $('<li>').append($('<i>').attr('class', 'fa fa-trophy')).append(this.achievement_count)
                        )));
                });
            });

        });

        var begin = moment().isoWeekday(1).startOf('isoweek');
        var startofweek = Math.floor(begin.valueOf() / 1000);

        // Pull current week activities 
        $.getJSON('https://www.strava.com/api/v3/athlete/activities?after=' + startofweek + '&access_token=' + self._oauth.token() + '&callback=?', function (data) {

            distanceCoveredContainer.html('');
            distancegoalContainer.html('');

            // Calculate total distance covered (strava reports in m, convert to miles)
            var distancecovered = 0;
            $.each(data, function () {
                distancecovered += this.distance;
            });

            distancecovered = distancecovered * options.distanceConversion;
            distanceCoveredContainer.append(Math.round(distancecovered * 10) / 10).append($('<span>').append('mi'));
            distancegoalContainer.append(Math.round(options.distanceGoal)).append($('<span>').append('mi'));

            var percent = (100 / options.distanceGoal) * distancecovered;
            if (percent > 100) percent = 100;

            graphContainer.find('.value').animate({ 'width': percent + '%' }, 2000)
        });

        // Pull friends activity feed
        $.getJSON('https://www.strava.com/api/v3/activities/following?per_page=5&access_token=' + self._oauth.token() + '&callback=?', function (data) {
            //console.log(data);
            friendactivityContainer.html('');
            $.each(data, function () {
                friendactivityContainer.append(
                    $('<div>').attr('class', 'item clearfix').append(
                        $('<div>').attr('class', 'type')
                            .append($('<i>').attr('class', 'icon-' + ((this.type == 'Ride') ? 'cycle' : 'run')))
                        ).append(
                        $('<div>').attr('class', 'title').append(this.name)).append(
                        $('<ul>').attr('class', 'info clearfix').append(
                        $('<li>').append(this.athlete.firstname + ' ' + this.athlete.lastname)).append(
                        $('<li>').append(Math.round((this.distance * options.distanceConversion) * 10) / 10
                        ).append($('<span>').append('mi'))).append(
                        $('<li>').append(Math.round((this.total_elevation_gain * options.climbConversion) * 10) / 10
                        ).append($('<span>').append('ft'))).append(
                        $('<li>').append(Math.round((this.average_speed * options.speedConversion) * 10) / 10
                        ).append($('<span>').append('mph'))).append(
                        $('<li>').append($('<i>').attr('class', 'fa fa-trophy')).append(this.achievement_count)
                    )));
            });
        });
    }
};