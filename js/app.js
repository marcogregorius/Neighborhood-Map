// Loading Google Maps with initMap() function centered at Newton, Singapore.
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 13,
	  center: {lat: 1.3136071, lng: 103.83781099999999}
	});
	var markers = [];

	// Loop through stations array and add marker to each stations then storing to markers array.
	for (var i = 0; i < stations.length; i++) {
		var station = stations[i].title;
		var position = stations[i].location;
		var marker = new google.maps.Marker({
			position: position,
			title: station,
            animation: google.maps.Animation.DROP,
            map: map
		});
		markers.push(marker);
		stations[i].marker = marker;

		// Create infowindow for each station
		var infowindow = new google.maps.InfoWindow({
			content: station,
			maxWidth: 200
		});
		stations[i].infowindow = infowindow;


		// Add click listener for each marker. Clicking a marker will force close other infowindows and populate the selected infowindow.
		marker.addListener('click', function() {
			stations.forEach(function(station) {
				station.infowindow.close();
				station.marker.setAnimation(null);
			});
			populateInfoWindow(this, infowindow);
			bounceMarker(this);
			map.panTo(position);
		});
	}
	ko.applyBindings (new viewModel());
}


function googleError() {
	alert("Google Maps is not loaded properly. Please check your internet connection.");
}


function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;

		infowindow.setContent();

		// AJAX request to load Wikipedia API for station's detail and URL to Wikipedia page.
		function wikiLoad(stationStr) {
		    var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" +
						  stationStr +
						  "&limit=1&format=json&namespace=0&callback=?";

		    $.ajax({
		        url: wikiUrl,
		        dataType: "json",
		    }).done(function(data){
				var result = {
					title : data[1][0],
					snippet : data[2][0],
					web_url : data[3][0]
				};
				infowindow.setContent("<a href='" + result.web_url + "' class='infowindow' target='_blank'>" + 
									  marker.title + "</a><p><div class='snippet'>" +
									  result.snippet + "</div></p>" +
									  "<p><i>Source: <a href='https://www.mediawiki.org/wiki/API:Main_page' target='_blank'>" +
									  "Wikipedia API</a></i></p>");
		    }).fail(function(error){
		    	infowindow.setContent("Failed to get wikipedia resources on " + stationStr);
		    });
		}
		wikiLoad(marker.title);

		//Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function() {
			infowindow.setMarker = null;
			marker.setAnimation(null);
		});
	}
	infowindow.open(map, marker);
}


function bounceMarker(marker) {
	marker.setAnimation(google.maps.Animation.BOUNCE);
}

var stations = [
	{title: 'Raffles Place MRT', location: {lat: 1.2830173, lng: 103.8513365}, visible: true},
	{title: 'City Hall MRT', location: {lat: 1.2930893, lng: 103.8519267}, visible: true},
	{title: 'Dhoby Ghaut MRT', location: {lat: 1.2993651, lng: 103.8454843}, visible: true},
	{title: 'Somerset MRT', location: {lat: 1.3005915, lng: 103.838529}, visible: true},
	{title: 'Orchard MRT', location: {lat: 1.3045879, lng: 103.8319307}, visible: true},
	{title: 'Newton MRT', location: {lat: 1.3136071, lng: 103.83781099999999}, visible: true},
	{title: 'Novena MRT', location: {lat: 1.3204301, lng: 103.84381810000002}, visible: true},
	{title: 'Toa Payoh MRT', location: {lat: 1.3326911, lng: 103.84707849999995}, visible: true},
	{title: 'Braddell MRT', location: {lat: 1.3404334, lng: 103.84680129999992}, visible: true},
	{title: 'Bishan MRT', location: {lat: 1.3513087, lng: 103.84915439999997}, visible: true}
];

var Station = function(data) {
	this.title = ko.observable(data.title);
	this.location = ko.observable(data.location);
	this.marker = ko.observable(data.marker);
	this.infowindow = ko.observable(data.infowindow);
	this.visible = ko.observable(data.visible);
};

var viewModel = function() {
	// View Model to render the database from stations as observable array and other observables.
	var self = this;
	self.stationsList = ko.observableArray([]);

	// Pushing each station as a Station object inside Observable Array stationsList.
	stations.forEach(function(stationItem) {
		self.stationsList.push(new Station(stationItem));
	});

	self.currentStation = ko.observable();

	// When selecting a station (clicking from list on sidebar), currentStation observable is set accordingly.
	// Selecting the station from sidebar also closes all other stations infowindow and animation.
	self.setCurrentStation = function(selectedStation) {
		self.currentStation(selectedStation);
		self.stationsList().forEach(function(station) {
			station.infowindow().close();
			station.marker().setAnimation(null);
		});

		// Pan the map to center on the currentStation location.
		// Populate the infowindow of current station.
		// Add bounce animation to the marker.
		map.panTo(self.currentStation().location());
		populateInfoWindow(self.currentStation().marker(), self.currentStation().infowindow());
		bounceMarker(self.currentStation().marker());
	};

	//

	self.isActive = ko.observable(false);
	self.toggleActive = function(data, event) {
		self.isActive(!self.isActive());
	};


	// Query function from the search bar. Provides live search feature to filter the stations while typing.
	self.query = ko.observable('');
	self.filterStations = ko.computed(function () {
		var search = self.query().toLowerCase();
		return ko.utils.arrayFilter(self.stationsList(), function (station) {
			return station.title().toLowerCase().indexOf(search) >= 0;
		});
	});


	self.searchStationOnEnter = ko.observable();

	// Subscribe searchStationOnEnter to showFiltered function to filter the markers on key up event.
	self.searchStationOnEnter.subscribe(function(text){
		showFiltered(text);
	})

	self.filterOnEnter = function() {
		showFiltered(self.searchStationOnEnter());
	}

	function showFiltered(text) {
	self.stationsList().forEach(function(station) {
		if (!text || station.title().toLowerCase().startsWith(text.toLowerCase())) {
			station.visible(true);
			station.marker().setMap(map);
		} else {
			station.visible(false);
			station.marker().setMap(null);
		}
		station.infowindow().close();
	});
}


	// function showFiltered(text) {
	// 	self.stationsList().forEach(function(station) {
	// 		if (!text || station.title().toLowerCase().includes(text.toLowerCase())) {
	// 			station.visible(true);
	// 			station.marker().setMap(map);
	// 		} else {
	// 			station.visible(false);
	// 			station.marker().setMap(null);
	// 		}
	// 		station.infowindow().close();
	// 	});
	// }
};

// Event listener for hamburger menu to toggle sidebar
$(document).ready(function () {
	$(".toggle-sidebar").click(function () {
		$("#sidebar").toggleClass("collapsed");
		$("#content").toggleClass("col-md-12 col-md-9");
		return false;
	});
});


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