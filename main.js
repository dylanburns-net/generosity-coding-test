import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 1;

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();


/*-------------------
GLTFローダー
--------------------*/
const loader = new GLTFLoader();

loader.load( '/public/YellowDuck1glb.glb', function ( gltf ) {
	scene.add( gltf.scene );
	gltf.scene.scale.set(0.03, 0.03, 0.03);
}, undefined, function ( error ) {
	console.error( error );
} );

/*-------------------
ライト
--------------------*/
const ambientLight = new THREE.AmbientLight( 0xFFFFFF ); //  white light
scene.add( ambientLight );