import { Link } from "@tanstack/react-router";

export default function LogActivityButton() {
  return (
    <div className=" px-5 pb-2 z-20">
      <div className="max-w-md mx-auto">
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
      </div>
    </div>
  );
}
