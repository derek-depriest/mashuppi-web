import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { CassetteLogo } from '@/components/CassetteLogo';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-white hover:text-purple-200 transition-colors flex items-center gap-2"
          >
            ← Back to Player
          </Link>
          <div className="flex-1" />
        </div>

        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <CassetteLogo className="w-32 h-24 mx-auto" />
          <h1 className="text-5xl font-black text-white">mashuppi</h1>
          <p className="text-purple-200 text-lg uppercase tracking-wider">
            Broadcasting the Golden Age of Mashups
          </p>
        </div>

        {/* Story */}
        <Card className="p-8 bg-white bg-opacity-10 backdrop-blur-md border-2 border-purple-400">
          <h2 className="text-2xl font-black text-white mb-4">The Story</h2>
          <div className="text-purple-100 space-y-4 leading-relaxed">
            <p>
              mashuppi is a love letter to the golden age of mashup culture—that magical era 
              from 2010-2014 when bedroom producers were crafting incredible blends of hip-hop, 
              pop, indie, and electronic music.
            </p>
            <p>
              This station preserves and celebrates the work of artists like The Airport District, 
              Milkman, Super Mash Bros, DJ Topsider, Bosselmeyer, and countless others who shaped 
              this unique sound.
            </p>
            <p>
              Built with passion on a Raspberry Pi, streaming 24/7 from a home server to keep 
              this music alive and accessible.
            </p>
          </div>
        </Card>

        {/* Featured Artists */}
        <Card className="p-8 bg-white bg-opacity-10 backdrop-blur-md border-2 border-purple-400">
          <h2 className="text-2xl font-black text-white mb-4">Featured Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-purple-100">
            <div>• The Airport District</div>
            <div>• Milkman</div>
            <div>• Super Mash Bros</div>
            <div>• DJ Topsider</div>
            <div>• Bosselmeyer</div>
            <div>• Bruneaux</div>
            <div>• The White Panda</div>
            <div>• Kap Slap</div>
            <div>• Girl Talk</div>
          </div>
        </Card>

        {/* Links */}
        <Card className="p-8 bg-white bg-opacity-10 backdrop-blur-md border-2 border-purple-400">
          <h2 className="text-2xl font-black text-white mb-4">Links</h2>
          <div className="space-y-2 text-purple-100">
            <div>
              <strong>Website:</strong>{' '}
              <a href="https://mashuppi.com" className="text-purple-300 hover:text-white transition-colors">
                mashuppi.com
              </a>
              {' / '}
              <a href="https://mashuppi.live" className="text-purple-300 hover:text-white transition-colors">
                mashuppi.live
              </a>
            </div>
            <div>
              <strong>Stream URL:</strong>{' '}
              <code className="bg-purple-900 bg-opacity-50 px-2 py-1 rounded text-sm">
                https://mashuppi.com/stream
              </code>
            </div>
          </div>
        </Card>

        {/* Credits */}
        <div className="text-center text-purple-300 text-sm">
          <p>Built with ❤️ by Derek • Powered by a Raspberry Pi 3B</p>
          <p className="mt-2">All mashups are property of their respective creators</p>
        </div>
      </div>
    </div>
  );
}