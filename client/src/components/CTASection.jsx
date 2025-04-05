import { Link } from "wouter";

const CTASection = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold heading mb-4">Ready to join the Urban Food movement?</h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-8">Sign up today to get access to the freshest local products and support urban farmers in your neighborhood.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/register">
            <button className="bg-white text-primary hover:bg-neutral-100 font-medium px-6 py-3 rounded-lg transition shadow-lg">
              Sign Up as Customer
            </button>
          </Link>
          <Link href="/register?vendor=true">
            <button className="bg-transparent border-2 border-white hover:bg-white/10 font-medium px-6 py-3 rounded-lg transition">
              Become a Vendor
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
