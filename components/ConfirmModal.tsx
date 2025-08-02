import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, designTokens, textStyles } from "../lib/styles";

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
  icon?: keyof typeof Ionicons.glyphMap;
  showCancelButton?: boolean;
}

export default function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = "إلغاء",
  type = "info",
  icon,
  showCancelButton = true,
}: ConfirmModalProps) {
  const typeStyles = {
    danger: {
      iconColor: colors.danger,
      confirmButtonColor: colors.danger,
      iconBackground: "#FFEBEE",
    },
    warning: {
      iconColor: colors.warning,
      confirmButtonColor: colors.warning,
      iconBackground: "#FFF3E0",
    },
    success: {
      iconColor: colors.success,
      confirmButtonColor: colors.success,
      iconBackground: "#E8F5E8",
    },
    info: {
      iconColor: colors.primary,
      confirmButtonColor: colors.primary,
      iconBackground: "#EFF6FF",
    },
  }[type];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            {icon && (
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: typeStyles.iconBackground },
                ]}
              >
                <Ionicons name={icon} size={32} color={typeStyles.iconColor} />
              </View>
            )}

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: typeStyles.confirmButtonColor },
                  !showCancelButton && styles.fullWidthButton,
                ]}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
              {showCancelButton && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: -50, // Extend beyond status bar
    left: 0,
    right: 0,
    bottom: -50, // Extend beyond navigation bar
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: designTokens.borderRadius.xl,
    margin: designTokens.spacing.xl,
    maxWidth: 400,
    width: "90%",
    ...designTokens.shadows.xl,
  },
  content: {
    padding: designTokens.sizes.modal.padding,
    alignItems: "center",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: designTokens.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: designTokens.spacing.lg,
  },
  title: {
    ...textStyles.semibold2xl,
    color: colors.text.primary,
    marginBottom: designTokens.spacing.md,
    textAlign: "center",
  },
  message: {
    ...textStyles.regularLg,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: designTokens.spacing["2xl"],
  },
  buttonContainer: {
    flexDirection: "row",
    gap: designTokens.spacing.md,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    padding: designTokens.sizes.button.paddingVertical,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.primary,
    alignItems: "center",
  },
  cancelButtonText: {
    ...textStyles.semiboldBase,
    color: colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    padding: designTokens.sizes.button.paddingVertical,
    borderRadius: designTokens.borderRadius.md,
    alignItems: "center",
  },
  confirmButtonText: {
    ...textStyles.semiboldBase,
    color: colors.background.primary,
  },
  fullWidthButton: {
    flex: 1,
  },
});
