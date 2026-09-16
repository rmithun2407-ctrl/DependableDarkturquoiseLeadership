import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

import { StoreProvider } from '@/lib/store';
import { Layout } from '@/components/layout';
import Today from '@/pages/today';
import Progress from '@/pages/progress';
import Habits from '@/pages/habits';

const queryClient = new QueryClient();

function Router() {
  return (
    <StoreProvider>
      <Layout>
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={Today} />
            <Route path="/progress" component={Progress} />
            <Route path="/habits" component={Habits} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </Layout>
    </StoreProvider>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
