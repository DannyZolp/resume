import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase";
import { useEffect, useState } from "react";
import { AppShell, Button, Group, Title } from "@mantine/core";
import { SetupBasics } from "./flows/SetupBasics";
import { Dashboard } from "./flows/Dashboard";
import { Login } from "./flows/Login";
import { useAuth } from "./state/AuthState";
import { GenericResume } from "./resume-templates/generic";

type AppProps = {
  supabase: SupabaseClient<Database>;
};

export function App({ supabase }: AppProps) {
  const query = new URLSearchParams(window.location.search);
  const auth = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [accountCreated, setAccountCreated] = useState<boolean>(false);

  const [resumeType, setResumeType] = useState<"disabled" | "generic">(
    "disabled"
  );
  const [resumeData, setResumeData] = useState<any>();

  useEffect(() => {
    if (query.has("resume")) {
      setResumeType("generic");
      setResumeData(JSON.parse(query.get("data") ?? "{}"));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user !== null) {
        auth.login(user.id);
        supabase
          .from("profiles")
          .select("id")
          .then(({ data }) => {
            setLoading(false);
            setAccountCreated(data?.length === 1);
          });
      } else {
        auth.logout();
        setLoading(false);
      }
    });
  }, [auth.loggedIn]);

  if (resumeType === "generic") {
    return <GenericResume resume={resumeData} autoPrint />;
  } else if (loading) {
    return <p>Loading...</p>;
  } else {
    return (
      <AppShell header={{ height: 60 }}>
        <AppShell.Header>
          <Group h="100%" px="md" grow>
            <Title size={24}>Resume.Horse</Title>
            <Group justify="flex-end">
              {auth.loggedIn ? (
                <Button
                  color="red"
                  onClick={() => {
                    supabase.auth.signOut().then(() => {
                      auth.logout();
                    });
                  }}
                >
                  Logout
                </Button>
              ) : null}
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          {!auth.loggedIn ? (
            <Login supabase={supabase}></Login>
          ) : (
            <>
              {!loading && accountCreated ? (
                <Dashboard supabase={supabase} />
              ) : (
                <SetupBasics supabase={supabase} />
              )}
            </>
          )}
        </AppShell.Main>
      </AppShell>
    );
  }
}
