const key = 'AIzaSyBq22BlwDCE07fDqbEmFMBXznKqQF2Bv14';
const id = 'WyNdH_K4xJ0';
fetch(`https://www.googleapis.com/youtube/v3/videos?id=${id}&part=contentDetails&key=${key}`)
  .then(res => res.json())
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  });
