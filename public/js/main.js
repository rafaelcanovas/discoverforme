function main()
{
	var searchForm = dojo.byId('search-form');
	var searchTerm = dojo.byId('search-term');
	var searchLimit = dojo.byId('search-limit');
	
	function toggleLoading()
	{
		dojo.toggleClass(searchTerm, 'loading');
	}
	
	function cancelRequest(msg)
	{
		// Cancel loading
		toggleLoading();
		
		if(msg) {
			searchTerm.value = msg;
		}
		
		searchTerm.focus();
		searchTerm.select();
	}	
	
	dojo.connect(searchForm, 'onsubmit', null, function(e) {
		// Prevent page from reloading
		e.preventDefault();
		
		if(searchTerm.value.length <= 0) {
			searchTerm.focus();
			searchTerm.select();
			return false;
		} else if(searchLimit.value <= 0) {
			searchLimit.focus();
			searchLimit.select();
			return false;
		}
	
		// Begin loading
		toggleLoading();
		
		dojo.xhrGet({
			url: 'http://ws.audioscrobbler.com/2.0/',
			handleAs: 'json',
			content: {
				method: 'artist.getsimilar',
				limit: searchLimit.value,
				artist: searchTerm.value,
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
					return false;
				}
				
				if(!data.similarartists['@attr']) {
					cancelRequest('Who?');
					return false;
				}

				// Clear the screen if other artist was queried previously
				dojo.query('.thumbnail').forEach(dojo.destroy);
				
				var similarArtists = data.similarartists;
				
				// Show the autocorrected artist name
				searchTerm.value = similarArtists['@attr'].artist;
			
				var similarArray = similarArtists.artist;
				if(!dojo.isArray(similarArray)) {
					similarArray = new Array(similarArray);
				}
				
				for(var i in similarArray) {
					var similar = similarArray[i];
										
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
