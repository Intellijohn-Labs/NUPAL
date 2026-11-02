import Link from "next/link";

export function WhatsAppFloat({ number }: { number: string }) {
  const digits = number.replace(/\D/g, "");
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <Link
        href="/consult"
        className="hidden items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-sm font-medium shadow-[0_12px_30px_-12px_rgba(0,0,0,.45)] sm:flex"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-mist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E5A42" strokeWidth="1.7" aria-hidden="true">
            <path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2" />
            <circle cx="20" cy="12" r="2" />
          </svg>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#25D366]" />
        </span>
        Talk to a doctor
      </Link>
      {digits && (
        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with NUPAL on WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_12px_30px_-10px_rgba(0,0,0,.45)]"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3a2.6 2.6 0 0 0-.8 2c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
          </svg>
        </a>
      )}
    </div>
  );
}
