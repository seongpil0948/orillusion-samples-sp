import { ComponentBase, View3D } from "@orillusion/core";

export class RotateScript extends ComponentBase {
  onEnable(view?: View3D | undefined) {
    //enable lifecycle, executed when the component is enabled
    console.info("onEnable", view);
  }
  onUpdate(view?: View3D | undefined) {
    console.info("onUpdate", view);
    this.object3D.rotationY += 1;
  }
  onDisable(view?: View3D | undefined) {
    //disable lifecycle, executed when the component is disabled
    console.info("onDisable", view);
  }
}
