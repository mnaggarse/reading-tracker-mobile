import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { Book } from "../lib/database";
import { colors, designTokens, textStyles } from "../lib/styles";

interface PdfReaderProps {
  book: Book;
  onPageChange: (currentPage: number, totalPages: number) => void;
  onClose: () => void;
  onUpdateTotalPages?: (bookId: number, totalPages: number) => void;
}

export default function PdfReader({
  book,
  onPageChange,
  onClose,
  onUpdateTotalPages,
}: PdfReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Set initial page when component mounts
  useEffect(() => {
    if (book.pagesRead && book.pagesRead > 0) {
      setCurrentPage(book.pagesRead);
    }
  }, [book.pagesRead]);

  if (!book.pdfPath) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document-outline" size={64} color={colors.text.light} />
        <Text style={styles.errorText}>لا يوجد ملف PDF لهذا الكتاب</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>إغلاق</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const source = {
    uri: book.pdfPath,
  };

  const handleLoadComplete = (numberOfPages: number, filePath: string) => {
    console.log(`Number of pages: ${numberOfPages}`);
    setTotalPages(numberOfPages);

    // Update the book's total pages in database if it was estimated
    if (book.totalPages !== numberOfPages && book.id) {
      console.log(
        `Actual pages: ${numberOfPages}, Estimated: ${book.totalPages}`
      );
      onUpdateTotalPages?.(book.id, numberOfPages);
    }
  };

  const handlePdfError = (error: any) => {
    console.log("PDF Error:", error);
    setLoadError("فشل في تحميل ملف PDF");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.pageInfo}>
            صفحة {currentPage} من {totalPages || book.totalPages}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.pdfContainer}>
        {loadError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={colors.danger} />
            <Text style={styles.errorText}>فشل في تحميل الكتاب</Text>
            <Text style={styles.errorSubText}>{loadError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoadError(null);
              }}
            >
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loadError && (
          <Pdf
            source={source}
            onLoadComplete={handleLoadComplete}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}`);
              setCurrentPage(page);
              onPageChange(page, numberOfPages);
            }}
            onError={handlePdfError}
            onPressLink={(uri) => {
              console.log(`Link pressed: ${uri}`);
            }}
            style={styles.pdf}
            enablePaging={false}
            horizontal={false}
            enableAnnotationRendering={false}
            enableAntialiasing={true}
            spacing={0}
            fitPolicy={0}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: designTokens.spacing["6xl"], // Account for status bar
  },
  headerInfo: {
    flex: 1,
  },
  bookTitle: {
    ...textStyles.semiboldLg,
    color: colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  pageInfo: {
    ...textStyles.regularSm,
    color: colors.text.secondary,
  },
  closeButton: {
    padding: designTokens.spacing.sm,
  },
  pdfContainer: {
    flex: 1,
    position: "relative",
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    paddingHorizontal: designTokens.spacing.xl,
  },
  errorText: {
    ...textStyles.regularLg,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.xl,
  },
  errorSubText: {
    ...textStyles.regularSm,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: designTokens.spacing.xs,
    marginBottom: designTokens.spacing.lg,
  },
  closeButtonText: {
    ...textStyles.semiboldBase,
    color: colors.primary,
  },
  retryButton: {
    marginTop: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: designTokens.borderRadius.base,
  },
  retryButtonText: {
    ...textStyles.semiboldBase,
    color: colors.background.primary,
  },
});
