import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from "three/addons/libs/tween.module.js";

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
	LEFT: 'KeyA',
	UP: 'KeyW',
	RIGHT: 'KeyD',
	BOTTOM: 'KeyS'
}


/*-------------------
キーボードで拡大の操作
--------------------*/
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    //「↑」キーを押すと拡大
    if(keyCode==38){
    	adjustZoom( -0.05 );
    }
    //「↓」キーを押すと縮小
    else if(keyCode==40){
    	adjustZoom( 0.05 );
    }
};

function adjustZoom(adjustAmount){
  var dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.negate();
  var dist = controls.getDistance();
  new TWEEN.Tween({val: dist})
    .to({val: adjustAmount + dist}, 100)
    .onUpdate(val => {
      camera.position.copy(controls.target).addScaledVector(dir, val.val);
    })
    .start();
}

/*-------------------
GLTFをアップロード
--------------------*/
const loader = new GLTFLoader();
var model;

//ファイルアップロードする時に
document.getElementById('file-upload').onchange = function() {
	const uploadedFile = document.getElementById("file-upload").files[0];
	//アップロードされたファイルでURL Blobを作る
	const url = URL.createObjectURL(uploadedFile);
	loader.load( url, function ( gltf ) {
		URL.revokeObjectURL(url);
		//前のモデルを削除
		scene.remove( model );
		//カメラをの位置、方向を元に戻す
		controls.reset();
		//新しいモデルを表示
		scene.add( gltf.scene );
		model = gltf.scene;
		//モデルを画面に収まって、真ん中にする
		fitModelToWindow();

	}, function (){  }, function (){
		//エラーの場合
	    URL.revokeObjectURL(url);
	    console.log("エラーが発生しました");
	});
};


/*--------------------------------
GLTFを画面に収まって、真ん中に設置する
---------------------------------*/
function fitModelToWindow(){
	//画面の高さの収まるようにモデルの高さを1に変更する
	const boundingBox = new THREE.Box3().setFromObject( model );
	const size = boundingBox.getSize(new THREE.Vector3());
	var scale = 1 / size.y;
	model.scale.set(scale, scale, scale);
	//モデルを真ん中にする
	model.position.setY(-0.5);

	//画面の幅にも収まるように
	var GLTFRatio = size.x / size.y;
	var windowRatio = window.innerWidth / window.innerHeight;
	//GLTFの縦横比が画面の縦横比より大きい（横長い）ならそれほど小さくする
	if(GLTFRatio > windowRatio){
		scale = scale * (windowRatio / GLTFRatio);
		model.scale.set(scale, scale, scale);
		//モデルをまた真ん中にする
		model.position.setY(size.y * scale * -0.5);
	}
}

/*-------------------
ライト
--------------------*/
const ambientLight = new THREE.AmbientLight( 0xFFFFFF ); //  white light
scene.add( ambientLight );


/*-------------------
Animate loop
--------------------*/
function animate() {
	TWEEN.update();
	controls.update();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();


/*---------------
Window resize (画面サイズが変更される時に対応)
----------------*/
window.addEventListener("resize", (event) => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});