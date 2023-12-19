// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import EventSource from "eventsource";
import EventEmitter from "events";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const stream = new EventEmitter();

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getServerSession(req, res, authOptions);

  console.log({ session });

  if (!session) {
    res
      .status(401)
      .end("You must be signed in to view the protected content on this page.");
    return;
  }

  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Encoding": "none",
    "Cache-Control": "no-cache, no-transform",
    "Content-Type": "text/event-stream",
  });

  let count = 1;
  const interval = setInterval(() => {
    res.write(
      `data: ${JSON.stringify({
        message: "hello",
        session: session?.user?.name,
        sessExpire: session?.expires,
        value: (count += 1),
      })}\n\n`
    );

    if (count > 10) {
      res.end();
    }
  }, 1000);

  res.on("close", () => {
    console.log(`close ${count}`);
    clearInterval(interval);
    res.end();
  });

  res.socket?.on("close", () => {
    console.log(`close ${count}`);
    clearInterval(interval);
    res.end();
  });
}
