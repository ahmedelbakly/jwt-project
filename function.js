// import jsonwebtoken 
const JWT = require("jsonwebtoken");
//*************************************************************************** */
// user data fake to project
exports.users = [
    { id: 1, userName: "ahmed", password: "ahmed01500", isAdmin: true },
    { id: 2, userName: "omar", password: "omar01500", isAdmin: false },
    { id: 3, userName: "hadeer", password: "hadeer01500", isAdmin: false },
  ];

//***************************************************************************** */
// generateToken to create user  token by jsonwebtoken
exports.generateToken = (userLog, secret, expire) => {
  const accessToken = JWT.sign(
    {
      id: userLog.id,
      isAdmin: userLog.isAdmin,
      userName: userLog.userName,
    },
    secret,
    { expiresIn: expire }
  );
  return accessToken;
};


//************************************************************************** */
//create verify function to verify user authorize or not
exports.verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    JWT.verify(token, "mySecretToken", (error, user) => {
      if (error) {
        res.status(404).json("token not valid");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(403).json("user not authorization");
  }
};
