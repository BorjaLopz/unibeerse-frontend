import { useEffect, useState } from "react";
import "./style.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import ScrollTopComponent from "../ScrollTop/ScrollTopComponent";

function Pagination({ data, RenderComponent }) {
  return (
    <>
      {data.map((beer) => {
        return <RenderComponent data={beer} />;
      })}
    </>
  );
}

export default Pagination;
