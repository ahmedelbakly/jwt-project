const express = require("express");
const app = express();
const cors = require("cors");
const Fun = require("./function")

const port = 5000;
// import jsonwebtoken
const JWT = require("jsonwebtoken");
// app use express.json to receive request from api.
app.use(express.json());
// app use cors middleware 
app.use(cors());
// set headers to access data from server
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Method", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// array to save refresh token.
let refreshTokens = [];
//****************************************************************** */
// create post route to create new access token when it not valid
app.post("/refresh", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) res.status(403).json("you not authorization");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("refreshToken is not valid");
  }
  JWT.verify(refreshToken, "myRefreshToken", (error, user) => {
    error && console.log(error);
    refreshTokens = [];
    const newAccessToken = Fun.generateToken(user, "mySecretToken", "5s");
    const newRefreshToken = Fun.generateToken(user, "myRefreshToken", "1h");
    refreshTokens.push(newRefreshToken);
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokens: refreshTokens,
    });
  });
});
//************************************************************************ */
// route to send massage to homepage of server.
app.get("/", (req, res) => {
  res.send("<h1>Hello World,from backend side !</h1>");
});
//************************************************************************ */
// route to login user and create token and sent it to client .
app.post("/login", (req, res) => {
  const { userName, password } = req.body;
  console.log(userName, password);
  let user = Fun.users.find((u) => {
    return u.userName === userName && u.password === password;
  });
  // create token when login
  if (user) {
    const accessToken = Fun.generateToken(user, "mySecretToken", "5s");
    const refreshToken = Fun.generateToken(user, "myRefreshToken", "1h");
    refreshTokens.push(refreshToken);

    
    res.json({
      userName: user.userName,
      id: user.id,
      password: user.password,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(404).json("user not found");
  }
});

//************************************************************************ */
// route delete to delete user from data.
app.delete("/delUser/:userId", Fun.verify, (req, res, next) => {
  if (req.user.id.toString() === req.params.userId || req.user.isAdmin) {
    res.status(200).json("user has been deleted");
  } else {
    res.status(403).json("not allowed");
  }
});
//************************************************************************ */
// route post to logout user from app.
app.post("/logout", Fun.verify, (req, res, next) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("logout is success");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
//refreshTokens.filter((token) => token !== refreshToken)
