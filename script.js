import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import {
  MindARThree
} from "mindar-image-three";


const container =
  document.getElementById("container");

const statusText =
  document.getElementById("status");


// ========================================
// MINDAR
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
// LIGHT
// ========================================

const ambientLight =
  new THREE.AmbientLight(
    0xffffff,
    2
  );

scene.add(ambientLight);


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

scene.add(directionalLight);


// ========================================
// DINO WRAPPER
// ========================================

const dinoRoot =
  new THREE.Group();

anchor.group.add(dinoRoot);


// ========================================
// LOAD DINO
// ========================================

const loader =
  new GLTFLoader();


loader.load(

  "./models/dino.glb",

  (gltf) => {

    const model =
      gltf.scene;


    // ------------------------------------
    // Calculate model size
    // ------------------------------------

    const box =
      new THREE.Box3()
        .setFromObject(model);


    const size =
      new THREE.Vector3();

    box.getSize(size);


    // ------------------------------------
    // Normalize size
    // ------------------------------------

    const maxDimension =
      Math.max(
        size.x,
        size.y,
        size.z
      );


    const normalizedScale =
      0.6 / maxDimension;


    model.scale.setScalar(
      normalizedScale
    );


    // ------------------------------------
    // Center model
    // ------------------------------------

    const boxAfterScale =
      new THREE.Box3()
        .setFromObject(model);


    const center =
      new THREE.Vector3();

    boxAfterScale.getCenter(center);


    model.position.x -=
      center.x;

    model.position.y -=
      center.y;


    // วาง Dino เหนือ target เล็กน้อย
    model.position.z =
      0.05;


    dinoRoot.add(model);


    console.log(
      "DINO LOADED"
    );

    statusText.textContent =
      "Dino ready ✓";

  },


  undefined,


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
// TARGET EVENTS
// ========================================

anchor.onTargetFound =
  () => {

    console.log(
      "TARGET FOUND"
    );

    statusText.textContent =
      "DINOCAP FOUND ✓";

  };


anchor.onTargetLost =
  () => {

    console.log(
      "TARGET LOST"
    );

    statusText.textContent =
      "Point camera at DINOCAP";

  };


// ========================================
// START
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
      "MINDAR ERROR:",
      error
    );


    statusText.textContent =
      "AR ERROR";

  }

}


start();