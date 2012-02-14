function main()
{
	var searchForm = dojo.byId('search-form');
	var searchTerm = dojo.byId('search-term');
	
	function toggleLoading()
	{
		dojo.toggleClass(searchTerm, 'loading');
	}
	
	function cancelRequest(msg)
	{
		if(msg) {
			searchTerm.value = msg;
		}
		
		searchTerm.focus();
		searchTerm.select();
		// Cancel loading
		toggleLoading();
	}	
	
	dojo.connect(searchForm, 'onsubmit', null, function(e) {
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
				
				// Show the autocorrected artist name
				searchTerm.value = similarArtists['@attr'].artist;
			
				for(var i in similarArtists['artist']) {
					var similar = similarArtists['artist'][i];
										
					var thumbnail = dojo.create('div', {
						class: 'thumbnail',
						style: "background-image: url('"+similar.image[3]['#text']+"')"
					});
					
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
			error: function(e)
			{
				console.log(e);
				cancelRequest('Oops, something went wrong!');
			}
		});
	});
}

dojo.ready(main);
