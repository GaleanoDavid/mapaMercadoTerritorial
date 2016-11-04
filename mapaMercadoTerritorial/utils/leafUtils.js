/*----------------------------------
 * Definicion de variables globales
 *---------------------------------*/

var mapboxaccesstoken = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';
var attributionInfo = 'EL zoom de este mapa está limitado para respetar la privacidad de los nodos &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '
	+ '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
	+ 'Imagery © <a href="http://mapbox.com">Mapbox</a>';
/*---------------------
 Fin definicion variables globales
 ----------------------*/
function popupStructure(nameNode, phone, email){
	
	var popupBase = 
	'<div>'+
		'<h2 align="center">'+nameNode+'</h2>'+
		'<div id="contact">'+
			showInfo(email,phone);	
		'</div>'+
	'</div>';
	
	return popupBase;
}

function showInfo(email,phone){
	var string = "";
	
	if(phone != 'ND'){
		string = string + '<div align="center"> <img src="./mapresources/data/icons/phone.png" height="16" width="16"> <font size="3">'+ phone +'</font></div>';
	}
	
	if(email != 'ND'){
		string = string + '<div align="center"> <img src="./mapresources/data/icons/mailicon.png" height="16" width="16"> <font size="3">'+ email +'</font></div>';
	}
	
	return string
}

var iconPulsingSmall = L.divIcon({
    className: "leaflet-usermarker-small ",
    iconSize: [17, 17],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
    labelAnchor: [3, -4],
    html: '<i class="pulse"></i><span>'
});

//Retorna una funcion que permite editar los iconos de los clusters
function clusterIconCreate() {
	return ( 
			function (cluster) {
				var childCount = cluster.getChildCount();

				var c = ' marker-cluster-';
				if (childCount < 10) {
					c += 'small';
				} else if (childCount < 100) {
					c += 'medium';
				} else {
					c += 'large';
				}
				if(childCount>1){
					return new L.DivIcon({html: '<div><span>' + childCount + '</span></div>', 
										  className: 'marker-cluster' + c,
										  iconSize: new L.Point(40, 40) });
				}else{
					return iconPulsingSmall;
				}
			}
	)
}

//Metodos de filtrado para el geoJeson
//lo usa la opcion Filter:
function filtrarNodosAbiertos(){
	return (
			function(feature, layer) {
				return (feature.properties.tipoNodo).indexOf("abierto")>0;
			}
	)
}

function filtrarCapital(){
	return (
			function(feature, layer) {
				return (feature.properties.address).indexOf("Ciudad Autonoma")>0;
			}
	)
}

function filtrarBuenosAires(){
	return (
			function(feature, layer) {
				return (feature.properties.address).indexOf("Ciudad Autonoma")<0;
			}
	)
}

function filtrarNinguno(){
	return (
			function(feature, layer) {
				return true;
			}
	)
}

function mapModelInit(modelo,maxzoom){
	var layer = L.tileLayer(mapboxaccesstoken,{
		maxZoom : maxzoom,
		attribution : attributionInfo,
		id : modelo
		});
	return layer;
}

/*------------------------------------
 Inicializacion del mapa
 --------------------------------------*/
function initmap(id, coordx, coordy, initialzoom, maxzoom) {
	
	var streets = mapModelInit('mapbox.streets',maxzoom);
	
	var map = L.map(id,{
		center:[coordx, coordy],
		zoom : initialzoom,
		layers:[streets]
	});	
	return map
}

/*------------------------------------
 Requiere que exista una variable points en formato geojson
 --------------------------------------*/
function importGeoJsonFilter(dataGeoJson, aFilterFunction){
	var points = L.geoJson(dataGeoJson, {
		onEachFeature : function(feature, layer)
		{
			var popdata
			if (feature.properties && feature.properties.nombreNodo && feature.properties.telefono&&feature.properties.email){
					popdata = popupStructure(feature.properties.nombreNodo,feature.properties.telefono,feature.properties.email);
					layer.bindPopup(popdata);
				}else{
					popdata = popupStructure(feature.properties.nombreNodo,'ND','ND');
					layer.bindPopup(popdata);
				}
		},
		filter: aFilterFunction,
	});
	return points;
}
