import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Celesther John Lutche Portfolio';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 128,
                    background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
                    color: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        fontSize: 60,
                        marginBottom: 20,
                        color: '#888'
                    }}>
                        Portfolio
                    </div>
                    <div style={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        background: 'linear-gradient(to right, #fff, #888)',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}>
                        Celesther John
                    </div>
                    <div style={{
                        fontSize: 40,
                        marginTop: 30,
                        color: '#666'
                    }}>
                        Editor & 3D Artist
                    </div>
                </div>
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported opengraph-image
            // size config to also set the ImageResponse's width and height.
            ...size,
        }
    );
}
