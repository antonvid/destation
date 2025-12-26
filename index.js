// import modules
import express from 'express';
import ejs from 'ejs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';
import { group } from 'console';
import 'dotenv/config';
import { fetchArrivals } from './anton_modules/arrivals';


const app = express();
const port = 8000;
const server = createServer(app);
const io = new Server(server);

let arrivals = [];

setInterval(fetchArrivals, 15000);
fetchArrivals(); // initial fetch

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render("index.ejs")
})

io.on('connection', async (socket) => {
  console.log('user connected');
  socket.emit('arrivals', arrivals)
  // getDestinations()
});

server.listen(port, () => console.log(`destation listening on port ${port}!`))