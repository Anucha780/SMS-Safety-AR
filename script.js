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
    2.5
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
// BUTTERFLY GROUP
// ========================================

const butterflyGroup =
  new THREE.Group();

anchor.group.add(
  butterflyGroup
);


// ซ่อนจนกว่าจะเจอ DINOCAP
butterflyGroup.visible =
  false;


// ========================================
// STATE
// ========================================

const butterflies = [];

let modelLoaded =
  false;

let targetVisible =
  false;


// ========================================
// BUTTERFLY SETTINGS
// ========================================

const butterflySettings = [

  {
    color: "#ff3b30",
    radiusX: 0.45,
    radiusY: 0.25,
    speed: 1.3,
    offset: 0,
    height: 0.05,
    scale: 0.18
  },

  {
    color: "#007aff",
    radiusX: 0.60,
    radiusY: 0.32,
    speed: 1.0,
    offset: Math.PI * 0.7,
    height: 0.15,
    scale: 0.16
  },

  {
    color: "#ffd60a",
    radiusX: 0.52,
    radiusY: 0.38,
    speed: 1.5,
    offset: Math.PI * 1.4,
    height: 0.25,
    scale: 0.14
  }

];


// ========================================
// RECOLOR MODEL
// ========================================

function recolorModel(
  model,
  color
) {

  model.traverse(
    (child) => {

      if (
        child.isMesh
      ) {

        // clone material
        // เพื่อไม่ให้แต่ละตัวใช้ material เดียวกัน
        child.material =
          child.material.clone();


        // ย้อมสี
        child.material.color.set(
          color
        );

      }

    }
  );

}


// ========================================
// NORMALIZE MODEL
// ========================================

function normalizeModel(
  model
) {

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


  if (
    maxDimension > 0
  ) {

    model.scale.setScalar(
      1 / maxDimension
    );

  }


  // --------------------------------------
  // CENTER MODEL
  // --------------------------------------

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

}


// ========================================
// CREATE BUTTERFLY
// ========================================

function createButterfly(
  originalModel,
  settings
) {

  // Clone model
  const model =
    originalModel.clone(true);


  // ======================================
  // HOLDER
  //
  // holder เป็นตัวที่บิน
  // model อยู่ข้างใน
  // ======================================

  const holder =
    new THREE.Group();


  holder.add(
    model
  );


  // ======================================
  // COLOR
  // ======================================

  recolorModel(
    model,
    settings.color
  );


  // ======================================
  // SIZE
  // ======================================

  holder.scale.setScalar(
    settings.scale
  );


  // ======================================
  // ADD
  // ======================================

  butterflyGroup.add(
    holder
  );


  butterflies.push({

    holder: holder,

    model: model,

    settings: settings

  });

}


// ========================================
// LOAD BUTTERFLY
// ========================================

const loader =
  new GLTFLoader();


loader.load(

  "./models/butterfly.glb",


  // ======================================
  // SUCCESS
  // ======================================

  (gltf) => {

    console.log(
      "BUTTERFLY LOAD SUCCESS"
    );


    const originalModel =
      gltf.scene;


    // ====================================
    // NORMALIZE
    // ====================================

    normalizeModel(
      originalModel
    );


    // ====================================
    // CREATE 3 BUTTERFLIES
    // ====================================

    butterflySettings.forEach(
      (settings) => {

        createButterfly(
          originalModel,
          settings
        );

      }
    );


    modelLoaded =
      true;


    if (
      targetVisible
    ) {

      butterflyGroup.visible =
        true;

    }


    statusText.textContent =
      targetVisible
        ? "BUTTERFLIES FLYING ✓"
        : "BUTTERFLIES READY ✓";

  },


  undefined,


  // ======================================
  // ERROR
  // ======================================

  (error) => {

    console.error(
      "BUTTERFLY LOAD ERROR:",
      error
    );


    statusText.textContent =
      "BUTTERFLY LOAD ERROR";

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
      modelLoaded
    ) {

      butterflyGroup.visible =
        true;


      statusText.textContent =
        "BUTTERFLIES FLYING ✓";

    }

    else {

      statusText.textContent =
        "DINOCAP FOUND / LOADING...";

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


    butterflyGroup.visible =
      false;


    statusText.textContent =
      "Point camera at DINOCAP";

  };


// ========================================
// CLOCK
// ========================================

const clock =
  new THREE.Clock();


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
        : "Loading Butterflies...";


    // ====================================
    // ANIMATION LOOP
    // ====================================

    renderer.setAnimationLoop(
      () => {


        const time =
          clock.getElapsedTime();


        // =================================
        // ANIMATE BUTTERFLIES
        // =================================

        if (
          targetVisible &&
          modelLoaded
        ) {

          butterflies.forEach(
            (butterfly) => {


              const {
                holder,
                settings
              } = butterfly;


              // ===========================
              // ANGLE
              // ===========================

              const angle =
                (
                  time *
                  settings.speed
                )
                +
                settings.offset;


              // ===========================
              // FLY AROUND TARGET
              //
              // X = ซ้าย/ขวา
              // Y = ขึ้น/ลง
              // ===========================

              const x =
                Math.cos(
                  angle
                )
                *
                settings.radiusX;


              const y =
                Math.sin(
                  angle
                )
                *
                settings.radiusY;


              // ===========================
              // Z
              //
              // บินเข้า-ออกจากโปสเตอร์
              // ===========================

              const z =
                settings.height
                +
                Math.sin(
                  angle * 2
                )
                *
                0.12;


              holder.position.set(
                x,
                y,
                z
              );


              // ===========================
              // BOBBING
              //
              // เพิ่มการขึ้นลงเล็ก ๆ
              // ===========================

              holder.position.y +=

                Math.sin(
                  time * 4 +
                  settings.offset
                )
                *
                0.04;


              // ===========================
              // ROTATE
              //
              // ให้ตัวหันตามการบิน
              // ===========================

              holder.rotation.z =
                angle +
                Math.PI / 2;


              // ===========================
              // TILT
              //
              // เอียงเล็กน้อยขณะบิน
              // ===========================

              holder.rotation.x =
                Math.sin(
                  time * 3 +
                  settings.offset
                )
                *
                0.25;

            }

          );

        }


        // =================================
        // RENDER
        // =================================

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