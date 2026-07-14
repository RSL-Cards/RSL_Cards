export default function AboutSection() {
  const team = [
    {
      name: 'Harris',
      role: 'Co-Founder',
      bio: 'Harris brings years of experience in product design and user experience. He is focused on making RSL Cards intuitive for the fast-paced show floor environment.',
    },
    {
      name: 'Pavan',
      role: 'Co-Founder',
      bio: 'Pavan leads the technical architecture and data infrastructure. He ensures that real-time market data and dealer inventory stay perfectly synced.',
    },
    {
      name: 'Trey',
      role: 'Co-Founder',
      bio: 'Trey drives business operations and strategy. He works closely with dealers to ensure RSL Cards solves the actual problems faced in the industry.',
    },
  ]

  return (
    <section id="about" className="bg-black py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-title text-3xl text-white sm:text-4xl">Our Mission</h2>
          <p className="mt-6 text-xl leading-relaxed text-neutral-300 md:text-2xl">
            <span className="font-bold text-white">RSL Cards</span> is building a platform to help sports card dealers run smarter business operations through better organization, better information, and better decision-making.
          </p>
        </div>

        <div className="mt-24">
          <h3 className="display-title mb-12 text-center text-2xl text-white">Meet the Team</h3>
          <div className="grid gap-12 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center">
                {/* Avatar Placeholder */}
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-panel border border-white/10 text-3xl font-black text-white">
                  {member.name.charAt(0)}
                </div>
                <div className="mt-6">
                  <h4 className="text-xl font-black text-white">{member.name}</h4>
                  <div className="mt-1 text-sm font-bold uppercase tracking-widest text-rslRed">
                    {member.role}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-400">
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
