export default function ChatPage() {
  return (
    <main className="flex h-screen">
      <aside className="w-64 border-r p-4">
        <h1 className="text-xl font-bold">PulseChat</h1>
        <p className="mt-4">Your conversations</p>
      </aside>

      <section className="flex flex-1 flex-col">
        <header className="border-b p-4">Select a chat</header>

        <div className="flex-1 p-4">
          <p>Your messages will appear here.</p>
        </div>

        <form className="flex gap-2 border-t p-4">
          <input
            className="input input-bordered flex-1"
            placeholder="Type a message..."
          />
          <button type="button" className="btn btn-primary">
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
