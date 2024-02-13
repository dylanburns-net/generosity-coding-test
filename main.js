import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from "three/addons/libs/tween.module.js";
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( '#7b94ba' );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 1;

//const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );




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
HTMLのボタンなど
--------------------*/
const fileUpload = document.getElementById('file-upload');
const fileUploadForm = document.getElementById('file-upload-form');
const fileUploadFormCloseButton = document.getElementById('form-close-button');
const uploadButton = document.getElementById('upload-button');
const errorWindow = document.getElementById('error-window');

//右下のアップロードボタンを押す時
uploadButton.addEventListener('click', function() {
	//右下のボタンを非表示
	uploadButton.classList.add("hidden");
	//アップロード画面を表示
	fileUploadForm.classList.remove("minified");
}, false);

//アップロード画面の閉じるボタンを押す時
fileUploadFormCloseButton.addEventListener('click', function() {
	//アップロード画面を非表示
	fileUploadForm.classList.add("minified");
	//右下のボタンを表示
	uploadButton.classList.remove("hidden");
}, false);

/*-------------------
GLTFをアップロード
--------------------*/
const loader = new GLTFLoader();
var model;

//ファイルアップロードする時に
fileUpload.onchange = function() {
	//アップロード画面を非表示
	fileUploadForm.classList.add("minified");
	//アップロード画面の閉じるボタンを表示する（非表示は最初だけ）
	fileUploadFormCloseButton.classList.remove("hidden");
	//アップロードされたファイルでURL Blobを作る
	const uploadedFile = fileUpload.files[0];
	const url = URL.createObjectURL(uploadedFile);
	loader.load( url, function ( gltf ) {
		fileUpload.value= null;
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
		//右下のボタンを表示
		uploadButton.classList.remove("hidden");
	}, function (){  }, function (){
		//エラーの場合
	    URL.revokeObjectURL(url);
	    console.log("エラーが発生しました");
	    //エラーメッセージを表示
	    errorWindow.classList.add("visible");
	    //3秒後にエラーメッセージを非表示
	    setTimeout(function(){errorWindow.classList.remove("visible");}, 3000);
	    //右下のボタンを表示
		uploadButton.classList.remove("hidden");
	});
};


/*--------------------------------
GLTFを画面に収まって、真ん中に設置する
---------------------------------*/
function fitModelToWindow(){
	//画面の高さの収まるようにモデルの高さを1に変更する
	const boundingBox = new THREE.Box3().setFromObject( model );
	//const helper = new THREE.Box3Helper( box, 0xffff00 );
	//scene.add( helper );
	console.log(boundingBox.min.y);
	const size = boundingBox.getSize(new THREE.Vector3());
	//あるモデルがY:0の上に載ってる、他のあるモデルがY:0を中心にしてる。それに対応するためのoffset
	const modelYOffset = boundingBox.min.y * -1;
	//モデルを高さ１に拡大/縮小する
	var scale = 1 / size.y;
	model.scale.set(scale, scale, scale);
	//モデルを真ん中にする
	model.position.setY(-0.5 + (modelYOffset * scale));

	//画面の幅にも収まるように
	var GLTFRatio = size.x / size.y;
	var windowRatio = window.innerWidth / window.innerHeight;
	//GLTFの縦横比が画面の縦横比より大きい（横長い）ならそれほど小さくする
	if(GLTFRatio > windowRatio){
		scale = scale * (windowRatio / GLTFRatio);
		model.scale.set(scale, scale, scale);
		//モデルをまた真ん中にする
		model.position.setY(size.y * scale * -0.5 + (modelYOffset * scale));
	}
}


/*-------------------
HDRI
--------------------*/
const pmremGenerator = new THREE.PMREMGenerator( renderer );
const hdriLoader = new RGBELoader()
hdriLoader.load( 'public/kloofendal_43d_clear_puresky_4k.hdr', function ( texture ) {
  const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
  texture.dispose(); 
  scene.environment = envMap
  scene.background = envMap;
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