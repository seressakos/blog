import React from "react";

export const getCards = (element) => {
  return {
    // imageurl: `${this.state.appRoot}/${array[0]['included'][index]['attributes']['uri']['url']}`,
    title: element['attributes']['title'].toString(),
    // alias: element['attributes']['path']['alias'],
    // alt: element['relationships']['field_site_image']['data'][0]['meta']['alt'],
  };
};


export const createCardsArray = (data) => {
  let cardsArray = [];

  data[0]['data'].map((element, index) => {
    cardsArray = [
      ...cardsArray,
      ...[
        getCards(element),
      ],
    ]
  });

  return cardsArray
}
