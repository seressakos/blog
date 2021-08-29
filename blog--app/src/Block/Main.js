import React from "react";
import Filters from "./Filters";
import Pagination from "./Pagination";
import Cards from "./Cards";
import Search from "./Search";


const Main = () => {
  return (
    <div>
    <Search/>
     <Filters/>
      <Cards/>
      <Pagination/>
    </div>
  )
}

export default Main;