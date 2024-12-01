import space from "color-space";
import deltaE from "delta-e";
import allTailwindColors from "tailwindcss/colors";

// Remove deprecated colors
const {
	lightBlue,
	warmGray,
	trueGray,
	coolGray,
	blueGray,
	...TAILWIND_COLORS
} = allTailwindColors;

type TailwindColorValue = string | Record<string | number, string>;
type ColorCache = Record<string, [number, number, number]>;
type ColorComparison = {
	deltaE: number;
	description: string;
};

// Color conversion utilities
export const hexToRgb = (hex: string): [number, number, number] => {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return [r, g, b];
};

// CIEDE2000 color difference calculation
const calculateDeltaE = (
	rgb1: [number, number, number],
	rgb2: [number, number, number],
): number => {
	const [L1, a1, b1] = space.rgb.lab(rgb1);
	const [L2, a2, b2] = space.rgb.lab(rgb2);

	return deltaE.getDeltaE00({ L: L1, A: a1, B: b1 }, { L: L2, A: a2, B: b2 });
};

// Get description based on Delta-E value
const getColorDifferenceDescription = (deltaE: number): string => {
	if (deltaE < 1) return "Not perceptible by human eyes";
	if (deltaE < 2) return "Perceptible through close observation";
	if (deltaE < 10) return "Perceptible at a glance";
	if (deltaE < 49) return "Colors are more similar than opposite";
	if (deltaE === 100) return "Colors are exact opposite";
	return "Large, obvious difference";
};

export const compareColors = (
	color1: string,
	color2: string,
): ColorComparison => {
	const rgb1 = hexToRgb(color1);
	const rgb2 = hexToRgb(color2);

	const deltaE = calculateDeltaE(rgb1, rgb2);

	return {
		deltaE: Math.round(deltaE * 100) / 100,
		description: getColorDifferenceDescription(deltaE),
	};
};

// Cache for color calculations
const colorCache: ColorCache = {};

const flattenColors = (
	colors: Record<string, TailwindColorValue>,
	prefix = "",
): Record<string, string> => {
	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(colors)) {
		if (typeof value === "string" && value.startsWith("#")) {
			const colorName = prefix ? `${prefix}-${key}` : key;
			result[colorName] = value;
		} else if (typeof value === "object" && value !== null) {
			const newPrefix = prefix ? `${prefix}-${key}` : key;
			Object.assign(
				result,
				flattenColors(value as Record<string, TailwindColorValue>, newPrefix),
			);
		}
	}

	return result;
};

const getFlattenedColors = () => {
	const flatColors = flattenColors(TAILWIND_COLORS);
	for (const [name, hex] of Object.entries(flatColors)) {
		colorCache[name] = hexToRgb(hex);
	}
	return flatColors;
};

export const findClosestColor = (inputColor: string): string => {
	const input = hexToRgb(inputColor);
	const flatColors = getFlattenedColors();

	let closestColor = "";
	let minDistance = Number.POSITIVE_INFINITY;

	for (const [colorName] of Object.entries(flatColors)) {
		const color = colorCache[colorName];
		const distance = calculateDeltaE(input, color);

		if (distance < minDistance) {
			minDistance = distance;
			closestColor = colorName;
		}
	}

	return closestColor;
};

export const getColorHex = (colorName: string): string => {
	const flatColors = getFlattenedColors();
	return flatColors[colorName] || "#ffffff";
};
