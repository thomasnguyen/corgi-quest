import { Link } from "@tanstack/react-router";

export default function LogActivityButton() {
  return (
    <div className="px-5 pb-2 z-20">
      <div className="max-w-md mx-auto">
        <Link
          to="/log-activity"
          className="relative block w-full text-center py-4 overflow-hidden group transition-all hover:opacity-90 rounded-md"
          style={{
            // CSS-based button styling - no image needed
            background: "radial-gradient(ellipse at center, #B38971 0%, #5F5553 100%)",
            border: "1px solid #F9DCA0",
            boxShadow: `
              inset 0 0 7.8px rgba(168, 125, 96, 0.8),
              inset 0 0 4.55px rgba(255, 227, 107, 0.44),
              0 0 2px rgba(249, 220, 160, 0.5)
            `,
          }}
        >
          <span className="relative z-10 text-base font-semibold tracking-wider uppercase bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
            LOG ACTIVITY
          </span>
        </Link>
      </div>
    </div>
  );
}
