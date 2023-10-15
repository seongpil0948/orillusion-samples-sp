import {
  Engine3D,
  Scene3D,
  Object3D,
  Camera3D,
  View3D,
  LitMaterial,
  BoxGeometry,
  MeshRenderer,
  DirectLight,
  HoverCameraController,
  AtmosphericComponent,
} from "@orillusion/core";

// initialize webgpu device & config canvas context
async function initWebGPU(canvas: HTMLCanvasElement) {
  if (!navigator.gpu) throw new Error("Not Support WebGPU");
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
    // powerPreference: 'low-power'
  });
  if (!adapter) throw new Error("No Adapter Found");
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  const size = { width: canvas.width, height: canvas.height };
  context.configure({
    // json specific format when key and value are the same
    device,
    format,
    // prevent chrome warning
    alphaMode: "opaque",
  });
  return { device, context, format, size };
}

async function run() {
  const canvas = document.querySelector("canvas");
  if (!canvas) throw new Error("No Canvas");
  // re-configure context on resize
  window.addEventListener("resize", () => {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    // don't need to recall context.configure() after v104
    // draw(device, context, pipeline);
  });

  const { device, context, format } = await initWebGPU(canvas);
  // const pipeline = await initPipeline(device, format);
  // start draw
  // draw(device, context, pipeline);
  let scene3D = new Scene3D();
  // Add atmospheric scattering skybox component
  let sky = scene3D.addComponent(AtmosphericComponent);
  console.info("sky", sky);

  // Create a camera object
  let cameraObj = new Object3D();
  let camera = cameraObj.addComponent(Camera3D);
  // Set the camera perspective according to the window size
  camera.perspective(60, window.innerWidth / window.innerHeight, 1, 5000.0);
  // Set camera controller
  let controller = camera.object3D.addComponent(HoverCameraController);
  controller.setCamera(0, 0, 15);
  // Add camera node to sence
  scene3D.addChild(cameraObj);

  // Create a light object
  let light = new Object3D();
  // Add direct light component
  let component = light.addComponent(DirectLight);
  // Adjust light parameters
  light.rotationX = 45;
  light.rotationY = 30;
  component.intensity = 2;
  // Add light node to sence
  scene3D.addChild(light);

  // Create a new object
  const obj = new Object3D();
  // Add MeshRenderer to object(obj)
  let mr = obj.addComponent(MeshRenderer);
  // Set geometry
  mr.geometry = new BoxGeometry(5, 5, 5);
  // Set material
  mr.material = new LitMaterial();
  scene3D.addChild(obj);

  // Create View3D object
  let view = new View3D();
  // Specify the scene to render
  view.scene = scene3D;
  // Specify the camera to use
  view.camera = camera;
  // Start rendering
  Engine3D.startRenderView(view);
}
run();
