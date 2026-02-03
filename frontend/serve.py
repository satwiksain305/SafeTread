#!/usr/bin/env python3
"""
Simple HTTP server for serving React SPA with proper routing
Routes all non-file requests to index.html
"""

import http.server
import socketserver
import os
from pathlib import Path

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the requested path
        path = Path(self.path.lstrip('/'))
        
        # If it's a file that exists, serve it normally
        if path.is_file():
            super().do_GET()
            return
        
        # For all non-file requests, serve index.html (SPA routing)
        self.path = '/index.html'
        super().do_GET()

if __name__ == '__main__':
    # Change to build directory
    build_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build')
    os.chdir(build_dir)
    print(f"✓ Serving from: {build_dir}")
    
    PORT = 3000
    Handler = SPAHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"✓ SafeTread Frontend on http://localhost:{PORT}")
        print(f"✓ SPA routing enabled")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n✓ Server stopped")
