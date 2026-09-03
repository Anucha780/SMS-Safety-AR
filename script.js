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

scene.add(
  new THREE.AmbientLight(
    0xffffff,
    2
  )
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

const anchorRoot =
  new THREE.Group();

anchor.group.add(
  anchorRoot
);

const dinoRoot =
  new THREE.Group();

anchorRoot.add(
  dinoRoot
);

dinoRoot.position.set(
  0,
  -0.15,
  0.02
);

let dinoModel = null;

let targetVisible = false;

let revealProgress = 0;


// ========================================
// SETTINGS
// ========================================

// Dino เริ่มเล็กแค่ไหน
const START_SCALE =
  0.18;


// Dino ใหญ่สุดแค่ไหน
const MAX_SCALE =
  2.6;


// ระยะกล้องใกล้
const MIN_DISTANCE =
  0.7;


// ระยะกล้องไกล
const MAX_DISTANCE =
  2.8;


// ความเร็วตอนโผล่ออกจากภาพ
const REVEAL_SPEED =
  0.025;


// ระยะที่ Dino ดันออกจากภาพ
const POP_OUT_DISTANCE =
  0.65;


// ========================================
// LOAD MODEL
// ========================================

const loader =
  new GLTFLoader();


loader.load(

  "./models/dino.glb",

  (gltf) => {

    const model =
      gltf.scene;


    // ------------------------------------
    // Normalize model size
    // ------------------------------------

    const box =
      new THREE.Box3()
        .setFromObject(model);


    const size =
      new THREE.Vector3();

    box.getSize(size);


    const maxDimension =
      Math.max(
        size.x,
        size.y,
        size.z
      );


    const normalizedScale =
      1 / maxDimension;


    model.scale.setScalar(
      normalizedScale
    );


    // ------------------------------------
    // Center model
    // ------------------------------------

    const newBox =
      new THREE.Box3()
        .setFromObject(model);


    const center =
      new THREE.Vector3();

    newBox.getCenter(center);


    model.position.x -=
      center.x;

    model.position.y -=
      center.y;


    // ------------------------------------
    // FIXED ROTATION
    //
    // ไม่ animate rotation
    // Dino จะไม่หมุน/พลิกเอง
    // ------------------------------------

    model.rotation.set(
      0,
      Math.PI / 2,
      0
    );


    dinoRoot.scale.setScalar(
      0.6
    );

    dinoRoot.position.set(
      0,
      -0.15,
      0.15
    );


    dinoModel =
      model;


    dinoRoot.visible =
      false;


    console.log(
      "DINO READY"
    );

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
// TARGET FOUND
// ========================================

anchor.onTargetFound =
  () => {

    targetVisible =
      true;


    dinoRoot.visible =
      true;


    dinoRoot.rotation.set(
      0,
      0,
      0
    );


    statusText.textContent =
      "DINOCAP FOUND ✓";

  };


// ========================================
// TARGET LOST
// ========================================

anchor.onTargetLost =
  () => {

    targetVisible =
      false;


    dinoRoot.visible =
      false;


    statusText.textContent =
      "Point camera at DINOCAP";

  };


// ========================================
// TEMP VECTOR
// ========================================

const cameraPosition =
  new THREE.Vector3();


const targetPosition =
  new THREE.Vector3();


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

        if (
          targetVisible &&
          dinoModel
        ) {

          // ตอนนี้ยังไม่ทำ animation
          // เอาไว้เช็ก orientation อย่างเดียว

        }


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