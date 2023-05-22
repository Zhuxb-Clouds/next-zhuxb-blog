---
title: "UniApp如何调用蓝牙连接设备：以beneCheck为例"
date: "2023-05-22"
tag: "UniApp,蓝牙"
---


## 流程总结

### `uni.openBluetoothAdapter`初始化蓝牙模块

- 其他蓝牙相关 API 必须在 [`uni.openBluetoothAdapter`](https://uniapp.dcloud.net.cn/api/system/bluetooth#openbluetoothadapter) 调用之后使用。否则 API 会返回错误（errCode=10000）。
- 在用户蓝牙开关未开启或者手机不支持蓝牙功能的情况下，调用 [`uni.openBluetoothAdapter`](https://uniapp.dcloud.net.cn/api/system/bluetooth#openbluetoothadapter) 会返回错误（errCode=10001），表示手机蓝牙功能不可用。此时APP蓝牙模块已经初始化完成，可通过 [`uni.onBluetoothAdapterStateChange`](https://uniapp.dcloud.net.cn/api/system/bluetooth#onbluetoothadapterstatechange) 监听手机蓝牙状态的改变，也可以调用蓝牙模块的所有API。

### `uni.getBluetoothAdapterState`获取本机蓝牙适配器状态

- `res:{available:boolen}` 蓝牙是否可用

### `uni.startBluetoothDevicesDiscovery`搜寻附近的蓝牙外围设备

- 此操作比较耗费系统资源，请在搜索并连接到设备后调用 `uni.stopBluetoothDevicesDiscovery` 方法停止搜索。
- 原本功能内，在`startBluetoothDevicesDiscovery`之后还调用了`getBluetoothDevices`遍历获取列表，然而这样花费了额外的性能。`startBluetoothDevicesDiscovery`本就会返回单个设备，因此最优解应该是先遍历列表，如果列表内没有再一个个搜寻。

### `uni.stopBluetoothDevicesDiscovery`停止搜寻附近的蓝牙外围设备

- 一旦寻找到所需设备，最好立刻停止搜寻。

### `uni.createBLEConnection`连接低功耗蓝牙设备

- 若APP在之前已有搜索过某个蓝牙设备，并成功建立连接，可直接传入之前搜索获取的 deviceId 直接尝试连接该设备，无需进行搜索操作。
- 这个应该最先尝试，当搜索完成之后将deviceId放入对象中，当再次使用的时候直接使用`createBLEConnection`

### `uni.onBLEConnectionStateChange`监听连接状态

- 蓝牙连接随时可能断开，建议监听 [`uni.onBLEConnectionStateChange`](https://uniapp.dcloud.net.cn/api/system/ble#onbleconnectionstatechange) 回调事件，当蓝牙设备断开时按需执行重连操作

### `uni.getBLEDeviceServices`获取蓝牙设备所有服务

- isPrimary:该服务是否为主服务

例：![image-20230518151825036](https://cdn.jsdelivr.net/gh/Zhuxb-Clouds/PicDepot/img/202305181518098.png)

### `uni.getBLEDeviceCharacteristics`获取蓝牙设备某个服务中所有特征值

> 之前说到蓝牙的连接过程，那蓝牙连接之后具体是如何传数据的呢。这里做一下简要说明。
>
> 蓝牙4.0是以参数来进行数据传输的，即服务端定好一个参数，客户端可以对这个参数进行读，写，通知等操作，这个东西我们称之为**特征值（characteristic）**，
>
> 但一个参数不够我们用，比如我们这个特征值是电量的值，另一个特征值是设备读取的温度值。
>
> 那这时候会有多个特征值，并且我们还会对它们分类，分出来的类我们称之为**服务（service）**。
>
> 一个设备可以有多个服务，每一个服务可以包含多个特征值。为了方便操作，每个特征值都有他的属性，例如长度（size）,权限（permission），值（value）,描述（descriptor），如下图。

![img](https://cdn.jsdelivr.net/gh/Zhuxb-Clouds/PicDepot/img/202305181516361.png)

例：

![image-20230518151850501](https://cdn.jsdelivr.net/gh/Zhuxb-Clouds/PicDepot/img/202305181518548.png)

特征值的uuid会存储在前端，当获取到设备特征值的时候会与前端存储的特征值进行比对，确认相同则进入下一步



### `uni.notifyBLECharacteristicValueChange`启用低功耗蓝牙设备特征值变化时的 notify 功能 订阅特征值

**目前为止，三合一设备共有六个service，每个service又有1-7个不等的特征值，每个特征值的read、write、notify权限都各不相同，考虑到原功能没有写read相关的指令，暂且认为read没有意义。**

### `uni.onBLECharacteristicValueChange`监听低功耗蓝牙设备的特征值变化事件

- 必须先启用 `notifyBLECharacteristicValueChange` 接口才能接收到设备推送的 notification。
- 特征值是被规定的，每种功能会适配一个特征值：标准蓝牙血糖设备应支持[GLP](https://www.bluetooth.org/docman/handlers/downloaddoc.ashx?doc_id=248025)协议，符合GLP协议第三章（Glucose Sensor Role Requirements）要求;血糖设备应至少返回GLS（UUID：**0x1808**）这项服务
- 而特征值`00002A18-0000-1000-8000-00805F9B34FB`是被规定的，具体内容可看[Assigned_Numbers](https://btprodspecificationrefs.blob.core.windows.net/assigned-numbers/Assigned%20Number%20Types/Assigned_Numbers.pdf)

## 获取数值

进行到这里，我们初步获取了三合一设备测到的血糖值（其他两个值也是用同一个特征返回的），数值为

`064100e70705130b023ad0a711`

这是一个26位的字符串，其中`d0a7`这个部分是具体的数值，`e70705130b023`是时间，`41`是测试种类（41：血糖；51：尿酸；52：胆固醇）

数值具体怎么算此处略过，可以用以下函数计算

```javascript
function calculateDVal(hex1, hex2) {
  let bVal10 = parseInt(hex1, 16);
  let bVal11 = parseInt(hex2, 16);
  let base = (((bVal11 & 0x0F) << 8) + (bVal10 & 0xFF));
  let comp = ((bVal11 ^ 0xff) >> 4) + 1;
  if ((bVal11 & 0x80) == 0x80)
    comp = (-1) * comp;
  return (base * Math.pow(10, comp) * 1000);
}
```

## 实现函数

此函数只针对BeneCheck BK6-20MD型号

```javascript
export function parseData(input) {
  const data = {};
  data.flags = parseInt(input.slice(0, 2), 16);
  data.sequenceNumber = parseInt(input.slice(2, 6), 16);
  data.year = parseInt(input.slice(6, 10), 16);
  data.month = parseInt(input.slice(10, 12), 16);
  data.day = parseInt(input.slice(12, 14), 16);
  data.hour = parseInt(input.slice(14, 16), 16);
  data.minute = parseInt(input.slice(16, 18), 16);
  data.second = parseInt(input.slice(18, 20), 16);

  const concentrationHex1 = input.slice(20, 22);
  const concentrationHex2 = input.slice(22, 24);

  data.value = calculateDVal(concentrationHex1, concentrationHex2);

  const typeHex = input.slice(2, 4);

  if (typeHex === "41") {
    data.type = "血糖";
  } else if (typeHex === "51") {
    data.type = "尿酸";
  } else if (typeHex === "61") {
    data.type = "胆固醇";
  }

  const typeAndLocationHex = input.slice(24, 26);
  const typeAndLocationBinary = parseInt(typeAndLocationHex, 16).toString(2).padStart(8, "0");

  data.sampleLocation = typeAndLocationBinary.slice(4);

  const dateObject = new Date(
    data.year,
    data.month - 1,
    data.day,
    data.hour,
    data.minute,
    data.second
  );

  data.timestamp = dateObject.getTime();

  return data;
}

```

