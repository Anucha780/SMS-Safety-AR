import * as THREE from "three";

import {
  GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
  MindARThree
} from "mindar-image-three";


// ========================================
// HTML
// ========================================

const container =
  document.getElementById("container");

const statusText =
  document.getElementById("status");


// ========================================
// SETTINGS
// ========================================

// ความเร็ว animation
// มาก = เร็ว
// น้อย = ช้า
const ANIMATION_SPEED =
  0.008;


// จุดเริ่มต้น
const START_SCALE =
  0.35;


// ขนาดตอนจบ
const END_SCALE =
  0.85;


// ระยะ Z ตอนเริ่ม
const START_Z =
  0.05;


// ระยะ Z ตอนจบ
const END_Z =
  0.30;


// ========================================
// STATE
// ========================================

let dinoModel =
  null;

let modelLoaded =
  false;

let targetVisible =
  false;

let animationProgress =
  0;

let animationRunning =
  false;


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
//
// เราจะ animate ตัวนี้
// ไม่ไปหมุน GLB โดยตรง
// ========================================

const dinoRoot =
  new THREE.Group();


anchor.group.add(
  dinoRoot
);


dinoRoot.visible =
  false;


// ========================================
// MODEL HOLDER
//
// ตัวนี้ใช้แก้ orientation ของ GLB อย่างเดียว
// ========================================

const modelHolder =
  new THREE.Group();


dinoRoot.add(
  modelHolder
);


// ========================================
// RESET ANIMATION
// ========================================

function resetDino() {

  animationProgress =
    0;


  animationRunning =
    true;


  // ----------------------------
  // เริ่มตรงกลาง DINOCAP
  // ----------------------------

  dinoRoot.position.set(
    0,
    0,
    START_Z
  );


  // ----------------------------
  // เริ่มตัวเล็ก
  // ----------------------------

  dinoRoot.scale.setScalar(
    START_SCALE
  );


  // ----------------------------
  // เริ่ม rotation
  //
  // จุดนี้คือการหันหน้า
  // ----------------------------

  dinoRoot.rotation.set(
    0,
    Math.PI / 2,
    0
  );

}


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


    // ====================================
    // NORMALIZE MODEL
    // ====================================

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


    model.scale.setScalar(
      0.7 / maxDimension
    );


    // ====================================
    // CENTER MODEL
    // ====================================

    const centeredBox =
      new THREE.Box3()
        .setFromObject(model);


    const center =
      new THREE.Vector3();


    centeredBox.getCenter(
      center
    );


    model.position.set(
      -center.x,
      -center.y,
      -center.z
    );


    // ====================================
    // IMPORTANT
    //
    // GLB ของเราเดิมหันข้าง
    // ปล่อย model rotation = 0
    //
    // การหมุนทั้งหมดไปทำที่ dinoRoot
    // ====================================

    model.rotation.set(
      0,
      0,
      0
    );


    modelHolder.add(
      model
    );


    dinoModel =
      model;


    modelLoaded =
      true;


    console.log(
      "DINO READY"
    );


    if (
      targetVisible
    ) {

      dinoRoot.visible =
        true;


      resetDino();

    }


    statusText.textContent =
      targetVisible
        ? "DINOCAP FOUND ✓"
        : "DINO READY ✓";

  },


  undefined,


  (error) => {

    console.error(
      "DINO ERROR:",
      error
    );


    statusText.textContent =
      "DINO LOAD ERROR";

  }

);


// ========================================
// TARGET FOUND
// ========================================

anchor.onTargetFound =
  () => {

    targetVisible =
      true;


    statusText.textContent =
      "DINOCAP FOUND ✓";


    if (
      modelLoaded
    ) {

      dinoRoot.visible =
        true;


      resetDino();

    }

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


    animationRunning =
      false;


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
      modelLoaded
        ? "Point camera at DINOCAP"
        : "Loading Dino...";


    // ====================================
    // LOOP
    // ====================================

    renderer.setAnimationLoop(

      () => {


        // =================================
        // DINO ANIMATION
        // =================================

        if (
          targetVisible &&
          modelLoaded &&
          animationRunning
        ) {

          animationProgress +=
            ANIMATION_SPEED;


          animationProgress =
            THREE.MathUtils.clamp(
              animationProgress,
              0,
              1
            );


          // smoothstep
          const t =
            animationProgress *
            animationProgress *
            (
              3 -
              2 *
              animationProgress
            );


          // ===============================
          // ROTATE
          //
          // 90° → 0°
          // ===============================

          dinoRoot.rotation.y =
            THREE.MathUtils.lerp(
              Math.PI / 2,
              0,
              t
            );


          // ===============================
          // POP OUT
          // ===============================

          dinoRoot.position.z =
            THREE.MathUtils.lerp(
              START_Z,
              END_Z,
              t
            );


          // ===============================
          // GROW
          // ===============================

          const scale =
            THREE.MathUtils.lerp(
              START_SCALE,
              END_SCALE,
              t
            );


          dinoRoot.scale.setScalar(
            scale
          );


          // ===============================
          // FINISHED
          // ===============================

          if (
            animationProgress >= 1
          ) {

            animationRunning =
              false;


            console.log(
              "DINO ANIMATION FINISHED"
            );

          }

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