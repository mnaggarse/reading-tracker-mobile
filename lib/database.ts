import * as SQLite from "expo-sqlite";

export interface Book {
  id?: number;
  title: string;
  cover: string;
  totalPages: number;
  pagesRead: number;
  status: "reading" | "completed" | "to-read";
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync("reading-tracker.db");
    this.initDatabase();
  }

  private initDatabase() {
    try {
      this.db.execSync(
        `CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          cover TEXT NOT NULL,
          totalPages INTEGER NOT NULL,
          pagesRead INTEGER DEFAULT 0,
          status TEXT DEFAULT 'to-read',
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );`
      );
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // Add a new book
  addBook(book: Omit<Book, "id" | "createdAt" | "updatedAt">): number {
    const now = new Date().toISOString();
    const result = this.db.runSync(
      "INSERT INTO books (title, cover, totalPages, pagesRead, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        book.title,
        book.cover,
        book.totalPages,
        book.pagesRead,
        book.status,
        now,
        now,
      ]
    );
    return result.lastInsertRowId || 0;
  }

  // Get all books
  getBooks(): Book[] {
    const result = this.db.getAllSync(
      "SELECT * FROM books ORDER BY updatedAt DESC"
    );
    return result as Book[];
  }

  // Get books by status
  getBooksByStatus(status: Book["status"]): Book[] {
    const result = this.db.getAllSync(
      "SELECT * FROM books WHERE status = ? ORDER BY updatedAt DESC",
      [status]
    );
    return result as Book[];
  }

  // Update book progress
  updateBookProgress(
    id: number,
    pagesRead: number,
    status?: Book["status"]
  ): void {
    const now = new Date().toISOString();
    if (status) {
      this.db.runSync(
        "UPDATE books SET pagesRead = ?, status = ?, updatedAt = ? WHERE id = ?",
        [pagesRead, status, now, id]
      );
    } else {
      this.db.runSync(
        "UPDATE books SET pagesRead = ?, updatedAt = ? WHERE id = ?",
        [pagesRead, now, id]
      );
    }
  }

  // Delete book
  deleteBook(id: number): void {
    this.db.runSync("DELETE FROM books WHERE id = ?", [id]);
  }

  // Get reading statistics
  getStatistics(): {
    totalBooks: number;
    completedBooks: number;
    currentlyReading: number;
    totalPagesRead: number;
    totalPagesGoal: number;
  } {
    const result = this.db.getFirstSync(
      `SELECT 
        COUNT(*) as totalBooks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedBooks,
        SUM(CASE WHEN status = 'reading' THEN 1 ELSE 0 END) as currentlyReading,
        SUM(pagesRead) as totalPagesRead,
        SUM(totalPages) as totalPagesGoal
      FROM books`
    ) as any;

    return {
      totalBooks: result?.totalBooks || 0,
      completedBooks: result?.completedBooks || 0,
      currentlyReading: result?.currentlyReading || 0,
      totalPagesRead: result?.totalPagesRead || 0,
      totalPagesGoal: result?.totalPagesGoal || 0,
    };
  }

  // Reset all data
  resetData(): void {
    this.db.runSync("DELETE FROM books");
  }
}

export const database = new DatabaseService();
