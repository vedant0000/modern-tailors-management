import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicInvoice from "./pages/PublicInvoice";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/invoice/:publicInvoiceId"
          element={<PublicInvoice />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;