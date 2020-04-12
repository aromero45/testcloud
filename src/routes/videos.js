const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
var nameurl = [];
const RUTA_GESTOR_ARCHIVOS_RAIZ = process.env.ruta_gestion_archivos_raiz;
const RUTA_GESTOR_ARCHIVOS = process.env.ruta_gestion_archivos;

   // Init Upload

const pool = require('../database');
//const {isLoggedIn} = require('../lib/auth');
router.get ('/add', (req, res) => {
    const { url } = req.params;
    console.log("URL add: ",url);
    nameurl[0]=url;  
    pool.query('SELECT * FROM contest WHERE url = ?', [url], function(err,result){
      if(err){
        throw err
      }else{
        const links=result[0];
        console.log("Valor de links:", links);
        res.render('videos/addvideo',{links});
      }
    }); 
    
});

router.get('/:url', async (req, res) => {

  const { url } = req.params;
  console.log("URL",url);
  nameurl[0]=url; 
  const links = await pool.query('SELECT * FROM contest WHERE url = ?', [url]); 
  const videos = await pool.query('SELECT *FROM videos WHERE contest_id = ?', [links[0].id]);
  //res.render('videos/addvideo',{links});
  res.render('videos/listvideos', {videos:videos, url:url});
}); 

router.get('/add/:url', async (req, res) => {

  const { url } = req.params;
  console.log("URL",url);
  nameurl[0]=url; 
  const links = await pool.query('SELECT * FROM contest WHERE url = ?', [url]); 
  const videos = await pool.query('SELECT *FROM videos WHERE contest_id = ?', [links[0].id]);
  console.log(links[0].id);
  console.log(videos);
  res.render('videos/addvideo',{links});
  //res.render('videos/listvideos', {videos,links});
}); 

router.post('/add/id/:id', function (req, response, success){
   
  const { id } = req.params;
  let contestid;

  pool.query('SELECT * FROM contest WHERE id = ?',[id], function(err,result){
      if (err){
        throw err
      }else{
        contestid=result[0].id;
        let originvideo
        if (!req.files) {
          originvideo = null;
        }
        else{
          originvideo=req.files.originalvideo;
        }
        console.log("origin: ",req.files);
        let nameVideo
        originvideo===null?nameVideo='no-video':nameVideo=originvideo.name;   
        console.log("Contest id: ",contestid);
        console.log("nameVideo: ",nameVideo);
        const newVideo = {
            name: req.body.name,
            last_name: req.body.lastname,
            email: req.body.email,
            message: req.body.message,
            original_video: nameVideo,
            contest_id: contestid
        };
        console.log("Video", newVideo.original_video);
        pool.query('INSERT INTO videos set ?', [newVideo], function(err){
          if(err){
            throw err
          }else{
            if(fs.existsSync(RUTA_GESTOR_ARCHIVOS+contestid+'//inicial')){
                if(originvideo!==null){
                    originvideo.mv(RUTA_GESTOR_ARCHIVOS+contestid+`//inicial//${originvideo.name}`,function(err, result){
                        if(err){
                            throw err;
                            //return res.status(500).send(err);
                        }
                        pool.query('SELECT * FROM videos WHERE contest_id = ?', [id], function(err,result){
                          console.log("Concurso: ", result);
                          response.render('videos/listvideos', {result});
                          //success(result);
                        });
                    });
                }
                /*else{
                    success(result);
                }*/
            }
          }
        });
      }
  });
});


module.exports = router; 