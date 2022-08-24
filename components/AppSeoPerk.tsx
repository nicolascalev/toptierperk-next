import Head from "next/head";

function AppSeoPerk({ benefit }: { benefit: any }) {
  const title = "Toptierperk - " + benefit.name;
  const url = process.env.NEXT_PUBLIC_BASE_URL + `/perk/${benefit.id}`;
  const paramsString = `header=${encodeURIComponent(
    benefit.supplier.name
  )}&title=${encodeURIComponent(benefit.name)}&description=${encodeURIComponent(
    benefit.description
  )}&photoUrl=${encodeURIComponent(benefit.photos[0].url)}`;
  const thumbnail =
    "https://vercel-thumbnail.vercel.app/api/thumbnail?" + paramsString;
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={benefit.description} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={benefit.description} />
      <meta property="og:image" content={thumbnail} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={benefit.description} />
      <meta property="twitter:image" content={thumbnail} />
    </Head>
  );
}

export default AppSeoPerk;
