//TODO: Make lists/arrays that hold events
//TODO: Put curved line in own class
//TODO: Make a class that deals with events (one marker)
//TODO: Make a class that deals with transfers (two markers + curved line)
//TODO: Make a class (InputManager) that send events to the right class ( Events or Transfers )
"use strict";
//Global variables
//---------------------------------------------------------------------
var scene, camera, renderer, rotation;
var material, earth, light, stars, worldEvent;
var scalar, anchScalar;
var locked = true, lockEarth = false;
var camPosZ, camPosX, camPosY, keyCode;
var particleGeometry, particles;
//-----------------------------------------------------------------------------

init();
animate();

function init(){
    var width = window.innerWidth;
    var height = window.innerHeight;

//Scene
//-----------------------------------------------------------------------------
    scene = new THREE.Scene();
//-----------------------------------------------------------------------------


//Earth
//-----------------------------------------------------------------------------
    earth = new World();
    scene.add(earth);
//-----------------------------------------------------------------------------


//Clouds
//-----------------------------------------------------------------------------
    var clouds = createClouds(earth.rad, earth.seg);
    scene.add(clouds);
    earth.add(clouds);
//-----------------------------------------------------------------------------


//Stars
//-----------------------------------------------------------------------------
    stars = createStars(earth.rad, earth.seg);
    scene.add(stars);
//-----------------------------------------------------------------------------


//TODO - make Event list and/or controller
//Making events
//-----------------------------------------------------------------------------
    var worldEvent1 = new Event(60.394704, -5.317647 );
    earth.addEvent(worldEvent1);
    worldEvent1.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 10,10),
            new THREE.MeshBasicMaterial({color: 0xf0ff00})
    ));

    var worldEvent2 = new Event(8.6,-77.2);
    worldEvent2.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(1, 10,10),
            new THREE.MeshBasicMaterial({color: 0xff0000})
        ));

    earth.addEvent(worldEvent2);
    var worldEvent3 = new Event(-34,-18.38);
    worldEvent3.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(2, 10,10),
            new THREE.MeshBasicMaterial({color: 0xff00ff})
        ));
    earth.addEvent(worldEvent3);

    var eventBergen = new Event(-46.4 , -168.5);
    eventBergen.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(2, 10,10),
            new THREE.MeshBasicMaterial({color: 0xffffff})
        ));
    earth.addEvent(eventBergen);

    var worldEvent4 = new Event(71.1 , 156.7);
    worldEvent4.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(2, 10,10),
            new THREE.MeshBasicMaterial({color: 0xffffff})
        ));
    earth.addEvent(worldEvent4);


    var eventOslo = new Event(59.921051, -10.726376);
    eventOslo.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 10,10),
            new THREE.MeshBasicMaterial({color: 0xffffff})
        ));
    earth.addEvent(eventOslo);
//-----------------------------------------------------------------------------


//Curved Line
//---------------------------------------------------------------------------------------------------
//Midpoint and event-positions
    var dist = worldEvent1.position.clone().sub(worldEvent2.position).length();
    var start = worldEvent1.position;
    var end = worldEvent2.position;
    var midP = start.clone().lerp(end, 0.5);
    var midL = midP.length();

//Check distance and set scalar-multiplier
    scalar = 0.3;
    anchScalar = 1.0;
    if(dist > 350) {
        scalar = 0.5;
        anchScalar = 1.1;
    }

//Multiply Midpoint
    midP.normalize();
    midP.multiplyScalar(midL + dist * scalar);
    var normal = (new THREE.Vector3()).subVectors(start,end);
    normal.normalize();

//Make "anchors" along the curve-path
    var distHalf = dist * 0.5;
    var startAnch = start.clone().multiplyScalar(anchScalar);
    var startA = midP.clone().add(normal.clone().multiplyScalar(distHalf));
    var endB = midP.clone().add(normal.clone().multiplyScalar(-distHalf));
    var endAnch = end.clone().multiplyScalar(anchScalar);

//Make curves, get points, create geometry + material
    var splineCurveA = new THREE.CubicBezierCurve3(start, startAnch, startA, midP);
    var splineCurveB = new THREE.CubicBezierCurve3(midP, endB, endAnch, end);
    var material = new THREE.MeshBasicMaterial( { color : 0x550055 } );
    var points = splineCurveA.getPoints(50);
    points = points.splice(0, points.length-1);
    points = points.concat(splineCurveB.getPoints(50));
    var geometry = new THREE.Geometry();
    for(var i = 0; i < points.length; i++) {
        geometry.vertices = points[i];
    }
    /*
    points.push(new THREE.Vector3(0,0,0));
    var curveGeom = new THREE.Geometry();
    curveGeom.vertices = points;
    var curveObject = new THREE.Line( curveGeom, material );
    scene.add(curveObject);
    earth.add(curveObject);

    var extrude = {
        steps: 10,
        bevelEnabled: false,
        extrudePath: splineCurveA
    };
    var shape = new THREE.Shape(points);
    */

    //TODO: Connect the two lines into one path, maybe a SplineCurve?
    //Tubegeometry that follows the path of the two curves.
    var geo = new THREE.TubeGeometry(splineCurveA, 50, 0.6, 8, false);
    var geo2 = new THREE.TubeGeometry(splineCurveB, 50, 0.6, 8, false);
    var m = new THREE.Mesh(geo, material);
    var m2 = new THREE.Mesh(geo2, material);
    scene.add(m);
    earth.add(m);
    scene.add(m2);
    earth.add(m2);
//-------------------------------------------------------------------------------------------------


//Particle along curve
//-----------------------------------------------------------------------------
    var numParticles = 1;
    var animationPoints = points;
    particleGeometry = new THREE.Geometry();
    for(var i = 0; i < numParticles; i++){
        var desiredIndex = i / numParticles * animationPoints.length;
        var rIndex = constrain(Math.floor(desiredIndex),0,animationPoints.length-1);
        var particle = new THREE.Vector3();
        particle = animationPoints[rIndex].clone();
        particle.moveIndex = rIndex;
        particle.nextIndex = rIndex+1;
        if(particle.nextIndex >= animationPoints.length ) {
            particle.nextIndex = 0;
        }
        particle.lerpN = 0;
        particle.path = animationPoints;
        particleGeometry.vertices.push( particle );
    }

    var pMaterial = new THREE.ParticleBasicMaterial({
        color: 0xff0000,
        size: 60,
        map: THREE.ImageUtils.loadTexture(
            "img/map_mask.png"
        ),
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    particles = new THREE.ParticleSystem( particleGeometry, pMaterial );
    particles.sortParticles = true;
    particles.dynamic = true;
    scene.add(particles);
    earth.add(particles);

    //Function that updates
    particles.update = function(){
        for( var k in this.geometry.vertices ){
            var particle = this.geometry.vertices[k];
            var path = particle.path;
            particle.lerpN += 0.05;
            if(particle.lerpN > 1){
                particle.lerpN = 0;
                particle.moveIndex = particle.nextIndex;
                particle.nextIndex++;
                if( particle.nextIndex >= path.length ){
                    particle.moveIndex = 0;
                    particle.nextIndex = 1;
                }
            }
            var currentPoint = path[particle.moveIndex];
            var nextPoint = path[particle.nextIndex];
            particle.copy( currentPoint );
            particle.lerp( nextPoint, particle.lerpN );
        }
        this.geometry.verticesNeedUpdate = true;
    };
//-----------------------------------------------------------------------------

//Light
//-----------------------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xcbcbcb));
    light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(200,0,500);
    scene.add(light);
//-----------------------------------------------------------------------------


//Camera
//-----------------------------------------------------------------------------
    camPosX = 0;
    camPosZ = 650;
    camPosY = 150;
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.z = camPosZ;
    camera.position.y = camPosY;
//-----------------------------------------------------------------------------


//Renderer
//-----------------------------------------------------------------------------
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
//-----------------------------------------------------------------------------


    document.body.appendChild(renderer.domElement);
    document.addEventListener("keydown", keyPressed, false);
    window.addEventListener("resize", resizeWindow, false);
}


//TODO: Get more realistic stars. Use Parallax pixel stars / SCSS?
function createStars(rad, seg) {
    return new THREE.Mesh(
        new THREE.SphereGeometry(rad*10 , seg, seg),
        new THREE.MeshBasicMaterial({
            map:    THREE.ImageUtils.loadTexture('img/stars5.jpg'),
            side:   THREE.BackSide,
            transparent: true,
            opacity: 0.35
        })
    );
}

function createClouds(rad, seg) {
        var cloudGeo = new THREE.SphereGeometry(rad, seg, seg);
        var cloudText = THREE.ImageUtils.loadTexture("img/fair_clouds.png");
        var cloudMat = new THREE.MeshPhongMaterial({ map: cloudText, transparent: true });
        var cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        cloudMesh.scale.set(1.005, 1.005, 1.005);
        return cloudMesh;
}


//TODO: More action in this function; rotation, light etc.?
function animate() {
    requestAnimationFrame(animate);

    earth.rotate();
    if(locked) {
        camera.lookAt(earth.position); }

    if(lockEarth){
        earth.rotationSpeed = 0;
    } else {
        earth.rotationSpeed = 0.003; }

    particles.update();

    renderer.render(scene, camera);
}


//Controls important events
function keyPressed(event) {
    keyCode = event.which;

    //Arrow up
    if(keyCode == 38 && camPosZ ) { camPosZ -= 5; }

    //Arrow down
    if(keyCode == 40) { camPosZ += 5; }

    //Arrow left
    if(keyCode == 37) { camPosX -= 5; }

    //Arrow right
    if(keyCode == 39) { camPosX += 5; }

    if(keyCode == 107) { camPosY += 5; }
    if(keyCode == 109) { camPosY -= 5; }

    camera.position.z = camPosZ;
    camera.position.y = camPosY;
    camera.position.x = camPosX;

    //'l', Locks/Unlocks the camera pointing at the root of the earth
    if(keyCode == 76){ locked = !locked; }

    //'r', stops/starts rotating earth
    if(keyCode == 82){ lockEarth = !lockEarth; }
}

//Dynamically changes the canvas-size when you resize the window
function resizeWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//Constrains the values
function constrain(v, min, max){
    if( v < min )
        v = min;
    else
    if( v > max )
        v = max;
    return v;
}