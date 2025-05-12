import React from "react";
import { createRoot } from 'react-dom/client';
import { MaskedInputX } from "./MaskedInputX";

// 89008005544 8 (900) (8((00_55-44 79008005544
const App = () => {
  return (
    <React.Fragment>
      <div>
        <MaskedInputX
          mask="+7 (___) ___-__-__"
          beforeMaskedStateChange={({ nextState }) => {
            const digits = nextState.value.replace(/\D/g, "");
            if (digits.length >= 11 && (digits.startsWith("8") || digits.startsWith("7"))) {
              const newValue = digits.slice(1);
              nextState.value = newValue;
              nextState.selectionStart = 18;
              nextState.selectionEnd = 18;
            }
            return nextState;
          }}
        />
      </div>
    </React.Fragment>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
