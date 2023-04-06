'use strict';
import * as THREE from 'three';
import { OrbitControls } from "./ThreeOrbitControlsGizmo/OrbitControls.js";
import { OrbitControlsGizmo } from "./ThreeOrbitControlsGizmo/OrbitControlsGizmo.js";
import { drumMap, stepsPerPattern, numInstruments } from './nodes.js'

let mesh;

function drumMapViz(scene, data, gap) {
    const count = data.flat(3).length;
    const x_len = data.length;
    const y_len = data[0].length;
    const z_len = data[0][0].length;

    const x_center = (x_len - 1) / 2;
    const y_center = (y_len - 1) / 2;
    const z_center = (z_len - 1) / 2 / numInstruments;

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const mesh = new THREE.InstancedMesh(geometry, material, count);

    let i = 0;
    for (var x = 0; x < data.length; x++) {
        for (var y = 0; y < data[0].length; y++) {
            //(x + y) / (x_len + y_len);
            const color = new THREE.Color();
            color.setHSL(i / count, 0.5, 0.5);
            //color.setHSL(Math.random(), 0.5, 0.5);
            for (var inst = 0; inst < numInstruments; inst++) {
                let y_offset = inst * -20;
                for (var z = 0; z < stepsPerPattern; z++) {
                    let step = (numInstruments * inst) + z;

                    const level = (data[x][y][step] + 1) / 256.0;
                    scale.x = scale.y = scale.z = (level * 1.5) + 0.5; // scale's base is 0.5, up to 2

                    position.x = (x_center - x) * gap;
                    position.y = y_offset + (y_center - y) * gap; // y starts at 0
                    position.z = (z_center - z) * gap;

                    matrix.identity();
                    matrix.setPosition(position);
                    matrix.scale(scale)

                    mesh.setColorAt(i, color);
                    mesh.setMatrixAt(i, matrix);
                    mesh.castShadow = true;
                    //mesh.receiveShadow = true;
                    i++
                }
            }
        }
    }
    mesh.position.set(0, 20, 0);
    scene.add(mesh);
}

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
);
scene.add(camera);

const light = new THREE.HemisphereLight(0xffffff, 0x202020);
light.position.set(0, 10000, 0);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(100, 100, 100);
directionalLight.target.position.set(0, 0, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const controlsGizmo = new OrbitControlsGizmo(controls, { size: 100, padding: 8 });
document.body.appendChild(controlsGizmo.domElement);


var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshLambertMaterial();

///////////////////////////////////////////////////////

let gridGap = 3;
let gridOffset = 2;

let cubes = drumMapViz(scene, drumMap, gridGap, gridOffset);

camera.position.z = 100;
camera.position.x = 100;
camera.position.y = 100;

camera.lookAt(0, 0, 0);

///////////////////////////////////////////////////////

//render loop
function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}