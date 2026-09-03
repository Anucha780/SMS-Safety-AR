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


// ======================================
// LIGHT
// ======================================

scene.add(
  new THREE.AmbientLight(
    0xffffff,
    4
  )
);

const light =
  new THREE.DirectionalLight(
    0xffffff,
    4
  );

light.position.set(
  1,
  2,
  3
);

scene.add(light);


// ======================================
// DEBUG GREEN BOX
// ======================================

const debugBox =
  new THREE.Mesh(

    new THREE.BoxGeometry(
      0.25,
      0.25,
      0.25
    ),

    new THREE.MeshBasicMaterial({
      color: 0x00ff00
    })

  );

debugBox.position.set(
  0,
  0,
  0.15
);

anchor.group.add(
  debugBox
);


// ======================================
// BUTTERFLY HOLDER
// ======================================

const butterflyHolder =
  new THREE.Group();

anchor.group.add(
  butterflyHolder
);

butterflyHolder.position.set(
  0.35,
  0,
  0.2
);


// ======================================
// LOAD BUTTERFLY
// ======================================

const loader =
  new GLTFLoader();

let butterfly = null;

loader.load(

  "./models/butterfly.glb",

  (gltf) => {

    console.log(
      "BUTTERFLY LOADED",
      gltf
    );

    butterfly =
      gltf.scene;


    // ==================================
    // CHECK ORIGINAL SIZE
    // ==================================

    const box =
      new THREE.Box3()
        .setFromObject(
          butterfly
        );

    const size =
      new THREE.Vector3();

    box.getSize(size);

    console.log(
      "ORIGINAL SIZE",
      size
    );


    // ==================================
    // FORCE SIZE
    // ==================================

    const largest =
      Math.max(
        size.x,
        size.y,
        size.z
      );

    if (
      largest > 0
    ) {

      const scale =
        0.5 / largest;

      butterfly.scale.setScalar(
        scale
      );

    }


    // ==================================
    // RECALCULATE CENTER
    // ==================================

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


    // ==================================
    // FORCE MATERIAL VISIBLE
    // ==================================

    butterfly.traverse(
      (child) => {

        if (
          child.isMesh
        ) {

          console.log(
            "MESH FOUND",
            child.name
          );

          child.material =
            new THREE.MeshBasicMaterial({
              color: 0xff00ff,
              side: THREE.DoubleSide
            });

        }

      }
    );


    // ==================================
    // ADD
    // ==================================

    butterflyHolder.add(
      butterfly
    );


    statusText.textContent =
      "BUTTERFLY LOADED ✓";

  },

  undefined,

  (error) => {

    console.error(
      "BUTTERFLY ERROR",
      error
    );

    statusText.textContent =
      "BUTTERFLY ERROR";

  }

);


// ======================================
// TARGET FOUND
// ======================================

anchor.onTargetFound =
  () => {

    console.log(
      "TARGET FOUND"
    );

    statusText.textContent =
      butterfly
        ? "TARGET + BUTTERFLY ✓"
        : "TARGET FOUND / LOADING MODEL";

  };


anchor.onTargetLost =
  () => {

    console.log(
      "TARGET LOST"
    );

    statusText.textContent =
      "Point camera at DINOCAP";

  };


// ======================================
// ANIMATION
// ======================================

const clock =
  new THREE.Clock();


async function start() {

  try {

    statusText.textContent =
      "Starting AR...";

    await mindarThree.start();

    statusText.textContent =
      "Point camera at DINOCAP";


    renderer.setAnimationLoop(
      () => {

        const time =
          clock.getElapsedTime();


        // ------------------------------
        // DEBUG BOX ROTATION
        // ------------------------------

        debugBox.rotation.x =
          time;

        debugBox.rotation.y =
          time;


        // ------------------------------
        // BUTTERFLY
        // ------------------------------

        if (
          butterfly
        ) {

          // บินเป็นวง
          butterflyHolder.position.x =
            Math.cos(time) *
            0.45;

          butterflyHolder.position.y =
            Math.sin(time) *
            0.30;

          butterflyHolder.position.z =
            0.25 +
            Math.sin(
              time * 2
            ) *
            0.1;


          // หมุนให้เห็นว่ามันเคลื่อน
          butterflyHolder.rotation.y =
            time;

          butterflyHolder.rotation.z =
            Math.sin(time) *
            0.3;

        }


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
      "AR ERROR";

  }

}


start();