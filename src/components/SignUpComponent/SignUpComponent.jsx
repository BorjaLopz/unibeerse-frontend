import React, { useState, useEffect } from "react";
import "./styles.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "firebase/firestore";
import {
  addDoc,
  collection,
  getFirestore,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import CryptoJS from "crypto-js";
import { saveSessionToken, KEY_ENCRIPT } from "../../helpers";

function SignUpComponent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [encryptedPassword, setEncryptedPassword] = useState("");
  const navigate = useNavigate();
  const firestore = getFirestore();

  const encryptPassword = () => {
    const encrypted = CryptoJS.AES.encrypt(password, KEY_ENCRIPT).toString();
    setEncryptedPassword(encrypted);
  };

  useEffect(() => {
    encryptPassword();
  }, [password]); // Dependencia para ejecutar el efecto cuando cambia la contraseña

  const decryptPassword = () => {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedPassword,
      KEY_ENCRIPT
    ).toString(CryptoJS.enc.Utf8);
    setPassword(decrypted);
  };

  const isEmailAvailable = async (_email) => {
    const userCollection = collection(firestore, "users");
    const q = query(userCollection, where("email", "==", _email));

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; //True si esta disponible
  };

  async function createUserInFirestore(email, name, rol, encryptedPassword) {
    console.log("encryptedPassword desde createUser");
    console.log(encryptedPassword);
    try {
      if (await isEmailAvailable(email)) {
        // Añadir usuario a Firestore
        const docRef = await addDoc(collection(firestore, "users"), {
          email,
          name,
          password: encryptedPassword,
          rol,
        });

        return docRef.id;
      }
    } catch (error) {
      console.error("Error al añadir usuario a Firestore: ", error.message);
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      encryptPassword();

      console.log("encryptedPassword desde handleSubmit");
      console.log(encryptedPassword);
      // Añadir usuario a Firestore
      const userId = await createUserInFirestore(
        email.toLowerCase(),
        name,
        "user",
        encryptedPassword
      );

      if (userId) {
        // Guardar token en sessionStorage
        saveSessionToken(email, "user", name);
        toast.success(`Bienvenido ${email.split("@")[0]}`);

        // Redirigir al usuario
        navigate("/");
      } else {
        // Manejar el caso de error al añadir usuario a Firestore
        toast.error("Usuario ya registrado");
      }
    } catch (error) {
      console.error("Error al registrar usuario: ", error.message);
      toast.error("Error al registrar usuario");
    }
  };

  return (
    <div className="signUp">
      <div className="signUp_container">
        <h2>Formulario de Registro</h2>

        <form className="signUp_form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Nombre completo:</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword">Confirmar contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="signUp_button">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpComponent;
