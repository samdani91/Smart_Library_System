import Loan from '../models/Loan.js';
import axios from 'axios';

export const issueBook = async (req, res) => {
    try {
        const { user_id, book_id, due_date } = req.body;

        // Validate user
        const userResponse = await axios.get(`http://localhost:8081/api/users/${user_id}`).catch(() => {
            throw new Error("User Service unavailable");
        });
        if (userResponse.status !== 200) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate book
        const bookResponse = await axios.get(`http://localhost:8082/api/books/${book_id}`).catch(() => {
            throw new Error("Book Service unavailable");
        });
        if (bookResponse.status !== 200) {
            return res.status(404).json({ message: "Book not found" });
        }
        const book = bookResponse.data;
        if (book.available_copies <= 0) {
            return res.status(400).json({ message: "Book is not available" });
        }

        // Update book availability
        await axios.patch(`http://localhost:8082/api/books/${book_id}/availability`, {
            operation: "decrement"
        }).catch(() => {
            throw new Error("Book Service unavailable");
        });

        // Create loan
        const loan = new Loan({
            user_id,
            book_id,
            due_date,
            status: 'ACTIVE'
        });
        await loan.save();

        res.status(201).json({
            id: loan._id,
            user_id: loan.user_id,
            book_id: loan.book_id,
            issue_date: loan.issue_date.toISOString(),
            due_date: loan.due_date.toISOString(),
            status: loan.status
        });
    } catch (error) {
        res.status(error.message.includes("Service unavailable") ? 503 : 500).json({
            message: "Error issuing book",
            error: error.message
        });
    }
};

export const returnBook = async (req, res) => {
    try {
        const { loan_id } = req.body;
        const loan = await Loan.findById(loan_id);
        if (!loan || loan.status === 'RETURNED') {
            return res.status(404).json({ message: "Loan not found or already returned" });
        }

        // Update book availability
        await axios.patch(`http://localhost:8082/api/books/${loan.book_id}/availability`, {
            operation: "increment"
        }).catch(() => {
            throw new Error("Book Service unavailable");
        });

        // Update loan
        loan.return_date = new Date();
        loan.status = 'RETURNED';
        await loan.save();

        res.status(200).json({
            id: loan._id,
            user_id: loan.user_id,
            book_id: loan.book_id,
            issue_date: loan.issue_date.toISOString(),
            due_date: loan.due_date.toISOString(),
            return_date: loan.return_date.toISOString(),
            status: loan.status
        });
    } catch (error) {
        res.status(error.message.includes("Service unavailable") ? 503 : 500).json({
            message: "Error returning book",
            error: error.message
        });
    }
};

export const getLoansByUser = async (req, res) => {
    try {
        const loans = await Loan.find({ user_id: req.params.user_id });

        const loanResponse = [];
        for (const loan of loans) {
            const bookResponse = await axios.get(`http://localhost:8082/api/books/${loan.book_id}`).catch(() => {
                throw new Error("Book Service unavailable");
            });
            const book = bookResponse.data;
            loanResponse.push({
                id: loan._id,
                book: {
                    id: book.id,
                    title: book.title,
                    author: book.author
                },
                issue_date: loan.issue_date.toISOString(),
                due_date: loan.due_date.toISOString(),
                return_date: loan.return_date ? loan.return_date.toISOString() : null,
                status: loan.status
            });
        }

        res.status(200).json({
            loans: loanResponse,
            total: loanResponse.length
        });
    } catch (error) {
        res.status(error.message.includes("Service unavailable") ? 503 : 500).json({
            message: "Error fetching loans",
            error: error.message
        });
    }
};

export const getLoanById = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ message: "Loan not found" });
        }

        const [userResponse, bookResponse] = await Promise.all([
            axios.get(`http://localhost:8081/api/users/${loan.user_id}`).catch(() => {
                throw new Error("User Service unavailable");
            }),
            axios.get(`http://localhost:8082/api/books/${loan.book_id}`).catch(() => {
                throw new Error("Book Service unavailable");
            })
        ]);

        const user = userResponse.data;
        const book = bookResponse.data;

        res.status(200).json({
            id: loan._id,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            book: {
                id: book.id,
                title: book.title,
                author: book.author
            },
            issue_date: loan.issue_date.toISOString(),
            due_date: loan.due_date.toISOString(),
            return_date: loan.return_date ? loan.return_date.toISOString() : null,
            status: loan.status
        });
    } catch (error) {
        res.status(error.message.includes("Service unavailable") ? 503 : 500).json({
            message: "Error fetching loan",
            error: error.message
        });
    }
};

export const getOverdueLoans = async (req, res) => {
    try {
        const today = new Date();
        const overdueLoans = await Loan.find({
            due_date: { $lt: today },
            status: 'ACTIVE'
        });

        const overdueResponse = [];
        for (const loan of overdueLoans) {
            const [userResponse, bookResponse] = await Promise.all([
                axios.get(`http://localhost:8081/api/users/${loan.user_id}`).catch(() => {
                    throw new Error("User Service unavailable");
                }),
                axios.get(`http://localhost:8082/api/books/${loan.book_id}`).catch(() => {
                    throw new Error("Book Service unavailable");
                })
            ]);

            const user = userResponse.data;
            const book = bookResponse.data;

            overdueResponse.push({
                id: loan._id,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                book: {
                    id: book.id,
                    title: book.title,
                    author: book.author
                },
                issue_date: loan.issue_date.toISOString(),
                due_date: loan.due_date.toISOString(),
                days_overdue: Math.floor((today - loan.due_date) / (1000 * 60 * 60 * 24))
            });
        }

        res.status(200).json(overdueResponse);
    } catch (error) {
        res.status(error.message.includes("Service unavailable") ? 503 : 500).json({
            message: "Error fetching overdue loans",
            error: error.message
        });
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

        res.status(200).json({
            id: loan._id,
            user_id: loan.user_id,
            book_id: loan.book_id,
            issue_date: loan.issue_date.toISOString(),
            original_due_date: original_due_date.toISOString(),
            extended_due_date: loan.due_date.toISOString(),
            status: loan.status,
            extensions_count: loan.extensions_count
        });
    } catch (error) {
        res.status(500).json({ message: "Error extending loan", error: error.message });
    }
};


export const getLoanCountsByBook = async (req, res) => {
    try {
        const loanCounts = await Loan.aggregate([
            { $group: { _id: '$book_id', borrow_count: { $sum: 1 } } },
            { $sort: { borrow_count: -1 } }
        ]);
        res.status(200).json(loanCounts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching loan counts by book", error: error.message });
    }
};

export const getActiveLoansByUser = async (req, res) => {
    try {
        const activeLoans = await Loan.aggregate([
            { $match: { status: 'ACTIVE' } },
            { $group: { _id: '$user_id', books_borrowed: { $sum: 1 } } },
            { $sort: { books_borrowed: -1 } }
        ]);
        res.status(200).json(activeLoans);
    } catch (error) {
        res.status(500).json({ message: "Error fetching active loans by user", error: error.message });
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
        const [totalBooksResponse, totalUsersResponse, availableBooksResponse] = await Promise.all([
            axios.get('http://localhost:8082/api/books/count').catch(() => {
                throw new Error("Book Service unavailable");
            }),
            axios.get('http://localhost:8081/api/users/count').catch(() => {
                throw new Error("User Service unavailable");
            }),
            axios.get('http://localhost:8082/api/books/available-count').catch(() => {
                throw new Error("Book Service unavailable");
            })
        ]);

        const totalBooks = totalBooksResponse.data.count;
        const totalUsers = totalUsersResponse.data.count;
        const booksAvailable = availableBooksResponse.data.count;

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
        res.status(error.message.includes("Service unavailable") ? 503 : 500).json({
            message: "Error fetching stats overview",
            error: error.message
        });
    }
};