import triangle from "./shaders/triangle.vert2.wgsl?raw";
async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail("need a browser that supports WebGPU");
    return;
  }

  // Get a WebGPU context from the canvas and configure it
  const canvas = document.querySelector("canvas");
  const context = canvas?.getContext("webgpu");
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context?.configure({
    device,
    format: presentationFormat,
  });

  const vsModule = device.createShaderModule({
    label: "hardcoded triangle",
    code: triangle,
  });

  const fsModule = device.createShaderModule({
    label: "checkerboard",
    code: triangle,
  });

  const pipeline = device.createRenderPipeline({
    label: "our hardcoded red triangle pipeline",
    layout: "auto",
    vertex: {
      module: vsModule,
      entryPoint: "vs",
    },
    fragment: {
      module: fsModule,
      entryPoint: "fs",
      targets: [{ format: presentationFormat }],
    },
  });

  const renderPassDescriptor = {
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        // view: <- to be filled out when we render
        clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  const rand = (min?: number, max?: number) => {
    if (min === undefined) {
      min = 0;
      max = 1;
    } else if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.random() * (max - min);
  };
  // make a buffer and assign it usage flags so it can be used with uniforms
  // create 2 buffers for the uniform values
  const staticUniformBufferSize =
    4 * 4 + // color is 4 32bit floats (4bytes each)
    2 * 4 + // offset is 2 32bit floats (4bytes each)
    2 * 4; // padding
  const uniformBufferSize = 2 * 4; // scale is 2 32bit floats (4bytes each)

  // offsets to the various uniform values in float32 indices
  const kColorOffset = 0;
  const kOffsetOffset = 4;
  const kScaleOffset = 0;

  const kNumObjects = 100;
  const objectInfos: Record<string, any>[] = [];

  for (let i = 0; i < kNumObjects; ++i) {
    const staticUniformBuffer = device.createBuffer({
      label: `static uniforms for obj: ${i}`,
      size: staticUniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    //  // These are only set once so set them now
    {
      // create a typedarray to hold the values for the uniforms in JavaScript
      // 유니폼 값을 보관할 typedarray를 만듭니다.
      const uniformValues = new Float32Array(staticUniformBufferSize / 4);
      0;
      // // Above we’re setting the color to green.
      // uniformValues.set([0, 1, 0, 1], kColorOffset); // set the color
      // // 크기를 절반 크기로 설정하고 캔버스의 측면을 고려합니다.
      // uniformValues.set(
      //   [
      //     -0.5, // The offset will move the triangle to the left 1/4th of the canvas
      //     -0.25, // clip space goes from -1 to 1 which is 2 units wide so 0.25 is 1/8 of 2
      //   ],
      //   kOffsetOffset
      // ); // // set the offset
      uniformValues.set([rand(), rand(), rand(), 1], kColorOffset); // set the color
      uniformValues.set([rand(-0.9, 0.9), rand(-0.9, 0.9)], kOffsetOffset); // set the offset

      // copy these values to the GPU
      device.queue.writeBuffer(staticUniformBuffer, 0, uniformValues);
    }

    // create a typedarray to hold the values for the uniforms in JavaScript
    const uniformValues = new Float32Array(uniformBufferSize / 4);
    const uniformBuffer = device.createBuffer({
      label: `changing uniforms for obj: ${i}`,
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    //  create a bind group and bind the buffer to the same @binding(?) we set in our shader.
    const bindGroup = device.createBindGroup({
      label: `bind group for obj: ${i}`,
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: staticUniformBuffer } },
        { binding: 1, resource: { buffer: uniformBuffer } },
      ],
    });

    objectInfos.push({
      scale: rand(0.2, 0.5),
      uniformBuffer,
      uniformValues,
      bindGroup,
    });
  }

  function render() {
    // Get the current texture from the canvas context and
    // set it as the texture to render to.
    (renderPassDescriptor.colorAttachments[0] as any).view = context
      ?.getCurrentTexture()
      .createView();

    const encoder = device?.createCommandEncoder({ label: "our encoder" });
    const pass = encoder?.beginRenderPass(renderPassDescriptor as any);
    pass?.setPipeline(pipeline);

    // Set the uniform values in our JavaScript side Float32Array
    const aspect = (canvas?.width ?? 0) / (canvas?.height ?? 0);
    // uniformValues.set([0.5 / aspect, 0.5], kScaleOffset); // set the scale
    // // copy the values from JavaScript to the GPU 데이터를 버퍼에 복사합니다.
    // device?.queue.writeBuffer(uniformBuffer, 0, uniformValues);
    for (const {
      scale,
      bindGroup,
      uniformBuffer,
      uniformValues,
    } of objectInfos) {
      uniformValues.set([scale / aspect, scale], kScaleOffset); // set the scale
      device?.queue.writeBuffer(uniformBuffer, 0, uniformValues);
      pass?.setBindGroup(0, bindGroup);
      pass?.draw(3); // call our vertex shader 3 times
    }

    pass?.end();

    const commandBuffer = encoder?.finish();
    if (commandBuffer) device?.queue.submit([commandBuffer]);
  }

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const canvas = entry.target as HTMLCanvasElement;
      const width = entry.contentBoxSize[0].inlineSize;
      const height = entry.contentBoxSize[0].blockSize;
      canvas.width = Math.max(
        1,
        Math.min(width, device.limits.maxTextureDimension2D)
      );
      canvas.height = Math.max(
        1,
        Math.min(height, device.limits.maxTextureDimension2D)
      );
      // re-render
      render();
    }
  });
  if (canvas) observer.observe(canvas);
}

function fail(msg: string) {
  // eslint-disable-next-line no-alert
  alert(msg);
}

main();
