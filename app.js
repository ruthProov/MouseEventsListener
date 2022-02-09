const express = require('express');
const axios = require('axios');
const fs = require('fs').promises
const app = express();
const PORT = 3000;

function promiseRequest(uri, cookie, qs = {}, method = 'GET') {
    const options = {
      method: method,
      url: uri,
      headers: {
        Cookie: cookie
      },
      data: qs,
      json: true,
      withCredentials: true,
      responseType: 'stream'
    };
    console.log(options, "options");
    return axios(options)
      .then(body => body)
      .catch(e => {
        throw new Error(e.message);
      });
    
  }
const getPage = async () => {
    const data =
    {
      "template": {
        "shortid": "E4AFvut"
  
      }
    }
    return await promiseRequest('http://localhost:5488/api/report/reporting-service', null, data, 'POST')
  } 
app.get('/', async(req, res)=>{
    const result = await getPage();
    console.log("----------------------------", typeof result.data);
    console.log("----------------------------",__dirname +'/pdfs/1644339272469.pdf');
    const nameFile=`${Date.now()}.pdf`
    await fs.writeFile(`./pdfs/${nameFile}`, result.data)
    res.download(__dirname +'/pdfs/'+nameFile, function(error){
        console.log("download successed");
        if(error)
        console.log("Error : ", error)
    });
});
   
app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});