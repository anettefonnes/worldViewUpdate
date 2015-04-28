//TODO: Make this work!
var CurvedLine = function (from, to)
{

    CurvedLine.__proto__ = Object.create(new THREE.Geometry());
    var dist = from.position.clone().sub(to.position).length();
    var start = from.position;
    var end = to.position;
    var midP = start.clone().lerp(end, 0.5);
    var midL = midP.length();
    midP.normalize();
    midP.multiplyScalar(midL + dist * 0.58);
    var normal = (new THREE.Vector3()).sub(start,end);
    normal.normalize();

    var distHalf = dist / 2;
    var startAnch = start;
    var startA = midP.clone().add(normal.clone().multiplyScalar(distHalf));
    var endB = midP.clone().add(normal.clone().multiplyScalar(-distHalf));
    var endAnch = end;

    var splineCurveA = new THREE.CubicBezierCurve3(start, startAnch, startA, midP);
    var splineCurveB = new THREE.CubicBezierCurve3(midP, endB, endAnch, end);
    var points = splineCurveA.getPoints(50);
    points = points.splice(0, points.length-1);
    points = points.concat(splineCurveB.getPoints(50));
    points.push(new THREE.Vector3(0,0,0));
    var curveGeom = new THREE.Geometry();
    curveGeom.vertices = points;
    this.vertices = points;
    return this;
};