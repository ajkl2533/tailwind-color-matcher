import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Matcher from "./Matcher.tsx";

const rootElement = document.getElementById("root");
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<Matcher />
		</StrictMode>,
	);
} else {
	console.error("Could not find the root element with id 'root'.");
}
