import express, { Router } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { validURL } from './util/url';
import { UserRouter } from './routers/user.router';
import { sequelize } from './sequelize';
import { User } from './models/User';
import { requireAuth } from './routers/auth.router';

(async () => {
  await sequelize.addModels([User]);
  await User.sync();

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  const imageURLs: string[] = [];
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.use('/users', UserRouter);

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get('/filteredimage', 
    requireAuth,
    (req, res) => {
    const url = req.query.image_url;

    if (!url)
      return res.send('The image URL is required').status(404);
    if (!validURL(url))
      return res.send('A valid image URL is required').status(422);

    filterImageFromURL(url).then(file => {
      imageURLs.push(file);
      res.sendFile(file);
    }).catch(e => res.send('Request failed, try again').status(500));
  })

  app.get('/deleteimages',
    requireAuth,
    (req, res) => {
    deleteLocalFiles(imageURLs);
    res.send('Images deleted');
  })

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();