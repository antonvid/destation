const url = 'https://api.tfl.gov.uk/StopPoint/940GZZLUWCY/arrivals/?app_key=' + process.env.TFL_API_KEY;

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

export { fetchArrivals };