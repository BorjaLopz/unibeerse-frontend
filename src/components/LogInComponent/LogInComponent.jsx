import React, { useEffect, useState } from "react";
import "./styles.css";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import "firebase/firestore";
import {
  addDoc,
  collection,
  getFirestore,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

import CryptoJS from "crypto-js";
import { saveSessionToken, KEY_ENCRIPT } from "../../helpers";
import eye from "/icons/eye.png";
import eyeOff from "/icons/eye-off.png";

function LogInComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [decryptedPassword, setDecryptedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const firestore = getFirestore();

  const [dataDoc, setDataDoc] = useState({});

  const navigate = useNavigate();

  const getUserIDByEmail = async (_email) => {
    const userCollection = collection(firestore, "users");
    const q = query(userCollection, where("email", "==", _email));

    const querySnapshot = await getDocs(q);

    return querySnapshot?.docs[0]?.id || null;
  };

  const getUserEmailByID = async (_userID) => {
    const docRef = doc(getFirestore(), "users", _userID);

    try {
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const docData = docSnapshot.data();
        return docData;
      } else {
        console.log("El documento no existe");
        return null;
      }
    } catch (e) {
      console.log("Error al obtener el documento: ", e.message);
      return null;
    }
  };

  const decryptPassword = (_data) => {
    return new Promise((resolve, reject) => {
      try {
        const decrypted = CryptoJS.AES.decrypt(_data, KEY_ENCRIPT).toString(
          CryptoJS.enc.Utf8
        );
        setDecryptedPassword(decrypted);
        resolve(decrypted);
      } catch (error) {
        reject(error);
      }
    });
  };

  // useEffect(() => {
  //   console.log(`dataDoc: ${dataDoc}`);
  // }, [dataDoc]);

  const signIn = async (e) => {
    e.preventDefault();

    console.log(`Email: ${email}\npassword: ${password}`);

    const userID = await getUserIDByEmail(email.toLowerCase());

    if (userID !== null) {
      const docData = await getUserEmailByID(userID);
      if (docData !== null) {
        const decrypted = await decryptPassword(docData?.password);
        if (decrypted === password) {
          saveSessionToken(docData.email, docData.rol, docData.name);
          toast.success(`Bienvenido ${docData.name}`);
          navigate("/");
        } else {
          toast.error("Email o contraseña incorrectos");
        }
      }
    } else {
      toast.error("Email o contraseña incorrectos");
    }
  };

  return (
    <div className="login">
      <div className="login_container">
        <h2>UNIBEERSE LOGIN</h2>

        <form className="login_form" onSubmit={signIn}>
          <label htmlFor="email">Email</label>
          <div className="email_gap">
            <input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <label htmlFor="password">Contraseña</label>
          <div className="password_gap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <img src={eyeOff} /> : <img src={eye} />}
            </button>
          </div>

          <button type="submit" className="login_signInButton">
            Sign In
          </button>

          <p>
            ¿Aún no formas parte de la experiencia única de UNIBEERSE? ¡Únete
            ahora y descubre un mundo de sabores!
          </p>
          <p>
            ¡
            <span className="importantText">
              <a href="/signup">Regístrate</a>
            </span>{" "}
            gratis y comienza tu viaje cervecero hoy mismo!
          </p>
        </form>
      </div>
    </div>
  );
}

export default LogInComponent;
