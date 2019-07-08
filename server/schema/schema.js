const graphql = require('graphql');
const Story  = require('../models/story');
const fetch = require('node-fetch')

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLInputObjectType
} = graphql;

let links = [];
//Schema
const SubStoryType = new GraphQLObjectType({
    name: "SubStory",
    fields:({
        id: { type: GraphQLID },
        order: { type: GraphQLInt },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        url: { type: GraphQLString },
        tags: {type: GraphQLString}
    })
});


const StoryType = new GraphQLObjectType({
    name: "Story",
    fields: {
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        tags: {type: GraphQLString},
        subStory: {
         type: GraphQLList(SubStoryType)
        }
    }
});

const id = new GraphQLObjectType({
    name : "id",
    fields: ({
        videoId : {type : GraphQLString}
    })
})

const ItemsType = new GraphQLObjectType({
    name : "Items",
    fields : ({
        id : { type: (id)}
    })
})

const YouTubeType = new GraphQLObjectType({
    name : "YouTube",
    fields: ({
        items: {type: GraphQLList(ItemsType)}
    })
})

const YouTubeType2 = new GraphQLObjectType({
    name : "haa",
    fields: ({
        url : {type : GraphQLString}
    })
})




// Resolvers
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        StorySearchFeed: {                                        //Query to get Single Story by ID
            type: GraphQLList(StoryType),
            args: { tag: { type: GraphQLString } },
            resolve(parent, args, context , info){
                let data = info.fieldNodes[0].selectionSet.selections;
                let len = info.fieldNodes[0].selectionSet.selections.length;
                let s = '';
                for(let i = 0 ; i < len ; i++){         
                    s = s + ' ' + data[i].name.value;
                }
                var query =  Story.find({tags: args.tag}).select(s);
                return query;

            }
        },
      
        Stories: {                                      // Query to get all Stories 
            type: GraphQLList(StoryType),
            resolve(parent, args , context , info){
               
                let data = info.fieldNodes[0].selectionSet.selections;
                let len = info.fieldNodes[0].selectionSet.selections.length;
                let s = '';
                for(let i = 0 ; i < len ; i++){         
                    s = s + ' ' + data[i].name.value;
                }
                var query = Story.find().select(s)
                 return query
            }
        },

        YouTubeFeed: {
            type : YouTubeType2,
            resolve(parent,args,context,info){
               return fetch('https://www.googleapis.com/youtube/v3/search?part=id&maxResults=5&q=lfc&fields=items(id%2FvideoId)&key={API_KEY}&q=nodejs').then(res => res.json())
                .then(json => {
                    let videoId = json.items[0].id.videoId;
                    console.log(videoId);
                    let link = "https://www.youtube.com/embed/" + videoId;
                    console.log(link);
                    links.push(link);
                    console.log(links[0])
                    return links;
                });
              
            }
        }
     
    }
});


// Input Type of SubStories
const createUserInputType = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: () => ({
        ssid: {type: GraphQLString},
        order: {type: GraphQLInt},
        title: {type : GraphQLString},
        description: {type : GraphQLString},
        url: {type: GraphQLString},
        tags: {type: GraphQLString},
    }),
  });
  

// Mutation to add Story in DB.
const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addStory: {                                 //Mutation to Add Story to DB.
            type: StoryType,
            args: {
                id: { type: GraphQLString },
                title: { type: GraphQLString },
                description: { type: GraphQLString },
                tags: { type: GraphQLString },
                subStory:{
                    type: GraphQLList(createUserInputType),
                }
                
            },
            resolve(parent, args , context , info){
                var story = new Story(args);
                return story.save();
            }
        }
  
    }
});
 

// Export Resolvers
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});


/*
Query to get data.
{
  Stories{
    id,
    title,
    description,
    tags,
    subStory{
    id,
    order,
      title,
      description,
      url,
      tags
    }
  }
}
*/

/*
Query to mutate.
mutation{
  addStory(title : "Shimla Trip" ,
    description : "Sampe description",
    tags: "Shimla",
    subStory:[{
      order: 0,
      title: "Shimla Story",
      description: "Sample Description",
      url: "https://images.unsplash.com/photo-1561296275-ed0cadb83832?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjc2Mzg2fQ"
      tags: "Shimla"
    },
    {
       order: 1,
      title: "Shimla Story",
      description: "Sample Description",
      url: "https://images.unsplash.com/photo-1561296275-ed0cadb83832?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjc2Mzg2fQ"
      tags: "Shimla"
    },
    ]
  ){
    title
  }
}
*/