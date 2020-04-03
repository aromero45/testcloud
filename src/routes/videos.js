const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');


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
   // Init Upload
 const upload = multer({
     storage: multer.diskStorage({
       destination: '../public/uploads/',
       filename: function(req, file, cb){
         cb(null,Date.now() + path.extname(file.originalname));
       }
     }),
     limits:{fileSize: 1000000},
     fileFilter: function(req, file, cb){
       checkFileType(file, cb);
     }
 }).single('image');

const pool = require('../database');
const {isLoggedIn} = require('../lib/auth');


router.get('/add', async (req, res) => {
     res.render('videos/addvideo', {links});
});
router.post('/add', async (req, res) =>{
   
        const archivos = req.body;
        console.log(req.body);
        const archivos2 = req.files;
      
        //const archivos2 = req.file;
         console.log(archivos2);
         console.log(archivos);
         
    
   
       //const {name, last_name, email, message, original_video} = archivos;
       const newVideo = {
             name: req.body.name,
             last_name: req.body.lastname,
             email: req.body.email,
             message: req.body.message,
             original_video: req.body.originalvideo
             //contest_id: req.contest.id
        };
        
        /*file.mv("../public/uploads/"+filename,function(err){
                if(err){
                   console.log(err);
                }
                else {
                   Console.log('subida la imagen')
                }
        })*/
         await pool.query('INSERT INTO videos set ?', [newVideo]);
     
         var videoid = await pool.query('SELECT * FROM video WHERE email = ?',[newVideo.email]);
         const ImageFiles = req.files.image;
         const id = videoid[0].id;
         //const contest = await pool.query('SELECT * FROM contest WHERE id = ?', [id]);
         console.log(videoid);
         console.log(id);
         //const ImageFileName = `${new Date().getTime()}${path.extname(ImageFiles.name)}`
         const ImageFileName = `${req.user.id+"-"+id}${path.extname(ImageFiles.name)}`
         ImageFiles.mv(`${__dirname}/../public/videos/originales/${ImageFileName}`).then(async () => {
             //console.log(req.files)
             try {
                 console.log("subio archivo");
             } catch (error) {
                 console.log("subida de archivo");
             }
         });
        req.flash('success', 'concurso guardado correctamente');
     
        res.redirect('/videos');
     
});

router.get('/', isLoggedIn, async (req, res) => {
     const links = await pool.query('SELECT * FROM contest WHERE user_id = ?', [req.user.id]); 
     const videos = await pool.query('SELECT *FROM videos WHERE contest_id = ?', [links.id]);
     res.render('videos/listvideos', {videos});
}); 


module.exports = router; 