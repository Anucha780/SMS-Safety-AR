import * as THREE from "three";

import {
  GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
  MindARThree
} from "mindar-image-three";


// ==================================================
// HTML
// ==================================================

const container =
  document.getElementById("container");

const statusText =
  document.getElementById("status");


// ==================================================
// MINDAR
// ==================================================

const mindarThree =
  new MindARThree({

    container: container,

    // SMS DAY target ใหม่
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


// ==================================================
// SMS DAY TARGET
// ==================================================

const target =
  mindarThree.addAnchor(0);


// ==================================================
// LIGHT
// ==================================================

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


// ==================================================
// WAVEBOY ROOT
// ==================================================

const waveboyRoot =
  new THREE.Group();

target.group.add(
  waveboyRoot
);


// ซ่อนไว้จนกว่าจะพบ SMS DAY
waveboyRoot.visible =
  false;


// ==================================================
// STATE
// ==================================================

let waveboy =
  null;

let mixer =
  null;

let modelLoaded =
  false;

let targetFound =
  false;


// ==================================================
// LOAD WAVEBOY
// ==================================================

const loader =
  new GLTFLoader();


loader.load(

  "./models/waveboy.glb",


  // ------------------------------------------------
  // LOAD SUCCESS
  // ------------------------------------------------

  (gltf) => {

    console.log(
      "Waveboy loaded successfully"
    );


    console.log(
      "Animations:",
      gltf.animations
    );


    waveboy =
      gltf.scene;


    // ==============================================
    // FIND MODEL SIZE
    // ==============================================

    const originalBox =
      new THREE.Box3()
        .setFromObject(
          waveboy
        );


    const originalSize =
      new THREE.Vector3();


    originalBox.getSize(
      originalSize
    );


    console.log(
      "Waveboy original size:",
      originalSize
    );


    const largestDimension =
      Math.max(

        originalSize.x,

        originalSize.y,

        originalSize.z

      );


    // ==============================================
    // NORMALIZE SIZE
    // ==============================================

    if (
      largestDimension > 0
    ) {

      const normalizeScale =
        0.7 /
        largestDimension;


      waveboy.scale.setScalar(
        normalizeScale
      );

    }


    // ==============================================
    // CENTER MODEL
    // ==============================================

    const scaledBox =
      new THREE.Box3()
        .setFromObject(
          waveboy
        );


    const center =
      new THREE.Vector3();


    scaledBox.getCenter(
      center
    );


    waveboy.position.set(

      -center.x,

      -center.y,

      -center.z

    );


    // ==============================================
    // ADD WAVEBOY
    // ==============================================

    waveboyRoot.add(
      waveboy
    );


    // ==============================================
    // POSITION ON SMS DAY
    // ==============================================

    waveboyRoot.position.set(

      0,      // center X

      0,      // center Y

      0.15    // slightly in front of poster

    );


    // ==============================================
    // MODEL SIZE
    // ==============================================

    waveboyRoot.scale.setScalar(
      0.8
    );


    // ==============================================
    // ANIMATION
    // ==============================================

    if (
      gltf.animations.length > 0
    ) {

      mixer =
        new THREE.AnimationMixer(
          waveboy
        );


      // ใช้ animation ตัวแรกใน GLB
      const clip =
        gltf.animations[0];


      console.log(
        "Playing animation:",
        clip.name
      );


      const action =
        mixer.clipAction(
          clip
        );


      action.reset();


      action.setLoop(
        THREE.LoopRepeat
      );


      action.play();


      console.log(
        "Waveboy animation started"
      );

    }

    else {

      console.warn(
        "Waveboy has NO animation"
      );

    }


    // ==============================================
    // MODEL READY
    // ==============================================

    modelLoaded =
      true;


    if (
      targetFound
    ) {

      waveboyRoot.visible =
        true;

    }


    statusText.textContent =
      "Waveboy Ready ✓";

  },


  // ------------------------------------------------
  // PROGRESS
  // ------------------------------------------------

  undefined,


  // ------------------------------------------------
  // ERROR
  // ------------------------------------------------

  (error) => {

    console.error(
      "Waveboy loading error:",
      error
    );


    statusText.textContent =
      "Waveboy Load Error";

  }

);


// ==================================================
// SMS DAY FOUND
// ==================================================

target.onTargetFound =
  () => {

    console.log(
      "SMS DAY TARGET FOUND"
    );


    targetFound =
      true;


    if (
      modelLoaded
    ) {

      waveboyRoot.visible =
        true;


      if (
        mixer
      ) {

        statusText.textContent =
          "SMS DAY FOUND • Waveboy Waving ✓";

      }

      else {

        statusText.textContent =
          "SMS DAY FOUND • No Animation";

      }

    }

    else {

      statusText.textContent =
        "SMS DAY FOUND • Loading Waveboy...";

    }

  };


// ==================================================
// SMS DAY LOST
// ==================================================

target.onTargetLost =
  () => {

    console.log(
      "SMS DAY TARGET LOST"
    );


    targetFound =
      false;


    waveboyRoot.visible =
      false;


    statusText.textContent =
      "Scan SMS DAY poster";

  };


// ==================================================
// CLOCK
// ==================================================

const clock =
  new THREE.Clock();


// ==================================================
// START AR
// ==================================================

async function startAR() {

  try {

    statusText.textContent =
      "Starting SMS DAY AR...";


    await mindarThree.start();


    statusText.textContent =
      modelLoaded
        ? "Scan SMS DAY poster"
        : "Loading Waveboy...";


    // ==============================================
    // RENDER LOOP
    // ==============================================

    renderer.setAnimationLoop(

      () => {


        // ------------------------------------------
        // TIME
        // ------------------------------------------

        const delta =
          clock.getDelta();


        // ------------------------------------------
        // UPDATE WAVEBOY ANIMATION
        // ------------------------------------------

        if (
          mixer
        ) {

          mixer.update(
            delta
          );

        }


        // ------------------------------------------
        // RENDER
        // ------------------------------------------

        renderer.render(
          scene,
          camera
        );

      }

    );

  }


  catch (error) {

    console.error(
      "AR Start Error:",
      error
    );


    statusText.textContent =
      "AR Start Error";

  }

}


// ==================================================
// RUN
// ==================================================

startAR();