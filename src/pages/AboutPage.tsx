import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { CassetteLogo } from '@/components/CassetteLogo';

export function AboutPage({ onClose }: { onClose?: () => void }) {
  const isModal = !!onClose;

  return (
    <div className={isModal ? "bg-gray-900 text-white p-6 rounded-xl shadow-2xl max-w-2xl mx-auto border border-gray-800" : "min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6"}>
      <div className={isModal ? "space-y-6" : "max-w-4xl mx-auto space-y-6"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          {isModal ? (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕ Close
            </button>
          ) : (
            <Link
              to="/"
              className="text-white hover:text-purple-200 transition-colors flex items-center gap-2"
            >
              ← Back to Player
            </Link>
          )}
          <div className="flex-1" />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-white">mashuppi</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            A curated stream of the finest mashups from the golden age of internet music culture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white border-b border-purple-500 pb-2">The Mission</h2>
            <p className="text-purple-100 leading-relaxed">
              Preserving and celebrating the lost art of the mashup.<br /><br />
              mashuppi is a love letter to the golden age of mashup culture — that magical era from 2010-2014 when bedroom producers were crafting incredible blends of hip-hop, pop, indie, and electronic music.
            </p>
            <h2 className="text-2xl font-bold text-white border-b border-purple-500 pb-2">The Process</h2>
            <p className="text-purple-100 leading-relaxed">
              Built over a weekend using an old Raspberry Pi 3B, fueled by this music and Claude code.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white border-b border-purple-500 pb-2">Featured Artists</h2>
            <ul className="space-y-2 text-purple-100">
              <li>• The Airport District</li>
              <li>• Milkman</li>
              <li>• Super Mash Bros</li>
              <li>• DJ Topsider</li>
              <li>• Bosselmeyer</li>
              <li>• Bruneaux</li>
              <li>• The White Panda</li>
              <li>• Kap Slap</li>
              <li>• Girl Talk</li>
              <li>• Isosine</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 pt-8 border-t border-purple-500/30">
        <p className="text-sm text-purple-300">
          Built with ❤️ by Derek • Powered by a Raspberry Pi 3B<br />
          All mashups are property of their respective creators
        </p>
      </div>
    </div>
  );
}


