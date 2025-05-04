import { getBook, countBooks, countAvailableBooks } from './book.controller.js';
import { getUser, countUsers } from './user.controller.js';
import { getLoanCountsByBook, getActiveLoansByUser, countActiveLoans, countOverdueLoans, countLoansToday, countReturnsToday } from './loan.controller.js';


export const getPopularBooks = async (req, res) => {
    try {
        const loanCounts = await getLoanCountsByBook();
        const popularBooks = [];

        for (const loan of loanCounts.slice(0, 5)) {
            const bookResponse = await getBook(loan._id);
            if (bookResponse.book) {
                popularBooks.push({
                    book_id: loan._id,
                    title: bookResponse.book.title,
                    author: bookResponse.book.author,
                    borrow_count: loan.borrow_count
                });
            }
        }

        res.status(200).json(popularBooks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching popular books", error: error.message });
    }
};

export const getActiveUsers = async (req, res) => {
    try {
        const activeLoans = await getActiveLoansByUser();
        const activeUsers = [];

        for (const loan of activeLoans.slice(0, 5)) {
            const userResponse = await getUser(loan._id);
            if (userResponse.user) {
                activeUsers.push({
                    user_id: loan._id,
                    name: userResponse.user.name,
                    books_borrowed: loan.books_borrowed,
                    current_borrows: loan.books_borrowed
                });
            }
        }

        res.status(200).json(activeUsers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching active users", error: error.message });
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