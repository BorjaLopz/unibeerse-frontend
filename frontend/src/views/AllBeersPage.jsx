import AllBeersComponent from "../components/AllBeersComponent";

function AllBeersPage({ customFilter }) {
  return (
    <>
      <AllBeersComponent customFilter={customFilter} />
    </>
  );
}

export default AllBeersPage;
