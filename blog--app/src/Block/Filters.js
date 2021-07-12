import React, {useContext} from "react";
import StateManager from "../store/StateManager";

const Filters = () => {
  const {filters, handleCheckEvent} = useContext(StateManager);

  return (
      <div>
        {filters.map(filter => {
          return <div key={filter.id}>
            <input type="checkbox" onClick={handleCheckEvent} id={filter.id} defaultChecked={filter.isChecked}/>
            <label>{filter.name}</label>
          </div>
        })}
      </div>
  )
}

export default Filters;