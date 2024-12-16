import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { useAuth } from "../state/AuthState";
import { ActionIcon, Grid, Group, List, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { IconTrash } from "@tabler/icons-react";

type JobsProps = {
  supabase: SupabaseClient<Database>;
};

export const Jobs = ({ supabase }: JobsProps) => {
  const auth = useAuth();

  const [jobs, setJobs] = useState<
    Database["public"]["Tables"]["jobs"]["Row"][]
  >([]);
  const [deleting, setDeleting] = useState<number>(-1);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
      .eq("user_id", auth.userId)
      .order("started_at", { ascending: false })
      .then(({ data }) => {
        setJobs(data ?? []);
      });
  }, []);

  return (
    <Stack>
      {jobs?.map((job, index) => (
        <Grid gutter="xs" key={index}>
          <Grid.Col span="auto">
            <Stack gap={0} mt="xs">
              <Group grow>
                <Text fw={700} m={0}>
                  {job.position} at {job.organization}
                </Text>
                <Text m={0} c="dimmed" ta="end">
                  {format(job.started_at, "MMM yyyy")} -{" "}
                  {job.ended_at ? format(job.ended_at, "MMM yyyy") : "Current"}
                </Text>
              </Group>
              <Text size="sm">{job.location}</Text>
              <List ml="md">
                {job.roles.map((role, index) => (
                  <List.Item key={index}>{role}</List.Item>
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
                  .from("jobs")
                  .delete()
                  .eq("id", job.id)
                  .then(() => {
                    setJobs(jobs.filter((j) => j.id !== job.id));
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
};
