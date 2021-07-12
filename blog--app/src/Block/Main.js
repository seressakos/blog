import React, {useContext} from "react";
import Filters from "./Filters";
import StateManager from "../store/StateManager";

const Main = () => {
  const state = useContext(StateManager);

  return (
    <div>
     <Filters/>
      {state.cards.map(card => {
        return <div>{card.title}</div>
      })}
    </div>
  )
}

export default Main;