const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const logger = require('morgan')
const port = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId

app.use(bodyParser.json())
app.use(cors())
app.use(logger('dev'))

const errorMsg = err => ( { error: { errorName: err.name, errorMessage: err.message } } )

// State
app.get('/state', ( req, res ) => {
  try {
    let { page, rowsPerPage, name } = req.query
    page ? page = page - 1 : page = 0
    rowsPerPage ? null : rowsPerPage = 10
    MongoClient.connect( MONGODB_URI, { useNewUrlParser: true }, ( err, client ) => {
      if ( err ) return res.status( 500 ).json( errorMsg( err ) )
      const db = client.db('heroku_dpct8x8x')
      const State = db.collection('state')
      State
        .find(name ? { name: { '$regex': name, '$options': 'i' } } : {})
        .limit(rowsPerPage)
        .skip(rowsPerPage * page)
        .sort({ name: 1 })
        .toArray(( err, states ) => {
        if ( err ) return res.status( 500 ).json( errorMsg( err ) )
        return res.status(200).json(states)
      })
    })
  } catch (err) {
    return res.status(500).json( errorMsg(err) )
  }
})

// City
app.get('/city', ( req, res ) => {
  try {
    let { page, rowsPerPage, name, state } = req.query
    page ? page = page - 1 : page = 0
    rowsPerPage ? null : rowsPerPage = 10
    let query = {}
    if (name) query.name = { '$regex': name, '$options': 'i' }
    if (state) query.state = ObjectId(state)
    MongoClient.connect(MONGODB_URI, { useNewUrlParser: true }, async ( err, client ) => {
      if ( err ) return res.status( 500 ).json( errorMsg( err ) )
      const db = client.db('heroku_dpct8x8x')
      const City = db.collection('city')
      City
        .find(query)
        .limit(rowsPerPage)
        .skip(rowsPerPage * page)
        .sort({ name: 1 })
        .toArray(( err, cities ) => {
          if ( err ) return res.status( 500 ).json( errorMsg( err ) )
          return res.status(200).json(cities)
        })
    })
  } catch (err) {
    return res.status( 500 ).json( errorMsg( err ) )
  }
})



app.listen(port, () => console.log(`Running in port ${port}`))