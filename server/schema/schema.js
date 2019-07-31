const graphql = require('graphql');
const Story = require('../models/story');
const fetch = require('node-fetch')
const { URL, URLSearchParams } = require('url');


const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLInputObjectType
} = graphql;

var links = [];
//Schema
const SubStoryType = new GraphQLObjectType({
    name: "SubStory",
    fields: ({
        id: { type: GraphQLID },
        order: { type: GraphQLInt },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        url: { type: GraphQLString },
        tags: { type: GraphQLString }
    })
});


const StoryType = new GraphQLObjectType({
    name: "Story",
    fields: {
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        tags: { type: GraphQLString },
        subStory: {
            type: GraphQLList(SubStoryType)
        }
    }
});

const YouTubeType2 = new GraphQLObjectType({
    name: "YouTube",
    fields: () => ({
        url: { type: GraphQLString },
        videoId: { type: GraphQLString },
        title: { type: GraphQLString }
    })
})

const NewsType = new GraphQLObjectType({
    name: "News",
    fields: () => ({
        author: { type: GraphQLString },
        source: { type: GraphQLString },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        url: { type: GraphQLString },
        urlToImage: { type: GraphQLString },
        content: { type: GraphQLString }
    })
})



// Resolvers
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        StoryFeed: {                          //Query to get Single Story by ID
            type: GraphQLList(StoryType),
            args: { tag: { type: GraphQLString }, limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
            resolve(parent, args, context, info) {
                let data = info.fieldNodes[0].selectionSet.selections;
                let len = info.fieldNodes[0].selectionSet.selections.length;
                let s = '';
                for (let i = 0; i < len; i++) {
                    s = s + ' ' + data[i].name.value;
                }
                var query = Story.find({ tags: args.tag }).limit(args.limit).skip(args.offset).select(s);
                return query;

            }
        },

        allStories: {                                 // Query to get all Stories 
            type: GraphQLList(StoryType),
            args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
            resolve(parent, args, { }, info) {
                let data = info.fieldNodes[0].selectionSet.selections;
                let len = info.fieldNodes[0].selectionSet.selections.length;
                let s = '';
                for (let i = 0; i < len; i++) {
                    s = s + ' ' + data[i].name.value;
                }
                var query = Story.find().limit(args.limit).skip(args.offset).select(s)
                return query
            }
        },

        VideoFeed: {
            type: GraphQLList(YouTubeType2),
            args: { query: { type: GraphQLString }, limit: { type: GraphQLInt } },
            async resolve(parent, args) {
                let q = args.query;
                let maxResults = args.limit;
                // links.length = 0;
                // let words = new Array();
                // words = q.split(" ");
                // let str = '';
                // for (var i = 0; i < words.length; i++) {
                //     str += words[i]
                // }
                // let API_KEY = 'AIzaSyC1pasDoHQX5brwOEZUTs6DoSxF2zRl2vk'
                //  let hit_url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=' + maxResults + '&fields=items(id%2FvideoId%2Csnippet%2Ftitle)&key=' + API_KEY + '&q=' + str;
                //  let hit_url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&fields=items(id%2FvideoId%2Csnippet%2Ftitle)&key=AIzaSyBTde1eKMDwXCRPD8juOhSYzvcfk2U5Xg4'
                let hit_url = new URL('https://www.googleapis.com/youtube/v3/search')
                var params = { q, maxResults , part : 'snippet' , key : 'AIzaSyC1pasDoHQX5brwOEZUTs6DoSxF2zRl2vk' , fields : 'items(id/videoId,snippet/title)' };
                hit_url.search = new URLSearchParams(params)
                console.log(hit_url)
                // var res = encodeURI(hit_url);
                console.log(hit_url)

                await fetch(hit_url).then(res => res.json())
                    .then(json => {
                        links=[]
                        // console.log(json.items[0].snippet)
                        for (var i = 0; i < maxResults; i++) {
                            let videoId = json.items[i].id.videoId
                            let title = json.items[i].snippet.title
                            let link = "https://www.youtube.com/embed/" + videoId;
                            let obj = {
                                url: link,
                                videoId,
                                title
                            }
                            links.push(obj);
                        }
                    });
                return links;
            }
        },

        SubStorySearch: {
            type: GraphQLList(SubStoryType),
            args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
            resolve(parent, args) {
                var query = Story.find().select('SubStory')
                return query;
            }
        },

        NewsFeed: {
            type: GraphQLList(NewsType),
            args: { query: { type: GraphQLString }, limit: { type: GraphQLInt } },
            async resolve(parent, args) {
                let q = args.query;
                console.log(q)
                let size = args.limit;
                return fetch('https://newsapi.org/v2/everything?from=2019-06-31&sortBy=publishedAt&apiKey=58700e97a495469996792adb1f746fa3&q=' + q + '&pageSize=' + size).then(res => res.json())
                    .then(json => {
                        return json.articles;
                    });
            }
        },

    }
});


// Input Type of SubStories
const createUserInputType = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: () => ({
        ssid: { type: GraphQLString },
        order: { type: GraphQLInt },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        url: { type: GraphQLString },
        tags: { type: GraphQLString },
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
                subStory: {
                    type: GraphQLList(createUserInputType),
                }

            },
            resolve(parent, args, context, info) {
                //Convert all data to lower Case to store in DB.
                // args.title.toLowerCase();
                // args.description.toLowerCase();
                // args.tags.toLowerCase();
                // for (var i = 0; i < args.subStory.length; i++) {
                //     args.subStory[i].title.toLowerCase();
                //     args.subStory[i].description.toLowerCase();
                //     args.subStory[i].tags.toLowerCase();
                // }
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