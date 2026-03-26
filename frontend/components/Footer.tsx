import Link from "next/link";

const links = {
  Product: ["Features", "Download", "Changelog"],
  Support: ["Help", "Contact", "Status"],
  Legal: ["Privacy", "Terms"],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 pt-14 pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 3.5C2 2.67 2.67 2 3.5 2h7C11.33 2 12 2.67 12 3.5v5c0 .83-.67 1.5-1.5 1.5H8l-3 3v-3H3.5C2.67 10 2 9.33 2 8.5v-5z"
                    fill="#0a0a0a"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">WebChat</span>
            </Link>
            <p className="text-sm text-white/30 leading-relaxed max-w-[200px]">
              Personal real-time messaging. Simple, fast, private.
            </p>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-white/25 tracking-widest uppercase">{group}</p>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-white/35 hover:text-white/65 transition-colors duration-150"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} WebChat. All rights reserved.
          </p>
  
        </div>
      </div>
    </footer>
  );
}