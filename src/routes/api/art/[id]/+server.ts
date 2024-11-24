import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const response = await fetch(
      `https://coverartarchive.org/release/${params.id}`,
      {
        headers: {
          'User-Agent': 'YourApp/1.0.0 ( your@email.com )',
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      return new Response(null, { status: 404 });
    }
    
    const data = await response.json();
    return json(data);
    
  } catch (error) {
    return new Response('Failed to fetch cover art', { status: 500 });
  }
};