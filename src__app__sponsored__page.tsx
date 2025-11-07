import sponsored from "../../../content/sponsored.json";

export const dynamic = "force-static";

export default function SponsoredPage() {
  const posts = (sponsored as any).posts as Array<{
    title: string;
    excerpt: string;
    url: string;
    sponsor: string;
    image?: string;
  }>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold">Sponsored Posts</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Curated sponsored content relevant to Pinterest and video workflows.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <a key={p.title} href={p.url} target="_blank" rel="sponsored noopener"
            className="rounded-md border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.title} className="mb-3 rounded-md" />
            ) : null}
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{p.excerpt}</p>
            <p className="mt-2 text-xs text-zinc-500">Sponsored by {p.sponsor}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
