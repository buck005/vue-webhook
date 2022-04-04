let http = require("http");
let crypto = require("crypto");
const SECRET = "admin123456"; // github => webhook 填的密钥
function sign(data) {
  // hash 算法
  return "sha1=" + crypto.createHmac("sha1", SECRET).update(data).digest("hex");
}
let server = http.createServer(function (req, res) {
  console.log(req.method, req.url);
  if (req.method == "POST" && req.url == "webhook") {
    let buffers = [];
    req.on("data", function (data) {
      buffers.push(data);
    });
    req.on("end", function () {
      let body = Buffer.concat(buffers);
      let event = req.headers["x-github-event"]; // event=push
      let id = req.headers["x-github-delivery"];
      // github 请求来的时候，要传递请求体 body，另外还会传一个 signature过来，需要验证签名对不对
      let signature = req.headers["x-hub-signature"]; // 签名
      console.log("signature=>", signature);
      console.log("sign(body)=>", sign(body));
      if (signature !== sign(body)) {
        return res.end("Not Allowed");
      }
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true }));
      //===========分割线===================
      // if (event === "push") {
      //   let payload = JSON.parse(body);
      //   let child = spawn("sh", [`./${payload.repository.name}.sh`]);
      //   let buffers = [];
      //   child.stdout.on("data", function (buffer) {
      //     buffers.push(buffer);
      //   });
      //   child.stdout.on("end", function () {
      //     let logs = Buffer.concat(buffers).toString();
      //     sendMail(`
      //       <h1>部署日期: ${new Date()}</h1>
      //       <h2>部署人: ${payload.pusher.name}</h2>
      //       <h2>部署邮箱: ${payload.pusher.email}</h2>
      //       <h2>提交信息: ${payload.head_commit && payload.head_commit["message"]}</h2>
      //       <h2>布署日志: ${logs.replace("\r\n", "<br/>")}</h2>
      //   `);
      //   });
      // }
    });
  } else {
    res.end("Not Found");
  }
});
server.listen(4000, () => {
  console.log("webhook 服务已在4000端口上启动！");
});
