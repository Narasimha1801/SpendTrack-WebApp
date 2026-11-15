import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppIcon from "@/components/ui/app-icon";
import SpendingOverview from "@/components/dashboard/spending-overview";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import { useSnackbar } from "@/contexts/snackbar-context";
import {
  useRefreshTransactionsOnFocus,
  useTransactions,
} from "@/contexts/transactions-context";
import {
  extractPdfTransactions,
  importTransactions,
  type PdfExtractionResponse,
} from "@/services/api";

function formatFileSize(size?: number) {
  if (typeof size !== "number" || !Number.isFinite(size) || size < 0) {
    return null;
  }
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SpendingScreen() {
  const { showSnackbar } = useSnackbar();
  useRefreshTransactionsOnFocus();
  const {
    selectedPdf,
    totalTransactionCount,
    importSummary,
    extractionStatus,
    extractionError,
    selectPdf,
    clearSelectedPdf,
    startExtraction,
    startSaving,
    completeImport,
    failExtraction,
    refreshTransactions,
    isLoadingTransactions,
    isLoadingSummary,
  } = useTransactions();
  const [isPicking, setIsPicking] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const requestInProgress = useRef(false);
  const isWorking =
    extractionStatus === "uploading" || extractionStatus === "saving";
  const isSaving = extractionStatus === "saving";
  const isBusy = isPicking || isWorking;

  const reportPickerError = (message: string) => {
    setPickerError(message);
    showSnackbar({ variant: "error", message });
  };

  const handlePickPdf = async () => {
    if (isBusy) return;

    setPickerError(null);
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: false,
        copyToCacheDirectory: true,
        base64: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) {
        reportPickerError("No file was selected. Please choose a PDF.");
        return;
      }

      const isPdf =
        asset.name.toLowerCase().endsWith(".pdf") ||
        asset.mimeType?.toLowerCase().split(";")[0] === "application/pdf";
      if (!isPdf) {
        reportPickerError("Please select a PDF file.");
        return;
      }

      selectPdf({
        uri: asset.uri,
        name: asset.name,
        ...(typeof asset.size === "number" ? { size: asset.size } : {}),
        ...(asset.mimeType ? { mimeType: asset.mimeType } : {}),
        ...(asset.file ? { file: asset.file } : {}),
      });
    } catch {
      reportPickerError("Unable to open the document picker. Please try again.");
    } finally {
      setIsPicking(false);
    }
  };

  const handleExtract = async () => {
    if (!selectedPdf || requestInProgress.current || isWorking) return;

    requestInProgress.current = true;
    startExtraction();
    let response: PdfExtractionResponse;
    try {
      response = await extractPdfTransactions(selectedPdf);
    } catch (error) {
      const message =
        error instanceof Error
          ? `PDF extraction failed: ${error.message}`
          : "PDF extraction failed. Please try again.";
      failExtraction(message);
      showSnackbar({ variant: "error", message });
      requestInProgress.current = false;
      return;
    }

    if (response.transactions.length === 0) {
      const message = "No transactions were found in this PDF.";
      failExtraction(message);
      showSnackbar({ variant: "error", message });
      requestInProgress.current = false;
      return;
    }

    startSaving();
    try {
      const result = await importTransactions(
        response.transactions,
        selectedPdf.name,
      );
      await refreshTransactions();
      completeImport(response, result.summary);
      showSnackbar({
        variant: "success",
        message: `${result.summary.inserted} transactions saved; ${result.summary.duplicates} duplicates skipped.`,
        actionLabel: "View history",
        onAction: () => router.replace("/history"),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? `Transactions were extracted but could not be saved: ${error.message}`
          : "Transactions were extracted but could not be saved.";
      failExtraction(message);
      showSnackbar({ variant: "error", message });
    } finally {
      requestInProgress.current = false;
    }
  };

  const fileSize = formatFileSize(selectedPdf?.size);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingTransactions || isLoadingSummary}
            onRefresh={() => void refreshTransactions()}
          />
        }
      >
        <Text style={styles.title}>Spending</Text>
        <Text style={styles.subtitle}>Upload and review your transactions.</Text>

        <View style={styles.uploadCard}>
          <View style={styles.documentIcon}>
            <AppIcon
              name={{
                ios: "doc.text",
                android: "description",
                web: "description",
              }}
              size={25}
              color={SpendTrackColors.darkSurface}
            />
          </View>
          <Text style={styles.cardTitle}>Import transactions</Text>
          <Text style={styles.cardDescription}>
            Upload your PhonePe, Google Pay, Paytm, or other transaction
            statement.
          </Text>

          {selectedPdf ? (
            <View style={styles.fileCard}>
              <View style={styles.fileIcon}>
                <AppIcon
                  name={{
                    ios: "doc.fill",
                    android: "picture_as_pdf",
                    web: "picture_as_pdf",
                  }}
                  size={20}
                  color={SpendTrackColors.negative}
                />
              </View>
              <View style={styles.fileDetails}>
                <Text numberOfLines={1} style={styles.fileName}>
                  {selectedPdf.name}
                </Text>
                <Text style={styles.fileMeta}>
                  PDF{fileSize ? ` · ${fileSize}` : ""}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove selected PDF"
                disabled={isBusy}
                onPress={clearSelectedPdf}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.removeButton,
                  (pressed || isBusy) && styles.pressed,
                ]}
              >
                <AppIcon
                  name={{
                    ios: "xmark.circle.fill",
                    android: "cancel",
                    web: "cancel",
                  }}
                  size={21}
                  color={SpendTrackColors.secondaryText}
                />
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => void handlePickPdf()}
              disabled={isBusy}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                isBusy && styles.disabledButton,
              ]}
            >
              {isPicking ? (
                <ActivityIndicator color={SpendTrackColors.white} />
              ) : (
                <>
                  <AppIcon
                    name={{
                      ios: "arrow.up.doc",
                      android: "upload_file",
                      web: "upload_file",
                    }}
                    size={18}
                    color={SpendTrackColors.white}
                  />
                  <Text style={styles.primaryButtonText}>Upload PDF</Text>
                </>
              )}
            </Pressable>
          )}

          <Text style={styles.supportedFormat}>Supported format: PDF only</Text>

          {pickerError ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {pickerError}
            </Text>
          ) : null}

          {selectedPdf ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void handlePickPdf()}
              disabled={isBusy}
              style={({ pressed }) => [
                styles.changeButton,
                (pressed || isBusy) && styles.pressed,
              ]}
            >
              <Text style={styles.changeButtonText}>Choose a different PDF</Text>
            </Pressable>
          ) : null}

          {selectedPdf ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void handleExtract()}
              disabled={isBusy}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.extractButton,
                pressed && styles.pressed,
                isBusy && styles.disabledButton,
              ]}
            >
              {isWorking ? (
                <>
                  <ActivityIndicator color={SpendTrackColors.white} />
                  <Text style={styles.primaryButtonText}>
                    {isSaving
                      ? "Saving transactions..."
                      : "Extracting transactions..."}
                  </Text>
                </>
              ) : (
                <Text style={styles.primaryButtonText}>
                  Extract Transactions
                </Text>
              )}
            </Pressable>
          ) : null}

          {extractionStatus === "error" && extractionError ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {extractionError}
            </Text>
          ) : null}
        </View>

        <SpendingOverview />

        {extractionStatus === "success" && selectedPdf ? (
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <AppIcon
                name={{
                  ios: "checkmark",
                  android: "check",
                  web: "check",
                }}
                size={18}
                color={SpendTrackColors.positive}
              />
            </View>
            <View style={styles.successCopy}>
              <Text style={styles.successTitle}>
                Transactions saved successfully.
              </Text>
              <Text style={styles.successDescription}>
                {importSummary?.inserted ?? 0} saved ·{" "}
                {importSummary?.duplicates ?? 0} duplicates ·{" "}
                {importSummary?.requiresReview ?? 0} need review
              </Text>
              <Text style={styles.successDescription}>
                {totalTransactionCount} extracted from {selectedPdf.name}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/history")}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.historyButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                View Transaction History
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SpendTrackColors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  title: {
    color: SpendTrackColors.text,
    fontSize: 22,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: SpendTrackColors.secondaryText,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 5,
    marginBottom: 18,
  },
  uploadCard: {
    alignItems: "center",
    padding: 20,
    borderRadius: 22,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  documentIcon: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: SpendTrackColors.secondarySurface,
  },
  cardTitle: {
    color: SpendTrackColors.text,
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 14,
  },
  cardDescription: {
    color: SpendTrackColors.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  primaryButton: {
    minHeight: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: SpendTrackColors.darkSurface,
  },
  primaryButtonText: {
    color: SpendTrackColors.white,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
  supportedFormat: {
    color: SpendTrackColors.muted,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 12,
  },
  fileCard: {
    width: "100%",
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 15,
    backgroundColor: SpendTrackColors.secondarySurface,
  },
  fileIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: SpendTrackColors.negativeSurface,
  },
  fileDetails: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    color: SpendTrackColors.text,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  fileMeta: {
    color: SpendTrackColors.secondaryText,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 3,
  },
  removeButton: {
    width: 34,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  changeButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginTop: 2,
  },
  changeButtonText: {
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  extractButton: {
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  successCard: {
    alignItems: "center",
    padding: 18,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: SpendTrackColors.positiveSurface,
    borderWidth: 1,
    borderColor: "#D8E9DD",
  },
  successIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: SpendTrackColors.card,
  },
  successCopy: {
    alignItems: "center",
    marginVertical: 11,
  },
  successTitle: {
    color: SpendTrackColors.text,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
  successDescription: {
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    marginTop: 4,
  },
  historyButton: {
    marginTop: 5,
  },
  errorText: {
    color: SpendTrackColors.negative,
    fontSize: 11,
    lineHeight: 17,
    fontFamily: "PlusJakartaSans_500Medium",
    textAlign: "center",
    marginTop: 10,
  },
  pressed: {
    opacity: 0.75,
  },
});
