import React from "react";

export const getCards = (array, index, element) => {
  return {
    // imageurl: `${this.state.appRoot}/${array[0]['included'][index]['attributes']['uri']['url']}`,
    title: element['attributes']['title'].toString(),
    // alias: element['attributes']['path']['alias'],
    // alt: element['relationships']['field_site_image']['data'][0]['meta']['alt'],
  };
};
