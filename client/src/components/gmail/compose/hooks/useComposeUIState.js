import { useReducer, useCallback } from "react";

const initialState = {
  minimized: false,
  fullscreen: false,
  showCc: false,
  showBcc: false,
  signaturePopoverOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_MINIMIZED":
      return { ...state, minimized: !state.minimized };
    case "TOGGLE_FULLSCREEN":
      return { ...state, fullscreen: !state.fullscreen, minimized: false };
    case "OPEN_CC":
      return { ...state, showCc: true };
    case "OPEN_BCC":
      return { ...state, showBcc: true };
    case "TOGGLE_SIGNATURE_POPOVER":
      return { ...state, signaturePopoverOpen: !state.signaturePopoverOpen };
    case "CLOSE_SIGNATURE_POPOVER":
      return { ...state, signaturePopoverOpen: false };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/**
 * Every UI toggle the compose window needs — minimize, fullscreen, cc/bcc
 * visibility, signature popover — in one reducer instead of five separate
 * useState calls. `reset()` also replaces the multi-line manual reset that
 * used to live inline in handleDiscard.
 */
export function useComposeUIState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    ...state,
    toggleMinimized: useCallback(() => dispatch({ type: "TOGGLE_MINIMIZED" }), []),
    toggleFullscreen: useCallback(() => dispatch({ type: "TOGGLE_FULLSCREEN" }), []),
    openCc: useCallback(() => dispatch({ type: "OPEN_CC" }), []),
    openBcc: useCallback(() => dispatch({ type: "OPEN_BCC" }), []),
    toggleSignaturePopover: useCallback(() => dispatch({ type: "TOGGLE_SIGNATURE_POPOVER" }), []),
    closeSignaturePopover: useCallback(() => dispatch({ type: "CLOSE_SIGNATURE_POPOVER" }), []),
    reset: useCallback(() => dispatch({ type: "RESET" }), []),
  };
}
