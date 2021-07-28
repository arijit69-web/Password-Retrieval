const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
var nodemailer = require("nodemailer");
app.use(express.json());

//Hardcode Database
let user = {
  id: "19BCS1705",
  email: "www.arijitsarkar12345@gmail.com",
  password: "dhffbkjdwfhkjwfhkbjbvejklvjlk",
};

const JWT_SECRET = "Highly Secret Code";

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/forget-password", (req, res, next) => {
  res.render("forgot-password.ejs");
});

app.post("/forget-password", (req, res, next) => {
  const { email } = req.body;
  //Make sure user is there in the database
  if (email != user.email) {
    res.send(
      `<script>alert("❌ User not Registered ❌ "); window.location.href = "/"; </script>`
    );
    return;
  }
  //User exist and now create a One Time Link for 15 mins
  const secret = JWT_SECRET + user.password;
  const payload = {
    email: user.email,
    id: user.id,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  const link = `http://localhost/reset-password/${user.id}/${token}`;

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "19bcs1705@gmail.com",
      pass: "##--Email Password--##",
    },
  });

  var mailOptions = {
    from: "19bcs1705@gmail.com",
    to: user.email,
    subject: "Link for Password Retrieval",
    text: link,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  console.log(link);
  res.send(
    `<script>alert("✅Link Sent Successfully✅"); window.location.href = "/"; </script>`
  );
});

app.get("/reset-password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;
  //Check if this id exist in the database
  if (id != user.id) {
    res.send(
      `<script>alert("❌ Invalid Id ❌ "); window.location.href = "/"; </script>`
    );
    return;
  }
  //We have valid user with this id

  const secret = JWT_SECRET + user.password;
  try {
    const payload = jwt.verify(token, secret);
    res.render("reset-password", { email: user.email });
  } catch (error) {
    console.log(error);
    res.send(
      `<script>alert("⚠️Failed⚠️"); window.location.href = "/"; </script>`
    );
  }
});
app.post("/reset-password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;
  const { password, conpassword } = req.body;
  if (id != user.id) {
    res.send(
      `<script>alert("❌ Invalid Id ❌ "); window.location.href = "/"; </script>`
    );
    return;
  }
  const secret = JWT_SECRET + user.password;
  try {
    const payload = jwt.verify(token, secret);
    //Validate password and confirm password should match
    //We can simply find the user with payload email and id and update with new passoword
    //Hash Password
    user.password = password;
    res.send(user);
  } catch (err) {
    res.send(
      `<script>alert("⚠️Failed⚠️"); window.location.href = "/"; </script>`
    );
  }
});

app.listen(80, () => console.log("🚀 App Running"));
