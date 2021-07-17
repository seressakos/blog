import React, {useContext} from "react";
import StateManager from "../store/StateManager";

const Cards = () => {
  const {cards} = useContext(StateManager);

  return <div>
    {cards.map(card => {
      return <h1>{card.title}</h1>
    })}
  </div>
}

export default Cards;