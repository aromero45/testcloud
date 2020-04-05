const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
var nameurl = [];
var AWS = require('aws-sdk');



function checkFileType(file, cb){
     // Allowed ext
     const filetypes = /jpeg|jpg|png|gif/;
     // Check ext
     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
     // Check mime
     const mimetype = filetypes.test(file.mimetype);
     if(mimetype && extname){
       return cb(null,true);
     } else {
       cb('Error: Images Only!');
     }
 }
const pool = require('../database');
const {isLoggedIn} = require('../lib/auth');


router.get('/add', async (req, res) => {
     res.render('videos/addvideo', {links});
});
router.post('/add', function (req, res, success){
   
  const archivos = req.body;
  const archivos2 = req.files;


  //const archivos2 = req.file;
   console.log(archivos2);
   console.log(archivos);
   console.log(nameurl[0]);
   //const archivos3 = pool.query('SELECT * FROM contest WHERE url = ?',[nameurl[0]]);
   console.log(archivos3);
   const contestid = archivos3[0].id;
 
 //const {name, last_name, email, message, original_video} = archivos;

 const newVideo = {
       name: req.body.name,
       last_name: req.body.lastname,
       email: req.body.email,
       message: req.body.message,
       original_video: req.body.originalvideo,
       contest_id: contestid
  };
  

   /*pool.query('INSERT INTO videos set ?', [newVideo]);

   var videoid = pool.query('SELECT * FROM videos WHERE email = ? AND name = ?',[newVideo.email, newVideo.name]);
   const ImageFiles = req.files.originalvideo;
   const id = videoid[0].id;
   //const contest = await pool.query('SELECT * FROM contest WHERE id = ?', [id]);
   console.log(videoid[0]);
   console.log(id);
   //const ImageFileName = `${new Date().getTime()}${path.extname(ImageFiles.name)}`
   const ImageFileName = `${req.user.id+"-"+contestid+"-"+id}${path.extname(ImageFiles.name)}`
  ImageFiles.mv(`${__dirname}/../public/videos/originales/${ImageFileName}`).then(async () => {
             //console.log(req.files)
             try {
                 console.log("subio archivo");
             } catch (error) {
                 console.log("subida de archivo");
             }
         });
  const videoname = req.user.id+"-"+contestid+"-"+id; 
  console.log(videoname); 
  await pool.query('UPDATE videos set original_video = ? WHERE id = ?', [videoname, videoid[0].id]);
  res.redirect('videos/listvideos', {videosid});*/
       
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


module.exports = router; 