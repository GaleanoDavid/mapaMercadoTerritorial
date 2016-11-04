
function startMap(divId){	
		var cy = -59.52;
		var cx = -34.384;
		var mapa = initmap(divId, cx, cy, 4, 13);
		/*
		var markers = L.markerClusterGroup({
			singleMarkerMode: true,
			iconCreateFunction: clusterIconCreate()					
		});
		puntos = importGeoJsonFilter(points,filtrarNinguno());
		markers.addLayer(puntos);
		mapa.addLayer(markers);
		mapa.fitBounds(markers.getBounds());
		 */
		
		//testing
		var markers2 = L.markerClusterGroup({
			singleMarkerMode: true,
			iconCreateFunction: clusterIconCreate()					
		});
		//individualQueryForGMapsAPI("110A","1075","Berazategui","Buenos Aires", "Argentina");
		insertPointWithGMaps("2","1075","Berazategui","Buenos Aires", "Argentina",markers2,mapa);
		//insertPoint( queryForOverpassQL("Quilmes","Balcarce","Moreno"),markers2,mapa);

}