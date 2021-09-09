import React, {useState, useEffect} from "react";
import {createCardsArray} from "../helpers/helpers";

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
   const urlParams = new URLSearchParams(window.location.search);
   let paginationArray = [];
   let urlArray = [];

   useEffect(() => {
     let pageNum = urlParams.get('page') || urlParams.get('page') > 1 ? urlParams.get('page') : false;
     let baseFilter = urlParams.get('filter') || '';
     const filterNames = baseFilter.split('&filter_');
     filterNames.shift();

      Promise.all([
         fetch(`http://backend.fodorzsana.hu/jsonapi/taxonomy_term/tags`, {'method': 'GET'}),
      ])
          .then (values => Promise.all(values.map(value => value.json())))
          .then (data => {
            let filters = [];

            data[0]['data'].map(filter => {
              filters.push({
                name: filter['attributes']['name'],
                id: filter['attributes']['drupal_internal__tid'],
                isChecked: filterNames.includes(filter['attributes']['name']),
              })

              if (filterNames.includes(filter['attributes']['name'])) {
                urlArray.push(`${urlArray.length > 0 ? '&' : '?'}
                     filter[${filter['attributes']['drupal_internal__tid']}-group][group][conjunction]=AND&
                     filter[${filter['attributes']['drupal_internal__tid']}][condition][value]=${filter['attributes']['drupal_internal__tid']}&
                     filter[${filter['attributes']['drupal_internal__tid']}][condition][path]=field_tag.drupal_internal__tid&
                     filter[${filter['attributes']['drupal_internal__tid']}][condition][memberOf]=${filter['attributes']['drupal_internal__tid']}-group`
                );
              }
            })

            setFilters(filters);

            contentFetcher(`http://backend.fodorzsana.hu/jsonapi/node/blog${urlArray.length > 0 ? urlArray.join('') + '&' : '?'}include=field_image&fields[file--file]=uri&
            sort=-nid&page[offset]=${pageNum && pageNum > 1 ? (pageNum - 1) * 5 : 0}&page[limit]=5`, pageNum && pageNum > 1)
          })
   },[])

  const contentFetcher = (url, hasPageNumInUrl, currentUrl = url) => {
    setLoad(true);

    Promise.all([
      fetch(`${url}`, {'method': 'GET'}),
    ])
        .then(values => Promise.all(values.map(value => value.json())))
        .then(data => {
          if (url === currentUrl) {
            setCards(createCardsArray(data));
            setPrevAndNextLink({
              prev : data[0]['links']['prev'] ? data[0]['links']['prev']['href'] : '',
              next : data[0]['links']['next'] ? data[0]['links']['next']['href'] : '',
            })

            if (!hasPageNumInUrl) {
              paginationArray=[...paginationArray, ...[{
                'url': url,
                'active': true,
              }]]
            }
          }

          if (data[0]['links']['next'] && !hasPageNumInUrl) {
            const newUrl = data[0]['links']['next']['href'];

            paginationArray=[...paginationArray, ...[{
              'url': newUrl,
            }]];

            contentFetcher(newUrl, false, currentUrl);
          }
          else if(hasPageNumInUrl) {
            const newUrl = data[0]['links']['first']['href'];

            paginationArray=[...paginationArray, ...[{
              'url': newUrl,
            }]];

            contentFetcher(newUrl, false, currentUrl);
          }


          paginationArray.map((e, index) => {
            e.id = `pagination--item-${index}`;
            e.active = currentUrl.replace(/\s/g, '') === decodeURI(e.url).replace(/\s/g, '');
          })


          setPaginationUrls(paginationArray)
        });
  }

  const handlePagination = (event)=> {
     event.preventDefault();
     let url = event.target.href;
     let id = event.target.innerHTML;


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
          setCards(createCardsArray(data))
          setPrevAndNextLink({
            prev : data[0]['links']['prev'] ? data[0]['links']['prev']['href'] : '',
            next : data[0]['links']['next'] ? data[0]['links']['next']['href'] : '',
          })
        });

    urlParams.set('page',  id.toString());
    window.history.replaceState(
      null,
      document.title,
      `${window.location.origin}${window.location.pathname}?${urlParams}`,
    )
  }

  const makeCallWithUrlQuery = (event) => {
    const terms = filters;
    urlArray = [];
    const urlFragmentArray = [];

    terms.map((filter) => {
      if (event) {
        if (filter.id == event.target.id) {
          filter.isChecked = event.target.checked
        }
      }

      if (filter.isChecked) {
        urlArray.push(`${urlArray.length > 0 ? '&' : '?'}
         filter[${filter.id}-group][group][conjunction]=AND&
         filter[${filter.id}][condition][value]=${filter.id}&
         filter[${filter.id}][condition][path]=field_tag.drupal_internal__tid&
         filter[${filter.id}][condition][memberOf]=${filter.id}-group`
        )

        urlFragmentArray.push(`&filter_${filter.name}`)
      }
    })

    urlParams.delete('page')
    urlParams.set('filter',  urlFragmentArray.join('').toString());

    window.history.pushState(
      null,
      document.title,
      `${window.location.origin}${window.location.pathname}?${urlParams}`,
    )

    contentFetcher(`http://backend.fodorzsana.hu/jsonapi/node/blog${urlArray.length > 0 ? urlArray.join('') + '&' : '?'}
       filter[search-or][group][conjunction]=OR&
       filter[body-filter][condition][path]=body.value&
       filter[body-filter][condition][operator]=CONTAINS&
       filter[body-filter][condition][value]=${searchText}&
       filter[body-filter][condition][memberOf]=search-or&filter[title][operator]=CONTAINS&
       filter[title][value]=${searchText}&
       filter[title][condition][memberOf]=search-or&
       include=field_image&fields[file--file]=uri&
       &sort=-nid&
       page[limit]=5`);


    if (event) {
      setFilters(terms);
    }
  }

   const handleCheckEvent = (event) => {
     makeCallWithUrlQuery(event);
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
