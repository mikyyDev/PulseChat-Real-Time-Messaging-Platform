import illustrationImg from "../asset/image/illus.avif";

export default function AuthIllustration() {
  return (
    <div className="relative flex flex-col items-center justify-center px-8 py-10 max-w-lg mx-auto text-center select-none">
      {/* Subtle ambient lighting / glow in the background */}
      <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

      {/* Illustration image */}
      <div className="relative z-10 flex items-center justify-center mb-8">
        <img
          src={illustrationImg}
          alt="PulseChat Community"
          className="w-full max-w-[360px] sm:max-w-[420px] object-contain drop-shadow-[0_20px_40px_rgba(40,16,80,0.6)] transition-transform duration-700 ease-out hover:scale-105"
        />
      </div>

      {/* Tagline */}
      <div className="relative z-10">
        <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-white">
          Talk to your team,
          <br />
          all in one place.
        </h2>
        <p className="mt-3 text-base text-slate-400">
          Fast, simple conversations for teams and friends.
        </p>
      </div>
    </div>
  );
}
