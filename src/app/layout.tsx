import "./globals.css";
// 1. Add this import at the very top of the file
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="catch-chunk-load-error"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('ChunkLoadError') || /Loading chunk .* failed/i.test(e.message))) {
                  window.location.reload();
                }
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && (e.reason.message.includes('ChunkLoadError') || /Loading chunk .* failed/i.test(e.reason.message))) {
                  window.location.reload();
                }
              });
            `,
          }}
        />
        {/* 2. Change the lowercase script tag to the uppercase NextJS Script component and give it an id */}
        <Script
          id="clean-skin-attribute"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Intercept setAttribute
                const origSet = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, value) {
                  if (name === 'bis_skin_checked') return;
                  origSet.call(this, name, value);
                };

                // Intercept setAttributeNS
                const origSetNS = Element.prototype.setAttributeNS;
                Element.prototype.setAttributeNS = function(ns, name, value) {
                  if (name === 'bis_skin_checked') return;
                  origSetNS.call(this, ns, name, value);
                };

                // MutationObserver to strip existing/other additions immediately
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                        m.target.removeAttribute('bis_skin_checked');
                      } else if (m.addedNodes) {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          var node = m.addedNodes[j];
                          if (node.nodeType === 1) {
                            if (node.hasAttribute('bis_skin_checked')) {
                              node.removeAttribute('bis_skin_checked');
                            }
                            var children = node.getElementsByTagName('*');
                            for (var k = 0; k < children.length; k++) {
                              if (children[k].hasAttribute('bis_skin_checked')) {
                                children[k].removeAttribute('bis_skin_checked');
                              }
                            }
                          }
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body 
        className="font-sans bg-app-black text-white antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}