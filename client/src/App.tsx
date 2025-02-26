import { Switch, Route } from "wouter";
import { Global, css } from '@emotion/react';
import DefaultFont from '../public/fonts/BPSPAA-Georgia.ttf';
import BoldFont from '../public/fonts/BPSPAA-Mont-SemiBold.ttf';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import RegisterPage from "@/pages/register-page";
import VotePage from "@/pages/vote-page";
import ResultsPage from "@/pages/results-page";
import AdminPage from "@/pages/admin-page";
import ThankYouPage from "@/pages/thank-you-page";

const GlobalStyles = () => (
    <Global
        styles={css`
            @font-face {
                font-family: 'MyFont';
                src: url(${DefaultFont}) format('truetype');
                font-weight: normal;
                font-style: normal;
            }

            @font-face {
                font-family: 'MyFont';
                src: url(${BoldFont}) format('truetype');
                font-weight: bold;
                font-style: normal;
            }

            body {
                font-family: 'MyFont', sans-serif;
            }
        `}
    />
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={RegisterPage} />
      <Route path="/vote/:id" component={VotePage} />
        <Route path="/thank-you" component={ThankYouPage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <GlobalStyles/>
        <Router />
        <Toaster />
    </QueryClientProvider>
  );
}

export default App;