// Loading Google Maps with initMap() function centered at Bishan, Singapore.
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 13,
	  center: {lat: 1.3553851, lng: 103.8477347}
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
		});
		markers.push(marker);
		markers[i].setMap(map);
		stations[i]["marker"] = marker;

		// Create infowindow for each station
		var infowindow = new google.maps.InfoWindow({
			content: station
		});
		stations[i]["infowindow"] = infowindow;


		// Add click listener for each marker. Clicking a marker will force close other infowindows and populate the selected infowindow.
		marker.addListener('click', function() {
			stations.forEach(function(station) {
				station.infowindow.close();
			})

			populateInfoWindow(this, infowindow);
		});

		// Add click listener for bounce animation for each marker. Clicking a marker will nullify the animation of other markers.
		marker.addListener('click', function() {
			stations.forEach(function(station) {
				station.marker.setAnimation(null)
			})
			bounceMarker(this);
		})
	}
	ko.applyBindings (new viewModel());
}


function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;

		infowindow.setContent();

		function wikiLoad(stationStr) {
			// AJAX request to load Wikipedia API for station's detail and URL to Wikipedia page.
		    var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + stationStr + "&limit=1&format=json&namespace=0&callback=?";

		    var wikiRequestTimeout = setTimeout(function(){
		    	infowindow.setContent("Failed to get wikipedia resources on " + stationStr)
		    }, 8000);

		    $.ajax({
		        url: wikiUrl,
		        dataType: "json",
		        success: function(data){
		        	var result = {
		        		title : data[1][0],
		        		snippet : data[2][0],
		        		web_url : data[3][0]
		        	};
					infowindow.setContent("<a href='" + result.web_url + "' class='infowindow'>" + marker.title + "</a><div class='snippet'>"
											+ result.snippet + "</div>");
		            clearTimeout(wikiRequestTimeout);
		        }
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
	// {title: 'Marina South Pier MRT', location: {}},
	// {title: 'Marina Bay MRT', location: {}},
	// {title: 'Raffles Place MRT', location: {}},
	// {title: 'City Hall MRT', location: {}},
	// {title: 'Dhoby Ghaut MRT', location: {}},
	// {title: 'Somerset MRT', location: {}},
	// {title: 'Orchard MRT', location: {}},
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
}

var viewModel = function() {
	// View Model to render the database from stations as observable array and other observables.
	var self = this;
	this.stationsList = ko.observableArray([]);

	// Pushing each station as a Station object inside Observable Array stationsList.
	stations.forEach(function(stationItem) {
		self.stationsList.push(new Station(stationItem));
	});

	this.currentStation = ko.observable();

	// When selecting a station (clicking from list on sidebar), currentStation observable is set accordingly.
	// Selecting the station from sidebar also closes all other stations infowindow and animation.
	this.setCurrentStation = function(selectedStation) {
		self.currentStation(selectedStation);
		self.stationsList().forEach(function(station) {
			station.infowindow().close();
			station.marker().setAnimation(null);
		})

		// Pan the map to center on the currentStation location.
		// Populate the infowindow of current station.
		// Add bounce animation to the marker.
		map.panTo(self.currentStation().location());
		populateInfoWindow(self.currentStation().marker(), self.currentStation().infowindow());
		bounceMarker(self.currentStation().marker());
	}

	//

	self.isActive = ko.observable(false);
	self.toggleActive = function(data, event) {
		self.isActive(!self.isActive());
	};


	// Query function from the search bar. Provides live search feature to filter the stations while typing.
	this.query = ko.observable('')
	this.filterStations = ko.computed(function () {
		var search = self.query().toLowerCase();
		return ko.utils.arrayFilter(self.stationsList(), function (station) {
			return station.title().toLowerCase().indexOf(search) >= 0;
		});
	});

	// Search function when user presses enter. 
	this.searchStationOnEnter = ko.observable();
	this.filterOnEnter = function() {
		showFiltered(self.searchStationOnEnter());
	}

	function showFiltered(text) {
		self.stationsList().forEach(function(station) {
			if (station.title().toLowerCase().includes(text.toLowerCase())) {
				station.visible(true);
				station.marker().setMap(map);
			} else {
				station.visible(false);
				station.marker().setMap(null);
			}
			station.infowindow().close();
		})
	}
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
