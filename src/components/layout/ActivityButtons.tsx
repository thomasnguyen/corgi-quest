import { Link } from "@tanstack/react-router";

export default function ActivityButtons() {
  return (
    <div className="px-5 pb-2 z-20">
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
        <Link
          to="/log-activity"
          className="relative block w-full text-center py-4 overflow-hidden group transition-all"
          style={{
            backgroundImage: "url(/cta_button.svg)",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="relative z-10 text-base font-semibold tracking-wider uppercase bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
            LOG ACTIVITY
          </span>
        </Link>

        <Link
          to="/training-mode"
          className="relative block w-full text-center py-4 overflow-hidden group transition-all"
          style={{
            backgroundImage: "url(/cta_button.svg)",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="relative z-10 text-base font-semibold tracking-wider uppercase bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
            TRAINING MODE
          </span>
        </Link>
      </div>
    </div>
  );
}
