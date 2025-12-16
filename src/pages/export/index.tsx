import { Layout } from "@/components/layout/layout-component";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ExportIndex() {
  const { getSortedMeditations } = useMyMeditations();
  const meditations = getSortedMeditations("instant");
  const router = useRouter();
  const [referrer, setReferrer] = useState<string>("");
  const [redirectPath, setRedirectPath] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const ref = typeof window !== "undefined" ? document.referrer : "";
    setReferrer(ref);

    const redirect = router.query.redirect;
    if (typeof redirect === "string") {
      setRedirectPath(redirect);
    }
  }, [router.query]);

  const handleCancel = () => {
    router.push("/instant");
  };

  const handleConfirm = () => {
    if (!referrer || !redirectPath) {
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${referrer}${redirectPath}`;
    form.style.display = "none";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(meditations);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  const hasMeditations = meditations && meditations.length > 0;
  const canExport = referrer && redirectPath && hasMeditations;

  if (!isClient) {
    return (
      <Layout variant="page">
        <header className="mb-12">
          <h1 className="mb-3 text-center text-2xl tracking-tight">Export</h1>
        </header>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout variant="page">
      <h1 className="mb-4 text-center text-xl tracking-tight">Export</h1>

      <div className="mx-auto max-w-2xl">
        {!hasMeditations ? (
          <div className="text-center">
            <p className="text-muted-foreground">
              You don't have any meditations stored in your browser to export.
            </p>
          </div>
        ) : !canExport ? (
          <div className="text-center">
            <p className="text-muted-foreground">
              {!referrer
                ? "No referrer detected. Please access this page from the service you want to export to."
                : !redirectPath
                ? "No redirect path specified. Please provide a redirect parameter in the URL."
                : "Unable to export. Missing required information."}
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Would you like to export your {meditations.length} meditation
              {meditations.length !== 1 ? "s" : ""} to{" "}
              <span className="font-medium text-foreground">{referrer}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
