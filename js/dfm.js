var dfm = (function ($) {
	'use strict';

	var apiURL = 'http://ws.audioscrobbler.com/2.0/',
		apiKey = 'eb6dc9b732732664bb179c33cb94ab36',
		limit = 100;

	var draw = function (data, canvas) {
		if (data.error)
			return;

		canvas.empty();

		var artists = data.similarartists.artist;
		artists.forEach(function (a) {
			var elem = $('<a>'),
				img = new Image();

			elem.addClass('thumbnail')
				.attr('href', '//' + a.url)
				.attr('target', '_blank')
				.appendTo(canvas);

			img.src = a.image[3]['#text'];
			img.onload = function () {
				elem.css('background-image', 'url('+img.src+')')
					.addClass('loaded');
			};
		});
	};

	var query = function (term, canvas, cb) {
		$.getJSON(apiURL, {
			api_key: apiKey,
			method: 'artist.getsimilar',
			format: 'json',
			artist: term,
			limit: limit,
			autocorrect: true
		}, function (data) {
			draw(data, canvas);
			cb();
		});
	};

	return {
		query: query
	};

}(jQuery));

$(document).ready(function () {
	'use strict';

	var searchForm = $('#search-form'),
		help = $('#help'),
		canvas = $('#artists');

	function toggleLoading() {
		canvas.toggleClass('loading');
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
		dfm.query(this.term.value, canvas, toggleLoading);
	});

	if (location.hash) {
		var hashValue = location.hash.split('#')[1];

		hideHelp();
		searchForm.get(0).term.value = hashValue;

		toggleLoading();
		dfm.query(hashValue, canvas, toggleLoading);
	}
});
