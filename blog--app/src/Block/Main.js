import React, {useContext} from "react";
import StateManager from "../store/StateManager";

const Main = () => {
  const state = useContext(StateManager)

  console.log(state.filters)

  return (
    <div>
      {state.filters.map(filter => {
        return <li>{filter.name}</li>
      })}
    </div>
  )
}

export default Main;