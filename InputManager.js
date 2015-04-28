/**
 * Created by Christer on 22.04.2015.
 */
// Code for
var connection = $.hubConnection();
var input = connection.createHubProxy('input');

// Define methods to the added
input.on('newEvent',
    function(longitude, latitude) {
       var posVertice = GeoLocToVec3D(longitude, latitude);
});


function GeoLocToVec3D(lo, la) {

    lo = Number(lo).toRadians();
    la = Number(la).toRadians();

    var vec = new THREE.Vector3(
        Math.cos(la) * Math.cos(lo),
        Math.cos(la) * Math.sin(lo),
        Math.sin(la)
    );
    return vec;
}




if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}
