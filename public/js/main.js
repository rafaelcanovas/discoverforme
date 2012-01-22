dojo.ready(function(){
	var searchInput = dojo.byId('search');
	
	function toggleLoading()
	{
		dojo.toggleClass(searchInput, 'loading');
	}
	
	dojo.connect(searchInput, 'onchange', null, function(e){
		toggleLoading();
		dojo.xhrGet({
			url: 'http://ws.audioscrobbler.com/2.0/',
			handleAs: 'json',
			content: {
				method: 'artist.getsimilar',
				artist: e.target.value,
				api_key: 'eb6dc9b732732664bb179c33cb94ab36',
				autocorrect: 1,
				format: 'json'
			},
			timeout: 3000,
			load: function(data) 
			{
				var similarArtists = data['similarartists'];
				var queriedArtist = (similarArtists ? similarArtists['@attr'] : false);
				if(!similarArtists || !queriedArtist) {
					searchInput.value = 'Who is this?';
					searchInput.focus();
					toggleLoading();
					return;
				}

				dojo.query('.thumbnail').forEach(dojo.destroy);			
				searchInput.value = queriedArtist.artist;
			
				for(var i in similarArtists['artist']) {
					var similar = similarArtists['artist'][i];
					
					var thumbnail = dojo.create('div', {class:'thumbnail'});
					dojo.setStyle(thumbnail, {backgroundImage: "url('"+similar.image[3]['#text']+"')"});
					
					var anchor = dojo.create('a', {
						class: 'info',
						target: '_blank',
						href: 'http://'+similar.url,
						innerHTML: similar.name	
					});
					
					dojo.place(anchor, thumbnail);
					dojo.place(thumbnail, dojo.body());
				}	
							
				toggleLoading();
			}
		});
	});
})
