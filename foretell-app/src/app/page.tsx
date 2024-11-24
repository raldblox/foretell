import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-4 min-h-screen bg-cyan-500 font-[family-name:var(--font-geist-sans)]">
      <section className="grid row-start-3 content-end px-8 py-2">
        <h1 className="text-3xl uppercase font-bold text-center">
          There&apos;s only
        </h1>
      </section>
      <section className="grid row-start-4 bg-black py-2 px-8">
        <h1 className="text-4xl text-center text-cyan-500">
          <span className="font-bold">One Foretell</span>
        </h1>
      </section>
    </div>
  );
}
