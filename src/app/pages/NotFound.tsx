import { Link } from "react-router";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-petroleum-dark via-dark-olive to-olive-green-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="font-display text-9xl text-teal-accent mb-4">404</h1>
          <h2 className="font-display text-3xl text-white mb-4">Page Not Found</h2>
          <p className="text-sage-green-light mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-all shadow-lg hover:shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
