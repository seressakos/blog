import React, {useContext} from "react";
import StateManager from "../store/StateManager";

const Pagination = () => {
  const {pagination, handlePagination} = useContext(StateManager);

  return <ul>
    {pagination.map((item, index)=>{
      return <li>
        <a href={item.url}
           className={item.active ? "pagination-element active" : "pagination-element"}
           onClick={handlePagination}
           id={item.id}>{index +1}</a>
      </li>
    })}
  </ul>
};

export default Pagination;