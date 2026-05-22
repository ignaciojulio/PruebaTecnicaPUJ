const bookService = require('../services/bookService');

class BookController {
    async checkAvailability(req, res, next) {
        try {
            const { isbn } = req.params;
            const availability = await bookService.checkAvailability(isbn);

            return res.status(200).json({
                status: 'success',
                data: availability
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookController();