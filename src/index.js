const  axios  = require('axios')
const express = require('express')
const responseTime = require('response-time')
const redis = require('redis')
const { promisify }  = require('util')
const app = express()


const client  = redis.createClient({
  host:'127.0.0.1',
  port:6379
})

/*  */
const GET_REDIS = promisify(client.get).bind(client)
const SET_REDIS = promisify(client.set).bind(client)

app.use(responseTime())

app.get('/characters', async (req,res)=>{

       try {
          const reply =  await GET_REDIS(req.originalUrl)
          if(reply){
              return res.json(JSON.parse(reply))
          }
          const {data} = await axios.get('https://rickandmortyapi.com/api/character')
          await SET_REDIS(req.originalUrl, JSON.stringify(data) )
          return res.json(data)
       } catch (error) {
          console.log(error)
       }
    })


app.get('/characters/:id', async (req,res)=>{
     const {id}= req.params
      const reply = await GET_REDIS(req.originalUrl)
      if(reply){
        return res.json(JSON.parse(reply))
      }

     const {data} = await axios.get('https://rickandmortyapi.com/api/character/'+id)

     await SET_REDIS(req.originalUrl, JSON.stringify(data))
     return res.json(data)

})

app.listen(3000, () => console.log('server on port 3000'))

 


 