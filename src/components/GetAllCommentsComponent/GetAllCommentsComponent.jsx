import React, { useEffect, useState } from "react";
import "./styles.css";
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
import { useLocation } from "react-router-dom";
import LoadingComponent from "../LoadingComponent/LoadingComponent";

function GetAllCommentsComponent({
  isRegistered,
  showFormComments,
  handleSendCommentsToggle,
  beerContent,
}) {
  const [commentListIDs, setCommentListIDs] = useState([]);
  const [comments, setComments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const firestore = getFirestore();
  const location = useLocation();

  const isThereAnyCommentsInThisBeer = async (_IDBeer) => {
    console.log("_IDBeer");
    console.log(_IDBeer);
    if (_IDBeer !== undefined) {
      const commentCollection = collection(firestore, "comments");
      const q = query(commentCollection, where("beerID", "==", _IDBeer));

      const querySnapshot = await getDocs(q);
      setIsLoading(true);

      if (!querySnapshot.empty) {
        const commentIDs = querySnapshot.docs.map((doc) => doc.id);
        setCommentListIDs(commentIDs);
      } else {
        // setIsLoading(false);
        setCommentListIDs([]);
      }
    }
  };

  const getCommentsByIDs = async () => {
    try {
      const commentsData = await Promise.all(
        commentListIDs.map(async (docID) => {
          const docRef = doc(getFirestore(), "comments", docID);
          const docSnapshot = await getDoc(docRef);

          if (docSnapshot.exists()) {
            return docSnapshot.data();
          }

          return null;
        })
      );

      // Filtrar comentarios que existen (no son nulos)
      const existingComments = commentsData.filter(
        (comment) => comment !== null
      );

      setComments(existingComments);
    } catch (error) {
      console.error("Error al obtener comentarios:", error.message);
    }

    /*************************/
    // let commentsAux = [];
    // commentListIDs.map(async (docID) => {
    //   console.log(docID);
    //   const docRef = doc(getFirestore(), "comments", docID);
    //   console.log("docRef");
    //   console.log(docRef);

    //   const docSnapshot = await getDoc(docRef);
    //   console.log("docSnapshot");
    //   console.log(docSnapshot);
    //   if (docSnapshot.exists()) {
    //     const docData = docSnapshot.data();
    //     console.log("docData");
    //     console.log(docData);

    //     commentsAux.push(docData);
    //   }
    // });
    // console.log("commentsAux");
    // console.log(commentsAux);

    /***************************/
    // try {
    //   const docSnapshot = await getDoc(docRef);

    //   if (docSnapshot.exists()) {
    //     const docData = docSnapshot.data();
    //     return docData;
    //   } else {
    //     console.log("El documento no existe");
    //     return null;
    //   }
    // } catch (e) {
    //   console.log("Error al obtener el documento: ", e.message);
    //   return null;
    // }
  };

  const fetchData = async () => {
    setIsLoading(true);

    // Simular una carga de 2 segundos antes de realizar las operaciones asincrónicas
    setTimeout(async () => {
      await isThereAnyCommentsInThisBeer(beerContent.ID);
      await getCommentsByIDs();
      setIsLoading(false);
    }, 2000);
  };

  const fetchData_2 = async () => {
    try {
      setIsLoading(true);

      await isThereAnyCommentsInThisBeer(beerContent.ID);
      // Obtener comentarios solo si hay algún comentario
      if (commentListIDs.length > 0) {
        const commentsData = await Promise.all(
          commentListIDs.map(async (docID) => {
            const docRef = doc(getFirestore(), "comments", docID);
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
              return docSnapshot.data();
            }

            return null;
          })
        );

        // Filtrar comentarios que existen (no son nulos)
        const existingComments = commentsData.filter(
          (comment) => comment !== null
        );

        setComments(existingComments);
      } else {
        // No hay comentarios, establecer comments en un array vacío
        setComments([]);
      }
    } catch (error) {
      console.error("Error al obtener comentarios:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData_2();
  }, [location]);

  // useEffect(() => {
  //   fetchData();
  // }, [location, beerContent]);

  console.log(comments);
  return (
    <section className="commentsSection">
      {/* Mostramos botón para añadir comentario */}
      {isRegistered && (
        <section className="commentsForm">
          {showFormComments ? (
            <button
              className="addCommentsButton"
              onClick={handleSendCommentsToggle}
            >
              AÑADIR COMENTARIOS
            </button>
          ) : (
            ""
          )}
        </section>
      )}

      {/* Mostramos todos los comentarios que haya de la cerveza */}
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <>
          {comments.length > 0 ? (
            <section className="commentsBeer">
              {/* Renderizar la sección de comentarios si hay comentarios */}
              {comments.map((comment) => (
                // Renderizar cada comentario individual
                <div key={comment.id} className="comments">
                  <p className="commentName">{comment.name}</p>
                  <p className="commentComment">{comment.comment}</p>
                </div>
              ))}
            </section>
          ) : (
            <p>No hay comentarios disponibles.</p>
          )}

          {/* Resto del contenido de la sección de comentarios */}
        </>
      )}
    </section>
  );
}

export default GetAllCommentsComponent;
