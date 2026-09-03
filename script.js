// ========================================
// IMPORTS
// ========================================

import * as THREE from "three";

import {
  GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
  MindARThree
} from "mindar-image-three";


// ========================================
// HTML ELEMENTS
// ========================================

const container =
  document.getElementById("container");

const statusText =
  document.getElementById("status");


// ========================================
// MINDAR SETUP
// ========================================

const mindarThree =
  new MindARThree({

    container: container,

    imageTargetSrc:
      "./targets/targets.mind",

    maxTrack: 1,

    uiLoading: "yes",

    uiScanning: "yes"

  });


const {
  renderer,
  scene,
  camera
} = mindarThree;


// ========================================
// TARGET
// ========================================

const anchor =
  mindarThree.addAnchor(0);


// ========================================
// LIGHTING
// ========================================

const ambientLight =
  new THREE.AmbientLight(
    0xffffff,
    2
  );

scene.add(
  ambientLight
);


const directionalLight =
  new THREE.DirectionalLight(
    0xffffff,
    3
  );

directionalLight.position.set(
  1,
  2,
  3
);

scene.add(
  directionalLight
);


// ========================================
// DINO ROOT
// ========================================

const dinoRoot =
  new THREE.Group();

anchor.group.add(
  dinoRoot
);


// ตอนเริ่มยังไม่แสดง
dinoRoot.visible =
  false;


let dinoModel =
  null;


// ========================================
// LOAD DINO
// ========================================

const loader =
  new GLTFLoader();


loader.load(

  "./models/dino.glb",


  // SUCCESS
  (gltf) => {

    const model =
      gltf.scene;


    // ------------------------------------
    // GET MODEL SIZE
    // ------------------------------------

    const box =
      new THREE.Box3()
        .setFromObject(model);


    const size =
      new THREE.Vector3();

    box.getSize(
      size
    );


    const maxDimension =
      Math.max(
        size.x,
        size.y,
        size.z
      );


    // ------------------------------------
    // NORMALIZE MODEL SIZE
    // ------------------------------------

    const normalizedScale =
      0.7 / maxDimension;


    model.scale.setScalar(
      normalizedScale
    );


    // ------------------------------------
    // CENTER MODEL
    // ------------------------------------

    const scaledBox =
      new THREE.Box3()
        .setFromObject(model);


    const center =
      new THREE.Vector3();

    scaledBox.getCenter(
      center
    );


    model.position.x -=
      center.x;

    model.position.y -=
      center.y;

    model.position.z -=
      center.z;


    // ====================================
    // DINO ORIENTATION
    //
    // ตอนนี้หมุนแกน Y 90 องศา
    // ถ้ายังหันผิด เราจะปรับตรงนี้จุดเดียว
    // ====================================

    model.rotation.set(
      0,
      Math.PI / 2,
      0
    );


    // ====================================
    // ADD MODEL
    // ====================================

    dinoRoot.add(
      model
    );


    dinoModel =
      model;


    // ====================================
    // POSITION OF WHOLE DINO
    // ====================================

    dinoRoot.position.set(
      0,
      -0.1,
      0.15
    );


    dinoRoot.scale.setScalar(
      0.8
    );


    console.log(
      "DINO LOADED"
    );


    statusText.textContent =
      "Dino ready ✓";

  },


  // PROGRESS
  undefined,


  // ERROR
  (error) => {

    console.error(
      "DINO LOAD ERROR:",
      error
    );


    statusText.textContent =
      "Dino load error";

  }

);


// ========================================
// TARGET FOUND
// ========================================

anchor.onTargetFound =
  () => {

    console.log(
      "DINOCAP FOUND"
    );


    if (dinoModel) {

      dinoRoot.visible =
        true;

    }


    statusText.textContent =
      "DINOCAP FOUND ✓";

  };


// ========================================
// TARGET LOST
// ========================================

anchor.onTargetLost =
  () => {

    console.log(
      "DINOCAP LOST"
    );


    dinoRoot.visible =
      false;


    statusText.textContent =
      "Point camera at DINOCAP";

  };


// ========================================
// START AR
// ========================================

async function start() {

  try {

    statusText.textContent =
      "Starting AR...";


    await mindarThree.start();


    statusText.textContent =
      "Point camera at DINOCAP";


    renderer.setAnimationLoop(
      () => {

        renderer.render(
          scene,
          camera
        );

      }
    );

  }


  catch (error) {

    console.error(
      "AR ERROR:",
      error
    );


    statusText.textContent =
      "AR ERROR";

  }

}


start();