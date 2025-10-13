import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCoffee, faRocket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-primary-600 mb-4 text-4xl font-bold">
          <FontAwesomeIcon icon={faRocket} className="mr-3" />
          UI Designer
        </h1>
        <p className="text-text-muted mb-8 text-xl">Agentic Design Collaboration Platform</p>
        <div className="flex items-center justify-center gap-6 text-2xl">
          <FontAwesomeIcon icon={faCoffee} className="text-primary-500" />
          <FontAwesomeIcon icon={faGithub} className="text-text" />
        </div>
        <div className="bg-surface-muted mt-8 rounded-lg p-6">
          <p className="text-text-muted text-sm">
            Built with Next.js 15, React 19, Tailwind CSS 4, and Bun 1.3
          </p>
        </div>
      </div>
    </main>
  );
}
