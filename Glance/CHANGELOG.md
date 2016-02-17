# Change Log

All notable changes to this project will be documented in this file.

##17/02/2016

General
- Started a CHANGELOG.md
- Added d3.js
- Added d3radial.js 
- Updated moment.js 

Index.html
- New test screen for MicrosoftHealth

Base.js
- General refactoring code.
- All sensitive variables moved to class initiation.

OAuth.js
- refreshToken(), validToken() added for fuller Oauth 2.0 compliance.
- hasToken() modified with callback to handle refreshToken/validToken.
- _responseCheck() modified for microsofthealth response.

Strava.js
- Updated for OAuth hasToken changes.

MicrosoftHealth.js
- First version of mscloud api integration.