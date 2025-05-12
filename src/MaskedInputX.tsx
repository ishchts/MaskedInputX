import React, { useState, useRef, useEffect } from "react";

export type InputState = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export type MaskedInputXProps = {
  mask: string;
  placeholderChar?: string;
  beforeMaskedStateChange?: (params: {
    currentState: InputState;
    prevState: InputState;
    nextState: InputState;
  }) => InputState;
};
const getCleanedInput = (
  mask: string,
  placeholderChar: string,
  inputValue: string
) => {
  const prefixLength = mask.indexOf(placeholderChar);
  const prefix = mask.slice(0, prefixLength);

  let cleanedInput = inputValue;
  if (cleanedInput.startsWith(prefix)) {
    cleanedInput = cleanedInput.slice(prefix.length);
  }
  return cleanedInput;
};
export const MaskedInputX: React.FC<MaskedInputXProps> = ({
  mask,
  placeholderChar = "_",
  beforeMaskedStateChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previousState = useRef<InputState>({
    value: "",
    selectionStart: 0,
    selectionEnd: 0,
  });
  const [lastCurrentPosition, setLastCurrentPosition] = useState(0);

  const [value, setValue] = useState("");
  const applyMask = (inputValue: string): string => {
    const onlyDigits = getCleanedInput(
      mask,
      placeholderChar,
      inputValue
    ).replace(/\D/g, "");
    let maskedValue = "";
    let digitIndex = 0;
    for (let i = 0; i < mask.length; i += 1) {
      if (mask[i] !== placeholderChar) {
        maskedValue += mask[i];
        continue;
      }
      if (digitIndex < onlyDigits.length) {
        maskedValue += onlyDigits[digitIndex];
        digitIndex += 1;
        continue;
      }
      maskedValue += mask[i];
    }

    return maskedValue;
  };
  const updateState = (nextState: InputState) => {
    if (beforeMaskedStateChange) {
      const finalState = beforeMaskedStateChange({
        currentState: {
          value: inputRef.current?.value || "",
          selectionStart: inputRef.current?.selectionStart ?? 0,
          selectionEnd: inputRef.current?.selectionEnd ?? 0,
        },
        prevState: previousState.current,
        nextState,
      });
      setValue(applyMask(finalState.value));
      setLastCurrentPosition(finalState.selectionStart);
      previousState.current = finalState;
    } else {
      setValue(applyMask(nextState.value));
      setLastCurrentPosition(nextState.selectionStart);
      previousState.current = nextState;
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const selectionStart = e.target.selectionStart ?? 0;
    const cursor = mask.indexOf(placeholderChar, selectionStart);
    const nextState = {
      value: raw,
      selectionStart: cursor,
      selectionEnd: cursor,
    };
    updateState(nextState);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const inputValue = e.currentTarget.value;
      const selectionStart = e.currentTarget.selectionStart ?? 0;
      const onlyDigits = getCleanedInput(mask, placeholderChar, inputValue)
        .replace(/\D/g, "")
        .split("");
      let digitIndex = 0;
      let deletedIndex = 0;
      for (let i = 0; i < mask.length; i += 1) {
        if (mask[i] !== placeholderChar) {
          continue;
        }
        if (i >= selectionStart && e.key === "Delete") {
          deletedIndex = digitIndex;
          break;
        }
        if (i >= selectionStart - 1 && e.key === "Backspace") {
          deletedIndex = digitIndex;
          break;
        }

        digitIndex += 1;
      }

      onlyDigits.splice(deletedIndex, 1);
      const masked = onlyDigits.join("");
      const newCursor =
        e.key === "Backspace" ? selectionStart - 1 : selectionStart;
      updateState({
        value: masked,
        selectionStart: newCursor,
        selectionEnd: newCursor,
      });
    }
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("Text");
    const pastedDigits = pastedData.replace(/\D/g, "");

    const input = e.currentTarget;
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? 0;

    const currentDigits = getCleanedInput(mask, placeholderChar, value)
      .replace(/\D/g, "")
      .split("");
    let insertIndex = 0;
    let digitCounter = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] !== placeholderChar) continue;
      if (i >= selectionStart) {
        insertIndex = digitCounter;
        break;
      }
      digitCounter++;
    }

    const selectionLength = selectionEnd - selectionStart;
    if (selectionLength > 0) {
      currentDigits.splice(insertIndex, selectionLength);
    }

    currentDigits.splice(insertIndex, 0, ...pastedDigits.split(""));
    const masked = currentDigits.join("");
    const newCursor = (() => {
      let count = pastedDigits.length;
      for (let i = 0; i < mask.length; i += 1) {
        if (mask[i] !== placeholderChar) continue;
        count -= 1;
        if (count === 0) {
          count = i + 1;
          break;
        }
      }

      return count;
    })();
    updateState({
      value: masked,
      selectionStart: newCursor,
      selectionEnd: newCursor,
    });
  };
  const handleFocus = () => {
    setTimeout(() => {
      const input = inputRef.current;
      if (input) {
        const position = mask.indexOf(placeholderChar);
        input.setSelectionRange(position, position);
      }
    }, 0);
  };
  useEffect(() => {
    updateState({ value: "", selectionStart: 0, selectionEnd: 0 });
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (input && lastCurrentPosition) {
      const position = Math.max(
        mask.indexOf(placeholderChar),
        lastCurrentPosition
      );
      input.setSelectionRange(position, position);
    }
  }, [lastCurrentPosition, mask, placeholderChar]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={mask}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
    />
  );
};
