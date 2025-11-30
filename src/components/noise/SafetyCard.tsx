export function SafetyCard() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl" role="img" aria-label="shield">
          🛡️
        </span>
        <h2 className="text-xl font-bold text-gray-900">
          How to use this safely
        </h2>
      </div>

      <ul className="space-y-3 text-gray-700">
        <li className="flex gap-3">
          <span className="text-amber-600 font-bold flex-shrink-0">•</span>
          <span>
            <strong>Start when your dog is relaxed</strong> — Don't begin
            training when they're already anxious or overstimulated
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-amber-600 font-bold flex-shrink-0">•</span>
          <span>
            <strong>Begin at very low volume</strong> — Start at 10-20% and
            gradually increase only if your dog remains calm
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-amber-600 font-bold flex-shrink-0">•</span>
          <span>
            <strong>Watch for stress signals</strong> — If your dog shows signs
            of anxiety (panting, pacing, whining), reduce volume or stop
            immediately
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-amber-600 font-bold flex-shrink-0">•</span>
          <span>
            <strong>Pair with positive reinforcement</strong> — Give treats and
            praise when your dog stays calm during sound exposure
          </span>
        </li>
      </ul>
    </div>
  );
}
