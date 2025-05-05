import Loan from '../models/Loan.js';
import { getBook, countBooks, countAvailableBooks } from './book.controller.js';
import { countUsers } from './user.controller.js';

export const issueBook = async (req, res) => {
    try {
        const { user_id, book_id, due_date } = req.body;
        const bookResponse = await getBook(book_id);
        
        if (!bookResponse.book) {
            return res.status(bookResponse.status || 400).json({ message: bookResponse.message || "Book is not available" });
        }

        const book = bookResponse.book;
        if (book.available_copies <= 0) {
            return res.status(400).json({ message: "Book is not available" });
        }

        const loan = new Loan({
            user_id,
            book_id,
            due_date,
            status: 'ACTIVE'
        });

        book.available_copies -= 1;
        await book.save();
        await loan.save();

        const loanResponse = {
            id: loan._id,  
            user_id: loan.user_id,
            book_id: loan.book_id,
            issue_date: loan.issue_date.toISOString(),  
            due_date: loan.due_date.toISOString(),      
            status: loan.status
        };

        res.status(201).json(loanResponse);
    } catch (error) {
        res.status(500).json({ message: "Error issuing book", error: error.message });
    }
};


export const returnBook = async (req, res) => {
    try {
        const { loan_id } = req.body;
        const loan = await Loan.findById(loan_id);
        if (!loan || loan.status === 'RETURNED') {
            return res.status(404).json({ message: "Loan not found or already returned" });
        }

        const bookResponse = await getBook(loan.book_id);

        if (!bookResponse.book) {
            return res.status(bookResponse.status || 400).json({ message: bookResponse.message || "Book is not available" });
        }


        const book = bookResponse.book;
        book.available_copies += 1;
        await book.save();

        loan.return_date = new Date();
        loan.status = 'RETURNED';
        await loan.save();

        const returnResponse = {
            id: loan._id,  
            user_id: loan.user_id,
            book_id: loan.book_id,
            issue_date: loan.issue_date.toISOString(),  
            due_date: loan.due_date.toISOString(),
            return_date: loan.return_date.toISOString(),      
            status: loan.status
        };

        res.status(200).json(returnResponse);
    } catch (error) {
        res.status(500).json({ message: "Error returning book", error: error.message });
    }
};


export const getLoansByUser = async (req, res) => {
    try {
        const loans = await Loan.find({ user_id: req.params.user_id }).populate('book_id');

        
        const loanResponse = loans.map(loan => ({
            id: loan._id,  
            book: {
                id: loan.book_id._id,  
                title: loan.book_id.title,
                author: loan.book_id.author
            },
            issue_date: loan.issue_date.toISOString(),
            due_date: loan.due_date.toISOString(),
            return_date: loan.return_date ? loan.return_date.toISOString() : null,  
            status: loan.status
        }));

        res.status(200).json(loanResponse);
    } catch (error) {
        res.status(500).json({ message: "Error fetching loans", error: error.message });
    }
};



export const getOverdueLoans = async (req, res) => {
    try {
        const today = new Date();
        const overdueLoans = await Loan.find({
            due_date: { $lt: today },
            status: 'ACTIVE'
        }).populate('user_id').populate('book_id');

        
        const overdueResponse = overdueLoans.map(loan => ({
            id: loan._id,  
            user: {
                id: loan.user_id._id,  
                name: loan.user_id.name,
                email: loan.user_id.email
            },
            book: {
                id: loan.book_id._id,  
                title: loan.book_id.title,
                author: loan.book_id.author
            },
            issue_date: loan.issue_date.toISOString(),
            due_date: loan.due_date.toISOString(),
            days_overdue: Math.floor((today - loan.due_date) / (1000 * 60 * 60 * 24))  
        }));

        res.status(200).json(overdueResponse);
    } catch (error) {
        res.status(500).json({ message: "Error fetching overdue loans", error: error.message });
    }
};



export const extendLoan = async (req, res) => {
    try {
        const { extension_days } = req.body;
        const loan = await Loan.findById(req.params.id);

        if (!loan || loan.status === 'RETURNED') {
            return res.status(404).json({ message: "Loan not found or already returned" });
        }

        const original_due_date = new Date(loan.due_date);
        
        const extended_due_date = new Date(loan.due_date);
        extended_due_date.setDate(extended_due_date.getDate() + parseInt(extension_days)); 
        loan.due_date = extended_due_date;

        loan.extensions_count += 1;
        await loan.save();

        const extendedLoanResponse = {
            id: loan._id,
            user_id: loan.user_id,
            book_id: loan.book_id,
            issue_date: loan.issue_date.toISOString(),
            original_due_date: original_due_date.toISOString(),
            extended_due_date: loan.due_date.toISOString(),
            status: loan.status,
            extensions_count: loan.extensions_count
        };

        res.status(200).json(extendedLoanResponse);
    } catch (error) {
        res.status(500).json({ message: "Error extending loan", error: error.message });
    }
};


export const getLoanCountsByBook = async () => {
    try {
        const loanCounts = await Loan.aggregate([
            { $group: { _id: '$book_id', borrow_count: { $sum: 1 } } },
            { $sort: { borrow_count: -1 } }
        ]);
        return loanCounts;
    } catch (error) {
        throw new Error("Error fetching loan counts by book: " + error.message);
    }
};

export const getActiveLoansByUser = async () => {
    try {
        const activeLoans = await Loan.aggregate([
            { $match: { status: 'ACTIVE' } },
            { $group: { _id: '$user_id', books_borrowed: { $sum: 1 } } },
            { $sort: { books_borrowed: -1 } }
        ]);
        return activeLoans;
    } catch (error) {
        throw new Error("Error fetching active loans by user: " + error.message);
    }
};

export const countActiveLoans = async () => {
    try {
        return await Loan.countDocuments({ status: 'ACTIVE' });
    } catch (error) {
        throw new Error("Error counting active loans: " + error.message);
    }
};

export const countOverdueLoans = async () => {
    try {
        return await Loan.countDocuments({ status: 'ACTIVE', due_date: { $lt: new Date() } });
    } catch (error) {
        throw new Error("Error counting overdue loans: " + error.message);
    }
};

export const countLoansToday = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await Loan.countDocuments({
            issue_date: { $gte: today },
            status: 'ACTIVE'
        });
    } catch (error) {
        throw new Error("Error counting loans today: " + error.message);
    }
};

export const countReturnsToday = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await Loan.countDocuments({
            return_date: { $gte: today }
        });
    } catch (error) {
        throw new Error("Error counting returns today: " + error.message);
    }
};

export const getStatsOverview = async (req, res) => {
    try {
        const totalBooks = await countBooks();
        const totalUsers = await countUsers();
        const booksAvailable = await countAvailableBooks();
        const booksBorrowed = await countActiveLoans();
        const overdueLoans = await countOverdueLoans();
        const loansToday = await countLoansToday();
        const returnsToday = await countReturnsToday();

        res.status(200).json({
            total_books: totalBooks,
            total_users: totalUsers,
            books_available: booksAvailable,
            books_borrowed: booksBorrowed,
            overdue_loans: overdueLoans,
            loans_today: loansToday,
            returns_today: returnsToday
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats overview", error: error.message });
    }
};