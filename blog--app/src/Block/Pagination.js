import React, {useContext} from "react";
import StateManager from "../store/StateManager";

const Pagination = () => {
  const {pagination, handlePagination, pagerArrows} = useContext(StateManager);

  let firstAndNextUrls = pagination.length > 1 ?  {
    first: pagination[0].url,
    last: pagination.slice(-1).pop().url,
  }

    : null;

  return <div>
    {firstAndNextUrls ? <a href={firstAndNextUrls.first} onClick={handlePagination}>First</a> : null}
    {pagerArrows.prev !== '' ? <a href={pagerArrows.prev} onClick={handlePagination}>Prev</a> : null}

    <ul>
      {pagination.map((item, index)=>{
        return <li key={item.id}>
          <a href={item.url}
             className={item.active ? "pagination-element active" : "pagination-element"}
             onClick={handlePagination}
             id={item.id}>{index +1}</a>
        </li>
      })}
    </ul>
    {pagerArrows.next !== '' ? <a href={pagerArrows.next} onClick={handlePagination}>Next</a> : null}
    {firstAndNextUrls ? <a href={firstAndNextUrls.last} onClick={handlePagination}>Last</a> : null}
  </div>
};

export default Pagination;