dojo.ready(function(){
	var searchInput = dojo.byId('search');
	
	function toggleLoading()
	{
		dojo.toggleClass(searchInput, 'loading');
	}
	
	function cancelRequest(msg)
	{
		if(msg) {
			searchInput.value = msg;
		}
		
		searchInput.focus();
		searchInput.select();
		// Cancel loading
		toggleLoading();
	}	
	
	dojo.connect(searchInput, 'onchange', null,
	function(e) {
		// Begin loading
		toggleLoading();
		
		dojo.xhrGet({
			url: 'http://ws.audioscrobbler.com/2.0/',
			handleAs: 'json',
			content: {
				method: 'artist.getsimilar',
				artist: e.target.value,
				api_key: 'eb6dc9b732732664bb179c33cb94ab36',
				autocorrect: true,
				format: 'json'
			},
			load: function(data) 
			{
				if(data.error) {
					var errorMessage = 'Fatal error, call the ambulance!';
					
					if(data.error == 6) {
						// An unknown artist was inputted
						errorMessage = 'Who?';
					}
					
					cancelRequest(errorMessage);
					return;
				}

				// Clear the screen if other artist was queried previously
				dojo.query('.thumbnail').forEach(dojo.destroy);
				
				var similarArtists = data.similarartists;
				
				// Show the autocorrected input value
				searchInput.value = similarArtists['@attr'].artist;
			
				for(var i in similarArtists['artist']) {
					var similar = similarArtists['artist'][i];
					
					// Preload the thumbnail background image
					var thumbnailImg = new Image();
					thumbnailImg.src = similar.image[3]['#text'];
					
					var thumbnail = dojo.create('div', { class:'thumbnail' });
					dojo.fadeOut(thumbnail, 0);
					
					dojo.connect(thumbnailImg, 'onload', function(e) {
						dojo.setStyle(thumbnail, { backgroundImage: "url('"+e.target.src+"')" });
						dojo.fadeIn(thumbnail, 500);
					})
					
					var info = dojo.create('a', {
						class: 'info',
						target: '_blank',
						href: 'http://'+similar.url,
						innerHTML: similar.name	
					});
					
					dojo.place(info, thumbnail);
					dojo.place(thumbnail, dojo.body());
				}	
				
				// End loading	
				toggleLoading();
			},
			error: function()
			{
				cancelRequest('Oops, something went wrong!');
			}
		});
	});
});
