const Bookinstance = require('../models/bookInstance')
const Book = require('../models/book')
const { body, validationResult } = require('express-validator');
const { book_create_post } = require('./bookController');

exports.bookinstance_list = (req, res, next) => {
    Bookinstance.find()
        .populate('book')
        .exec(function (err, list_bookinstances) {
            if (err) { return next(err) }
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances })
        })
}

exports.bookinstance_details = (req, res) => {
    Bookinstance.findById(req.params.id)
        .populate('book')
        .exec((err, bookinstance) => {
            if (err) { return next(err); }
            if (bookinstance == null) {
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }

            res.render('bookinstance_detail', { title: 'Copy: ' + bookinstance.book.title, bookinstance: bookinstance });
        })
}

exports.bookinstance_create_get = function (req, res, next) {

    Book.find({}, 'title')
        .exec(function (err, books) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
        });

};

exports.bookinstance_create_post = [

    // Validate and sanitise fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new Bookinstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({}, 'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
                });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new record.
                res.redirect(bookinstance.url);
            });
        }
    }
];

exports.bookinstance_delete_get = (req, res, next) => {
    Bookinstance.findById(req.params.id).populate('book').exec(function (err, results) {
        if (err) { return next(err) }
        if (results == null) {
            res.redirect('/catalog/bookinstances')
        }
        res.render('bookinstance_delete', { title: 'Delete book instance', bookinstance: results })
    })
}

exports.bookinstance_delete_post = (req, res, next) => {
    Bookinstance.findById(req.body.bookinstanceid).exec(function (err, results) {
        if (err) { return next(err) }
        if (results == null) {
            res.redirect('/catalog/bookinstances')
        }
        Bookinstance.findByIdAndRemove(req.body.bookinstanceid, function(err){
            if(err){return next(err)}
            res.redirect('/catalog/bookinstances')
        })
    })
}

exports.bookinstance_update = (req, res) => {
    res.send("updating bookinstance")
}