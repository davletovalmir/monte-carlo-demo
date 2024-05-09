import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

import "~/styles/globals.css";
import { Toaster } from "~/shared/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <main className={`font-sans ${inter.variable}`}>
        <Component {...pageProps} />
      </main>

      <Toaster />
    </QueryClientProvider>
  );
};

export default MyApp;
