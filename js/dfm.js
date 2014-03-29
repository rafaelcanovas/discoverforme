var shuffleArray = function (array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
};

var dfm = (function ($) {
	'use strict';

	var apiURL = 'http://ws.audioscrobbler.com/2.0/',
		apiKey = 'eb6dc9b732732664bb179c33cb94ab36',
		limit = 100;

	var drawSimilar = function (data, canvas) {
		if (data.error) return;

		// Ensure canvas is empty
		canvas.empty();

		var artists = data.similarartists.artist;

		artists.forEach(function (a) {
			var elem = $('<a>'),
				name = $('<span>'),
				img = new Image(),
				imgUrl = a.image[4]['#text'];

			if (!imgUrl)
				return;

			name.text(a.name)
				.appendTo(elem);

			elem.addClass('thumbnail')
				.attr('href', '//' + a.url)
				.attr('target', '_blank')
				.appendTo(canvas);

			img.src = imgUrl;
			img.onload = function () {
				elem.css('background-image', 'url('+img.src+')')
					.addClass('loaded');
			};
			img.onerror = function () {
				elem.destroy();
			};
		});
	};

	var querySimilar = function (artist, cb) {
		$.getJSON(apiURL, {
			api_key: apiKey,
			method: 'artist.getsimilar',
			format: 'json',
			artist: artist,
			limit: limit,
			autocorrect: true
		}, function (data) {
			cb(data);
		});
	};

	return {
		querySimilar: querySimilar,
		drawSimilar: drawSimilar
	};

}(jQuery));

$(document).ready(function () {
	'use strict';

	var searchForm = $('#search-form'),
		searchInput = searchForm.find('input[type=search]'),
		artistsCanvas = $('#artists'),
		help = $('#help');

	var artists = [
		'Pink Floyd', 'Alborosie', 'Arctic Monkeys', 'Beastie Boys', 'Dire Straits',
		'Gorillaz', 'Dub FX', 'Gotye', 'Gramatik', 'John Coltrane', 'Miles Davis',
		'The Beatles', 'The Strokes', 'The Doors', 'Siriusmo', 'Elvis Presley',
		'Bob Dylan', 'Michael Jackson', 'Led Zeppelin', 'Black Sabbath', 'Jimi Hendrix',
		'Franz Ferdinand', 'Modeselektor'
	];

	artists = shuffleArray(artists);
	var artistsString = artists[0] + ', ' + artists[1] + ' or ' + artists[2];
	searchInput.attr('placeholder', artistsString);

	function toggleLoading() {
		artistsCanvas.toggleClass('loading');
	}

	function hideHelp() {
		help.addClass('hidden');
	}

	searchForm.on('submit', function (e) {
		e.preventDefault();

		hideHelp();
		toggleLoading();
		location.hash = this.artist.value;
		dfm.querySimilar(this.artist.value, function (data) {
			dfm.drawSimilar(data, artistsCanvas);
			toggleLoading();
		});
	});

	if (location.hash) {
		var hashValue = location.hash.split('#')[1];

		searchForm.find('input[type=search]').attr('value', hashValue);
		searchForm.submit();
	}
});
