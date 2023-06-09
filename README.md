## update v1.0.3

Support image proportion scaling.

支持图片比例缩放

if your image is too big, you can set the ratio 0.5

如果你的图片分辨率太高,你可以将显示比例设置为比如0.5

```
  // The fifth parameter is the display ratio and default value is 1;
  // 第五个参数是显示比例,默认值是1;
  const smartScale = new SmartScale('/static/img/test.png', [[384,464],[820,900]],[[324,440]],canvas, 0.5)

  //  If you want to change the display scale after the image is displayed
  // 如果你想在图片显示后更改显示比例
  smartScale.setRatio(0.5)
  // No need to call resizeHandle
  // 不需要调用resizeHandle函数

```


## Introduction 介绍

You can scale your picture and prevent distortion of certain parts of the image by a canvas.

你可以通过一个canvas元素来智能缩放你的图片,并且保持图片的某些部分不会变形.

example use in vue3.2

以下是在vue3.2的示例

```
<template>
  <canvas ref="canvasRef" id="resCanvas" height="300" width="500"></canvas>
</template>

<script setup lang="ts">
  import { ref, type Ref, onMounted, onUnmounted } from "vue";
  import * as lodash from 'lodash';
  import {SmartScale} from 'smart-scale';

  const canvasRef: Ref<HTMLCanvasElement | undefined> = ref();
  const resizeHandle : Ref< (()=> void) | undefined> = ref()

  onMounted(()=>{
    // You need make sure which pixels of picture can be scaled
    // 你需要明确你的图片哪些像素是可以被放缩的。
    // In test.png image, the range of 384 to 464 and 820 to 900 pixels horizontally can be scaled, and the range of 324 to 440 pixels vertically can be scaled.
    // 在test.png中,横向的384像素到464像素,820像素到900像素是可以被缩放的,纵向的324像素到440像素范围是可以被缩放的。
  const smartScale = new SmartScale('/static/img/test.png', [[384,464],[820,900]],[[324,440]],canvasRef.value!)
  resizeHandle.value = lodash.throttle(()=>{
    smartScale.resizeHandle()
  }, 50)
  window.addEventListener('resize', resizeHandle.value!)
  })

  onUnmounted(()=>{
  window.removeEventListener('resize', resizeHandle.value!)
  })
</script>
```
If you need to create animations, you may notice some jitter during the scaling process. This is because the frequency of your canvas scaling and the execution of your resizeHandle function are inconsistent. You can manually ensure that the canvas size changes and the resizeHandle function execution are consistent.
The canvas size means canvas.style.height and width,not canvas.height and canvas.width
Or don't use throttle

如果你需要做动画，你会发现缩放过程有些抖动，这是因为你的canvas缩放和你的resizeHandle函数执行频率不一致导致的。你可以手动将canvas的尺寸变动和resizeHandle函数执行保持一致。

这里canvas缩放尺寸变动指的是canvas样式的height和width而不是canvas属性的height,width。

或者不用节流函数

# smart-scale