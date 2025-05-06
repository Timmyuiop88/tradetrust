import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";
import { initEdgeStore } from "@edgestore/server";

const es = initEdgeStore.create();

/**
 * This is the main router for the Edge Store buckets
 */
const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket({
    accept: ['image/*'],
    maxSize: 1024 * 1024 * 5, // 5MB
    image: {
      maxWidth: 1920,
      maxHeight: 1080,
      compress: 0.8
    }
  })
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };
