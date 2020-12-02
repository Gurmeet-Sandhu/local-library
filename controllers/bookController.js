const Book = require('../models/book')
const Author = require('../models/author')
const Genre = require('../models/genre')
const Bookinstance = require('../models/bookInstance')
const { body,validationResult } = require('express-validator');

const async = require('async');
const book = require('../models/book');

exports.index = (req, res) => {
    async.parallel({
        book_count : (callback) => {
            Book.countDocuments({}, callback)
        },
        book_instance_count : (callback) => {
            Bookinstance.countDocuments({},callback)
        },
        book_instance_available_count : (callback) => {
            Bookinstance.countDocuments({status : 'Available'}, callback)
        },
        author_count : (callback) => {
            Author.countDocuments({}, callback)
        },
        genre_count : (callback) => {
            Genre.countDocuments({}, callback)
        }
    }, (err, results) => {
        res.render('index', {title : 'local library home', error : err, data : results})
    })
}

exports.book_list = (req, res, next) => {
    Book.find({}, 'title author')
    .populate('author')
    .exec(function(err, list_books){
        if(err){return next(err)}
        res.render('book_list', {title : 'Book List', book_list : list_books})
    })
}

exports.book_details = (req, res, next) => {
    async.parallel({
        book : (callback) => {
            Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback)
        },
        book_instance : (callback) => {
            Bookinstance.find({'book' : req.params.id})
            .exec(callback)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance } );
    })
}

exports.book_create_get = function(req, res, next) { 
      
    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });
    
};

exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre ==='undefined')
            req.body.genre = [];
            else
            req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
];

exports.book_delete_get = (req, res, next) => {
    async.parallel({
        book : (callback) => {
            Book.findById(req.params.id).exec(callback)
        },
        bookinstance : (callback) => {
            Bookinstance.find({'book' : req.params.id}).exec(callback)
        }
    }, function(err, results){
        if(err){return next(err)}
        if(results.book==null){
            res.redirect('/catalog/books')
        }
        res.render('book_delete', {title : 'Delete Book', book : results.book, book_bookinstance: results.bookinstance})
    })
}

exports.book_delete_post = (req, res, next) => {
    async.parallel({
        book : (callback) => {
            Book.findById(req.body.bookid).exec(callback)
        },
        bookinstance : (callback) => {
            Bookinstance.find({'book' : req.body.bookid}).exec(callback)
        }
    }, function(err, results){
        if(err){return next(err)}
        if(results.book.length > 0){
            res.render('book_delete', {title : 'Delete Book', book : results.book, book_bookinstance: results.bookinstance})
        } else{
            Book.findByIdAndRemove(req.body.bookid, function(err) {
                if(err){return next(err)}
                res.redirect('/catalog/books')
            })
        }
        
    })
}

exports.book_update = (req, res) => {
    res.send("updating book")
}