//Global variables
//-----------------------------------------------------------------------------
var scene, camera, renderer, rotation;
var material, earth, light, stars, worldEvent;
var scalar, anchScalar;
var locked = true, lockEarth = false;
var camPosZ, camPosX, keyCode;
//-----------------------------------------------------------------------------

init();
animate();

function init(){
    var width = window.innerWidth - 20;
    var height = window.innerHeight - 20;

    scene = new THREE.Scene();

    earth = new World();
    scene.add(earth);

//TODO - make Event list and/or controller
//Making events
//-----------------------------------------------------------------------------
    var worldEvent1 = new Event(60,-1.5);
    earth.addEvent(worldEvent1);
    worldEvent1.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(2, 10,10),
            new THREE.MeshBasicMaterial({color: 0xf0ff00})
    ));
    var worldEvent2 = new Event(130,0);
    worldEvent2.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(2, 10,10),
            new THREE.MeshBasicMaterial({color: 0xff0000})
        ));
    earth.addEvent(worldEvent2);
    var worldEvent3 = new Event(60,50);
    worldEvent3.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(2, 10,10),
            new THREE.MeshBasicMaterial({color: 0xff00ff})
        ));
    earth.addEvent(worldEvent3);
    var eventBergen = new Event(60.3941216, 5.3115673);
    eventBergen.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(2, 10,10),
            new THREE.MeshBasicMaterial({color: 0xffffff})
        ));
    earth.addEvent(eventBergen);
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
    var normal = (new THREE.Vector3()).sub(start,end);
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
    var points = splineCurveA.getPoints(50);
    points = points.splice(0, points.length-1);
    points = points.concat(splineCurveB.getPoints(50));
    points.push(new THREE.Vector3(0,0,0));
    var curveGeom = new THREE.Geometry();
    curveGeom.vertices = points;
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    var curveObject = new THREE.Line( curveGeom, material );
    scene.add(curveObject);
    earth.add(curveObject);
//-------------------------------------------------------------------------------------------------

//Camera
//-----------------------------------------------------------------------------
    camPosX = 0;
    camPosZ = 650;
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.z = camPosZ;
    camera.position.y = 100;
//-----------------------------------------------------------------------------


//Renderer
//-----------------------------------------------------------------------------
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
//-----------------------------------------------------------------------------


//Light
//-----------------------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xcbcbcb));
    light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(200,0,500);
    scene.add(light);
//-----------------------------------------------------------------------------


//Stars
//-----------------------------------------------------------------------------
    stars = createStars(earth.rad, earth.seg);
    scene.add(stars);
//-----------------------------------------------------------------------------


    document.body.appendChild(renderer.domElement);
}


//TODO: Get more realistic stars. Use Parallax pixel stars / SCSS?
function createStars(rad, seg) {
    return new THREE.Mesh(
        new THREE.SphereGeometry(rad*10 , seg, seg),
        new THREE.MeshBasicMaterial({
            map:    THREE.ImageUtils.loadTexture('img/stars5.jpg'),
            side:   THREE.BackSide
        })
    );
}


//TODO: More action in this function; rotation, light etc.?
function animate() {
    requestAnimationFrame(animate);

    earth.rotate();
    if(locked) {
        camera.lookAt(earth.position);
    }

    if(lockEarth){
        earth.rotationSpeed = 0;
    } else {
        earth.rotationSpeed = 0.003;
    }

    document.addEventListener("keydown", keyPressed, false);

    renderer.render(scene, camera);
}


//Controls important events
function keyPressed(event) {
    keyCode = event.which;

    if(keyCode == 38 && camPosZ > 150 ) {
        camPosZ -= 5;
    }
    if(keyCode == 40) {
        camPosZ += 5;
    }
    if(keyCode == 37) {
        camPosX -= 5;
    }
    if(keyCode == 39) {
        camPosX += 5;
    }
    camera.position.z = camPosZ;
    //camera.position.y = camPosY;
    camera.position.x = camPosX;

    //'l', Lock/Unlock the camera pointing at the root
    if(keyCode == 76){
        locked = !locked;
    }

    //'r', stops/starts rotating earth
    if(keyCode == 82){
        lockEarth = !lockEarth;
    }
}
