import React, {useState, useEffect} from "react";

const StateManager = React.createContext({
   filters: [],
   funct: () => {}
})

export const StateProvider = (props) => {
   const [filters, setFilters] = useState([]);

   useEffect(()=> {
      Promise.all([
         fetch(`https://pronovix.site.devportal.io/jsonapi/node/pronovix_blog`, {'method': 'GET'}),
      ])
          .then (values => Promise.all(values.map(value => value.json())))
          .then (data => {
             setFilters([...filters,
                 ...data[0]['data'].map(filter=> {
                    return {
                       name: filter['attributes']['name']
                    }
                 })]
                 )
          })

   },[])

   const funct = () => {
      console.log('kkff')

   }

   return <StateManager.Provider value={{filters: filters, funct:funct}}>{props.children}</StateManager.Provider>
}


export default StateManager