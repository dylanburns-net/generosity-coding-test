import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( '#dddddd' );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 1;

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );




/*-------------------
操作（回転、並行移動、拡大）
--------------------*/
const controls = new OrbitControls( camera, renderer.domElement );
controls.listenToKeyEvents(window);
controls.enableDamping = true;
controls.keys = {
	LEFT: 'ArrowRight',
	UP: 'ArrowDown',
	RIGHT: 'ArrowLeft',
	BOTTOM: 'ArrowUp'
}

/*-------------------
GLTFローダー
--------------------*/
const loader = new GLTFLoader();

loader.load( '/public/YellowDuck1glb.glb', function ( gltf ) {
	scene.add( gltf.scene );

	//画面の高さの収まるようにモデルの高さを1に変更する
	const boundingBox = new THREE.Box3().setFromObject( gltf.scene );
	const size = boundingBox.getSize(new THREE.Vector3());
	const scale = 1 / size.y;
	gltf.scene.scale.set(scale, scale, scale);
	//モデルを真ん中にする
	gltf.scene.position.setY(-0.5);

}, undefined, function ( error ) {
	console.error( error );
} );

/*-------------------
ライト
--------------------*/
const ambientLight = new THREE.AmbientLight( 0xFFFFFF ); //  white light
scene.add( ambientLight );


/*-------------------
Animate loop
--------------------*/
function animate() {
	controls.update();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();