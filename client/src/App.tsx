import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TerritoryMap from "./pages/TerritoryMap";
import MagicMomentCapture from "./pages/MagicMomentCapture";
import PublicMagicMoment from "./pages/PublicMagicMoment";
import ShadowCorps from "./pages/ShadowCorps";
import { MissionsDashboard } from "./pages/MissionsDashboard";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/map" component={TerritoryMap} />
      <Route path="/missions" component={MissionsDashboard} />
      <Route path="/shadow-corps" component={ShadowCorps} />
      <Route path="/capture" component={MagicMomentCapture} />
      <Route path="/share/:id" component={PublicMagicMoment} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
