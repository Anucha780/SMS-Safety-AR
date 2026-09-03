import * as THREE from "three";

import {
  MindARThree
} from "mindar-image-three";


const container =
  document.getElementById("ar-container");


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
// TARGET 0
// ========================================

const anchor =
  mindarThree.addAnchor(0);


// ========================================
// TEST OBJECT
//
// สร้างสี่เหลี่ยมเขียวเล็ก ๆ
// เพื่อยืนยันว่า anchor ทำงานจริง
// ========================================

const geometry =
  new THREE.PlaneGeometry(
    0.3,
    0.3
  );


const material =
  new THREE.MeshBasicMaterial({

    color: 0x00ff00,

    transparent: true,

    opacity: 0.8,

    side: THREE.DoubleSide

  });


const testPlane =
  new THREE.Mesh(
    geometry,
    material
  );


testPlane.position.set(
  0,
  0,
  0.01
);


anchor.group.add(
  testPlane
);


// ========================================
// FOUND / LOST
// ========================================

anchor.onTargetFound =
  () => {

    console.log(
      "TARGET FOUND"
    );


    statusText.textContent =
      "TARGET FOUND ✓";

  };


anchor.onTargetLost =
  () => {

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
      "AR ERROR:",
      error
    );


    statusText.textContent =
      "Unable to start AR";

  }

}


start();