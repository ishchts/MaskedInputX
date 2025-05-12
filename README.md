# MaskedInputX

🧩 Маска ввода для React на TypeScript — лёгкая альтернатива `react-input-mask`.  
Поддерживает маску по шаблону, вставку, удаление, управление курсором и `beforeMaskedStateChange`.

---

## 🚀 Установка

```bash
npm install masked-input-x
# или
yarn add masked-input-x
````

---

## 📦 Использование

```tsx
import { MaskedInputX } from 'masked-input-x';

export default function PhoneField() {
  return (
    <MaskedInputX
      mask="7 (___) ___-__-__"
      placeholderChar="_"
    />
  );
}
```

---

## ⚙️ Пропсы

| Название                  | Тип        | Описание                                                                       |
| ------------------------- | ---------- | ------------------------------------------------------------------------------ |
| `mask`                    | `string`   | Маска ввода. Например: `"7 (___) ___-__-__"`                                   |
| `placeholderChar`         | `string`   | Символ-заполнитель (по умолчанию: `_`)                                         |
| `beforeMaskedStateChange` | `function` | Позволяет перехватывать и модифицировать значение/курсоры до установки `value` |

### Пример `beforeMaskedStateChange`:

```tsx
<MaskedInputX
  mask="7 (___) ___-__-__"
  beforeMaskedStateChange={({ nextState }) => {
    const maxLength = 10;
    const digits = nextState.value.replace(/\D/g, "");
    if (digits.length > maxLength) {
      return {
        ...nextState,
        value: digits.slice(0, maxLength),
      };
    }
    return nextState;
  }}
/>
```

---

## ✅ Поддержка

* Управление курсором
* Маскирование при вставке
* Удаление `Backspace` / `Delete`
* Первая позиция курсора при фокусе
* Фиксированный префикс (`7`, `+7`, и т.д.)
* Типизация на TypeScript

---

## 🛠 TODO / Возможности расширения

* [ ] Dynamic mask (по длине/значению)
* [ ] Автоформатирование при `onBlur`
* [ ] Кастомизация через регулярки
* [ ] `uncontrolled` режим

---
