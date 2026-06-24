import { greeting } from "@/lib/greeting";

export default function Home() {
  return (
    <main>
      <h1>{greeting("Catch")}</h1>
      <p>Build Loop scaffold is running.</p>
    </main>
  );
}
