import { useEffect } from "react";
import { supabase } from "../services/supabase";

export default function TestConnection() {
  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from("schedules")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);
    }

    test();
  }, []);

  return <h1>Database Connected</h1>;
}