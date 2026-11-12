import { LoaderCircle } from "lucide-react";

export default function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
