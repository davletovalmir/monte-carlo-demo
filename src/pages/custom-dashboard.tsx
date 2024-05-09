import Head from "next/head";
import { Navbar } from "~/shared/components/Navbar";
import { DatasetList } from "~/modules/custom-dashboard/components/DatasetsList";
import { CustomDashboard } from "~/modules/custom-dashboard/CustomDashboard";

export default function Home() {
  return (
    <>
      <Head>
        <title>Custom Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <main className="grid w-full grid-cols-[1fr_auto]">
        <CustomDashboard />

        <aside className="sticky top-16 h-[calc(100vh_-_64px)] w-60 bg-slate-100">
          <DatasetList />
        </aside>
      </main>
    </>
  );
}
