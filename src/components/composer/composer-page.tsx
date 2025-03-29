import { Button } from "@/components/ui/button";
import { Lightbulb, Users, CircleHelp } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import dynamic from "next/dynamic";
import ComposerFlowDialog from "@/components/composer/composer-flow-dialog";

const YourMeditations = dynamic(
  () => import("@/components/composer/your-meditations"),
  { ssr: false }
);

export default function ComposerPage() {
  const [open, setOpen] = useState(false);

  return (
    <Layout>
      <div className="pb-0 pt-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-2 text-center text-3xl tracking-tight">
            Generate Meditations from AI Scripts
          </h1>

          <p className="text-muted-foreground mb-9 text-center">
            Compose and synthesize your own guided meditations starting from a
            script.
          </p>

          <div className="bg-card border-accent border-1 text-muted-foreground mx-auto mb-10 max-w-3xl rounded-lg p-4 text-sm md:p-6">
            <ul className="list-inside space-y-2 md:list-disc">
              <li>
                Use{" "}
                <a
                  href="https://chatgpt.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ChatGPT
                </a>{" "}
                or another AI tool to generate and refine a meditation script
                based on your preferences
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                  }}
                >
                  Open the composer
                </a>
                , copy and paste the script, and select a voice.
              </li>
              <li>
                Review how the AI has interpreted your script, and edit it if
                needed by returning to the setup screen.
              </li>
              <li>
                Synthesize your meditation, then play it, download it or share
                it.
              </li>
            </ul>
          </div>

          <div className="mb-4 flex justify-center">
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="flex items-center gap-2"
            >
              Open Composer
            </Button>
          </div>

          <ResourcesInfoBar />

          <div className="mb-12">
            <YourMeditations />
          </div>
        </div>
      </div>
      <ComposerFlowDialog open={open} onOpenChange={setOpen} />
    </Layout>
  );
}

const ResourcesInfoBar = () => {
  return (
    <div className="mb-8 mt-4 flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm">
      <div className="text-muted-foreground flex flex-col items-center space-y-4 md:flex-row md:space-x-6 md:space-y-0">
        <div className="flex items-center">
          <CircleHelp className="mr-2 h-4 w-4" />
          <a
            href="/articles/how-to"
            className="text-primary hover:text-primary hover:underline"
          >
            How to Create Meditations
          </a>
        </div>

        <div className="bg-border hidden h-4 w-px md:block"></div>

        <div className="flex items-center">
          <Lightbulb className="mr-2 h-4 w-4" />
          <a
            href="/articles/creative-examples"
            className="text-primary hover:text-primary hover:underline"
          >
            Creative Ways to Create Meditations
          </a>
        </div>

        <div className="bg-border hidden h-4 w-px md:block"></div>

        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          <a
            href="/community"
            className="text-primary hover:text-primary hover:underline"
          >
            Check out community meditations
          </a>
        </div>
      </div>
    </div>
  );
};
