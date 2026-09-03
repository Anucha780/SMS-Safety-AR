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

const dinoRoot =
  new THREE.Group();

anchor.group.add(
  dinoRoot
);


let dinoModel = null;

let targetVisible = false;

let revealProgress = 0;


// ========================================
// SETTINGS
// ========================================

// Dino เริ่มเล็กแค่ไหน
const START_SCALE =
  0.35;


// Dino ใหญ่สุดแค่ไหน
const MAX_SCALE =
  1.8;


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
  0.35;


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
      0,
      0
    );


    dinoRoot.add(
      model
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


    revealProgress =
      0;


    dinoRoot.visible =
      true;


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


          // =================================
          // 1. REVEAL ANIMATION
          // =================================

          revealProgress +=
            REVEAL_SPEED;


          revealProgress =
            THREE.MathUtils.clamp(
              revealProgress,
              0,
              1
            );


          // smooth animation
          const easedReveal =
            revealProgress *
            revealProgress *
            (
              3 -
              2 *
              revealProgress
            );


          // Dino ดันออกจาก image
          dinoRoot.position.z =
            THREE.MathUtils.lerp(
              0.02,
              POP_OUT_DISTANCE,
              easedReveal
            );


          // =================================
          // 2. CAMERA DISTANCE
          // =================================

          camera.getWorldPosition(
            cameraPosition
          );


          anchor.group.getWorldPosition(
            targetPosition
          );


          const distance =
            cameraPosition.distanceTo(
              targetPosition
            );


          // =================================
          // 3. DISTANCE → SCALE
          // =================================

          const normalizedDistance =
            THREE.MathUtils.clamp(

              (
                distance -
                MIN_DISTANCE
              )
              /
              (
                MAX_DISTANCE -
                MIN_DISTANCE
              ),

              0,
              1

            );


          const distanceScale =
            THREE.MathUtils.lerp(
              START_SCALE,
              MAX_SCALE,
              normalizedDistance
            );


          // reveal ตอนแรกให้ตัวเล็กก่อน
          const revealScale =
            THREE.MathUtils.lerp(
              0.15,
              1,
              easedReveal
            );


          const finalScale =
            distanceScale *
            revealScale;


          dinoRoot.scale.setScalar(
            finalScale
          );

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