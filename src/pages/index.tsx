import Head from "next/head";
import { Navbar } from "~/shared/components/Navbar";
import { HappinessDashboard } from "~/modules/happiness-dashboard/HappinessDashboard";

export default function Home() {
  return (
    <>
      <Head>
        <title>Happiness Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <main className="w-full">
        <HappinessDashboard />
      </main>
    </>
  );
}
