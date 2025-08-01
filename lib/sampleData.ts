import { database } from "./database";

export const sampleBooks = [
  {
    title: "The Sealed Nectar",
    cover:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348990566i/5470.jpg",
    totalPages: 521,
    pagesRead: 334,
    status: "reading" as const,
  },
  {
    title: "The Hundred-page Machine Learning Book",
    cover:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546752372i/43014615.jpg",
    totalPages: 152,
    pagesRead: 40,
    status: "reading" as const,
  },
  {
    title: "The C Programming Language",
    cover:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1391032531i/515601.jpg",
    totalPages: 312,
    pagesRead: 0,
    status: "to-read" as const,
  },
  {
    title: "Designing Data-Intensive Applications",
    cover:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1457728494i/23463279.jpg",
    totalPages: 658,
    pagesRead: 658,
    status: "completed" as const,
  },
];

export const addSampleData = () => {
  try {
    for (const book of sampleBooks) {
      database.addBook(book);
    }
    console.log("Sample data added successfully");
  } catch (error) {
    console.error("Error adding sample data:", error);
  }
};
