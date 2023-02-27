/** Returns the absolute difference between two numbers
 *  @param {Number} num1     @param {Number} num2 
 *  @returns {Number} absolute difference between num1 and num2 */
function getAbsoluteDiff(num1, num2)  { 
    return num1>num2? num1-num2 : num2-num1;};

/** Function that returns the new coordinates of a point, 
 *  based on the distance between the origin and the destination,
 *  the angle between them and the rate of movement
 *  @param {Object} start of the journey (lat, lon)
 *  @param {Object} end of the journey   (lat, lon)
 *  @param {Number} rate (relative rate) of advance (0 to 1)
*  @returns {Object} lat, lon of the new coordinates  */
function getNewCoords(startCoords, endCoords, fraction) {
    // First, we'll calculate the angular distance between the start and end coordinates using the Haversine formula
    if (fraction==0) return startCoords;
    if (fraction==1) return endCoords;
    const distance = getAngularDistance(startCoords, endCoords);
    // Then, we'll calculate the interpolated coordinates based on the fraction of distance traveled
    const fractionDistance = fraction * distance;
    const bearing = getBearing(startCoords, endCoords);
    const newCoords = getDestinationCoords(startCoords, fractionDistance, bearing);
    return newCoords;
  }
  
  function getAngularDistance(startCoords, endCoords) {
    const earthRadius = 6371; // assume the earth's radius is 6371 km
    const lat1 = toRadians(startCoords.lat);
    const lat2 = toRadians(endCoords.lat);
    const lng1 = toRadians(startCoords.lon);
    const lng2 = toRadians(endCoords.lon);
    const latDiff = lat2 - lat1;
    const lngDiff = lng2 - lng1;
    const a = Math.sin(latDiff / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDiff / 2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance;
  }

  // This function converts degrees to radians
  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  // This function calculates the bearing between two coordinates
  function getBearing(startCoords, endCoords) {
    const lat1 = toRadians(startCoords.lat);
    const lat2 = toRadians(endCoords.lat);
    const lng1 = toRadians(startCoords.lon);
    const lng2 = toRadians(endCoords.lon);
    const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    const bearing = Math.atan2(y, x);
    return (bearing + 2 * Math.PI) % (2 * Math.PI);
  }
  
  // This function calculates the coordinates at a given distance and bearing from a starting coordinate
  function getDestinationCoords(startCoords, distance, bearing) {
    const earthRadius = 6371; // assume the earth's radius is 6,371 km
    const lat1 = toRadians(startCoords.lat);
    const lng1 = toRadians(startCoords.lon);
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / earthRadius) + Math.cos(lat1) * Math.sin(distance / earthRadius) * Math.cos(bearing));
    const lng2 = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(distance / earthRadius) * Math.cos(lat1), Math.cos(distance / earthRadius) - Math.sin(lat1) * Math.sin(lat2));
    return {
      lat: toDegrees(lat2),
      lon: toDegrees(lng2)
    };
  }
  
  // This function converts radians to degrees
  function toDegrees(radians) {
    return radians * 180 / Math.PI;
  }
  
export { getNewCoords, getAbsoluteDiff};