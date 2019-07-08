const graphql = require('graphql');
const Story  = require('../models/story');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLInputObjectType
} = graphql;

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