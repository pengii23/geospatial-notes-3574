Titanium.UI.setBackgroundColor('#ffffff');

var gn = gn || {};
Ti.include('ui.js');
Ti.include('geolocation.js');
Ti.include('locations.js');

Titanium.Facebook.appid = '166092423474222';
Titanium.Facebook.permissions = ['read_stream', 'manage_pages'];
Titanium.Facebook.addEventListener('login', function(e) {
	if(e.success) {
		alert('Logged in');
	}
});

Titanium.Facebook.addEventListener('logout', function(e) {
	alert('Logged out');
});
var wins = gn.ui.createWelcomeScreen();
wins.open();