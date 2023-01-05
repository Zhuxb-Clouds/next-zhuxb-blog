---
title: "在【我的钱去哪儿了】中的密文存储和jwt验证"
date: "2022-03-26"
tag: "Nodejs,express,密码学"
---

在项目【我的钱去哪了】中，涉及两个加密部分。

> 1.密码的密文存储
>
> 2.token的服务端验证

分别来说明这两个部分

# 一、使用bcryptjs进行的密文存储

在数据库中我们需要密文存储用户密码，并能在用户登录的时候进行比对，此时我使用了`bcryptjs`，它会根据我们输入的number生成salt、再使用salt进行加密存储。并且可以比较加密前后的密码是否一致。

```javascript
var bcrypt = require('bcryptjs');
//密码加密模块


 exports.hash = async function (Password){
    let salt = await bcrypt.genSaltSync(10);
    // console.log(Password, salt);
    let result = await bcrypt.hash(Password, salt);
    // console.log(result);

    return result
}


exports.isEqual = async function (oldPwd, newPwd){
    // console.log(await bcrypt.compare(oldPwd, newPwd));
    return await bcrypt.compare(oldPwd, newPwd)
}
```

# 二、使用jwt进行的token验证

关于token自身的加密（或许叫做签名更合适），是在payload里加入某个字段，并使用存储在服务器端的salt加密。加解密都在服务器端利用jwt进行，这里我选择用user的name作为payload字段，当解密出来之后就与数据库中的username做比较，成功则以这个user的状态去进行权限操作。

```javascript
const jwt = require("jsonwebtoken");
const config = require("../config")
const secretKey = config.jwtSecretKey;

// 生成token
module.exports.generateToken = function (payload) { 
  const token =
    "Bearer " +
    jwt.sign(payload, secretKey, {
      expiresIn: '365day',
    });
  return token;
};
module.exports.decodedToken = function (token) {
    return jwt.verify(token, secretKey, function (err, decoded) {
        return decoded.username;
    });
    
  };
// 验证token
module.exports.verifyToken = function (req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, secretKey, function (err, decoded) {
    if (err) {
      // console.log("verify error", err);
      return res.json({ code: "404", msg: "token无效" });
    }
    console.log("通过验证，欢迎你，", decoded.username);
    next();
  });
};
```

# 三、存在的问题

1.前端向后端传输的密码依然是明文，而非密文。（此处可以考虑使用非对称加密）

2.token生成的salt一旦被获取，或是碰撞，服务器相当于不设防。（可以考虑每一个用户使用不同的salt，验证不需要解密，而是通过散列函数）