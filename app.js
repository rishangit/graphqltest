const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const app = express();

const Event = require('./models/event')

const Access = require('./models/access')


app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery{
            events:[Event!]!
        }

        type RootMutation{
            createEvent(eventInput:EventInput) : Event
        }

        schema {
            query:RootQuery
            mutation:RootMutation
        }
    `),
    rootValue: {
        events: (args) => {
            return Access.list().then(events => {
                return events.map(event => {
                    return event
                })
            }).catch(err => { throw err });
        },
        createEvent: (args) => {
            const event = {
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date)

            }

            return Access.save(event).then(result => {
                console.log(result)
                return { ...result };
            }).catch(err => {
                console.log(err)
                throw err
            });
        }
    },
    graphiql: true

}))

// mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-8m47i.mongodb.net/${process.env.MOGO_DB}?retryWrites=true&w=majority`).then(() => {
//     console.log('db')

// }).catch(err => {
//     console.log('db error', err)
// })

app.listen(3000, () => {
    console.log('server run on port 3000')
});
