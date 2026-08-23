
//   Hash a plaintext string using SHA-256 via the Web Crypto API.
//   Returns the lowercase hex-encoded digest.

//   This is used on the client so the raw password never travels over the
//   network — only this hash is sent to the backend, where it is compared
//   against the bcrypt hash stored in the database.
 
export async function sha256(plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
