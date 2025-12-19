export interface Hotel {
  _id?: string; 
  title: string; // Required, trimmed, and max length of 100 characters
  logo: string; // Required
  link: string; // Required and must match the URL validation regex
 
}