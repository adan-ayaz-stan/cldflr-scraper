import { Toaster } from "@/components/ui/sonner";
import "./App.css";
import ScrapingForm from "./components/ScrapingForm";

function App() {
  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-white text-black">
        <div className="p-4 max-w-7xl mx-auto">
          <h1 className="text-5xl text-center">Web Scraper</h1>
          <ScrapingForm />
        </div>
      </div>
    </>
  );
}

export default App;
