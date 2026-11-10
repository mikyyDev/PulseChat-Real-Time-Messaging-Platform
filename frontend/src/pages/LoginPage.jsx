export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">Login</h1>
        <form className="space-y-4">
          <input
            className="input input-bordered w-full"
            type="email"
            placeholder="Email"
          />
          <input
            className="input input-bordered w-full"
            type="password"
            placeholder="Password"
          />
          <button type="submit" className="btn btn-primary w-full">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
