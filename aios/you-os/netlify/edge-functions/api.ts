import { getStore } from "@netlify/blobs";

/**
 * Unified API Edge Function for You OS
 * Provides CRUD operations on Netlify Blobs.
 */
export default async (request, context) => {
  const url = new URL(request.url);
  const method = request.method;
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing 'key' parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = getStore("you-os-store");

  try {
    switch (method) {
      case "GET": {
        const value = await store.get(key);
        if (value === null) {
          return new Response(null, { status: 404 });
        }
        const text = await value.text();
        return new Response(text, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "POST":
      case "PUT": {
        const body = await request.text();
        await store.set(key, body);
        return new Response(JSON.stringify({ success: true, key }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "DELETE": {
        await store.delete(key);
        return new Response(JSON.stringify({ success: true, key }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Method ${method} not allowed` }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
