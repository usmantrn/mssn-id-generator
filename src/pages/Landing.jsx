import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IdCard, Shield, Users, QrCode, ArrowRight, CheckCircle } from 'lucide-react';

export default function Landing() {
  const features = [
    { icon: IdCard, title: 'Digital ID Cards', desc: 'Professional PDF ID cards matching official MSSN FUTB Chapter design.' },
    { icon: QrCode, title: 'QR Verification', desc: 'Every card has a QR code that links to instant online verification.' },
    { icon: Shield, title: 'Role Management', desc: 'Members upgraded to officials by admin with position titles.' },
    { icon: Users, title: 'Bulk Upload', desc: 'Import hundreds of members at once via CSV file.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-16 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <IdCard size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-primary text-sm leading-tight">MSSN FUTB Chapter</p>
            <p className="text-gray-400 text-xs">ID Card System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors px-4 py-2">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-5">Register</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-20 lg:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Muslim Students' Society of Nigeria · FUTB Chapter
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6">
              Official MSSN<br />
              <span className="text-green-300">ID Card System</span>
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
              Generate professional identity cards for MSSN members and officials of the Federal University of Technology Babura Chapter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                Register as Member <ArrowRight size={18} />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-dark py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[['Unity', 'Our Foundation'], ['Faith', 'Our Drive'], ['Knowledge & Service', 'Our Mission']].map(([title, sub]) => (
            <div key={title}>
              <p className="text-white font-black text-lg">{title}</p>
              <p className="text-white/50 text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Everything You Need</h2>
          <p className="text-gray-500">A complete ID card management system built for MSSN FUTB Chapter</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} whileHover={{ y: -4 }} className="card hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-accent px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Sign up with your details and upload your passport photo.' },
              { step: '02', title: 'Get Your Card', desc: 'Generate and download your official MSSN ID card as a PDF.' },
              { step: '03', title: 'Get Verified', desc: 'Anyone can scan your QR code to instantly verify your membership.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto mb-4">{step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-4">Ready to Get Your ID Card?</h2>
        <p className="text-gray-500 mb-8">Join the MSSN FUTB Chapter digital identity system today.</p>
        <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base py-4 px-8">
          Get Started <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-white/60 py-6 text-center text-sm">
        <p>© {new Date().getFullYear()} MSSN Society – Federal University of Technology Babura Chapter</p>
        <p className="text-xs mt-1">UNITY · FAITH · KNOWLEDGE · SERVICE</p>
      </footer>
    </div>
  );
}
