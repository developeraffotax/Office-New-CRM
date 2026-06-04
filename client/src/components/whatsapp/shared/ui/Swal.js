import Swal from "sweetalert2";

/**
 * Show a SweetAlert confirmation modal
 * @param {Object} options
 * @param {"success"|"error"|"warning"|"info"|"question"} options.type - Alert type
 * @param {string} [options.title] - Modal title
 * @param {string} [options.text] - Modal text
 * @param {string} [options.confirmText] - Confirm button text
 * @param {string} [options.cancelText] - Cancel button text
 * @returns {Promise<boolean>} - True if confirmed, false if cancelled
 */
export const confirmAlert = async ({
  type = "question",
  title,
  text,
  confirmText,
  cancelText,
}) => {
  const typeConfig = {
    success: {
      title: title || "Success!",
      text: text || "Operation completed successfully.",
      confirmText: confirmText || "OK",
    },
    error: {
      title: title || "Error!",
      text: text || "Something went wrong.",
      confirmText: confirmText || "OK",
    },
    warning: {
      title: title || "Are you sure?",
      text: text || "You won't be able to revert this!",
      confirmText: confirmText || "Yes, do it!",
      cancelText: cancelText || "Cancel",
    },
    info: {
      title: title || "Info",
      text: text || "Please note this information.",
      confirmText: confirmText || "OK",
    },
    question: {
      title: title || "Are you sure?",
      text: text || "",
      confirmText: confirmText || "Yes",
      cancelText: cancelText || "No",
    },
  };

  const config = typeConfig[type] || typeConfig["question"];

  const { isConfirmed } = await Swal.fire({
    title: config.title,
    text: config.text,
    icon: type,
    showCancelButton: ["warning", "question"].includes(type),
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: config.confirmText,
    cancelButtonText: config.cancelText,
 
  });

  return {isConfirmed};
};