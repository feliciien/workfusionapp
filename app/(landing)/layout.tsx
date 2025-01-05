import { LandingNavbar } from "@/components/landing-navbar";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#111827]">
      <LandingNavbar />
      <main className="pt-16">
        <div className="mx-auto max-w-screen-xl">{children}</div>
      </main>
    </div>
  );
};

export default LandingLayout;
