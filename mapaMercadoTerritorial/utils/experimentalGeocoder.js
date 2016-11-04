/*-----------------------------
 * Es un Script intensivo, si se pretende hacer muchas consultas a la vez, debido a problemas con multiples
 * GET Http request, entre cada request se lo demora por 10 seg debido a la naturaleza asicronica de javascript
 * Por lo que si se pretende hacer un escaneo de posiciones en cantidad, el tiempo de demora es de 10seg * cantidad de busquedas.
 * Este script valida, por medio de Http request al servidor de OSM cada direccion dada, por ejemplo:
 * Quilmes, Balcarce entre José de San Martin y Moreno, va a validad primero, que:
 * Balcarce exista en Quilmes,
 * José de San Martin exista en Quilmes,
 * Moreno exista en Quilmes,
 * Si existen las 3, forma una query de consulta espacial con las tres direcciones,
 * Si existen 2/3, crea una query con 2 direcciones,
 * Si existen 1/3, crea una query con 1 direccion (impreciso);
 * Si la direccion dada como principal no existe, usa alguna de las validas y la marca en el mapa (impreciso)
 * 
 * Funciona con 1 direccion y la valida relativamente rapido, es util para validaciones simples. 
 * Los resultados, los muestra en la consola (F11 en el web browser).
 * Retorna una cadena de caracteres separada por ";" (punto y coma), para que se pueda copiar y pegar a un csv.
 * La funcion que ejecuta todo es: locateDirectionsWithCheckingAdrress(varjson);
 * espera un array con valores en formato json dentro.
 * 
 * var Ejemplo = [{
	"latitude" : -58.4253477673469,
	"longitude" : -34.6198670938776,
	"nombreNodo" : "3 de febrero",
	"coordinador" : "Melisa Papillo",
	"email" : "melipapillo@gmail.com",
	"tipoNodo" : "",
	"calleprincipal" : "Aldo Della Rosa",
	"calleA" : "Potosí",
	"calleB" : "ND",
	"partido" : "Ciudad Autónoma de Buenos Aires",
	"provincia" : "Buenos Aires",
	"pais" : "Argentina",
	"telefono" : 1566055545
	}];
 *----------------------------*/
var iterative;
var index = -1;
var count = 0;
var validations;
var directions;
var querys;
var responses = [];
var jsonValues;
var simpleJsonResponse;
var marker
var map

function arrayOfArrays(rows){
	  var arr = [];

	  for (var i=0;i<rows;i++) {
	     arr[i] = [];
	  }

	  return arr;
}

function validate(idForResponse){
	if(validations[idForResponse][0] && validations[idForResponse][1] && validations[idForResponse][2]){
		
		return queryForOverpassQL(directions[idForResponse][0], directions[idForResponse][1], directions[idForResponse][2], directions[idForResponse][3]);
	}else{

		if(validations[idForResponse][0] && validations[idForResponse][1]){
			return queryForOverpassQL(directions[idForResponse][0], directions[idForResponse][1], directions[idForResponse][2]);
		}
		if(validations[idForResponse][0] && validations[idForResponse][2]){
			return queryForOverpassQL(directions[idForResponse][0], directions[idForResponse][1], directions[idForResponse][3]);
		}
		
		if(validations[idForResponse][0]){
			return querys[idForResponse][0];
		}
		if(validations[idForResponse][1]){
			return querys[idForResponse][1];
		}		
		if(validations[idForResponse][2]){
			return querys[idForResponse][2];
		}		
	}
	
	return "ND";
}

function validateResult(query,count,idForResponse){
	encodedQuery=encodeURI(query)
	aQuery = new HttpClient();
	aQuery.get('http://overpass-api.de/api/interpreter?data='+encodedQuery, function(httpresponse) {
	    validations[idForResponse][count] = JSON.parse(httpresponse).elements.length > 0;
	    count = count + 1;
	    if(count<2){
	    	validateResult(querys[idForResponse][count],count,idForResponse);
	    }else{
	    	responses[idForResponse] = validate(idForResponse); 
	    	search(idForResponse);
	    }
	});
	
}

function validateInfo(area, mainDirection, secondaryDirectionA, secondaryDirectionB,idForResponse){
	querys[idForResponse][0]=queryForOverpassQLOnlyMain(area,mainDirection);
	querys[idForResponse][1]=queryForOverpassQLOnlyMain(area,secondaryDirectionA);
	querys[idForResponse][2]=queryForOverpassQLOnlyMain(area,secondaryDirectionB);
	return validateResult(queryForOverpassQLOnlyMain(area,mainDirection),0,idForResponse);
}

//area = partido
function doSearch(area, mainDirection, secondaryDirectionA, secondaryDirectionB,idForResponse){
	var query = "";
	
	if(mainDirection == "ND"){
		query = "ND";
	}
	
	if(secondaryDirectionA=="ND"){
		query =  queryForOverpassQLOnlyMain(area, mainDirection);
	}
	
	if(secondaryDirectionB == "ND"){
		query = validateInfo(area, mainDirection, secondaryDirectionA, "/55//",idForResponse);
	}else{
		query = validateInfo(area, mainDirection, secondaryDirectionA, secondaryDirectionB,idForResponse);
	}
	
}

function search(idForResponse){
	httpClient = new HttpClient();
	var string = createStringOfJsonData(jsonValues[idForResponse]);
	query= responses[idForResponse];
	//console.log(query);
	encodedQuery=encodeURI(query);
	httpClient.get('http://overpass-api.de/api/interpreter?data='+encodedQuery, function(response) {
		var json= JSON.parse(response).elements;
		if(json.length > 1){
			json= json[1];
		};
		//console.log(json);
		insertOnMap(json);
		console.log(string+";"+json.lat+";"+json.lon+";");
	});
}

function insertOnMap(json){
	if(marker != null){
		GeoJSON.parse(json, {Point: ['lat', 'lon']}, function(geojson){
			if(json != null){
				//console.log(JSON.stringify(geojson));
				marker.addLayer(importGeoJsonFilter(geojson));
				map.addLayer(marker);
				map.fitBounds(marker.getBounds());
			}else{
				//trow exception
				console.log("Los datos del Json se encuentran vacios");
			}
		});
	}
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

//Recolecta todas las coordenadas de un json dado con direcciones.
//se intenta validar si las direcciones son validas, si almenos una es valida, se procede a crear la query.
function locateDirectionsWithCheckingAdrress(varjson){
	var size = varjson.length;
	directions=  arrayOfArrays(size);
	validations=  arrayOfArrays(size);
	querys= arrayOfArrays(size);
	jsonValues= arrayOfArrays(size);	
	iterative = setInterval(function(){
		index = index +1;
		if(index >= varjson.length){
			clearInterval(iterative);
			iterative = null;
			//console.log("no hay mas valores");
		};		
		console.log("10 segundos pasaron, iteracion nro: "+index.toString());
		var valueOfJson = varjson[index];
		(function(value, id){
			directions[id][0] = valueOfJson.partido;
			directions[id][1] = valueOfJson.calleprincipal;
			directions[id][2] = valueOfJson.calleA;
			directions[id][3] = valueOfJson.calleB;
			jsonValues[id] = valueOfJson;
			doSearch(valueOfJson.partido,valueOfJson.calleprincipal,valueOfJson.calleA,valueOfJson.calleB,id);
		})(valueOfJson, index);
		}, 10000);
}

//No recomendable, extremadamente lento, solo es experimental.
function markAllOnMap(vmarker,vmapa,varjson){
	marker = vmarker;
	map = vmapa;
	locateDirectionsWithCheckingAdrress(varjson);
}


function setPointOnMap(partido,calleprincipal,calleA,calleB,vmarker,vmapa){
	marker = vmarker;
	map = vmapa;
	directions= arrayOfArrays(1);
	validations= arrayOfArrays(1);
	querys=arrayOfArrays(1);
	jsonValues=arrayOfArrays(1);
	directions[0][0] = partido;
	directions[0][1] = calleprincipal;
	directions[0][2] = calleA;
	directions[0][3] = calleB;
	doSearch(partido,calleprincipal,calleA,calleB,0);
}