"use strict";
//This class represents the World
/* this.Variables=
    - root ; THREE.Object3D variable that is sentered as the mid point of the world
    - rotationsSpeed ; defines the speed of the worlds rotation
    - rad ; defines the radius of the worlds outer sphere
    - seg ; defines the segmentation of the sphere
    - texture ; defines the texture image of the spheres texture
    - bumpMap ; defines the bump mapping image on the sphere
    - bumpScale ; defines the scaling of the bump map
    - specularMap ; defines the reflection map image
    - specular ; defines the reflection color

    Functions
    + updateSphere ; updates the spheres texture and size - should be called if attributes are updated
*/



var World = function(){
    this.__proto__ = Object.create(new THREE.Object3D());
    "use strict";
    //Defines the rotation speed
    this.rotationSpeed = 0.003;
    //Defines the radius on the surface
    this.rad = 200;
    //Defines the segmentation of the world
    this.seg = 300;
    //Sets the default texture on the earth
    this.texture = 'img/earth.jpg';
    //Sets the bumpMap and scale for the sphere
    this.bumpMap = 'img/earth_bump.jpg';
    this.bumpScale = 2;
    //Sets the specular map and color for the sphere
    this.specularMap = 'img/water_spec.png';
    this.specular = 'grey';

    //Define some functions
    //Update the Sphere mesh (read: the surface) on the world
    this.updateSurface = function() {
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.rad, this.seg, this.seg),
            new THREE.MeshPhongMaterial({
                map: THREE.ImageUtils.loadTexture(this.texture),
                bumpMap: THREE.ImageUtils.loadTexture(this.bumpMap),
                bumpScale: this.bumpScale,
                specularMap: THREE.ImageUtils.loadTexture(this.specularMap),
                specular: new THREE.Color(this.specular)
            }));
        this.add(sphere);
    }
    //Rotate the world by the rotation
    this.rotate = function(){
        this.rotation.y += this.rotationSpeed;
    }
    //Adds a function set by longitude and latitude, using Euler coordinates
    this.addEvent = function(event) {
        //event.position.multiplyScalar(this.rad);
        this.add(event);
    }

    //Calls update surface
    this.updateSurface();
};

