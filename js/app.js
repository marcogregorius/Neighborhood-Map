var stations = [
	// {title: 'Marina South Pier MRT', location: {}},
	// {title: 'Marina Bay MRT', location: {}},
	// {title: 'Raffles Place MRT', location: {}},
	// {title: 'City Hall MRT', location: {}},
	// {title: 'Dhoby Ghaut MRT', location: {}},
	// {title: 'Somerset MRT', location: {}},
	// {title: 'Orchard MRT', location: {}},
	{title: 'Newton MRT', location: {lat: 1.3136071, lng: 103.83781099999999}},
	{title: 'Novena MRT', location: {lat: 1.3204301, lng: 103.84381810000002}},
	{title: 'Toa Payoh MRT', location: {lat: 1.3326911, lng: 103.84707849999995}},
	{title: 'Braddell MRT', location: {lat: 1.3404334, lng: 103.84680129999992}},
	{title: 'Bishan MRT', location: {lat: 1.3513087, lng: 103.84915439999997}},
	// {title: 'Ang Mo Kio MRT', location: {}},
	// {title: 'Yio Chu Kang MRT', location: {}},
	// {title: 'Khatib MRT', location: {}},
	// {title: 'Yishun MRT', location: {}},
	// {title: 'Sembawang MRT', location: {}},
	// {title: 'Admiralty MRT', location: {}},
	// {title: 'Woodlands MRT', location: {}},
	// {title: 'Marsiling MRT', location: {}},
	// {title: 'Kranji MRT', location: {}},
	// {title: 'Yew Tee MRT', location: {}},
	// {title: 'Choa Chu Kang MRT', location: {}},
	// {title: 'Bukit Gombak MRT', location: {}},
	// {title: 'Bukit Batok MRT', location: {}},
	// {title: 'Jurong East MRT', location: {}},
];

var Station = function(data) {
	this.title = ko.observable(data.title);
	this.location = ko.observable(data.location);
}

var viewModel = function() {
	var self = this;
	this.stationsList = ko.observableArray([]);
	this.currentStation = ko.observable();

	// Pushing each station as a Station object inside Observable Array stationsList.
	stations.forEach(function(stationItem) {
		self.stationsList.push(new Station(stationItem));
	});

	this.setCurrentStation = function(selectedStation) {
		self.currentStation(selectedStation);
	}

};

// Loading Google Maps with initMap() function centered at Bishan, Singapore.
function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 13,
	  center: {lat: 1.3553851, lng: 103.8477347}
	});
	// var geocoder = new google.maps.Geocoder();
	var markers = [];

	// Loop through stations array and add marker to each stations then storing to markers array.
	for (var i = 0; i < stations.length; i++) {
		var station = stations[i].title;
		// geocodeStation(geocoder, station);
		var position = stations[i].location;
		var marker = new google.maps.Marker({
			position: position,
			title: station,
            animation: google.maps.Animation.DROP,
		});
		markers.push(marker);
		markers[i].setMap(map);

		var infowindow = new google.maps.InfoWindow({
			content: station
		});

		marker.addListener('click', function() {
			populateInfoWindow(this, infowindow);
		})
	}

function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		infowindow.setContent(marker.title);
		infowindow.open(map, marker);
		//Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function() {
			infowindow.setMarker = null;
		});
	}
}

	// Function to geocode by station name and store the lat lng in the stations array.
	// function geocodeStation (geocoder, station) {
	// 	geocoder.geocode({'address': station}, function(results, status) {
	// 		if (status == 'OK') {
	// 			var filteredStation = stations.filter(function (element) {
	// 				return element.title == station;
	// 			});
	// 			var lat = results[0].geometry.location.lat();
	// 			var lng = results[0].geometry.location.lng();
	// 			filteredStation[0].location.lat = lat;
	// 			filteredStation[0].location.lng = lng;
	// 			// filteredStation[0].location = results[0].geometry.location;
	// 		} else {
	// 			console.log('Could not geocode station ' + station + ' ' + status);
	// 		}
	// 	});
	// }
}

ko.applyBindings (new viewModel());