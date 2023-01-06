import {SunCalc} from "../node_modules/suncalc/suncalc.js"
//con la funcion getTimes sacamos el MediodiaSolar
let {getTimes}   = SunCalc;
import sunCalc from "./SunCalc_function.js";
//con la funcion getDayInfo sacamos el amanaecer y el anochecer (entre otros datos)
let {getDayInfo} = sunCalc();
//importo algunas funciones trigonometricas y matematicas que he creado aparte
import { getNewCoords, getAbsoluteDiff } from "./trigo.js";
import { Spinner } from "./spinner.js";
let { preventDefault } = window.Event.prototype;

/** Ajuste de las horas en las fechas por defecto: 
suelen empezar a las 10:42 por algun motivo*/
let DATE_ADJUSTMENT = (34*60+42)*60000;
/** 24 horas en milisegundos */
let ONE_DAY  = 24*60*60*1000;
/** 1 hora en milisegundos */
let ONE_HOUR = 60*60*1000;
/**opciones para el SPINNER */
let opts = {
    lines: 8, /* The number of lines to draw */
    length: 11, /* The length of each line */
    width: 36, /* The line thickness */
    radius: 41, /* The radius of the inner circle */
    scale: 1, /* Scales overall size of the spinner */
    corners: 0.8, /* Corner roundness (0..1) */
    speed: 1.7, /* Rounds per second */
    rotate: 90, /* The rotation offset */
    animation: 'spinner-line-fade-more', /* The CSS animation name for the lines */
    direction: -1, /* 1: clockwise, -1: counterclockwise */
    color: '#3d8fe6', /* CSS color or array of colors */
    fadeColor: 'transparent', /* CSS color or array of colors */
    top: '52%', /* Top position relative to parent */
    left: '51%', /* Left position relative to parent */
    shadow: '0 0 5px transparent', /* Box-shadow for the lines */
    zIndex: 2000000000, /* The z-index (defaults to 2e9) */
    className: 'spinner', /* The CSS class to assign to the spinner */
    position: 'absolute', /* Element positioning */
};
/**Puramente ornamental */
let Espinete = new Spinner(opts);
/** Info relativa a coordenadas y posiciones solares |
 * start - inicio espacio/tiempo del viaje |
 * end   - final espacio/tiempo  del viaje |
 * NaS   - Norte A Sur? (true/false)    */
const specialData = ["start","end", "NaS"];
/** Info relativa a horas y minutos   */
const horas = ["horasalida","minutosalida","horallegada","minutollegada"];
/** Info recogida en el formulario servido en la web */
const form  = ["cambio","sun",...horas,"origen","destino","diasalida", "diallegada", "vuelo",...specialData];
const ID    = [...form, "formulario", "submit", "reset", "resetea", "result", "render"];
/** Array de subsecciones del tramo Principal entre las coordenadas iniciales y finales del array datos */
let subSection = [{}];
/** Array de información principal con la que trabajar */
let datos   = [{}];

window.addEventListener('load', ()=> {
    if (navigator.geolocation) {
        let here;
        function savePosition(position) {
            here = {lat: position.coords.latitude, lon: position.coords.longitude};};
        let now = new Date();
        navigator.geolocation.getCurrentPosition((resolve, reject) => {
            if (resolve) {
                savePosition(resolve);
                if (isThereDaylightNow(here, now)) {
                    document.style.backgroundColor='white';
                } else {
                    document.style.backgroundColor='black';
                };
            } else {
                console.log(reject);
            };
        });
    } else {
        console.log("Tu navegador no permite geolocalizarte (^8");}
    main();});

function main() {
    reloadId(ID);
    result.disabled = true;
    reset.disabled  = true;
    onClick(submit, async () => {
        if (checkForm()) {
            Espinete.spin(document.querySelector('form'));
            submit.disabled = true;
            datos = [{}];
            datos.push({...form.forEach((el) => datos[el] = valor(el))});
            await updateSubsections();
            result.disabled = false;
            reset.disabled  = false;
            Espinete.stop();
        };
    });
    onClick(result, () => {
        Espinete.spin(document.querySelector('form'));
        submit.disabled = true;
        if (datos.length>0) {
            console.log(datos);
            renderResults();
        } else {
            window.alert("No hay datos!");
        };
        Espinete.stop();
    });
    onClick(reset, () => {
        window.location.reload();
    });
};


/** Actualiza el numero de subSecciones del trayecto principal   */
async function updateSubsections() {
        //limpio el array 'datos' de algunos elementos que ya no necesitamos
        horas.forEach((el) => delete datos[el.toString()]);
    let vuelo         = datos.vuelo ? 11000 : 0;
    let salida        = new Date(datos.diasalida.getTime());
    let llegada       = new Date(datos.diallegada.getTime());
    let coordenadas   = {};
    let latitudOrigen = 0.0, longitudOrigen = 0.0, latitudDestino = 0.0, longitudDestino = 0.0;
    try {
        coordenadas = await updateCoords();
        datos.NaS = (coordenadas.latDest > coordenadas.latOrig) ? true : false;
        if (coordenadas !== undefined && coordenadas !== null) {
            latitudOrigen   = coordenadas.latOrig;
            longitudOrigen  = coordenadas.lonOrig;
            latitudDestino  = coordenadas.latDest;
            longitudDestino = coordenadas.lonDest;
        } else {
            window.alert("Error al actualizar las coordenadas");
            return;};
        } catch (error) {
            window.alert(error.message);
            console.log(error);};
    //adquirimos amaneceres y anocheceres en origen y destino
    let tiempo1 = getDayInfo(salida, latitudOrigen, longitudOrigen);
    let tiempo2 = getDayInfo(llegada, latitudDestino, longitudDestino);
    //adquirimos el mediodia solar en origen 
    let times = getTimes(salida, latitudDestino, longitudDestino, vuelo);
    datos.start = { lat: coordenadas.latOrig, lon: coordenadas.lonOrig, 
        sunset: tiempo1.sunset.end, sunrise: tiempo1.sunrise.start,
        solarnoon: times.solarNoon };
    //...y en destino
    times = getTimes(llegada, latitudOrigen, longitudDestino, vuelo);
    datos.end   = { lat: coordenadas.latDest, lon: coordenadas.lonDest,
        sunset: tiempo2.sunset.end, sunrise: tiempo2.sunrise.start,
        solarnoon: times.solarNoon };
    try {
        updateSingleSections();
        sectionFormatter();
        sectionAdapter();
        datos["secciones"] = subSection;
    } catch (error) {
        window.alert(error.message);
        console.log(error);};
};

/** Function that renders the data in the screen */
function renderResults() {
    let {secciones, cambio, sun} = datos;
    let leftSeat;
    formulario.style.display = "none";
    let someInfo = document.createElement('div');
    someInfo.innerHTML =
                    `<b>Salida:</b>  ${datos["diasalida"]} <br>
                     <b>Llegada:</b> ${datos["diallegada"]} <br>
                     <b>Origen:</b>  ${datos["origen"]} <br>
                     <b>Destino:</b> ${datos["destino"]} <br>`;
    document.querySelector('header').appendChild(someInfo);

    secciones.forEach((el, i) => {
        let hours2   = null!=el.sunset  ? el.sunset.getHours()    : el.noon?.getHours(), 
        minutes2 = null!=el.sunset  ? el.sunset.getMinutes()  : el.noon?.getMinutes(),
        noonHour = el.noon?.getHours(),
        noonMin  = el.noon?.getMinutes(),
        hours1   = null!=el.sunrise ? el.sunrise.getHours()   : el.noon?.getHours(), 
        minutes1 = null!=el.sunrise ? el.sunrise.getMinutes() : el.noon?.getMinutes(),
        day      = el.noon?.getDate().toString(),
        month    = el.noon?.getMonth(),
        year     = el.noon?.getFullYear();
        let numbers = [hours2, minutes2, noonHour, noonMin, hours1, minutes1];
        let stringifyNumbers =()=> numbers.forEach((el) => el= (el.toString().length==1) ? "0"+el : el);
        let texto = ``;
        if (secciones.length>1) {   
            texto = `Dia ${day+"/"+(month+1)+"/"+year}: \n\t Tramo (${i+1}/${secciones.length}) - <br>`;};
            
        if (el.night) {
            texto += `🌙 El viaje va a producirse enteramente de noche 🌙`;
        } else if (el["AM"]==null && el["noon"]!=null) {
            if (cambio) {
                /* Es posible cambiar de asiento */
                let same = !(hours1==noonHour && minutes1==noonMin);
                if (same) {
                    stringifyNumbers();
                    texto +=     `Siéntate en el lado ${getLeftSeat(false)?"izquierdo":"derecho"} del vehículo de ${hours1+":"+minutes1} `+
                    `a ${noonHour+":"+noonMin}, y luego`;};
                stringifyNumbers();
                texto += `\t  siéntate al lado ${getLeftSeat(true)?"izquierdo":"derecho"} del vehículo `;
                texto += same
                    ? `de ${noonHour+":"+noonMin} a ${hours2+":"+minutes2} ${sun?'☀️':'⛅'}`
                    : `durante todo el trayecto  ${sun?'☀️':'⛅'}`;
            } else {
                /* No es posible cambiar de asiento */
                if        (el["sunrise"]!=null) {
                    let morning   = el["noon"].getTime()   - el["sunrise"].getTime(),
                        afternoon = el["sunset"].getTime() - el["noon"].getTime();
                    leftSeat = getLeftSeat(morning>=afternoon);
                    stringifyNumbers();
                    texto += `Siéntate en el lado ${!leftSeat?"izquierdo":"derecho"} del vehículo de ${hours1+":"+minutes1} `+
                    `a ${hours2+":"+minutes2}  ${sun?'☀️':'⛅'}`;
                } else if (el["sunrise"]==null) {
                    stringifyNumbers();
                    texto += `Siéntate en el lado ${getLeftSeat(false)?"izquierdo":"derecho"} del vehículo de ${hours1+":"+minutes1} `+
                    `a ${hours2+":"+minutes2}  ${sun?'☀️':'⛅'}`;
                } else if (el["sunset"]==null ) {
                    stringifyNumbers();
                    texto += `Siéntate en el lado ${getLeftSeat(true)?"izquierdo":"derecho"} del vehículo de ${hours1+":"+minutes1} `+
                    `a ${hours2+":"+minutes2} ${sun?'☀️':'⛅'}`;
                };
            };
        } else {
            /* No es necesario cambiarse: todo el trayecto courre ANTES o DESPUÉS del Mediodia Solar */
            leftSeat = getLeftSeat(el["AM"]);
            stringifyNumbers();
            texto += `Siéntate en el lado ${leftSeat?"izquierdo":"derecho"} del vehículo durante todo el trayecto ${sun?'☀️':'⛅'}`;
        };
        let div = document.createElement("div");
        div.setAttribute('id', `${i%2==0?'light':'dark'}`);
        div.setAttribute('class', 'card');
        let p = document.createElement("p");
        p.innerHTML = texto;
        div.appendChild(p);
        render.appendChild(div);
    });
    let boton = document.createElement("button");
    boton.innerHTML = "Refrescar";
    boton.setAttribute("class","preferencia");
    boton.setAttribute("id","resetea");
    render.appendChild(boton);
    reloadId(ID);
    onClick(resetea, () => {window.location.reload();});
};
/** Analiza la propiedad AnteMeridiana y devuelve
 *  izquierda (true), o derecha (false)
 *  @param {Boolean} ams 
 *  @returns {Boolean} True-Izquierda | False-Derecha*/
function getLeftSeat(ams){
    let leftSeat =  true;
    if (!ams         ) {leftSeat=!leftSeat;};
    if (!datos["sun"]) {leftSeat=!leftSeat;};
    if (!datos["NaS"]) {leftSeat=!leftSeat;};
    return leftSeat;};

/** Adapta las secciones para facilitar su posterior interpretación 
 *  y renderización en pantalla  */
function sectionAdapter() {
    let { diasalida, diallegada } = datos;
    let fechas = [diasalida, diallegada];
    /**Antes del Mediodia Solar? true: false: null*/
    let AM;
    let cosa = [{}, {}];
    let indices = [0, (subSection.length - 1)];
    for (let j = 0; j < fechas.length; j++) {
        let sunset  = subSection[indices[j]]["sunset"],
            sunrise = subSection[indices[j]]["sunrise"],
            noon    = subSection[indices[j]]["noon"];
        let night = false;
        /* Casos donde todo el trayecto ocurre de noche */
        if ((  sunrise > diallegada 
            && sunrise > diasalida 
            && subSection.length==1)) {
            night=true;
        } else {
            if (subSection.length > 1) {
                if (j == 0) {
                    sunrise = sunrise.getTime() > diasalida.getTime() ? sunrise : diasalida;
                    noon    = noon?.getTime()   > diasalida.getTime() ? noon    : diasalida;
                    (noon==diasalida)? sunrise=null: null;
                } else {
                    sunset  = sunset.getTime() < diallegada.getTime() ? sunset : diallegada;
                    noon    = noon?.getTime()  < diallegada.getTime() ? noon   : diallegada;
                    (noon==diallegada)? sunset=null: null;
                };
            } else {
                sunrise = sunrise.getTime() > diasalida.getTime()  ? sunrise : diasalida;
                sunset  = sunset.getTime()  < diallegada.getTime() ? sunset  : diallegada;
            };
            if (noon>sunrise && noon>sunset) {
                AM = true;
            } else if (noon<sunrise && noon<sunset) {
                AM = false;
            } else {
                AM = null;
            };
        };

        cosa[indices[j]] = {
            sunrise: sunrise,
            sunset: sunset,
            noon: noon,
            night: night,
            AM: AM
        };
        subSection[indices[j]] = cosa[indices[j]];
        if (subSection.length==1) {break;}; /**optimizacion residual*/
    };
};

/** Formatea las secciones para que sean entidades separadas, cada una con su
 *  amanecer, ocaso y mediodía solar    */
function sectionFormatter() {
    try {
        let { start, end } = datos;
        let formatted = [{}];
        //Eliminamos elementos sobrantes
        while (!subSection[0].date) subSection.shift();
        //ordenamos
        subSection.sort((e, f) => {
            if (e["date"].getTime() > f["date"].getTime()) {
                return 1;
            } else {
                return -1;
            };
        });
        //eliminamos o actualizamos la primera y la última posición, 
        //según sea de día o no en la segunda y la penúltima posición
        //RECUERDA: debe empezar por 'sunrise'. Debe acabar por 'sunset'
        let eventos = ["sunrise", "sunset"];
        let propiedades = [start, end];
        for (let j = 0; j < eventos.length; j++) {
            let indices = [1, (subSection.length - 2)];
            if (eventos[j] == subSection[indices[j]]["event"]) {
                (j > 0) ? subSection.pop() : subSection.shift();
            } else {
                subSection[j > 0 ? indices[j]+1 : 0] = {
                    date: propiedades[j][eventos[j]],
                    rate: j > 0 ? 1 : 0,
                    event: eventos[j]
                };
            };
        };
        //comprobamos que el número de elementos sea par
        if (subSection.length % 2 != 0) {
            throw new Error("Error en el formateo de las secciones");
        };
        //formateamos - PASO FINAL
        for (let i = 0; i < subSection.length; i += 2) {
            let noon, sunrise, sunset;
            sunrise = subSection[i]["date"];
            sunset = subSection[i + 1]["date"];
            noon = new Date(Math.floor((sunset.getTime() - sunrise.getTime()) / 2) + sunrise.getTime());
            formatted[i / 2] = {
                sunrise: sunrise,
                sunset: sunset,
                noon: noon
            };
        };
        subSection = formatted;
    } catch (error) {
        console.log(error);
    }
};

/** Establece amaneceres y anocheceres con un rango de exactitud determinado,
 * a lo largo del trayecto (se mueve tanto el vehículo como la tierra alrededor del sol),
 * y marca sus coordenadas, su hora, el tipo de evento (amanecer o anochecer) y la 
 * tasa de avance respecto al trayecto total.   */
function updateSingleSections() {
    let {start, diasalida, diallegada} = datos; 
    let datePointer = diasalida;
    let diff = ONE_HOUR;
    let time =new Date(new Date().getTime()-ONE_DAY), tiempo = new Date();
    let total_time = diallegada.getTime()-diasalida.getTime();
    let limit = (Math.floor(total_time*2/ONE_DAY)>=1)?Math.floor(total_time*2/ONE_DAY):1;
    /** Máxima diferencia aceptable (milisegundos) */
    let MAX_DIFF = 2500;
    let increase = MAX_DIFF/total_time; 
    let loops = 0, cont = 0;
    let {lat, lon} = start, coordPoint = {lat, lon};
    let seekSunset = isThereDaylightNow(coordPoint, datePointer); 
    /** Máxima cantidad de iteraciones en el bucle */
    let MAX_LOOPS = Math.pow(MAX_DIFF, Math.pow(limit, Math.E));
    subSection = [{}];
    subSection.push({date: diasalida, rate:0});
    /**Tasa de avance a lo largo del trayecto*/
    let RATE = 0;
    let iteraciones = 0;
    let getNewDatePointer =    ()   => {return new Date(datos["diasalida"].getTime()+(Math.floor(RATE*total_time)));},
        newCoords         =    ()   => {return getNewCoords(datos["start"], datos["end"], RATE)},
        getRateOfDate     =  (date) => {return ((((date-datos["diasalida"].getTime()))/total_time));};
    while (cont<=(limit+1) && datePointer.getTime()<diallegada.getTime() && loops<MAX_LOOPS) {
        if (!seekSunset && !isThereDaylightNow(coordPoint, datePointer) && cont>0) {
            datePointer = new Date(datePointer.getTime()+ONE_DAY)};
        while (!(time.getTime()>subSection[subSection.length-1].date.getTime()) || !(diff<=MAX_DIFF)) {
            iteraciones++;
            seekSunset
                ? tiempo = getDayInfo(datePointer, coordPoint.lat, coordPoint.lon).sunset.start
                : tiempo = getDayInfo(datePointer, coordPoint.lat, coordPoint.lon).sunrise.end;
            time = new Date(tiempo.getTime());
                tiempo = null;
            RATE = getRateOfDate(time.getTime());
            coordPoint = newCoords();
            if (( seekSunset &&  isThereDaylightNow(coordPoint, datePointer)) 
            ||  (!seekSunset && !isThereDaylightNow(coordPoint, datePointer))) {
                RATE += increase
            } else {
                RATE -= increase};
            coordPoint = newCoords();
            datePointer = getNewDatePointer();
            seekSunset
                ? tiempo = getDayInfo(datePointer, coordPoint.lat, coordPoint.lon).sunset.start
                : tiempo = getDayInfo(datePointer, coordPoint.lat, coordPoint.lon).sunrise.end;
            datePointer = new Date(tiempo.getTime());
                tiempo = null;
            diff = getAbsoluteDiff(time.getTime(),datePointer.getTime());
        };
        if (RATE<1 && RATE>subSection[subSection.length-1].rate) {
            subSection.push({
                event: seekSunset? "sunset": "sunrise",
                date: datePointer,
                coords: coordPoint,
                rate: RATE});
            diff = ONE_HOUR;
            cont++;
            seekSunset= !seekSunset;};
        loops++;
    };
    subSection.push({date: diallegada, rate: 1});
    console.log("se han necesitado "+iteraciones+" iteraciones para una "
                +"precisión de +/- "+MAX_DIFF+" milisegundos en los cálculos");
    //comprobamos que No haya salido una cosa muy loca:
    if (checkForDuplicates(subSection, 'date')) {
        throw new Error('Ha habido algún error con las fechas!');};};

/** Función que comprueba si hay duplicados en un array,
 *  para al menos una de sus propiedades
 *  @param {Array} array donde buscar
 *  @param {String} property propiedad que comparar
 *  @returns True si hay duplicados // False si no los hay   */
function checkForDuplicates(array, property) {
    if (array.length > 1) {
        if (array.some(el => el[property])) {
            let duplicates = false;
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < array.length; j++) {
                    if (array[i][property] == array[j][property]
                        && i != j) {
                        duplicates = true;};};};
            return duplicates;
        } else {
            console.log("Propiedad no encontrada en ningún elemento del array");};}
    return false;};

/** Nos dice si es de día en un momento dado, en un lugar dado
 *  @param {Object} here coordenadas actuales
 *  @param {Date} now momento actual 
 *  @returns {Boolean} True si es de dia, false si es de noche */
function isThereDaylightNow(here, now) {
    let amanecer = getDayInfo(now, here.lat, here.lon).sunrise.end;
    let ocaso = getDayInfo(now, here.lat, here.lon).sunset.start;
    return (now.getTime() >= amanecer.getTime() && now.getTime() < ocaso.getTime());};

/** Consigue las coordenadas de las ciudades y las devuelve en forma de objeto
 * @returns {Object} Objeto con las coordenadas recién obtenidas  */
async function updateCoords() {
    let coordenadas1 = await getCoords(datos.origen);
    let coordenadas2 = await getCoords(datos.destino);
    let coord = {
        latOrig: coordenadas1.lat,
        lonOrig: coordenadas1.lon,
        latDest: coordenadas2.lat,
        lonDest: coordenadas2.lon   };
    if (coordenadas1 && coordenadas2) {
        return coord;
    } else {
        return null;};};
/** Conseguimos las coordenadas de las ciudades que le 
 * pasemos como parámetros. Para ello, usaremos la API de OpenStreetMap, que nos devuelve
 * las coordenadas de una ciudad a partir de su nombre. 
 * @param {String} city @param {String} country /país - (opcional)
 * @return {JSON} JSON con los datos Lon(gitud) y Lat(itud)*/
async function getCoords(city, country) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json`);
        let data = await response.json();
        data = data.filter((el) => el.display_name.includes(country || "España") && el.type == "administrative");
        if (data.length > 0) data = data[0]; 
        return {lon: parseFloat(data.lon), lat: parseFloat(data.lat)};
    } catch (error) {
        console.log(error);
        return null;}}
/** Retorna el valor "cocinado" de un elemento del DOM, listo para ser usado
 * @param {String} id 
 * @returns {Boolean, Number, String, null} */
function valor(id) {
    let valor = null;
    switch (id) {
        case "minutosalida":
            valor = parseInt(getVal(id), 10) + parseInt(getVal("horasalida"), 10)  * 60; 
            break;
        case "minutollegada":
            valor = parseInt(getVal(id), 10) + parseInt(getVal("horallegada"), 10) * 60; 
        break;
        case "diasalida": 
            valor = parseInt(getVal(id), 10) + parseInt(getVal("horasalida"), 10)  * 60; 
            valor = new Date(new Date(getVal(id)).getTime() + valor*60000 + (parseInt(getVal("minutosalida"), 10))*60000 - DATE_ADJUSTMENT );
            break;
        case "diallegada": 
            valor = parseInt(getVal(id), 10) + parseInt(getVal("horallegada"), 10)  * 60; 
            valor = new Date(new Date(getVal(id)).getTime() + valor*60000 + (parseInt(getVal("minutollegada"), 10))*60000 - DATE_ADJUSTMENT);
            break;
        case "origen": 
        case "destino": 
            valor = getVal(id).trim().replaceAll(" ", "%20").replaceAll("á", "a").replaceAll("é", "e").replaceAll("í", "i").replaceAll("ó", "o").replaceAll("ú", "u").replaceAll("ñ", "n").replaceAll("ü", "u").replaceAll("ç", "c").replaceAll("à", "a").replaceAll("è", "e").replaceAll("ì", "i").replaceAll("ò", "o").replaceAll("ù", "u").toLowerCase();
            break;
        default:
            valor = getVal(id); 
            break;}
    if (valor == "true") {
        valor = true;
    } else if (valor == "false") {
        valor = false;}
    return valor;}
/** Añade un escuchador de eventos click a un elemento DOM,
 * lo cual ejecuta una función de forma SEGURA en caso de click
 * @param {Object} elem Nombre del elemento DOM
 * @param {Function} fun Nombre de la función a ejecutar */
function onClick(elem, fun) {
    elem.addEventListener("click", (e) => {
        e.preventDefault();
        fun();})}
//añade a cada elemento del array ID su elemento del DOM correspondiente
function reloadId(IDES) {
    IDES.forEach((el) => (window[el] = getID(el) ? getID(el) : null));}
/** Función que devuelve un elemento del DOM
 * @param {String} id ID del elemento DOM a seleccionar
 * @returns {Object} Elemento DOM */
function getID(id) {
    return document.getElementById(id);}
/** Función que devuelve el valor de un elemento del DOM
 * @param {String} id ID del elemento DOM a seleccionar
 * @returns {*} Valor del elemento */
function getVal(id) {
    if (typeof id == "string") {
        return getID(id)?.value;
    } else {
        return id?.value;}}
/** Comprueba que todos los campos del formulario están correctamente
 *  rellenos, y si no lo están, muestra un mensaje de error 
 *  @returns {Boolean} True si NO hay ningún error en el formulario*/
function checkForm() {
    let NoErr = true, msg = "";
    form.forEach((el) => {
        if ((getVal(el) == "" || getVal(el) == null ) && !specialData.includes(el)) {
            msg += `El campo ${el} está vacío \n`;
            NoErr = false;}});
    if (valor("origen")==valor("destino")) {
        msg += "El origen y el destino no pueden ser iguales \n";
        NoErr = false;}
    if (getVal("minutosalida")  > 59 || getVal("minutosalida")  < 0
    ||  getVal("minutollegada") > 59 || getVal("minutollegada") < 0) {
        msg += "El campo de minutos no es correcto \n";
        NoErr = false;}
    if (getVal("horallegada")   > 23 || getVal("horallegada")   < 0
    ||  getVal("horasalida")    > 23 || getVal("horasalida")    < 0) {
        msg += "El campo de horas no es correcto \n";
        NoErr = false;}
    if (getVal("diasalida") > getVal("diallegada")) {
        msg += "La fecha de llegada no puede ser anterior a la de salida \n";
        NoErr = false;}
    if (valor("diasalida")  < Date.now()/1000/60/60/24) {
        msg += "La fecha de salida no puede ser anterior al día de hoy \n";
        NoErr = false;}
    if (valor("diasalida")    == valor("diallegada") && 
        valor("minutosalida") == valor("minutollegada")) {
        msg += "Además: No existe el teletransporte guapi 😉 \n";
        NoErr = false;}
    if (!NoErr) window.alert(msg);
    return NoErr;}
