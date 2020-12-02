const express = require('express');
const router = express.Router()

const bookController = require('../controllers/bookController');
const authorController = require('../controllers/authorController');
const bookinstanceController = require('../controllers/bookinstanceController');
const genreController = require('../controllers/genreController');

// author Routes
router.get('/author/create', authorController.author_create_get)
router.post('/author/create', authorController.author_create_post)
router.get('/author/:id/delete', authorController.author_delete_get)
router.post('/author/:id/delete', authorController.author_delete_post)
router.get('/author/update/:id', authorController.author_update)
router.get('/author/:id', authorController.author_details)
router.get('/authors', authorController.author_list)

// book routes

router.get('/', bookController.index)
router.get('/book/create', bookController.book_create_get)
router.post('/book/create', bookController.book_create_post)
router.get('/book/:id/delete', bookController.book_delete_get)
router.post('/book/delete', bookController.book_delete_post)
router.get('/book/update/:id', bookController.book_update)
router.get('/book/:id', bookController.book_details)
router.get('/books', bookController.book_list)

// genre routes
router.get('/genre/create', genreController.genre_create_get);
router.post('/genre/create', genreController.genre_create_post);
router.get('/genre/:id/delete', genreController.genre_delete_get);
router.post('/genre/delete', genreController.genre_delete_post);
router.get('/genre/:id/update', genreController.genre_update);

// POST request to update Genre.
router.post('/genre/:id/update', genreController.genre_update);

router.get('/genre/:id', genreController.genre_details);
router.get('/genres', genreController.genre_list)


//bookinstance routes
router.get('/bookinstance/create', bookinstanceController.bookinstance_create_get);
router.post('/bookinstance/create', bookinstanceController.bookinstance_create_post);
router.get('/bookinstance/:id/delete', bookinstanceController.bookinstance_delete_get);
router.post('/bookinstance/delete', bookinstanceController.bookinstance_delete_post);
router.post('/bookinstance/:id/update', bookinstanceController.bookinstance_update);
router.get('/bookinstance/:id', bookinstanceController.bookinstance_details);
router.get('/bookinstances', bookinstanceController.bookinstance_list);

module.exports = router