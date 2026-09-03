import * as THREE from "three";

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


// ==============================
// TARGET
// ==============================

const anchor =
  mindarThree.addAnchor(0);


// ==============================
// TEST PLANE
// ==============================

const geometry =
  new THREE.PlaneGeometry(
    0.35,
    0.35
  );


const material =
  new THREE.MeshBasicMaterial({

    color: 0x00ff00,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.8

  });


const plane =
  new THREE.Mesh(
    geometry,
    material
  );


plane.position.z =
  0.01;


anchor.group.add(
  plane
);


// ==============================
// FOUND
// ==============================

anchor.onTargetFound =
  () => {

    console.log(
      "TARGET FOUND"
    );


    statusText.textContent =
      "TARGET FOUND ✓";

  };


// ==============================
// LOST
// ==============================

anchor.onTargetLost =
  () => {

    console.log(
      "TARGET LOST"
    );


    statusText.textContent =
      "Point camera at DINOCAP";

  };


// ==============================
// START
// ==============================

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