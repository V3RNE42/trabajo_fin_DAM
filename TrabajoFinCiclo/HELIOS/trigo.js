/** Returns the absolute difference between two numbers
 *  @param {Number} num1     @param {Number} num2 
 *  @returns {Number} absolute difference between num1 and num2 */
function getAbsoluteDiff(num1, num2)  { return num1>num2? num1-num2 : num2-num1;};
//that gets the value of an angle based on the value of its sin, knowing that is lesser than 180
//knowing that   1 rad × 180 / π = 57,296 °
function getAngleFromSin(sin)  { return (Math.asin(sin) * 180 / Math.PI); };
/**Returns the sin of a given rectangle with base B and height H
 * @param {Number} base @param {Number} height
 * @returns {Number} sin of the rectangle   */
function getSinFromRectangle(base, height)  { return height / base; };
/** Returns the distance between two points 
 * @param {Number} lonDiff diferencia de longitud
 * @param {Number} latDiff diferencia de latitud
 * @returns {Number} Distancia entre ambos puntos */
function getDistance(lonDiff,latDiff)  { return Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lonDiff, 2)); };
/** Function that returns the new coordinates of a point, 
 *  based on the distance between the origin and the destination,
 *  the angle between them and the rate of movement
 *  @param {Object} start of the journey (lat, lon)
 *  @param {Object} end of the journey   (lat, lon)
 *  @param {Number} rate (relative rate) of advance (0 to 1)
*  @returns {Object} lat, lon of the new coordinates  */
function getNewCoords(start, end, rate)  {
    return {lat: (start.lat+(rate*(end.lat-start.lat))),
            lon: (start.lon+(rate*(end.lon-start.lon))) };};

/** Retorna el huso horario de una coordenada LONGITUD */
function getZone(long) {
    return Math.floor(long/15);};
            
//Devuleve el ángulo (en grados) de la tangente de la base y altura de un rectángulo
function getAngleFromTan(base, height) {
    return Math.atan(base/height) * (180 / Math.PI);};
/** Multiplica un numero por 1000, y lo devuelve */
function upScale(num) {
    return num*1000;};
/** Divide un numero por 1000, y lo devuelve */
function downScale(num) {
    return num/1000;};
/* CONTRIBUCION DE OPEN- */
/* CONTRIBUCION DE OPEN-AI */
/* CONTRIBUCION DE OPEN-AI */
/* CONTRIBUCION DE OPEN-AI */
/* CONTRIBUCION DE OPEN-AI */
/* CONTRIBUCION DE OPEN-AI */
//write a function called NewCoordinates that receives start coordinates, end coordinates, and the total percentage of distance progressed towards end,
//and returns the new coordinates for such input. Apply Pythagorean theory when needed
/** Contribucion de OPEN-A.I.   :^)  
 * @param {Object} startCoords coordinadas origen
 * @param {Object} endCoords   coordenadas destino
 * @returns {Object} ratio de avance (de 0 a 1)     */
/* function getNewCoords(startCoords, endCoords, percentage) {
    if (percentage > 0 && percentage < 1) {// First, we'll calculate the total distance between the start and end coordinates
        let totalDistance = getDistance(startCoords, endCoords);
        // Then, we'll calculate the distance that has been traveled based on the percentage
        let traveledDistance = totalDistance * percentage;
        // Next, we'll use the traveled distance to calculate the new latitude and longitude using the Pythagorean theorem
        let deltaLat = endCoords.lat - startCoords.lat;
        let deltaLng = endCoords.lon - startCoords.lon;
        let a = Math.pow(deltaLat, 2) + Math.pow(deltaLng, 2);
        let b = 2 * deltaLat * traveledDistance;
        let c = Math.pow(traveledDistance, 2) - Math.pow(totalDistance, 2);
        let newLat = (-b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
        let newLng = (-b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
        // Finally, we'll return the new coordinates
        return {
            lat: (startCoords.lat + newLat),
            lon: (startCoords.lon + newLng)
        };
    } else if (percentage == 0) {
        return startCoords;
    } else if (percentage == 1) {
        return endCoords;
    } else {
        throw new Error('RATE debe estar entre 0 y 1!');
    };
}; */

// This function calculates the distance between two locations in miles
/*   function getDistance(origin, destination) {
      // First, we'll convert the locations to radians
      let originLatRad = origin.lat * (Math.PI / 180);
      let originLngRad = origin.lon * (Math.PI / 180);
      let destLatRad = destination.lat * (Math.PI / 180);
      let destLngRad = destination.lon * (Math.PI / 180);
      // Then, we'll use the Haversine formula to calculate the distance
      let earthRadius = 3959 ;//3959 // 3959 miles = 6371  kilometers
      let distance = Math.acos(Math.sin(originLatRad) * Math.sin(destLatRad) +
      Math.cos(originLatRad) * Math.cos(destLatRad) *
      Math.cos(destLngRad - originLngRad)) * earthRadius;
      // Finally, we'll return the distance
      return distance;} */

export { getNewCoords, getAbsoluteDiff, getDistance, getAngleFromSin, getSinFromRectangle};