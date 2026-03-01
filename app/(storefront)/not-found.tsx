import { UnderDevelopment } from "@/components/under-development";

export default function NotFound() {
  return (
    <UnderDevelopment
      title="Page Not Found"
      message="This page is under development. Please wait some days."
      showBackButton={true}
    />
  );
}
