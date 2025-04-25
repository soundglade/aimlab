import { Button } from "@/components/ui/button";
import { Lightbulb, Users, CircleHelp } from "lucide-react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import dynamic from "next/dynamic";
import StudioFlowDialog from "@/components/studio/studio-flow-dialog";

const YourMeditations = dynamic(
  () => import("@/components/studio/your-meditations"),
  { ssr: false }
);

export default function StudioPage() {
  const [open, setOpen] = useState(false);

  return (
    <Layout>
      <div className="pb-0 pt-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-2 text-center text-3xl tracking-tight">
            Meditation Studio
          </h1>

          <p className="text-muted-foreground mb-4 text-center">
            Synthesize and share your own guided meditations starting from a
            script
          </p>

          <div className="bg-card border-accent border-1 text-muted-foreground mx-auto mb-6 max-w-3xl rounded-lg p-4 text-sm">
            <p>
              Generate a script with{" "}
              <Link
                href="https://chatgpt.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ChatGPT
              </Link>{" "}
              (or any AI), paste it into the{" "}
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
                Studio
              </a>
              , choose a voice, then synthesize and play
            </p>
          </div>

          <div className="mb-0 flex justify-center">
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="flex items-center gap-2"
            >
              Open Meditation Studio
            </Button>
          </div>

          <ResourcesInfoBar />

          <div className="mb-12">
            <YourMeditations />
          </div>
        </div>
      </div>
      <StudioFlowDialog open={open} onOpenChange={setOpen} />
    </Layout>
  );
}

const ResourcesInfoBar = () => {
  return (
    <div className="mb-10 mt-3 flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm">
      <div className="text-muted-foreground flex flex-col items-center space-y-4 md:flex-row md:space-x-3 md:space-y-0">
        <div className="flex items-center">
          <CircleHelp className="mr-2 h-4 w-4" />
          <Link
            href="/articles/how-to"
            className="text-primary hover:text-primary hover:underline"
          >
            How to create meditations
          </Link>
        </div>

        <div className="bg-border hidden h-4 w-px md:block"></div>

        <div className="flex items-center">
          <Lightbulb className="mr-2 h-4 w-4" />
          <Link
            href="/articles/creative-examples"
            className="text-primary hover:text-primary hover:underline"
          >
            Creative ways to generate meditations
          </Link>
        </div>

        <div className="bg-border hidden h-4 w-px md:block"></div>

        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          <Link
            href="/meditations"
            className="text-primary hover:text-primary hover:underline"
          >
            Check out community meditations
          </Link>
        </div>
      </div>
    </div>
  );
};
