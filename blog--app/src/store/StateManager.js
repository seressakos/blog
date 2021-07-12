import React, {useState, useEffect} from "react";

const StateManager = React.createContext({
   filters: [],
   cards: [],
  handleCheckEvent: (e) => {}
})

export const StateProvider = (props) => {
   const [filters, setFilters] = useState([]);
   const [load, setLoad] = useState('false');
   const [cards, setCards] = useState([]);
   const [paginationUrls, setPaginationUrls] = useState([])

  const getCards = (array, index, element) => {
    return {
      // imageurl: `${this.state.appRoot}/${array[0]['included'][index]['attributes']['uri']['url']}`,
      title: element['attributes']['title'].toString(),
      // alias: element['attributes']['path']['alias'],
      // alt: element['relationships']['field_site_image']['data'][0]['meta']['alt'],
    };
  };

   useEffect(()=> {
      Promise.all([
         fetch(`http://backend.fodorzsana.hu/jsonapi/taxonomy_term/tags`, {'method': 'GET'}),
      ])
          .then (values => Promise.all(values.map(value => value.json())))
          .then (data => {
             setFilters([...filters,
                 ...data[0]['data'].map(filter=> {
                    return {
                      name: filter['attributes']['name'],
                      id: filter['attributes']['drupal_internal__tid'],
                      isChecked: false,
                    }
                 })]
                 );

             contentFetcher('http://backend.fodorzsana.hu/jsonapi/node/blog?include=field_image&fields[file--file]=uri&sort=-nid');
          })

   },[])

  const contentFetcher = (url, currentUrl = url) => {
    setLoad(true)

    Promise.all([
      fetch(`${url}`, {'method': 'GET'}),
    ])
        .then(values => Promise.all(values.map(value => value.json())))
        .then(data => {
          if (url === currentUrl) {
            let cardsArray = [];

            data[0]['data'].map((element, index) => {
              const arrayHasObject = cardsArray.some(el => el.title === element['attributes']['title'].toString());

              if (!arrayHasObject) {
                cardsArray = [
                  ...cardsArray,
                  ...[
                    getCards(data, index, element),
                  ],
                ]
              }
            });

            setCards(cardsArray)
          }

          let urls = [{
            'url': url,
            'active': true,
          }];

          if (data[0]['links']['next']) {
            const newUrl = data[0]['links']['next']['href'];
            urls = [...urls, ...[{
              'url': newUrl,
              'active': url === newUrl ? true : false,
            }]];

            urls.map((e, index) => {
              e.id = `pagination--item-${index}`
            });

            setPaginationUrls([...paginationUrls, ...urls])

            contentFetcher(newUrl, currentUrl);
          }

        });
  }

   const handleCheckEvent = (event) => {
     setPaginationUrls([]);
     const terms = filters;
     const headerFragmentArray = [];
     let separator;

     terms.map((filter, index) => {
       if (filter.id == event.target.id) {
         filter.isChecked = event.target.checked
       }

       if (filter.isChecked) {
         separator = index === 0 ? '?' : '&';
         headerFragmentArray.push(`${separator}filter[${filter.id}-group][group][conjunction]=AND&filter[${filter.id}][condition][value]=${filter.id}&filter[${filter.id}][condition][path]=field_tag.drupal_internal__tid&filter[${filter.id}][condition][memberOf]=${filter.id}-group`)
       }

     })

     contentFetcher(`http://backend.fodorzsana.hu/jsonapi/node/blog${headerFragmentArray.join('')}`)

     setFilters(terms);

     const urlParams = new URLSearchParams(window.location.search);
     urlParams.set('filter', event.target.id);
     window.history.replaceState(
         null,
         document.title,
         `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`,
     )

   };

   return <StateManager.Provider value={{filters: filters, cards:cards, handleCheckEvent:handleCheckEvent}}>{props.children}</StateManager.Provider>
}


export default StateManager

// http://backend.fodorzsana.hu/jsonapi/node/blog?filter[field_tag][condition][path]=field_tag.drupal_internal__tid&filter[field_tag][condition][value][]=2&filter[field_tag][condition][value][]=1&filter[field_tag][condition][operator]=IN
// http://backend.fodorzsana.hu/jsonapi/node/blog?filter[blue-and][group][conjunction]=AND&filter[blue][condition][value]=one&filter[blue][condition][path]=field_tag.name&filter[blue][condition][memberOf]=blue-and&filter[red-and][group][conjunction]=AND&filter[red][condition][value]=two&filter[red][condition][path]=field_tag.name&filter[red][condition][memberOf]=red-and