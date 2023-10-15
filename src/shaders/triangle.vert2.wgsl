// declared a uniform variable with a type of that struct
struct OurStruct {
  color: vec4f,
  // scale: vec2f,
  offset: vec2f,
};
@group(0) @binding(0) var<uniform> ourStruct: OurStruct;

struct OtherStruct {
  scale: vec2f,
};

struct OurVertexShaderOutput {
    //  different meaning in a vertex shader vs a fragment shader.
  // That field is NOT an inter-stage variable.
  @builtin(position) position: vec4f,
};

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> OurVertexShaderOutput {
    // In a vertex shader @builtin(position) is 
  // the output that the GPU needs to draw triangles/lines/points
  let pos = array(
    vec2f( 0.0,  0.5),  // top center
    vec2f(-0.5, -0.5),  // bottom left
    vec2f( 0.5, -0.5)   // bottom right
  );

  var vsOutput: OurVertexShaderOutput;
  // by scale and then add an offset
  vsOutput.position = vec4f(pos[vertexIndex] * otherStruct.scale + ourStruct.offset, 0.0, 1.0);
          // pos[vertexIndex] * ourStruct.scale + ourStruct.offset, 
  return vsOutput;
}

  // @location(2) @interpolate(linear, center) myVariableFoo: vec4f;
  // @location(3) @interpolate(flat) myVariableBar: vec4f;
// For inter-stage variables they connect by location index.
// @fragment fn fs(fsInput: OurVertexShaderOutput) -> @location(0) vec4f {
//   // return fsInput.color;
//   let red = vec4f(1, 0, 0, 1);
//   let cyan = vec4f(0, 1, 1, 1);
//   // xy: pos coordinates to a vec2u
//   // It then divides them by 8 giving us a count that increases every 8 pixels. It then adds the x and y grid coordinates together, 
//   let grid = vec2u(fsInput.position.xy) / 8;
//   let checker = (grid.x + grid.y) % 2 == 1;

//   // select = (a, b, condition) => condition ? b : a;
//   return select(red, cyan, checker);
// }

@fragment fn fs() -> @location(0) vec4f {
  return ourStruct.color;
}
