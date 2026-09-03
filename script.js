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
// STATE
// ========================================

let targetVisible =
  false;

let modelLoaded =
  false;

let dinoModel =
  null;

let turnProgress =
  0;

let isTurning =
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


// ซ่อนก่อนจนกว่า target จะถูกพบ
dinoRoot.visible =
  false;


// ========================================
// LOAD DINO
// ========================================

const loader =
  new GLTFLoader();


loader.load(

  "./models/dino.glb",


  // ======================================
  // SUCCESS
  // ======================================

  (gltf) => {

    console.log(
      "DINO LOAD SUCCESS"
    );


    const model =
      gltf.scene;


    // ====================================
    // ORIGINAL SIZE
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


    // ====================================
    // NORMALIZE MODEL
    // ====================================

    const normalizedScale =
      0.7 / maxDimension;


    model.scale.setScalar(
      normalizedScale
    );


    // ====================================
    // CENTER MODEL
    // ====================================

    const scaledBox =
      new THREE.Box3()
        .setFromObject(model);


    const center =
      new THREE.Vector3();

    scaledBox.getCenter(
      center
    );


    model.position.set(
      -center.x,
      -center.y,
      -center.z
    );


    // ====================================
    // INITIAL ROTATION
    //
    // เริ่มจากหันหน้าหากล้อง
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


    modelLoaded =
      true;


    // ====================================
    // ROOT POSITION
    //
    // เริ่มจากกลาง DINOCAP
    // ====================================

    dinoRoot.position.set(
      0,
      0,
      0.15
    );


    dinoRoot.scale.setScalar(
      0.75
    );


    // ถ้า target ถูกเจอไปแล้ว
    // ให้ Dino แสดงทันที
    if (
      targetVisible
    ) {

      dinoRoot.visible =
        true;


      turnProgress =
        0;


      isTurning =
        true;


      statusText.textContent =
        "DINOCAP FOUND ✓";

    }

    else {

      statusText.textContent =
        "DINO READY ✓";

    }

  },


  // ======================================
  // PROGRESS
  // ======================================

  undefined,


  // ======================================
  // ERROR
  // ======================================

  (error) => {

    console.error(
      "DINO LOAD ERROR:",
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

    console.log(
      "DINOCAP FOUND"
    );


    targetVisible =
      true;


    if (
      modelLoaded &&
      dinoModel
    ) {

      // แสดง Dino
      dinoRoot.visible =
        true;


      // กลับมาเริ่มที่ตรงกลาง
      dinoRoot.position.set(
        0,
        0,
        0.15
      );


      // เริ่มจากหันหน้าหากล้อง
      dinoModel.rotation.set(
        0,
        Math.PI / 2,
        0
      );


      // เริ่ม animation ใหม่
      turnProgress =
        0;


      isTurning =
        true;


      statusText.textContent =
        "DINOCAP FOUND ✓";

    }

    else {

      statusText.textContent =
        "DINOCAP FOUND / DINO LOADING...";

    }

  };


// ========================================
// TARGET LOST
// ========================================

anchor.onTargetLost =
  () => {

    console.log(
      "DINOCAP LOST"
    );


    targetVisible =
      false;


    dinoRoot.visible =
      false;


    isTurning =
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
      modelLoaded
        ? "Point camera at DINOCAP"
        : "Loading Dino...";


    // ====================================
    // ANIMATION LOOP
    // ====================================

    renderer.setAnimationLoop(
      () => {


        // =================================
        // DINO TURN
        // =================================

        if (
          targetVisible &&
          dinoModel &&
          isTurning
        ) {

          // ความเร็วการหมุน
          turnProgress +=
            0.01;


          turnProgress =
            THREE.MathUtils.clamp(
              turnProgress,
              0,
              1
            );


          // Smoothstep
          const smooth =
            turnProgress *
            turnProgress *
            (
              3 -
              2 * turnProgress
            );


          // เริ่มจากหันหน้าหากล้อง
          // แล้วค่อย ๆ หมุนเป็นด้านข้าง
          dinoModel.rotation.y =
            THREE.MathUtils.lerp(
              Math.PI / 2,
              0,
              smooth
            );


          // =================================
          // จบ animation
          // =================================

          if (
            turnProgress >= 1
          ) {

            isTurning =
              false;


            dinoModel.rotation.y =
              0;

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