const loanService = require('../services/loanService');

class LoanController {
    async createLoan(req, res, next) {
        try {
            // book_isbn, user_id, loan_date, due_date vienen en el body
            const newLoan = await loanService.createLoan(req.body);

            return res.status(201).json({
                status: 'success',
                message: 'Préstamo registrado correctamente',
                data: newLoan
            });
        } catch (error) {
            next(error);
        }
    }

    async returnBook(req, res, next) {
        try {
            const { id } = req.params;
            const result = await loanService.returnBook(id);

            return res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    async getOverdueLoans(req, res, next) {
        try {
            const overdueLoans = await loanService.getOverdueLoans();

            return res.status(200).json({
                status: 'success',
                results: overdueLoans.length,
                data: overdueLoans
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LoanController();