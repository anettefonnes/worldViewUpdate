
var scene, camera, renderer, rotation;
var material, earth, light, stars, worldEvent;
var scalar, anchScalar;


init();
animate();

function init(){
    var width = window.innerWidth - 20;
    var height = window.innerHeight - 20;

    scene = new THREE.Scene();

    earth = new World();
    scene.add(earth);

    //TODO - make Event list and/or controller
    var worldEvent1 = new Event(10,5);
    earth.addEvent(worldEvent1);
    worldEvent1.addMesh(
        new THREE.Mesh(
            new THREE.SphereGeometry(2, 10,10),
            new THREE.MeshBasicMaterial({color: 0xf0ff00})
    ));
    var worldEvent2 = new Event(180,0);
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

    var mid = midPoint(60,5,100,30);
    var midA = midPointXYZ(worldEvent1.position, mid);
    var midB = midPointXYZ(mid, worldEvent2.position);

    //var curveObject = new CurvedLine(worldEvent1, worldEvent2, 0xff0000);
    //Line between two events
    /*
    var curve = new THREE.QuadraticBezierCurve3(
        worldEvent1.position,
        mid.clone().multiplyScalar(1.4),
        worldEvent2.position
    ); */ /*
    var curve = new THREE.SplineCurve3([
        worldEvent1.position,
        midA.multiplyScalar(3),
        mid.clone().multiplyScalar(4),
        midB.multiplyScalar(3),
        worldEvent2.position
    ]);
    var geom = new THREE.Geometry();
    geom.vertices = curve.getPoints( 100 );
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    var curveObject = new THREE.Line( geom, material );
    scene.add(curveObject);
    earth.add(curveObject);*/

    // Sjekker distansen mellom to punkter til linjen, og setter verdien til scalaren

    var dist = worldEvent1.position.clone().sub(worldEvent2.position).length();
    var distHeight = earth.rad + dist * 0.7;
    var start = worldEvent1.position;
    var end = worldEvent2.position;
    var midP = start.clone().lerp(end, 0.5);
    var midL = midP.length();

    scalar = 0.3;
    anchScalar = 1.0;
    if(dist > 350) {
        scalar = 0.5;
        anchScalar = 1.1;
    }

    midP.normalize();
    midP.multiplyScalar(midL + dist * scalar);
    var normal = (new THREE.Vector3()).sub(start,end);
    normal.normalize();

    var distHalf = dist * 0.5;
    var startAnch = start.clone().multiplyScalar(anchScalar);
    var startA = midP.clone().add(normal.clone().multiplyScalar(distHalf));
    var endB = midP.clone().add(normal.clone().multiplyScalar(-distHalf));
    var endAnch = end.clone().multiplyScalar(anchScalar);

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

    //Create an object curvedLine.
    //var curveGeom2 = new CurvedLine(worldEvent3, eventBergen);
    //var curveObj2 = new THREE.Line(curveGeom2, material);
    //scene.add(curveObj2);
    //earth.add(curveObj2);

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.z = 550;
    camera.position.y = 200;
 //   earth.add(camera);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    //light adding
    scene.add(new THREE.AmbientLight(0xe0e0e0));
    light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(200,0,500);
    scene.add(light);

    stars = createStars(100, 200);
    scene.add(stars);


    //window.setInterval(changeParent(), 3000);

    document.body.appendChild(renderer.domElement);
   // document.addEventListener("keydown", keyPressed, true);
}

//TODO: Get more realistic stars. Use Parallax pixel stars / SCSS?
function createStars(rad, seg) {
    return new THREE.Mesh(
        new THREE.SphereGeometry(rad*10 , seg, seg),
        new THREE.MeshBasicMaterial({
            map:    THREE.ImageUtils.loadTexture('img/stars.png'),
            side:   THREE.BackSide
        })
    );
}

//TODO: More action in this function; rotation, light etc.?
function animate() {
    requestAnimationFrame(animate);

    earth.rotate();
    camera.lookAt(earth.position);

    renderer.render(scene, camera);
}

function toRadians(ang) {
    return ang * (Math.PI / 180);
}

//TODO: Make this function work!
function midPoint(lo1, la1, lo2, la2) {
    var lat1 = toRadians(la1), lon1 = toRadians(lo1), lat2=toRadians(la2), lon2=toRadians(lo2);
    var vec1 = new THREE.Vector3(
        Math.cos(lat1) * Math.cos(lon1),
        Math.cos(lat1) * Math.sin(lon1),
        Math.sin(lat1));
    var vec2 = new THREE.Vector3(
        Math.cos(lat2) * Math.cos(lon2),
        Math.cos(lat2) * Math.sin(lon2),
        Math.sin(lat2));

    return new THREE.Vector3(earth.rad*((vec1.x + vec2.x)/2), earth.rad*((vec1.y + vec2.y)/2), earth.rad * ((vec1.z + vec2.z)/2) );
}

function midPointXYZ(a, b) {
    return new THREE.Vector3(((a.x + b.x)/2), ((a.y + b.y)/2), ((a.z + b.z)/2));
}

/**
 * Created by Anette on 27.02.2015.
 */

