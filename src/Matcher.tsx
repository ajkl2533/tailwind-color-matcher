import clx from "classnames";
import type React from "react";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useDebouncyFn } from "use-debouncy";
import { findClosestColor, getColorHex, hexToRgb } from "./utils-ciede2000";

// Color validation regex patterns
const colorPatterns = {
  hex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  rgb: /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
  hsl: /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/,
};
const getInitialColor = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("color") ? `#${params.get("color")}` : "#000000";
};
const validateColor = (value: string): boolean => {
  if (colorPatterns.hex.test(value)) return true;

  if (colorPatterns.rgb.test(value)) {
    const matches = value.match(colorPatterns.rgb);
    if (matches) {
      const [_, r, g, b] = matches;
      return [r, g, b].every(
        (val) => Number.parseInt(val) >= 0 && Number.parseInt(val) <= 255
      );
    }
  }

  if (colorPatterns.hsl.test(value)) {
    const matches = value.match(colorPatterns.hsl);
    if (matches) {
      const [_, h, s, l] = matches;
      return (
        Number.parseInt(h) >= 0 &&
        Number.parseInt(h) <= 360 &&
        Number.parseInt(s) >= 0 &&
        Number.parseInt(s) <= 100 &&
        Number.parseInt(l) >= 0 &&
        Number.parseInt(l) <= 100
      );
    }
  }

  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return false;
    ctx.fillStyle = value;
    return ctx.fillStyle !== "#000000";
  } catch {
    return false;
  }
};
const formatRgb = (hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
};

const ComparisonPreview = (
  props:
    | {
        color: string;
        type: "original";
      }
    | {
        color: string;
        colorName: string;
        type: "matched";
      }
) => (
  <div className="flex flex-col">
    <div
      className={clx(
        "w-full h-12 rounded-md  mb-2 border dark:border-white/20 ",
        {
          "rounded-e-none border-e-0": props.type === "original",
          "rounded-s-none border-s-0": props.type === "matched",
        }
      )}
      style={{ backgroundColor: props.color }}
    />
    <div
      className={clx("flex flex-col", {
        "text-right": props.type === "matched",
      })}
    >
      <span className="font-medium dark:text-white">
        {props.type === "matched" ? props.colorName : props.color}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-300">
        {formatRgb(props.color)}
      </span>
    </div>
  </div>
);

const TailwindColorMatcher: React.FC = () => {
  const [color, setColor] = useState(getInitialColor());
  const [inputValue, setInputValue] = useState(getInitialColor());
  const [closestColor, setClosestColor] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const updateSearchParams = useDebouncyFn((value: string) => {
    const params = new URLSearchParams({ color: value.substring(1) });
    console.log("Setting to history", params.toString());
    window.history.replaceState(
      {},
      `Tailwind color matcher: #${params.get(color)}`,
      `/?${params.toString()}`
    );
  }, 300);

  useEffect(() => {
    setClosestColor(findClosestColor(getInitialColor()));
  }, []);

  useEffect(() => {
    if (closestColor) {
      document.body.style.backgroundColor = getColorHex(closestColor);
    }
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [closestColor]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setInputValue(newColor);
    const closest = findClosestColor(newColor);
    setClosestColor(closest);
    updateSearchParams(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (validateColor(value)) {
      setIsValid(true);
      setErrorMessage("");

      const ctx = document.createElement("canvas").getContext("2d");
      if (ctx) {
        ctx.fillStyle = value;
        const hexColor = ctx.fillStyle;
        setColor(hexColor);
        const closest = findClosestColor(hexColor);
        setClosestColor(closest);
        updateSearchParams(hexColor);
      }
    } else {
      setIsValid(false);
      setErrorMessage(
        "Please enter a valid color (hex, rgb, hsl, or color name)"
      );
    }
  };

  return (
    <div className="min-h-[100cqh] flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900/80 shadow-lg rounded-lg p-8 max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
          Tailwind Color Matcher
        </h1>

        <div className="flex justify-center mb-6">
          <HexColorPicker color={color} onChange={handleColorChange} />
        </div>

        <div className="mb-6">
          <label
            htmlFor="colorInput"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Enter color value
          </label>
          <input
            id="colorInput"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className={clx(
              "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-white/5 dark:text-white",
              {
                "border-gray-300 dark:border-white/20 focus:ring-blue-500":
                  isValid,
                "border-red-500 focus:ring-red-500": !isValid,
              }
            )}
            aria-invalid={!isValid}
            aria-describedby={!isValid ? "colorError" : undefined}
            placeholder="Enter color (e.g., #FF0000, rgb(255,0,0), red)"
          />
          {!isValid && (
            <p
              id="colorError"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {errorMessage}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 justify-between mb-4">
          <ComparisonPreview color={color} type="original" />
          {closestColor && (
            <ComparisonPreview
              color={getColorHex(closestColor)}
              colorName={closestColor}
              type="matched"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TailwindColorMatcher;
