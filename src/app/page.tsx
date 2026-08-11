import { AtlasIntro } from "@/components/atlas/atlas-intro";
import { ResearchConsole } from "@/components/atlas/research-console";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { atlasDataset } from "@/data/index";
import { parseUrlState } from "@/lib/url-state";

type PageSearchParams = Record<string, string | string[] | undefined>;

function toUrlSearchParams(values: PageSearchParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") {
      searchParams.set(key, value);
    } else if (value?.[0]) {
      searchParams.set(key, value[0]);
    }
  }

  return searchParams;
}

export default async function Page({
  searchParams = Promise.resolve({}),
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const initialState = parseUrlState(
    toUrlSearchParams(await searchParams),
    atlasDataset,
  );

  return (
    <>
      <SiteHeader />
      <main>
        <AtlasIntro dataset={atlasDataset} />
        <ResearchConsole dataset={atlasDataset} initialState={initialState} />
      </main>
      <SiteFooter />
    </>
  );
}
