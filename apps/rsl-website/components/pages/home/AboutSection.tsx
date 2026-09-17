import Image from 'next/image'

export default function AboutSection() {
  const team = [
    {
      name: 'Harris',
      image: '/team/harry.png',
      role: 'Business Strategy & Dealer Operations',
      bio: 'Harris brings experience working with business owners, evaluating operations, and understanding how financial decisions affect day-to-day performance. His background also includes hands-on experience with technology and software development, allowing him to translate practical business needs into clear product workflows. He helps shape RSL Cards around useful reporting, simple functionality, and tools that make a dealer\'s business easier to operate and understand.',
    },
    {
      name: 'Pavan',
      image: '/team/pavan.png',
      role: 'Product, Data & Technology',
      bio: 'Pavan brings experience in software development, data analysis, automation, and building systems that turn complex information into practical tools. His background allows him to connect the technical side of RSL Cards with the real-world needs of dealers. He leads the development of the platform, with a focus on reliable workflows, clear data, and a seamless connection between the mobile app, dealer dashboard, inventory, transactions, and reporting.',
    },
    {
      name: 'Trey',
      image: '/team/trey.png',
      role: 'Finance & Business Operations',
      bio: 'Trey brings experience in accounting, financial reporting, and building disciplined business operations. His background helps ensure RSL Cards handles cost basis, expenses, profitability, and transaction records in a clear and dependable way. He supports the financial structure of the platform, with a focus on making complex information easier for dealers to understand and use.',
    },
  ]

  return (
    <section id="about" className="bg-black py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-left sm:text-center">
          <h2 className="display-title text-2xl sm:text-4xl md:text-5xl font-black text-white">
            About RSL Cards
          </h2>
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 text-sm sm:text-base md:text-lg leading-relaxed text-neutral-300">
            <p>
              <span className="font-bold text-white">RSL Cards</span> is the dedicated operating system for card dealers. Built specifically for sports cards, TCG (Pokémon, One Piece, Magic), and show-floor operations, the platform unites inventory management, real-time market comps, dealer-to-dealer trade balancing, and profit accounting into one cohesive platform.
            </p>
            <p>
              Card dealers operate in fast-moving, high-volume environments—from 500-table convention centers to late-night dealer trade sessions. For years, dealers have had to juggle disconnected spreadsheets, mental math, and spotty convention WiFi. RSL Cards replaces that friction with a professional operating system built for how dealers actually work.
            </p>
          </div>
          <div className="mt-8 sm:mt-12 flex justify-center">
            <Image src="/team/team.png" alt="RSL Cards Team" width={800} height={500} className="max-w-full h-auto object-contain rounded-xl" />
          </div>
        </div>

        <div className="mt-16 sm:mt-24">
          <h3 className="display-title mb-8 sm:mb-12 text-center text-xl sm:text-2xl text-white">Meet the Team</h3>
          <div className="grid gap-8 sm:gap-12 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center bg-panel/40 sm:bg-transparent p-6 sm:p-0 rounded-2xl border border-white/5 sm:border-none">
                <div className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-panel border border-white/10 overflow-hidden relative shadow-lg">
                  <Image src={member.image} alt={member.name} width={128} height={128} className="h-full w-full object-cover" />
                </div>
                <div className="mt-5 sm:mt-6">
                  <h4 className="text-lg sm:text-xl font-black text-white">{member.name}</h4>
                  <div className="mt-1 text-xs sm:text-sm font-bold uppercase tracking-widest text-rslRed">
                    {member.role}
                  </div>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-neutral-400 text-left">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
