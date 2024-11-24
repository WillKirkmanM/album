export interface MusicBrainzSearchResponse {
  created: string;
  count: number;
  offset: number;
  releases: Release[];
}

export interface Release {
  id: string;
  title: string;
  date?: string;
  'artist-credit': ArtistCredit[];
}

export interface ArtistCredit {
  name: string;
  artist: {
    id: string;
    name: string;
  };
}

export interface CoverArtResponse {
  images: CoverArtImage[];
}

export interface CoverArtImage {
  front: boolean;
  thumbnails: {
    small: string;
    large: string;
  };
}

export interface AlbumResponse extends Release {
  media: {
    tracks: Track[];
  }[];
}

export interface Track {
  title: string;
  length: number;
}