const async = require('async')
const Genre = require('../models/genre')
const Book = require('../models/book')
const { Error } = require('mongoose')
const { body,validationResult } = require('express-validator');

exports.genre_list = (req, res, next) => {
    Genre.find()
        .exec(function (err, list_genre) {
            if (err) { return next(err) }
            res.render('genre_list', { title: 'Genre List', genre_list: list_genre })
        })
}

exports.genre_details = (req, res, next) => {
    async.parallel({
        genre: (callback) => {
            Genre.findById(req.params.id)
                .exec(callback)
        },
        genre_books: (callback) => {
            Book.find({ 'genre': req.params.id })
                .exec(callback)
        }
    }, (err, result) => {
        if (err) { return next(err) }
        if (result.genre == null) {
            const err = new Error('Genre not found')
            err.status = 404
            return next(err)
        }
        res.render('genre_detail', { title: 'Genre Detail', genre: result.genre, genre_books: result.genre_books })
    })
}

exports.genre_create_get = (req, res, next) => {
    res.render('genre_form', {title : 'Create Genre'})
}

exports.genre_create_post = [

    // Validate and santise the name field.
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var genre = new Genre(
            { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, found_genre) {
                    if (err) { return next(err); }

                    if (found_genre) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    }
                    else {

                        genre.save(function (err) {
                            if (err) { return next(err); }
                            // Genre saved. Redirect to genre detail page.
                            res.redirect(genre.url);
                        });

                    }

                });
        }
    }
];

exports.genre_delete_get = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        genre_books: function(callback) {
          Book.find({ 'genre': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            res.redirect('/catalog/genres');
        }
        // Successful, so render.
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books } );
    });

};

exports.genre_delete_post = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
          Genre.findById(req.body.genreid).exec(callback)
        },
        genre_books: function(callback) {
          Book.find({ 'genre': req.body.genreid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.genre_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('genre_delete', { title: 'Delete Author', genre: results.genre, genre_books: results.genre_books } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Genre.findByIdAndRemove(req.body.genreid, function (err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/genres')
            })
        }
    });
};

exports.genre_update = (req, res) => {
    res.send("updating genre")
}