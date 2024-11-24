import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const response = await fetch(
      `https://musicbrainz.org/ws/2/release/${params.id}?inc=recordings+artist-credits&fmt=json`,      
      {
        headers: {
          'User-Agent': 'Album/1.0.0 ( music@email.com )',
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch album');
    }
    
    const data = await response.json();
    return json(data);
    
  } catch (error) {
    return new Response('Failed to fetch album', { status: 500 });
  }
};