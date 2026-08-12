import { AtlasIntro } from "@/components/atlas/atlas-intro";
import { ResearchConsole } from "@/components/atlas/research-console";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { atlasDataset } from "@/data/index";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <AtlasIntro dataset={atlasDataset} />
        <ResearchConsole dataset={atlasDataset} />
      </main>
      <SiteFooter />
    </>
  );
}
