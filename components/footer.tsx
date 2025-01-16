import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h5 className="text-lg font-semibold">WorkFusion App</h5>
            <p className="text-sm">Transforming businesses with AI automation.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/contact" className="text-sm hover:underline">Contact Us</Link>
            <Link href="/terms-and-conditions" className="text-sm hover:underline">Terms and Conditions</Link>
            <Link href="/privacy-policy" className="text-sm hover:underline">Privacy Policy</Link>
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          &copy; 2023 WorkFusion App. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
