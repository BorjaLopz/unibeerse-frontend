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
    const startIndex = currentPage * dataLimit - dataLimit;

    console.log("startIndex");
    console.log(startIndex);
    const endIndex = startIndex + dataLimit;
    console.log("endIndex");
    console.log(endIndex);

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
    getPaginatedData();
    window.scrollTo({ behavior: "smooth", top: "0px" });
    if (NumericNumberPage > pages) {
      navigate("/404");
    }
  }, [currentPage]);

  console.log("dataAvailable");
  console.log(dataAvailable);

  return (
    <>
      <>
        <article>
          <section id="title">
            {data?.length === 0 ? (
              <h2>No hay ningun resultado</h2>
            ) : (
              <h2>{`Mostrando ${
                filter === "" ? "todos los resultados" : filter
              }`}</h2>
            )}
          </section>
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
              console.log("d");
              console.log(d);
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
            <Link to={`/beers/page/1`}>
              <button
                onClick={goToFirstPage}
                className={`prev ${currentPage === 1 ? "disabled" : ""}`}
              >
                {`<<<`}
              </button>
            </Link>

            {/* previous button */}
            <Link to={`/beers/page/${currentPage - 1}`}>
              <button
                onClick={goToPreviousPage}
                className={`prev ${currentPage === 1 ? "disabled" : ""}`}
              >
                {`<`}
              </button>
            </Link>

            {/* show page numbers */}
            {getPaginationGroup().map((item, index) => (
              <Link to={`/beers/page/${item}`}>
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
            <Link to={`/beers/page/${currentPage + 1}`}>
              <button
                onClick={goToNextPage}
                className={`next ${currentPage === pages ? "disabled" : ""}`}
              >
                {`>`}
              </button>
            </Link>

            {/* Last Page */}
            <Link to={`/beers/page/${pages}`}>
              <button
                onClick={goToLastPage}
                className={`prev ${currentPage === pages ? "disabled" : ""}`}
              >
                {`>>>`}
              </button>
            </Link>
          </div>
        )}
      </>
      <ScrollTopComponent />
    </>
  );
}

export default CustomPagination;
