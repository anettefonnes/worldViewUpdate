"use strict";
var Event = function(longitude, latitude)
{
    this.__proto__ = Object.create(new THREE.Object3D());
    this.position.copy(GeoLocToVec3D(longitude,latitude));

    this.addMesh = function(mesh){
        this.add(mesh);
    };
};

//TODO GeoLocToVec3D to Input Manager
function GeoLocToVec3D(lo, la) {

    lo = Number(lo).toRadians();
    la = Number(la).toRadians();

    return new THREE.Vector3(
        earth.rad * Math.cos(la) * Math.cos(lo),
        earth.rad * Math.cos(la) * Math.sin(lo),
        earth.rad * Math.sin(la)
    );
}

if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/**
 * Created by Christer on 15.03.2015.
 */
