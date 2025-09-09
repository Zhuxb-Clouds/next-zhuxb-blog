---

date: 2024-02-21
tags: [Canvas,JavaScript]
---


蒙版是一种图像化的选区，通常用于合成图像，经常在我们的图像相关需求中遇到。而今日我就遇到了一个半透明蒙版的需求，简化需求后，核心内容是这样的：提供两张图片，一是原始图片、二是蒙版图片，蒙版图片只有一种颜色。

![image-20240221174457841](https://cdn.jsdelivr.net/gh/Zhuxb-Clouds/PicDepot/img/image-20240221174457841.png)

而我们的目的则是设置原始图片与蒙版重合的部分的透明度设置为50%。

![无标题](https://cdn.jsdelivr.net/gh/Zhuxb-Clouds/PicDepot/img/%E6%97%A0%E6%A0%87%E9%A2%98.png)

因为是web上执行的应用，可以直接使用CanvasApi去制作。通过`getImageData`获取到图片的`ImageData`即图片的像素数据。这些数据以数组的方式存储，一个像素点有四个通道（RGBA），取值范围在`[0,255]`，因此循环的Step至少为4。

另一个值得说的点是，虽然某些像素点是透明的，但仍有RGB值，所以最好是根据蒙版设定的颜色去判断是否重叠。

核心代码如下：

```javascript

function handleImageWithMask() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    // 加载原始图片
    const originalImage = new Image();
    originalImage.src = 'xxxx'; // base64或者url

    // 加载蒙版图片
    const maskImage = new Image();
    maskImage.src = 'xxxx';
    
    
    originalImage.onload = function () {
      maskImage.onload = function () {
        // 设置Canvas的大小与图片一致
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;

        if (!ctx) return;

        // 绘制原始图片
        ctx.drawImage(originalImage, 0, 0);
        const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 获取蒙版数据
        ctx.drawImage(maskImage, 0, 0);
        const maskData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 处理原始图片的透明度
        for (let i = 0; i < originalData.data.length; i += 4) {
          // 如果蒙版对应位置有颜色，则将透明度设置为128
          if (maskData.data[i] === 255) {
            // 透明度设置为128
            originalData.data[i + 3] = 128;
          }
        }

        // 清空Canvas并绘制处理后的图片
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(originalData, 0, 0);
		
        return canvas.toDataURL()
      };
    };
}
```

