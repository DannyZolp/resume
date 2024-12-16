import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase";
import { App } from "./App";

const supabaseUrl = "https://irvuvogabmyggxfhcfha.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey!);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <App supabase={supabase} />
    </MantineProvider>
  </StrictMode>
);
