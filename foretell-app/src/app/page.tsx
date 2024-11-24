export default function Home() {
  return (
    <div className="grid grid-rows-4 min-h-screen bg-cyan-500 font-[family-name:var(--font-geist-sans)]">
      <section className="grid content-center row-span-3 row-start-1 px-8 py-2">
        <h1 className="text-xl uppercase font-bold text-center">
          There&apos;s only One
        </h1>
      </section>
      <section className="grid content-center row-start-4 bg-black py-2 px-8">
        <h1 className="text-[10vw] leading-none text-center text-cyan-500">
          <span className="font-bold">Foretell</span>
        </h1>
      </section>
    </div>
  );
}
