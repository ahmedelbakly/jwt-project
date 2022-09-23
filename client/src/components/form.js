import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import jwt_decode from "jwt-decode";

const LoginForm = () => {

 //************************************************************** *
 // states of components 
  const [userLogin, setUserLogin] = useState({
    userName: "",
    password: "",
  });
  const [user, setUser] = useState();
  const [massage, setMassage] = useState("");
//****************************************************** */
// create axios interceptors to renew access token 
   const axiosExpire = axios.create();
   axiosExpire.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();

      const decoded = jwt_decode(user.accessToken);
      if (decoded.exp * 1000 < currentDate.getTime()) {
        const data = await CreateRefreshToken();
        console.log(data);
        config.headers["Authorization"] = `ahmed ${data.accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

//******************************************************************************* */
//create handelChange function to handle value of inputs 
  const handelChange = (e) => {
    setUserLogin((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };
  //*************************************** */
  // create handleSubmit with api to send userLogin data to Server and set user token 
    const handelSubmit = (e) => {
    e.preventDefault();
    axios({
      method: "post",
      url: "http://localhost:5000/login",
      data: userLogin,
    }).then((response) => {
      setUser(response.data);
      sessionStorage.removeItem("token");
      const token = response.data.accessToken;
      sessionStorage.setItem("token", token);
      console.log("login success");
    });
  };
//********************************************************************************** */
// create DeleteUser function to delete user with api 
  const DeleteUser = (id) => {
    // const token = sessionStorage.getItem("token");
    const deleUser = async () => {
      try {
        const res = await axiosExpire({
          method: "delete",
          url: `http://localhost:5000/delUser/${id}`,
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });

        setMassage(res.data);
      } catch (error) {
        setMassage(`${error.response.data},you are not admin`);
      }
    };
    return deleUser;
  };
  
//************************************************************************************** */
// create CreateRefreshToken to create new valid access token by refresh token
  const CreateRefreshToken = async () => {
    try {
      const res = await axios({
        method: "post",
        url: "http://localhost:5000/refresh",
        data: { token: user.refreshToken },
      });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };
//*************************************************************************************** */
// create logout function with api
  const logout = async () => {
    const res = await axiosExpire({
      method: "post",
      url: "http://localhost:5000/logout",
      data: { token: user.refreshToken },
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });
    setUser();
    setMassage("");
    console.log(res.data);
  };
//**************************************************************************************** */
  return (
    <div className="d-flex justify-content-center align-items-center form-con flex-column">
      {user && (
        <div className="d-flex justify-content-start flex-row px-5 py-2 mb-5">
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      )}
      {user && (
        <h1 className="text-white p-3 header">
          {user.isAdmin
            ? `welcome ${user.userName} as admin dashBoard`
            : `welcome ${user.userName} as user dashBoard`}
        </h1>
      )}
{/*#######################################################################################*/}

      <div>
        <Form
          onSubmit={handelSubmit}
          className=" bg-danger px-5 py-5 rounded-4 "
        >
          <Form.Group className="mb-3 text-start" controlId="formBasicEmail">
            <Form.Label className="text-white">User Name</Form.Label>
            <Form.Control
              type="text"
              name="userName"
              placeholder="Enter userName"
              value={userLogin.userName}
              onChange={handelChange}
            />
          </Form.Group>

          <Form.Group className="text-start" controlId="formBasicPassword">
            <Form.Label className="text-white">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              value={userLogin.password}
              onChange={handelChange}
            />
          </Form.Group>

          <Button variant="primary w-100 mt-4" type="submit">
            Login
          </Button>
        </Form>
      </div>
{/*#######################################################################################*/}
      {user && (
        <div className="w-50 d-flex justify-content-between mt-5">
          {" "}
          <Button variant="danger w-50 mx-3" onClick={DeleteUser(1)}>
            Delete Ahmed{" "}
          </Button>
          <Button variant="success w-50 mx-3" onClick={DeleteUser(2)}>
            Delete Omar{" "}
          </Button>
          <Button variant="info w-50 mx-3" onClick={DeleteUser(3)}>
            Delete Hadeer{" "}
          </Button>
        </div>
      )}
      <div className="pt-5">
        <h2 className="massage">{massage && massage}</h2>
      </div>
    </div>
  );
};

export default LoginForm;
