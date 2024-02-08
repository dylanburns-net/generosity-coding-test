import * as THREE from 'three';

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