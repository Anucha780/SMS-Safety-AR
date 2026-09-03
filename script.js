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
    container,
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
    2.5
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

const waveboyRoot =
  new THREE.Group();

anchor.group.add(
  waveboyRoot
);

waveboyRoot.visible =
  false;


// ========================================
// STATE
// ========================================

let waveboy =
  null;

let mixer =
  null;

let modelLoaded =
  false;

let targetVisible =
  false;


// ========================================
// LOAD WAVEOY
// ========================================

const loader =
  new GLTFLoader();

loader.load(

  "./models/waveboy.glb",

  (gltf) => {

    console.log(
      "WAVEBOY LOAD SUCCESS"
    );

    console.log(
      "ANIMATIONS:",
      gltf.animations
    );

    waveboy =
      gltf.scene;


    // ====================================
    // NORMALIZE SIZE
    // ====================================

    const box =
      new THREE.Box3()
        .setFromObject(
          waveboy
        );

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

      waveboy.scale.setScalar(
        0.7 /
        maxDimension
      );

    }


    // ====================================
    // CENTER MODEL
    // ====================================

    const newBox =
      new THREE.Box3()
        .setFromObject(
          waveboy
        );

    const center =
      new THREE.Vector3();

    newBox.getCenter(
      center
    );

    waveboy.position.set(
      -center.x,
      -center.y,
      -center.z
    );


    // ====================================
    // ADD MODEL
    // ====================================

    waveboyRoot.add(
      waveboy
    );


    // ====================================
    // POSITION
    // ====================================

    waveboyRoot.position.set(
      0,
      0,
      0.2
    );

    waveboyRoot.scale.setScalar(
      0.8
    );


    // ====================================
    // ANIMATION
    // ====================================

    if (
      gltf.animations.length > 0
    ) {

      mixer =
        new THREE.AnimationMixer(
          waveboy
        );

      const clip =
        gltf.animations[0];

      console.log(
        "PLAYING CLIP:",
        clip.name
      );

      const action =
        mixer.clipAction(
          clip
        );

      action.reset();
      action.play();

      statusText.textContent =
        "WAVEBOY ANIMATION READY ✓";

    }

    else {

      console.warn(
        "NO ANIMATION FOUND"
      );

      statusText.textContent =
        "WAVEBOY LOADED / NO ANIMATION";

    }


    modelLoaded =
      true;


    if (
      targetVisible
    ) {

      waveboyRoot.visible =
        true;

    }

  },

  undefined,

  (error) => {

    console.error(
      "WAVEBOY LOAD ERROR:",
      error
    );

    statusText.textContent =
      "WAVEBOY LOAD ERROR";

  }

);


// ========================================
// TARGET FOUND
// ========================================

anchor.onTargetFound =
  () => {

    targetVisible =
      true;

    if (
      modelLoaded
    ) {

      waveboyRoot.visible =
        true;

      statusText.textContent =
        mixer
          ? "WAVEBOY WAVING ✓"
          : "WAVEBOY FOUND ✓";

    }

    else {

      statusText.textContent =
        "TARGET FOUND / LOADING...";

    }

  };


// ========================================
// TARGET LOST
// ========================================

anchor.onTargetLost =
  () => {

    targetVisible =
      false;

    waveboyRoot.visible =
      false;

    statusText.textContent =
      "Point camera at target";

  };


// ========================================
// CLOCK
// ========================================

const clock =
  new THREE.Clock();


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
        ? "Point camera at target"
        : "Loading Waveboy...";


    renderer.setAnimationLoop(
      () => {

        const delta =
          clock.getDelta();


        // สำคัญมาก
        // ทำให้ animation ใน GLB ขยับ
        if (
          mixer
        ) {

          mixer.update(
            delta
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


start();
