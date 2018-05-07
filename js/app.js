// Loading Google Maps with initMap() function centered at Bishan, Singapore.
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
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
		stations[i]["marker"] = marker;

		var infowindow = new google.maps.InfoWindow({
			content: station
		});
		stations[i]["infowindow"] = infowindow;

		marker.addListener('click', function() {
			stations.forEach(function(station) {
				station.infowindow.close();
			})

			populateInfoWindow(this, infowindow);
		});
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

					infowindow.setContent("<h2><a href='" + result.web_url + "' class='infowindow'>" + marker.title + "</a></h2><div class='snippet'>"
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
	var self = this;
	this.stationsList = ko.observableArray([]);

	// Pushing each station as a Station object inside Observable Array stationsList.
	stations.forEach(function(stationItem) {
		self.stationsList.push(new Station(stationItem));
	});

	this.currentStation = ko.observable();
	this.setCurrentStation = function(selectedStation) {
		self.currentStation(selectedStation);
		self.stationsList().forEach(function(station) {
			station.infowindow().close();
			station.marker().setAnimation(null);
		})
		populateInfoWindow(self.currentStation().marker(), self.currentStation().infowindow());
		bounceMarker(self.currentStation().marker());
	}

	self.isActive = ko.observable(false);
	self.toggleActive = function(data, event) {
		self.isActive(!self.isActive());
	}

	this.searchStation = ko.observable();
	this.filter = function() {
		showFiltered(self.searchStation());
	}

	function showFiltered(text) {
		self.stationsList().forEach(function(station) {
			if (station.title().includes(text)) {
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

// Yelp Client ID vslfdAH0hGr7fdYhTL1O0g
// Yelp's API Key ZatjQF3FkjBZ-Qp5dQ809p5-1ESSl1ruNJTVMwdX3rge3Xyx_cMxBCcv60E0M8sPKAAnevgNdRM2WeVwFk4bPTn5dAZBf0VBvhStApwiNx1ccTbY_xA0GXw1VLfmWnYx



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
