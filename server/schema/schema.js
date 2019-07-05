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
        Story: {                                        //Query to get Single Story by ID
            type: StoryType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args){
                return Story.findById(args.id);
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