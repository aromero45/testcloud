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
     res.render('videos/addvideo');
});

router.get('/:url', async (req, res) => {

  const { url } = req.params;
  console.log(url);
  nameurl[0]=url; 
  const links = await pool.query('SELECT * FROM contest WHERE url = ?', [url]); 
  const videos = await pool.query('SELECT *FROM videos WHERE contest_id = ?', [links[0].id]);
  console.log(links[0].id);
  console.log(videos);
  res.render('videos/listvideos', {videos});
}); 

router.post('/add/url/:url', function (req, res, success){
   
        const { url } = req.params;
        console.log("Url: ", url);
        let contestid;

        pool.query('SELECT * FROM contest WHERE url = ?',[url], function(err,result){
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
              pool.query('INSERT INTO videos set ?', [newVideo], function(err, res){
                if(err){
                  throw err
                }else{
                  if(fs.existsSync(RUTA_GESTOR_ARCHIVOS+contestid+'//inicial')){
                      if(originvideo!==null){
                          originvideo.mv(RUTA_GESTOR_ARCHIVOS+contestid+`//inicial//${originvideo.name}`,function(err, result){
                              if(err){
                                  return res.status(500).send(err);
                              }
                              success(result);
                          });
                      }
                      else{
                          success(result);
                      }
                  }
                }
              });
            }
        });
        pool.query('SELECT * FROM contest WHERE url = ?', [url], function(err,result){
          res.render('videos/listvideos', {result});
        }); 
});

router.post('/add/id/:id', function (req, res, success){
   
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
        pool.query('INSERT INTO videos set ?', [newVideo], function(err, res){
          if(err){
            throw err
          }else{
            if(fs.existsSync(RUTA_GESTOR_ARCHIVOS+contestid+'//inicial')){
                if(originvideo!==null){
                    originvideo.mv(RUTA_GESTOR_ARCHIVOS+contestid+`//inicial//${originvideo.name}`,function(err, result){
                        if(err){
                            return res.status(500).send(err);
                        }
                        success(result);
                    });
                }
                else{
                    success(result);
                }
            }
          }
        });
      }
  });
  pool.query('SELECT * FROM contest WHERE id = ?', [id], function(err,result){
    res.render('videos/listvideos', {result});
  }); 
});


module.exports = router; 


module.exports = router; 