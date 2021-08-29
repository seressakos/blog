import React, {useContext} from "react";
import StateManager from "../store/StateManager";

const Search = () => {
  const {filters, handleSearch, inputHandler} = useContext(StateManager);

  return (
      <div>
        <input type="text" onChange={inputHandler}/>
        <button onClick={handleSearch}>Button</button>
      </div>
  )
}

export default Search