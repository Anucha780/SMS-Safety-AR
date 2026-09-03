import * as THREE from "three";

import {
  GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
  MindARThree
} from "mindar-image-three";

const container =
  document.getElementById("container");

const statusText =
  document.getElementById("status");

const mindarThree =
  new MindARThree({
    container: container,
    imageTargetSrc: "./targets/targets.mind",
    maxTrack: 1,
    uiLoading: "yes",
    uiScanning: "yes"
  });

const {
  renderer,
  scene,
  camera
} = mindarThree;

const anchor =
  mindarThree.addAnchor(0);


// ========================================
// LIGHT
// ========================================

scene.add(
  new THREE.AmbientLight(
    0xffffff,
    3
  )
);

const light =
  new THREE.DirectionalLight(
    0xffffff,
    3
  );

light.position.set(
  1,
  2,
  3
);

scene.add(
  light
);


// ========================================
// ROOT
// ========================================

const butterflyRoot =
  new THREE.Group();

anchor.group.add(
  butterflyRoot
);

butterflyRoot.visible =
  false;


// ========================================
// STATE
// ========================================

let butterfly =
  null;

let modelLoaded =
  false;

let targetVisible =
  false;


// ========================================
// LOAD MODEL
// ========================================

const loader =
  new GLTFLoader();

loader.load(

  "./models/butterfly.glb",

  (gltf) => {

    console.log(
      "BUTTERFLY LOAD SUCCESS",
      gltf
    );

    butterfly =
      gltf.scene;


    // ====================================
    // NORMALIZE SIZE
    // ====================================

    const box =
      new THREE.Box3()
        .setFromObject(
          butterfly
        );

    const size =
      new THREE.Vector3();

    box.getSize(
      size
    );

    console.log(
      "BUTTERFLY SIZE:",
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

      butterfly.scale.setScalar(
        0.45 /
        maxDimension
      );

    }


    // ====================================
    // CENTER MODEL
    // ====================================

    const newBox =
      new THREE.Box3()
        .setFromObject(
          butterfly
        );

    const center =
      new THREE.Vector3();

    newBox.getCenter(
      center
    );

    butterfly.position.set(
      -center.x,
      -center.y,
      -center.z
    );


    // ====================================
    // ADD MODEL
    // ====================================

    butterflyRoot.add(
      butterfly
    );


    // ====================================
    // POSITION
    // ====================================

    butterflyRoot.position.set(
      0,
      0,
      0.25
    );

    butterflyRoot.rotation.set(
      0,
      0,
      0
    );

    modelLoaded =
      true;


    if (
      targetVisible
    ) {

      butterflyRoot.visible =
        true;

    }


    statusText.textContent =
      targetVisible
        ? "BUTTERFLY FOUND ✓"
        : "BUTTERFLY READY ✓";

  },

  undefined,

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
// TARGET
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

      butterflyRoot.visible =
        true;

      statusText.textContent =
        "BUTTERFLY FOUND ✓";

    }

    else {

      statusText.textContent =
        "TARGET FOUND / MODEL LOADING...";

    }

  };


anchor.onTargetLost =
  () => {

    targetVisible =
      false;

    butterflyRoot.visible =
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
        : "Loading Butterfly...";


    renderer.setAnimationLoop(
      () => {

        if (
          targetVisible &&
          modelLoaded
        ) {

          // หมุนช้า ๆ เพื่อให้เห็นชัดว่า model มีอยู่
          butterflyRoot.rotation.y +=
            0.01;

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