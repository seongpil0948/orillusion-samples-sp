// declared a uniform variable with a type of that struct
struct OurStruct {
  color: vec4f,
  offset: vec2f,
};

struct OtherStruct {
  scale: vec2f,
};

@group(0) @binding(0) var<storage, read> ourStructs: array<OurStruct>;
@group(0) @binding(1) var<storage, read> otherStructs: array<OtherStruct>;

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}
 

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32,
  // we can pass a second argument for number of instances and for each instance drawn,
  @builtin(instance_index) instanceIndex: u32
) -> VSOutput {
  let otherStruct = otherStructs[instanceIndex];
  let ourStruct = ourStructs[instanceIndex];
  let pos = array(
    vec2f( 0.0,  0.5),  // top center
    vec2f(-0.5, -0.5),  // bottom left
    vec2f( 0.5, -0.5)   // bottom right
  );  
  var vsOut: VSOutput;
  vsOut.position = vec4f(
  // by scale and then add an offset
      pos[vertexIndex] * otherStruct.scale + ourStruct.offset, 0.0, 1.0);
  vsOut.color = ourStruct.color;
  return vsOut;
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
