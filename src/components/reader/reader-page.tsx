import { Button } from "@/components/ui/button";
import { Lightbulb, Users, CircleHelp } from "lucide-react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { useState } from "react";

export default function ReaderPage() {
  return (
    <Layout>
      <div className="pb-0 pt-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-2 text-center text-3xl tracking-tight">
            Meditation Reader
          </h1>

          <p className="text-muted-foreground mb-4 text-center">
            Instantly read your own guided meditations.
          </p>

          <div className="bg-card border-accent border-1 text-muted-foreground mx-auto mb-10 max-w-xl rounded-lg p-4 text-sm">
            <ul className="list-inside space-y-2">
              <li>
                <i>Tip:</i> Use <i>ChatGPT</i> or another AI chatbot to generate
                and refine a meditation script. Then copy and paste the script
                here.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
