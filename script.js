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
// DINO
// ========================================

const dinoRoot =
  new THREE.Group();

anchor.group.add(
  dinoRoot
);


let dinoModel =
  null;


let targetVisible =
  false;


// ตอนเริ่มซ่อน
dinoRoot.visible =
  false;


// ========================================
// LOAD GLB
// ========================================

const loader =
  new GLTFLoader();


loader.load(

  "./models/dino.glb",

  (gltf) => {

    const model =
      gltf.scene;


    // ====================================
    // MODEL SIZE
    // ====================================

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


    const scale =
      0.8 / maxDimension;


    model.scale.setScalar(
      scale
    );


    // ====================================
    // CENTER MODEL
    // ====================================

    const box2 =
      new THREE.Box3()
        .setFromObject(model);


    const center =
      new THREE.Vector3();

    box2.getCenter(center);


    model.position.set(
      -center.x,
      -center.y,
      -center.z
    );


    // ====================================
    // ORIENTATION
    // ====================================

    model.rotation.set(
      0,
      0,
      0
    );


    // ====================================
    // ADD TO ROOT
    // ====================================

    dinoRoot.add(
      model
    );


    dinoModel =
      model;


    dinoRoot.position.set(
      0,
      0,
      0.15
    );


    dinoRoot.scale.setScalar(
      1
    );


    // สำคัญมาก:
    // ถ้า Target ถูกเจอไปแล้ว
    // ให้ Dino โผล่ทันที
    if (targetVisible) {

      dinoRoot.visible =
        true;

    }


    console.log(
      "DINO LOADED"
    );


    statusText.textContent =
      targetVisible
        ? "DINOCAP FOUND ✓"
        : "Dino ready ✓";

  },


  undefined,


  (error) => {

    console.error(
      "DINO LOAD ERROR",
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


    console.log(
      "TARGET FOUND"
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

    targetVisible =
      false;


    dinoRoot.visible =
      false;


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
      "AR ERROR",
      error
    );


    statusText.textContent =
      "AR ERROR";

  }

}


start();