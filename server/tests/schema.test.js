const fetch = require('node-fetch')
const query = `
query{
    allStories(limit:0 , offset : 0){
      title
    }
  }
`;
const url = "http://localhost:2000/graphql";
const opts = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query })
};

describe('story resolvers' , () => {
    test('allStories' , async () => {
        const response = await fetch(url, opts)
         .then(res => {
            res.json()
            })
         .then((response) => {
             console.log(response)
         })
        .catch(console.error);
        
        // console.log(data)
        expect(data).toMatchObject({
                data: {
                  allStories: [
                    {
                      title: "Goa Trip"
                    },
                    {
                      title: "Bangalore Trip"
                    },
                    {
                      title: "Mumbai Trip"
                    },
                    {
                      title: "Delhi Trip"
                    },
                    {
                      title: "Ooty Trip"
                    },
                    {
                      title: "Coorg Trip"
                    },
                    {
                      title: "Beach Trip"
                    },
                    {
                      title: "Kerala Trip"
                    },
                    {
                      title: "Manali Trip"
                    },
                    {
                      title: "Shimla Trip"
                    }
                  ]
                }
              
        })

    })
})

// const response = fetch('http://localhost:2000/graphql',{
//             method :'POST',
//             body:JSON.stringify(`
//             query{
//                 allStories(limit:0 , offset : 0){
//                   title
//                 }
//               }
//             `)
//         });
        
//     const {data} = response;
//     console.log(response)
//     response.then((data , err) => {
//         console.log(data)
//     })


