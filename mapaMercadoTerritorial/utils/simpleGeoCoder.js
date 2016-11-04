/*-------------------------------------------
 * Geocoder con overpassQL via REST 
 * 
 * Es un geocoder que dado una query, devuelve el punto en el que las direcciones se intersectan.
 * Si no se interesectan, no retorna nada (undefined).
 * Es una version mas simple del "experimentalGeocoder", asume que las direcciones dadas son correctas.
 *------------------------------------------*/
var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
            	aCallback(anHttpRequest.responseText);
            }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

//inserta un punto en el mapa dado, en el grupo dado "marker"
function insertPoint(query,marker,mapa){
	encodedQuery=encodeURI(query)
	aQuery = new HttpClient();
	aQuery.get('http://overpass-api.de/api/interpreter?data='+encodedQuery, function(response) {
	    console.log(response);
	    var json= JSON.parse(response).elements;
	    GeoJSON.parse(json, {Point: ['lat', 'lon']}, function(geojson){	    	
	    	  console.log(JSON.stringify(geojson));
	    	  marker.addLayer(importGeoJsonFilter(geojson));
	    	  mapa.addLayer(marker);
	    	  //opcional
	    	  mapa.fitBounds(marker.getBounds());
	    	});
	});
}

function individualQuery(query){
	encodedQuery=encodeURI(query)
	aQuery = new HttpClient();
	aQuery.get('http://overpass-api.de/api/interpreter?data='+encodedQuery, function(response) {
	    console.log(response);
	    var json= JSON.parse(response).elements;
	    GeoJSON.parse(json, {Point: ['lat', 'lon']}, function(geojson){	    	
	    	  console.log(JSON.stringify(geojson));
	    	});
	});
}

//area = partido
function createQueryBasedOnData(area, mainDirection, secondaryDirectionA, secondaryDirectionB){
	
	if(mainDirection == "ND"){
		return "ND";
	}
	
	if(secondaryDirectionA=="ND"){
		return  queryForOverpassQLOnlyMain(area, mainDirection);
	}
	
	if(secondaryDirectionB == "ND"){
		return queryForOverpassQL(area, mainDirection, secondaryDirectionA, "/55//");
	}else{
		return queryForOverpassQL(area, mainDirection, secondaryDirectionA, secondaryDirectionB);
	}
}


function jsonToGeojson(input){
	var json = JSON.parse(input.toString());
    GeoJSON.parse(json, {Point: ['latitude', 'longitude']}, function(geojson){
  	  console.log(JSON.stringify(geojson));
  	});	
}

function createStringOfJsonData(json){
	var nombreNodo = json.nombreNodo;
	var coordinador= json.coordinador;
	var email= json.email;
	var tipoNodo = json.tipoNodo;
	var telefono = json.telefono;
	var calleprincipal=json.calleprincipal ;
	var calleA= json.calleA;
	var calleB= json.calleB;
	var partido= json.partido;
	var provincia= json.provincia;
	var pais= json.pais;
	
	return nombreNodo+";"+coordinador+";"+email+";"+tipoNodo+";"+telefono+";"+calleprincipal+";"+calleA+";"+calleB+";"+partido+";"+provincia+";"+pais;
}

//Partido, calle principal, calle secundaria, calle secundaria 2.
function queryForOverpassQL(area,mainStreet,optStreet1,optStreet2){
	var query =		
		'[out:json];'+		
		'area["name"="'+area+'"]->.boundary;'+
		'('+
		'way(area.boundary)["name"~"'+mainStreet+'"];>;'+
		')->.mainStreet;'+
		'('+
		'way(area.boundary)["name"~"'+optStreet1+'"];>;'+
		') ->.optStreetone;'+
		'('+
		'way(area.boundary)["name"~"'+optStreet2+'"];>;'+
		') ->.optStreettwo;'+
		'('+
		'node.mainStreet.optStreetone;>;'+
		'node.mainStreet.optStreettwo'+
		')->.result;'+
		'.result out meta;';
	
	return query;
}

function queryForOverpassQL(area,mainStreet,optStreet1){
	var query =		
			'[out:json];'+		
			'area["name"="'+area+'"]->.boundary;'+
			'('+
			'way(area.boundary)["name"~"'+mainStreet+'"];>;'+
			')->.mainStreet;'+
			'('+
			'way(area.boundary)["name"~"'+optStreet1+'"];>;'+
			') ->.optStreetone;'+
			'('+
			'node.mainStreet.optStreetone;'+
			')->.result;'+
			'.result out meta;';	
	return query;
}

function queryForOverpassQLOnlyMain(area,mainStreet){
	var query =		
			'[out:json];'+		
			'area["name"="'+area+'"]->.boundary;'+
			'('+
			'way(area.boundary)["name"~"'+mainStreet+'"];>;'+
			')->.mainStreet;'+
			'.mainStreet out meta;';	
	return query;
}

function exampleQueryOverpass(){
	var query =		
		'[out:json];'+		
		'area["name"="Quilmes"]->.boundaryofquilmes;'+
		'('+
		'way(area.boundaryofquilmes)["name"="Balcarce"];>;'+
		'rel(area.boundaryofquilmes)["name"="Balcarce"];>;'+
		')->.balcarce;'+
		'('+
		'way(area.boundaryofquilmes)["name"="Moreno"];>;'+
		'rel(area.boundaryofquilmes)["name"="Moreno"];>;'+
		') ->.moreno;'+
		'('+
		'way(area.boundaryofquilmes)["name"="José de San Martin"];>;'+
		'rel(area.boundaryofquilmes)["name"="José de San Martin"];>;'+
		') ->.sanMartin;'+
		'('+
		'node.balcarce.moreno;>;'+
		'node.balcarce.sanMartin'+
		')->.rest;'+
		'.rest out meta;';	
	return query;
}