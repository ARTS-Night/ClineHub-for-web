import { createRoot } from "react-dom/client"
import { AuthGate } from "./components/AuthGate.js"

const root = document.querySelector("#root")
if (root) createRoot(root).render(<AuthGate />)
