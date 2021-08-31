import React, {useState, useEffect} from "react";
import {getCards} from "../helpers/getCards";

const StateManager = React.createContext({
   filters: [],
   cards: [],
  pagination: [],
  handleCheckEvent: (e) => {}
})

export const StateProvider = (props) => {
   const [filters, setFilters] = useState([]);
   const [load, setLoad] = useState('false');
   const [cards, setCards] = useState([]);
   const [paginationUrls, setPaginationUrls] = useState([]);
   const [prevAndNextLink, setPrevAndNextLink] = useState({});
   const [searchText, setSearchText] = useState('');

  let paginationArray = [];

   useEffect(() => {
      Promise.all([
         fetch(`http://backend.fodorzsana.hu/jsonapi/taxonomy_term/tags`, {'method': 'GET'}),
      ])
          .then (values => Promise.all(values.map(value => value.json())))
          .then (data => {
            let filters = [];

            data[0]['data'].map(filter=> {
              filters.push({
                name: filter['attributes']['name'],
                id: filter['attributes']['drupal_internal__tid'],
                isChecked: false,
              })
            })

             setFilters(filters);

             contentFetcher('http://backend.fodorzsana.hu/jsonapi/node/blog?include=field_image&fields[file--file]=uri&sort=-nid&page[limit]=5');
          })

   },[])

  const contentFetcher = (url, currentUrl = url) => {
    setLoad(true);

    Promise.all([
      fetch(`${url}`, {'method': 'GET'}),
    ])
        .then(values => Promise.all(values.map(value => value.json())))
        .then(data => {
          if (url === currentUrl) {
            let cardsArray = [];

            data[0]['data'].map((element, index) => {
              cardsArray = [
                ...cardsArray,
                ...[
                  getCards(data, index, element),
                ],
              ]
            });

            setCards(cardsArray);
            setPrevAndNextLink({
              prev : data[0]['links']['prev'] ? data[0]['links']['prev']['href'] : '',
              next : data[0]['links']['next'] ? data[0]['links']['next']['href'] : '',
            })

            paginationArray=[...paginationArray, ...[{
              'url': url,
              'active': true,
            }]]
          }

          if (data[0]['links']['next']) {
            const newUrl = data[0]['links']['next']['href'];

            paginationArray=[...paginationArray, ...[{
              'url': newUrl,
              'active': false,
            }]]

            contentFetcher(newUrl, currentUrl);
          }

          paginationArray.map((e, index) => {
            e.id = `pagination--item-${index}`
          })

          setPaginationUrls(paginationArray)
        });
  }

  const handlePagination = (event)=> {
     event.preventDefault();
     let url = event.target.href;

     let paginationArray = [...paginationUrls];

     paginationArray.map(element=> {
       element.active = event.target.id === element.id;
     })

    setPaginationUrls(paginationArray)

    Promise.all([
      fetch(`${url}`, {'method': 'GET'}),
    ])
        .then(values => Promise.all(values.map(value => value.json())))
        .then(data => {
          let cardsArray = [];

          data[0]['data'].map((element, index) => {
            cardsArray = [
              ...cardsArray,
              ...[
                getCards(data, index, element),
              ],
            ]
          });

          setCards(cardsArray)
          setPrevAndNextLink({
            prev : data[0]['links']['prev'] ? data[0]['links']['prev']['href'] : '',
            next : data[0]['links']['next'] ? data[0]['links']['next']['href'] : '',
          })
        });
  }

  const makeCallWithUrlQuery = (event) => {
    const terms = filters;
    const headerFragmentArray = [];

    terms.map((filter) => {
      if (event) {
        if (filter.id == event.target.id) {
          filter.isChecked = event.target.checked
        }
      }

      if (filter.isChecked) {
        headerFragmentArray.push(`${headerFragmentArray.length > 0 ? '&' : '?'}
         filter[${filter.id}-group][group][conjunction]=AND&
         filter[${filter.id}][condition][value]=${filter.id}&
         filter[${filter.id}][condition][path]=field_tag.drupal_internal__tid&
         filter[${filter.id}][condition][memberOf]=${filter.id}-group`)
      }
    })

    contentFetcher(`http://backend.fodorzsana.hu/jsonapi/node/blog${headerFragmentArray.length > 0 ? headerFragmentArray.join('') + '&' : '?'}
       filter[search-or][group][conjunction]=OR&
       filter[body-filter][condition][path]=body.value&
       filter[body-filter][condition][operator]=CONTAINS&
       filter[body-filter][condition][value]=${searchText}&
       filter[body-filter][condition][memberOf]=search-or&filter[title][operator]=CONTAINS&
       filter[title][value]=${searchText}&
       filter[title][condition][memberOf]=search-or&
       include=field_image&fields[file--file]=uri&
       &sort=-nid&
       page[limit]=5`)


    if (event) {
      setFilters(terms);
    }
  }

   const handleCheckEvent = (event) => {
     makeCallWithUrlQuery(event);

     const urlParams = new URLSearchParams(window.location.search);
     urlParams.set('filter', event.target.id);
     window.history.replaceState(
         null,
         document.title,
         `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`,
     )
   };

   const inputHandler = (e) => {
     setSearchText(e.target.value);
   }

   const handleSearch = () => {
     makeCallWithUrlQuery(false);
   }

   return <StateManager.Provider value={{filters: filters,
     cards:cards,
     handleCheckEvent:handleCheckEvent,
     pagination: paginationUrls,
     handlePagination: handlePagination,
     pagerArrows: prevAndNextLink,
     handleSearch: handleSearch,
     inputHandler: inputHandler,
   }}>{props.children}</StateManager.Provider>
}


export default StateManager
