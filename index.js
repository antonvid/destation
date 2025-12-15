// import modules
import express from 'express';
import ejs from 'ejs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';
import { group } from 'console';
import 'dotenv/config';


const app = express();
const port = 8000;
const server = createServer(app);
const io = new Server(server);

const url = 'https://api.tfl.gov.uk/StopPoint/940GZZLUWCY/arrivals/?app_key=' + process.env.TFL_API_KEY;

let arrivals = [];

setInterval(fetchArrivals, 15000);
fetchArrivals(); // initial fetch

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render("index.ejs")
})

// TfL poll function
async function fetchArrivals() {
  arrivals = [];
  try {
    const res = await fetch(url);
    const data = await res.json(); // convert to json

    data.sort((a, b) => a.timeToStation - b.timeToStation);
    
    arrivals = data.reduce((group, train) => {
      const { lineId, towards } = train;

      group[lineId] = group[lineId] ?? [];
      // group[lineId][towards] = group[lineId][towards] ?? [];
    
      let mins = train.timeToStation / 60;
      
      if(mins < 1){
        mins = 'due';
      } else {
        mins = Math.round(mins)+'mins';
      }

      group[lineId].push({
        destination: towards,
        mins: mins
      });

      return group;
    }, {});

    // console.log(arrivals)
    io.emit('arrivals', arrivals)
    
    
    // for(let i=0; i<5; i++){
    //   let mins = data[i].timeToStation / 60;
      
    //   if(mins < 1){
    //     mins = 'due';
    //   } else {
    //     mins = Math.round(mins) + 'mins';
    //   }
      
    //   arrivals.push([data[i].lineId, data[i].towards, mins]);
      
    //   io.emit('arrivals', arrivals);
    // }
    
  } catch (err) {
    console.error(err);
  }
};

io.on('connection', async (socket) => {
  console.log('user connected');
  socket.emit('arrivals', arrivals)
  // getDestinations()
});

server.listen(port, () => console.log(`destation listening on port ${port}!`))