import { useEffect, useState } from "react";
import "./style.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import ScrollTopComponent from "../ScrollTop/ScrollTopComponent";

function CustomPagination({
  data,
  dataLimit,
  pageLimit,
  RenderComponent,
  filter,
  isShown = true,
}) {
  const { numberPage } = useParams();
  const NumericNumberPage = Number(numberPage);

  let pages = Math.ceil(data?.length / dataLimit);
  const [currentPage, setCurrentPage] = useState(NumericNumberPage || 1);
  const [dataAvailable, setDataAvailable] = useState([]);
  const navigate = useNavigate();

  function goToNextPage() {
    setCurrentPage((page) => page + 1);
  }

  function goToPreviousPage() {
    setCurrentPage((page) => page - 1);
  }

  function changePage(event) {
    const pageNumber = Number(event.target.textContent);
    setCurrentPage(pageNumber);
  }

  function goToFirstPage() {
    setCurrentPage((page) => (page = 1));
  }

  function goToLastPage() {
    setCurrentPage((page) => (page = pages));
  }

  const getPaginatedData = () => {
    const startIndex = NumericNumberPage * dataLimit - dataLimit;
    const endIndex = startIndex + dataLimit;

    setDataAvailable(data?.slice(startIndex, endIndex));
  };

  const getPaginationGroup = () => {
    let start =
      Math.floor((currentPage - 1) / parseInt(pageLimit)) * parseInt(pageLimit);
    return new Array(parseInt(pageLimit)).fill().map((_, idx) => {
      return start + idx + 1;
    });
  };

  useEffect(() => {
    // Lógica para cargar la lista de datos paginados y otras acciones necesarias
    getPaginatedData();
    window.scrollTo({ behavior: "smooth", top: "0px" });

    // Manejar casos donde la página solicitada es mayor que el total de páginas
    if (NumericNumberPage > pages) {
      navigate("/404");
    }
  }, [pages, navigate, filter]);

  useEffect(() => {
    // Actualizar currentPage cuando NumericNumberPage cambie
    setCurrentPage(NumericNumberPage);
  }, [NumericNumberPage]);

  return (
    <>
      <>
        <article>
          {/* <section id="title">
            {data?.length === 0 ? (
              <h2>No hay ningun resultado</h2>
            ) : (
              <h2>{`Mostrando ${
                filter === "" ? "todos los resultados" : filter
              }`}</h2>
            )}
          </section> */}
          <article id="shownFilteredBeers">
            {!isShown ? (
              data?.length > 0 ? (
                <h2>{`Mostrando resultados de \"${filter}\"`}</h2>
              ) : (
                <h2>{`No hay resultados de \"${filter}\"`}</h2>
              )
            ) : (
              ""
            )}
          </article>
          <section id="beer-area">
            {dataAvailable.map((d, index) => {
              return (
                <>
                  <RenderComponent
                    data={d}
                    key={index}
                    page={NumericNumberPage}
                  />
                </>
              );
            })}
          </section>
        </article>

        {data?.length !== 0 && isShown && (
          <div className="pagination">
            {/* First Page */}
            <Link to={`/beers/page/1`} key={"firstPage"}>
              <button
                onClick={goToFirstPage}
                className={`prev ${currentPage === 1 ? "disabled" : ""}`}
              >
                {`<<<`}
              </button>
            </Link>

            {/* previous button */}
            <Link to={`/beers/page/${currentPage - 1}`} key={"prevPage"}>
              <button
                onClick={goToPreviousPage}
                className={`prev ${currentPage === 1 ? "disabled" : ""}`}
              >
                {`<`}
              </button>
            </Link>

            {/* show page numbers */}
            {getPaginationGroup().map((item, index) => (
              <Link to={`/beers/page/${item}`} key={`Page${index}`}>
                <button
                  key={index}
                  onClick={changePage}
                  className={`paginationItem ${
                    currentPage === item ? "active" : null
                  } ${item > pages ? "disabled" : null}`}
                >
                  <span>{item}</span>
                </button>
              </Link>
            ))}

            {/* next button */}
            <Link to={`/beers/page/${currentPage + 1}`} key={"nextPage"}>
              <button
                onClick={goToNextPage}
                className={`next ${currentPage === pages ? "disabled" : ""}`}
              >
                {`>`}
              </button>
            </Link>

            {/* Last Page */}
            <Link to={`/beers/page/${pages}`} key={"lastPage"}>
              <button
                onClick={goToLastPage}
                className={`prev ${currentPage === pages ? "disabled" : ""}`}
              >
                {`>>>`}
              </button>
            </Link>
          </div>
        )}
        <div>
          {currentPage !== pages ? (
            <p>
              {dataLimit * (currentPage - 1) + 1} - {dataLimit * currentPage} de{" "}
              {data.length}
            </p>
          ) : (
            <p>
              {dataLimit * (currentPage - 1) + 1} - {data.length} de{" "}
              {data.length}
            </p>
          )}
        </div>
      </>
      <ScrollTopComponent />
    </>
  );
}

export default CustomPagination;
