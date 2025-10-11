/**
 * Font Awesome Tree-Shaking Example
 *
 * This file demonstrates the correct way to import and use Font Awesome icons
 * to ensure tree-shaking works properly and only used icons are bundled.
 *
 * Bundle Impact: Only the 6 icons imported below will be included (~5-10KB total)
 * vs importing entire libraries which would add ~1-2MB to the bundle.
 */

// ✅ CORRECT: Import specific icons from their packages
import { faUser, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Example 1: Basic Icon Usage
export function ContactCard() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-6">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faUser} className="text-blue-500" />
        <span>John Doe</span>
      </div>

      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faEnvelope} className="text-gray-600" />
        <span>john@example.com</span>
      </div>

      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faPhone} className="text-gray-600" />
        <span>+1 234 567 8900</span>
      </div>
    </div>
  );
}

// Example 2: Social Media Links
export function SocialLinks() {
  return (
    <div className="flex gap-4">
      <a
        href="https://github.com"
        className="text-gray-700 transition-colors hover:text-gray-900"
        aria-label="GitHub"
      >
        <FontAwesomeIcon icon={faGithub} size="2x" />
      </a>

      <a
        href="https://linkedin.com"
        className="text-blue-600 transition-colors hover:text-blue-700"
        aria-label="LinkedIn"
      >
        <FontAwesomeIcon icon={faLinkedin} size="2x" />
      </a>
    </div>
  );
}

// Example 3: Interactive Icon (Like Button)
export function LikeButton({ isLiked, onClick }: { isLiked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
        isLiked
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <FontAwesomeIcon icon={faHeart} />
      <span>{isLiked ? 'Liked' : 'Like'}</span>
    </button>
  );
}

// Example 4: Icon with Custom Styling
export function StyledIcon() {
  return (
    <div className="flex items-center gap-4">
      {/* Size variants */}
      <FontAwesomeIcon icon={faUser} size="xs" />
      <FontAwesomeIcon icon={faUser} size="sm" />
      <FontAwesomeIcon icon={faUser} size="lg" />
      <FontAwesomeIcon icon={faUser} size="2x" />

      {/* With Tailwind classes */}
      <FontAwesomeIcon icon={faUser} className="h-8 w-8 text-purple-500" />

      {/* With inline styles */}
      <FontAwesomeIcon icon={faUser} style={{ color: '#3b82f6', fontSize: '2rem' }} />
    </div>
  );
}

/**
 * ❌ ANTI-PATTERNS TO AVOID
 *
 * These patterns will break tree-shaking and bloat your bundle:
 */

// DON'T: Import entire icon libraries
// import * as SolidIcons from '@fortawesome/free-solid-svg-icons'
// import * as BrandIcons from '@fortawesome/free-brands-svg-icons'

// DON'T: Use the library API (adds ALL icons)
// import { library } from '@fortawesome/fontawesome-svg-core'
// import { fas } from '@fortawesome/free-solid-svg-icons'
// library.add(fas)

// DON'T: Import from barrel files if they re-export everything
// import { faUser } from '@fortawesome/free-solid-svg-icons/index'

/**
 * VERIFICATION
 *
 * To verify tree-shaking is working:
 * 1. Build your app: `bun run build`
 * 2. Check bundle size in build output
 * 3. Search for FontAwesome in bundle analyzer
 * 4. Only imported icons should be present
 *
 * Expected bundle size for FontAwesome:
 * - Core library: ~20KB
 * - Each icon: ~1-2KB
 * - Total for this file: ~30-40KB (6 icons + core)
 *
 * vs. importing all icons: ~1-2MB
 */
