import { UnderDevelopment } from "@/components/under-development";

export default function NotFound() {
  return (
    <UnderDevelopment
      title="Admin Page Not Found"
      message="This admin page is under development. Please wait some days."
      showBackButton={true}
    />
  );
}
