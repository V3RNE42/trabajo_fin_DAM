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
function getNewCoords(start, end, rate)  {
    return {lat: (start.lat+(rate*(end.lat-start.lat))),
            lon: (start.lon+(rate*(end.lon-start.lon))) };};


export { getNewCoords, getAbsoluteDiff};