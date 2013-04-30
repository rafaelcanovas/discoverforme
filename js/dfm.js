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
				img = new Image();

			name.text(a.name)
				.appendTo(elem);

			elem.addClass('thumbnail')
				.attr('href', '//' + a.url)
				.attr('target', '_blank')
				.appendTo(canvas);

			img.src = a.image[4]['#text'];
			img.onload = function () {
				elem.css('background-image', 'url('+img.src+')')
					.addClass('loaded');
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
		similarCanvas = $('#artists'),
		help = $('#help');

	function toggleLoading() {
		similarCanvas.toggleClass('loading');
	}

	function hideHelp() {
		if (!help.hasClass('hidden')) {
			help.addClass('hidden');
		}
	}

	searchForm.on('submit', function (e) {
		e.preventDefault();

		hideHelp();
		toggleLoading();
		dfm.querySimilar(this.artist.value, function (data) {
			dfm.drawSimilar(data, similarCanvas);
			toggleLoading();
		});
	});

	if (location.hash) {
		var hashValue = location.hash.split('#')[1];

		searchForm.get(0).artist.value = hashValue;
		hideHelp();
		toggleLoading();

		dfm.querySimilar(hashValue, function (data) {
			dfm.drawSimilar(data, similarCanvas);
			toggleLoading();
		});
	}
});
