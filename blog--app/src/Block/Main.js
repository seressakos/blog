import React from "react";
import Filters from "./Filters";
import Pagination from "./Pagination";
import Cards from "./Cards";


const Main = () => {
  return (
    <div>
     <Filters/>
      <Cards/>
      <Pagination/>
    </div>
  )
}

export default Main;