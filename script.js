import * as THREE from "three";

import {
  MindARThree
} from "mindar-image-three";


const container =
  document.getElementById("ar-container");

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


const anchor =
  mindarThree.addAnchor(0);


// test plane
const geometry =
  new THREE.PlaneGeometry(
    0.3,
    0.3
  );

const material =
  new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide
  });

const plane =
  new THREE.Mesh(
    geometry,
    material
  );

anchor.group.add(
  plane
);


anchor.onTargetFound =
  () => {

    statusText.textContent =
      "TARGET FOUND ✓";

  };


anchor.onTargetLost =
  () => {

    statusText.textContent =
      "Point camera at DINOCAP";

  };


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

    console.error(error);

    statusText.textContent =
      "AR START ERROR";

  }

}


start();