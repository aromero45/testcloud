const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
var AWS = require('aws-sdk');
const exec = require('child_process').exec;
const uuidv4 = require('uuid/v4');
var nameurl = [];
const RUTA_GESTOR_ARCHIVOS_RAIZ = process.env.ruta_gestion_archivos_raiz;
const RUTA_GESTOR_ARCHIVOS = process.env.ruta_gestion_archivos;
const {isLoggedIn} = require('../lib/auth');



// Set the region 
AWS.config.update({
  region: 'us-east-1',
  accessKeyId:process.env.ACCES_KEY_ID,
  secretAccessKey:process.env.SECRET_ACCESS_KEY
});

var rds = new AWS.RDS({apiVersion: '2014-10-31'});

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

  var isLogged=true;  
  const { url } = req.params;
  console.log("URL get: ",url);
  nameurl[0]=url; 
  const links = await pool.query('SELECT * FROM contest WHERE url = ?', [url]); 
  const videos = await pool.query('SELECT *FROM videos WHERE contest_id = ?', [links[0].id]);
  //res.render('videos/addvideo',{links});
  res.render('videos/listvideos', {videos:videos, url:url, isLogged:isLogged});
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

router.post('/add/id/:id', function (req, res, success){
   
  const { id } = req.params;
  let contestid;
  let idarchivo=uuidv4();
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
        var nombreCompleto = nameVideo.split('.');
        var extension = nombreCompleto[nombreCompleto.length - 1];
        let videoName=(idarchivo+extension);
        const newVideo = {
            name: req.body.name,
            last_name: req.body.lastname,
            email: req.body.email,
            message: req.body.message,
            original_video: videoName,
            contest_id: contestid
        };
        console.log("Video", newVideo.original_video);
        pool.query('INSERT INTO videos set ?', [newVideo], function(err){
          if(err){
            throw err
          }else{
            let status;
            if(fs.existsSync(RUTA_GESTOR_ARCHIVOS+contestid+'//inicial')){
                if(originvideo!==null){
                    originvideo.mv(RUTA_GESTOR_ARCHIVOS+contestid+`//inicial//${videoName}`,function(err, result){
                        if(err){
                            throw err;
                        }
                    });
                    console.log("Extension id: ", extension);
                    if(extension==="mp4"){
                      status="Convertido";
                      originvideo.mv(RUTA_GESTOR_ARCHIVOS+contestid+`//convertido//${videoName}`,function(err, result){
                          if(err){
                              throw err;
                          }
                      });
                      pool.query('UPDATE into videos set status = ? '[status], function(err){
                        if(err){
                          throw err;
                        }
                      });
                    }else{
                      status="No Convertido";
                      pool.query('UPDATE into videos set status = ? '[status], function(err){
                        if(err){
                          throw err;
                        }
                      });
                    }
                }
                /*else{
                    success(result);
                }*/
                success(result);
            }
          }
        });
      }
  });
  pool.query('SELECT * FROM contest WHERE id = ?', [id], function(err,result){
    if(err){
      throw err
    }
    console.log(result);
    var data=result[0].url;
    var page='/videos/'+data;
    res.redirect(page);
  });
});

router.post('/add/url/:url', function (req, res, success){
   
  const { url } = req.params;
  let contestid;
  let idarchivo=uuidv4();
  pool.query('SELECT * FROM contest WHERE url = ?',[url], function(err,result){
      if (err){
        throw err
      }else{
        console.log(result[0]);
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
        var nombreCompleto = nameVideo.split('.');
        var extension = nombreCompleto[nombreCompleto.length - 1];
        let videoName=(idarchivo+'.'+extension);
        const newVideo = {
            name: req.body.name,
            last_name: req.body.lastname,
            email: req.body.email,
            message: req.body.message,
            original_video: videoName,
            contest_id: contestid
        };
        pool.query('INSERT INTO videos set ?', [newVideo], function(err){
          if(err){
            throw err
          }else{
            if(fs.existsSync(RUTA_GESTOR_ARCHIVOS+contestid+'//inicial')){
                if(originvideo!==null){
                    originvideo.mv(RUTA_GESTOR_ARCHIVOS+contestid+`//inicial//${videoName}`,function(err, result){
                        if(err){
                            throw err;
                        }
                    });
                }
                /*else{
                    success(result);
                }*/
            }
            success(result);
          }
        });
        let status;
        console.log("Extension url: ", extension);
        if(extension==="mp4"){
          status="Convertido";
          originvideo.mv(RUTA_GESTOR_ARCHIVOS+contestid+`//convertido//${videoName}`,function(err){
              if(err){
                  throw err;
              }
          });
          pool.query('UPDATE videos SET status = ?, converted_video = ? WHERE original_video= ?',[status,videoName,videoName], function(err,result){
            console.log("Res Update conv: ",result)
            if(err){
              throw err;
            }
          });
        }else{
          status="No Convertido";
          pool.query('UPDATE videos SET status = ? WHERE original_video= ?',[status,videoName], function(err,result){
            console.log("Res Update noConv; ",result)
            if(err){
              throw err;
            }
          });
        }
      }
  });
  var page='/videos/'+url;
  res.redirect(page);
});


module.exports = router; 