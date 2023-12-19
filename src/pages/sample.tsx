// import EventSource from "eventsource";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Sample() {
  useEffect(() => {
    const eventSource = new EventSource(`/api/sse`, {
      withCredentials: true,
    });
    eventSource.onopen = () => {
      console.log("open");
    };
    eventSource.onmessage = (e) => {
      console.log(e.data);
    };
    eventSource.onerror = (e) => {
      console.log(e);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const { data: session } = useSession();

  return (
    <div className="flex flex-col justify-center items-center mt-8">
      <h1>Sample Page</h1>
      Signed in as {session?.user?.name} <br />
    </div>
  );
}
