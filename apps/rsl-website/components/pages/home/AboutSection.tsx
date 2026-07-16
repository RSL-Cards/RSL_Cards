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
    <section id="about" className="bg-black py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-title text-3xl text-white sm:text-4xl">Our Mission</h2>
          <div className="mt-6 space-y-6 text-lg leading-relaxed text-neutral-300 md:text-xl text-left">
            <p>
              <span className="font-bold text-white">RSL Cards</span> was created to give sports card dealers a practical platform for managing the day-to-day operations of their businesses. The system is designed to help dealers record activity, manage inventory, monitor listings, and understand profitability through one connected platform.
            </p>
            <p>
              Sports card dealers often operate in fast-moving environments while relying on disconnected tools, spreadsheets, and manual processes. RSL Cards was developed to make those operations simpler, clearer, and easier to manage—whether a dealer is working a card show, selling online, or reviewing the performance of the business.
            </p>
          </div>
          <div className="mt-12 flex justify-center">
            <img src="/team/team.png" alt="RSL Cards Team" className="max-w-full h-auto object-contain rounded-xl" />
          </div>
        </div>

        <div className="mt-24">
          <h3 className="display-title mb-12 text-center text-2xl text-white">Meet the Team</h3>
          <div className="grid gap-12 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-panel border border-white/10 overflow-hidden">
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-6">
                  <h4 className="text-xl font-black text-white">{member.name}</h4>
                  <div className="mt-1 text-sm font-bold uppercase tracking-widest text-rslRed">
                    {member.role}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-400 text-left">
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
