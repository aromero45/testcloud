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

router.get ('/add', isLoggedIn, (req, res) => {

     res.render('links/add');
});
router.post('/add',isLoggedIn, async (req, res) =>{

    //const archivos=0;
    
        //res.end("File is uploaded");
        const archivos = req.body;
        console.log(req.body);
        const archivos2 = req.files;
      
        //const archivos2 = req.file;
         console.log(archivos2);
         console.log(archivos);
         
    
   
       const {name, image, url, startdate, enddate, description} =archivos;
        const newContest = {
             name,
             image,
             url,
             startdate,
             enddate,
             description,
             user_id: req.user.id
        };
        
        /*file.mv("../public/uploads/"+filename,function(err){
                if(err){
                   console.log(err);
                }
                else {
                   Console.log('subida la imagen')
                }
        })*/
        await pool.query('INSERT INTO contest set ?', [newContest]);
     
         var contestid = await pool.query('SELECT * FROM contest WHERE name = ? AND url = ?',[newContest.name, newContest.url]);
         //let ImageFiles = req.files.image;
         let ImageFiles
          if (!req.files) {
            ImageFiles = null;
          }
          else{
            ImageFiles=req.files.image
          }
         const id = contestid[0].id;
         //const contest = await pool.query('SELECT * FROM contest WHERE id = ?', [id]);
         console.log(contestid);
         console.log(id);
         //const ImageFileName = `${new Date().getTime()}${path.extname(ImageFiles.name)}`
         const ImageFileName = `${req.user.id+"-"+id}${path.extname(ImageFiles.name)}`
         ImageFiles.mv(`${__dirname}/../public/uploads/${ImageFileName}`).then(async () => {
             //console.log(req.files)
             try {
                 console.log("subio archivo");
             } catch (error) {
                 console.log("subida de archivo");
             }
         });
        req.flash('success', 'concurso guardado correctamente');
     
        res.redirect('/links');
   

});

router.get('/', isLoggedIn, async (req, res) => {
     const links = await pool.query('SELECT * FROM contest WHERE user_id = ?', [req.user.id]); 
     res.render('links/list', {links});
}); 

router.get ('/delete/:id', isLoggedIn, async (req, res) => {
    
     const { id } = req.params;
     await pool.query('DELETE FROM contest WHERE ID = ?', [id]);
     req.flash('success', 'Concurso removido satisfactoriamente');
     res.redirect('/links');
});

router.get ('/edit/:id', isLoggedIn, async (req, res) => {
    
     const { id } = req.params;
     const contest = await pool.query('SELECT * FROM contest where id = ?', [id]);
     res.render('links/edit', {contest: contest[0]} );
});

router.post ('/edit/:id', isLoggedIn, async (req, res) => {
    
     const archivos = req.body;
     console.log(req.body);
     const archivos2 = req.files;

  //const archivos2 = req.file;
     console.log(archivos2);
     console.log(archivos);
     const ImageFiles = req.files.image;
     const { id } = req.params; 
     const {name, image, url, startdate, enddate, description} =req.body;
     const newContest = {
          name,
          image,
          url,
          startdate,
          enddate,
          description
     };
     await pool.query('UPDATE contest set ? WHERE id = ?', [newContest, id]);
         //const contest = await pool.query('SELECT * FROM contest WHERE id = ?', [id]);
     console.log(ImageFiles);
     console.log(id);
         //const ImageFileName = `${new Date().getTime()}${path.extname(ImageFiles.name)}`
     const ImageFileName = `${req.user.id+"-"+id}${path.extname(ImageFiles.name)}`
     ImageFiles.mv(`${__dirname}/../public/uploads/${ImageFileName}`).then(async () => {
             //console.log(req.files)
             try {
                 console.log("subio archivo");
             } catch (error) {
                 console.log("subida de archivo");
             }
     });
     req.flash('success', 'Concurso editado satisfactoriamente');
     res.redirect('/links');
});


module.exports = router; 