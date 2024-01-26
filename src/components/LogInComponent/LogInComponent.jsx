import React, { useState } from "react";
import "./styles.css";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebaseConfig";

function LogInComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const saveSessionToken = (authUser) => {
    const token = {
      email: authUser.user.email,
      auth: true,
    };

    sessionStorage.setItem("autenticacion", JSON.stringify(token));
  };

  const signIn = async (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((auth) => {
        // console.log("auth");
        // console.log(auth);

        // console.log("email");
        // console.log(auth.user.email);

        if (auth) {
          toast.success(`Bienvenido ${auth.user.email.split("@")[0]}`);

          saveSessionToken(auth);
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(`Email o contraseña incorrectos`);
      });

    // const result = await signInWithEmailAndPassword(auth, email, password);

    // console.log("result");
    // console.log(result);

    // console.log("email");
    // console.log(result.user.email);

    // if (result.user) {
    //   toast.success(`Bienvenido ${result.user.email.split("@")[0]}`);
    //   navigate("/");
    // } else {
    //   console.log("NO PASA NADA");
    //   toast.error(`Email o contraseña incorrectos`);
    // }

    // signInWithEmailAndPassword(email, password)
    //   .then((authUser) => {
    //     navigate("/");
    //   })
    //   .catch((error) => alert(error));
  };

  return (
    <div className="login">
      {/* <Link to="/">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png"
          alt=""
          className="login_logo"
        />
      </Link> */}

      <div className="login_container">
        <h2>UNIBEERSE LOGIN</h2>

        <form className="login_form">
          <div className="email_gap">
            <h5>E-mail</h5>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="password_gap">
            <h5>Password</h5>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" onClick={signIn} className="login_signInButton">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default LogInComponent;
