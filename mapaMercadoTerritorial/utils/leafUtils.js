/*----------------------------------
 * definicion de variables globales
 *---------------------------------*/

var mapboxaccesstoken = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';
var attributionInfo = 'EL zoom de este mapa está limitado para respetar la privacidad de los nodos &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '
	+ '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
	+ 'Imagery © <a href="http://mapbox.com">Mapbox</a>';
var nombreNodo = "Nombre del nodo";
var direccionContacto = "./data/MockUpContacto/index.html";
var controlSidebar

/*---------------------
 definicion de iconos propios y metodos experimentales
 ----------------------*/
function popupStructure(nameNode){
	
	var popupBase = 
	'<div align="center">' + "Información" +'</div>' +
	'<div>'+
		'<h1 align="center">'+nameNode+'</h1>'+
			'<div>'+
				'Cuerpo con la información que se debe mostrar'+
				'</div>'+
		'<div id="contact">'+
			'<br/>'+
			'<button onclick="openCloseSidebar();">Contacto</button>'+
		'</div>'+
	'</div>';
	
	return popupBase;
}

//recarga la pagina del menu desplegrable lateral
function reload(tagId){
    var container = document.getElementById(tagId);
    var content = container.innerHTML;
    container.innerHTML= content;
}

function openCloseSidebar(){
	reload('sidebar');
	controlSidebar.toggle();
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
/*--------------------------------
 AddMarkerWithIcon 
 ---------------------------------*/
function addMarkerWithIcon(coordx, coordy, mapa, texto) {
	var marker = L.marker([coordx, coordy], {
		icon : iconPulsingSmall,
		title: "Black Icon" //pone un pequeño titulo solo al poner el puntero sobre la marca 
	}).addTo(mapa)	
}

//marker estilo Radar, se le puede setear que tan preciso muestra el punto.
function addUserMarker(coordx, coordy, mapa, texto) {
	var marker = L.userMarker([coordx, coordy],{pulsing:true, accuracy:100, smallIcon:true});
	marker.setAccuracy(400); 
	marker.addTo(mapa);	
}

//"Injecta" un menu lateral
//se le debe asignar un <div> con un id
function addSidebar(map,idSidebar){
	var sidebar = L.control.sidebar(idSidebar, {
	    position: 'left',
	    autoPan: true
	});		
	controlSidebar = sidebar;
	map.addControl(sidebar);
}

/*---------------------
 Fin de definicion de iconos propios y metodos experimentales
 ----------------------*/

//inicializador generico de un layer para un mapa
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
	
	var light = mapModelInit('mapbox.light',maxzoom);
	
	var map = L.map(id,{
		center:[coordx, coordy],
		zoom : initialzoom,
		layers:[light,streets]
	});	

	var baseMaps = {
		    "Light": light,
		    "Streets": streets
		};
	L.control.layers(baseMaps).addTo(map);
	
	return map
}
/*------------------------------------
 addMarker
 TODO: pasar un booleano para desplegar inicialmente el opopup
 Comentario: .openPopup() solo funciona si no se agregan a un cluster, o son agrupados de algun modo.
 --------------------------------------*/
function addMarker(coordx, coordy, mapa, texto) {
	L.marker([coordx, coordy]).addTo(mapa).bindPopup(texto);
}

/*------------------------------------
 addCircle
 --------------------------------------*/
function addCircle(coordx, coordy, radio, col, fillCol, fillOp, mapa, texto) {
	L.circle([51.508, -0.11], 500, {
		color : col,
		fillColor : fillCol,
		fillOpacity : fillOp
	}).addTo(mapa).bindPopup(texto);
}

/*------------------------------------
 addPolygon
 --------------------------------------*/
function addPolygon(coordsList, mapa, texto) {
	L.polygon(coordsList).addTo(mapa).bindPopup(texto);
}

/*------------------------------------
 requiere que exista una variable points en formato geojson
 TODO: generalizar!
 TODO: contruir el texto a partir de propiedades del archivo
 --------------------------------------*/
function importGeoJsonFilter(dataGeoJson, aFilterFunction){
	var points = L.geoJson(dataGeoJson, {
		onEachFeature : function(feature, layer)
		{
			var popdata
			if (feature.properties && feature.properties.name){
					popdata = popupStructure(feature.properties.name);
					layer.bindPopup(popdata);
				}
		},
		filter: aFilterFunction,
	});
	return points;
}
