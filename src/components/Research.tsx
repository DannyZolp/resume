import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { useEffect, useState } from "react";
import { useAuth } from "../state/AuthState";
import { ActionIcon, Grid, Group, List, Stack, Text } from "@mantine/core";
import { format } from "date-fns";
import { IconTrash } from "@tabler/icons-react";

type ResearchProps = {
  supabase: SupabaseClient<Database>;
};

export function Research({ supabase }: ResearchProps) {
  const auth = useAuth();

  const [research, setResearch] = useState<
    Database["public"]["Tables"]["research"]["Row"][]
  >([]);
  const [deleting, setDeleting] = useState<number>(-1);

  useEffect(() => {
    supabase
      .from("research")
      .select("*")
      .eq("user_id", auth.userId)
      .then(({ data }) => {
        setResearch(data ?? []);
      });
  }, []);

  return (
    <Stack>
      {research?.map((res, index) => (
        <Grid gutter="xs" key={index}>
          <Grid.Col span="auto">
            <Stack gap={0} mt="xs">
              <Group grow>
                <Text fw={700} m={0}>
                  {res.topic} at {res.institution}
                </Text>
                <Text m={0} c="dimmed" ta="end">
                  {format(res.started_at, "MMM yyyy")} -{" "}
                  {res.ended_at ? format(res.ended_at, "MMM yyyy") : "Current"}
                </Text>
              </Group>
              <List ml="md">
                {res.points.map((point, index) => (
                  <List.Item key={index}>{point}</List.Item>
                ))}
              </List>
            </Stack>
          </Grid.Col>
          <Grid.Col span="content">
            <ActionIcon
              variant="transparent"
              color="red"
              size="sm"
              mt="xs"
              disabled={deleting > -1}
              loading={deleting === index}
              onClick={() => {
                setDeleting(index);
                supabase
                  .from("research")
                  .delete()
                  .eq("id", res.id)
                  .then(() => {
                    setResearch(research.filter((j) => j.id !== res.id));
                    setDeleting(-1);
                  });
              }}
            >
              <IconTrash />
            </ActionIcon>
          </Grid.Col>
        </Grid>
      ))}
    </Stack>
  );
}
