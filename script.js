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

    uiLoading: "yes",

    uiScanning: "yes"

  });


async function start() {

  try {

    statusText.textContent =
      "Starting AR...";


    console.log(
      "Before MindAR start"
    );


    await mindarThree.start();


    console.log(
      "MindAR started"
    );


    statusText.textContent =
      "AR STARTED ✓";


    const {
      renderer,
      scene,
      camera
    } = mindarThree;


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
      "AR ERROR: " +
      error.message;

  }

}


start();